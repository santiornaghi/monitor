"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { registrarDocumento } from "@/app/(app)/equipos/documentos-actions";
import { BUCKET, TAMANO_MAXIMO, TIPOS_ARCHIVO, TIPOS_DOC } from "@/lib/documentos";

function nombreSeguro(n: string) {
  const ext = n.includes(".") ? n.slice(n.lastIndexOf(".")).toLowerCase() : "";
  const base = n.slice(0, n.length - ext.length).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9-_]+/g, "-").slice(0, 60);
  return `${base || "archivo"}${ext}`;
}

export function SubirDocumento({ equipoId, orgId, marca, modelo }: { equipoId: string; orgId: string; marca: string; modelo: string }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [tipo, setTipo] = useState("manual_usuario");
  const [modo, setModo] = useState<"archivo" | "enlace">("archivo");
  const [estado, setEstado] = useState<{ cargando?: boolean; error?: string; ok?: string }>({});

  if (!abierto) return <button type="button" className="btn" onClick={() => setAbierto(true)}>Agregar documento</button>;

  async function enviar(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const f = new FormData(ev.currentTarget);
    setEstado({ cargando: true });
    let path: string | undefined;
    if (modo === "archivo") {
      const archivo = f.get("archivo");
      if (!(archivo instanceof File) || !archivo.size) return setEstado({ error: "Elegí un archivo." });
      if (archivo.size > TAMANO_MAXIMO) return setEstado({ error: "El archivo pesa más de 50 MB." });
      if (archivo.type && !TIPOS_ARCHIVO.includes(archivo.type)) return setEstado({ error: "Solo se aceptan PDF o imágenes (JPG, PNG, WEBP, HEIC)." });
      path = `${orgId}/${crypto.randomUUID()}-${nombreSeguro(archivo.name)}`;
      const { error } = await createClient().storage.from(BUCKET).upload(path, archivo, { contentType: archivo.type || undefined });
      if (error) return setEstado({ error: `No se pudo subir el archivo: ${error.message}` });
    }
    const r = await registrarDocumento({
      equipoId,
      alcance: f.get("alcance") === "modelo" ? "modelo" : "equipo",
      tipo,
      nombre: String(f.get("nombre") ?? ""),
      publico: f.get("publico") === "on",
      vence: String(f.get("vence") ?? "") || undefined,
      path,
      url: modo === "enlace" ? String(f.get("url") ?? "").trim() : undefined,
    });
    if (r.error) return setEstado({ error: r.error });
    setEstado({ ok: "Documento agregado." });
    setAbierto(false);
    router.refresh();
  }

  const porModelo = tipo === "manual_usuario" || tipo === "manual_servicio";
  return (
    <form className="card form" onSubmit={enviar} style={{ maxWidth: "none", marginTop: 12 }}>
      <label>Tipo
        <select id="doc_tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {Object.entries(TIPOS_DOC).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </label>
      <label>Para
        <select id="doc_alcance" name="alcance" defaultValue={porModelo ? "modelo" : "equipo"} key={porModelo ? "m" : "e"}>
          <option value="modelo">Todos los {marca} {modelo}</option>
          <option value="equipo">Solo este equipo</option>
        </select>
      </label>
      <label className="full">Nombre<input id="doc_nombre" name="nombre" placeholder={TIPOS_DOC[tipo]} /></label>
      <div className="full actions">
        <label style={{ flexDirection: "row", alignItems: "center", gap: 6, color: "var(--fg)" }}><input type="radio" name="modo" checked={modo === "archivo"} onChange={() => setModo("archivo")} style={{ width: "auto" }} /> Subir archivo</label>
        <label style={{ flexDirection: "row", alignItems: "center", gap: 6, color: "var(--fg)" }}><input type="radio" name="modo" checked={modo === "enlace"} onChange={() => setModo("enlace")} style={{ width: "auto" }} /> Pegar enlace</label>
      </div>
      {modo === "archivo"
        ? <label className="full">Archivo (PDF o imagen, hasta 50 MB)<input id="doc_archivo" name="archivo" type="file" accept=".pdf,image/*" required /></label>
        : <label className="full">Enlace<input id="doc_url" name="url" type="url" required placeholder="https://fabricante.com/manual.pdf" /></label>}
      {tipo === "certificado" && <label>Vence<input id="doc_vence" name="vence" type="date" /></label>}
      <label className="full" style={{ flexDirection: "row", alignItems: "center", gap: 8, color: "var(--fg)" }} key={`pub-${tipo}`}>
        <input id="doc_publico" name="publico" type="checkbox" defaultChecked={tipo === "manual_usuario"} style={{ width: "auto" }} />
        Mostrar en la página del QR (lo ve cualquiera que escanee, sin cuenta)
      </label>
      {estado.error && <div className="error full">{estado.error}</div>}
      <div className="full actions end">
        <button type="button" className="btn" onClick={() => { setAbierto(false); setEstado({}); }}>Cancelar</button>
        <button className="btn primary" disabled={estado.cargando}>{estado.cargando ? "Subiendo…" : "Guardar documento"}</button>
      </div>
    </form>
  );
}
