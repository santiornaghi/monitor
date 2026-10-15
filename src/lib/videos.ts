import type { Producto } from "./catalogo";
import { MODELOS } from "@/data/tecme";

// Canales oficiales de YouTube de cada fabricante (solo los verificados).
// Para sumar una marca: agregá su canal acá con el formato https://www.youtube.com/@usuario
export const CANALES: Record<string, string> = {
  TECME: "https://www.youtube.com/@Tecme.global",
  "Wiener Lab": "https://www.youtube.com/@Wienerlab.",
};

const BUSQUEDA_TECME: Record<string, string> = {
  brina: "Brina",
  neumovent: "Neumovent",
  ix: "monitor iX",
  humidoflo: "Humidoflo",
  compresores: "compresor",
  humidificadores: "humidificador",
};

/** Enlace a los videos del modelo dentro del canal oficial del fabricante, o null si no hay canal. */
export function videosDe(p: Producto) {
  const canal = CANALES[p.marca];
  if (!canal) return null;
  const familia = MODELOS[p.slug]?.familia;
  const busqueda = (familia && BUSQUEDA_TECME[familia]) || p.nombre;
  return `${canal}/search?query=${encodeURIComponent(busqueda)}`;
}
