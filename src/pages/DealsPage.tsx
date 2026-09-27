import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { Footer } from '@/components/Footer';
import { ReassuranceStrip } from '@/components/ReassuranceStrip';
import { Loader2, Zap, Gift, Package } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export function DealsPage({ onNavigate }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviewsMap, setReviewsMap] = useState<Record<string, { avg: number; count: number }>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    (async () => {
      const [{ data: prodData, error: prodErr }, { data: catData }, { data: reviewData }] = await Promise.all([
        supabase.from('products').select('*, product_images(*), product_variants(*), reviews(*)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('reviews').select('product_id, rating'),
      ]);
      if (!prodErr && prodData) setProducts(prodData);
      if (catData) setCategories(catData);

      if (reviewData) {
        const map: Record<string, { avg: number; count: number }> = {};
        for (const r of reviewData) {
          if (!map[r.product_id]) map[r.product_id] = { avg: 0, count: 0 };
          map[r.product_id].avg += r.rating;
          map[r.product_id].count += 1;
        }
        for (const key of Object.keys(map)) {
          map[key].avg = map[key].avg / map[key].count;
        }
        setReviewsMap(map);
      }
      setLoading(false);
    })();
  }, []);

  const dealProducts = useMemo(() => {
    return products.filter((p) => {
      const hasDiscount = p.compare_at_price != null && p.compare_at_price > p.price;
      const isDeal = p.deal_type !== 'none';
      return hasDiscount || isDeal;
    });
  }, [products]);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return dealProducts;
    if (activeTab === 'sale') return dealProducts.filter((p) => p.compare_at_price != null && p.compare_at_price > p.price);
    if (activeTab === 'flash') return dealProducts.filter((p) => p.deal_type === 'flash');
    if (activeTab === 'bogo') return dealProducts.filter((p) => p.deal_type === 'bogo');
    if (activeTab === 'bundle') return dealProducts.filter((p) => p.deal_type === 'bundle');
    return dealProducts.filter((p) => p.category_id === activeTab);
  }, [dealProducts, activeTab]);

  const tabs: { id: string; label: string; icon?: typeof Zap }[] = [
    { id: 'all', label: 'All Deals' },
    { id: 'sale', label: 'On Sale' },
    { id: 'flash', label: 'Flash Deals', icon: Zap },
    { id: 'bogo', label: 'Buy X Get Y', icon: Gift },
    { id: 'bundle', label: 'Bundles', icon: Package },
    ...categories.map((c) => ({ id: c.id, label: c.name })),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <section className="border-b border-[#f0ece6] bg-gradient-to-r from-brand-50 to-[#fff5f9]">
        <div className="mx-auto max-w-6xl px-4 py-7 text-center sm:px-6 sm:py-8">
          <h1 className="font-display text-[28px] font-bold tracking-tight text-[#1a1a1a] sm:text-[34px]">
            Deals & Offers
          </h1>
          <p className="mt-1.5 text-[13px] text-[#888]">Save on your favourite beauty essentials.</p>
        </div>
      </section>

      <ReassuranceStrip />

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 whitespace-nowrap rounded-full px-4 py-2 text-[12px] font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white'
                  : 'border border-[#e8e1da] bg-white text-[#666] hover:bg-[#faf7f4]'
              }`}
            >
              {tab.icon && <tab.icon className="h-3.5 w-3.5" />}
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-brand-400" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Zap className="mx-auto mb-3 h-10 w-10 text-[#e0dcd6]" />
            <p className="text-[14px] text-[#999]">No deals available right now. Check back soon!</p>
            <button onClick={() => onNavigate('/')} className="mt-3 font-semibold text-brand-600">Browse all products</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => {
              const r = reviewsMap[product.id];
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  rating={r?.avg ?? 0}
                  reviewCount={r?.count ?? 0}
                  onClick={() => onNavigate(`/product/${product.id}`)}
                />
              );
            })}
          </div>
        )}
      </div>

      <Footer onNavigate={onNavigate} currentPage={1} totalPages={1} onPageChange={() => {}} />
    </div>
  );
}
