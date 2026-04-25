-- Optional demo seed data for PostgreSQL
-- Usage: psql -U postgres -d campus_cat_map -f db/seed.postgres.sql

BEGIN;

INSERT INTO public.users (id, username, password_hash, role)
VALUES (1, 'demo_admin', 'demo', 'admin')
ON CONFLICT (username) DO NOTHING;

INSERT INTO public.cats (id, name, sex, description, neutered, created_by)
VALUES
  (1, '小橘', 'male', '常在图书馆附近出没，亲人。', TRUE, 1),
  (2, '小花', 'female', '教学楼附近比较警惕。', TRUE, 1),
  (3, '奶牛', 'male', '食堂附近的吃货。', FALSE, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sightings (cat_id, latitude, longitude, note, happened_at)
VALUES
  (1, 31.9132, 118.7811, '图书馆门口晒太阳', NOW() - INTERVAL '2 days'),
  (2, 31.9141, 118.7801, '第一教学楼旁边', NOW() - INTERVAL '1 days'),
  (3, 31.9125, 118.7817, '食堂附近要饭', NOW() - INTERVAL '3 hours')
ON CONFLICT DO NOTHING;

SELECT setval(pg_get_serial_sequence('public.users','id'), COALESCE((SELECT MAX(id) FROM public.users), 1), true);
SELECT setval(pg_get_serial_sequence('public.cats','id'), COALESCE((SELECT MAX(id) FROM public.cats), 1), true);
SELECT setval(pg_get_serial_sequence('public.cat_photos','id'), COALESCE((SELECT MAX(id) FROM public.cat_photos), 1), true);
SELECT setval(pg_get_serial_sequence('public.sightings','id'), COALESCE((SELECT MAX(id) FROM public.sightings), 1), true);
SELECT setval(pg_get_serial_sequence('public.feeding_points','id'), COALESCE((SELECT MAX(id) FROM public.feeding_points), 1), true);
SELECT setval(pg_get_serial_sequence('public.feeding_events','id'), COALESCE((SELECT MAX(id) FROM public.feeding_events), 1), true);

COMMIT;

