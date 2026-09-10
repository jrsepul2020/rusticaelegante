-- Rústica Napoletana · schema carta (Supabase)
-- Ejecutar en SQL Editor del proyecto Supabase.

create extension if not exists "pgcrypto";

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  eyebrow text,
  section_note text,
  pastel_class text,
  layout text not null default 'standard' check (layout in ('standard','two_col','simple','dessert')),
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.menu_categories(id) on delete cascade,
  name text not null,
  name_note text,
  description text,
  price_label text not null,
  badge text,
  badge_label text,
  image_path text,
  anchor_id text unique,
  sort_order int not null default 0,
  is_simple boolean not null default false,
  is_signature boolean not null default false,
  featured_chef boolean not null default false,
  featured_popular boolean not null default false,
  featured_kicker text,
  featured_blurb text,
  featured_popular_kicker text,
  featured_popular_blurb text,
  featured_sort int not null default 0,
  featured_popular_sort int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_items_category_sort_idx on public.menu_items (category_id, sort_order);
create index if not exists menu_categories_sort_idx on public.menu_categories (sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists menu_categories_updated_at on public.menu_categories;
create trigger menu_categories_updated_at
before update on public.menu_categories
for each row execute function public.set_updated_at();

drop trigger if exists menu_items_updated_at on public.menu_items;
create trigger menu_items_updated_at
before update on public.menu_items
for each row execute function public.set_updated_at();

alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;

drop policy if exists "Public read active categories" on public.menu_categories;
create policy "Public read active categories"
on public.menu_categories for select
to anon, authenticated
using (active = true);

drop policy if exists "Public read published items" on public.menu_items;
create policy "Public read published items"
on public.menu_items for select
to anon, authenticated
using (published = true);

drop policy if exists "Auth full categories" on public.menu_categories;
create policy "Auth full categories"
on public.menu_categories for all
to authenticated
using (true)
with check (true);

drop policy if exists "Auth full items" on public.menu_items;
create policy "Auth full items"
on public.menu_items for all
to authenticated
using (true)
with check (true);

-- Storage bucket opcional para fotos de carta.
-- Si falla (permisos), créalo en Dashboard > Storage como bucket público "menu".
do $$
begin
  insert into storage.buckets (id, name, public)
  values ('menu', 'menu', true)
  on conflict (id) do nothing;
exception when others then
  raise notice 'Storage bucket skip: %', sqlerrm;
end $$;