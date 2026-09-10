(function (global) {
  function createClient() {
    return global.RusticaMenuApi.createClient();
  }

  function hasConfig() {
    return global.RusticaMenuApi.hasConfig();
  }

  function assetUrl(path) {
    return global.RusticaMenuApi.assetUrl(path);
  }

  function normalizeSlots(rows) {
    const bySlot = new Map((rows || []).map((row) => [row.slot, row]));
    return [1, 2, 3].map((slot) => {
      const row = bySlot.get(slot);
      return (
        row || {
          id: null,
          slot,
          title: "",
          image_path: null,
          details: "",
          button_label: "",
          button_url: "",
          published: true
        }
      );
    });
  }

  async function fetchPublishedPromotions(client) {
    const { data, error } = await client
      .from("promotions")
      .select("*")
      .eq("published", true)
      .order("slot", { ascending: true });
    if (error) throw error;
    return normalizeSlots(data);
  }

  async function fetchAllPromotionsAdmin(client) {
    const { data, error } = await client
      .from("promotions")
      .select("*")
      .order("slot", { ascending: true });
    if (error) throw error;
    return normalizeSlots(data);
  }

  global.RusticaPromosApi = {
    hasConfig,
    createClient,
    assetUrl,
    normalizeSlots,
    fetchPublishedPromotions,
    fetchAllPromotionsAdmin
  };
})(window);
