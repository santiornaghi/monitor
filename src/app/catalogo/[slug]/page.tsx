import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Cabecera, MenuCelular, Pie } from "@/components/sitio/Cabecera";
import { EQUIPOS, PRODUCTOS, buscarProducto } from "@/lib/catalogo";
import { GRUPO, enlaceWhatsApp } from "@/lib/marca";
import "../../sitio.css";

export function generateStaticParams() {
  return EQUIPOS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = buscarProducto((await params).slug);
  if (!p) return {};
  return {
    title: { absolute: `${p.marca} ${p.nombre} | ${GRUPO}` },
    description: p.descripcion || `${p.nombre} de ${p.marca}, ${p.subcategoria || p.categoria}. Pedí tu cotización.`,
    openGraph: p.imagen ? { images: [p.imagen] } : undefined,
  };
}

function Lista({ titulo, items }: { titulo: string; items?: string[] }) {
  if (!items?.length) return null;
  return (<><h2>{titulo}</h2><ul>{items.map((i) => <li key={i}>{i}</li>)}</ul></>);
}

export default async function Ficha({ params }: { params: Promise<{ slug: string }> }) {
  const p = buscarProducto((await params).slug);
  if (!p || p.tipo !== "equipo") notFound();
  const pedido = `${p.marca} ${p.nombre}${p.codigo && p.codigo !== p.nombre ? ` (${p.codigo})` : ""}`;
  const wa = enlaceWhatsApp(`Hola, quiero cotizar el ${pedido}.`);
  const relacionados = PRODUCTOS.filter((x) => x.tipo === "equipo" && x.slug !== p.slug && x.categoria === p.categoria).slice(0, 4);

  return (
    <div className="lp">
      <Cabecera actual="catalogo" />
      <MenuCelular />
      <main className="lp-ancho">
        <p className="lp-ruta"><a href="/catalogo">Equipamiento</a> / <a href={`/catalogo?marca=${encodeURIComponent(p.marca)}`}>{p.marca}</a> / {p.categoria}</p>
        <div className="lp-ficha">
          <div className="foto">
            {p.imagen ? <img src={p.imagen} alt={`${p.marca} ${p.nombre}`} /> : <span style={{ font: "700 22px var(--lp-titulo)", color: "#9fb2b8", textAlign: "center" }}>{p.marca}<br />{p.nombre}</span>}
          </div>
          <div>
            <span className="m">{p.marca}</span>
            <h1>{p.nombre}</h1>
            {p.descripcion && <p className="lp-bajada" style={{ marginBottom: 18 }}>{p.descripcion}</p>}
            <dl className="lp-datos">
              <dt>Categoría</dt><dd>{p.categoria}{p.subcategoria ? `, ${p.subcategoria}` : ""}</dd>
              {p.codigo && p.codigo !== p.nombre && <><dt>Código</dt><dd>{p.codigo}</dd></>}
              {p.fabricante && p.fabricante !== p.marca && <><dt>Fabricante</dt><dd>{p.fabricante}</dd></>}
            </dl>
            <div className="lp-ctas" style={{ marginTop: 24 }}>
              <a className="lp-boton lleno" href={`/contacto?producto=${encodeURIComponent(pedido)}`}>Pedir cotización</a>
              {wa && <a className="lp-boton" href={wa}>Consultar por WhatsApp</a>}
            </div>
            <Lista titulo="Características" items={p.caracteristicas} />
            <Lista titulo="Beneficios" items={p.beneficios} />
            <Lista titulo="Aplicaciones" items={p.aplicaciones} />
          </div>
        </div>
        {relacionados.length > 0 && (
          <section style={{ paddingBottom: 72 }}>
            <h2 className="lp-h2" style={{ fontSize: 26 }}>Otros equipos de {p.categoria.toLowerCase()}</h2>
            <div className="lp-grilla" style={{ marginTop: 16 }}>
              {relacionados.map((r) => (
                <a className="lp-prod" key={r.slug} href={`/catalogo/${r.slug}`}>
                  <div className="foto">{r.imagen ? <img src={r.imagen} alt={`${r.marca} ${r.nombre}`} loading="lazy" /> : <span className="sin">{r.marca}<br />{r.nombre}</span>}</div>
                  <span className="m">{r.marca}</span><span className="n">{r.nombre}</span>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>
      <Pie />
    </div>
  );
}
