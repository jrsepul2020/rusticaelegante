-- Storage para fotos de carta · ejecutar en SQL Editor si aún no tienes políticas.
insert into storage.buckets (id, name, public)
values ('menu', 'menu', true)
on conflict (id) do nothing;

drop policy if exists "Public read menu images" on storage.objects;
create policy "Public read menu images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'menu');

drop policy if exists "Auth upload menu images" on storage.objects;
create policy "Auth upload menu images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'menu');

drop policy if exists "Auth update menu images" on storage.objects;
create policy "Auth update menu images"
on storage.objects for update
to authenticated
using (bucket_id = 'menu')
with check (bucket_id = 'menu');

drop policy if exists "Auth delete menu images" on storage.objects;
create policy "Auth delete menu images"
on storage.objects for delete
to authenticated
using (bucket_id = 'menu');
