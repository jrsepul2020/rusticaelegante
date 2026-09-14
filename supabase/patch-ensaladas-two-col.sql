-- Ensaladas en 2 columnas (desktop).
update public.menu_categories
set layout = 'two_col'
where slug = 'ensaladas';
