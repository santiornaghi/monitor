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

export type PlanHoras = {
  proxima: string;
  frecuencia_horas?: number | null;
  proximas_horas?: number | null;
};

/**
 * Estado de un plan que puede vencer por fecha y por horas de uso: vale el peor de los dos.
 * "Próximo" por horas = faltan menos del 10 % de la frecuencia (mínimo 50 h).
 */
export function estadoPlan(p: PlanHoras, horasUso?: number | null) {
  const porFecha = estadoPreventivo(p.proxima);
  if (p.proximas_horas == null || horasUso == null) return { ...porFecha, horasRestantes: null as number | null, motivo: "fecha" as const };
  const restantes = p.proximas_horas - horasUso;
  const margen = Math.max(50, Math.round((p.frecuencia_horas ?? 0) * 0.1));
  const nivel = (c: string) => (c === "p-crit" ? 2 : c === "p-warn" ? 1 : 0);
  const porHoras = restantes <= 0
    ? { label: "Vencido", clase: "p-crit" }
    : restantes <= margen ? { label: "Próximo", clase: "p-warn" } : { label: "Al día", clase: "p-ok" };
  const ganaHoras = nivel(porHoras.clase) > nivel(porFecha.clase);
  return { ...(ganaHoras ? porHoras : porFecha), dias: porFecha.dias, horasRestantes: restantes, motivo: ganaHoras ? ("horas" as const) : ("fecha" as const) };
}

export function horas(n?: number | null) {
  return n == null ? "—" : `${Number(n).toLocaleString("es-AR")} h`;
}

/** Texto corto de cuándo vence: "en 12 días", "hace 3 días", "faltan 120 h", "pasado por 40 h". */
export function cuandoVence(s: ReturnType<typeof estadoPlan>) {
  if (s.motivo === "horas" && s.horasRestantes != null) {
    return s.horasRestantes <= 0 ? `pasado por ${horas(-s.horasRestantes)}` : `faltan ${horas(s.horasRestantes)}`;
  }
  return s.dias < 0 ? `hace ${-s.dias} días` : s.dias === 0 ? "hoy" : `en ${s.dias} días`;
}
