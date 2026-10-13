-- Monitor: esquema inicial
-- Ejecutar completo en Supabase > SQL Editor (o con `supabase db push`).

create extension if not exists pgcrypto;

-- ============ Tablas ============

create table public.organizaciones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null check (tipo in ('institucion','proveedor')),
  cuit text,
  ciudad text,
  provincia text,
  created_at timestamptz not null default now()
);

create table public.miembros (
  org_id uuid not null references public.organizaciones(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rol text not null default 'tecnico' check (rol in ('admin','tecnico','direccion')),
  nombre text,
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

-- Un proveedor de servicio gestiona el parque de sus instituciones clientes
create table public.accesos (
  proveedor_id uuid not null references public.organizaciones(id) on delete cascade,
  institucion_id uuid not null references public.organizaciones(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (proveedor_id, institucion_id)
);

create table public.proveedores (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizaciones(id) on delete cascade,
  nombre text not null,
  especialidad text,
  localidad text,
  provincia text,
  telefono text,
  email text,
  created_at timestamptz not null default now()
);

create table public.equipos (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizaciones(id) on delete cascade,
  tipo text not null,
  marca text not null default '',
  modelo text not null default '',
  serial text not null,
  nro_inventario text,
  umdns text,
  sede text,
  servicio text not null default 'Sin asignar',
  estado text not null default 'operativo' check (estado in ('operativo','reparacion','fuera','baja')),
  proveedor_id uuid references public.proveedores(id) on delete set null,
  fecha_alta date not null default current_date,
  garantia_hasta date,
  horas_uso integer,
  qr_token text not null unique default encode(gen_random_bytes(9),'hex'),
  created_at timestamptz not null default now(),
  unique (org_id, serial)
);
create index on public.equipos (org_id);

create table public.planes_preventivo (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizaciones(id) on delete cascade,
  equipo_id uuid not null unique references public.equipos(id) on delete cascade,
  frecuencia_dias integer not null check (frecuencia_dias > 0),
  proxima date not null,
  ultima date
);
create index on public.planes_preventivo (org_id, proxima);

create sequence public.ordenes_numero_seq start 1;

create table public.ordenes (
  id uuid primary key default gen_random_uuid(),
  numero integer not null default nextval('public.ordenes_numero_seq'),
  org_id uuid not null references public.organizaciones(id) on delete cascade,
  equipo_id uuid not null references public.equipos(id) on delete cascade,
  tipo text not null default 'Correctivo' check (tipo in ('Correctivo','Preventivo','Calibración','Instalación')),
  prioridad text not null default 'Media' check (prioridad in ('Alta','Media','Baja')),
  estado text not null default 'Abierta' check (estado in ('Abierta','En curso','Esperando repuesto','Cerrada')),
  descripcion text not null,
  reporta text,
  proveedor_id uuid references public.proveedores(id) on delete set null,
  abierta_en timestamptz not null default now(),
  cerrada_en timestamptz,
  trabajo text,
  costo numeric(14,2) not null default 0,
  created_by uuid references auth.users(id)
);
create index on public.ordenes (org_id, estado);

-- Historial inmutable: sin políticas de update ni delete
create table public.eventos (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizaciones(id) on delete cascade,
  equipo_id uuid not null references public.equipos(id) on delete cascade,
  fecha timestamptz not null default now(),
  tipo text not null,
  texto text not null,
  datos jsonb,
  usuario_id uuid references auth.users(id),
  usuario_nombre text
);
create index on public.eventos (equipo_id, fecha desc);

-- ============ Funciones de permisos ============

create or replace function public.es_visible(o uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from miembros m where m.org_id = o and m.user_id = auth.uid())
      or exists (select 1 from accesos a join miembros m on m.org_id = a.proveedor_id
                 where a.institucion_id = o and m.user_id = auth.uid());
$$;

create or replace function public.es_editable(o uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from miembros m where m.org_id = o and m.user_id = auth.uid() and m.rol in ('admin','tecnico'))
      or exists (select 1 from accesos a join miembros m on m.org_id = a.proveedor_id
                 where a.institucion_id = o and m.user_id = auth.uid() and m.rol in ('admin','tecnico'));
$$;

create or replace function public.es_admin(o uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from miembros m where m.org_id = o and m.user_id = auth.uid() and m.rol = 'admin');
$$;

-- ============ RLS ============

alter table public.organizaciones enable row level security;
alter table public.miembros enable row level security;
alter table public.accesos enable row level security;
alter table public.proveedores enable row level security;
alter table public.equipos enable row level security;
alter table public.planes_preventivo enable row level security;
alter table public.ordenes enable row level security;
alter table public.eventos enable row level security;

create policy org_ver on public.organizaciones for select using (es_visible(id));
create policy org_editar on public.organizaciones for update using (es_admin(id));

create policy miembros_ver on public.miembros for select using (user_id = auth.uid() or es_admin(org_id));
create policy miembros_admin on public.miembros for all using (es_admin(org_id)) with check (es_admin(org_id));

create policy accesos_ver on public.accesos for select using (es_visible(proveedor_id) or es_visible(institucion_id));
create policy accesos_borrar on public.accesos for delete using (es_admin(proveedor_id) or es_admin(institucion_id));

create policy prov_ver on public.proveedores for select using (es_visible(org_id));
create policy prov_editar on public.proveedores for all using (es_editable(org_id)) with check (es_editable(org_id));

create policy eq_ver on public.equipos for select using (es_visible(org_id));
create policy eq_editar on public.equipos for all using (es_editable(org_id)) with check (es_editable(org_id));

create policy plan_ver on public.planes_preventivo for select using (es_visible(org_id));
create policy plan_editar on public.planes_preventivo for all using (es_editable(org_id)) with check (es_editable(org_id));

create policy ot_ver on public.ordenes for select using (es_visible(org_id));
create policy ot_editar on public.ordenes for all using (es_editable(org_id)) with check (es_editable(org_id));

create policy ev_ver on public.eventos for select using (es_visible(org_id));
create policy ev_insertar on public.eventos for insert with check (es_editable(org_id));

-- ============ Alta de organizaciones ============

create or replace function public.crear_organizacion(p_nombre text, p_tipo text, p_ciudad text, p_provincia text, p_usuario text)
returns uuid language plpgsql security definer set search_path = public as $$
declare nuevo uuid;
begin
  if auth.uid() is null then raise exception 'Sin sesión'; end if;
  insert into organizaciones (nombre, tipo, ciudad, provincia) values (p_nombre, p_tipo, p_ciudad, p_provincia) returning id into nuevo;
  insert into miembros (org_id, user_id, rol, nombre) values (nuevo, auth.uid(), 'admin', p_usuario);
  return nuevo;
end $$;

-- Un proveedor da de alta una institución cliente que gestiona
create or replace function public.crear_cliente(p_proveedor uuid, p_nombre text, p_ciudad text, p_provincia text)
returns uuid language plpgsql security definer set search_path = public as $$
declare nuevo uuid;
begin
  if not es_admin(p_proveedor) then raise exception 'Solo un administrador del proveedor puede crear clientes'; end if;
  if (select tipo from organizaciones where id = p_proveedor) <> 'proveedor' then raise exception 'La organización no es un proveedor'; end if;
  insert into organizaciones (nombre, tipo, ciudad, provincia) values (p_nombre, 'institucion', p_ciudad, p_provincia) returning id into nuevo;
  insert into accesos (proveedor_id, institucion_id) values (p_proveedor, nuevo);
  return nuevo;
end $$;

-- ============ QR público (sin login) ============

create or replace function public.qr_equipo(p_token text)
returns table (tipo text, marca text, modelo text, servicio text, institucion text, estado text)
language sql stable security definer set search_path = public as $$
  select e.tipo, e.marca, e.modelo, e.servicio, o.nombre, e.estado
  from equipos e join organizaciones o on o.id = e.org_id
  where e.qr_token = p_token and e.estado <> 'baja';
$$;

create or replace function public.qr_reportar(p_token text, p_descripcion text, p_reporta text)
returns integer language plpgsql security definer set search_path = public as $$
declare e record; n integer;
begin
  if length(coalesce(trim(p_descripcion),'')) < 5 then raise exception 'Describí la falla'; end if;
  if length(p_descripcion) > 1000 or length(coalesce(p_reporta,'')) > 120 then raise exception 'Texto demasiado largo'; end if;
  select * into e from equipos where qr_token = p_token and estado <> 'baja';
  if not found then raise exception 'Equipo no encontrado'; end if;
  -- Freno simple contra abuso: máximo 3 reportes por equipo por hora
  if (select count(*) from ordenes where equipo_id = e.id and abierta_en > now() - interval '1 hour' and created_by is null) >= 3 then
    raise exception 'Ya se reportó este equipo recientemente';
  end if;
  insert into ordenes (org_id, equipo_id, descripcion, reporta, proveedor_id)
  values (e.org_id, e.id, trim(p_descripcion), nullif(trim(p_reporta),''), e.proveedor_id) returning numero into n;
  insert into eventos (org_id, equipo_id, tipo, texto, usuario_nombre)
  values (e.org_id, e.id, 'OT', 'OT-' || lpad(n::text,4,'0') || ' abierta desde QR: ' || trim(p_descripcion), coalesce(nullif(trim(p_reporta),''),'Reporte anónimo por QR'));
  return n;
end $$;

grant execute on function public.qr_equipo(text) to anon, authenticated;
grant execute on function public.qr_reportar(text, text, text) to anon, authenticated;

-- ============ Datos de ejemplo ============
-- Carga un parque de prueba en la institución indicada (quien pueda editarla).

create or replace function public.cargar_ejemplo(p_org uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  pv1 uuid; pv2 uuid; pv3 uuid; eq uuid; i integer := 0; r record; uname text;
begin
  if not es_editable(p_org) then raise exception 'Sin permiso sobre esta institución'; end if;
  select coalesce(max(nombre),'Carga inicial') into uname from miembros where user_id = auth.uid();
  insert into proveedores (org_id, nombre, especialidad, localidad, provincia, telefono) values
    (p_org,'Servicio Técnico Biomédico Centro','Respiradores, monitores','Río Cuarto','Córdoba','0358 462-1180') returning id into pv1;
  insert into proveedores (org_id, nombre, especialidad, localidad, provincia, telefono) values
    (p_org,'Electromedicina Córdoba','Desfibriladores, bombas','Córdoba','Córdoba','0351 471-3302') returning id into pv2;
  insert into proveedores (org_id, nombre, especialidad, localidad, provincia, telefono) values
    (p_org,'Lab Service Argentina','Analizadores bioquímicos','Rosario','Santa Fe','0341 448-9021') returning id into pv3;

  for r in select * from (values
    ('Respirador','Dräger','Savina 300','EJ-ASCF-0412','UTI','operativo',1,1820,180,-12),
    ('Respirador','Mindray','SV300','EJ-SV3-0877','UTI','reparacion',1,6410,180,25),
    ('Respirador','Hamilton','C1','EJ-HC1-5531','Guardia','operativo',1,980,180,140),
    ('Monitor multiparamétrico','Philips','IntelliVue MX450','EJ-DE73-1129','UTI','operativo',1,null,365,-3),
    ('Monitor multiparamétrico','Mindray','ePM 10','EJ-EP10-8821','Guardia','operativo',1,null,365,60),
    ('Desfibrilador','Zoll','R Series','EJ-AF14-0332','Guardia','operativo',2,null,180,9),
    ('Bomba de infusión','Baxter','Sigma Spectrum','EJ-SS-10933','Internación','fuera',2,null,365,-40),
    ('Bomba de infusión','B. Braun','Infusomat Space','EJ-IS-22871','UTI','operativo',2,null,365,95),
    ('Analizador bioquímico','Mindray','BS-240','EJ-BS2-2219','Laboratorio','operativo',3,3150,90,18)
  ) as t(tipo,marca,modelo,serial,servicio,estado,pv,horas,frec,offs)
  loop
    i := i + 1;
    insert into equipos (org_id, tipo, marca, modelo, serial, nro_inventario, servicio, estado, proveedor_id, horas_uso, fecha_alta)
    values (p_org, r.tipo, r.marca, r.modelo, r.serial, 'INV-' || (1040 + i), r.servicio, r.estado,
            case r.pv when 1 then pv1 when 2 then pv2 else pv3 end, r.horas, current_date - (365 * 2 + i * 17))
    returning id into eq;
    insert into planes_preventivo (org_id, equipo_id, frecuencia_dias, proxima, ultima)
    values (p_org, eq, r.frec, current_date + r.offs, current_date + r.offs - r.frec);
    insert into eventos (org_id, equipo_id, tipo, texto, usuario_id, usuario_nombre)
    values (p_org, eq, 'Alta', 'Alta en inventario (datos de ejemplo) — ' || r.servicio, auth.uid(), uname);
    if r.estado = 'reparacion' then
      insert into ordenes (org_id, equipo_id, prioridad, estado, descripcion, reporta, proveedor_id, created_by)
      values (p_org, eq, 'Alta', 'En curso', 'Alarma de presión alta intermitente con circuito nuevo', 'Enfermería UTI', pv1, auth.uid());
      insert into eventos (org_id, equipo_id, tipo, texto, usuario_id, usuario_nombre)
      values (p_org, eq, 'OT', 'OT abierta: alarma de presión alta intermitente', auth.uid(), uname);
    elsif r.estado = 'fuera' then
      insert into ordenes (org_id, equipo_id, prioridad, estado, descripcion, reporta, proveedor_id, created_by)
      values (p_org, eq, 'Media', 'Esperando repuesto', 'No detecta cierre de puerta; error E-21', 'Enfermería Internación', pv2, auth.uid());
      insert into eventos (org_id, equipo_id, tipo, texto, usuario_id, usuario_nombre)
      values (p_org, eq, 'OT', 'OT abierta: no detecta cierre de puerta', auth.uid(), uname);
    end if;
  end loop;
end $$;

grant execute on function public.crear_organizacion(text,text,text,text,text) to authenticated;
grant execute on function public.crear_cliente(uuid,text,text,text) to authenticated;
grant execute on function public.cargar_ejemplo(uuid) to authenticated;

grant usage, select on sequence public.ordenes_numero_seq to authenticated;
