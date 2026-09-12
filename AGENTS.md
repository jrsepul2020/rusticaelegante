# Memoria del proyecto — Rústica Napoletana

## Propósito

Sitio estático multipágina en español para **Rústica Napoletana**, una pizzería de Cazalla de la Sierra. Incluye portada, carta, eventos, novedades y la historia de Eduardo Ramírez.

Esta es la memoria técnica canónica del proyecto. Debe actualizarse cuando cambien la estructura, los comandos, los datos de negocio o las decisiones de diseño.

## Separación respecto al brief principal

Existe un brief relacionado en `../RUSTICANAPOLETANA/CLAUDE.md`, pero describe una línea de producto distinta y no debe aplicarse automáticamente a este demo.

Diferencias verificadas:

- El contacto ya se sincronizó por indicación del usuario con el teléfono `611 829 414`; las reservas y consultas se realizan por llamada.
- Este demo combina una base oscura con superficies editoriales claras `#f2f0ed` y usa Inter/Cormorant Garamond; el brief define una base crema general y una única tipografía Poppins.
- Este demo muestra reconocimientos “50 Top Pizza Europa”; el brief enumera Guía Repsol 2026, 2º Mejor Pizzero de España 2026 y otros premios.
- Este demo es una landing estática; el brief plantea más secciones y un futuro panel con Supabase.

Antes de sincronizar datos o rediseñar, confirmar con el usuario si se está trabajando en **este prototipo oscuro** o implementando el **brief principal**. Para datos comerciales reales, consultar el brief y pedir confirmación; no reemplazarlos de forma silenciosa.

## Estado técnico

- Sitio estático: HTML, CSS y JavaScript nativos.
- La **carta** se renderiza en el cliente desde datos (Supabase si está configurado; si no, `js/menu-fallback.js`).
- Panel de administración en `/admin/` (login Supabase Auth + CRUD de carta y promociones).
- No usa framework, bundler ni gestor de paquetes.
- No hay proceso de compilación, lint ni tests automatizados.
- El directorio es un repositorio Git conectado a GitHub.
- Idioma y mercado: español (`lang="es"`), España; precios en euros.
- Fuente externa: Google Fonts (`Inter` y `Cormorant Garamond`).
- Dependencia CDN opcional: `@supabase/supabase-js@2` en carta y admin.

## Cómo ejecutar

La opción mínima es abrir `index.html` directamente en un navegador.

Para probarlo con un servidor local, desde la raíz:

```sh
python3 -m http.server 8000
```

Después, abrir `http://localhost:8000`.

## Archivos principales

