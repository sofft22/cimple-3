import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Order, OrderStatus } from '@/types';
import { formatPrice } from '@/config';
import { ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-600',
  confirmed: 'bg-blue-50 text-blue-600',
  delivered: 'bg-pink-50 text-pink-600',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdminOrdersList({ onNavigate }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setOrders(data);
      setLoading(false);
    })();
  }, []);

  const filtered =
    filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const filterTabs: { key: OrderStatus | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'delivered', label: 'Delivered' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => onNavigate('/admin')}
          className="p-1 -ml-1 text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 h-8 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === tab.key
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-20">No orders found.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => (
            <button
              key={order.id}
              onClick={() => onNavigate(`/admin/orders/${order.id}`)}
              className="w-full bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3 hover:shadow-sm transition-all text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-900">
                    #{order.order_number}
                  </span>
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${statusStyles[order.status]}`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">
                  {order.customer_name}
                </p>
                <p className="text-[11px] text-gray-400">
                  {formatDate(order.created_at)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-gray-900">
                  {formatPrice(order.total)}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
