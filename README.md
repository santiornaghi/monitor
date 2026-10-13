# Monitor

Gestión del parque de equipos médicos: inventario con QR, hoja de vida, mantenimiento preventivo con protocolo, órdenes de trabajo y proveedores. Funciona para una institución o para una empresa de servicio técnico que gestiona varias.

Stack: Next.js 15 (App Router, TypeScript) + Supabase (Postgres con Row Level Security, Auth).

## Qué incluye

- **Panel**: porcentaje operativo, preventivos vencidos, órdenes abiertas, equipos fuera de servicio, operatividad por servicio y por institución.
- **Equipos**: alta manual, importación desde CSV, búsqueda y filtros, hoja de vida con historial inmutable, cambio de estado, novedades.
- **QR**: cada equipo tiene un código único. Escaneado por alguien sin cuenta abre un formulario de reporte de falla que crea la orden sola; escaneado por un usuario del sistema abre la hoja de vida. Hoja de etiquetas lista para imprimir.
- **Preventivos**: plan por equipo con frecuencia, estados (al día, próximo, vencido) y protocolo por tipo de equipo con mediciones y rangos. Una medición fuera de rango abre una orden correctiva y pasa el equipo a reparación.
- **Órdenes de trabajo**: correctivo, calibración, instalación; seguimiento de estado, asignación a proveedor, cierre con trabajo realizado y costo.
- **Proveedores** por institución.
- **Modo proveedor de servicio**: una empresa de service crea sus clientes y ve el parque de todos desde una cuenta.

## Puesta en marcha

### 1. Crear el proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com), creá una cuenta y un proyecto nuevo. Región sugerida: São Paulo (sa-east-1), la más cercana a Argentina.
2. En **SQL Editor**, abrí una consulta nueva, pegá todo el contenido de `supabase/migrations/0001_esquema.sql` y ejecutalo.
3. En **Authentication > URL Configuration**:
   - *Site URL*: la URL donde va a vivir la app (por ahora `http://localhost:3000`; después la de Vercel).
   - *Redirect URLs*: agregá `http://localhost:3000/auth/confirm` y, más adelante, `https://TU-APP.vercel.app/auth/confirm`.
4. En **Project Settings > API** copiá la *Project URL* y la clave *publishable* (o *anon public* en proyectos viejos).

Para probar rápido sin confirmar emails: **Authentication > Sign In / Providers > Email**, desactivá *Confirm email*. Volvé a activarlo antes de dar acceso a clientes reales.

### 2. Correr la app en tu computadora

Necesitás [Node.js 20 o superior](https://nodejs.org).

```bash
npm install
cp .env.example .env.local   # en Windows: copy .env.example .env.local
# Editá .env.local con la URL y la clave de Supabase
npm run dev
```

Abrí `http://localhost:3000`, creá una cuenta y elegí "Cargar equipos de ejemplo" para ver la app con datos.

### 3. Publicar en internet (Vercel)

1. Subí el proyecto a un repositorio privado de GitHub.
2. En [vercel.com](https://vercel.com), *Add New > Project*, importá el repositorio.
3. En *Environment Variables* cargá `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` como tipo *Config*. La URL de los QR se toma sola del dominio de producción de Vercel.
4. *Deploy*. Después actualizá *Site URL* y *Redirect URLs* en Supabase con esa misma URL.

Importante: los QR impresos llevan el dominio de producción. Si después usás un dominio propio, cargalo en la variable `SITE_URL` antes de imprimir etiquetas para clientes.

## Cómo está organizada la seguridad

- Cada tabla tiene `org_id` y políticas RLS: un usuario solo ve las organizaciones de las que es miembro, más las instituciones cliente si pertenece a un proveedor con acceso.
- Roles: `admin`, `tecnico` (pueden editar) y `direccion` (solo lectura).
- El historial (`eventos`) no tiene permisos de edición ni de borrado: las correcciones se agregan como registros nuevos.
- El reporte por QR sin login pasa por funciones de base de datos que solo exponen tipo, marca, modelo, servicio e institución del equipo, y limitan a 3 reportes anónimos por equipo por hora.
- El sistema no guarda datos de pacientes.

## Estructura

```
supabase/migrations/0001_esquema.sql   Tablas, RLS, funciones y datos de ejemplo
src/middleware.ts                      Sesión y protección de rutas
src/lib/                               Supabase, protocolos, formato, QR
src/app/login, bienvenida              Acceso y alta de la organización
src/app/(app)/                         Panel, equipos, preventivos, órdenes, proveedores, clientes
src/app/q/[token]                      Página pública del QR
```

## Pendientes conocidos

- Invitar usuarios a una organización (hoy cada cuenta crea la suya; se puede agregar miembros desde Supabase en la tabla `miembros`).
- Avisos por email de vencimientos.
- Adjuntar fotos y certificados de calibración.
- Repuestos, horas de uso con preventivo por horas, exportación a Excel y PDF de hoja de vida.
