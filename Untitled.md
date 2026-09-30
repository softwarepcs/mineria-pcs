# Revisión completa del frontend — Transchemical

Sep 29, 2026 · @PCS TEAM

El frontend compila y el build pasa, pero tiene 14 errores que rompen funcionalidad, muchas pantallas muestran datos inventados como si fueran reales, y la carpeta features/ reorganiza archivos sin separar todavía datos, lógica y vista.

## Prioridades

Corregir en este orden. Los tres primeros puntos hacen que el sistema guarde datos incorrectos o no llegue a recibir telemetría.

1. **Registro de camiones sin dispositivo.** Dar de alta una unidad desde la web nunca la conecta a su FMC125, porque el backend no tiene endpoints de dispositivos. Además, el modal envía el alta dos veces.
2. **Guardados que fallan o guardan mal.** Crear operador siempre da 400, Configuración queda en blanco, las geocercas de tipo línea se guardan como círculo, y geocercas y camiones van a la sede 1.
3. **Datos inventados.** Detalle de operador, detalle de camión, lista de camiones y geocercas muestran cifras, nombres y rutas fijas como si fueran reales.
4. **Errores de interfaz.** Geocercas abre con el panel vacío, el mapa de flota no dibuja las unidades al cargar y la lista de empresas muestra el estado vacío.
5. **Seguridad.** Seis puntos de HTML sin escapar en los mapas, y la caché de consultas no se limpia al cerrar sesión.
6. **Arquitectura.** Completar features/ con api.ts y hooks.ts, crear shared/ y quitar los 5 @ts-nocheck.

## Errores que rompen funcionalidad

Son 14. Los marcados con “verificado” se reprodujeron: el payload de operador y la configuración con el ValidationPipe real del backend, y el mapa de flota ejecutando el componente en jsdom. El resto se confirmó leyendo el código o con el compilador tras quitar los @ts-nocheck.

