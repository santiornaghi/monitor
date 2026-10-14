-- Monitor: invitaciones de usuarios
-- Ejecutar completo en Supabase > SQL Editor, después de 0001_esquema.sql.

-- Email visible en la lista de usuarios
alter table public.miembros add column if not exists email text;
update public.miembros m set email = u.email from auth.users u where u.id = m.user_id and m.email is null;

create table if not exists public.invitaciones (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizaciones(id) on delete cascade,
  rol text not null default 'tecnico' check (rol in ('admin','tecnico','direccion')),
  token text not null unique default encode(gen_random_bytes(16),'hex'),
  nota text,
  creada_por uuid references auth.users(id),
  creada_en timestamptz not null default now(),
  expira_en timestamptz not null default now() + interval '7 days',
  usada_por uuid references auth.users(id),
  usada_en timestamptz
);
create index if not exists invitaciones_org on public.invitaciones (org_id);

alter table public.invitaciones enable row level security;
drop policy if exists inv_admin on public.invitaciones;
create policy inv_admin on public.invitaciones for all using (es_admin(org_id)) with check (es_admin(org_id));

-- Datos mínimos de una invitación, visibles para quien tiene el enlace
create or replace function public.ver_invitacion(p_token text)
returns table (organizacion text, tipo text, rol text, valida boolean)
language sql stable security definer set search_path = public as $$
  select o.nombre, o.tipo, i.rol, (i.usada_por is null and i.expira_en > now())
  from invitaciones i join organizaciones o on o.id = i.org_id
  where i.token = p_token;
$$;

create or replace function public.aceptar_invitacion(p_token text, p_nombre text)
returns uuid language plpgsql security definer set search_path = public as $$
declare i record;
begin
  if auth.uid() is null then raise exception 'Iniciá sesión para aceptar la invitación'; end if;
  select * into i from invitaciones where token = p_token for update;
  if not found then raise exception 'La invitación no existe'; end if;
  if i.usada_por is not null then
    if i.usada_por = auth.uid() then return i.org_id; end if;
    raise exception 'Esta invitación ya fue usada por otra persona';
  end if;
  if i.expira_en < now() then raise exception 'La invitación venció; pedí una nueva'; end if;
  insert into miembros (org_id, user_id, rol, nombre, email)
  values (i.org_id, auth.uid(), i.rol, nullif(trim(p_nombre),''), (select email from auth.users where id = auth.uid()))
  on conflict (org_id, user_id) do update set rol = excluded.rol, nombre = coalesce(excluded.nombre, miembros.nombre);
  update invitaciones set usada_por = auth.uid(), usada_en = now() where id = i.id;
  return i.org_id;
end $$;

-- El alta de organización guarda también el email del creador
create or replace function public.crear_organizacion(p_nombre text, p_tipo text, p_ciudad text, p_provincia text, p_usuario text)
returns uuid language plpgsql security definer set search_path = public as $$
declare nuevo uuid;
begin
  if auth.uid() is null then raise exception 'Sin sesión'; end if;
  insert into organizaciones (nombre, tipo, ciudad, provincia) values (p_nombre, p_tipo, p_ciudad, p_provincia) returning id into nuevo;
  insert into miembros (org_id, user_id, rol, nombre, email)
  values (nuevo, auth.uid(), 'admin', p_usuario, (select email from auth.users where id = auth.uid()));
  return nuevo;
end $$;

grant execute on function public.ver_invitacion(text) to anon, authenticated;
grant execute on function public.aceptar_invitacion(text, text) to authenticated;
