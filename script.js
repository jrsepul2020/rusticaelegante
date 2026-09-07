const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const pizzaMotion = document.querySelector('.pizza-motion');
const track = document.querySelector('.pizza-track');
const prev = document.querySelector('.slider-btn.prev');
const next = document.querySelector('.slider-btn.next');

menuButton?.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => {
    header.classList.remove('menu-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

// Entrada visible + movimiento orgánico continuo de la pizza.
if (pizzaMotion && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let pointerX = 0;
  let pointerY = 0;
  let currentX = 0;
  let currentY = 0;
  let start = performance.now();

  window.addEventListener('pointermove', (e) => {
    pointerX = (e.clientX / innerWidth - 0.5) * 2;
    pointerY = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  function easeOutCubic(x){ return 1 - Math.pow(1 - x, 3); }

  function animate(now) {
    const elapsed = now - start;
    const intro = Math.min(elapsed / 1500, 1);
    const eased = easeOutCubic(intro);
    const t = elapsed * 0.001;

    currentX += (pointerX - currentX) * 0.04;
    currentY += (pointerY - currentY) * 0.04;

    const introX = (1 - eased) * 130;
    const introScale = 1.10 - eased * 0.10;
    const floatY = Math.sin(t * 1.05) * 13;
    const floatX = Math.cos(t * 0.72) * 7;
    const rotate = Math.sin(t * 0.65) * 1.15 + currentX * 0.8;
    const dx = introX + floatX + currentX * 12;
    const dy = floatY + currentY * 8;
    const scale = introScale + Math.sin(t * 0.8) * 0.004;

    pizzaMotion.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${rotate}deg) scale(${scale})`;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

function slideAmount() {
  const first = track?.querySelector('.pizza-slide');
  if (!first) return 320;
  const gap = parseFloat(getComputedStyle(track).gap) || 18;
  return first.getBoundingClientRect().width + gap;
}

prev?.addEventListener('click', () => track.scrollBy({ left: -slideAmount(), behavior: 'smooth' }));
next?.addEventListener('click', () => track.scrollBy({ left: slideAmount(), behavior: 'smooth' }));

let autoplay;
function startAutoplay(){
  if (!track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  autoplay = setInterval(() => {
    const max = track.scrollWidth - track.clientWidth;
    if (track.scrollLeft >= max - 8) track.scrollTo({ left: 0, behavior: 'smooth' });
    else track.scrollBy({ left: slideAmount(), behavior: 'smooth' });
  }, 4500);
}
function stopAutoplay(){ clearInterval(autoplay); }
track?.addEventListener('mouseenter', stopAutoplay);
track?.addEventListener('mouseleave', startAutoplay);
track?.addEventListener('focusin', stopAutoplay);
track?.addEventListener('focusout', startAutoplay);
startAutoplay();
