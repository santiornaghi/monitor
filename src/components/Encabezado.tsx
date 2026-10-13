import { SelectorOrg } from "./SelectorOrg";

export function Encabezado({ titulo, instituciones, alcance, children }: {
  titulo: string; instituciones: { id: string; nombre: string }[]; alcance: string; children?: React.ReactNode;
}) {
  return (
    <div className="top">
      <h1>{titulo}</h1>
      <span className="sp" />
      <SelectorOrg orgs={instituciones} alcance={alcance} />
      {children}
    </div>
  );
}

export function Pill({ texto, clase }: { texto: string; clase: string }) {
  return <span className={`pill ${clase}`}>{texto}</span>;
}
