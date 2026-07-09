# Arma tu 11 Ideal

Aplicación web estática para construir un `11 ideal` del Mundial 2026 mezclando jugadores de las 48 selecciones clasificadas.

## Objetivo

El proyecto está pensado como un interactivo editorial/deportivo:

- permite elegir jugadores por posición
- cambiar formaciones
- completar un `11 ideal`
- compartir o exportar el resultado

No usa backend ni framework. Toda la experiencia vive en HTML, CSS y JavaScript vanilla.

## Estructura del proyecto

- [index.html](/Users/diego/Documents/GitHub/Arma%20tu%2011%20ideal/index.html)
  Plantilla principal del interactivo, SEO base, paneles, toast y contenedores del campo.

- [assets/css/styles.css](/Users/diego/Documents/GitHub/Arma%20tu%2011%20ideal/assets/css/styles.css)
  Estilos globales, layout responsive, estética del campo, panel lateral, selector de formaciones, toast y microinteracciones.

- [assets/js/data.js](/Users/diego/Documents/GitHub/Arma%20tu%2011%20ideal/assets/js/data.js)
  Fuente local de datos de selecciones y jugadores. Expone `window.DreamTeamData`.

- [assets/js/app.js](/Users/diego/Documents/GitHub/Arma%20tu%2011%20ideal/assets/js/app.js)
  Lógica principal del builder: render del campo, selección de jugadores, panel lateral, resumen, exportación, toast y feedback contextual.

- [assets/img/flags](/Users/diego/Documents/GitHub/Arma%20tu%2011%20ideal/assets/img/flags)
  Banderas SVG locales de las 48 selecciones.

## Arquitectura general

La app se divide en dos capas:

1. `data.js`
   Entrega configuración y datos:
   - `defaultFormation`
   - `positionNames`
   - `summaryTitles`
   - `formations`
   - `teams`

2. `app.js`
   Consume esa configuración y crea una instancia de `DreamTeamBuilder`, que controla toda la UI.

No existe estado persistido en `localStorage`. El estado es solo de sesión en memoria.

## Estado principal en app.js

La clase `DreamTeamBuilder` mantiene estos estados clave:

- `selectedPlayers`
  Jugadores actualmente ubicados en el campo.

- `benchPlayers`
  Reserva usada al cambiar entre formaciones.

- `currentFormation`
  Formación activa.

- `currentSheetTeam`
  Selección activa en el panel lateral.

- `activeSlotId`
  Slot que se está editando.

- `activePos`
  Posición del slot activo.

- `activeCurrentPlayer`
  Jugador actualmente asignado al slot activo.

- `searchTerm`
  Texto de búsqueda del panel.

- `lastRemoved`
  Último jugador removido, usado para `Deshacer`.

- `hasSessionStarted`
  Controla parte del copy dinámico del estado inicial.

## Flujo funcional

### 1. Render inicial

- `index.html` carga `data.js`
- luego carga `app.js`
- `app.js` lee `window.DreamTeamData`
- se instancia `DreamTeamBuilder`
- se renderiza la formación inicial `4-3-3`

### 2. Selección de jugador

- el usuario toca un slot vacío
- se define `activeSlotId` y `activePos`
- se abre el picker con jugadores filtrados por posición
- al elegir un jugador:
  - se actualiza `selectedPlayers`
  - se repinta el campo
  - se refresca el panel
  - aparece la burbuja contextual sobre el slot

### 3. Remoción y restauración

- al quitar un jugador:
  - se elimina de `selectedPlayers`
  - se actualiza `lastRemoved`
  - se refrescan campo y listado
  - aparece toast inferior con `Deshacer`

- al restaurar:
  - el jugador vuelve al slot original
  - se refrescan campo y panel
  - aparece burbuja contextual sobre el slot restaurado

### 4. Finalización del 11

Cuando el contador llega a 11:

- el estado pasa a `complete`
- cambia el copy del `status pill`
- se dispara `confetti`
- aparece la celebración visual
- en escritorio se abre el resumen final

## Sistema de feedback

Hoy el proyecto usa dos niveles de feedback:

- `slot bubble`
  Para acciones locales ligadas al campo:
  - agregar jugador
  - restaurar jugador

- `toast`
  Para acciones globales o con acción secundaria:
  - quitar jugador con `Deshacer`
  - compartir
  - guardar imagen
  - errores
  - reinicio

Esto evita que toda interacción dependa de un feedback global y mejora la relación entre acción y respuesta.

## Formaciones

