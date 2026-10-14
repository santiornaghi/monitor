-- Monitor: repuestos y stock, preferencias de avisos por email
-- Ejecutar completo en Supabase > SQL Editor, después de 0004_preventivo_horas.sql.

-- ============ Avisos ============
alter table public.miembros add column if not exists recibe_avisos boolean not null default true;

-- ============ Repuestos ============
create table if not exists public.repuestos (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizaciones(id) on delete cascade,
  codigo text,
  descripcion text not null,
  compatible text,
  ubicacion text,
  stock integer not null default 0 check (stock >= 0),
  stock_minimo integer not null default 0 check (stock_minimo >= 0),
  costo_unitario numeric(14,2) not null default 0 check (costo_unitario >= 0),
  proveedor_id uuid references public.proveedores(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (org_id, codigo)
);
create index if not exists repuestos_org on public.repuestos (org_id);

create table if not exists public.ordenes_repuestos (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizaciones(id) on delete cascade,
  orden_id uuid not null references public.ordenes(id) on delete cascade,
  repuesto_id uuid not null references public.repuestos(id) on delete restrict,
  cantidad integer not null check (cantidad > 0),
  costo_unitario numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists ordenes_repuestos_orden on public.ordenes_repuestos (orden_id);

-- Trazabilidad: cada cambio de stock queda registrado
create table if not exists public.movimientos_stock (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizaciones(id) on delete cascade,
  repuesto_id uuid not null references public.repuestos(id) on delete cascade,
  cantidad integer not null,
  motivo text not null,
  orden_id uuid references public.ordenes(id) on delete set null,
  usuario_id uuid references auth.users(id),
  usuario_nombre text,
  fecha timestamptz not null default now()
);
create index if not exists movimientos_repuesto on public.movimientos_stock (repuesto_id, fecha desc);

alter table public.repuestos enable row level security;
alter table public.ordenes_repuestos enable row level security;
alter table public.movimientos_stock enable row level security;

drop policy if exists rep_ver on public.repuestos;
drop policy if exists rep_crear on public.repuestos;
drop policy if exists rep_editar on public.repuestos;
drop policy if exists rep_borrar on public.repuestos;
drop policy if exists orep_ver on public.ordenes_repuestos;
drop policy if exists mov_ver on public.movimientos_stock;

create policy rep_ver on public.repuestos for select using (es_visible(org_id));
-- El alta arranca con stock 0; el stock solo cambia con las funciones de abajo, que dejan registro.
create policy rep_crear on public.repuestos for insert with check (es_editable(org_id) and stock = 0);
create policy rep_editar on public.repuestos for update using (es_editable(org_id)) with check (es_editable(org_id));
create policy rep_borrar on public.repuestos for delete using (es_editable(org_id));
create policy orep_ver on public.ordenes_repuestos for select using (es_visible(org_id));
create policy mov_ver on public.movimientos_stock for select using (es_visible(org_id));

-- Impide cambiar el stock con un update directo: solo por las funciones
create or replace function public.proteger_stock() returns trigger language plpgsql as $$
begin
  if new.stock is distinct from old.stock and coalesce(current_setting('monitor.stock_ok', true), '') <> 'si' then
    raise exception 'El stock se modifica con un ingreso, un ajuste o usando el repuesto en una orden';
  end if;
  return new;
end $$;
drop trigger if exists repuestos_proteger_stock on public.repuestos;
create trigger repuestos_proteger_stock before update on public.repuestos for each row execute function public.proteger_stock();

-- Ingreso (cantidad positiva) o ajuste (negativa) de stock
create or replace function public.mover_stock(p_repuesto uuid, p_cantidad integer, p_motivo text, p_costo numeric, p_usuario text)
returns integer language plpgsql security definer set search_path = public as $$
declare r record; nuevo integer;
begin
  select * into r from repuestos where id = p_repuesto for update;
  if not found or not es_editable(r.org_id) then raise exception 'Sin permiso sobre este repuesto'; end if;
  if coalesce(p_cantidad, 0) = 0 then raise exception 'Indicá una cantidad distinta de cero'; end if;
  nuevo := r.stock + p_cantidad;
  if nuevo < 0 then raise exception 'El stock no puede quedar negativo (hay %)', r.stock; end if;
  perform set_config('monitor.stock_ok', 'si', true);
  update repuestos set stock = nuevo, costo_unitario = coalesce(p_costo, costo_unitario) where id = p_repuesto;
  perform set_config('monitor.stock_ok', '', true);
  insert into movimientos_stock (org_id, repuesto_id, cantidad, motivo, usuario_id, usuario_nombre)
  values (r.org_id, r.id, p_cantidad, coalesce(nullif(trim(p_motivo), ''), case when p_cantidad > 0 then 'Ingreso' else 'Ajuste' end), auth.uid(), p_usuario);
  return nuevo;
end $$;

-- Usar un repuesto en una orden abierta: descuenta stock y queda en el historial del equipo
create or replace function public.usar_repuesto(p_orden uuid, p_repuesto uuid, p_cantidad integer, p_usuario text)
returns uuid language plpgsql security definer set search_path = public as $$
declare o record; r record; linea uuid; ot text;
begin
  select * into o from ordenes where id = p_orden;
  if not found or not es_editable(o.org_id) then raise exception 'Sin permiso sobre esta orden'; end if;
  if o.estado = 'Cerrada' then raise exception 'La orden ya está cerrada'; end if;
  if coalesce(p_cantidad, 0) <= 0 then raise exception 'La cantidad tiene que ser mayor a cero'; end if;
  select * into r from repuestos where id = p_repuesto for update;
  if not found or r.org_id <> o.org_id then raise exception 'El repuesto no pertenece a esta institución'; end if;
  if r.stock < p_cantidad then raise exception 'Stock insuficiente: quedan % de %', r.stock, r.descripcion; end if;
  ot := 'OT-' || lpad(o.numero::text, 4, '0');
  perform set_config('monitor.stock_ok', 'si', true);
  update repuestos set stock = stock - p_cantidad where id = r.id;
  perform set_config('monitor.stock_ok', '', true);
  insert into ordenes_repuestos (org_id, orden_id, repuesto_id, cantidad, costo_unitario)
  values (o.org_id, o.id, r.id, p_cantidad, r.costo_unitario) returning id into linea;
  insert into movimientos_stock (org_id, repuesto_id, cantidad, motivo, orden_id, usuario_id, usuario_nombre)
  values (o.org_id, r.id, -p_cantidad, 'Usado en ' || ot, o.id, auth.uid(), p_usuario);
  insert into eventos (org_id, equipo_id, tipo, texto, usuario_id, usuario_nombre)
  values (o.org_id, o.equipo_id, 'Repuesto', ot || ': ' || p_cantidad || ' × ' || r.descripcion || coalesce(' (' || r.codigo || ')', ''), auth.uid(), p_usuario);
  return linea;
end $$;

-- Quitar un repuesto cargado por error en una orden abierta: devuelve el stock
create or replace function public.devolver_repuesto(p_linea uuid, p_usuario text)
returns void language plpgsql security definer set search_path = public as $$
declare l record; o record; r record; ot text;
begin
  select * into l from ordenes_repuestos where id = p_linea;
  if not found then raise exception 'La línea no existe'; end if;
  select * into o from ordenes where id = l.orden_id;
  if not es_editable(o.org_id) then raise exception 'Sin permiso sobre esta orden'; end if;
  if o.estado = 'Cerrada' then raise exception 'La orden ya está cerrada'; end if;
  select * into r from repuestos where id = l.repuesto_id for update;
  ot := 'OT-' || lpad(o.numero::text, 4, '0');
  perform set_config('monitor.stock_ok', 'si', true);
  update repuestos set stock = stock + l.cantidad where id = r.id;
  perform set_config('monitor.stock_ok', '', true);
  delete from ordenes_repuestos where id = l.id;
  insert into movimientos_stock (org_id, repuesto_id, cantidad, motivo, orden_id, usuario_id, usuario_nombre)
  values (o.org_id, r.id, l.cantidad, 'Devuelto de ' || ot, o.id, auth.uid(), p_usuario);
  insert into eventos (org_id, equipo_id, tipo, texto, usuario_id, usuario_nombre)
  values (o.org_id, o.equipo_id, 'Repuesto', ot || ': se quitó ' || l.cantidad || ' × ' || r.descripcion || ' (devuelto al stock)', auth.uid(), p_usuario);
end $$;

grant execute on function public.mover_stock(uuid, integer, text, numeric, text) to authenticated;
grant execute on function public.usar_repuesto(uuid, uuid, integer, text) to authenticated;
grant execute on function public.devolver_repuesto(uuid, text) to authenticated;
