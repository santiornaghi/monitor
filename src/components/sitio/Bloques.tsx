// Piezas comunes del sitio: etiqueta de sección, ícono, preguntas y pasos.

const ICONOS: Record<string, React.ReactNode> = {
  llave: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" />,
  escudo: <><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" /></>,
  pulso: <path d="M3 12h4l2-5 3 10 2-5h7" />,
  qr: <><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2" /></>,
  calendario: <><rect x="4" y="5" width="16" height="15" rx="1" /><path d="M4 10h16M9 3v4M15 3v4" /></>,
  caja: <><path d="M4 8l8-4 8 4v8l-8 4-8-4z" /><path d="M4 8l8 4 8-4M12 12v8" /></>,
  chat: <path d="M5 5h14v10H9l-4 4z" />,
  pantalla: <><rect x="3" y="4" width="18" height="12" rx="1" /><path d="M8 20h8M12 16v4" /></>,
  reloj: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></>,
  documento: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></>,
  persona: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></>,
  camion: <><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>,
};

export function Icono({ nombre, solo }: { nombre: keyof typeof ICONOS | string; solo?: boolean }) {
  const svg = (
    <span className="lp-icono">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {ICONOS[nombre] ?? ICONOS.pulso}
      </svg>
    </span>
  );
  return solo ? svg : <span className="lp-icono-wrap">{svg}</span>;
}

export function Chip({ children, claro }: { children: React.ReactNode; claro?: boolean }) {
  return <span className={claro ? "lp-chip claro" : "lp-chip"}>{children}</span>;
}

export function Cabeza({ chip, titulo, intro, izq, claro }: { chip: string; titulo: React.ReactNode; intro?: React.ReactNode; izq?: boolean; claro?: boolean }) {
  return (
    <div className={izq ? "lp-cabeza izq" : "lp-cabeza"}>
      <Chip claro={claro}>{chip}</Chip>
      <h2 className="lp-h2">{titulo}</h2>
      {intro && <p className="lp-intro">{intro}</p>}
    </div>
  );
}

export function Preguntas({ items }: { items: { p: string; r: string }[] }) {
  return (
    <div className="lp-faq">
      {items.map((i) => (
        <details key={i.p}><summary>{i.p}</summary><p>{i.r}</p></details>
      ))}
    </div>
  );
}

export function Numeros({ items }: { items: { t: string; d: string }[] }) {
  return (
    <ol className="lp-numeros">
      {items.map((i, n) => (
        <li key={i.t}><span className="n">{n + 1}.</span><p><strong>{i.t}:</strong> {i.d}</p></li>
      ))}
    </ol>
  );
}

export function Puntos() {
  return <span className="lp-puntos" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <i key={i} />)}</span>;
}