- `index.html`: estructura completa, SEO básico, textos, carta, enlaces de conversión y referencias a imágenes.
- `styles.css`: sistema visual, layout, componentes, animaciones y responsive.
- `site-chrome.css`: top bar, header unificado, bandas editoriales, newsletter, páginas legales, menú móvil y footer compartido.
- `site-chrome.js`: controlador único del menú móvil para todas las rutas.
- `script.js`: movimiento/parallax del hero y carrusel con autoplay de la portada.
- `carta-rustica-napoletana/index.html`: página independiente de la carta real, accesible en `/carta-rustica-napoletana/`.
- `carta-rustica-napoletana/carta.css`: dirección editorial, responsive y componentes específicos de la carta.
- `carta-rustica-napoletana/carta.js`: detección de la categoría visible y lightbox accesible de producto.
- `admin/`: panel (`index.html` login, `carta.html`, `promociones.html`).
- `js/supabase-config.js`: URL y anon key de Supabase (vacío por defecto).
- `js/supabase-config.example.js`: plantilla de configuración.
- `js/menu-api.js`, `js/menu-render.js`, `js/menu-fallback.js`: cliente, render de carta y datos locales de respaldo.
- `js/promos-api.js`, `js/promos-render.js`, `js/promos-fallback.js`: cliente y render de promociones.
- `supabase/schema.sql` y `supabase/seed.sql`: esquema RLS + seed de la carta actual.
- `supabase/promotions.sql`: tabla de 3 promociones + seed inicial.
- `data/menu.json`: fuente intermedia usada para generar seed/fallback.
- `eventos-rustica-napoletana/index.html`: página de celebraciones, preparada para ampliar contenido en `/eventos-rustica-napoletana/`.
- `promociones/index.html`: promociones dinámicas en 3 columnas en `/promociones/`.
- `premios-obtenidos/index.html`: diplomas en `/premios-obtenidos/` (`premio-solete-guia-repsol.jpeg`, `premio-2-mejor-pizza-espana.jpeg`, `premio1–3.jpeg`).
- `novedades/index.html`: portada editorial con el listado de artículos en `/novedades/`.
- `novedades/*/index.html`: artículos individuales. Actualmente existen Guía Repsol 2026, 2º Mejor Pizzero de España 2026 y Silvestre finalista.
- `nosotros/index.html`: historia, perfil, premios y galería de Eduardo Ramírez en `/nosotros/`.
- `internas.css`: sistema visual compartido por Eventos, Novedades, Nosotros, Promociones y Premios.
- `aviso-legal/index.html`: aviso legal con los datos del titular pendientes de completar.
- `politica-privacidad/index.html`: tratamiento previsto de datos y newsletter.
- `politica-cookies/index.html`: estado actual del uso de cookies y servicios externos.
- `README.txt`: instrucciones breves originales.
- `assets/`: imágenes utilizadas, referencias visuales y material original.
  - En la raíz de `assets/` están las imágenes que actualmente consume la página.
  - `assets/imagenes/` conserva fotografías y recursos de origen; promociones (`promo1/2.jpeg`) y diplomas (`premio-solete-guia-repsol.jpeg`, `premio-2-mejor-pizza-espana.jpeg`, `premio1–3.jpeg`) se usan en `/promociones/` y `/premios-obtenidos/`.
  - `assets/carta/` contiene 28 fotografías de producto. Todas están integradas entre la portada y la carta; las fichas sin fotografía disponible permanecen tipográficas.
  - `assets/eduardo/` contiene siete fotografías. Todas se usan en Nosotros.
  - `assets/eventos/` contiene fotos de mesas de celebración usadas en `/eventos-rustica-napoletana/`.
  - La pizza del hero de inicio es `assets/aires-de-la-sierra-pizza-premiada-2.jpg`.

## Arquitectura y flujo

El sitio tiene trece rutas HTML principales (más tres artículos y tres legales):

1. `/index.html`: portada; carga `styles.css`, `site-chrome.css`, `site-chrome.js` y `script.js`. En móvil el hero usa la pizza a pantalla completa como fondo bajo el titular; el directorio de categorías muestra cinco vías (sin vinos/bebidas/postres); el carrusel lleva ocho pizzas; bajo el hero van las 3 promociones vigentes; antes del CTA de reserva hay un bloque Instagram (galería propia con enlace a `@rusticanapoletana`); franja `#FDC333` fina de reserva justo encima del footer; footer con fondo animado de horno.
2. `/carta-rustica-napoletana/index.html`: carta dinámica; carga `styles.css`, `carta.css`, `site-chrome.css`, `site-chrome.js`, scripts de menú (`menu-api`, `menu-fallback`, `menu-render`) y `carta.js`.
3. `/admin/`: login, CRUD de carta y promociones (protegido por Supabase Auth).
4. `/promociones/index.html`: hasta 3 promociones en rejilla de 3 columnas.
5. `/eventos-rustica-napoletana/index.html`: celebraciones; carga `styles.css`, `internas.css`, `site-chrome.css` y `site-chrome.js`.
6. `/novedades/index.html`: listado editorial; cada “Leer más” abre una página estática dentro de `/novedades/<slug>/`.
7. `/premios-obtenidos/index.html`: diplomas y reconocimientos.
8. `/nosotros/index.html`: perfil de Eduardo, premios, galería y valores; carga los recursos compartidos de páginas internas.
8. Tres artículos bajo `/novedades/<slug>/`.
9. `/aviso-legal/`, `/politica-privacidad/` y `/politica-cookies/`.
10. `/gracias-newsletter/`: confirmación tras suscribirse (revisar correo / doble opt-in).

La navegación principal incluye: Inicio, Carta, Promociones, Eventos, Novedades, Premios, Nosotros.

