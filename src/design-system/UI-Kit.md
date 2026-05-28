# Hello Foodie! UI Kit

## 1. IDENTIDAD VISUAL

### Paleta de colores

#### Colores primarios
- `brand-orange` — `#FB923C`
  - Uso: CTA principal, botones primarios, accents, acciones de gamificación.
- `brand-red` — `#F43F5E`
  - Uso: advertencias suaves, estados activos, botones secundarios, iluminación.

#### Colores secundarios
- `brand-cor` — `#FF6B6B`
  - Uso: highlights, iconos de badges, estados de éxito cálido.
- `brand-mint` — `#4ECDC4`
  - Uso: confirmaciones, etiquetas de logros, acentos sociales.
- `brand-sun` — `#FFE66D`
  - Uso: notificaciones de logro, microinteracciones y graduaciones.

#### Colores neutrales
- `neutral-100` — `#FFFFFF`
- `neutral-200` — `#F8FAFC`
- `neutral-300` — `#E2E8F0`
- `neutral-400` — `#94A3B8`
- `neutral-500` — `#64748B`
- `neutral-600` — `#475569`
- `neutral-700` — `#334155`
- `neutral-800` — `#1E293B`
- `neutral-900` — `#111827`

#### Colores de fondo
- `surface` — `#FFFFFF`
- `surface-subtle` — `#F8FAFC`
- `surface-soft` — `#F1F5F9`
- `surface-strong` — `#E2E8F0`
- `surface-card` — `#FFFFFF`

#### Colores de texto
- `text-primary` — `#111827`
- `text-secondary` — `#475569`
- `text-muted` — `#94A3B8`
- `text-inverse` — `#FFFFFF`

#### Colores de estados
- `status-success` — `#22C55E`
- `status-warning` — `#F59E0B`
- `status-error` — `#EF4444`
- `status-info` — `#3B82F6`

#### Dark mode
- `dark-bg` — `#0F172A`
- `dark-surface` — `#111827`
- `dark-surface-soft` — `#1E293B`
- `dark-surface-border` — `#334155`
- `dark-text-primary` — `#F8FAFC`
- `dark-text-secondary` — `#CBD5E1`
- `dark-shadow` — `rgba(0, 0, 0, 0.55)`
- `dark-muted` — `#94A3B8`

### Tipografía

#### Tipografía principal
- Fuente: `Inter`, system-ui, sans-serif
- Estilo: moderno, geométrico, legible, ideal para pantallas móviles y web.

#### Jerarquía tipográfica
- `h1`: 42px / 48px — `900` — uso en pantallas de estadísticas, cabeceras hero.
- `h2`: 32px / 40px — `800` — títulos de sección, headers de cards, modales.
- `h3`: 24px / 32px — `700` — subtítulos de tarjetas y secciones de navegación.
- `body`: 16px / 24px — `500` — texto principal, contenido de lista.
- `label`: 14px / 20px — `700` — botones, tabs, filtros.
- `caption`: 12px / 18px — `600` — microcopy, timestamps, estados pequeños.

#### Pesos
- Ultra Bold / Black: `900`
- Bold: `700`
- Semibold: `600`
- Medium: `500`
- Regular: `400`

#### Espaciados tipográficos
- `heading-gap` → 0.08em — reduce el aire entre títulos y texto en componentes compactos.
- `paragraph-gap` → 1.5x line-height.
- `card-copy` → 1.25em line-height para bloques de texto.

#### Uso recomendado por componente
- `Header principal` → `h1` + `900`.
- `Cards de restaurante` → `h3` + `700`, `body` + `500`.
- `Botones CTA` → `label` + `700` o `body` + `700`.
- `Badges` → `caption` + `600` o `label` + `700`.
- `Navegación inferior` → `label` + `700`.
- `Estado de perfil` → `caption` + `700`.

### Iconografía base

