# Sistema Multiempresa — Fase 1

Aplicativo React + TypeScript + Vite con login, control de acceso por roles y
aislamiento de información por empresa, según lo especificado en la Fase 1.

## Requisitos previos

- Node.js 18 o superior (recomendado 20+)
- npm (viene incluido con Node.js)

Verifica tu versión con:

```bash
node -v
npm -v
```

## Cómo ejecutar el proyecto

1. Descomprime el archivo `.zip` en la carpeta donde quieras trabajar.
2. Abre una terminal dentro de la carpeta del proyecto (`sistema-multiempresa`).
3. Instala las dependencias:

   ```bash
   npm install
   ```

4. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

5. Abre en el navegador la URL que muestra la terminal (normalmente
   `http://localhost:5173`).

Para generar la versión de producción (archivos estáticos optimizados):

```bash
npm run build
npm run preview   # sirve el build localmente para probarlo
```

## Usuarios de prueba

Todos los usuarios están definidos en `src/data/usuarios.json` (datos
temporales, en lugar de una base de datos real).

| Usuario     | Contraseña   | Rol                          | Empresa                          |
|-------------|--------------|-------------------------------|-----------------------------------|
| admin       | admin123     | 1 - Administrador principal   | Todas                             |
| supervisor  | super123     | 2 - Administrador              | Todas (sin gestión de usuarios)   |
| empresa1    | empresa123   | 3 - Empresa                     | Empresa 1                         |
| empresa2    | empresa123   | 3 - Empresa                     | Empresa 2                         |
| empresa3    | empresa123   | 3 - Empresa                     | Empresa 3                         |
| empresa4    | empresa123   | 3 - Empresa                     | Empresa 4                         |
| empresa5    | empresa123   | 3 - Empresa                     | Empresa 5                         |
| empresa6    | empresa123   | 3 - Empresa                     | Empresa 6                         |

## Qué incluye esta Fase 1

- **Login** contra datos JSON temporales, con sesión persistida en
  `sessionStorage` (`src/context/AuthContext.tsx`, `src/utils/session.ts`).
- **Rutas protegidas** con React Router (`src/routes/ProtectedRoute.tsx`,
  `src/routes/EmpresaRoute.tsx`), incluyendo la validación estricta de
  `empresaId` para el Rol 3 (un usuario de Empresa 2 no puede ver `/empresa/5`,
  por ejemplo — es redirigido a `/no-autorizado`).
- **Menú dinámico** según el rol (`src/hooks/useMenu.ts`).
- **Dashboard** que cambia de contenido según el usuario autenticado
  (global para Roles 1 y 2, específico de la empresa para el Rol 3),
  con espacio ya preparado para mapa, tarjetas de indicadores y gráficos.
- **Tipado completo con TypeScript** para Usuario, Empresa, Rol, Sesión y
  Permisos (`src/types/index.ts`).
- **Capa de servicios** (`src/services/authService.ts`,
  `src/services/empresaService.ts`) que simula llamadas a una API. Están
  aisladas de los componentes visuales, por lo que en una fase posterior
  basta con reemplazar su implementación interna (JSON → fetch/axios a un
  backend real) sin tocar las páginas ni el contexto de autenticación.

## Estructura del proyecto

```
src/
├── assets/
├── components/        IndicatorCard, MapPlaceholder (reutilizables)
├── layouts/            MainLayout (sidebar + topbar)
├── pages/
│   ├── Login/
│   ├── Dashboard/
│   ├── Usuarios/
│   ├── Empresas/
│   ├── Empresa/          (detalle de una empresa: /empresa/:id)
│   └── NotAuthorized/
├── routes/              ProtectedRoute, EmpresaRoute
├── services/            authService, empresaService (capa reemplazable por API)
├── context/              AuthContext
├── hooks/                useAuth, useMenu
├── types/                interfaces TypeScript
├── data/                 usuarios.json, empresas.json (datos temporales)
├── utils/                session.ts (persistencia de sesión)
├── App.tsx
└── main.tsx
```

## Próximas fases (no incluido aún)

- Reemplazar `src/data/*.json` por llamadas reales a una API REST y base de
  datos.
- CRUD real de usuarios (por ahora la pantalla de Usuarios es de solo
  lectura).
- Integración de mapa real, gráficos y reportes.