| # | Archivo : línea | Qué pasa | Corrección |
| --- | --- | --- | --- |
| 1 | features/camiones/.../CrearCamionModal.tsx : 74–78 | Llama a onSave(newTruck) dos veces: cada alta dispara dos POST /maquinarias; el segundo choca por identificador duplicado (409) y muestra error después de guardar. | Borrar el segundo onSave + onClose. |
| 2 | features/geocercas/components/GeocercasView.tsx : 94 | La pestaña inicial es "lista", pero solo se renderizan "geocercas" y "grupos" (líneas 828 y 843): el panel abre vacío. El botón Grupos usa un valor que ya no es del tipo. | Volver a "geocercas" \| "grupos" con "geocercas" por defecto. |
| 3 | GeocercasView.tsx : 236 (usado en 595, 614, 693) | setGeocercas ya no existe (la lista viene de useQuery). Activar y borrar fallan antes de llamar a la API; guardar sí guarda, pero luego muestra “Error al guardar”, y reintentar duplica. | useMutation + invalidateQueries(\['geocercas'\]); borrar updateGeocercasAndSave. |
| 4 | services/geocercaService.ts : 40 | Todo lo que no es polígono se envía como CIRCULO: una línea dibujada se guarda como círculo. El backend solo acepta POLIGONO y CIRCULO. | Quitar "línea" de la UI, o agregar LINEA al backend primero. |
| 5 | geocercaService.ts : 37 y CamionesListaView.tsx : 449–450 | sedeId = empresaId \|\| 1 (usa el id de empresa como sede) y empresa.sedes?.\[0\]?.id \|\| 1 (Empresa no tiene sedes): siempre sede 1 y tipoMaquinariaId 1. Un SuperAdmin crea en la sede de otra empresa. | Selects con GET /empresas/:id/sedes y GET /maquinarias/tipos; sin valores por defecto. |
| 6 | features/operadores/components/OperadoresView.tsx : 180–191 | Envía nombres, apellidos, email, estado, tipoDocumentoId; el DTO exige nombre. Verificado: 400 “nombre should not be empty”. Una fecha vacía también da 400. | Enviar nombre, legajo, estadoLicencia, licenciaVencimiento, maquinariaId; undefined en vez de "". |
| 7 | pages/Configuracion/Configuracion.tsx : 20 | setMaquinarias(res.data) guarda { data, meta }; maquinarias.map (línea 99) lanza TypeError: pantalla en blanco. Si falla la carga, queda en “Cargando…”. | Usar getMaquinarias() y manejar el error. |
| 8 | Configuracion.tsx : 41–43 | Prisma envía los Decimal como texto ("40"); guardar sin editar envía texto. Verificado: 400 “must be a number”. | Number(data.objetivoFlotaL100km) al cargar. |
| 9 | features/flota/components/FlotaMap.tsx : 92 y 110 | Los efectos que dibujan no incluyen mapInstance en sus dependencias. Verificado: con el mapa listo se dibujan 0 de 2 unidades; aparecen solo al seleccionar una. | Agregar mapInstance a ambos arreglos de dependencias. |
| 10 | pages/Empresas/Empresas.tsx : 52–59 | Compara estado con "activa", pero el backend envía un booleano: todas quedan en rojo y la etiqueta sale vacía (React no muestra booleanos). | estado ? "Activa" : "Inactiva", como en Dashboard.tsx : 73. |
| 11 | hooks/useLeafletMap.ts : 54 y 91 | El setTimeout no se cancela: con StrictMode llama a invalidateSize sobre un mapa ya eliminado. Devuelve mapRef.current, que es null en el primer render. | Guardar el mapa en useState y hacer clearTimeout en la limpieza. |
| 12 | features/operadores/components/OperadorDetalleView.tsx : 276–286 | “Guardar” en el modal de edición solo cambia el estado local; nunca llama a PATCH /operadores/:id. Al recargar vuelve lo anterior. | useMutation con actualizarOperador. |
| 13 | features/camiones/components/CamionesDetalleView.tsx : 18 y 146 | El selector Hoy / 7 días / 30 días no cambia ningún número: periodo no participa del cálculo. | Pedir los datos del período al backend. |
| 14 | features/motor/components/MotorPrincipal.tsx : 287–291 | El CSV se arma como data URI con encodeURI, que no codifica "#": un "#" en cualquier valor corta el archivo. Los valores no se entrecomillan. | new Blob + URL.createObjectURL y comillas en cada campo. |

## Datos inventados mostrados como reales

En una plataforma de monitoreo, un valor de relleno se lee como medición. La regla: si el backend no entrega el dato, se muestra “sin dato” y no se dibuja nada.

