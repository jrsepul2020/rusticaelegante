-- Fix lectura admin · si el panel muestra 0 platos, ejecuta esto en SQL Editor.
-- Las políticas FOR ALL a veces no cubren bien el SELECT; estas sí.

drop policy if exists "Auth read all categories" on public.menu_categories;
create policy "Auth read all categories"
on public.menu_categories for select
to authenticated
using (true);

drop policy if exists "Auth write categories" on public.menu_categories;
create policy "Auth write categories"
on public.menu_categories for all
to authenticated
using (true)
with check (true);

drop policy if exists "Auth read all items" on public.menu_items;
create policy "Auth read all items"
on public.menu_items for select
to authenticated
using (true);

drop policy if exists "Auth write items" on public.menu_items;
create policy "Auth write items"
on public.menu_items for all
to authenticated
using (true)
with check (true);
