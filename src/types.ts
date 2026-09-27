export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  position_x: number;
  position_y: number;
  scale: number;
  sort_order: number;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_type: string;
  variant_name: string;
  price: number;
  in_stock: boolean;
  sort_order: number;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  verified: boolean;
  phone: string | null;
  created_at: string;
}

export type DealType = 'none' | 'flash' | 'bogo' | 'bundle';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  image_url: string;
  image_position_x: number;
  image_position_y: number;
  image_scale: number;
  video_url: string | null;
  in_stock: boolean;
  category_id: string | null;
  badge: string | null;
  badge2: string | null;
  deal_type: DealType;
  has_variants: boolean;
  sort_order: number;
  cart_adds: number;
  created_at: string;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
  reviews?: Review[];
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'delivered';

export interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variantId?: string;
  variantName?: string;
  variantPrice?: number;
}
