export const ESTADOS: Record<string, { label: string; clase: string }> = {
  operativo: { label: "Operativo", clase: "p-ok" },
  reparacion: { label: "En reparación", clase: "p-warn" },
  fuera: { label: "Fuera de servicio", clase: "p-crit" },
  baja: { label: "Baja", clase: "p-n" },
};

export const ESTADOS_OT: Record<string, string> = {
  "Abierta": "p-crit",
  "En curso": "p-warn",
  "Esperando repuesto": "p-warn",
  "Cerrada": "p-ok",
};

const DIA = 864e5;

export function hoyISO() {
  // Fecha local de Argentina
  return new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
}

export function sumarDias(iso: string, n: number) {
  return new Date(Date.parse(iso) + n * DIA).toISOString().slice(0, 10);
}

export function diasHasta(iso: string) {
  return Math.round((Date.parse(iso.slice(0, 10)) - Date.parse(hoyISO())) / DIA);
}

export function fecha(iso?: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export function estadoPreventivo(proxima: string) {
  const d = diasHasta(proxima);
  if (d < 0) return { label: "Vencido", clase: "p-crit", dias: d };
  if (d <= 30) return { label: "Próximo", clase: "p-warn", dias: d };
  return { label: "Al día", clase: "p-ok", dias: d };
}

export function numeroOT(n: number) {
  return "OT-" + String(n).padStart(4, "0");
}

export function pesos(n: number) {
  return "$ " + Number(n || 0).toLocaleString("es-AR");
}
