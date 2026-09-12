-- Layout 2 columnas + Aires destacada + nombre padelino
update public.menu_categories set layout = 'two_col' where slug in ('entrantes', 'focaccia', 'padelino');
update public.menu_categories set name = 'Pizzas al padelino' where slug = 'padelino';

update public.menu_items set
  description = 'Base de crema de boletus con tocino de la Sierra, tomate fiochi, parmesano crujiente y berenjena. 2ª Mejor Pizza de España en el Campeonato de España de Pizzas.',
  badge = 'award',
  badge_label = '2ª Campeonato de España',
  image_path = 'assets/aires-de-la-sierra-pizza-premiada-2.jpg',
  anchor_id = 'plato-aires-de-la-sierra',
  is_signature = true,
  featured_popular = false,
  featured_popular_kicker = null,
  featured_popular_blurb = null,
  featured_popular_sort = 0
where name = 'Aires de la Sierra';