#### Estilo general
- Línea fina y definida con zonas de relleno suave.
- Look moderno, minimalista, friendly.
- Iconos que complementan el sistema de gamificación y social.
- Preferencia por iconografía de interfaz clara y consistente con Lucide / outline.

#### Grid
- Base 24px para icons estándar.
- 32px para avatar/action, 16px para microiconos.

#### Stroke
- `2px` para iconografía principal.
- `1.5px` para iconos secundarios y estados.

#### Sombras
- Sombras muy sutiles en iconos en botones activos o cards destacados.
- Evitar drop-shadow fuerte; usar glows ligeros para estados premium.

#### Tamaños
- XS: 16px
- SM: 20px
- MD: 24px
- LG: 28px
- XL: 32px

#### Estados
- `Active`: color brand-orange / brand-red con fill parcial.
- `Inactive`: neutral-400 / neutral-500.
- `Disabled`: neutral-300 / neutral-200.

---

## 2. TOKENS DE DISEÑO

### Colors
- `color-brand-orange`: `#FB923C`
- `color-brand-red`: `#F43F5E`
- `color-brand-coral`: `#FF6B6B`
- `color-brand-mint`: `#4ECDC4`
- `color-brand-yellow`: `#FFE66D`
- `color-surface`: `#FFFFFF`
- `color-surface-soft`: `#F8FAFC`
- `color-surface-border`: `#E2E8F0`
- `color-text-primary`: `#111827`
- `color-text-secondary`: `#475569`
- `color-text-muted`: `#94A3B8`
- `color-success`: `#22C55E`
- `color-warning`: `#F59E0B`
- `color-error`: `#EF4444`
- `color-info`: `#3B82F6`
- `color-dark-bg`: `#0F172A`
- `color-dark-surface`: `#111827`
- `color-dark-text`: `#F8FAFC`

### Typography
- `font-family-primary`: `Inter, system-ui, sans-serif`
- `font-size-xxl`: `42px`
- `font-size-xl`: `32px`
- `font-size-lg`: `24px`
- `font-size-md`: `18px`
- `font-size-base`: `16px`
- `font-size-sm`: `14px`
- `font-size-xs`: `12px`
- `font-weight-black`: `900`
- `font-weight-bold`: `700`
- `font-weight-semibold`: `600`
- `font-weight-medium`: `500`
- `font-weight-regular`: `400`
- `line-height-tight`: `1.1`
- `line-height-base`: `1.5`
- `line-height-loose`: `1.75`

### Spacing
- `space-xxs`: `4px`
- `space-xs`: `8px`
- `space-sm`: `12px`
- `space-md`: `16px`
- `space-lg`: `24px`
- `space-xl`: `32px`
- `space-2xl`: `40px`
- `space-3xl`: `48px`
- `space-4xl`: `64px`

### Radius
- `radius-sm`: `8px`
- `radius-base`: `16px`
- `radius-lg`: `24px`
- `radius-full`: `999px`

### Shadows
- `shadow-xs`: `0 1px 2px rgba(15, 23, 42, 0.05)`
- `shadow-sm`: `0 4px 10px rgba(15, 23, 42, 0.08)`
- `shadow-md`: `0 10px 30px rgba(15, 23, 42, 0.12)`
- `shadow-lg`: `0 15px 45px rgba(15, 23, 42, 0.18)`
- `shadow-card`: `0 20px 60px rgba(15, 23, 42, 0.14)`

### Borders
- `border-thin`: `1px solid var(--color-surface-border)`
- `border-medium`: `1.5px solid rgba(17, 24, 39, 0.08)`
- `border-strong`: `2px solid rgba(17, 24, 39, 0.12)`
- `border-rounded`: `1px solid rgba(255, 146, 60, 0.14)`

### Elevation
- `elevation-1`: `0 4px 16px rgba(17, 24, 39, 0.08)`
- `elevation-2`: `0 8px 24px rgba(17, 24, 39, 0.12)`
- `elevation-3`: `0 16px 48px rgba(17, 24, 39, 0.16)`

