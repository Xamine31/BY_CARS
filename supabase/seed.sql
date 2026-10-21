-- BY CARS — STOCK INITIAL
-- À exécuter APRÈS schema.sql si vous souhaitez préremplir le site.
-- Adaptez ensuite prix, kilométrage, finition et disponibilité depuis admin.html.

insert into public.vehicles
(id, brand, model, trim, price_ht, condition, year, mileage, fuel, transmission, engine, power_hp, color, doors, seats, description, photos, featured, available, published, created_at)
values
(
  '11111111-1111-4111-8111-111111111111',
  'Peugeot','3008','Hybrid 136 e-DCS6',28900,'occasion',2025,12800,
  'Hybride essence','Automatique','1.2 Hybrid',136,'Gris Artense',5,5,
  'SUV polyvalent, confortable et moderne, avec motorisation hybride et boîte automatique. Contactez BY CARS pour confirmer les équipements et la disponibilité.',
  array[
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Peugeot%203008%20C%20IMG%209387.jpg?width=1600',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Peugeot%203008%20C%20IMG%209394.jpg?width=1600'
  ],
  true,true,true,'2026-10-01T10:00:00+02:00'
),
(
  '22222222-2222-4222-8222-222222222222',
  'Renault','Clio 5','Techno TCe 90',16750,'neuf',2026,20,
  'Essence','Manuelle','1.0 TCe',90,'Blanc Nacré',5,5,
  'Citadine récente, économique et pratique, idéale pour un usage quotidien. Contactez BY CARS pour confirmer les équipements et la disponibilité.',
  array[
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Renault%20Clio%20V%20TCe%2090%20%282025%29%20%2854719727753%29.jpg?width=1600',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Renault%20Clio%20V%20TCe%2090%20%282025%29%20%2854717049164%29.jpg?width=1600'
  ],
  true,true,true,'2026-09-28T10:00:00+02:00'
),
(
  '33333333-3333-4333-8333-333333333333',
  'Dacia','Duster','Journey ECO-G 100',21900,'occasion',2024,22400,
  'GPL / Essence','Manuelle','ECO-G 100',100,'Noir',5,5,
  'SUV robuste et polyvalent avec motorisation bi-carburation GPL/essence. Contactez BY CARS pour confirmer les équipements et la disponibilité.',
  array[
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Dacia%20Duster%20III%20GIMS%202024%201X7A2248.jpg?width=1600',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Dacia%20Duster%20III%20GIMS%202024%201X7A2290.jpg?width=1600'
  ],
  true,true,true,'2026-09-20T10:00:00+02:00'
),
(
  '44444444-4444-4444-8444-444444444444',
  'Citroën','C3','Plus PureTech 100',15400,'neuf',2026,12,
  'Essence','Manuelle','1.2 PureTech',100,'Bleu',5,5,
  'Citadine compacte et confortable avec une présentation moderne. Contactez BY CARS pour confirmer les équipements et la disponibilité.',
  array[
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Citro%C3%ABn%20C3%20%282024%29%20%2853978897700%29.jpg?width=1600',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Citro%C3%ABn%20C3%20%282024%29%20%2853986509221%29.jpg?width=1600'
  ],
  false,true,true,'2026-09-15T10:00:00+02:00'
),
(
  '55555555-5555-4555-8555-555555555555',
  'Volkswagen','T-Roc','Life 1.5 TSI DSG',27600,'occasion',2024,18500,
  'Essence','Automatique','1.5 TSI',150,'Noir',5,5,
  'SUV compact bien équipé avec boîte automatique DSG. Contactez BY CARS pour confirmer les équipements et la disponibilité.',
  array[
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/2024%20Volkswagen%20T-Roc%20R-Line%20TSI%20-%201498cc%201.5%20%28150PS%29%20Petrol%20-%20Kings%20Red%20-%2003-2024%2C%20Front.jpg?width=1600',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/2024%20Volkswagen%20T-Roc%20R-Line%20TSI%20-%201498cc%201.5%20%28150PS%29%20Petrol%20-%20Kings%20Red%20-%2003-2024%2C%20Rear.jpg?width=1600'
  ],
  false,true,true,'2026-09-12T10:00:00+02:00'
),
(
  '66666666-6666-4666-8666-666666666666',
  'Toyota','Yaris Cross','Design Hybrid',24300,'occasion',2025,9100,
  'Hybride','Automatique','1.5 Hybrid',116,'Gris',5,5,
  'Crossover hybride compact, économique et adapté aux trajets urbains comme routiers. Contactez BY CARS pour confirmer les équipements et la disponibilité.',
  array[
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Toyota%20Yaris%20Cross%20%282024%29%20%2853954901674%29.jpg?width=1600',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Toyota%20Yaris%20Cross%20%282024%29%20%2853941442129%29.jpg?width=1600'
  ],
  false,true,true,'2026-09-09T10:00:00+02:00'
)
on conflict (id) do update set
  brand = excluded.brand,
  model = excluded.model,
  trim = excluded.trim,
  price_ht = excluded.price_ht,
  condition = excluded.condition,
  year = excluded.year,
  mileage = excluded.mileage,
  fuel = excluded.fuel,
  transmission = excluded.transmission,
  engine = excluded.engine,
  power_hp = excluded.power_hp,
  color = excluded.color,
  doors = excluded.doors,
  seats = excluded.seats,
  description = excluded.description,
  photos = excluded.photos,
  featured = excluded.featured,
  available = excluded.available,
  published = excluded.published;
