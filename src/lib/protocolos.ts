// Protocolos de mantenimiento preventivo por tipo de equipo.
// Un paso sin `unidad` es un chequeo; con `unidad` es una medición con rango aceptable.
export type Paso = { texto: string; unidad?: string; min?: number; max?: number; desvio?: boolean };

export const PROTOCOLOS: Record<string, Paso[]> = {
  "Respirador": [
    { texto: "Inspección visual de carcasa, cables y conectores" },
    { texto: "Test de fugas del circuito paciente" },
    { texto: "Calibración de sensor de O₂" },
    { texto: "Prueba de alarmas (presión alta, desconexión, apnea)" },
    { texto: "Volumen corriente entregado vs. programado", unidad: "%", min: -10, max: 10, desvio: true },
    { texto: "Corriente de fuga del equipo (IEC 62353)", unidad: "µA", min: 0, max: 500 },
  ],
  "Monitor multiparamétrico": [
    { texto: "Inspección visual y accesorios" },
    { texto: "Verificación de SpO₂ con simulador" },
    { texto: "PANI: presión medida vs. simulador", unidad: "mmHg", min: -3, max: 3, desvio: true },
    { texto: "Prueba de alarmas" },
    { texto: "Corriente de fuga del equipo (IEC 62353)", unidad: "µA", min: 0, max: 500 },
  ],
  "Desfibrilador": [
    { texto: "Inspección de palas y cables" },
    { texto: "Estado de batería y autotest" },
    { texto: "Energía entregada a 200 J", unidad: "J", min: 170, max: 230 },
    { texto: "Corriente de fuga del equipo (IEC 62353)", unidad: "µA", min: 0, max: 500 },
  ],
  "Bomba de infusión": [
    { texto: "Inspección visual y puerta" },
    { texto: "Exactitud de flujo a 100 ml/h", unidad: "%", min: -5, max: 5, desvio: true },
    { texto: "Alarma de oclusión" },
    { texto: "Corriente de fuga del equipo (IEC 62353)", unidad: "µA", min: 0, max: 500 },
  ],
  "Analizador bioquímico": [
    { texto: "Limpieza de sonda y cubetas" },
    { texto: "Horas restantes de lámpara", unidad: "h", min: 200 },
    { texto: "Control de calidad nivel normal y patológico" },
    { texto: "Reemplazo de filtros" },
  ],
  "Máquina de hemodiálisis": [
    { texto: "Desinfección térmica" },
    { texto: "Conductividad", unidad: "mS/cm", min: 13.5, max: 14.5 },
    { texto: "Test de presiones" },
    { texto: "Corriente de fuga del equipo (IEC 62353)", unidad: "µA", min: 0, max: 500 },
  ],
  "Otro": [
    { texto: "Inspección visual" },
    { texto: "Prueba funcional según manual del fabricante" },
    { texto: "Corriente de fuga del equipo (IEC 62353)", unidad: "µA", min: 0, max: 500 },
  ],
};

export const TIPOS = Object.keys(PROTOCOLOS);

export const FRECUENCIA_DEFECTO: Record<string, number> = {
  "Respirador": 180,
  "Desfibrilador": 180,
  "Analizador bioquímico": 90,
  "Máquina de hemodiálisis": 90,
};

export function rangoTexto(p: Paso) {
  if (p.desvio) return `±${p.max} ${p.unidad}`;
  if (p.max === undefined) return `≥ ${p.min} ${p.unidad}`;
  return `${p.min} a ${p.max} ${p.unidad}`;
}

export function fueraDeRango(p: Paso, v: number) {
  return (p.min !== undefined && v < p.min) || (p.max !== undefined && v > p.max);
}
