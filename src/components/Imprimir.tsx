"use client";
export function Imprimir({ texto = "Imprimir", primario = true }: { texto?: string; primario?: boolean }) {
  return <button type="button" className={primario ? "btn primary" : "btn"} onClick={() => window.print()}>{texto}</button>;
}
