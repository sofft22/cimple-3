/*
# Add product variants, video, discounts, deal types, and verified reviews

## Purpose
Adds support for product variants (sizes/colors/lengths with their own prices),
optional product video, product-level discounts (compare_at_price), deal campaigns,
second badge, and verified-only reviews linked to delivered orders.

## 1. New Columns on `products`
- `compare_at_price` (numeric, nullable) — original price for discounted items; shown crossed out
- `video_url` (text, nullable) — optional short product video URL
- `badge2` (text, nullable) — second badge (vendor picks 1-2 tags)
- `deal_type` (text, default 'none') — none | flash | bogo | bundle
- `has_variants` (boolean, default false) — flag to show "Choose Options" vs "Add to Cart"

## 2. New Table: `product_variants`
- `id` (uuid, primary key)
- `product_id` (uuid, FK to products, cascade delete)
- `variant_type` (text) — 'size' | 'color' | 'length' | custom
- `variant_name` (text) — e.g. "Large", "Red", "18 inch"
- `price` (numeric) — price for this variant
- `in_stock` (boolean, default true)
- `sort_order` (integer, default 0)
Index on product_id.

## 3. Modified Table: `reviews`
- Added `verified` (boolean, default false) — true when reviewer has a delivered order
- Added `phone` (text, nullable) — phone number to match against delivered orders

## 4. Security
- `product_variants` gets RLS with anon+authenticated CRUD (single-tenant, no login).
- Existing review policies remain; new columns are covered by existing policies.

## 5. Important Notes
- All columns are additive — existing products get compare_at_price=NULL, video_url=NULL, badge2=NULL, deal_type='none', has_variants=false.
- Reviews now carry a phone field and verified flag. Old reviews get verified=false, phone=NULL.
- Variant prices are absolute (not adjustments) for simplicity.
*/

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS compare_at_price numeric(10,2),
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS badge2 text,
  ADD COLUMN IF NOT EXISTS deal_type text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS has_variants boolean NOT NULL DEFAULT false;

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone text;

CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_type text NOT NULL DEFAULT 'size',
  variant_name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  in_stock boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_product_variants" ON product_variants;
CREATE POLICY "anon_select_product_variants" ON product_variants FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_product_variants" ON product_variants;
CREATE POLICY "anon_insert_product_variants" ON product_variants FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_product_variants" ON product_variants;
CREATE POLICY "anon_update_product_variants" ON product_variants FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_product_variants" ON product_variants;
CREATE POLICY "anon_delete_product_variants" ON product_variants FOR DELETE
  TO anon, authenticated USING (true);
