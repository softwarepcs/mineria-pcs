# Requerimientos — Frontend (`mineria-pcs`)

## 1. Contexto y Stack Tecnológico
- **Aplicación:** Panel web multiempresa de monitoreo de flota y combustible (`RIGEL TELEMATICS` / `EDGE SMART`).
- **Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4, TanStack Query v5, Zustand (sesión), Leaflet, SheetJS (`xlsx`).

## 2. Reglas de Validación en Módulo Base de Datos
- **Consulta y Mapa (`src/features/baseDatos/components/ConsultaView.tsx`):**
  - Solo permite visualizar recorrido y lecturas con una antigüedad **no mayor a 1 mes hacia atrás** respecto a la fecha actual (`desde >= sumarMesesISO(hoy, -1)` y `hasta <= hoy`).
  - Restricción activa tanto en los atributos `min`/`max` de los selectores `<Input type="date">` como en la validación previa a ejecutar la consulta.
- **Exportar a Excel (`src/features/baseDatos/components/ExportarView.tsx`):**
  - Permite exportar lecturas históricas (hasta 18 meses de antigüedad) restringiendo la ventana seleccionada a un **rango máximo de 3 meses calendario** entre `desde` y `hasta` (`hasta <= sumarMesesISO(desde, 3)` y `hasta <= hoy`).
  - El botón de exportación se deshabilita y muestra un mensaje explícito cuando el rango supera los 3 meses, las fechas son inválidas o no hay camiones seleccionados.

## 3. Configuración de Alertas y Usuarios (Retiro Temporal de Correo y Destinatarios por Usuario)
- **Configuración › Alertas (`src/features/configuracion/components/TabAlertas.tsx`):**
  - Se retira de la interfaz y del contrato del cliente la opción `Correo` (`canalCorreo`), su leyenda de advertencia y la fila de conteo `Destinatarios`, dado que el envío por correo electrónico y la suscripción individual no se implementarán en esta etapa.
- **Configuración › Usuarios (`src/features/configuracion/components/TabUsuarios.tsx`):**
  - Se eliminan las columnas **Recibe consumo** (`recibeConsumo`) y **Recibe geocercas** (`recibeGeocerca`) de la tabla de usuarios de la empresa, dejando únicamente `Usuario`, `Rol`, `Estado` y `Último ingreso`.
  - Se conserva la tabla `usuario_alerta_pref` y la columna `alerta_config.canal_correo` en Backend/Base de Datos sin migraciones destructivas para una eventual implementación futura.

## 4. Homologación de Datos en Alertas de Geocerca (`AlertasView.tsx`)
- **Pantalla Alertas (`src/features/alertas/components/AlertasView.tsx`):**
  - Mostrar **Galones del día al momento** (`galonesDia`) tanto en `Geocerca · Entrada` como en `Geocerca · Salida`.
  - Mostrar **Km** recorridos dentro de la geocerca con 1 decimal y subtítulo `"en la geocerca"` en la fila `Geocerca · Salida` (y `"al salir"` cuando el camión aún sigue dentro en una `Entrada` abierta).
  - Mostrar las **coordenadas GPS** debajo de `"Qué pasó"` junto al detalle temporal (ej. `Estuvo dentro 34 min · -34.72261, -58.28239`).

