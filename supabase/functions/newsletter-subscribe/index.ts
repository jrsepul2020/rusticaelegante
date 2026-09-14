// Supabase Edge Function · alta newsletter → Mailrelay
// Secrets necesarios (Dashboard → Edge Functions → Secrets):
//   MAILRELAY_API_KEY = (tu clave; nunca en el front ni en Git)
// Opcionales:
//   MAILRELAY_BASE_URL = https://rusticanapoletana.ipzmarketing.com
//   MAILRELAY_GROUP_ID = 2
//
// IMPORTANTE: tras cada cambio, redesplegar en Supabase.
// Mailrelay NO envía el correo de confirmación solo con sync:
// hay que llamar a POST /subscribers/{id}/resend_confirmation_email.

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

function subscriberId(payload: unknown): number | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data = root.data && typeof root.data === "object" ? (root.data as Record<string, unknown>) : root;
  const id = data.id;
  const n = typeof id === "number" ? id : Number(id);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function findSubscriberIdByEmail(
  baseUrl: string,
  headers: Record<string, string>,
  email: string
): Promise<number | null> {
  const url = `${baseUrl}/api/v1/subscribers?q[email_eq]=${encodeURIComponent(email)}&per_page=1`;
  const res = await fetch(url, { method: "GET", headers });
  if (!res.ok) {
    console.error("Mailrelay lookup error", res.status, await res.text());
    return null;
  }
  const payload = await res.json().catch(() => null);
  if (Array.isArray(payload)) return subscriberId(payload[0]);
  if (payload && typeof payload === "object") {
    const root = payload as Record<string, unknown>;
    if (Array.isArray(root.data)) return subscriberId(root.data[0]);
    return subscriberId(payload);
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  if (req.method !== "POST") {
    return json(405, { ok: false, error: "Método no permitido" });
  }

  const apiKey = Deno.env.get("MAILRELAY_API_KEY") || "";
  const baseUrl = (Deno.env.get("MAILRELAY_BASE_URL") || "https://rusticanapoletana.ipzmarketing.com").replace(
    /\/$/,
    ""
  );
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

  const headers = {
    "Content-Type": "application/json",
    "X-AUTH-TOKEN": apiKey
  };

  try {
    // inactive + resend_confirmation_email = doble opt-in (Mailrelay no envía el correo solo con sync)
    const upstream = await fetch(`${baseUrl}/api/v1/subscribers/sync`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email,
        name,
        group_ids: [groupId],
        status: "inactive",
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
      console.error("Mailrelay sync error", upstream.status, data);
      return json(502, {
        ok: false,
        error: "No se pudo completar el alta. Inténtalo de nuevo."
      });
    }

    let id = subscriberId(data);
    if (!id) {
      id = await findSubscriberIdByEmail(baseUrl, headers, email);
    }

    if (!id) {
      console.error("Mailrelay sync sin id de suscriptor", data);
      return json(502, {
        ok: false,
        error: "Alta creada, pero no se pudo enviar el correo de confirmación."
      });
    }

    // 204 No Content = éxito según la API de Mailrelay
    const confirm = await fetch(`${baseUrl}/api/v1/subscribers/${id}/resend_confirmation_email`, {
      method: "POST",
      headers
    });

    if (!(confirm.status === 204 || confirm.ok)) {
      const confirmText = await confirm.text();
      console.error("Mailrelay confirmation error", confirm.status, confirmText);
      return json(502, {
        ok: false,
        error:
          "Alta creada, pero Mailrelay no envió el correo de confirmación. Revisa remitente confirmado y plantilla de doble opt-in.",
        confirmation_status: confirm.status
      });
    }

    return json(200, {
      ok: true,
      confirmation_sent: true,
      message: "¡Listo! Revisa tu correo y confirma la suscripción."
    });
  } catch (err) {
    console.error(err);
    return json(500, { ok: false, error: "Error de conexión con Mailrelay" });
  }
});
