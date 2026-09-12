# Newsletter · Mailrelay vía Edge Function

## Datos de esta cuenta

- Panel: https://rusticanapoletana.ipzmarketing.com/
- Grupo / lista: `2`
- Flujo: `POST /api/v1/subscribers/sync` con `status: "inactive"` + `POST /api/v1/subscribers/{id}/resend_confirmation_email`

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

Tras cambiar el código, vuelve a desplegar (CLI o pegando el `index.ts` en el editor de Edge Functions):

```bash
supabase functions deploy newsletter-subscribe
```

## 3. Front

El sitio ya carga `js/newsletter.js` y llama a:

`{SUPABASE_URL}/functions/v1/newsletter-subscribe`

con la anon key (solo autoriza la llamada; Mailrelay usa el secret del servidor).

## 4. Doble opt-in y correos

Mailrelay **no** envía el correo de confirmación solo por crear el suscriptor. La función:

1. Crea/actualiza el contacto como `inactive`
2. Llama a `resend_confirmation_email` para disparar el email

Comprueba en Mailrelay:

- **Configuración → Remitentes**: el sender por defecto debe estar **confirmado**
- Plantilla de confirmación de suscripción activa
- Bandeja de spam del suscriptor

Aviso al admin: las notificaciones internas (“nuevo suscriptor”) se activan en el panel de Mailrelay (ajustes/notificaciones), no las envía esta función.