### Motion
- `motion-fast`: `120ms`
- `motion-medium`: `200ms`
- `motion-slow`: `320ms`
- `motion-ease`: `cubic-bezier(0.4, 0, 0.2, 1)`
- `motion-ease-out`: `cubic-bezier(0.0, 0, 0.2, 1)`
- `motion-ease-in-out`: `cubic-bezier(0.4, 0, 0.2, 1)`

---

## 3. COMPONENTES PRINCIPALES

### Botones

#### Primary
- Fondo: `brand-orange` / `brand-red` en gradiente
- Texto: `#FFFFFF`
- Radio: `24px`
- Sombra: `shadow-sm`
- Uso: CTA principal, acciones de gamificación, nivel up.

#### Secondary
- Fondo: `#FFFFFF`
- Borde: `1px solid rgba(251, 146, 60, 0.18)`
- Texto: `brand-orange`
- Uso: acciones alternativas y filtros.

#### Tertiary
- Fondo: transparente
- Texto: `text-primary`
- Uso: links secundarios, controles de UI ligera.

#### Ghost
- Fondo: transparente
- Borde: none o `text-muted`
- Uso: icon buttons, chips, toggles.

#### Danger
- Fondo: `status-error`
- Texto: `#FFFFFF`
- Uso: borrar, cerrar, cancelar irreversible.

#### Disabled
- Fondo: `neutral-300`
- Texto: `neutral-500`
- Curso: `not-allowed`

#### Con icono
- Tamaño estándar: `48px` de altura.
- Espacio interno: `12px`.
- Icono: `20px`.

#### Redondos
- Uso: botón central del menú inferior, acciones rápidas.
- Tamaño: `68px`.
- Fondo: `brand-orange`.
- Sombra: `shadow-lg`.

### Inputs

#### Text field
- Fondo: `surface-soft`
- Borde: `border-thin`
- Radio: `24px`
- Placeholder: `text-muted`

#### Search bar
- Icono integrado a la izquierda.
- Fondo: `surface-soft`
- Borde: `border-thin`
- Uso: búsqueda de restaurantes, amigos, tags.

#### Dropdown / Select
- Compacto, con indicador y opciones elevadas.
- Fondo de panel: `surface-card`.
- Borde: `border-medium`.

#### Date picker
- Botón input con tono neutro y estados active.
- Día seleccionado: `brand-orange` con texto blanco.

#### Rating selector
- Estrellas o puntos con tamaño `24px`.
- Activo: `brand-orange`.
- Inactivo: `neutral-300`.

#### Textarea
- Mismo estilo que Text field.
- Altura mínima: `120px`.
- Padding: `18px`.

### Cards

#### Restaurante
- Fondo: `surface-card`
- Borde redondeado: `24px`
- Sombra: `shadow-sm`
- Uso: imagen principal, titulo, rating, tags.

#### Badge
- Fondo: `surface-soft`
- Borde: `1px solid rgba(251, 146, 60, 0.18)`
- Texto: `text-primary`

#### Nivel
- Tarjeta con gradiente ligero.
- Elementos: nivel actual, progreso, XP restante.

#### XP event
- Tarjeta compacta con icono de +XP.
- Uso: historial de experiencia.

#### Achievement
- Fondo: `surface-soft`
- Avatares circulares de iconos.
- Estado bloqueado / desbloqueado: `neutral-300` / `brand-orange`.

#### Perfil
- Tarjeta con avatar, nombre, seguidores y nivel.
- Botones de acción: `Follow`, `Message`, `Recommend`.

### Navegación

#### Bottom navigation bar
- Fondo: `surface` con blur y borde superior.
- Elementos: `My List`, `Map`, acción central, `Social`, `More`.
- Estado activo: `brand-orange`.
- Iconos: outline suave.

