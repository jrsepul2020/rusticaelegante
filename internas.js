const innerHeader = document.querySelector('.inner-header');
const innerMenuButton = innerHeader?.querySelector('.menu-toggle');

innerMenuButton?.addEventListener('click', () => {
  const open = innerHeader.classList.toggle('menu-open');
  innerMenuButton.setAttribute('aria-expanded', String(open));
  innerMenuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
});

innerHeader?.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => {
    innerHeader.classList.remove('menu-open');
    innerMenuButton?.setAttribute('aria-expanded', 'false');
    innerMenuButton?.setAttribute('aria-label', 'Abrir menú');
  });
});