| Archivo : línea | Qué se inventa |
| --- | --- |
| OperadorDetalleView.tsx : 38–73 | 34 puntos fijos del gráfico de índice, todos del camión “TC-TRUCK-08”, de agosto a septiembre. |
| OperadorDetalleView.tsx : 126–145 | KPIs con valores por defecto (8.426 km, 180 h, 42 viajes, 33,8 L/100 km) que se escalan con factores fijos (alrededor de ×2,7 y ×10,6) al cambiar a 90 días o año. |
| OperadorDetalleView.tsx : 148–177 | Cuatro documentos con códigos armados con el legajo (LNC-AR-, ART-55, PSI-88, HAZ-19) y estados fijos (“VENCE EN 24 DÍAS”, “VENCIDA”). |
| OperadorDetalleView.tsx : 180–238 | Historial de asignaciones y alertas atribuidas fijos. El backend ya tiene GET /operadores/:id/rendimiento y GET /alertas/operador/:id. |
| OperadorDetalleView.tsx : 78 y 323 | Si falta el id en la URL usa "op-1"; fecha de ingreso por defecto "2023-04-12". |
| CamionesListaView.tsx : 89–137 | Por unidad: velocidad, caudal, batería, turno, viajes, segundos desde el último dato e historial de caudal, calculados con el índice de la fila. |
| CamionesListaView.tsx : 141 | Si la empresa no tiene máquinas, carga DEFAULT\_CAMIONES (unidades de prueba). |
| CamionesListaView.tsx : 98–99 y 296 | Sin posición real, coordenadas y centro del mapa en Buenos Aires. |
| CamionesListaView.tsx : 224 | El filtro “con alerta” es desvío mayor a 10 %, no las alertas del backend. |
| CamionesDetalleView.tsx : 93 y 131 | Si no encuentra el operador asigna uno cualquiera de la lista; si no hay, muestra “Carlos Méndez”. |
| CamionesDetalleView.tsx : 95–99 | Modelo, tipo de carga y patente (“AC 8n7 TR”) generados. |
| CamionesDetalleView.tsx : 111–121 | Valores por defecto (desvío 12,8 %, 8.426 h, 245 L/día). CO₂ con factor fijo 0,0225 t/L: 8,4 veces el 2,68 kg/L configurado por máquina en el backend. |
| CamionesDetalleView.tsx : 149–156 | Cinco viajes fijos entre Buenos Aires, La Plata, Campana y Zárate, con conductores inventados. |
| CamionesPanelDetalle.tsx : 313 | El botón de recorrido histórico solo muestra un alert(). |
| CrearCamionModal.tsx : 58 y 63–64 | Rendimiento 34,5 L/100 km y posición aleatoria en Buenos Aires para la unidad nueva. |
| GeocercasView.tsx : 102–121 | El formulario abre precargado con “Avenida Central España, Panamá”, sus coordenadas, radio de 3.475 m y recurso “rigel\_teste\_mgr”. |
| GeocercasView.tsx : 154–205 y 292 | Sin máquinas, tres camiones de demo en Panamá; mapa centrado en Panamá. |
| GeocercasView.tsx : 217–231 | Área del polígono = puntos × π × 50.000 / 10.000 y perímetro = puntos × 1,5 km: dependen solo de cuántos puntos hay, no de la forma. |
| hooks/useLeafletMap.ts : 30 | Centro por defecto en Vaca Muerta (Argentina) dentro de un hook genérico. |
| services/empresaService.ts : 31 | Indicadores en 0 para todas las empresas: Dashboard muestra siempre 0 unidades y 0 alertas. |
| FlotaKpis.tsx : 125 | CO₂ por máquina recalculado con 2,68 fijo, aunque el backend ya envía co2Ton por máquina. |

Para el área real de un polígono se usa la fórmula del agrimensor sobre coordenadas proyectadas; para el perímetro, la suma de distancias haversine entre vértices (ya existe getDistanceMeters en GeocercasView.tsx : 78).

## Brechas con el backend

La interfaz ofrece funciones que la API no soporta. Hay que decidir en cada caso si se agrega el endpoint o se quita la función de la pantalla.

| Función en la UI | Qué falta en el backend | Consecuencia |
| --- | --- | --- |
| Registrar unidad con IMEI, tipo de dispositivo, contraseña y teléfono (CrearCamionModal.tsx : 17–24) | No hay endpoints de dispositivo ni de asignación dispositivo → maquinaria\_sistema. El IMEI termina como identificador de la maquinaria. | El ingestor Go descarta toda lectura de un IMEI sin asignación activa: una unidad dada de alta desde la web nunca recibe telemetría. |
| Reconocer alerta (AlertasView.tsx : 263) | No hay endpoint para cambiar alerta\_evento.estado. | El reconocimiento vive en un Set local y se pierde al recargar. |
| Geocercas de tipo línea | El DTO solo acepta POLIGONO y CIRCULO. | Se guardan como círculo (error 4). |
| Ícono, grupo, color del nombre, tamaño de fuente, visibilidad por zoom de la geocerca | No existen columnas para esos campos. | Se pierden al guardar; el mapeador (geocercaService.ts : 12–30) los rellena con valores fijos al leer. |
| Km, horas, índice y conducción brusca en la lista de operadores | GET /operadores no los devuelve. El modal de alta pide cargarlos a mano. | Columnas siempre vacías. Son métricas de telemetría: deben calcularse, no escribirse. |

