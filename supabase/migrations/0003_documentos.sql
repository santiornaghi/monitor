-- Monitor: documentos (manuales, certificados, fotos)
-- Ejecutar completo en Supabase > SQL Editor, después de 0002_invitaciones.sql.
-- Un documento se asocia a un equipo puntual o a todos los equipos de una marca y modelo.
-- Los marcados como públicos (por defecto, el manual de usuario) se ven desde el QR sin iniciar sesión.

create table if not exists public.documentos (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizaciones(id) on delete cascade,
  equipo_id uuid references public.equipos(id) on delete cascade,
  marca text,
  modelo text,
  tipo text not null check (tipo in ('manual_usuario','manual_servicio','certificado','foto','otro')),
  nombre text not null,
  path text unique,
  url text,
  publico boolean not null default false,
  vence date,
  subido_por uuid references auth.users(id),
  subido_por_nombre text,
  created_at timestamptz not null default now(),
  constraint documentos_origen check (path is not null or url is not null),
  constraint documentos_alcance check (equipo_id is not null or (marca is not null and modelo is not null))
);
create index if not exists documentos_equipo on public.documentos (equipo_id);
create index if not exists documentos_modelo on public.documentos (org_id, lower(marca), lower(modelo));

alter table public.documentos enable row level security;
drop policy if exists doc_ver on public.documentos;
drop policy if exists doc_editar on public.documentos;
create policy doc_ver on public.documentos for select using (es_visible(org_id));
create policy doc_editar on public.documentos for all using (es_editable(org_id)) with check (es_editable(org_id));

-- ¿Este archivo del almacenamiento pertenece a un documento público?
create or replace function public.doc_publico(p_path text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from documentos where path = p_path and publico);
$$;

-- Documentos públicos de un equipo, a partir del token de su QR
create or replace function public.qr_documentos(p_token text)
returns table (nombre text, tipo text, path text, url text)
language sql stable security definer set search_path = public as $$
  select d.nombre, d.tipo, d.path, d.url
  from equipos e
  join documentos d on d.org_id = e.org_id and d.publico
   and (d.equipo_id = e.id
        or (d.equipo_id is null and lower(d.marca) = lower(e.marca) and lower(d.modelo) = lower(e.modelo)))
  where e.qr_token = p_token and e.estado <> 'baja'
  order by case d.tipo when 'manual_usuario' then 0 else 1 end, d.created_at;
$$;

grant execute on function public.doc_publico(text) to anon, authenticated;
grant execute on function public.qr_documentos(text) to anon, authenticated;

-- ============ Almacenamiento ============
-- Bucket privado: los archivos se sirven con enlaces firmados que vencen.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documentos', 'documentos', false, 52428800,
        array['application/pdf','image/jpeg','image/png','image/webp','image/heic'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Los archivos se guardan como <org_id>/<nombre>; la primera carpeta define la organización.
create or replace function public.org_de_ruta(p_name text)
returns uuid language plpgsql immutable as $$
begin
  return split_part(p_name, '/', 1)::uuid;
exception when others then
  return null;
end $$;

drop policy if exists "documentos ver" on storage.objects;
drop policy if exists "documentos subir" on storage.objects;
drop policy if exists "documentos borrar" on storage.objects;

create policy "documentos ver" on storage.objects for select
  using (bucket_id = 'documentos' and (public.es_visible(public.org_de_ruta(name)) or public.doc_publico(name)));
create policy "documentos subir" on storage.objects for insert
  with check (bucket_id = 'documentos' and public.es_editable(public.org_de_ruta(name)));
create policy "documentos borrar" on storage.objects for delete
  using (bucket_id = 'documentos' and public.es_editable(public.org_de_ruta(name)));
