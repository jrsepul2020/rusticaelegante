const header = document.querySelector('.menu-header');
const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

menuButton?.addEventListener('click', () => {
  const open = header?.classList.toggle('menu-open') ?? false;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
});

mainNav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    header?.classList.remove('menu-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Abrir menú');
  });
});

const categoryLinks = [...document.querySelectorAll('.category-directory a')];
const sections = categoryLinks
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    categoryLinks.forEach(link => {
      link.classList.toggle('is-active', link.hash === `#${visible.target.id}`);
    });
  }, {
    rootMargin: '-20% 0px -60%',
    threshold: [0, 0.15, 0.4]
  });

  sections.forEach(section => observer.observe(section));
}
