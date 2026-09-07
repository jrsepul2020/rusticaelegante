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

const lightbox = document.querySelector('.product-lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxTitle = lightbox?.querySelector('figcaption span');
const lightboxPrice = lightbox?.querySelector('figcaption strong');
const lightboxClose = lightbox?.querySelector('.product-lightbox-close');
const productImages = document.querySelectorAll('.food-section img, .featured-menu-card img');
const lightboxMedia = window.matchMedia('(min-width: 541px)');
let lightboxTrigger = null;

function openLightbox(image) {
  if (!lightboxMedia.matches || !lightbox || !lightboxImage || !lightboxTitle || !lightboxPrice) return;

  const card = image.closest('article');
  const title = card?.querySelector('h3')?.textContent.trim() || image.alt;
  const price = card?.querySelector('strong')?.textContent.trim() || '';

  lightboxTrigger = image;
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxTitle.textContent = title;
  lightboxPrice.textContent = price;
  lightboxPrice.hidden = !price;
  lightbox.showModal();
  document.body.classList.add('lightbox-open');
  lightboxClose?.focus();
}

function syncLightboxAvailability() {
  productImages.forEach(image => {
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

productImages.forEach(image => {
  image.addEventListener('click', () => openLightbox(image));
  image.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    openLightbox(image);
  });
});
syncLightboxAvailability();
lightboxMedia.addEventListener('change', syncLightboxAvailability);

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
