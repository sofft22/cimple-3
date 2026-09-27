/*
# Add badges, reviews, product sort order, and cart-add tracking

## Purpose
Adds editable product badges (e.g. "New", "Top Selling"), a customer review system,
manual product ordering, and a cart_adds counter for top-selling calculations.

## 1. New Columns on `products`
- `badge` (text, nullable) — admin-editable label shown on product cards (e.g. "New", "Top Selling", "Best Seller"). NULL means no badge.
- `sort_order` (integer, default 0) — manual ordering set by admin drag-and-drop. Lower = earlier.
- `cart_adds` (integer, default 0) — incremented each time a product is added to cart, used for top-selling sorting.

## 2. New Table: `reviews`
- `id` (uuid, primary key)
- `product_id` (uuid, FK to products, cascade delete)
- `reviewer_name` (text, not null) — name entered by reviewer, no login required
- `rating` (integer 1-5, not null)
- `comment` (text, optional)
- `created_at` (timestamptz)
Indexes on product_id for fast lookup.

## 3. Security
- `reviews` gets RLS enabled with anon+authenticated CRUD (single-tenant, no login).
- Existing product policies remain active.

## 4. Important Notes
- All columns are additive — existing products get badge=NULL, sort_order=0, cart_adds=0.
- Reviews are public and anyone can post (name only, no auth).
- cart_adds is incremented via update from the frontend.
*/

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS badge text,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cart_adds integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(product_id, created_at DESC);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reviews" ON reviews;
CREATE POLICY "anon_select_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reviews" ON reviews;
CREATE POLICY "anon_insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_reviews" ON reviews;
CREATE POLICY "anon_update_reviews" ON reviews FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_reviews" ON reviews;
CREATE POLICY "anon_delete_reviews" ON reviews FOR DELETE
  TO anon, authenticated USING (true);
