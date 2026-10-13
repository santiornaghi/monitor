"use client";

export function EnviarAlCambiar({ name, valor, opciones, etiqueta }: { name: string; valor: string; opciones: [string, string][]; etiqueta: string }) {
  return (
    <select id={name} name={name} defaultValue={valor} aria-label={etiqueta} onChange={(e) => e.currentTarget.form?.requestSubmit()}>
      {opciones.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
    </select>
  );
}
