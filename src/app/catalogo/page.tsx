import type { Metadata } from "next";
import { Cabecera, Pie } from "@/components/sitio/Cabecera";
import { AREAS, EQUIPOS, MARCAS, REACTIVOS, areaDe, filtrar } from "@/lib/catalogo";
import { GRUPO } from "@/lib/marca";
import "../sitio.css";

export const metadata: Metadata = {
  title: { absolute: `Equipamiento médico y de laboratorio | ${GRUPO}` },
  description: "Ventiladores, monitores, bombas de infusión, desfibriladores, analizadores de química clínica, hematología y estufas. Pedí tu cotización.",
};

type SP = { q?: string; marca?: string; area?: string; ver?: string };

export default async function Catalogo({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const reactivos = sp.ver === "reactivos";
  const base = reactivos ? REACTIVOS : EQUIPOS;
  let lista = filtrar(base, sp.q);
  if (!reactivos && sp.marca) lista = lista.filter((p) => p.marca === sp.marca);
  if (!reactivos && sp.area) lista = lista.filter((p) => areaDe(p.categoria) === sp.area);
  const url = (cambios: Partial<SP>) => {
    const p = new URLSearchParams();
    const todo = { ...sp, ...cambios };
    Object.entries(todo).forEach(([k, v]) => { if (v) p.set(k, v); });
    const s = p.toString();
    return `/catalogo${s ? `?${s}` : ""}`;
  };
  const areas = [...AREAS.map((a) => a.nombre), "Otros equipos"].filter((a) => EQUIPOS.some((p) => areaDe(p.categoria) === a));

  return (
    <div className="lp">
      <Cabecera actual="catalogo" />
      <main>
        <section className="lp-cab-pagina">
          <div className="lp-ancho">
            <span className="lp-chip">{reactivos ? "Laboratorio" : "Catálogo"}</span>
            <h1 className="lp-h1">{reactivos ? "Reactivos e insumos" : "Equipamiento médico y de laboratorio"}</h1>
            <p className="lp-bajada">
              {reactivos
                ? "Reactivos, controles y calibradores. Consultá disponibilidad y presentación."
                : "Elegí el equipo y pedí la cotización. Consultá también por instalación, capacitación y plan de mantenimiento."}
            </p>
          </div>
        </section>
        <div className="lp-ancho">
        <div className="lp-cat">
          <aside className="lp-filtros" aria-label="Filtros">
            <div>
              <h2>Ver</h2>
              <ul>
                <li><a href="/catalogo" aria-current={!reactivos}>Equipos <span>{EQUIPOS.length}</span></a></li>
                <li><a href="/catalogo?ver=reactivos" aria-current={reactivos}>Reactivos e insumos <span>{REACTIVOS.length}</span></a></li>
              </ul>
            </div>
            {!reactivos && (
              <>
                <div>
                  <h2>Área</h2>
                  <ul>
                    <li><a href={url({ area: undefined })} aria-current={!sp.area}>Todas</a></li>
                    {areas.map((a) => (
                      <li key={a}><a href={url({ area: a })} aria-current={sp.area === a}>{a} <span>{EQUIPOS.filter((p) => areaDe(p.categoria) === a).length}</span></a></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2>Marca</h2>
                  <ul>
                    <li><a href={url({ marca: undefined })} aria-current={!sp.marca}>Todas</a></li>
                    {MARCAS.map((m) => (
                      <li key={m}><a href={url({ marca: m })} aria-current={sp.marca === m}>{m} <span>{EQUIPOS.filter((p) => p.marca === m).length}</span></a></li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </aside>
          <div style={{ minWidth: 0 }}>
            <form className="lp-buscar" action="/catalogo">
              {reactivos && <input type="hidden" name="ver" value="reactivos" />}
              {sp.marca && <input type="hidden" name="marca" value={sp.marca} />}
              {sp.area && <input type="hidden" name="area" value={sp.area} />}
              <input id="q" name="q" type="search" defaultValue={sp.q} placeholder={reactivos ? "Buscar por nombre o código" : "Buscar: ventilador, hematología, CM 250…"} aria-label="Buscar en el catálogo" />
              <button className="lp-boton">Buscar</button>
            </form>
            <p className="lp-resultado">{lista.length} {reactivos ? "productos" : lista.length === 1 ? "equipo" : "equipos"}{sp.q ? ` para “${sp.q}”` : ""}</p>
            {reactivos ? (
              <div className="lp-scroll">
                <table className="lp-tabla-reactivos">
                  <thead><tr><th>Código</th><th>Producto</th><th>Categoría</th><th>Presentación</th><th></th></tr></thead>
                  <tbody>
                    {lista.map((p) => (
                      <tr key={p.slug}>
                        <td style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 13 }}>{p.codigo}</td>
                        <td><strong>{p.nombre}</strong>{p.descripcion && <div style={{ color: "var(--lp-gris)", fontSize: 14 }}>{p.descripcion}</div>}</td>
                        <td>{p.categoria}</td>
                        <td>{[p.unidades, p.testKit && `Kit ${p.testKit} tests`, p.rango && `Rango ${p.rango}`].filter(Boolean).join(". ") || "Consultar"}</td>
                        <td><a href={`/contacto?producto=${encodeURIComponent(`${p.codigo} ${p.nombre}`)}`}>Cotizar</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="lp-grilla">
                {lista.map((p) => (
                  <a className="lp-prod" key={p.slug} href={`/catalogo/${p.slug}`}>
                    <div className="foto">
                      {p.imagen ? <img src={p.imagen} alt={`${p.marca} ${p.nombre}`} loading="lazy" /> : <span className="sin">{p.marca}<br />{p.nombre}</span>}
                    </div>
                    <span className="m">{p.marca}</span>
                    <span className="n">{p.nombre}</span>
                    <span className="c">{p.subcategoria || p.categoria}</span>
                  </a>
                ))}
              </div>
            )}
            {lista.length === 0 && <p>No encontramos productos con ese filtro. <a href="/contacto">Contanos qué buscás</a> y lo conseguimos.</p>}
          </div>
        </div>
        </div>
      </main>
      <Pie actual="catalogo" />
    </div>
  );
}
