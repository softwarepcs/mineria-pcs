# Diseño Arquitectónico — Frontend (`mineria-pcs`)

## 1. Arquitectura General
- **Estructura por Dominios (`src/features/<dominio>/`):**
  - `api.ts`: contratos HTTP tipados sobre `src/shared/api/client.ts` (Axios + renovación JWT).
  - `hooks.ts`: consultas y mutaciones con TanStack Query.
  - `components/`: vistas y modales desacoplados usando `src/shared/ui/`.
- **Sistema Visual:** Tema oscuro (`#02111C` / `#071623`), acento `#2BC4E8`, tipografías `Barlow` y `Barlow Condensed`.

## 2. Cálculo y Validación de Ventanas de Fechas (`Base de Datos`)
- **Función pura `sumarMesesISO(iso: string, meses: number): string` en `src/shared/utils/formato.ts`:**
  - Opera sobre cadenas `YYYY-MM-DD` en calendario UTC sin desviaciones por huso horario ni horario de verano.
  - Ajusta automáticamente el día al último día válido del mes destino (ej. `2026-03-31` − 1 mes → `2026-02-28`).
- **`ConsultaView.tsx` (Antigüedad máxima: 1 mes):**
  - `hoy = hoyISO()`, `minimo = sumarMesesISO(hoy, -1)`.
  - Inputs acotados: `Desde` con `min={minimo}` y `max={hasta || hoy}`; `Hasta` con `min={desde || minimo}` y `max={hoy}`.
  - Validación bloqueante con mensaje claro si `desde < minimo`, `desde > hasta` o `hasta > hoy`.
- **`ExportarView.tsx` (Rango máximo: 3 meses):**
  - `hoy = hoyISO()`, `minimo = sumarMesesISO(hoy, -18)`.
  - Tope dinámico para `Hasta`: `maxHasta = desde ? min(sumarMesesISO(desde, 3), hoy) : hoy`.
  - Validación reactiva `hasta > sumarMesesISO(desde, 3)` que bloquea la descarga y notifica `"El rango máximo de exportación es de 3 meses."`.

## 3. Retiro de Canal `Correo` y Preferencias de Recepción por Usuario (`Configuración`)
- **Decisión Arquitectónica (Solo Frontend, esquema BD intacto):**
  - **Base de datos y Backend (`backend-maquinarias`):** `AlertaConfig.canalCorreo` y `UsuarioAlertaPref` permanecen intactos en `prisma/schema.prisma` sin migraciones destructivas.
  - **Frontend (`mineria-pcs`):**
    - `src/features/configuracion/components/TabUsuarios.tsx`: eliminar las columnas `Recibe consumo` y `Recibe geocercas`, la mutación `useGuardarDestinatario`, el manejador `cambiar`, y ajustar `minWidth` de `DataTable` a `560px`.
    - `src/features/configuracion/components/TabAlertas.tsx`: trasladar el componente `Interruptor` localmente (al dejar de utilizarse en `TabUsuarios.tsx`) y retirar la fila `Destinatarios (X usuarios)`.
    - `src/features/alertas/api.ts`: retirar `destinatarios` de `TipoConfig`, `recibeConsumo` y `recibeGeocerca` de `UsuarioAviso`, y eliminar `guardarDestinatario`.
    - `src/features/alertas/hooks.ts`: eliminar `useGuardarDestinatario` e importación de `guardarDestinatario`.

## 4. Visualización de Métricas y Coordenadas en Filas de Geocerca (`AlertasView.tsx`)
- En `filasGeocerca` (`src/features/alertas/components/AlertasView.tsx`):
  - Formatear `km` con 1 decimal (`num(e.km, 1)`) para mantener la misma precisión que Consumo (`2.2`).
  - Ajustar `notaKm`: `"en la geocerca"` en `SALIDA` cuando `e.km !== null`, `"al salir"` cuando el camión permanece dentro (`ultimo.tipoEvento === "ENTRADA"`), y `""` en la fila `ENTRADA` histórica asociada a una `SALIDA`.
  - Concatenar las coordenadas (`latitud`, `longitud`) al subtítulo `donde` cuando estén presentes (`detalle · -34.72261, -58.28239`).

