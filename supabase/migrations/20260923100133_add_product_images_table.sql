/*
# Add multiple product images support

1. New Tables
- `product_images`
  - `id` (uuid, primary key)
  - `product_id` (uuid, foreign key to products, cascade delete)
  - `image_url` (text, not null)
  - `position_x` (integer, default 50) — horizontal crop position 0-100
  - `position_y` (integer, default 50) — vertical crop position 0-100
  - `scale` (numeric, default 1) — image zoom level
  - `sort_order` (integer, default 0) — display order
  - `created_at` (timestamptz)

2. Security
- Enable RLS on `product_images`.
- Allow anon + authenticated CRUD (single-business app, data is intentionally shared).

3. Important Notes
- The existing `image_url`, `image_position_x`, `image_position_y`, `image_scale` columns on `products` remain as the primary/fallback image.
- `product_images` stores additional gallery images for each product.
- Deleting a product cascades to delete its images.
*/

CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  position_x integer NOT NULL DEFAULT 50,
  position_y integer NOT NULL DEFAULT 50,
  scale numeric(4,2) NOT NULL DEFAULT 1,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_sort ON product_images(product_id, sort_order);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_product_images" ON product_images;
CREATE POLICY "anon_select_product_images" ON product_images FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_product_images" ON product_images;
CREATE POLICY "anon_insert_product_images" ON product_images FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_product_images" ON product_images;
CREATE POLICY "anon_update_product_images" ON product_images FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_product_images" ON product_images;
CREATE POLICY "anon_delete_product_images" ON product_images FOR DELETE
  TO anon, authenticated USING (true);
