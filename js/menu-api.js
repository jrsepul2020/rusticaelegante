(function (global) {
  function hasConfig() {
    const cfg = global.RUSTICA_SUPABASE || {};
    return Boolean(cfg.url && cfg.anonKey && !cfg.url.includes("YOUR_PROJECT"));
  }

  function createClient() {
    if (!hasConfig()) return null;
    if (!global.supabase || !global.supabase.createClient) {
      throw new Error("Supabase SDK no cargado");
    }
    const cfg = global.RUSTICA_SUPABASE;
    return global.supabase.createClient(cfg.url, cfg.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }

  function assetUrl(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    const clean = path.replace(/^\.\.\//, "").replace(/^\//, "");
    if (clean.startsWith("assets/")) {
      const depth = global.RUSTICA_ASSET_PREFIX != null ? global.RUSTICA_ASSET_PREFIX : "../";
      return depth + clean;
    }
    return path;
  }

  async function fetchPublishedMenu(client) {
    const [{ data: categories, error: catError }, { data: items, error: itemError }] = await Promise.all([
      client
        .from("menu_categories")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true }),
      client
        .from("menu_items")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true })
    ]);

    if (catError) throw catError;
    if (itemError) throw itemError;

    return { categories: categories || [], items: items || [] };
  }

  async function fetchAllMenuAdmin(client) {
    const catRes = await client
      .from("menu_categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (catRes.error) throw catRes.error;

    const itemRes = await client
      .from("menu_items")
      .select("*")
      .order("name", { ascending: true });
    if (itemRes.error) throw itemRes.error;

    return {
      categories: catRes.data || [],
      items: itemRes.data || [],
      warnings: []
    };
  }

  global.RusticaMenuApi = {
    hasConfig,
    createClient,
    assetUrl,
    fetchPublishedMenu,
    fetchAllMenuAdmin
  };
})(window);
