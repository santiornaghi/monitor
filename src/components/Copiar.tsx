"use client";
import { useState } from "react";

export function Copiar({ texto }: { texto: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className="btn sm"
      onClick={async () => {
        try { await navigator.clipboard.writeText(texto); setOk(true); setTimeout(() => setOk(false), 2000); } catch { /* el texto queda visible para copiar a mano */ }
      }}
    >
      {ok ? "Copiado" : "Copiar enlace"}
    </button>
  );
}