#### Tabs
- Variante `List / Mosaic / Gallery`.
- Fondo: `surface-soft`.
- Indicador: `brand-orange`.

#### Filtros
- Chips redondos con texto uppercase.
- Activo: `brand-orange` fondo suave.
- Inactivo: `surface-soft`.

#### Header con avatar y stats
- Barra superior con avatar, nivel, XP y notificaciones.
- Uso de microcopy `caption`.

### Feedback

#### Toasts
- Fondo: `surface-card`
- Borde lateral color (success, error, info, warning).
- Animación de aparición: `motion-fast`.

#### Snackbars
- Presentación inferior con CTA.
- Texto claro y botón secundario.

#### Modals
- Fondo blur + overlay oscuro.
- Card central con `radius-lg`.
- Botones primarios para acción y secundarios para cerrar.

#### Alerts
- Barra o tarjeta con icono y texto.
- Estado success/error/warning/info definidos.

#### Empty states
- Ilustración simple + mensaje + CTA.
- Uso en `My List`, `Social`, `Map` sin resultados.

### Listas

#### List item
- Banda con avatar/icono a la izquierda.
- Texto primario + secundario + badge de estado.

#### Restaurant row
- Imagen pequeñas, nombre, rating, tags.
- Acción rápida: `Visit`, `Save`, `Recommend`.

#### Social feed item
- Card horizontal con autor, comentario, likes.
- Acciones rápidas: `Comment`, `Like`, `Share`.

#### Notification item
- Fondo: `surface-soft`.
- Estado: punto activo, texto y timestamp.

### Gráficos

#### Barra de progreso
- Fondo `neutral-200`.
- Relleno `brand-orange`.
- Edge radius: `999px`.

#### XP progress
- Peso visual fuerte con etiqueta `%` y barra.
- Nivel actual vs siguiente.

#### Nivel actual
- Tonos de gradiente naranja.
- Icono de escudo o trofeo.

#### Nivel siguiente
- Texto pequeño y progresión, CTA para desbloquear.

---

## 4. ESTADOS DE COMPONENTES

### Estado general
- `Default`: color base neutro o fill primario.
- `Hover`: elevación + color ligeramente más saturado.
- `Pressed`: reducción de escala `0.96`, sombra más compacta.
- `Focused`: outline suave `brand-orange/30` o `brand-mint/30`.
- `Disabled`: opacidad `0.4`, interacción bloqueada.
- `Loading`: animación de pulso o skeleton.
- `Success`: texto `status-success`, borde/ícono verde.
- `Error`: texto `status-error`, fondo `error/10`.

### Botones
- `hover`: +4px lift y saturación.
- `pressed`: `scale(0.98)` y `shadow-xs`.
- `focused`: `0 0 0 4px rgba(251, 146, 60, 0.18)`.

### Inputs
- `default`: border neutro.
- `focus`: `border-brand-orange` + sombra suave.
- `error`: `border-error` + `text-error`.
- `disabled`: `background: neutral-200`.

### Cards
- `hover`: `shadow-md`, `translateY(-2px)`.
- `selected`: borde `brand-orange`, `background: surface-soft`.
- `locked`: mezcla `neutral-200` + opacity `0.65`.

### Alerts y toasts
- `success`: ícono `brand-mint`.
- `warning`: ícono `brand-yellow`.
- `error`: ícono `brand-red`.
- `info`: ícono `brand-blue`.

---

## 5. DARK MODE

### Colores adaptados
- Fondo general: `dark-bg`.
- Cartas: `dark-surface`.
- Texto: `dark-text-primary`.
- Texto secundario: `dark-text-secondary`.
- Bordes suaves: `dark-surface-border`.
- Input: `#152238`.
- Botones primarios: `brand-orange` sobre texto blanco.
- Botones secundarios: `#1E293B` con borde `rgba(248, 113, 113, 0.2)`.

