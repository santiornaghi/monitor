import datos from "@/data/catalogo.json";

export type Producto = {
  slug: string;
  codigo: string;
  nombre: string;
  marca: string;
  tipo: "equipo" | "reactivo";
  categoria: string;
  subcategoria?: string;
  descripcion?: string;
  imagen: string;
  beneficios?: string[];
  aplicaciones?: string[];
  caracteristicas?: string[];
  especificaciones?: unknown;
  parametros?: unknown;
  otrosParametros?: unknown;
  dimensiones?: string;
  alimentacion?: string;
  peso?: string;
  rango?: string;
  testKit?: string;
  unidades?: string;
  fabricante?: string;
};

export const PRODUCTOS = datos as unknown as Producto[];
export const EQUIPOS = PRODUCTOS.filter((p) => p.tipo === "equipo");
export const REACTIVOS = PRODUCTOS.filter((p) => p.tipo === "reactivo");

export const MARCAS = [...new Set(EQUIPOS.map((p) => p.marca).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));

// Áreas de uso para ordenar el catálogo como piensa una institución
export const AREAS: { nombre: string; categorias: string[] }[] = [
  { nombre: "Laboratorio clínico", categorias: ["Química Clínica", "Quimioluminiscencia", "Sistemas Integrados", "Hemostasia", "Hematología", "Electrolitos", "Análisis de Sangre", "Veterinaria"] },
  { nombre: "Cuidados críticos y emergencias", categorias: ["Ventilación", "Monitoreo", "Monitoreo de Pacientes", "Equipamiento de Emergencia", "Bombas de Infusión", "Equipamiento Especializado", "Accesorios"] },
  { nombre: "Estufas y esterilización", categorias: ["Estufas de Cultivo", "Estufas de Secado", "Estufas de Esterilización"] },
];

export function areaDe(categoria: string) {
  return AREAS.find((a) => a.categorias.includes(categoria))?.nombre ?? "Otros equipos";
}

export function buscarProducto(slug: string) {
  return PRODUCTOS.find((p) => p.slug === slug);
}

const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
export function filtrar(lista: Producto[], q?: string) {
  if (!q) return lista;
  const t = normalizar(q);
  return lista.filter((p) => normalizar([p.nombre, p.codigo, p.marca, p.categoria, p.subcategoria, p.descripcion].join(" ")).includes(t));
}
