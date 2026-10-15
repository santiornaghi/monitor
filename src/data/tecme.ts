// Contenido ampliado de los equipos TECME que se comercializan a través de Urani Biomédica.
// Fuente: fichas públicas de tecmeglobal.com (fotos y datos técnicos), redactado en forma resumida.
// Se aplica por familia; cada modelo puede tener su foto propia.

export type Bloque = { titulo: string; texto: string; imagen?: string };
export type Destacado = { cifra: string; texto: string };

export type Familia = {
  id: string;
  etiqueta: string; // chip sobre el título: "Ventilador mecánico"
  titular: string;
  bajada: string;
  portada: string;
  destacados: Destacado[];
  bloques: Bloque[];
  modulos?: { nombre: string; texto: string }[];
  preguntas?: { p: string; r: string }[];
};

const IMG = "/img/tecme";

export const FAMILIAS: Record<string, Familia> = {
  brina: {
    id: "brina",
    etiqueta: "Ventilador mecánico",
    titular: "Un solo ventilador, de neonatos a adultos.",
    bajada:
      "Plataforma modular de terapia intensiva con pantalla táctil de 18,5\", ventilación invasiva, no invasiva y alto flujo, y módulos que se agregan según la unidad.",
    portada: `${IMG}/brina-portada.webp`,
    destacados: [
      { cifra: "18,5\"", texto: "Pantalla táctil HD desmontable, rotativa y ajustable" },
      { cifra: "6 h", texto: "De autonomía con hasta 3 baterías intercambiables en uso" },
      { cifra: "0", texto: "Reemplazos del sensor de O₂: es paramagnético, dura toda la vida útil" },
    ],
    bloques: [
      { titulo: "Interfaz pensada para la urgencia", texto: "Configuración rápida desde la pantalla táctil y lectura clara de la mecánica del paciente. Menos pasos para llegar al ajuste correcto en una situación crítica.", imagen: `${IMG}/brina-frontal.webp` },
      { titulo: "Se monta donde la unidad lo necesite", texto: "Pedestal, brazo de techo, estante o pared. La pantalla se separa de la unidad ventilatoria, útil por ejemplo en pacientes aislados.", imagen: `${IMG}/brina-lateral.webp` },
      { titulo: "Pulmón activo", texto: "Muestra en tiempo real la distensibilidad y la resistencia de la vía aérea con un pulmón que se mueve al ritmo del paciente, incluido el diafragma cuando hay esfuerzo inspiratorio.", imagen: `${IMG}/brina-pulmon.webp` },
      { titulo: "Pantallas para cada momento", texto: "Vista de datos del paciente legible a distancia durante la recorrida, y vista familiar para las visitas sin perder los parámetros básicos.", imagen: `${IMG}/brina-datos.webp` },
    ],
    modulos: [
      { nombre: "SpO₂ Masimo SET®", texto: "Oximetría desde el ventilador y cálculo de SAFI y OSI." },
      { nombre: "Capnografía volumétrica", texto: "Sensor mainstream Capnostat® 5 de Philips Respironics." },
      { nombre: "Nebulizador Aerogen®", texto: "Malla vibratoria, partículas de ~3 µm sin alterar el flujo ni la FiO₂." },
      { nombre: "Presión transpulmonar (PEsof)", texto: "Balón esofágico para ventilación protectora en SDRA u obesidad." },
      { nombre: "Nebulizador neumático", texto: "Puerto integrado para nebulizadores jet estándar." },
      { nombre: "Modos AVA®, OAF y SBT", texto: "Ventilación adaptativa, alto flujo y prueba de respiración espontánea." },
    ],
    preguntas: [
      { p: "¿Qué pacientes puede ventilar?", r: "Adultos, pediátricos y neonatales, en modo invasivo y no invasivo. Brina Neo está pensado para pacientes de bajo peso, con sensor de flujo proximal y volumen garantizado." },
      { p: "¿Qué pasa si se corta la energía?", r: "Las baterías se cambian sin interrumpir la ventilación y dan hasta 6 horas de autonomía." },
    ],
  },
  neumovent: {
    id: "neumovent",
    etiqueta: "Ventilador mecánico",
    titular: "Robusto para el uso 24/7 de terapia intensiva.",
    bajada:
      "Familia de ventiladores para pacientes adultos, pediátricos y neonatales, con ventilación invasiva y no invasiva y certificación FDA 510(k) y CE.",
    portada: `${IMG}/neumovent-portada.webp`,
    destacados: [
      { cifra: "3", texto: "Modelos: Advance (todo incluido), Neo (desde 2 ml) y TS (escalable)" },
      { cifra: "2,5 h", texto: "De autonomía para traslados dentro del hospital" },
      { cifra: "FDA · CE", texto: "Registro FDA 510(k) y marcado CE en toda la línea" },
    ],
    bloques: [
      { titulo: "Todas las categorías de paciente", texto: "Un mismo equipo para adultos, pediátricos y neonatales, con transición entre ventilación invasiva y no invasiva sin interrumpir el soporte.", imagen: `${IMG}/neumovent-equipo.webp` },
      { titulo: "Antes, durante y después de la ventilación", texto: "Oxigenoterapia de alto flujo, prueba de respiración espontánea y monitorización avanzada (PV Flex, P0.1, Pimax) para acompañar el destete." },
      { titulo: "Mediciones más precisas", texto: "Capnografía volumétrica con espacio muerto fisiológico (Advance) y sensor de flujo proximal que mejora la sincronía paciente-ventilador (Advance y Neo)." },
    ],
    preguntas: [
      { p: "¿Qué diferencia hay entre los modelos?", r: "Advance trae capnografía volumétrica, alto flujo, flujo proximal y AVA de fábrica. Neo es exclusivo neonatal e infantil, desde 2 ml. TS es una plataforma que suma funciones por software según la necesidad y el presupuesto." },
      { p: "¿El Neo puede ventilar adultos?", r: "No. Está diseñado para neonatos e infantes." },
    ],
  },
  ix: {
    id: "ix",
    etiqueta: "Monitor multiparamétrico",
    titular: "El monitor que ve lo que muestra el ventilador.",
    bajada:
      "Monitores de 13,3\" y 15,6\" que se conectan directo con los ventiladores TECME y con la central de monitoreo, para tener signos vitales y curvas de ventilación en una sola pantalla.",
    portada: `${IMG}/ix-portada.webp`,
    destacados: [
      { cifra: "15 s", texto: "Medición de presión no invasiva con algoritmo iFAST" },
      { cifra: "33", texto: "Tipos de arritmia detectados, validado con bases CSE, MIT y AHA" },
      { cifra: "720 h", texto: "De datos por paciente almacenados en la central CMS" },
    ],
    bloques: [
      { titulo: "Pantalla que se adapta", texto: "Pantallas HD antirreflejo con diseño angular de 105° y visión de 170°. Sin ventilador interno: silencioso y sin ingreso de polvo, con protección IP22.", imagen: `${IMG}/ix-ergonomia.webp` },
      { titulo: "Herramientas clínicas integradas", texto: "Screening neonatal de cardiopatías congénitas (CCHD), tendencia de presión de 24 h, escala de Glasgow y sistema de alerta temprana (EWS).", imagen: `${IMG}/ix-pantalla.webp` },
      { titulo: "Integrado al hospital", texto: "Conexión por cable o inalámbrica con la central de monitoreo, historia clínica electrónica, estaciones móviles y navegador web.", imagen: `${IMG}/cms.webp` },
    ],
    modulos: [
      { nombre: "Parámetros estándar", texto: "ECG, SpO₂, presión no invasiva (iFAST y continua), temperatura y respiración." },
      { nombre: "ECG de 12 derivaciones", texto: "Diagnóstico completo con detección de marcapasos." },
      { nombre: "Presión invasiva", texto: "2 o 4 canales, y gasto cardíaco." },
      { nombre: "Capnografía", texto: "Philips Respironics o Masimo®, y análisis de gases anestésicos Masimo®." },
    ],
  },
  humidoflo: {
    id: "humidoflo",
    etiqueta: "Oxigenoterapia de alto flujo",
    titular: "Alto flujo calefaccionado en un equipo portátil.",
    bajada:
      "Soporte respiratorio no invasivo con aire caliente y humidificado, flujo servocontrolado de 2 a 60 L/min y oximetría integrada, en 2,5 kg.",
    portada: `${IMG}/humidoflo-portada.webp`,
    destacados: [
      { cifra: "2–60", texto: "L/min: modo adulto 15–60 y modo infantil 2–25" },
      { cifra: "≥33 mg", texto: "De humedad absoluta a 37 °C en la vía aérea" },
      { cifra: "2,5 kg", texto: "Portátil, para terapia intensiva e internación" },
    ],
    bloques: [
      { titulo: "Oximetría de pulso integrada", texto: "Saturación continua en el mismo equipo para ajustar la terapia según la respuesta del paciente.", imagen: `${IMG}/humidoflo-spo2.webp` },
      { titulo: "Aerosolterapia sin interrumpir el flujo", texto: "Conexión por USB del nebulizador Aerogen® Solo de malla vibratoria, sin alterar los parámetros programados.", imagen: `${IMG}/humidoflo-aerogen.webp` },
      { titulo: "Efectos fisiológicos", texto: "Efecto símil CPAP, lavado de CO₂ del espacio muerto, mejor clearance mucociliar y FiO₂ controlada y predecible." },
    ],
    preguntas: [
      { p: "¿En qué casos se usa?", r: "Pre y post extubación, insuficiencia respiratoria hipoxémica e hipercápnica, insuficiencia cardíaca y apnea del sueño. También como alternativa cuando la ventilación no invasiva no se tolera." },
    ],
  },
  compresores: {
    id: "compresores",
    etiqueta: "Compresor de aire medicinal",
    titular: "El aire que el ventilador necesita, sin interrupciones.",
    bajada:
      "Compresores libres de aceite para funcionamiento continuo 24/7, compatibles con toda la línea Brina y Neumovent mediante conexión DISS 1160-A.",
    portada: `${IMG}/compresor-portada.webp`,
    destacados: [
      { cifra: "49–52 dB", texto: "Nivel sonoro en todos los modelos" },
      { cifra: "24/7", texto: "Modo de funcionamiento continuo" },
      { cifra: "ANMAT", texto: "Registro ANMAT, FDA y CE; fabricación ISO 13485" },
    ],
    bloques: [
      { titulo: "Compatibilidad con toda la línea TECME", texto: "Un único estándar de conexión para Brina, Brina Neo y Neumovent Advance, Neo y TS.", imagen: `${IMG}/compresor-pn3000.webp` },
      { titulo: "Tres configuraciones", texto: "PN3000 de alta eficiencia, NAC con aire limpio y seco, y DK50 DS Smart de fabricación europea con respaldo automático." },
    ],
  },
  humidificadores: {
    id: "humidificadores",
    etiqueta: "Humidificador activo",
    titular: "Humidificación para ventilación invasiva y no invasiva.",
    bajada:
      "Humidificadores de plato calefactor de 150 W, para tubo endotraqueal, traqueotomía o máscara, desde neonatos hasta adultos.",
    portada: `${IMG}/humidificador-portada.webp`,
    destacados: [
      { cifra: "≥33 mg/L", texto: "En modo invasivo y ≥10 mg/L en no invasivo" },
      { cifra: "120 L/min", texto: "De flujo máximo en no invasivo (60 en invasivo)" },
      { cifra: "±0,3 °C", texto: "De exactitud en la medición de temperatura (VH-2600A)" },
    ],
    bloques: [
      { titulo: "VH-2100: control manual simple", texto: "Perilla de 9 niveles y 1,3 kg de peso. Para unidades con protocolos de humidificación estandarizados.", imagen: `${IMG}/humidificador-vh2100.webp` },
      { titulo: "VH-2600A: monitorización digital", texto: "Pantalla LED, control automático de cámara y vía aérea, y alarmas sonoras y luminosas para terapia intensiva de alta complejidad.", imagen: `${IMG}/humidificador-vh2600a-on.webp` },
    ],
  },
};