### Contrastes
- Mantener contraste 4.5:1 en todos los textos.
- Usar `surface-soft` oscuro para tarjetas flotantes.
- Iconos activos: blanco o `brand-orange`.

### Sombras
- `0 20px 50px rgba(0, 0, 0, 0.35)`.
- `0 8px 24px rgba(0, 0, 0, 0.2)` para cards.

### Iconos
- Inactivo: `#94A3B8`.
- Activo: `#FFFFFF` / `#FB923C`.

### Componentes
- `Bottom nav`: fondo blur `rgba(15, 23, 42, 0.96)`.
- `Cards`: fondo `dark-surface` con borde `dark-surface-border`.
- `Modals`: overlay `rgba(0, 0, 0, 0.7)`.

---

## 6. SISTEMA DE ESPACIADO Y GRID

### Grid base
- Base de 4px.
- Unidad de columna: 8px.

### Breakpoints
- `xs`: 360px
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `xxl`: 1440px

### Margins
- Contenedores móviles: `16px`.
- Tablet: `24px`.
- Desktop: `32px`.

### Padding
- Interior de cards: `20px`.
- Contenido principal: `24px`.
- Secciones: `32px`.

### Gutters
- Columnas: `16px` entre cards.
- Grid principal: `24px`.

### Layout para pantallas principales
- `My List`: columna única en móvil, 2 columnas en tablet/desktop.
- `Map`: header fijo + mapa full bleed y control buttons flotantes.
- `Social`: feed vertical con cards de 100% ancho y separación `20px`.
- `More`: modal sheet con sections en grid 2x.

---

## 7. DOCUMENTACIÓN

### Guía de uso
- Usa el `brand-orange` para acciones primarias y estados de gamificación.
- Mantén siempre `text-primary` sobre fondos claros.
- Preferir `surface-soft` para tarjetas secundarias.
- Reservar el rojo para errores y señales de atención.

### Ejemplos
- `Botón primary` + `Card restaurante` + `XP progress` en la pantalla `My List`.
- `Badge unlocked` + `Profile card` en la pantalla `Social`.
- `Modal level-up` + `Bottom nav` + `Search bar`.

### Casos de uso
- `Gamificación`: usar gradientes naranja-rojo, barras de progreso, iconos de trophy/level.
- `Social`: usar avatar redondo, followers count, cards de actividad.
- `Map`: controles flotantes con `ghost buttons` y etiquetas de ubicación.
- `More`: listados de acciones con `cards` y labels uppercase.

### Reglas de consistencia
- Siempre usar `radius-lg` en cards principales.
- Pedir estado hover en botones con clase de transición `motion-medium`.
- No mezclar más de tres colores vibrantes en un mismo componente.
- Mantener tipografía `Inter` en todas las pantallas.

### Do’s & Don’ts
- Do: usar `brand-mint` para confirmaciones.
- Do: usar `neutral-500` para texto secundario.
- Don’t: aplicar sombras negras duras.
- Don’t: usar rojo como color de fondo extendido.
- Don’t: aplicar logotipos o iconos demasiado detallados en cards pequeñas.

### Variantes permitidas
- `Botones`: primary, secondary, tertiary, ghost, danger, round.
- `Cards`: compact, full-width, highlighted.
- `Inputs`: filled, outlined, search.

### Variantes prohibidas
- `Botón` con fondo ` đỏ` saturado fuera de estados de error.
- `Tarjeta` con borde multicolor.
- `Texto` en color `brand-red` para copy largo.

---

## 8. ENTREGABLES

- UI Kit completo documentado en Markdown.
- Tokens exportables en `tokens.json`, `tokens.css`, `tokens.js`.
- Componentes listos para desarrollo: guía de componente, estados y variantes.
- Iconos base en SVG dentro de `icons/`.
- Versiones `light` y `dark` definidas.
- Sistema escalable con tokens y breakpoints listos para ampliar.
