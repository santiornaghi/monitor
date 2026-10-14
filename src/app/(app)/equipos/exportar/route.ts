import { contexto, nombreOrg } from "@/lib/contexto";
import { ESTADOS, estadoPreventivo, fecha } from "@/lib/formato";
import { uno } from "@/lib/eventos";

// CSV pensado para Excel en español: separador punto y coma y BOM para que respete los acentos.
const celda = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET() {
  const { supabase, orgIds, orgs } = await contexto();
  const { data } = await supabase
    .from("equipos")
    .select("org_id,tipo,marca,modelo,serial,nro_inventario,umdns,sede,servicio,estado,fecha_alta,garantia_hasta,horas_uso,proveedores(nombre),planes_preventivo(proxima,ultima,frecuencia_dias)")
    .in("org_id", orgIds)
    .order("tipo");
  const filas = [
    ["Institución", "Tipo", "Marca", "Modelo", "Serial", "N.º inventario", "UMDNS", "Sede", "Servicio", "Estado", "Alta", "Garantía hasta", "Horas de uso", "Proveedor", "Frecuencia preventivo (días)", "Último preventivo", "Próximo preventivo", "Situación preventivo"],
    ...(data ?? []).map((e: any) => {
      const p = uno<any>(e.planes_preventivo), pv = uno<any>(e.proveedores);
      return [
        nombreOrg(orgs, e.org_id), e.tipo, e.marca, e.modelo, e.serial, e.nro_inventario, e.umdns, e.sede, e.servicio,
        ESTADOS[e.estado]?.label ?? e.estado, fecha(e.fecha_alta), e.garantia_hasta ? fecha(e.garantia_hasta) : "", e.horas_uso ?? "",
        pv?.nombre ?? "", p?.frecuencia_dias ?? "", p?.ultima ? fecha(p.ultima) : "", p ? fecha(p.proxima) : "", p ? estadoPreventivo(p.proxima).label : "",
      ];
    }),
  ];
  const csv = "﻿" + filas.map((f) => f.map(celda).join(";")).join("\r\n");
  const hoy = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inventario-equipos-${hoy}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