Todas las rutas comparten la misma estructura de top bar, `<header class="site-header">`, pre-footer de newsletter y footer.

No existe estado persistente ni intercambio de datos. Las conversiones salen del sitio mediante llamadas:

- Teléfono: `tel:+34611829414`.
- Número visible: `611 829 414`.
- Dirección: C/ Egido 13, Cazalla de la Sierra, Sevilla.
- Horario: jueves a lunes, 20:00-00:00; cerrado martes y miércoles.

La navegación interna usa anclas:

- `#top`
- `#categorias`
- `#carta-completa`
- `#nosotros`
- `#ubicacion`
- `#reservar`

La carta usa las anclas `#ensaladas-title`, `#entrantes-title`, `#pizzas-title`, `#focaccia-title`, `#padelino-title`, `#vinos-title`, `#bebidas-title` y `#postres-title`.

## Secciones de la página

1. Top bar roja con teléfono, dirección y horario.
2. Header unificado con marca, navegación y reserva; en móvil conserva el orden marca, reserva y menú.
3. Hero con propuesta de valor, CTAs, reconocimientos y pizza animada.
4. Directorio de las ocho categorías reales de la carta sobre fondo editorial claro.
5. Carrusel de cuatro pizzas.
6. Selección resumida de la carta real.
7. Avance de “Sobre nosotros” con enlace a `/nosotros/`.
8. CTA final de ubicación/reserva.
9. Pre-footer rojo de newsletter (copy persuasivo + formulario). Tras un alta correcta, redirección a `/gracias-newsletter/` con avisos de confirmación por email.
10. Footer compartido con marca en gran formato, degradado tricolor tenue, categorías, contacto y enlaces legales.

La URL `/carta-rustica-napoletana/` añade:

1. Hero “La mesa está puesta / Nuestra Carta”. En móvil la pizza ocupa la franja superior y degrada hacia el texto; los titulares salen desde esa media altura.
2. Franja horizontal de reconocimientos.
3. Directorio de ocho categorías.
4. Carta editorial completa con platos, descripciones, etiquetas y precios rojos; las categorías impares usan fondos pastel suaves. En móvil las fotografías de cada plato son cuadradas, ocupan el ancho de la ficha sobre el texto y el precio se alinea a la derecha del título, con tipografía de precio más grande.
5. Franja “Recomendaciones del chef” con cuatro platos, situada entre Entrantes y Pizzas. En móvil (hasta 860px) se reduce a lista nombre+precio con ancla al plato completo; en escritorio mantiene foto y descripción.
6. Franja “Las pizzas que más nos piden” con cuatro pizzas, situada justo antes de la categoría Pizzas; solo Silvestre se identifica como finalista de La Mejor Pizza 2026. Misma reducción móvil a nombre+precio con ancla.
7. Lightbox para ampliar con ratón o teclado las fotografías de platos y selecciones; se desactiva hasta 540 px para priorizar las imágenes cuadradas de las fichas móviles. Los encabezados de categoría son tipográficos y no duplican fotografías.
8. Aviso final sobre precios y alérgenos.

La portada ya no usa nombres ni precios ficticios: las categorías, el carrusel y la selección resumida proceden de la carta real. Sus enlaces llevan a las anclas correspondientes de `/carta-rustica-napoletana/`.

Las páginas internas añaden:

- `/eventos-rustica-napoletana/`: celebraciones, tipos de evento, proceso de consulta y CTA; faltan por incorporar capacidades, menús y condiciones cuando el cliente los facilite.
- `/novedades/`: portada editorial magazine (hero a pantalla, historia destacada + dos piezas independientes, índice temático); cada “Leer historia” abre una página estática dentro de `/novedades/<slug>/`.
- `/nosotros/`: historia de Eduardo Ramírez, formación, reconocimientos, galería de siete escenas y valores de la casa.
- Las tres páginas legales comparten una maquetación editorial; titular, NIF/CIF y correo legal siguen marcados como pendientes.

