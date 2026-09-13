-- Placeholder temporal para Ensalada Maradona (sustituir por foto definitiva en admin).
update public.menu_items
set
  image_path = 'assets/carta/placeholder-ensalada-maradona.svg',
  anchor_id = coalesce(nullif(anchor_id, ''), 'plato-ensalada-maradona')
where name ilike '%maradona%';
