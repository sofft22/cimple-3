import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, Repeat, Clock, Star } from 'lucide-react';

export function StoreStats() {
  const [stats, setStats] = useState({
    delivered: 0,
    repeatRate: 0,
    avgDeliveryDays: 0,
    avgRating: 0,
  });

  useEffect(() => {
    (async () => {
      const { data: orders } = await supabase
        .from('orders')
        .select('id, phone, status, created_at');

      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating');

      const delivered = orders?.filter((o) => o.status === 'delivered').length ?? 0;

      const phoneCounts: Record<string, number> = {};
      orders?.forEach((o) => {
        phoneCounts[o.phone] = (phoneCounts[o.phone] ?? 0) + 1;
      });
      const repeatCustomers = Object.values(phoneCounts).filter((c) => c > 1).length;
      const totalCustomers = Object.keys(phoneCounts).length;
      const repeatRate = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;

      const totalRating = reviews?.reduce((sum, r) => sum + r.rating, 0) ?? 0;
      const avgRating = reviews && reviews.length > 0 ? totalRating / reviews.length : 0;

      setStats({
        delivered,
        repeatRate,
        avgDeliveryDays: 3,
        avgRating,
      });
    })();
  }, []);

  const items = [
    { icon: Package, label: 'Orders Delivered', value: stats.delivered.toString() },
    { icon: Repeat, label: 'Repeat Rate', value: `${stats.repeatRate}%` },
    { icon: Clock, label: 'Delivery Time', value: `${stats.avgDeliveryDays} days` },
    { icon: Star, label: 'Avg Rating', value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center rounded-xl border border-[#f0ece6] bg-[#fdf8f4] py-4 text-center"
          >
            <item.icon className="mb-1.5 h-5 w-5 text-brand-500" />
            <span className="font-display text-xl font-bold text-[#1a1a1a]">{item.value}</span>
            <span className="text-[11px] text-[#888]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
