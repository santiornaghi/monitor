import type { Metadata } from "next";
import { Cabecera, MenuCelular, Pie } from "@/components/sitio/Cabecera";
import { GRUPO, MARCA, TURNERO, enlaceWhatsApp } from "@/lib/marca";
import { enviarConsulta } from "./actions";
import "../sitio.css";

export const metadata: Metadata = { title: { absolute: `Contacto y cotizaciones | ${GRUPO}` } };

export default async function Contacto({ searchParams }: { searchParams: Promise<{ producto?: string; interes?: string; ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const interes = sp.interes ?? (sp.producto ? "Equipamiento" : "");
  const wa = enlaceWhatsApp(sp.producto ? `Hola, quiero cotizar ${sp.producto}.` : "Hola, quiero hacer una consulta.");
  return (
    <div className="lp">
      <Cabecera actual="contacto" />
      <MenuCelular />
      <main className="lp-ancho" style={{ paddingBlock: "24px 80px" }}>
        <h1 className="lp-h1" style={{ fontSize: "clamp(32px, 4.4vw, 48px)", margin: "16px 0 10px" }}>Contanos qué necesitás.</h1>
        <p className="lp-bajada">Te respondemos con una propuesta concreta para lo que necesitás.</p>
        {sp.ok ? (
          <div className="lp-ok"><strong>Recibimos tu consulta.</strong> Te respondemos a la brevedad por el medio que nos dejaste.</div>
        ) : (
          <form className="lp-form" action={enviarConsulta}>
            {sp.error && <div className="lp-err full">{sp.error}</div>}
            <label>Nombre y apellido<input id="nombre" name="nombre" required autoComplete="name" /></label>
            <label>Institución<input id="institucion" name="institucion" autoComplete="organization" placeholder="Clínica, sanatorio, laboratorio" /></label>
            <label>Email<input id="email" name="email" type="email" autoComplete="email" /></label>
            <label>Teléfono<input id="telefono" name="telefono" type="tel" autoComplete="tel" /></label>
            <label>Ciudad<input id="ciudad" name="ciudad" autoComplete="address-level2" /></label>
            <label>Me interesa
              <select id="interes" name="interes" defaultValue={interes}>
                <option value="">Elegí una opción</option>
                <option>Equipamiento</option>
                <option>Reactivos e insumos</option>
                <option value={MARCA}>{MARCA} (mantenimiento de equipos)</option>
                <option value={TURNERO}>{TURNERO} (gestión de turnos)</option>
              </select>
            </label>
            {sp.producto && <label className="full">Producto<input id="producto" name="producto" defaultValue={sp.producto} /></label>}
            <label className="full">Mensaje<textarea id="mensaje" name="mensaje" rows={5} placeholder="Cantidad, plazos, si es reemplazo de un equipo existente…" /></label>
            <label className="lp-oculto" aria-hidden="true">No completar<input name="sitio_web" tabIndex={-1} autoComplete="off" /></label>
            <div className="full lp-ctas">
              <button className="lp-boton lleno">Enviar consulta</button>
              {wa && <a className="lp-boton" href={wa}>Escribir por WhatsApp</a>}
            </div>
          </form>
        )}
      </main>
      <Pie />
    </div>
  );
}
