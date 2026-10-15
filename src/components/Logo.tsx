/** Logo de NAYA LAB: la N dentro del marco de escaneo de una cámara (la etiqueta QR que se lee con el celular).
 *  El marco toma el color del texto; la N, el acento (--logo-acento o --accent). */
export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{ flex: "none" }}>
      <path d="M3 10V6a3 3 0 0 1 3-3h4M22 3h4a3 3 0 0 1 3 3v4M29 22v4a3 3 0 0 1-3 3h-4M10 29H6a3 3 0 0 1-3-3v-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M10.5 21.5v-11l11 11v-11" fill="none" stroke="var(--logo-acento, var(--accent))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
