(function (global) {
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pageDepth() {
    const el = document.querySelector("[data-promo-grid]");
    const raw = el?.getAttribute("data-depth");
    const n = Number(raw);
    return Number.isFinite(n) ? n : 1;
  }

  function assetPrefix(depth) {
    return depth > 0 ? "../".repeat(depth) : "";
  }

  function resolveHref(url, depth) {
    if (!url) return "";
    if (/^(https?:|tel:|mailto:|#)/i.test(url)) return url;
    let clean = String(url).replace(/^\.\//, "");
    while (clean.startsWith("../")) clean = clean.slice(3);
    clean = clean.replace(/^\//, "");
    return assetPrefix(depth) + clean;
  }

  function cardHtml(promo, depth) {
    const hasContent = Boolean(
      (promo.title && promo.title.trim()) ||
        promo.image_path ||
        (promo.details && promo.details.trim()) ||
        (promo.button_label && promo.button_label.trim())
    );
    const media = promo.image_path
      ? `<div class="promo-card__media"><img src="${escapeHtml(RusticaPromosApi.assetUrl(promo.image_path))}" alt="${escapeHtml(promo.title || "Promoción")}" loading="lazy" decoding="async" /></div>`
      : `<div class="promo-card__media is-empty" aria-hidden="true"></div>`;
    const title = promo.title
      ? `<h3 class="promo-card__title">${escapeHtml(promo.title)}</h3>`
      : "";
    const details = promo.details
      ? `<p class="promo-card__details">${escapeHtml(promo.details)}</p>`
      : "";
    const btn =
      promo.button_label && promo.button_url
        ? `<a class="btn btn-red promo-card__btn" href="${escapeHtml(resolveHref(promo.button_url, depth))}">${escapeHtml(promo.button_label)} <span>→</span></a>`
        : "";

    return `<article class="promo-card${hasContent ? "" : " is-empty"}" data-slot="${promo.slot}">
      ${media}
      ${btn}
      <div class="promo-card__body">
        ${title}
        ${details}
      </div>
    </article>`;
  }

  function renderPromotions(list) {
    const slots = RusticaPromosApi.normalizeSlots(list);
    const roots = document.querySelectorAll("[data-promo-grid]");
    roots.forEach((root) => {
      const depth = Number(root.getAttribute("data-depth"));
      const pageDepthValue = Number.isFinite(depth) ? depth : pageDepth();
      global.RUSTICA_ASSET_PREFIX = assetPrefix(pageDepthValue);
      root.innerHTML = slots.map((promo) => cardHtml(promo, pageDepthValue)).join("");
    });
  }

  async function loadAndRender() {
    const statuses = document.querySelectorAll("[data-promo-status]");

    try {
      let data = null;
      if (RusticaPromosApi.hasConfig()) {
        const client = RusticaPromosApi.createClient();
        data = await RusticaPromosApi.fetchPublishedPromotions(client);
      } else if (global.RUSTICA_PROMOS_FALLBACK) {
        data = global.RUSTICA_PROMOS_FALLBACK;
      } else {
        throw new Error("Sin datos de promociones");
      }

      renderPromotions(data);
      statuses.forEach((status) => {
        status.hidden = true;
      });
    } catch (err) {
      if (global.RUSTICA_PROMOS_FALLBACK) {
        renderPromotions(global.RUSTICA_PROMOS_FALLBACK);
        statuses.forEach((status) => {
          status.hidden = true;
        });
      } else {
        statuses.forEach((status) => {
          status.hidden = false;
          status.textContent = "Promociones temporalmente no disponibles.";
        });
      }
      console.error(err);
    }
  }

  global.RusticaPromosRender = { loadAndRender, renderPromotions };
})(window);
