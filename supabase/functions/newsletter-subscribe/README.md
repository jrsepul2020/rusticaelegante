# Newsletter · Mailrelay vía Edge Function

## Datos de esta cuenta

- Panel: https://rusticanapoletana.ipzmarketing.com/
- Grupo / lista: `2`
- Endpoint usado: `POST /api/v1/subscribers/sync`

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

```bash
supabase functions deploy newsletter-subscribe
```

## 3. Front

El sitio ya carga `js/newsletter.js` y llama a:

`{SUPABASE_URL}/functions/v1/newsletter-subscribe`

con la anon key (solo autoriza la llamada; Mailrelay usa el secret del servidor).

## 4. Doble opt-in

Configura en Mailrelay si los nuevos contactos deben confirmar por email. La función no fuerza `status` para respetar esa política de la cuenta.
