(async function () {
  const listStatus = document.getElementById("list-status");
  const grid = document.getElementById("promo-admin-grid");
  const modal = document.getElementById("promo-modal");
  const form = document.getElementById("promo-form");
  const formStatus = document.getElementById("promo-form-status");
  const photoPreview = document.getElementById("promo-photo-preview");
  const photoFile = document.getElementById("promo-photo-file");
  const removePhotoBtn = document.getElementById("promo-remove-photo");

  if (!RusticaPromosApi.hasConfig()) {
    listStatus.className = "status error";
    listStatus.textContent = "Configura js/supabase-config.js antes de usar el admin.";
    return;
  }

  let client;
  try {
    client = RusticaPromosApi.createClient();
  } catch (err) {
    listStatus.className = "status error";
    listStatus.textContent = err.message;
    return;
  }

  const {
    data: { session }
  } = await client.auth.getSession();
  if (!session) {
    location.replace("./");
    return;
  }

  document.getElementById("user-email").textContent = session.user.email || "Sesión activa";
  document.getElementById("logout-btn").addEventListener("click", async () => {
    await client.auth.signOut();
    location.replace("./");
  });

  window.RUSTICA_ASSET_PREFIX = "../";

  let promos = [];
  let editingSlot = null;
  let pendingPhotoFile = null;
  let removePhotoOnSave = false;

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
    return RusticaPromosApi.assetUrl(path.replace(/^\.\.\//, ""));
  }

  function on(id, event, handler) {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    if (el) el.addEventListener(event, handler);
  }

  function setPhotoPreview(path) {
    const src = imageSrc(path);
    let el = document.getElementById("promo-photo-preview");
    if (!el) return;
    if (!src) {
      if (el.tagName === "IMG") {
        const div = document.createElement("div");
        div.id = "promo-photo-preview";
        div.className = "photo-preview is-empty";
        div.textContent = "Sin foto";
        el.replaceWith(div);
      } else {
        el.className = "photo-preview is-empty";
        el.textContent = "Sin foto";
        el.removeAttribute("src");
      }
      return;
    }
    if (el.tagName !== "IMG") {
      const img = document.createElement("img");
      img.id = "promo-photo-preview";
      img.className = "photo-preview";
      img.alt = "Vista previa";
      el.replaceWith(img);
      el = img;
    }
    el.className = "photo-preview";
    el.src = src;
  }

  function renderGrid() {
    grid.innerHTML = promos
      .map((promo) => {
        const src = imageSrc(promo.image_path);
        const thumb = src
          ? `<img class="promo-admin-card__thumb" src="${escapeHtml(src)}" alt="" />`
          : `<div class="promo-admin-card__thumb is-empty">Sin foto</div>`;
        return `
          <article class="promo-admin-card" data-slot="${promo.slot}">
            ${thumb}
            <div class="promo-admin-card__body">
              <p class="promo-admin-card__slot">Slot ${promo.slot}</p>
              <h2>${escapeHtml(promo.title || "Sin título")}</h2>
              <p>${escapeHtml(promo.details || "Sin detalles")}</p>
              <div class="dish-card__meta">
                <span class="badge-pill ${promo.published ? "on" : "off"}">${promo.published ? "Publicada" : "Oculta"}</span>
                ${
                  promo.button_label
                    ? `<span class="badge-pill">${escapeHtml(promo.button_label)}</span>`
                    : ""
                }
              </div>
              <button class="btn btn-ghost btn-sm" type="button" data-edit-slot="${promo.slot}">Editar</button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  async function ensureSlots() {
    const missing = promos.filter((p) => !p.id);
    for (const slot of missing) {
      const { data, error } = await client
        .from("promotions")
        .upsert(
          {
            slot: slot.slot,
            title: slot.title || `Promoción ${slot.slot}`,
            details: slot.details || "",
            button_label: slot.button_label || "",
            button_url: slot.button_url || "",
            published: true
          },
          { onConflict: "slot" }
        )
        .select("*")
        .single();
      if (error) throw error;
      const idx = promos.findIndex((p) => p.slot === slot.slot);
      if (idx >= 0) promos[idx] = data;
    }
  }

  async function loadData() {
    listStatus.className = "status";
    listStatus.textContent = "Cargando…";
    try {
      promos = await RusticaPromosApi.fetchAllPromotionsAdmin(client);
      await ensureSlots();
      promos = await RusticaPromosApi.fetchAllPromotionsAdmin(client);
      renderGrid();
      listStatus.className = "status ok";
      listStatus.textContent = "3 huecos · edita cada promoción";
    } catch (err) {
      console.error(err);
      listStatus.className = "status error";
      listStatus.textContent =
        err.message ||
        "No se pudo cargar. Ejecuta supabase/promotions.sql en el SQL Editor.";
      grid.innerHTML = `<div class="dish-card"><p class="status error">${escapeHtml(
        err.message || "Error"
      )}</p></div>`;
    }
  }

  function openModal(promo) {
    editingSlot = promo.slot;
    pendingPhotoFile = null;
    removePhotoOnSave = false;
    document.getElementById("promo-id").value = promo.id || "";
    document.getElementById("promo-slot").value = String(promo.slot);
    document.getElementById("promo-modal-title").textContent = `Promoción ${promo.slot}`;
    document.getElementById("promo-modal-lead").textContent = `Slot ${promo.slot} de 3`;
    document.getElementById("promo-title").value = promo.title || "";
    document.getElementById("promo-details").value = promo.details || "";
    document.getElementById("promo-button-label").value = promo.button_label || "";
    document.getElementById("promo-button-url").value = promo.button_url || "";
    document.getElementById("promo-image").value = promo.image_path || "";
    document.getElementById("promo-published").checked = promo.published !== false;
    photoFile.value = "";
    setPhotoPreview(promo.image_path);
    formStatus.className = "status";
    formStatus.textContent = "";
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    editingSlot = null;
    pendingPhotoFile = null;
    removePhotoOnSave = false;
  }

  async function uploadPhoto(id, file) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `promos/${id}-${Date.now()}.${ext}`;
    const { error } = await client.storage.from("menu").upload(path, file, {
      upsert: true,
      contentType: file.type || "image/jpeg"
    });
    if (error) throw error;
    const { data } = client.storage.from("menu").getPublicUrl(path);
    return data.publicUrl;
  }

  async function deleteStorageIfNeeded(url) {
    if (!url || !/\/storage\/v1\/object\/public\/menu\//.test(url)) return;
    const path = url.split("/storage/v1/object/public/menu/")[1];
    if (!path) return;
    await client.storage.from("menu").remove([path]);
  }

  on(grid, "click", (event) => {
    const btn = event.target.closest("[data-edit-slot]");
    if (!btn) return;
    const slot = Number(btn.getAttribute("data-edit-slot"));
    const promo = promos.find((p) => p.slot === slot);
    if (promo) openModal(promo);
  });

  on("promo-cancel", "click", closeModal);
  on("promo-cancel-2", "click", closeModal);
  on(modal, "click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("open")) closeModal();
  });

  on(photoFile, "change", () => {
    const file = photoFile.files?.[0];
    if (!file) return;
    pendingPhotoFile = file;
    removePhotoOnSave = false;
    const url = URL.createObjectURL(file);
    let el = document.getElementById("promo-photo-preview");
    if (el.tagName !== "IMG") {
      const img = document.createElement("img");
      img.id = "promo-photo-preview";
      img.className = "photo-preview";
      img.alt = "Vista previa";
      el.replaceWith(img);
      el = img;
    }
    el.src = url;
    el.className = "photo-preview";
  });

  on(removePhotoBtn, "click", () => {
    pendingPhotoFile = null;
    removePhotoOnSave = true;
    photoFile.value = "";
    document.getElementById("promo-image").value = "";
    setPhotoPreview("");
  });

  on("promo-image", "input", () => {
    pendingPhotoFile = null;
    removePhotoOnSave = false;
    setPhotoPreview(document.getElementById("promo-image").value.trim());
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    formStatus.className = "status";
    formStatus.textContent = "Guardando…";

    const id = document.getElementById("promo-id").value || null;
    const slot = Number(document.getElementById("promo-slot").value);
    const previousImage = promos.find((p) => p.slot === slot)?.image_path || null;
    const payload = {
      slot,
      title: document.getElementById("promo-title").value.trim(),
      details: document.getElementById("promo-details").value.trim() || null,
      button_label: document.getElementById("promo-button-label").value.trim() || null,
      button_url: document.getElementById("promo-button-url").value.trim() || null,
      image_path: document.getElementById("promo-image").value.trim() || null,
      published: document.getElementById("promo-published").checked
    };

    try {
      let rowId = id;
      if (id) {
        const { error } = await client.from("promotions").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await client
          .from("promotions")
          .upsert(payload, { onConflict: "slot" })
          .select("id")
          .single();
        if (error) throw error;
        rowId = data.id;
      }

      if (removePhotoOnSave) {
        await deleteStorageIfNeeded(previousImage);
        const { error } = await client.from("promotions").update({ image_path: null }).eq("id", rowId);
        if (error) throw error;
      } else if (pendingPhotoFile) {
        formStatus.textContent = "Subiendo foto…";
        const publicUrl = await uploadPhoto(rowId, pendingPhotoFile);
        if (previousImage && previousImage !== publicUrl) {
          try {
            await deleteStorageIfNeeded(previousImage);
          } catch (_) {}
        }
        const { error } = await client.from("promotions").update({ image_path: publicUrl }).eq("id", rowId);
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

  await loadData();
})();