Endpoints que ya existen y la UI no usa: /maquinarias/monitoreo (estado en vivo), /operadores/:id/rendimiento, /operadores/:id/asignar-maquinaria, /alertas/geocercas, /geocercas/:id/alertas, /empresas/:id/sedes y los CRUD de sedes, maquinarias y usuarios.

## Formularios frente al backend

Del alta de unidad solo 2 de sus 18 controles llegan al backend, y en el campo equivocado; del formulario de geocerca se guardan 7 de 15. Revisado contra la versión del backend del 29 de septiembre; los payloads se pasaron por su ValidationPipe real.

### Alta de unidad (CrearCamionModal)

El backend acepta: identificador, sedeId, tipoMaquinariaId, marca, modelo, estadoOperativo.

| Campo | ¿Se guarda? | Qué hacer |
| --- | --- | --- |
| Nombre (obligatorio) | No se envía: identificador sale del “ID único” o de un código generado | Enviarlo como identificador |
| Tipo de unidad | Llega como modelo (“Camión”) | Select de GET /maquinarias/tipos → tipoMaquinariaId |
| Tipo de dispositivo | No | Mover al formulario de dispositivo |
| Dirección del servidor | No | Quitar: se configura en el FMC125 |
| ID único (IMEI) | Se guarda como identificador de la máquina | Mover al formulario de dispositivo (dispositivo.imei) |
| Número de teléfono (2 campos) | No, no hay columna | Quitar, o agregar columna si se necesita el número de la SIM |
| Contraseña | No | Quitar: con certificados mTLS el equipo no usa contraseña |
| Creador | No | Quitar: el backend lo sabe por el JWT |
| Cuenta | No | Quitar |
| Contador de km (fuente, valor, automático) | No | Quitar: sale de la telemetría |
| Contador de horas (fuente, valor, automático) | No | Quitar |
| Contador GPRS (valor, automático) | No | Quitar |

Faltan: Sede (select de GET /empresas/:id/sedes; hoy siempre 1), Tipo de maquinaria (hoy siempre 1), Marca, Modelo real y Estado operativo. El formulario queda en 6 campos.

El IMEI y el tipo de dispositivo pertenecen al FMC125, no a la máquina, y el backend no tiene endpoints de dispositivo. Hace falta un formulario aparte, “Instalar dispositivo” (IMEI + modelo), que cree el dispositivo y su asignación a maquinaria\_sistema.

### Alta de operador (OperadoresView)

El backend acepta: nombre, legajo, estadoLicencia, licenciaVencimiento, maquinariaId, sedeId, atribucion.

| Campo | ¿Se guarda? | Qué hacer |
| --- | --- | --- |
| Nombre completo | No: se envía como nombres + apellidos; el DTO exige nombre | Enviar nombre |
| Legajo | Sí | Mantener |
| Vehículo asignado | Sí | Mantener |
| Estado (Activo / De licencia / Inactivo) | No: se envía estado; el DTO espera estadoLicencia (VIGENTE o SUSPENDIDA) | Cambiar a Vigente / Suspendida, o ampliar el DTO para DE\_LICENCIA |
| Vencimiento de licencia | Sí | Mantener |
| KM del período, Horas, Índice, Conducción brusca | No | Quitar: son métricas de telemetría |
| Atribución (obligatorio) | No: se pide pero no se envía | Agregarlo al payload (se guarda en la asignación, solo si hay vehículo) |

El payload agrega además email op-\<timestamp>@test.com, tipoDocumentoId 1 y numeroDocumento, que el backend descarta. Faltan: Sede, número y categoría de licencia (hoy el backend inventa LIC-\<timestamp> y “General” aunque la tabla licencia tiene esas columnas).

Validado: el payload actual da 400 “nombre should not be empty”; { nombre, legajo, estadoLicencia, licenciaVencimiento, sedeId, atribucion } pasa.

### Edición de operador (OperadorDetalleView)

Guardar no llama al backend; solo cambia el estado local. El update del backend aplica nombre, legajo y estado y vencimiento de licencia.

