-- Promociones (máx. 3 slots) · ejecutar en SQL Editor de Supabase.

create extension if not exists "pgcrypto";

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  slot int not null unique check (slot between 1 and 3),
  title text not null default '',
  image_path text,
  details text,
  button_label text,
  button_url text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists promotions_updated_at on public.promotions;
create trigger promotions_updated_at
before update on public.promotions
for each row execute function public.set_updated_at();

alter table public.promotions enable row level security;

drop policy if exists "Public read published promotions" on public.promotions;
create policy "Public read published promotions"
on public.promotions for select
to anon, authenticated
using (published = true);

drop policy if exists "Auth read all promotions" on public.promotions;
create policy "Auth read all promotions"
on public.promotions for select
to authenticated
using (true);

drop policy if exists "Auth write promotions" on public.promotions;
create policy "Auth write promotions"
on public.promotions for all
to authenticated
using (true)
with check (true);

-- Tres huecos fijos (1–3). Upsert seguro si ya existen.
insert into public.promotions (slot, title, image_path, details, button_label, button_url, published)
values
  (
    1,
    'Promo de temporada',
    'assets/imagenes/promo1.jpeg',
    'Consulta condiciones al reservar. Las ofertas pueden variar según disponibilidad.',
    'Reservar',
    'tel:+34611829414',
    true
  ),
  (
    2,
    'Mesa y horno',
    'assets/imagenes/promo2.jpeg',
    'Pregúntanos por la promoción vigente cuando llames para reservar tu mesa.',
    'Llamar',
    'tel:+34611829414',
    true
  ),
  (
    3,
    'Tercera promoción',
    null,
    'Espacio listo para una nueva oferta. Edítala desde el panel admin.',
    'Ver carta',
    'carta-rustica-napoletana/',
    true
  )
on conflict (slot) do nothing;

-- Fotos de promo en el mismo bucket público "menu" (carpeta promos/).
insert into storage.buckets (id, name, public)
values ('menu', 'menu', true)
on conflict (id) do nothing;