Las formaciones disponibles viven en `DreamTeamData.formations`:

- `4-3-3`
- `4-4-2`
- `3-5-2`
- `3-4-3`

Cada formación define:

- `pos`
- `count`
- `labels`

Si se agrega una nueva formación, debe actualizarse:

- `assets/js/data.js`
- y validar visualmente el layout del campo en desktop y mobile

## Fuente de datos oficial

La base de jugadores fue construida usando el PDF oficial de FIFA con las convocatorias:

- `SquadLists-Spanish.pdf`
- URL oficial:
  `https://fdp.fifa.org/assetspublic/ce281/pdf/SquadLists-Spanish.pdf`

### Qué se tomó de esa fuente

- selecciones participantes
- listado de jugadores
- dorsal
- posición
- nombre en camiseta como base para abreviaciones

### Criterio de adaptación

El PDF oficial se usó como fuente maestra, pero algunos nombres fueron abreviados o corregidos manualmente para:

- mejorar legibilidad en UI
- evitar desbordes
- mantener consistencia visual en slots y listados

Por eso `data.js` no es una transcripción literal del PDF, sino una versión adaptada para producto.

## Fuente de banderas

Las banderas locales se importaron desde la base de Flagpedia / Flagcdn:

- índice:
  `https://flagpedia.net/index`
- referencia API/download:
  `https://flagpedia.net/download/api`

Los SVG quedaron guardados localmente en:

- [assets/img/flags](/Users/diego/Documents/GitHub/Arma%20tu%2011%20ideal/assets/img/flags)

La UI no depende del CDN en runtime.

## Cómo actualizar jugadores o selecciones

Si FIFA publica una nueva versión del PDF o cambia convocatorias:

1. Descargar el PDF oficial nuevo.
2. Revisar si cambió:
   - cantidad de selecciones
   - cantidad de convocados
   - posiciones
   - nombres en camiseta
3. Actualizar [assets/js/data.js](/Users/diego/Documents/GitHub/Arma%20tu%2011%20ideal/assets/js/data.js).
4. Verificar manualmente:
   - nombres largos
   - slots con desborde
   - búsqueda por nombre
   - resumen final

Recomendación:

- mantener `teamMeta` separado de `rawTeams`
- conservar nombres de país en español para la UI
- usar los códigos FIFA solo como referencia técnica

## Cómo actualizar banderas

Si hay que reemplazar o sumar banderas:

1. Descargar el SVG correcto.
2. Guardarlo en `assets/img/flags/`.
3. Actualizar la propiedad `flag` correspondiente en `teamMeta` dentro de `data.js`.
4. Verificar contraste en países con banderas muy claras.

## Dependencias externas

La app usa estas librerías vía CDN:

- `html2canvas`
  Para exportar el campo como imagen.

- `canvas-confetti`
  Para la celebración al completar el 11.

Si esas librerías fallan al cargar:

- la app sigue funcionando en lo principal
- pero exportación y confetti pueden degradarse

## Consideraciones responsive

El proyecto tiene comportamientos distintos entre mobile y desktop:

- en mobile, el panel selector funciona como `bottom sheet`
- en desktop, el panel vive fijo al lado del campo
- el `toast` en escritorio se ancla visualmente al campo
- la `slot bubble` se posiciona respecto al slot seleccionado

Cada cambio visual debe probarse en:

- mobile
- escritorio pequeño
- escritorio estándar

## Mantenimiento recomendado

Antes de tocar lógica o UI:

1. Revisar `index.html` para entender el contenedor real.
2. Revisar `data.js` si el cambio involucra países, jugadores o formaciones.
3. Revisar `app.js` si afecta estado, render o interacción.
4. Revisar `styles.css` si afecta layout, ritmo visual o responsive.

Después de tocar JavaScript:

- correr al menos:
  `node --check assets/js/app.js`

Si se tocó data:

- revisar también:
  `node --check assets/js/data.js`

## Riesgos habituales al mantener este proyecto

- desincronizar campo y panel lateral
- romper el estado del slot activo al quitar o restaurar jugadores
- introducir nombres demasiado largos
- desalinear overlays en mobile
- cambiar formaciones sin validar spacing real en el campo
- reemplazar banderas con assets remotos y volver a depender de CDN

## Próximas mejoras sugeridas

- documentar un script de regeneración de `data.js` desde PDF
- mover dependencias CDN a una estrategia local o build controlado
- añadir tests básicos de integridad para:
  - 48 selecciones
  - 26 jugadores por selección
  - rutas de banderas válidas

