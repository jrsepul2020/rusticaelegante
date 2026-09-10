(function (global) {
  function statusEl(form) {
    return (
      form.querySelector(".newsletter-status") ||
      form.querySelector(".news-follow__status") ||
      form.querySelector("[data-newsletter-status]")
    );
  }

  function setStatus(form, type, message) {
    const el = statusEl(form);
    if (!el) return;
    el.hidden = false;
    el.classList.remove("is-ok", "is-error");
    if (type === "ok") el.classList.add("is-ok");
    if (type === "error") el.classList.add("is-error");
    el.textContent = message;
  }

  function endpoint() {
    const cfg = global.RUSTICA_SUPABASE || {};
    if (!cfg.url || !cfg.anonKey || String(cfg.url).includes("YOUR_PROJECT")) return null;
    return {
      url: `${String(cfg.url).replace(/\/$/, "")}/functions/v1/newsletter-subscribe`,
      anonKey: cfg.anonKey
    };
  }

  async function submitForm(form) {
    const btn = form.querySelector('button[type="submit"], button:not([type])');
    const nameInput = form.querySelector('[name="name"]');
    const emailInput = form.querySelector('[name="email"]');
    const privacyInput = form.querySelector('[name="privacy"]');

    const ep = endpoint();
    if (!ep) {
      setStatus(form, "error", "Falta configurar Supabase para la newsletter.");
      return;
    }

    if (privacyInput && !privacyInput.checked) {
      setStatus(form, "error", "Marca la casilla de privacidad para continuar.");
      return;
    }

    const name = (nameInput?.value || "").trim();
    const email = (emailInput?.value || "").trim();
    if (!name || !email) {
      setStatus(form, "error", "Completa nombre y email.");
      return;
    }

    if (btn) btn.disabled = true;
    setStatus(form, "", "Enviando…");

    try {
      const res = await fetch(ep.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ep.anonKey,
          Authorization: `Bearer ${ep.anonKey}`
        },
        body: JSON.stringify({
          name,
          email,
          privacy: true
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "No se pudo completar el alta.");
      }
      setStatus(form, "ok", data.message || "¡Gracias! Te has apuntado correctamente.");
      form.reset();
    } catch (err) {
      setStatus(form, "error", err.message || "Error al enviar. Inténtalo de nuevo.");
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function enhance(form) {
    form.removeAttribute("data-mailrelay-pending");
    form.setAttribute("data-newsletter", "mailrelay");
    form.setAttribute("novalidate", "");

    const btn =
      form.querySelector("button[disabled]") ||
      form.querySelector('button[type="button"]') ||
      form.querySelector("button");
    if (btn) {
      btn.disabled = false;
      btn.removeAttribute("title");
      btn.type = "submit";
      btn.textContent = btn.textContent.trim() || "Apuntarme";
    }

    const status = statusEl(form);
    if (status && /Mailrelay pendiente|conexión con Mailrelay pendiente/i.test(status.textContent || "")) {
      status.textContent = "";
      status.hidden = true;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitForm(form);
    });
  }

  function init() {
    document
      .querySelectorAll("form[data-mailrelay-pending], form[data-newsletter='mailrelay']")
      .forEach(enhance);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  global.RusticaNewsletter = { init };
})(window);
