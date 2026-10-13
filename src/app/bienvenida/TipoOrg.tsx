"use client";
import { useState } from "react";

export function TipoOrg() {
  const [tipo, setTipo] = useState("institucion");
  return (
    <>
      <label className="full">
        Tipo de organización
        <select id="tipo" name="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="institucion">Institución de salud (hospital, clínica, sanatorio)</option>
          <option value="proveedor">Empresa de servicio técnico (gestiono equipos de varios clientes)</option>
        </select>
      </label>
      {tipo === "proveedor" && (
        <label className="full">Nombre de tu primer cliente<input id="cliente" name="cliente" required placeholder="Sanatorio San Martín" /></label>
      )}
    </>
  );
}
