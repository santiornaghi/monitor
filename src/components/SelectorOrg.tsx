"use client";
import { elegirOrg } from "@/app/(app)/acciones-generales";

export function SelectorOrg({ orgs, alcance }: { orgs: { id: string; nombre: string }[]; alcance: string }) {
  if (orgs.length <= 1) return null;
  return (
    <form action={elegirOrg}>
      <select id="org" name="org" aria-label="Institución" defaultValue={alcance} onChange={(e) => e.currentTarget.form?.requestSubmit()}>
        <option value="todas">Todas las instituciones</option>
        {orgs.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
      </select>
    </form>
  );
}
