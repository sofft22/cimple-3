import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useOrderHistory } from '@/context/OrderHistoryContext';
import { supabase } from '@/lib/supabase';
import { BRAND, formatPrice } from '@/config';
import type { OrderItem } from '@/types';
import { ProductImage } from '@/components/ProductImage';
import { X, Minus, Plus, Trash2, Loader2, CheckCircle, ArrowRight } from 'lucide-react';

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    clearCart,
    totalItems,
  } = useCart();
  const { addOrder } = useOrderHistory();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderSent, setOrderSent] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setSubmitting(true);

    const orderItems: OrderItem[] = items.map((i) => ({
      product_id: i.product.id,
      name: i.variantName ? `${i.product.name} (${i.variantName})` : i.product.name,
      price: i.variantPrice ?? i.product.price,
      quantity: i.quantity,
    }));

    const { data, error: insertError } = await supabase
      .from('orders')
      .insert({
        customer_name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        items: orderItems,
        total: subtotal,
        status: 'pending',
      })
      .select()
      .maybeSingle();

    if (insertError || !data) {
      setError('Could not place order. Please try again.');
      setSubmitting(false);
      return;
    }

    addOrder(data.id, data.order_number);

    const lines = items.map(
      (i) =>
        `• ${i.variantName ? `${i.product.name} (${i.variantName})` : i.product.name} x${i.quantity} — ${formatPrice((i.variantPrice ?? i.product.price) * i.quantity)}`
    );

    const message = `*New Order #${data.order_number}*\n\n${lines.join('\n')}\n\n*Total: ${formatPrice(subtotal)}*\n\n*Customer Details:*\nName: ${name.trim()}\nPhone: ${phone.trim()}\nAddress: ${address.trim()}`;

    const waUrl = `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(message)}`;

    clearCart();
    window.open(waUrl, '_blank');
    setSubmitting(false);
    setOrderSent(true);
  };

  const handleClose = () => {
    closeCart();
    window.setTimeout(() => {
      setOrderSent(false);
      setError('');
      setName('');
      setPhone('');
      setAddress('');
    }, 300);
  };

  if (!isCartOpen) return null;

  const inputCls =
    'h-11 w-full rounded-lg border border-[#e0dcd6] bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/50 animate-fade-in" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white animate-slide-up sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#f0ece6] px-5 py-4">
          <h2 className="font-display text-lg font-bold text-[#1a1a1a]">
            {orderSent ? 'Order Confirmed' : `Your Cart (${totalItems})`}
          </h2>
          <button onClick={handleClose} className="rounded-full p-1.5 text-[#999] transition-colors hover:bg-[#f5f5f5] hover:text-[#333]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {orderSent ? (
          <div className="flex flex-col items-center px-5 py-10 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
              <CheckCircle className="h-7 w-7 text-brand-600" />
            </div>
            <h3 className="font-display text-xl font-bold text-[#1a1a1a]">Order placed!</h3>
            <p className="mt-1.5 max-w-[280px] text-sm text-[#777]">
              We've opened WhatsApp with your order details. Send the message to complete your order.
            </p>
            <div className="mt-6 flex w-full flex-col gap-2.5">
              <button
                onClick={() => {
                  setOrderSent(false);
                  handleClose();
                }}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Continue Shopping <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-[15px] text-[#999]">Your cart is empty.</p>
            <button onClick={handleClose} className="mt-3 font-semibold text-brand-600">Browse products</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.variantId ? `${item.product.id}-${item.variantId}` : item.product.id} className="flex gap-3">
                    <ProductImage product={item.product} className="h-16 w-16 flex-shrink-0 rounded-lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="line-clamp-1 text-[13px] font-medium text-[#333]">{item.product.name}</h4>
                          {item.variantName && (
                            <p className="text-[11px] text-[#999]">{item.variantName}</p>
                          )}
                        </div>
                        <button onClick={() => removeFromCart(item.product.id)} className="flex-shrink-0 text-[#ccc] transition-colors hover:text-red-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-[13px] font-bold text-brand-600">{formatPrice(item.variantPrice ?? item.product.price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded border border-[#e0dcd6] text-[#555] active:scale-90"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-[13px] font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded border border-[#e0dcd6] text-[#555] active:scale-90"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3 rounded-xl bg-[#faf7f4] p-4">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#666]">Delivery details</h3>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Full name" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="Phone number" />
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="w-full resize-none rounded-lg border border-[#e0dcd6] bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="Delivery address" />
                {error && <p className="text-xs font-medium text-red-500">{error}</p>}
              </div>
            </div>

            <div className="border-t border-[#f0ece6] px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[13px] text-[#666]">Subtotal</span>
                <span className="font-display text-lg font-bold text-[#1a1a1a]">{formatPrice(subtotal)}</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700 active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Place Order'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
