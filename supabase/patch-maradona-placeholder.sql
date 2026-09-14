-- Foto definitiva Ensalada Maradona + ancla estable.
update public.menu_items
set
  image_path = 'assets/carta/ensalada-maradona.jpeg',
  anchor_id = coalesce(nullif(anchor_id, ''), 'plato-ensalada-maradona')
where name ilike '%maradona%';
