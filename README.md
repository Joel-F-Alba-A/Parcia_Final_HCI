# Opticalia Carbon Design

Proyecto React/Vite para redisenar el dashboard de Opticalia con patrones y componentes de IBM Carbon Design System.

Fase actual: resumen gerencial, anadir compra, CRM y campanas, gestion de clientes y gestion de compras.

## Aplicacion de Carbon Design

La interfaz toma Carbon como framework base: shell oscuro para navegacion, superficies claras para trabajo operativo, componentes nativos de `@carbon/react`, iconografia de `@carbon/icons-react`, escala de espaciado de 8 px, tipografia IBM Plex Sans y una capa propia de tokens `--ocd-*` reutilizada en el SCSS.

### Estructura

- `Header`: barra superior persistente con marca, sucursal y acciones globales.
- `SideNav`: navegacion principal en tema `g100`, icono mas texto y estado activo visible.
- `Content`: area clara `#f4f4f4`, con `Tile` blancos para KPIs, graficas, tablas y formularios.
- Reticula: separaciones de 16 px entre bloques y 32 px para respiracion de pagina.
- Confirmaciones destructivas: se usan `Modal danger` de Carbon, con fondo atenuado, en lugar de `alert` o `confirm`.

### Componentes Carbon usados

- Datos: `DataTable`, `Pagination`, `Search`, `Tag`.
- Formularios: `TextInput`, `TextArea`, `Select`, `Dropdown`, `DatePicker`, `DatePickerInput`.
- Acciones: `Button`, botones `ghost`, `tertiary`, `danger--ghost` y modales `danger`.
- Feedback: `InlineNotification`.
- Layout: `Tile`, `Header`, `SideNav`, `Content`.

## Sistema visual

### Tokens del proyecto

Los tokens viven en dos capas:

- `src/index.scss`: tokens CSS globales `--ocd-*` para layout, componentes, tablas, formularios, paneles y tags.
- `src/styles/tokens.ts`: tokens TypeScript para graficas Recharts, evitando colores duplicados dentro de los componentes.

Tokens principales:

- `--ocd-font-family`: IBM Plex Sans, usada por toda la aplicacion.
- `--ocd-color-gray-100` a `--ocd-color-gray-10`: shell, texto, tablas, fondos, bordes y paneles.
- `--ocd-color-blue-90`, `--ocd-color-blue-80`, `--ocd-color-blue-70`, `--ocd-color-blue-60`, `--ocd-color-blue-50`, `--ocd-color-blue-40`, `--ocd-color-blue-30`, `--ocd-color-blue-20`: acciones primarias, foco, graficas y segmentos de cliente.
- `--ocd-color-teal-70` y `--ocd-color-gray-70`: apoyos visuales secundarios y estados neutros fuera de la segmentacion principal.
- `--ocd-color-green-60`, `--ocd-color-yellow-30`, `--ocd-color-red-60`: estados Carbon para exito, advertencia y peligro.
- `--ocd-space-01` a `--ocd-space-07`: espaciado Carbon en pasos de 2, 4, 8, 12, 16, 24 y 32 px.
- `--ocd-type-label-01`, `--ocd-type-helper-01`, `--ocd-type-body-compact-01`, `--ocd-type-body-01`, `--ocd-type-heading-01`, `--ocd-type-heading-03`, `--ocd-type-heading-05`: escala tipografica Carbon aplicada a labels, ayudas, cuerpo, encabezados y titulos.
- `--ocd-layer`, `--ocd-layer-accent`, `--ocd-layer-hover`, `--ocd-background`: superficies reutilizadas en `Tile`, tablas, filas expandidas y fondos.

Componentes afectados por tokens: `Header`, `SideNav`, `Content`, `Tile`, `DataTable`, `Search`, `DatePicker`, `Tag`, `Button`, `Pagination`, paneles de edicion, detalle CRM, tarjetas KPI y graficas.

### Colores base

- Navegacion global: Carbon Gray 100 `#161616`, divisores `#393939`, texto secundario `#c6c6c6`.
- Fondo de trabajo: Gray 10 `#f4f4f4`.
- Superficies: White `#ffffff`.
- Texto principal: Gray 100 `#161616`.
- Texto secundario: Gray 70 `#525252` y Gray 60 `#6f6f6f`.
- Lineas y encabezados de tabla: Gray 20 `#e0e0e0`, Gray 30 `#c6c6c6`.

### Azules Carbon para graficas

Los graficos del resumen usan una rampa formal de azules Carbon:

- Blue 90 `#001d6c`
- Blue 80 `#002d9c`
- Blue 70 `#0043ce`
- Blue 60 `#0f62fe`
- Blue 50 `#4589ff`
- Blue 40 `#78a9ff`
- Blue 30 `#a6c8ff`
- Blue 20 `#d0e2ff`

Esto evita una lectura tipo arcoiris y mantiene coherencia IBM.

### Estados y alertas

- Error / eliminar: Red 60 `#da1e28`.
- Advertencia fuerte: Orange 50 `#ff832b`.
- Advertencia media: Yellow 30 `#f1c21b`.
- Exito / crecimiento: Green 60 `#24a148`.
- Accion primaria y foco: Blue 60 `#0f62fe`.

### Segmentacion de clientes

- VIP: Blue 90 `#001d6c`, texto blanco, peso 600.
- Fiel: Blue 70 `#0043ce`, texto blanco, peso 600.
- Normal: Blue 60 `#0f62fe`, texto blanco, peso 600.
- Los tags usan `--ocd-type-label-01`, radio de borde reducido y una silueta mas rectangular cercana al `Tag` empresarial de Carbon.