El formulario de newsletter pide nombre, email y consentimiento. El front llama a la Edge Function `newsletter-subscribe`, que crea el contacto en Mailrelay como `inactive` y dispara `resend_confirmation_email` (doble opt-in). Tras el alta, redirige a `/gracias-newsletter/`. Cuenta: `rusticanapoletana.ipzmarketing.com`, grupo `2`. Ver `supabase/functions/newsletter-subscribe/README.md`.

## Comportamiento JavaScript

- `site-chrome.js` alterna la clase `menu-open` en `.site-header`, sincroniza `aria-expanded`, cierra con Escape y bloquea el scroll.
- Al pulsar un enlace del menú, el menú móvil se cierra.
- En móvil el menú bocadillo ocupa el ancho completo de la pantalla: marca «Rústica Napoletana», botones Reservar / Llamar en la misma fila (`tel:+34611829414`) y enlaces Inicio / Carta / Promociones / Eventos / Novedades / Premios / Nosotros a 29px separados por líneas finas.
- `.pizza-motion` tiene entrada, flotación continua y respuesta suave al puntero mediante `requestAnimationFrame`.
- El carrusel usa scroll horizontal nativo con `scroll-snap`.
- Los botones avanzan o retroceden el ancho de una tarjeta más el `gap`.
- El autoplay avanza cada 4,5 segundos y se pausa con hover o foco.
- Si el usuario prefiere movimiento reducido, no se activa el movimiento del hero ni el autoplay.
- `carta.js` marca la categoría visible y controla el lightbox de imágenes desde 541 px: apertura por clic, Enter o Espacio; cierre por botón, fondo o Escape; restauración del foco y activación responsive mediante `matchMedia`.

## Sistema visual

Dirección: editorial, gastronómica y de alto contraste; alterna negro, papel corporativo y rojo.

Tokens principales en `:root`:

- Fondo: `#050505`.
- Fondo secundario: `#0b0b0b`.
- Papel editorial claro: `#f2f0ed`.
- Texto: `#f5f2ee`.
- Texto atenuado: `#aaa6a1`.
- Rojo de marca: `#ef1423`.
- Verde italiano: `#149447`.
- Ancho máximo: `1760px`.
- Padding base declarado: `32px`.

Tipografía:

- `Inter`: navegación, cuerpo, botones y datos.
- `Cormorant Garamond`: titulares y nombres destacados en caja natural (sin forzar mayúsculas).
- `Georgia` cursiva: frase decorativa del hero.

Breakpoints:

- `1240px`: se oculta la navegación de escritorio y aparece el menú móvil; se reajustan hero, categorías y carrusel.
- `860px`: layout principalmente apilado, márgenes de 16px por lado y componentes adaptados a tablet/móvil.
- `540px`: ajustes para móvil estrecho; se oculta el texto secundario de marca y el carrusel muestra una tarjeta parcial.

Las animaciones respetan `prefers-reduced-motion`.

## Convenciones para cambios

- Mantener el proyecto sin dependencias salvo que el alcance exija explícitamente una herramienta nueva.
- Conservar HTML semántico, etiquetas ARIA, foco por teclado y soporte de movimiento reducido.
- Reutilizar variables CSS y patrones existentes antes de introducir nuevos colores o componentes.
- Mantener la estética oscura, roja, italiana y editorial.
- Optimizar imágenes para web y definir textos `alt` útiles cuando aporten contenido.
- No cambiar el teléfono, dirección u horario en un único lugar: se repiten en la top bar, menús móviles, CTA y footers de los once HTML.
- Tras modificar anclas, actualizar tanto navegación/CTAs como los `id` de destino.
- Probar al menos en anchos aproximados de 1440, 860 y 390 píxeles.
- Evitar convertir textos o precios de muestra en datos aparentemente definitivos sin aprobación.

## Panel admin y carta dinámica (Supabase)

### Arranque del proyecto

