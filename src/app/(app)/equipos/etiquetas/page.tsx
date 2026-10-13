import { contexto } from "@/lib/contexto";
import { svgQR } from "@/lib/qr";
import { Imprimir } from "@/components/Imprimir";

export const metadata = { title: "Etiquetas QR" };

export default async function Etiquetas({ searchParams }: { searchParams: Promise<{ ids?: string; servicio?: string }> }) {
  const sp = await searchParams;
  const { supabase, orgIds } = await contexto();
  let q = supabase.from("equipos").select("id,tipo,marca,modelo,serial,servicio,nro_inventario,qr_token").in("org_id", orgIds).neq("estado", "baja").order("servicio");
  if (sp.ids) q = q.in("id", sp.ids.split(","));
  if (sp.servicio) q = q.eq("servicio", sp.servicio);
  const { data } = await q.limit(300);
  const E = data ?? [];
  const svgs = await Promise.all(E.map((e) => svgQR(e.qr_token)));
  return (
    <>
      <div className="top no-print">
        <h1>Etiquetas QR</h1><span className="sp" />
        <Imprimir />
      </div>
      <p className="muted no-print">{E.length} etiquetas. Imprimí en papel autoadhesivo y pegá cada una en su equipo; al escanearla se abre la ficha o el reporte de falla.</p>
      <div className="etiquetas">
        {E.map((e, i) => (
          <div className="etiqueta" key={e.id}>
            <div dangerouslySetInnerHTML={{ __html: svgs[i] }} />
            <strong style={{ fontSize: 12.5 }}>{e.tipo}</strong>
            <span style={{ fontSize: 12 }}>{e.marca} {e.modelo}</span>
            <span className="mono">S/N {e.serial}{e.nro_inventario ? ` · ${e.nro_inventario}` : ""}</span>
            <span style={{ fontSize: 11 }}>Escaneá para reportar una falla</span>
          </div>
        ))}
      </div>
    </>
  );
}
