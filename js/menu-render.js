(function (global) {
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function dishHtml(item) {
    const img = item.image_path
      ? `<img class="dish-thumb" src="${escapeHtml(RusticaMenuApi.assetUrl(item.image_path))}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async" />`
      : "";
    const nameNote = item.name_note ? ` <small>${escapeHtml(item.name_note)}</small>` : "";
    const badge = item.badge
      ? `<span class="badge ${escapeHtml(item.badge)}">${escapeHtml(item.badge_label || item.badge)}</span>`
      : "";
    const titleWrap = badge ? "dish-title" : "dish-head";
    const desc = item.description ? `<p>${escapeHtml(item.description)}</p>` : "";
    const idAttr = item.anchor_id ? ` id="${escapeHtml(item.anchor_id)}"` : "";
    const classes = ["dish"];
    if (item.image_path) classes.push("has-image");
    if (item.is_simple) classes.push("simple");
    if (item.is_signature) classes.push("signature");

    if (item.is_simple) {
      return `<article class="${classes.join(" ")}"${idAttr}><h3>${escapeHtml(item.name)}${nameNote}</h3><strong>${escapeHtml(item.price_label)}</strong></article>`;
    }

    return `<article class="${classes.join(" ")}"${idAttr}>${img}<div><div class="${titleWrap}"><h3>${escapeHtml(item.name)}${nameNote}</h3>${badge}<strong>${escapeHtml(item.price_label)}</strong></div>${desc}</div></article>`;
  }

  function featuredCardHtml(item, mode) {
    const href = item.anchor_id ? `#${escapeHtml(item.anchor_id)}` : "#";
    const img = item.image_path
      ? `<img src="${escapeHtml(RusticaMenuApi.assetUrl(item.image_path))}" alt="" loading="lazy" decoding="async" />`
      : "";
    const kicker = mode === "popular"
      ? (item.featured_popular_kicker || item.featured_kicker || "")
      : (item.featured_kicker || "");
    const blurb = mode === "popular"
      ? (item.featured_popular_blurb || item.featured_blurb || item.description || "")
      : (item.featured_blurb || item.description || "");
    const awardClass = item.is_signature || (mode === "popular" && /finalista/i.test(kicker))
      ? " featured-award"
      : "";
    const displayName = item.name;

    return `<a class="featured-menu-card${awardClass}" href="${href}">
      ${img}
      <div>
        <span>${escapeHtml(kicker)}</span>
        <div class="featured-menu-card__title"><h3>${escapeHtml(displayName)}</h3><strong>${escapeHtml(item.price_label)}</strong></div>
        <p>${escapeHtml(blurb)}</p>
      </div>
    </a>`;
  }

  function renderMenu(data) {
    const { categories, items } = data;
    const byCategory = new Map();
    items.forEach((item) => {
      if (!byCategory.has(item.category_id)) byCategory.set(item.category_id, []);
      byCategory.get(item.category_id).push(item);
    });

    categories.forEach((category) => {
      const list = document.querySelector(`#${category.slug} .dish-list`);
      if (!list) return;
      const catItems = (byCategory.get(category.id) || []).slice().sort((a, b) => a.sort_order - b.sort_order);
      list.className = category.layout === "two_col" ? "dish-list dish-list-two" : "dish-list";
      list.innerHTML = catItems.map(dishHtml).join("") || `<p class="menu-empty">Sin platos en esta categoría.</p>`;
    });

    const chefGrid = document.querySelector("[data-menu-featured='chef']");
    if (chefGrid) {
      const chefItems = items
        .filter((item) => item.featured_chef)
        .sort((a, b) => (a.featured_sort || 0) - (b.featured_sort || 0) || a.sort_order - b.sort_order);
      chefGrid.innerHTML = chefItems.map((item) => featuredCardHtml(item, "chef")).join("");
    }

    const popularGrid = document.querySelector("[data-menu-featured='popular']");
    if (popularGrid) {
      const popularItems = items
        .filter((item) => item.featured_popular)
        .sort((a, b) => (a.featured_popular_sort || 0) - (b.featured_popular_sort || 0) || a.sort_order - b.sort_order);
      popularGrid.innerHTML = popularItems.map((item) => featuredCardHtml(item, "popular")).join("");
    }

    document.dispatchEvent(new CustomEvent("rustica:menu-rendered"));
  }

  async function loadAndRender() {
    const status = document.getElementById("menu-load-status");
    global.RUSTICA_ASSET_PREFIX = "../";

    try {
      let data = null;
      if (RusticaMenuApi.hasConfig()) {
        const client = RusticaMenuApi.createClient();
        data = await RusticaMenuApi.fetchPublishedMenu(client);
      } else if (global.RUSTICA_MENU_FALLBACK) {
        data = global.RUSTICA_MENU_FALLBACK;
      } else {
        throw new Error("Sin datos de carta");
      }

      if (!data?.categories?.length || !data?.items?.length) {
        throw new Error("La carta está vacía");
      }
      renderMenu(data);
      if (status) status.hidden = true;
    } catch (err) {
      if (global.RUSTICA_MENU_FALLBACK) {
        renderMenu(global.RUSTICA_MENU_FALLBACK);
        if (status) {
          status.hidden = false;
          status.textContent = "No se pudo conectar con Supabase. Mostrando carta local.";
        }
      } else if (status) {
        status.hidden = false;
        status.className = "menu-load-status error";
        status.textContent = "Carta temporalmente no disponible.";
      }
      console.error(err);
    }
  }

  global.RusticaMenuRender = { loadAndRender, renderMenu };
})(window);
