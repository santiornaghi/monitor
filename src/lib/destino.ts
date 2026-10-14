/** Solo se aceptan rutas internas, para que un enlace no pueda redirigir a otro sitio. */
export function destinoSeguro(next: unknown, porDefecto = "/") {
  const s = typeof next === "string" ? next : "";
  return s.startsWith("/") && !s.startsWith("//") && !s.startsWith("/\\") ? s : porDefecto;
}
