import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import type { Product, CartItem } from '@/types';
import { supabase } from '@/lib/supabase';

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, variantId?: string, variantName?: string, variantPrice?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = useCallback((product: Product, quantity: number, variantId?: string, variantName?: string, variantPrice?: number) => {
    const cartKey = variantId ? `${product.id}-${variantId}` : product.id;
    setItems((prev) => {
      const existing = prev.find((i) => (i.variantId ? `${i.product.id}-${i.variantId}` : i.product.id) === cartKey);
      if (existing) {
        return prev.map((i) =>
          (i.variantId ? `${i.product.id}-${i.variantId}` : i.product.id) === cartKey
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity, variantId, variantName, variantPrice }];
    });
    supabase
      .from('products')
      .update({ cart_adds: (product.cart_adds ?? 0) + quantity })
      .eq('id', product.id)
      .then(() => {});
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.product.id === productId)
        : prev.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          )
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce(
    (sum, i) => sum + (i.variantPrice ?? i.product.price) * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
