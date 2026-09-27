/*
# Add product image uploads and fitting controls

1. Modified Tables
- `products`
  - `image_position_x` (integer, default 50) — horizontal crop position from 0 to 100.
  - `image_position_y` (integer, default 50) — vertical crop position from 0 to 100.
  - `image_scale` (numeric, default 1) — image zoom level used by the storefront.

2. Storage
- Create the public `product-images` bucket for storefront product photos.
- Limit uploads to 5 MB and common image formats only.

3. Security
- Keep the existing single-business anon access model.
- Add separate storage policies for reading, uploading, updating, and deleting product images.

4. Important Notes
- Existing product records keep their current image URLs and use centered, unzoomed fitting defaults.
- New images are uploaded through the product manager instead of requiring a URL.
*/

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS image_position_x integer NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS image_position_y integer NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS image_scale numeric(4,2) NOT NULL DEFAULT 1;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[];

DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;
CREATE POLICY "public_read_product_images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "public_insert_product_images" ON storage.objects;
CREATE POLICY "public_insert_product_images"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "public_update_product_images" ON storage.objects;
CREATE POLICY "public_update_product_images"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "public_delete_product_images" ON storage.objects;
CREATE POLICY "public_delete_product_images"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'product-images');
