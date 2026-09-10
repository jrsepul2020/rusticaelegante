// Supabase Edge Function · alta newsletter → Mailrelay
// Secrets necesarios (Dashboard → Edge Functions → Secrets):
//   MAILRELAY_API_KEY = (tu clave; nunca en el front ni en Git)
// Opcionales:
//   MAILRELAY_BASE_URL = https://rusticanapoletana.ipzmarketing.com
//   MAILRELAY_GROUP_ID = 2

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" }
  });
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  if (req.method !== "POST") {
    return json(405, { ok: false, error: "Método no permitido" });
  }

  const apiKey = Deno.env.get("MAILRELAY_API_KEY") || "";
  const baseUrl = (Deno.env.get("MAILRELAY_BASE_URL") || "https://rusticanapoletana.ipzmarketing.com").replace(/\/$/, "");
  const groupId = Number(Deno.env.get("MAILRELAY_GROUP_ID") || "2");

  if (!apiKey) {
    return json(500, { ok: false, error: "Mailrelay no configurado en el servidor" });
  }

  let payload: { name?: string; email?: string; privacy?: boolean };
  try {
    payload = await req.json();
  } catch {
    return json(400, { ok: false, error: "JSON inválido" });
  }

  const name = String(payload.name || "").trim().slice(0, 120);
  const email = String(payload.email || "").trim().toLowerCase().slice(0, 190);

  if (!payload.privacy) {
    return json(400, { ok: false, error: "Debes aceptar la política de privacidad" });
  }
  if (!name) {
    return json(400, { ok: false, error: "Indícanos tu nombre" });
  }
  if (!isEmail(email)) {
    return json(400, { ok: false, error: "Email no válido" });
  }

  try {
    const upstream = await fetch(`${baseUrl}/api/v1/subscribers/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-AUTH-TOKEN": apiKey
      },
      body: JSON.stringify({
        email,
        name,
        group_ids: [groupId],
        // Deja que Mailrelay gestione el estado / doble opt-in de la cuenta
        restore_if_deleted: true
      })
    });

    const text = await upstream.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!upstream.ok) {
      console.error("Mailrelay error", upstream.status, data);
      return json(502, {
        ok: false,
        error: "No se pudo completar el alta. Inténtalo de nuevo."
      });
    }

    return json(200, {
      ok: true,
      message: "¡Listo! Revisa tu correo si Mailrelay pide confirmación."
    });
  } catch (err) {
    console.error(err);
    return json(500, { ok: false, error: "Error de conexión con Mailrelay" });
  }
});
