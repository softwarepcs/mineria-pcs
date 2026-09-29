# Lista de Tareas Atómicas - Migración a Backend Real

## UI / Frontend (Blockers y Correcciones Críticas)
- [ ] Extraer el arreglo real de `{ data, meta }` en `usuarioService.ts`.
- [ ] Proteger estado y listas de `maquinarias` con `data.map` de fallos catastróficos en `MotorPrincipal`.
- [ ] Modificar interceptor en `apiClient.ts` para no disparar redirect 401 en la ruta `/login`.
- [ ] Mapear el mensaje real del servidor `error.response?.data?.message` al login.
- [ ] Enlazar `roles` reales del backend (`string[]` -> `Administrador`) y erradicar el hardcode `1 | 2 | 3`.
- [ ] Corregir endpoint de `Configuracion.tsx` hacia `PATCH /maquinarias/:id/configuracion`.
- [ ] Configurar `.env` para `VITE_API_URL` en vez de usar `http://localhost:3000`.

## UI / Abstracciones y Cleanup
- [ ] Borrar archivo expuesto `usuarios.json` que contiene credenciales base de datos `admin123`.
- [ ] Eliminar los 6 directorios `/monitoreo` de barcos y otros archivos muertos.
- [ ] Escapar HTML (XSS prevention) en popups `bindPopup` de mapas (`GeocercasView`, `CamionesListaView`).
- [ ] Extraer `useLeafletMap()` para no instanciar manualmente el DOM del mapa en 4 lugares.
- [ ] Eliminar fallback mockups de Mantenimiento y KPI (rendimiento falso en dashboard).
- [ ] Redirigir la carga de Operadores a los endpoints reales (`GET/POST /operadores`) en lugar del json en memoria.

## Infrastructure
- [ ] Integrar un Error Boundary global o usar `createBrowserRouter` para atrapar renders asíncronos fallidos.
- [ ] Parsear fechas de filtros a ISO (`-05:00`) antes de enviar al motor de consultas.
- [ ] Combinar sesión JWT en un único storage para evitar inconsistencias entre `sessionStorage` y `localStorage`.