## Tipografia

- Familia: IBM Plex Sans.
- Titulo de pagina `h1`: `--ocd-type-heading-05`, 2 rem, peso 400, color `--ocd-color-gray-100`.
- Subtitulo de pagina: `--ocd-type-body-01`, 0.875 rem, color `--ocd-color-gray-70`.
- Encabezado de modulo o tile: `--ocd-type-heading-01`, 1 rem, peso 600.
- Texto de tablas, inputs y cuerpo compacto: `--ocd-type-body-compact-01`, 0.875 rem.
- Labels, ayudas, captions y etiquetas de graficas: `--ocd-type-label-01` / `--ocd-type-helper-01`, 0.75 rem.
- Valores KPI principales: `--ocd-type-heading-05`, 2 rem, peso 400.
- Metricas secundarias: `--ocd-type-heading-03`, 1.25 rem, peso 400.

### Tipografia por modulo

- Resumen gerencial: `h1` en heading 05, titulos de tiles en heading 01, valores KPI en heading 05, captions de graficas en helper 01 y etiquetas de barras/tortas en label 01.
- Anadir compra: secciones en heading 01, textos de ayuda en body compact 01, indices de productos en body compact 01 semibold.
- CRM y campanas: titulo en heading 05, tabla en body compact 01, detalle de usuario en label 01/body compact 01, preview de mensaje en body 01.
- Gestion de clientes: tabla e inputs en body compact 01, acciones Carbon `sm`, tags en label 01 semibold.
- Gestion de compras: tabla en body compact 01, panel de edicion con heading 01 y notas en body compact 01.

## Modulos

### Resumen gerencial

- Titulo: "Resumen gerencial".
- Componentes: `DatePicker`, `Dropdown`, `Button`, `Tile`, `DataTable`, `Search`, `Tag`.
- KPIs: ingresos totales, clientes base, ticket promedio y clientes VIP.
- Graficas: area de ingresos, barras de lentes, barras de monturas y tortas de segmentos usando azules Carbon.
- Etiquetas: las barras muestran valores a la derecha; las tortas muestran nombre y porcentaje.
- Filtros funcionales: el rango de fechas recalcula KPIs, graficas y tabla; `Limpiar filtros` limpia busqueda y fechas.
- Reporte funcional: `Exportar reporte` descarga un CSV con fecha, cliente, producto, lente, monto y segmento filtrado.

### Anadir compra

- Titulo: "Anadir compra".
- Componentes: `TextInput`, `TextArea`, `Button`, `Tile`, `InlineNotification`.
- Permite agregar varios elementos a una misma compra: producto, tipo de lente y costo por fila.
- El total se calcula automaticamente y el cliente se crea o actualiza por cedula/nombre.
- La segmentacion se recalcula segun numero de compras: Normal, Fiel o VIP.

### CRM y campanas

- Titulo: "CRM y campanas".
- Componentes: `Search`, `Select`, `Checkbox`, `Pagination`, `Button`, `Tag`, `TextInput`, `Tile`.
- La tabla permite filtrar por busqueda y segmento, seleccionar clientes y revisar detalle mediante un control discreto de expansion al inicio de la fila.
- La columna de accion visible fue eliminada para dar mas espacio a Cliente, Segmento y Compras.
- El detalle de cliente aparece como una seccion secundaria de fila expandida, sin alterar la informacion original del registro. Usa `--ocd-background`, `--ocd-layer`, borde neutro `--ocd-color-gray-20`, texto `label-01` y `body-compact-01`.
- La campana aplica divulgacion progresiva: se oculta cuando no hay clientes seleccionados y aparece debajo de la tabla solo al seleccionar uno o mas clientes.
- Cuando la campana aparece, muestra primero clientes seleccionados, tipo de campana y objetivo de campana.
- Mensajes predeterminados: seguimiento, revision prioritaria y renovacion.
- Inputs variables: beneficio/accion, vigencia y asesor/sede; la vista previa se genera automaticamente por cliente.
- Envio funcional: crea mensajes enviados en la base local de WhatsApp.

### Gestion de clientes

- Titulo: "Gestion de clientes".
- Componentes: `Search`, `Pagination`, `TextInput`, `Button`, `Tag`, `Modal danger`.
- Busqueda funcional por nombre, cedula o telefono.
- Edicion inline de nombre, cedula y telefono.
- Eliminacion con modal de confirmacion y fondo atenuado; elimina tambien compras asociadas.
- Tags de segmento usan escala de azules Carbon: VIP Blue 90, Fiel Blue 70, Normal Blue 60.

### Gestion de compras

- Titulo: "Gestion de compras".
- Componentes: `Search`, `Pagination`, `TextInput`, `TextArea`, `Button`, `Modal danger`.
- Busqueda funcional por cliente, cedula, producto o tipo de lente.
- Las notas no se muestran por defecto; solo se indica que existen mediante icono.
- Al editar, aparece un panel gris claro bajo la fila con producto, lente, costo, fecha y nota modificables.
- Eliminacion con modal Carbon `danger`, sin alertas del navegador.

## Datos y persistencia

- La base local se genera con datos sinteticos enriquecidos: alrededor de 140 clientes, compras distribuidas durante el ano, varios productos, tipos de lente y comentarios.
- Persistencia en `localStorage` versionada con claves `opticalia_purchases_v6` y `opticalia_clients_v6`.
- Las funciones de agregar, editar, eliminar, filtrar, exportar y enviar campanas actualizan datos reales del contexto local.

## Ejecucion

```bash
npm install
npm run dev
```

Validacion de produccion:

```bash
npm run build
```
# Parcia_Final_HCI