| Campo | Qué hacer |
| --- | --- |
| Nombre, Legajo | Mantener y conectar a PATCH /operadores/:id |
| Base (texto libre) | Select de sedes; el backend debe aplicar sedeId en el update, que hoy ignora |
| Estado: opción “Sin asignar” | Quitar: se deriva de si tiene vehículo |

### Geocerca (GeocercaForm)

El backend acepta: sedeId (obligatorio), nombre, descripcion, tipo (POLIGONO o CIRCULO), color, radio, coordenadas, fechaInicio, fechaExpiracion, activa.

| Campo | ¿Se guarda? | Qué hacer |
| --- | --- | --- |
| Nombre, Descripción, Color, Radio, Latitud/Longitud, puntos | Sí | Mantener |
| Tipo: Línea | Se guarda como CIRCULO | Quitar la opción, o agregar LINEA al backend |
| Color del nombre, Tamaño de fuente | No | Quitar, o agregar columnas |
| Recurso (opciones fijas) | No | Reemplazar por Sede (sedeId); hoy se envía empresaId \|\| 1 |
| Grupo (opciones fijas) | No | Quitar hasta que exista un modelo de grupos |
| Ícono | No | Quitar, o agregar columna |
| Color visible | No | Quitar |
| Visibilidad por zoom (de / a) | No | Quitar, o guardarlo como preferencia de la interfaz |
| Área y perímetro (solo lectura) | No (correcto) | Mantener con la fórmula real |

Faltan: Sede y vigencia (fechaInicio, fechaExpiracion), que el backend ya soporta.

Error: services/geocercaService.ts : 36–49 siempre arma tipo y coordenadas, aunque cambie un solo campo. Validado: desactivar envía { sedeId: 1, tipo: CIRCULO, coordenadas: {}, activa: false } y el backend lo acepta y lo aplica, así que un polígono desactivado pasa a círculo sin coordenadas. Hoy no ocurre porque el botón falla antes (setGeocercas); al corregir eso, empezará a borrar geometrías. En un PATCH el mapeador debe enviar solo los campos presentes.

GeocercaForm recibe 36 props tipadas como any: conviene un objeto de valores + onChange, o un hook useGeocercaForm.

### Configuración y Login

- Configuración: los 3 campos coinciden con el DTO. Solo falta convertir a número al cargar.
- Login: la etiqueta dice “Usuario o Correo”, pero el backend exige un email válido. Cambiarla a “Correo”.

## Seguridad

Los permisos reales los aplica el backend, así que ninguno de estos puntos permite leer datos de otra empresa desde la API. El riesgo está en el navegador: el token vive en localStorage, y un script inyectado en un popup puede leerlo.

| Archivo : línea | Problema | Corrección |
| --- | --- | --- |
| GeocercasView.tsx : 512–513 | truck.placa y truck.estado sin escapar en el popup. La placa la escribe un Administrador. | escapeHtml en ambos. |
| CamionesListaView.tsx : 408 | truck.placa sin escapar dentro del HTML del marcador. | escapeHtml. |
| GeocercasView.tsx : 448 | La descripción en el popup de vista previa sin escapar; al editar una geocerca ajena, la escribió otro usuario. | escapeHtml. |
| GeocercasView.tsx : 371 y 442 | El color de la geocerca va sin validar dentro de un atributo style. | Aceptar solo #RRGGBB con una expresión regular. |
| MotorPrincipal.tsx : 260–261 | Fecha, velocidad y RPM del payload de telemetría sin escapar. Riesgo bajo: los escribe el ingestor. | escapeHtml igual, por consistencia. |
| main.tsx : 9–17 y store/authStore.ts : 41–45 | La caché de TanStack Query dura 5 minutos y el logout no la limpia; las claves no incluyen empresa (\['operadores'\], \['geocercas'\]). Otro usuario en la misma pestaña ve los datos del anterior. | queryClient.clear() al cerrar sesión y empresaId en cada queryKey. |
| services/authService.ts : 22 | Los roles se reducen a 1, 2 o 3. El Administrador queda como rol 2 con verTodasLasEmpresas; el Gerente como rol 3. | Guardar rolesBackend y derivar permisos con la misma matriz que el backend. |
| AdministracionMenu.tsx : 20 y App.tsx : 91 | El menú muestra “Métricas y Metas” solo al rol 1, pero la ruta permite roles 1 y 2. La lógica de permisos está repartida en 10 archivos, y hooks/useMenu.ts no se usa. | Un solo módulo auth/permisos.ts consultado por menú, rutas y botones. |

