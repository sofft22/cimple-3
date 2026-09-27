import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useOrderHistory } from '@/context/OrderHistoryContext';
import { useCart } from '@/context/CartContext';
import type { Order } from '@/types';
import { formatPrice } from '@/config';
import { Footer } from '@/components/Footer';
import { ArrowLeft, Loader2, Package, Clock, Truck, CheckCircle, RotateCcw, Trash2 } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

const statusConfig: Record<string, { icon: typeof Package; label: string; color: string }> = {
  pending: { icon: Clock, label: 'Pending', color: 'text-amber-600 bg-amber-50' },
  confirmed: { icon: Truck, label: 'Confirmed', color: 'text-blue-600 bg-blue-50' },
  delivered: { icon: CheckCircle, label: 'Delivered', color: 'text-green-600 bg-green-50' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function MyOrdersPage({ onNavigate }: Props) {
  const { orders: storedOrders, removeOrder } = useOrderHistory();
  const { addToCart, openCart } = useCart();
  const [liveOrders, setLiveOrders] = useState<Record<string, Order>>({});
  const [loading, setLoading] = useState(true);
  const [reorderId, setReorderId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (storedOrders.length === 0) {
        setLoading(false);
        return;
      }
      const ids = storedOrders.map((o) => o.orderId);
      const { data } = await supabase
        .from('orders')
        .select('*')
        .in('id', ids);
      if (data) {
        const map: Record<string, Order> = {};
        data.forEach((o) => { map[o.id] = o; });
        setLiveOrders(map);
      }
      setLoading(false);
    })();
  }, [storedOrders]);

  const handleReorder = async (order: Order) => {
    setReorderId(order.id);
    for (const item of order.items) {
      const { data: product } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('id', item.product_id)
        .maybeSingle();
      if (product) {
        addToCart(product, item.quantity);
      }
    }
    setReorderId(null);
    openCart();
  };

  const sortedOrders = storedOrders
    .map((s) => liveOrders[s.orderId])
    .filter((o): o is Order => !!o)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6">
        <button onClick={() => onNavigate('/')} className="mb-5 flex items-center gap-1 text-[13px] font-medium text-[#666] transition-colors hover:text-[#222]">
          <ArrowLeft className="h-4 w-4" /> Back to store
        </button>

        <h1 className="mb-1 font-display text-2xl font-bold text-[#1a1a1a]">My Orders</h1>
        <p className="mb-6 text-[13px] text-[#888]">Track your orders — no login needed.</p>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-brand-400" /></div>
        ) : sortedOrders.length === 0 ? (
          <div className="py-20 text-center">
            <Package className="mx-auto mb-3 h-10 w-10 text-[#e0dcd6]" />
            <p className="text-[14px] text-[#999]">No orders yet.</p>
            <button onClick={() => onNavigate('/')} className="mt-3 font-semibold text-brand-600">Start shopping</button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedOrders.map((order) => {
              const status = statusConfig[order.status] ?? statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <div key={order.id} className="rounded-xl border border-[#f0ece6] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-[16px] font-bold text-[#1a1a1a]">#{order.order_number}</span>
                      <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${status.color}`}>
                        <StatusIcon className="h-3 w-3" /> {status.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#aaa]">{formatDate(order.created_at)}</span>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-[13px]">
                        <span className="text-[#555]">{item.name} <span className="text-[#aaa]">x{item.quantity}</span></span>
                        <span className="font-medium text-[#333]">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#f0ece6] pt-3">
                    <span className="font-bold text-[#1a1a1a]">Total: {formatPrice(order.total)}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReorder(order)}
                        disabled={reorderId === order.id}
                        className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
                      >
                        {reorderId === order.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                        Reorder
                      </button>
                      <button
                        onClick={() => removeOrder(order.id)}
                        className="rounded-lg border border-[#e0dcd6] p-2 text-[#ccc] transition-colors hover:text-red-500"
                        aria-label="Remove from history"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer onNavigate={onNavigate} currentPage={1} totalPages={1} onPageChange={() => {}} />
    </div>
  );
}
