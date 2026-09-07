const siteHeader = document.querySelector('.site-header');
const siteMenuButton = siteHeader?.querySelector('.menu-toggle');
const siteMainNav = siteHeader?.querySelector('.main-nav');

function setSiteMenu(open) {
  if (!siteHeader || !siteMenuButton) return;
  siteHeader.classList.toggle('menu-open', open);
  document.body.classList.toggle('nav-open', open);
  siteMenuButton.setAttribute('aria-expanded', String(open));
  siteMenuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}

siteMenuButton?.addEventListener('click', () => {
  setSiteMenu(!siteHeader.classList.contains('menu-open'));
});

siteMainNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setSiteMenu(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && siteHeader?.classList.contains('menu-open')) {
    setSiteMenu(false);
    siteMenuButton?.focus();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 1240) setSiteMenu(false);
});

document.querySelectorAll('form[data-mailrelay-pending]').forEach((form) => {
  form.addEventListener('submit', (event) => event.preventDefault());
});