Al desplegar, agregar una Content-Security-Policy que solo permita la API y los servidores de mapas: es la segunda barrera si se escapa un popup.

## Reutilización de código

useLeafletMap es el primer paso bien encaminado: FlotaMap y MotorPrincipal perdieron 79 líneas cada uno. El resto de la duplicación sigue igual y crece (alert/confirm pasó de 7 a 14).

| Qué se repite | Dónde | Extraer como |
| --- | --- | --- |
| Creación del mapa con L.map y capas OSM/satélite | GeocercasView.tsx : 286–345, CamionesListaView.tsx : 290–320 | useLeafletMap (ya existe) |
| Pantalla completa (fullscreenchange + requestFullscreen) | 4 archivos | useFullscreen(ref) |
| ResizeObserver + invalidateSize | GeocercasView, CamionesListaView, useLeafletMap | Solo dentro de useLeafletMap |
| Modales con fixed inset-0 | 8, en 7 archivos | Modal con cierre por Esc y foco |
| Spinner de carga | 5 copias | Spinner y LoadingState |
| alert() y confirm() | 14 | Toast y ConfirmDialog |
| Gráficos SVG hechos a mano | AlertasView.tsx : 46 (MiniChart), OperadorDetalleView (dispersión), FlotaDesvioChart | Una librería de gráficos o primitivas comunes (ejes, escala, tooltip) |
| Catálogo de íconos de geocerca | IconPickerModal.tsx : 10 (AVAILABLE\_ICONS) y GeocercasView.tsx : 49 (switch) | Un solo mapa id → componente, usado por ambos |
| Estilo por estado del operador | OperadoresView.tsx : 344–346 (tabla) y 439–441 (tarjetas) | ESTADO\_OPERADOR: Record con etiqueta y clases |
| Tipo Operador | services/operadorService.ts, OperadoresView.tsx : 9, OperadorDetalleView | Un tipo en features/operadores/api.ts igual al DTO |
| Colores escritos a mano | 579 usos, 96 colores distintos | Tokens en el tema de Tailwind |
| Estilos en línea (style={{…}}) | 55 | Clases de Tailwind |

Tres ubicaciones que confunden al que llega nuevo: escapeHtml vive dentro de hooks/useLeafletMap.ts (quien solo necesita escapar texto importa Leaflet y su CSS); el tipo CamionUnidad vive en data/camionesData.ts junto a los datos de prueba; y las funciones de área y perímetro viven en data/geocercasData.ts. Las tres van a shared/utils o al api.ts del feature.

Los estilos usan tres sistemas a la vez: Tailwind, 4 archivos CSS (937 líneas, con 56 clases .mp- de Motor y Flota en el index.css global) y style={{…}}. Conviene quedarse con Tailwind.

## Creación de componentes

Ocho componentes concentran 5.800 de las 10.844 líneas. Referencia práctica: pasado de unas 200 líneas o 6 useState, el componente ya hace más de una cosa.

