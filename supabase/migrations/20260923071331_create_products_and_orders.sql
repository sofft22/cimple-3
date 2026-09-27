/*
# Create products and orders tables for product ordering portal

1. New Tables
- `products`
  - id (uuid, primary key)
  - name (text, not null)
  - description (text)
  - price (numeric, not null)
  - image_url (text)
  - in_stock (boolean, default true)
  - created_at (timestamptz)
- `orders`
  - id (uuid, primary key)
  - order_number (int, auto-incrementing sequence for human-readable order numbers)
  - customer_name (text, not null)
  - phone (text, not null)
  - address (text, not null)
  - items (jsonb, not null) — array of { product_id, name, price, quantity }
  - total (numeric, not null)
  - status (text, default 'pending') — pending | confirmed | delivered
  - created_at (timestamptz)

2. Security
- Enable RLS on both tables.
- Single-tenant app, no customer login. Admin uses a simple code/password.
- Allow anon + authenticated CRUD on both tables (USING true) because data is intentionally shared/public.

3. Notes
- Order number is a separate sequence so it is human-readable and independent of the uuid id.
*/

CREATE SEQUENCE IF NOT EXISTS orders_order_number_seq START 1001;

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  in_stock boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number integer NOT NULL DEFAULT nextval('orders_order_number_seq'),
  customer_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products: public CRUD
DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);

-- Orders: public CRUD
DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_orders" ON orders;
CREATE POLICY "anon_delete_orders" ON orders FOR DELETE
  TO anon, authenticated USING (true);
