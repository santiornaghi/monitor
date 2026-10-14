-- Monitor: preventivo por horas de uso
-- Ejecutar completo en Supabase > SQL Editor, después de 0003_documentos.sql.
-- Un plan puede tener frecuencia en días, en horas, o ambas: vence lo que ocurra primero.

alter table public.planes_preventivo add column if not exists frecuencia_horas integer;
alter table public.planes_preventivo add column if not exists proximas_horas integer;
alter table public.planes_preventivo add column if not exists ultimas_horas integer;

alter table public.planes_preventivo drop constraint if exists planes_frecuencia_horas_positiva;
alter table public.planes_preventivo add constraint planes_frecuencia_horas_positiva check (frecuencia_horas is null or frecuencia_horas > 0);

-- Cantidad de preventivos vencidos (por fecha o por horas) en las organizaciones indicadas.
-- Se ejecuta con los permisos de quien consulta, así que respeta las reglas de acceso.
create or replace function public.preventivos_vencidos(p_orgs uuid[], p_hoy date)
returns integer language sql stable as $$
  select count(*)::int
  from planes_preventivo p join equipos e on e.id = p.equipo_id
  where p.org_id = any(p_orgs) and e.estado <> 'baja'
    and (p.proxima < p_hoy or (p.proximas_horas is not null and e.horas_uso is not null and e.horas_uso >= p.proximas_horas));
$$;

grant execute on function public.preventivos_vencidos(uuid[], date) to authenticated;
