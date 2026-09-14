-- Actualiza el slot 1 con la promoción 2x1 de lunes.
update public.promotions
set
  title = '2x1 todos los lunes',
  image_path = 'assets/imagenes/promocion-2x1.jpeg',
  details = '2x1 en pizzas seleccionadas: Margherita, Diavola, Prosciutto, Prosciutto e Funghi, Quattro K y Tonno.',
  button_label = 'Ver Carta y Pedir',
  button_url = 'carta-rustica-napoletana/#pizzas-title',
  published = true
where slot = 1;
