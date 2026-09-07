# Memoria del proyecto — Rústica Napoletana

## Propósito

Sitio estático multipágina en español para **Rústica Napoletana**, una pizzería de Cazalla de la Sierra. Incluye portada, carta, eventos, novedades y la historia de Eduardo Ramírez.

Esta es la memoria técnica canónica del proyecto. Debe actualizarse cuando cambien la estructura, los comandos, los datos de negocio o las decisiones de diseño.

## Separación respecto al brief principal

Existe un brief relacionado en `../RUSTICANAPOLETANA/CLAUDE.md`, pero describe una línea de producto distinta y no debe aplicarse automáticamente a este demo.

Diferencias verificadas:

- El contacto ya se sincronizó por indicación del usuario con el teléfono `955 498 119`; las reservas y consultas se realizan por llamada.
- Este demo combina una base oscura con superficies editoriales claras `#f2f0ed` y usa Inter/Oswald; el brief define una base crema general y una única tipografía Poppins.
- Este demo muestra reconocimientos “50 Top Pizza Europa”; el brief enumera Guía Repsol 2026, 2º Mejor Pizzero de España 2026 y otros premios.
- Este demo es una landing estática; el brief plantea más secciones y un futuro panel con Supabase.

Antes de sincronizar datos o rediseñar, confirmar con el usuario si se está trabajando en **este prototipo oscuro** o implementando el **brief principal**. Para datos comerciales reales, consultar el brief y pedir confirmación; no reemplazarlos de forma silenciosa.

## Estado técnico

- Sitio estático: HTML, CSS y JavaScript nativos.
- No usa framework, bundler, gestor de paquetes, variables de entorno ni backend.
- No hay proceso de compilación, lint ni tests automatizados.
- El directorio es un repositorio Git conectado a GitHub.
- Idioma y mercado: español (`lang="es"`), España; precios en euros.
- Fuente externa: Google Fonts (`Inter` y `Oswald`).

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
- `eventos-rustica-napoletana/index.html`: página de celebraciones, preparada para ampliar contenido en `/eventos-rustica-napoletana/`.
- `novedades/index.html`: portada editorial con el listado de artículos en `/novedades/`.
- `novedades/*/index.html`: artículos individuales. Actualmente existen Guía Repsol 2026, 2º Mejor Pizzero de España 2026 y Silvestre finalista.
- `nosotros/index.html`: historia, perfil, premios y galería de Eduardo Ramírez en `/nosotros/`.
- `internas.css`: sistema visual compartido por Eventos, Novedades y Nosotros.
- `aviso-legal/index.html`: aviso legal con los datos del titular pendientes de completar.
- `politica-privacidad/index.html`: tratamiento previsto de datos y newsletter.
- `politica-cookies/index.html`: estado actual del uso de cookies y servicios externos.
- `README.txt`: instrucciones breves originales.
- `assets/`: imágenes utilizadas, referencias visuales y material original.
  - En la raíz de `assets/` están las imágenes que actualmente consume la página.
  - `assets/imagenes/` conserva fotografías y recursos de origen; actualmente no se referencian desde el HTML.
  - `assets/carta/` contiene 28 fotografías de producto. Todas están integradas entre la portada y la carta; las fichas sin fotografía disponible permanecen tipográficas.
  - `assets/eduardo/` contiene ocho fotografías. Todas se usan en Nosotros; comedor y equipo también apoyan la página de Eventos.

## Arquitectura y flujo

El sitio tiene once rutas HTML:

1. `/index.html`: portada; carga `styles.css`, `site-chrome.css`, `site-chrome.js` y `script.js`. En móvil el hero usa la pizza a pantalla completa como fondo bajo el titular; el directorio de categorías muestra cinco vías (sin vinos/bebidas/postres); el carrusel lleva ocho pizzas; la ubicación va en banda oscura para no encadenar dos rojos con la newsletter.
2. `/carta-rustica-napoletana/index.html`: carta; reutiliza `styles.css`, añade `carta.css`, `site-chrome.css`, `site-chrome.js` y `carta.js`.
3. `/eventos-rustica-napoletana/index.html`: celebraciones; carga `styles.css`, `internas.css`, `site-chrome.css` y `site-chrome.js`.
4. `/novedades/index.html`: listado editorial; cada “Leer más” abre una página estática dentro de `/novedades/<slug>/`.
5. `/nosotros/index.html`: perfil de Eduardo, premios, galería y valores; carga los recursos compartidos de páginas internas.
6. Tres artículos bajo `/novedades/<slug>/`.
7. `/aviso-legal/`, `/politica-privacidad/` y `/politica-cookies/`.

Todas las rutas comparten la misma estructura de top bar, `<header class="site-header">`, pre-footer de newsletter y footer.

No existe estado persistente ni intercambio de datos. Las conversiones salen del sitio mediante llamadas:

