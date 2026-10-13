"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS: [string, string, string][] = [
  ["/", "Panel", "M3 13h4v8H3zM10 3h4v18h-4zM17 9h4v12h-4z"],
  ["/equipos", "Equipos", "M4 5h16v11H4zM8 20h8M12 16v4"],
  ["/preventivos", "Preventivos", "M7 3v3M17 3v3M4 8h16M5 5h14v15H5zM9 14l2 2 4-4"],
  ["/ordenes", "Órdenes", "M6 3h12v18H6zM9 8h6M9 12h6M9 16h3"],
  ["/proveedores", "Proveedores", "M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"],
];

function Icono({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export function Navegacion({ movil = false, contadores }: { movil?: boolean; contadores?: Record<string, number> }) {
  const path = usePathname();
  const activo = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <>
      {ITEMS.map(([href, label, d]) => (
        <Link key={href} href={href} className={movil ? undefined : "navbtn"} aria-current={activo(href) ? "page" : undefined}>
          <Icono d={d} />
          {label}
          {!movil && contadores?.[href] ? <span className="mono muted" style={{ marginLeft: "auto" }}>{contadores[href]}</span> : null}
        </Link>
      ))}
    </>
  );
}
