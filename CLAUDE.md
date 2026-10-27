# frontend/ — Panel web (sistema-multiempresa)

## Comandos
- Dev: `npm run dev` (http://localhost:5173) · API en `VITE_API_URL` (por defecto http://localhost:3000)
- Lint: `npm run lint` (oxlint) · Build + tipos: `npm run build` (`tsc -b && vite build`)
- No hay tests. Verifica con `lint` + `build`.

## Estructura
```
src/
├── features/<dominio>/          ← todo lo de un dominio vive aquí
│   ├── api.ts                   interfaces + funciones axios (usa apiClient)
│   ├── hooks.ts                 useQuery/useMutation + objeto `<x>Keys`
│   ├── estado.ts / estilos.ts   (opcional) helpers puros del dominio
│   └── components/              vistas y formularios del dominio
├── shared/ui/                   componentes reutilizables: DataTable, Modal, Formulario, Panel,
│                                PageHeader, StatCard, Badge, Estados (Cargando/ErrorCarga),
│                                Paginacion, SearchInput, GraficoLinea, PeriodoSelector, Avisos
├── shared/api/client.ts         axios con JWT + renovación por cookie (NO duplicar)
├── shared/api/errores.ts        mensajeError(err) para mostrar errores de la API
├── shared/map/                  useLeafletMap, MapaControles, useFullscreen
├── shared/utils/                formato (num, fechaHora, haceCuanto), csv, geometria, escapeHtml
├── auth/permisos.ts             matriz de permisos (refleja roles/permisos del backend)
├── store/authStore.ts           sesión (Zustand)
├── routes/                      ProtectedRoute (prop `permiso`), EmpresaRoute
└── pages/                       páginas de nivel superior que componen features
```
- Alias `@/` → `src/`. Importa siempre con `@/...`.

## Convenciones
- Datos del servidor: **solo TanStack Query** (nada de `useEffect + fetch`). Estado global: Zustand
  solo para sesión. Estado de formulario: hook local (`useGeocercaForm.ts` como ejemplo).
- Query keys en un objeto `<x>Keys` en `hooks.ts`; las mutaciones invalidan esas keys.
- Datos en vivo: `refetchInterval` 30–60 s (no hay websockets).
- Antes de crear un componente, revisar si ya existe en `shared/ui/`.
- Rutas por empresa: usar `useEmpresaPath()` (`/empresa/:token` para SuperAdmin, `/panel` para el resto).
- Mostrar/ocultar acciones con `sesion.permisos.<flag>` o `permisos.puede('MODULO','ACCION')`.
  La seguridad real está en el backend; esto es solo UI.
- Errores: `mensajeError(err)`; estados de carga con `Cargando` / `ErrorCarga`.
- Estilo: Tailwind 4, tema del diseño 2026-10: fondo `#02111C`, paneles `#071623` (borde `#12263A`), acento `#2BC4E8`,
  fuentes Barlow / Barlow Condensed (`font-cond`). Estados: En ruta `#15E462`, Ralentí `#FCC908`, Apagado `#AABAD0`,
  Sin comunicación `#F64651`; alerta de consumo `#B65CFF`. Iconos `lucide-react`.
- TypeScript estricto: nada de `any` nuevo (`sedes/api.ts` y `empresas/api.ts` aún lo tienen; tipar al tocarlos).
  `verbatimModuleSyntax`: tipos con `import type`.
- HTML en popups de Leaflet: escapar con `escapeHtml`.
- Nombres en español, componentes en PascalCase, un componente principal por archivo.