1. Crear un proyecto en [Supabase](https://supabase.com).
2. En SQL Editor, ejecutar en orden:
   - `supabase/schema.sql`
   - `supabase/seed.sql`
   - `supabase/promotions.sql` (3 huecos de promociones)
3. Authentication → Users → crear un usuario (email/contraseña) para el panel.
4. Project Settings → API: copiar **Project URL** y **anon public** key.
5. Pegarlos en `js/supabase-config.js` (no uses la `service_role` key en el front).
6. (Fotos) Ejecutar también `supabase/storage.sql` o crear el bucket público `menu` en Storage y políticas de lectura pública + escritura autenticada.
7. Si el admin muestra **0 platos**, ejecuta `supabase/fix-admin-rls.sql` y, si hace falta, vuelve a lanzar `supabase/seed.sql`.
8. (Newsletter) En Secrets de Edge Functions: `MAILRELAY_API_KEY`. Desplegar: `supabase functions deploy newsletter-subscribe`.

### Uso

- Carta pública: `/carta-rustica-napoletana/` (lee platos `published = true`).
- Promociones públicas: `/promociones/` (hasta 3 slots en rejilla de 3 columnas; sin Supabase usa `js/promos-fallback.js`).
- Admin: `/admin/` → login → `/admin/carta.html` o `/admin/promociones.html`.
  - Carta: busca + filtro por categoría; edición en línea; «Más» para foto/detalles.
  - Promociones: 3 fichas fijas (título, foto, detalles, texto y enlace de botón).
  - Fotos: se suben al bucket Storage `menu` (platos y carpeta `promos/`).
- Sin configurar Supabase, la carta usa `js/menu-fallback.js` (contenido actual embebido).

### Datos

Tablas: `menu_categories`, `menu_items`, `promotions`. RLS: lectura anónima de publicados/activos; escritura solo autenticados.

Fase siguiente prevista: novedades.

## Contenido que requiere validación

La propia página indica que platos, descripciones y precios de la carta son de demostración. Antes de publicar deben confirmarse:

- Carta, precios, ingredientes y disponibilidad.
- Si cambia el contacto comercial, confirmar teléfono, dirección, horario y canal de reserva antes de sustituirlos.
- Enlace de mapas, si se incorpora.
- Nombre comercial y textos legales.
- Titular legal, NIF/CIF, domicilio de notificaciones y correo de privacidad.
- Veracidad y permiso de uso de los reconocimientos “50 Top Pizza Europa 2024, 2025 y 2026”.
- Derechos de uso de todas las fotografías, logotipos y fuentes.

## Riesgos y deuda conocida

- No hay tests, lint, formateador ni validación HTML automatizada.
- La página depende de Google Fonts y pierde esas tipografías sin conexión o si el recurso es bloqueado.
- Las imágenes son grandes y no usan `srcset`, formatos modernos ni carga diferida; pueden afectar el rendimiento.
- El autoplay del carrusel no incluye indicadores de posición ni anuncio de cambios para lectores de pantalla.
- La navegación marca “Inicio” como activa de forma fija; no refleja la sección visible.
- Las páginas legales existen, pero no deben considerarse definitivas hasta completar los datos del titular y validarlas profesionalmente.
- La newsletter envía altas vía Edge Function a Mailrelay; requiere secret `MAILRELAY_API_KEY` y la función desplegada.
- No hay mapa ni banner de cookies; actualmente no se cargan cookies propias de analítica o publicidad.
- Las reservas se realizan mediante llamada y no existe confirmación dentro del sitio.
- Hay recursos sin usar y archivos `.DS_Store` dentro de `assets/`.
- Hasta configurar Supabase, los cambios de carta vía admin no están posibles; la web pública usa el fallback local.
- El panel admin no gestiona aún categorías nuevas (sí platos, fotos en Storage, filtros y edición en línea).

## Verificación manual recomendada

Después de cada cambio:

1. Cargar la página sin errores de consola ni recursos 404.
2. Comprobar navegación por anclas y menú móvil.
3. Probar enlaces de teléfono sin completar acciones reales.
4. Revisar botones del carrusel, scroll táctil, teclado, pausa y autoplay.
5. Activar `prefers-reduced-motion` y confirmar que se deshabilitan movimientos continuos.
6. Revisar desbordamientos, legibilidad y recortes de imágenes en escritorio, tablet y móvil.
7. Confirmar que los datos comerciales visibles siguen siendo coherentes en todas sus apariciones.
8. Si Supabase está configurado: editar un precio en `/admin/carta.html` y comprobar el cambio en la carta pública.
