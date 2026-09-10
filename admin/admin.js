(async function () {
  const listStatus = document.getElementById("list-status");
  const formStatus = document.getElementById("form-status");
  const itemsBody = document.getElementById("items-body");
  const filterCategories = document.getElementById("filter-categories");
  const searchInput = document.getElementById("search-input");
  const modal = document.getElementById("item-modal");
  const form = document.getElementById("item-form");
  const deleteBtn = document.getElementById("delete-btn");
  const modalTitle = document.getElementById("modal-title");
  const photoPreview = document.getElementById("photo-preview");
  const photoFile = document.getElementById("item-photo-file");
  const removePhotoBtn = document.getElementById("remove-photo-btn");

  if (!RusticaMenuApi.hasConfig()) {
    listStatus.className = "status error";
    listStatus.textContent = "Configura js/supabase-config.js antes de usar el admin.";
    return;
  }

  let client;
  try {
    client = RusticaMenuApi.createClient();
  } catch (err) {
    listStatus.className = "status error";
    listStatus.textContent = err.message;
    return;
  }

  const { data: { session } } = await client.auth.getSession();
  if (!session) {
    location.replace("./");
    return;
  }

  document.getElementById("user-email").textContent = session.user.email || "Sesión activa";
  document.getElementById("logout-btn").addEventListener("click", async () => {
    await client.auth.signOut();
    location.replace("./");
  });

  let categories = [];
  let items = [];
  let editingId = null;
  let activeCategory = "";
  let searchQuery = "";
  let pendingPhotoFile = null;
  let removePhotoOnSave = false;

  const CATEGORY_TAIL = { vinos: 90, bebidas: 91, postres: 92 };

  function categorySlug(id) {
    return categories.find((c) => c.id === id)?.slug || "";
  }

  function categoryRank(id) {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return 500;
    if (CATEGORY_TAIL[cat.slug] != null) return CATEGORY_TAIL[cat.slug];
    return Number.isFinite(cat.sort_order) ? cat.sort_order : 100;
  }

  function priceValue(label) {
    const n = String(label || "")
      .replace(/[^\d,.-]/g, "")
      .replace(",", ".");
    const num = parseFloat(n);
    return Number.isFinite(num) ? num : Number.POSITIVE_INFINITY;
  }

  function compareText(a, b) {
    return String(a || "").localeCompare(String(b || ""), "es", { sensitivity: "base" });
  }

  function categoryName(id) {
    return categories.find((c) => c.id === id)?.name || "—";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function imageSrc(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return RusticaMenuApi.assetUrl(path.replace(/^\.\.\//, ""));
  }

  function fillCategoryControls() {
    const orderedCats = categories.slice().sort((a, b) => {
      const ra = CATEGORY_TAIL[a.slug] != null ? CATEGORY_TAIL[a.slug] : (a.sort_order ?? 100);
      const rb = CATEGORY_TAIL[b.slug] != null ? CATEGORY_TAIL[b.slug] : (b.sort_order ?? 100);
      return ra - rb || compareText(a.name, b.name);
    });
    filterCategories.innerHTML = [
      `<button type="button" class="chip ${activeCategory === "" ? "is-active" : ""}" data-category="">Todas</button>`,
      ...orderedCats.map(
        (c) =>
          `<button type="button" class="chip ${activeCategory === c.id ? "is-active" : ""}" data-category="${c.id}">${escapeHtml(c.name)}</button>`
      )
    ].join("");

    document.getElementById("item-category").innerHTML = orderedCats
      .map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`)
      .join("");
  }

  function filteredItems() {
    const q = searchQuery.trim().toLowerCase();
    const rows = items.filter((item) => {
      if (activeCategory && item.category_id !== activeCategory) return false;
      if (!q) return true;
      const hay = `${item.name || ""} ${item.description || ""} ${item.price_label || ""} ${categoryName(item.category_id)}`.toLowerCase();
      return hay.includes(q);
    });

    rows.sort((a, b) => {
      let cmp = categoryRank(a.category_id) - categoryRank(b.category_id);
      if (cmp === 0) cmp = compareText(categoryName(a.category_id), categoryName(b.category_id));
      if (cmp === 0) cmp = compareText(a.name, b.name);
      return cmp;
    });

    return rows;
  }

  function renderList() {
    const rows = filteredItems();
    if (!items.length) {
      itemsBody.innerHTML = `<div class="dish-card"><p class="status error">No hay platos en Supabase. Ejecuta <code>seed.sql</code> y, si sigue vacío, <code>fix-admin-rls.sql</code>.</p></div>`;
      return;
    }
    if (!rows.length) {
      itemsBody.innerHTML = `<div class="dish-card"><p class="status">No hay platos con este filtro o búsqueda.</p></div>`;
      return;
    }

    itemsBody.innerHTML = rows
      .map((item) => {
        const src = imageSrc(item.image_path);
        const thumb = src
          ? `<img class="dish-card__thumb" src="${escapeHtml(src)}" alt="" />`
          : `<div class="dish-card__thumb is-empty">Sin foto</div>`;
        return `
          <article class="dish-card" data-id="${item.id}">
            <div class="dish-card__top">
              ${thumb}
              <div class="dish-card__body">
                <input class="inline-field inline-name" data-inline="name" value="${escapeHtml(item.name)}" aria-label="Nombre" />
                <textarea class="inline-field inline-desc" data-inline="description" aria-label="Descripción" rows="2">${escapeHtml(item.description || "")}</textarea>
                <div class="dish-card__meta">
                  <input class="inline-field inline-price" data-inline="price_label" value="${escapeHtml(item.price_label)}" aria-label="Precio" />
                  <span class="badge-pill">${escapeHtml(categoryName(item.category_id))}</span>
                  <span class="badge-pill ${item.published ? "on" : "off"}">${item.published ? "Publicado" : "Oculto"}</span>
                  <span class="saving-dot" data-save-state hidden></span>
                </div>
              </div>
            </div>
            <div class="dish-card__actions">
              <button class="btn btn-ghost btn-sm" type="button" data-edit="${item.id}">Más</button>
              <button class="btn btn-ghost btn-sm" type="button" data-toggle-pub="${item.id}">${item.published ? "Ocultar" : "Publicar"}</button>
              <button class="btn btn-danger btn-sm" type="button" data-delete="${item.id}">Eliminar</button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  async function loadData() {
    listStatus.className = "status";
    listStatus.textContent = "Cargando…";
    try {
      let data = await RusticaMenuApi.fetchAllMenuAdmin(client);
      // Si RLS bloquea el listado completo, intenta al menos los publicados
      if (!data.items?.length) {
        const published = await RusticaMenuApi.fetchPublishedMenu(client);
        data = {
          categories: published.categories?.length ? published.categories : data.categories,
          items: published.items || []
        };
      }
      categories = data.categories || [];
      items = data.items || [];
      fillCategoryControls();
      renderList();
      listStatus.className = items.length ? "status ok" : "status error";
      listStatus.textContent = items.length
        ? `${items.length} platos · ${filteredItems().length} visibles`
        : "0 platos. En Supabase ejecuta fix-admin-rls.sql y seed.sql, luego recarga con Cmd+Shift+R.";
    } catch (err) {
      console.error(err);
      listStatus.className = "status error";
      listStatus.textContent = err.message || "No se pudo cargar la carta.";
      itemsBody.innerHTML = `<div class="dish-card"><p class="status error">${escapeHtml(err.message || "Error de carga")}</p></div>`;
    }
  }

  async function patchItem(id, patch, stateEl) {
    if (stateEl) {
      stateEl.hidden = false;
      stateEl.textContent = "Guardando…";
    }
    const { error } = await client.from("menu_items").update(patch).eq("id", id);
    if (error) throw error;
    const idx = items.findIndex((row) => row.id === id);
    if (idx >= 0) items[idx] = { ...items[idx], ...patch };
    if (stateEl) {
      stateEl.textContent = "Guardado";
      setTimeout(() => {
        stateEl.hidden = true;
      }, 900);
    }
  }

  function setPhotoPreview(path) {
    const src = imageSrc(path);
    if (!src) {
      photoPreview.className = "photo-preview is-empty";
      photoPreview.textContent = "Sin foto";
      if (photoPreview.tagName === "IMG") {
        /* keep as div replacement handled below */
      }
      photoPreview.removeAttribute("src");
      return;
    }
    photoPreview.className = "photo-preview";
    photoPreview.textContent = "";
    if (photoPreview.tagName !== "IMG") {
      const img = document.createElement("img");
      img.id = "photo-preview";
      img.className = "photo-preview";
      img.alt = "Foto del plato";
      img.src = src;
      photoPreview.replaceWith(img);
    } else {
      photoPreview.src = src;
      photoPreview.alt = "Foto del plato";
    }
  }

  function refreshPhotoPreviewFromInput() {
    const el = document.getElementById("photo-preview");
    const path = document.getElementById("item-image").value.trim();
    const src = imageSrc(path);
    if (!src) {
      if (el.tagName === "IMG") {
        const div = document.createElement("div");
        div.id = "photo-preview";
        div.className = "photo-preview is-empty";
        div.textContent = "Sin foto";
        el.replaceWith(div);
      } else {
        el.className = "photo-preview is-empty";
        el.textContent = "Sin foto";
      }
      return;
    }
    if (el.tagName !== "IMG") {
      const img = document.createElement("img");
      img.id = "photo-preview";
      img.className = "photo-preview";
      img.alt = "Foto del plato";
      img.src = src;
      el.replaceWith(img);
    } else {
      el.src = src;
      el.className = "photo-preview";
    }
  }

  function storagePathFromPublicUrl(url) {
    if (!url) return null;
    const marker = "/storage/v1/object/public/menu/";
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(url.slice(idx + marker.length));
  }

  async function uploadPhoto(itemId, file) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${itemId}/${Date.now()}.${ext}`;
    const { error } = await client.storage.from("menu").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || "image/jpeg"
    });
    if (error) throw error;
    const { data } = client.storage.from("menu").getPublicUrl(path);
    return data.publicUrl;
  }

  async function deleteStorageIfNeeded(imagePath) {
    const path = storagePathFromPublicUrl(imagePath);
    if (!path) return;
    await client.storage.from("menu").remove([path]);
  }

  function openModal(item) {
    editingId = item?.id || null;
    pendingPhotoFile = null;
    removePhotoOnSave = false;
    modalTitle.textContent = editingId ? "Editar plato" : "Nuevo plato";
    deleteBtn.hidden = !editingId;
    formStatus.textContent = "";
    formStatus.className = "status";

    document.getElementById("item-id").value = item?.id || "";
    document.getElementById("item-category").value = item?.category_id || categories[0]?.id || "";
    document.getElementById("item-name").value = item?.name || "";
    document.getElementById("item-name-note").value = item?.name_note || "";
    document.getElementById("item-description").value = item?.description || "";
    document.getElementById("item-price").value = item?.price_label || "";
    document.getElementById("item-badge").value = item?.badge || "";
    document.getElementById("item-badge-label").value = item?.badge_label || "";
    document.getElementById("item-sort").value = item?.sort_order ?? 0;
    document.getElementById("item-image").value = item?.image_path || "";
    document.getElementById("item-anchor").value = item?.anchor_id || "";
    document.getElementById("item-published").checked = item ? Boolean(item.published) : true;
    document.getElementById("item-signature").checked = Boolean(item?.is_signature);
    document.getElementById("item-chef").checked = Boolean(item?.featured_chef);
    document.getElementById("item-popular").checked = Boolean(item?.featured_popular);
    document.getElementById("item-chef-kicker").value = item?.featured_kicker || "";
    document.getElementById("item-chef-blurb").value = item?.featured_blurb || "";
    document.getElementById("item-pop-kicker").value = item?.featured_popular_kicker || "";
    document.getElementById("item-pop-blurb").value = item?.featured_popular_blurb || "";
    photoFile.value = "";
    refreshPhotoPreviewFromInput();

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.getElementById("item-name").focus();
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    editingId = null;
    pendingPhotoFile = null;
    removePhotoOnSave = false;
  }

  function slugify(text) {
    return String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function formPayload() {
    const badge = document.getElementById("item-badge").value || null;
    const name = document.getElementById("item-name").value.trim();
    let anchor = document.getElementById("item-anchor").value.trim();
    if (!anchor && name) anchor = `plato-${slugify(name)}`;
    const category = categories.find((c) => c.id === document.getElementById("item-category").value);
    const isSimple = category?.layout === "simple";

    return {
      category_id: document.getElementById("item-category").value,
      name,
      name_note: document.getElementById("item-name-note").value.trim() || null,
      description: document.getElementById("item-description").value.trim() || null,
      price_label: document.getElementById("item-price").value.trim(),
      badge,
      badge_label: document.getElementById("item-badge-label").value.trim() || null,
      image_path: document.getElementById("item-image").value.trim() || null,
      anchor_id: anchor || null,
      sort_order: Number(document.getElementById("item-sort").value || 0),
      is_simple: Boolean(isSimple),
      is_signature: document.getElementById("item-signature").checked,
      featured_chef: document.getElementById("item-chef").checked,
      featured_popular: document.getElementById("item-popular").checked,
      featured_kicker: document.getElementById("item-chef-kicker").value.trim() || null,
      featured_blurb: document.getElementById("item-chef-blurb").value.trim() || null,
      featured_popular_kicker: document.getElementById("item-pop-kicker").value.trim() || null,
      featured_popular_blurb: document.getElementById("item-pop-blurb").value.trim() || null,
      published: document.getElementById("item-published").checked
    };
  }

  async function deleteItem(id) {
    if (!confirm("¿Eliminar este plato de forma permanente?")) return false;
    const item = items.find((row) => row.id === id);
    const { error } = await client.from("menu_items").delete().eq("id", id);
    if (error) throw error;
    if (item?.image_path) {
      try {
        await deleteStorageIfNeeded(item.image_path);
      } catch (_) {
        /* ignore storage cleanup errors */
      }
    }
    return true;
  }

  function on(id, event, handler) {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    if (el) el.addEventListener(event, handler);
  }

  // Cargar primero: un fallo en listeners no debe dejar la lista vacía
  window.RUSTICA_ASSET_PREFIX = "../";
  await loadData();

  on("new-item-btn", "click", () => openModal(null));
  on("fab-new", "click", () => openModal(null));
  on("cancel-btn", "click", closeModal);
  on("cancel-btn-2", "click", closeModal);

  on(searchInput, "input", () => {
    searchQuery = searchInput.value;
    renderList();
  });

  on(filterCategories, "click", (event) => {
    const btn = event.target.closest("[data-category]");
    if (!btn) return;
    activeCategory = btn.getAttribute("data-category") || "";
    fillCategoryControls();
    renderList();
  });

  if (!itemsBody) return;

  itemsBody.addEventListener("focusin", (event) => {
    const field = event.target.closest("[data-inline]");
    if (field) field.classList.add("is-editing");
  });

  itemsBody.addEventListener("focusout", async (event) => {
    const field = event.target.closest("[data-inline]");
    if (!field) return;
    field.classList.remove("is-editing");
    const card = field.closest("[data-id]");
    const id = card?.getAttribute("data-id");
    const key = field.getAttribute("data-inline");
    if (!id || !key) return;
    const item = items.find((row) => row.id === id);
    if (!item) return;
    const next = field.tagName === "TEXTAREA" ? field.value.trim() : field.value.trim();
    const current = item[key] || "";
    if (next === current) return;
    const stateEl = card.querySelector("[data-save-state]");
    try {
      const patch = { [key]: next || null };
      if (key === "price_label" && !next) throw new Error("El precio no puede quedar vacío");
      if (key === "name" && !next) throw new Error("El nombre no puede quedar vacío");
      await patchItem(id, patch, stateEl);
      if (key === "description") renderList();
    } catch (err) {
      listStatus.className = "status error";
      listStatus.textContent = err.message || "No se pudo guardar";
      field.value = current;
    }
  });

  itemsBody.addEventListener("keydown", (event) => {
    const field = event.target.closest("[data-inline]");
    if (!field) return;
    if (event.key === "Enter" && field.tagName !== "TEXTAREA") {
      event.preventDefault();
      field.blur();
    }
    if (event.key === "Escape") {
      const card = field.closest("[data-id]");
      const id = card?.getAttribute("data-id");
      const item = items.find((row) => row.id === id);
      const key = field.getAttribute("data-inline");
      if (item) field.value = item[key] || "";
      field.blur();
    }
  });

  itemsBody.addEventListener("click", async (event) => {
    const editBtn = event.target.closest("[data-edit]");
    const deleteBtnEl = event.target.closest("[data-delete]");
    const toggleBtn = event.target.closest("[data-toggle-pub]");

    if (editBtn) {
      const item = items.find((row) => row.id === editBtn.getAttribute("data-edit"));
      if (item) openModal(item);
      return;
    }

    if (toggleBtn) {
      const id = toggleBtn.getAttribute("data-toggle-pub");
      const item = items.find((row) => row.id === id);
      if (!item) return;
      try {
        await patchItem(id, { published: !item.published });
        renderList();
      } catch (err) {
        listStatus.className = "status error";
        listStatus.textContent = err.message;
      }
      return;
    }

    if (deleteBtnEl) {
      const id = deleteBtnEl.getAttribute("data-delete");
      try {
        const ok = await deleteItem(id);
        if (ok) await loadData();
      } catch (err) {
        listStatus.className = "status error";
        listStatus.textContent = err.message;
      }
    }
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("open")) closeModal();
  });

  photoFile.addEventListener("change", () => {
    const file = photoFile.files?.[0];
    if (!file) return;
    pendingPhotoFile = file;
    removePhotoOnSave = false;
    const url = URL.createObjectURL(file);
    let el = document.getElementById("photo-preview");
    if (el.tagName !== "IMG") {
      const img = document.createElement("img");
      img.id = "photo-preview";
      img.className = "photo-preview";
      img.alt = "Vista previa";
      el.replaceWith(img);
      el = img;
    }
    el.src = url;
    el.className = "photo-preview";
  });

  removePhotoBtn.addEventListener("click", () => {
    pendingPhotoFile = null;
    removePhotoOnSave = true;
    photoFile.value = "";
    document.getElementById("item-image").value = "";
    refreshPhotoPreviewFromInput();
  });

  document.getElementById("item-image").addEventListener("input", () => {
    pendingPhotoFile = null;
    removePhotoOnSave = false;
    refreshPhotoPreviewFromInput();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    formStatus.className = "status";
    formStatus.textContent = "Guardando…";
    const payload = formPayload();
    const previousImage = items.find((row) => row.id === editingId)?.image_path || null;

    try {
      let id = editingId;
      if (editingId) {
        const { error } = await client.from("menu_items").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { data, error } = await client.from("menu_items").insert(payload).select("id").single();
        if (error) throw error;
        id = data.id;
        editingId = id;
      }

      if (removePhotoOnSave) {
        await deleteStorageIfNeeded(previousImage);
        const { error } = await client.from("menu_items").update({ image_path: null }).eq("id", id);
        if (error) throw error;
      } else if (pendingPhotoFile) {
        formStatus.textContent = "Subiendo foto…";
        const publicUrl = await uploadPhoto(id, pendingPhotoFile);
        if (previousImage && previousImage !== publicUrl) {
          try {
            await deleteStorageIfNeeded(previousImage);
          } catch (_) {}
        }
        const { error } = await client.from("menu_items").update({ image_path: publicUrl }).eq("id", id);
        if (error) throw error;
      }

      formStatus.className = "status ok";
      formStatus.textContent = "Guardado.";
      await loadData();
      closeModal();
    } catch (err) {
      formStatus.className = "status error";
      formStatus.textContent = err.message || "No se pudo guardar.";
    }
  });

  deleteBtn.addEventListener("click", async () => {
    if (!editingId) return;
    formStatus.className = "status";
    formStatus.textContent = "Eliminando…";
    try {
      const ok = await deleteItem(editingId);
      if (!ok) {
        formStatus.textContent = "";
        return;
      }
      await loadData();
      closeModal();
    } catch (err) {
      formStatus.className = "status error";
      formStatus.textContent = err.message;
    }
  });

  document.getElementById("item-badge").addEventListener("change", (event) => {
    const label = document.getElementById("item-badge-label");
    if (!label.value) {
      if (event.target.value === "veggie") label.value = "Vegetariana";
      if (event.target.value === "spicy") label.value = "Picante";
      if (event.target.value === "award") label.value = "Premio";
    }
  });

})();