- Teléfono: `tel:+34955498119`.
- Número visible: `955 498 119`.
- Dirección: C/ Egido 13, Cazalla de la Sierra, Sevilla.
- Horario: jueves a lunes, 20:00-00:00; cerrado martes y miércoles.

La navegación interna usa anclas:

- `#top`
- `#categorias`
- `#carta-completa`
- `#nosotros`
- `#ubicacion`
- `#reservar`

La carta usa las anclas `#ensaladas`, `#entrantes`, `#pizzas`, `#focaccia`, `#padelino`, `#vinos`, `#bebidas` y `#postres`.

## Secciones de la página

1. Top bar roja con teléfono, dirección y horario.
2. Header unificado con marca, navegación y reserva; en móvil conserva el orden marca, reserva y menú.
3. Hero con propuesta de valor, CTAs, reconocimientos y pizza animada.
4. Directorio de las ocho categorías reales de la carta sobre fondo editorial claro.
5. Carrusel de cuatro pizzas.
6. Selección resumida de la carta real.
7. Avance de “Sobre nosotros” con enlace a `/nosotros/`.
8. CTA final de ubicación/reserva.
9. Pre-footer rojo con el formulario preparado para Mailrelay.
10. Footer compartido con marca en gran formato, degradado tricolor tenue, categorías, contacto y enlaces legales.

La URL `/carta-rustica-napoletana/` añade:

1. Hero “La mesa está puesta / Nuestra Carta”.
2. Franja horizontal de reconocimientos.
3. Directorio de ocho categorías.
4. Carta editorial completa con platos, descripciones, etiquetas y precios rojos; las categorías impares usan fondos pastel suaves. En móvil las fotografías de cada plato son cuadradas, ocupan el ancho de la ficha sobre el texto y el precio se alinea a la derecha del título.
5. Franja “Recomendaciones del chef” con cuatro platos, situada entre Entrantes y Pizzas.
6. Franja “Las pizzas que más nos piden” con cuatro pizzas, situada justo antes de la categoría Pizzas; solo Silvestre se identifica como finalista de La Mejor Pizza 2026.
7. Lightbox para ampliar con ratón o teclado las fotografías de platos y selecciones; se desactiva hasta 540 px para priorizar las imágenes cuadradas de las fichas móviles. Los encabezados de categoría son tipográficos y no duplican fotografías.
8. Aviso final sobre precios y alérgenos.

La portada ya no usa nombres ni precios ficticios: las categorías, el carrusel y la selección resumida proceden de la carta real. Sus enlaces llevan a las anclas correspondientes de `/carta-rustica-napoletana/`.

Las páginas internas añaden:

- `/eventos-rustica-napoletana/`: celebraciones, tipos de evento, proceso de consulta y CTA; faltan por incorporar capacidades, menús y condiciones cuando el cliente los facilite.
- `/novedades/`: tres artículos publicados en septiembre de 2026, con imagen destacada, fecha, categoría, texto ampliado y navegación entre historias.
- `/nosotros/`: historia de Eduardo Ramírez, formación, reconocimientos, galería de siete escenas y valores de la casa.
- Las tres páginas legales comparten una maquetación editorial; titular, NIF/CIF y correo legal siguen marcados como pendientes.

El formulario de newsletter solicita nombre, email y consentimiento. Su botón permanece desactivado y no transmite datos. Para activarlo hay que sustituir el scaffold por el formulario HTML alojado que genere Mailrelay, conservando el enlace a `/politica-privacidad/`; no deben introducirse claves API en JavaScript.

## Comportamiento JavaScript

- `site-chrome.js` alterna la clase `menu-open` en `.site-header`, sincroniza `aria-expanded`, cierra con Escape y bloquea el scroll.
- Al pulsar un enlace del menú, el menú móvil se cierra.
- En móvil la navegación ocupa todo el ancho disponible e incluye marca, teléfono, dirección y horario.
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
- `Oswald`: titulares y nombres destacados.
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
- La newsletter no envía datos hasta incorporar el código alojado de Mailrelay y revisar su configuración de doble opt-in.
- No hay mapa ni banner de cookies; actualmente no se cargan cookies propias de analítica o publicidad.
- Las reservas se realizan mediante llamada y no existe confirmación dentro del sitio.
- Hay recursos sin usar y archivos `.DS_Store` dentro de `assets/`.

## Verificación manual recomendada

Después de cada cambio:

1. Cargar la página sin errores de consola ni recursos 404.
2. Comprobar navegación por anclas y menú móvil.
3. Probar enlaces de teléfono sin completar acciones reales.
4. Revisar botones del carrusel, scroll táctil, teclado, pausa y autoplay.
5. Activar `prefers-reduced-motion` y confirmar que se deshabilitan movimientos continuos.
6. Revisar desbordamientos, legibilidad y recortes de imágenes en escritorio, tablet y móvil.
7. Confirmar que los datos comerciales visibles siguen siendo coherentes en todas sus apariciones.