| Componente | Líneas | useState | useEffect | Qué mezcla |
| --- | --- | --- | --- | --- |
| GeocercasView | 1.429 | 27 | 9 | Formulario, lista con filtros, mapa, capas, cálculos geométricos, guardado |
| OperadorDetalleView | 912 | 7 | 3 | Carga, KPIs, documentos, gráfico, historial, alertas, modal de edición |
| CamionesListaView | 669 | 13 | 10 | Construcción de datos, filtros, mapa, marcadores, geocercas, alta, pantalla completa |
| CamionesDetalleView | 650 | 2 | 0 | Construcción de datos y toda la vista |
| MotorPrincipal | 622 | 11 | 4 | Consulta, tabla paginada, mapa de ruta, exportación CSV |
| AlertasView | 553 | 7 | 3 | Carga, mapeo, lista, detalle, gráfico |
| OperadoresView | 515 | 13 | 1 | Carga, alta, filtros, tabla y tarjetas con la misma lógica duplicada |
| CrearCamionModal | 427 | 19 | 0 | Formulario con 19 campos, la mayoría sin uso |

**Lo que está bien hecho y conviene copiar:**

- FlotaHome compone cuatro piezas que reciben datos por props y comparten solo selectedId. Es el mejor ejemplo del proyecto.
- FlotaTable se reutiliza dos veces con la prop mode ("alerts" y "full") en vez de duplicarse.
- CamionesPanelDetalle y CamionesListSide son presentacionales: reciben datos y callbacks, no piden nada al backend.

**Lo que parece separado pero no lo está:** CamionesMapa recibe 9 props de control (mapWrapperRef, mapContainerRef, isFullscreen, toggleFullscreen, capaMapa, setCapaMapa, vistaMovil…), pero no maneja el mapa: lo crea el padre en CamionesListaView.tsx : 290. Debería recibir datos (camiones, seleccionado, onSeleccionar) y usar useLeafletMap y useFullscreen por dentro.

**Cómo partir GeocercasView:**

```
features/geocercas/
  GeocercasPage.tsx          compone todo (~60 líneas)
  components/
    GeocercasPanel.tsx       pestañas + lista + formulario
    GeocercaLista.tsx        filtros, activar, eliminar
    GeocercaForm.tsx         nombre, color, tipo, radio, puntos
    GeocercasMapa.tsx        dibuja geocercas y unidades (usa useLeafletMap)
  hooks/
    useGeocercas.ts          useQuery + mutaciones
    useGeocercaForm.ts       estado y validación del formulario
  utils/geometria.ts         área, perímetro, punto dentro de polígono
```

## Principios SOLID

El más incumplido es la responsabilidad única; los demás fallan como consecuencia.

| Principio | Hallazgo | Qué hacer |
| --- | --- | --- |
| S — Responsabilidad única | CamionesListaView pide datos, inventa campos, combina API con localStorage, crea el mapa, maneja pantalla completa y dibuja lista, panel y modal. | Un hook de datos, un hook de mapa y componentes que solo pintan. |
| O — Abierto a extensión | Estados, colores y etiquetas en if/else repetidos (OperadoresView.tsx : 344 y 439; CamionesDetalleView.tsx : 102–109). Agregar un estado obliga a tocar varios archivos. | Un Record por dominio: ESTADO\_MAQUINARIA, ESTADO\_OPERADOR. |
| L — Sustitución | Los mapeadores devuelven formas “casi iguales” con relleno (lat 0, “Carlos Méndez”, nombreColor fijo). Un Operador o una Geocerca no significan lo mismo en todos los componentes. | Un tipo por entidad igual al DTO del backend; null cuando no hay dato. |
| I — Interfaces pequeñas | Componentes que reciben empresa entera para usar flota.maquinarias; CamionesMapa con 9 props de control. | Pasar solo lo que el componente usa. |
| D — Depender de abstracciones | 9 componentes importan services/ directo y 6 llaman a useQuery dentro del componente. | La vista depende de useOperadores() o useGeocercas(); el hook depende de api.ts. |

## Arquitectura propuesta

Hoy features/ solo contiene components/; servicios, tipos, store y hooks siguen en carpetas globales, así que cada módulo depende de cinco lugares. La meta es que cada módulo sea autocontenido y que lo común viva en shared/.

