const categoryLinks = [...document.querySelectorAll('.category-directory a')];

function sectionFromLink(link) {
  const target = document.querySelector(link.getAttribute('href'));
  if (!target) return null;
  return target.closest('.food-section') || target;
}

const sections = categoryLinks.map(sectionFromLink).filter(Boolean);

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    categoryLinks.forEach(link => {
      link.classList.toggle('is-active', sectionFromLink(link) === visible.target);
    });
  }, {
    rootMargin: '-20% 0px -60%',
    threshold: [0, 0.15, 0.4]
  });

  sections.forEach(section => observer.observe(section));
}

function scrollToHash(behavior = 'auto') {
  const id = decodeURIComponent((location.hash || '').replace(/^#/, ''));
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior, block: 'start' });
}

window.addEventListener('load', () => scrollToHash('auto'));
document.addEventListener('rustica:menu-rendered', () => {
  requestAnimationFrame(() => scrollToHash('auto'));
});

const lightbox = document.querySelector('.product-lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxTitle = lightbox?.querySelector('figcaption span');
const lightboxPrice = lightbox?.querySelector('figcaption strong');
const lightboxClose = lightbox?.querySelector('.product-lightbox-close');
const lightboxMedia = window.matchMedia('(min-width: 541px)');
let lightboxTrigger = null;

function lightboxImages() {
  return document.querySelectorAll('.food-section img');
}

function openLightbox(image) {
  if (!lightboxMedia.matches || !lightbox || !lightboxImage || !lightboxTitle || !lightboxPrice) return;

  const card = image.closest('article');
  const title = card?.querySelector('h3')?.textContent.trim() || image.alt;
  const price = card?.querySelector('strong')?.textContent.trim() || '';

  lightboxTrigger = image;
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt || title;
  lightboxTitle.textContent = title;
  lightboxPrice.textContent = price;
  lightboxPrice.hidden = !price;
  lightbox.showModal();
  document.body.classList.add('lightbox-open');
  lightboxClose?.focus();
}

function syncLightboxAvailability() {
  lightboxImages().forEach(image => {
    if (lightboxMedia.matches) {
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', `Ampliar foto: ${image.alt}`);
    } else {
      image.removeAttribute('tabindex');
      image.removeAttribute('role');
      image.removeAttribute('aria-label');
    }
  });

  if (!lightboxMedia.matches && lightbox?.open) lightbox.close();
}

document.addEventListener('click', event => {
  const image = event.target.closest('.food-section img');
  if (!image || !lightboxMedia.matches) return;
  event.preventDefault();
  event.stopPropagation();
  openLightbox(image);
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const image = event.target.closest?.('.food-section img');
  if (!image || !lightboxMedia.matches) return;
  event.preventDefault();
  event.stopPropagation();
  openLightbox(image);
});

syncLightboxAvailability();
lightboxMedia.addEventListener('change', syncLightboxAvailability);
document.addEventListener('rustica:menu-rendered', syncLightboxAvailability);

lightboxClose?.addEventListener('click', () => lightbox?.close());
lightbox?.addEventListener('click', event => {
  if (event.target === lightbox) lightbox.close();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && lightbox?.open) {
    event.preventDefault();
    lightbox.close();
  }
});
lightbox?.addEventListener('close', () => {
  document.body.classList.remove('lightbox-open');
  lightboxTrigger?.focus();
});
