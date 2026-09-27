import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Order, OrderStatus } from '@/types';
import { formatPrice } from '@/config';
import { ArrowLeft, CheckCircle, Truck, Loader2, Phone, MapPin, User } from 'lucide-react';

interface Props {
  orderId: string;
  onNavigate: (path: string) => void;
}

const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-600',
  confirmed: 'bg-blue-50 text-blue-600',
  delivered: 'bg-pink-50 text-pink-600',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function AdminOrderDetail({ orderId, onNavigate }: Props) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();
    if (!error && data) setOrder(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [orderId]);

  const updateStatus = async (status: OrderStatus) => {
    setUpdating(true);
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    if (!error) {
      setOrder((prev) => (prev ? { ...prev, status } : prev));
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400">Order not found.</p>
        <button
          onClick={() => onNavigate('/admin/orders')}
          className="mt-4 text-pink-600 font-medium"
        >
          Back to orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 pb-28">
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => onNavigate('/admin/orders')}
          className="p-1 -ml-1 text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Order #{order.order_number}
        </h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">Status</span>
          <span
            className={`text-xs font-semibold uppercase px-3 py-1 rounded-full ${statusStyles[order.status]}`}
          >
            {order.status}
          </span>
        </div>
        <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 space-y-3">
        <h2 className="font-bold text-gray-900 text-sm">Customer</h2>
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-700">{order.customer_name}</span>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <a
            href={`tel:${order.phone}`}
            className="text-sm text-gray-700 hover:text-pink-600"
          >
            {order.phone}
          </a>
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-gray-700">{order.address}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
        <h2 className="font-bold text-gray-900 text-sm mb-3">Items</h2>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="text-sm">
                <span className="text-gray-900 font-medium">{item.name}</span>
                <span className="text-gray-400"> x{item.quantity}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center">
          <span className="font-bold text-gray-900">Total</span>
          <span className="font-bold text-lg text-gray-900">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          {order.status !== 'confirmed' && order.status !== 'delivered' && (
            <button
              onClick={() => updateStatus('confirmed')}
              disabled={updating}
              className="flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5" />
              Mark Confirmed
            </button>
          )}
          {order.status !== 'delivered' && (
            <button
              onClick={() => updateStatus('delivered')}
              disabled={updating}
              className="flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 bg-pink-600 text-white hover:bg-pink-700 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Truck className="w-5 h-5" />
              Mark Delivered
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