```
src/
  app/            App.tsx, router, QueryClientProvider
  auth/           sesión, permisos.ts (matriz única de roles), guards de ruta
  shared/
    api/          apiClient, tipo Paginado<T>, manejo de errores
    ui/           Modal, Spinner, EmptyState, ErrorState, ConfirmDialog, Toast
    map/          useLeafletMap, useFullscreen
    utils/        escapeHtml, fechas (America/Lima), formato
  features/
    operadores/
      api.ts      llamadas + tipos iguales al DTO del backend
      hooks.ts    useOperadores(empresaId), useCrearOperador()
      components/ OperadoresTabla, OperadorForm, OperadoresResumen
      OperadoresPage.tsx
    geocercas/ camiones/ flota/ alertas/ telemetria/ empresas/ usuarios/
```

Reglas de dependencia:

1. Un componente solo importa hooks de su feature y piezas de shared/; nunca apiClient ni services/.
2. Solo api.ts habla con el backend; solo hooks.ts usa TanStack Query.
3. Un feature no importa otro feature; lo que compartan sube a shared/.
4. Cada queryKey incluye la empresa: \['operadores', empresaId\].
5. Sin @ts-nocheck: los 5 actuales ocultan 16 errores de tipos, incluidos los errores 2, 3 y 5 de este informe.

Para borrar: features/monitoreo/ (6 vistas de barcos que ninguna ruta usa), data/alertasData.json, data/monitoreoData.json, hooks/useMenu.ts y los DEFAULT\_ de datos de prueba. En index.html, cambiar lang="en" a lang="es".

## Plan de trabajo

**Etapa 1 — Errores (1 a 2 días)**

- [ ] Quitar el segundo onSave en CrearCamionModal
- [ ] Pestaña inicial de Geocercas y mutaciones con invalidateQueries
- [ ] Payload de operador según el DTO
- [ ] Configuración: getMaquinarias() y conversión de decimales
- [ ] mapInstance en las dependencias de FlotaMap
- [ ] Estado booleano en Empresas.tsx
- [ ] Quitar la opción de línea en Geocercas hasta que el backend la soporte
- [ ] Escapar los 6 puntos de HTML y limpiar la caché al cerrar sesión

**Etapa 2 — Backend y datos reales**

- [ ] Endpoints de dispositivo y asignación dispositivo → maquinaria\_sistema; conectar el alta de unidades
- [ ] Endpoint para cambiar el estado de una alerta
- [ ] Selects de sede y tipo de maquinaria
- [ ] Detalle de operador con /operadores/:id/rendimiento y /alertas/operador/:id
- [ ] Borrar todos los valores de relleno de la sección de datos inventados

**Etapa 3 — Base compartida**

- [ ] shared/: Modal, Spinner, EmptyState, ErrorState, ConfirmDialog, Toast
- [ ] useLeafletMap corregido y useFullscreen; migrar GeocercasView y CamionesListaView
- [ ] auth/permisos.ts con la matriz de roles del backend
- [ ] Tokens de color en Tailwind

**Etapa 4 — Módulos**

- [ ] Operadores como plantilla: api.ts, hooks.ts, componentes chicos, sin @ts-nocheck
- [ ] Replicar en Geocercas (partido como en Creación de componentes) y Camiones
- [ ] Tests con Vitest para hooks y permisos

## Alcance de la revisión

Se revisó la versión del frontend entregada el 29 de septiembre contra el backend de la misma fecha. Se revisó la lógica de todos los archivos de src/ (estado, efectos, llamadas y cálculos). El marcado JSX, las hojas de estilo y las 6 vistas de monitoreo sin uso se revisaron por patrones, no línea por línea.

- **Compilación:** tsc y build de Vite sin errores. Quitando los @ts-nocheck en una copia aparecen 16 errores de tipos (23 contando imports sin uso).
- **Contrato con el backend:** el payload de operador y el de configuración se pasaron por el ValidationPipe real del backend.
- **Ejecución:** FlotaMap se ejecutó en jsdom con Leaflet simulado para contar los marcadores dibujados.
- **Métricas:** tamaño, estado, efectos y duplicación medidos sobre todo src/.

No se probó en un navegador real ni con la base de datos cargada; conviene confirmar los errores 1 y 3 con la pestaña de red abierta.
