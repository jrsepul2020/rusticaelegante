# Newsletter · Mailrelay vía Edge Function

## Datos de esta cuenta

- Panel: https://rusticanapoletana.ipzmarketing.com/
- Grupo / lista: `2`
- Flujo: `POST /api/v1/subscribers/sync` con `status: "inactive"` + `POST /api/v1/subscribers/{id}/resend_confirmation_email`

## Diagnóstico rápido

Si el contacto **aparece en Mailrelay** pero **no llega el email**:

1. La función desplegada en Supabase debe ser la de este repo (mensaje de éxito: *«¡Listo! Revisa tu correo y confirma la suscripción.»* y `confirmation_sent: true`).
2. Si la respuesta dice *«si Mailrelay pide confirmación»*, está desplegada una versión **antigua** que **no dispara** el correo: hay que redesplegar.
3. En Mailrelay: **Configuración → Remitentes** → el remitente por defecto debe estar **confirmado**.
4. Plantilla / proceso de **confirmación de suscripción** (doble opt-in) activo.
5. Revisar spam / promociones del destinatario.

## 1. Secret (obligatorio)

En Supabase → **Project Settings → Edge Functions → Secrets** (o CLI):

```bash
supabase secrets set MAILRELAY_API_KEY="TU_CLAVE_AQUI"
```

Opcional (ya hay valores por defecto en el código):

```bash
supabase secrets set MAILRELAY_BASE_URL="https://rusticanapoletana.ipzmarketing.com"
supabase secrets set MAILRELAY_GROUP_ID="2"
```

**Nunca** pongas la API key en `js/`, HTML ni Git.

## 2. Desplegar la función

Tras cambiar el código, vuelve a desplegar.

### Opción A · Panel Supabase

1. **Edge Functions** → `newsletter-subscribe` → editar.
2. Sustituye el código por el de `index.ts` de este directorio.
3. **Deploy**.

### Opción B · CLI

```bash
supabase link --project-ref fmyrwpknlfzkiakhweaq
supabase functions deploy newsletter-subscribe
```

## 3. Front

El sitio ya carga `js/newsletter.js` y llama a:

`{SUPABASE_URL}/functions/v1/newsletter-subscribe`

con la anon key (solo autoriza la llamada; Mailrelay usa el secret del servidor).

## 4. Doble opt-in y correos

Mailrelay **no** envía el correo de confirmación solo por crear el suscriptor. La función:

1. Crea/actualiza el contacto como `inactive`
2. Si no recibe `id` en el sync, lo busca por email
3. Llama a `resend_confirmation_email` (respuesta esperada: **204**)

Aviso al admin: las notificaciones internas (“nuevo suscriptor”) se activan en el panel de Mailrelay (ajustes/notificaciones), no las envía esta función.

## 5. Comprobar tras el deploy

```bash
curl -sS -X POST "https://fmyrwpknlfzkiakhweaq.supabase.co/functions/v1/newsletter-subscribe" \
  -H "Content-Type: application/json" \
  -H "apikey: TU_ANON_KEY" \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -d '{"name":"Prueba","email":"tu@email.com","privacy":true}'
```

Debe devolver algo como:

```json
{"ok":true,"confirmation_sent":true,"message":"¡Listo! Revisa tu correo y confirma la suscripción."}
```