// Familia y foto propia de cada modelo del catálogo
export const MODELOS: Record<string, { familia: string; foto?: string; nota?: string }> = {
  "tecme-brina": { familia: "brina", foto: `${IMG}/brina-portada.webp` },
  "tecme-brina-neo": { familia: "brina", foto: `${IMG}/brina-frontal.webp`, nota: "Para pacientes de bajo peso: sensor de flujo proximal incluido y modo volumen garantizado que compensa fugas." },
  "tecme-neumovent-advance": { familia: "neumovent", foto: `${IMG}/neumovent-equipo.webp`, nota: "Todo incluido de fábrica: capnografía volumétrica, alto flujo, sensor de flujo proximal y modo AVA." },
  "tecme-neumovent-neo": { familia: "neumovent", foto: `${IMG}/neumovent-equipo.webp`, nota: "Exclusivo para neonatos e infantes, con volumen corriente desde 2 ml." },
  "tecme-neumovent-ts": { familia: "neumovent", foto: `${IMG}/neumovent-equipo.webp`, nota: "Plataforma escalable: suma funciones por software según la unidad y el presupuesto." },
  "tecme-monitor-multiparametrico-ix12": { familia: "ix", foto: `${IMG}/ix12-lateral.webp` },
  "tecme-monitor-multiparametrico-ix15": { familia: "ix", foto: `${IMG}/ix15-lateral.webp` },
  "tecme-central-de-monitoreo-cms": { familia: "ix", foto: `${IMG}/cms.webp` },
  "tecme-humidoflo": { familia: "humidoflo", foto: `${IMG}/humidoflo-portada.webp` },
  "tecme-compresor-pn3000": { familia: "compresores", foto: `${IMG}/compresor-portada.webp` },
  "tecme-compresor-nac": { familia: "compresores", foto: `${IMG}/compresor-nac.webp` },
  "tecme-compresor-dk50-ds-smart": { familia: "compresores", foto: `${IMG}/compresor-dk50.webp` },
  "tecme-humidificador-vh-2100": { familia: "humidificadores", foto: `${IMG}/humidificador-vh2100.webp` },
  "tecme-humidificador-vh-2600a": { familia: "humidificadores", foto: `${IMG}/humidificador-vh2600a.webp` },
};

export function ampliado(slug: string) {
  const m = MODELOS[slug];
  if (!m) return null;
  return { ...m, familia: FAMILIAS[m.familia] };
}
