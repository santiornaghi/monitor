import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Cabecera, Pie } from "@/components/sitio/Cabecera";
import { Cabeza, Chip, Preguntas } from "@/components/sitio/Bloques";
import { EQUIPOS, PRODUCTOS, buscarProducto } from "@/lib/catalogo";
import { GRUPO, enlaceWhatsApp } from "@/lib/marca";
import { videosDe } from "@/lib/videos";
import { MODELOS, ampliado } from "@/data/tecme";
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
    openGraph: { siteName: "NAYA LAB", locale: "es_AR", images: [p.imagen || "/og.png"] },
  };
}

function Lista({ titulo, items }: { titulo: string; items?: string[] }) {
  if (!items?.length) return null;
  return (<div><h3>{titulo}</h3><ul>{items.map((i) => <li key={i}>{i}</li>)}</ul></div>);
}

export default async function Ficha({ params }: { params: Promise<{ slug: string }> }) {
  const p = buscarProducto((await params).slug);
  if (!p || p.tipo !== "equipo") notFound();
  const extra = ampliado(p.slug);
  const fam = extra?.familia;
  const pedido = `${p.marca} ${p.nombre}${p.codigo && p.codigo !== p.nombre ? ` (${p.codigo})` : ""}`;
  const wa = enlaceWhatsApp(`Hola, quiero cotizar el ${pedido}.`);
  const videos = videosDe(p);
  const hermanos = fam ? PRODUCTOS.filter((x) => MODELOS[x.slug]?.familia === fam.id) : [];
  const relacionados = PRODUCTOS.filter((x) => x.tipo === "equipo" && x.slug !== p.slug && x.categoria === p.categoria && !hermanos.includes(x)).slice(0, 4);
  const hayListas = Boolean(p.caracteristicas?.length || p.beneficios?.length || p.aplicaciones?.length);

  return (
    <div className="lp">
      <Cabecera actual="catalogo" />
      <main>
        <section className="lp-hero lp-ficha-hero">
          <div className="lp-ancho">
            <div className="lp-hero-texto">
              <p className="lp-ruta"><a href="/catalogo">Equipos</a> / <a href={`/catalogo?marca=${encodeURIComponent(p.marca)}`}>{p.marca}</a> / {p.categoria}</p>
              <Chip>{fam?.etiqueta ?? (p.subcategoria || p.categoria)}</Chip>
              <p className="lp-ficha-marca">{p.marca}</p>
              <h1 className="lp-h1">{p.nombre}</h1>
              <p className="lp-bajada" style={{ marginBottom: 20 }}>{p.descripcion || fam?.bajada}</p>
              {extra?.nota && <p className="lp-nota-modelo">{extra.nota}</p>}
              {p.codigo && p.codigo !== p.nombre && <dl className="lp-datos"><dt>Código</dt><dd>{p.codigo}</dd></dl>}
              <div className="lp-ctas">
                <a className="lp-boton lleno" href={`/contacto?producto=${encodeURIComponent(pedido)}`}>Pedir cotización</a>
                {wa && <a className="lp-boton verde" href={wa}>Consultar por WhatsApp</a>}
                {videos && (
                  <a className="lp-boton" href={videos} target="_blank" rel="noopener noreferrer">
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
                    Videos del fabricante
                  </a>
                )}
              </div>
            </div>
            <div className="lp-hero-foto">
              {p.imagen ? <img src={p.imagen} alt={`${p.marca} ${p.nombre}`} /> : <span style={{ font: "600 26px var(--titulo)", color: "#8aa0c4", textAlign: "center", alignSelf: "center" }}>{p.marca}<br />{p.nombre}</span>}
            </div>
          </div>
        </section>

        {hermanos.length > 1 && (
          <nav className="lp-pestanas" aria-label="Modelos de la línea">
            <div className="lp-ancho">
              {hermanos.map((h) => <a key={h.slug} href={`/catalogo/${h.slug}`} aria-current={h.slug === p.slug ? "page" : undefined}>{h.nombre}</a>)}
            </div>
          </nav>
        )}

        {fam && (
          <>
            <section className="lp-sec">
              <div className="lp-ancho">
                <Cabeza chip="Valor clínico" titulo={fam.titular} intro={fam.bajada} />
                <div className="lp-alterna">
                  {fam.bloques.map((b) => (
                    <div key={b.titulo} className={b.imagen ? undefined : "sin-foto"}>
                      <div><h3 className="lp-h3" style={{ fontSize: 24 }}>{b.titulo}</h3><p>{b.texto}</p></div>
                      {b.imagen && <div className="foto"><img src={b.imagen} alt={b.titulo} loading="lazy" /></div>}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="lp-sec celeste chica">
              <div className="lp-ancho">
                <div className="lp-tarjetas">
                  {fam.destacados.map((d) => (
                    <div className="lp-tarjeta centro" key={d.texto}><p className="lp-cifra">{d.cifra}</p><p>{d.texto}</p></div>
                  ))}
                </div>
              </div>
            </section>

            {fam.modulos && (
              <section className="lp-sec">
                <div className="lp-ancho">
                  <Cabeza chip="Configuración" titulo="Módulos y parámetros" intro="Consultá qué incluye cada modelo y qué se agrega como opcional." />
                  <div className="lp-modulos">
                    {fam.modulos.map((m) => <div key={m.nombre}><h3>{m.nombre}</h3><p>{m.texto}</p></div>)}
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {hayListas && (
          <section className={fam ? "lp-sec celeste" : "lp-sec"}>
            <div className="lp-ancho">
              <Cabeza chip="Especificaciones" titulo={`${p.nombre} en detalle`} izq />
              <div className="lp-listas">
                <Lista titulo="Características" items={p.caracteristicas} />
                <Lista titulo="Beneficios" items={p.beneficios} />
                <Lista titulo="Aplicaciones" items={p.aplicaciones} />
              </div>
              {fam && <p className="lp-origen">Fotos y datos técnicos: {p.marca}. La configuración final se confirma en la cotización.</p>}
            </div>
          </section>
        )}

        {fam?.preguntas && (
          <section className="lp-sec">
            <div className="lp-ancho">
              <div className="lp-cabeza izq"><Chip>FAQ</Chip><h2 className="lp-h2">Preguntas frecuentes</h2></div>
              <Preguntas items={fam.preguntas} />
            </div>
          </section>
        )}

        {relacionados.length > 0 && (
          <section className="lp-sec chica" style={{ borderTop: "1px solid var(--linea)" }}>
            <div className="lp-ancho">
              <h2 className="lp-h2" style={{ fontSize: 26, marginBottom: 24 }}>Otros equipos de {p.categoria.toLowerCase()}</h2>
              <div className="lp-grilla">
                {relacionados.map((r) => (
                  <a className="lp-prod" key={r.slug} href={`/catalogo/${r.slug}`}>
                    <div className="foto">{r.imagen ? <img src={r.imagen} alt={`${r.marca} ${r.nombre}`} loading="lazy" /> : <span className="sin">{r.marca}<br />{r.nombre}</span>}</div>
                    <span className="m">{r.marca}</span><span className="n">{r.nombre}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="lp-cierre">
          <div className="lp-ancho">
            <h2 className="lp-h2">¿Querés el {p.nombre} con instalación y plan de mantenimiento?</h2>
            <div className="lp-ctas">
              <a className="lp-boton blanco" href={`/contacto?producto=${encodeURIComponent(pedido)}`}>Pedir cotización</a>
              {wa && <a className="lp-boton linea-blanca" href={wa}>WhatsApp</a>}
            </div>
          </div>
        </section>
      </main>
      <Pie actual="catalogo" />
    </div>
  );
}
