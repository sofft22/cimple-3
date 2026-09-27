import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/config';
import {
  Package,
  Clock,
  CheckCircle,
  ShoppingBag,
  Tag,
  ArrowRight,
  TrendingUp,
  DollarSign,
} from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

interface Stats {
  today: number;
  pending: number;
  delivered: number;
  totalRevenue: number;
  todayRevenue: number;
  totalOrders: number;
}

export function AdminDashboard({ onNavigate }: Props) {
  const [stats, setStats] = useState<Stats>({
    today: 0,
    pending: 0,
    delivered: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    totalOrders: 0,
  });

  useEffect(() => {
    (async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data: todayData } = await supabase
        .from('orders')
        .select('id, total')
        .gte('created_at', startOfDay.toISOString());

      const { count: pendingCount } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: deliveredCount } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'delivered');

      const { data: allOrders } = await supabase
        .from('orders')
        .select('id, total');

      const todayRev =
        todayData?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;
      const totalRev =
        allOrders?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;

      setStats({
        today: todayData?.length ?? 0,
        pending: pendingCount ?? 0,
        delivered: deliveredCount ?? 0,
        totalRevenue: totalRev,
        todayRevenue: todayRev,
        totalOrders: allOrders?.length ?? 0,
      });
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard
          icon={<ShoppingBag className="w-5 h-5" />}
          label="Today's Orders"
          value={stats.today.toString()}
          color="brand"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Pending"
          value={stats.pending.toString()}
          color="amber"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Delivered"
          value={stats.delivered.toString()}
          color="green"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Total Orders"
          value={stats.totalOrders.toString()}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <RevenueCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Today's Revenue"
          value={formatPrice(stats.todayRevenue)}
        />
        <RevenueCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
        />
      </div>

      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
        Manage
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MenuButton
          icon={<Package className="w-5 h-5" />}
          label="Orders"
          sublabel="View and manage all orders"
          onClick={() => onNavigate('/admin/orders')}
        />
        <MenuButton
          icon={<ShoppingBag className="w-5 h-5" />}
          label="Products"
          sublabel="Add, edit, and manage products"
          onClick={() => onNavigate('/admin/products')}
        />
        <MenuButton
          icon={<Tag className="w-5 h-5" />}
          label="Categories"
          sublabel="Add, edit, and manage categories"
          onClick={() => onNavigate('/admin/categories')}
        />
      </div>
    </div>
  );
}

const colorMap: Record<string, string> = {
  brand: 'bg-brand-50 text-brand-600',
  amber: 'bg-amber-50 text-amber-600',
  green: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
};

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
      <div
        className={`inline-flex w-10 h-10 rounded-xl items-center justify-center mb-2 ${colorMap[color]}`}
      >
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600 font-medium">{label}</p>
    </div>
  );
}

function RevenueCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-gray-900 rounded-2xl p-5 shadow-sm">
      <div className="inline-flex w-10 h-10 rounded-xl bg-white/10 items-center justify-center mb-2 text-white">
        {icon}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
    </div>
  );
}

function MenuButton({
  icon,
  label,
  sublabel,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3 hover:shadow-md transition-all active:scale-[0.98] text-left shadow-sm"
    >
      <div className="inline-flex w-10 h-10 rounded-xl bg-brand-50 items-center justify-center text-brand-600">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-600">{sublabel}</p>
      </div>
      <ArrowRight className="w-5 h-5 text-gray-300" />
    </button>
  );
}
