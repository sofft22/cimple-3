import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { Footer } from '@/components/Footer';
import { ReassuranceStrip } from '@/components/ReassuranceStrip';
import { StoreStats } from '@/components/StoreStats';
import { BRAND, PAGE_SIZE } from '@/config';
import { Loader2, Search, ChevronDown } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

type SortOption = 'featured' | 'newest' | 'top-selling' | 'rating' | 'price-low' | 'price-high' | 'alphabetical';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'top-selling', label: 'Top Selling' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'alphabetical', label: 'Alphabetical' },
];

export function HomePage({ onNavigate }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviewsMap, setReviewsMap] = useState<Record<string, { avg: number; count: number }>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sort, setSort] = useState<SortOption>('featured');
  const [showSort, setShowSort] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const query = search.trim().toLowerCase();
      const matchesSearch = !query || p.name.toLowerCase().includes(query);
      const matchesCategory = activeCategory === 'all' || p.category_id === activeCategory;
      return matchesSearch && matchesCategory;
    });

    switch (sort) {
      case 'newest':
        result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'top-selling':
        result = [...result].sort((a, b) => (b.cart_adds ?? 0) - (a.cart_adds ?? 0));
        break;
      case 'rating':
        result = [...result].sort((a, b) => (reviewsMap[b.id]?.avg ?? 0) - (reviewsMap[a.id]?.avg ?? 0));
        break;
      case 'price-low':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'alphabetical':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        result = [...result].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        break;
    }
    return result;
  }, [products, search, activeCategory, sort, reviewsMap]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const tabs: { id: string; label: string }[] = [
    { id: 'all', label: 'All' },
    ...categories.map((c) => ({ id: c.id, label: c.name })),
  ];

  const currentSortLabel = sortOptions.find((s) => s.value === sort)?.label ?? 'Featured';

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    setCurrentPage(1);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <section className="border-b border-[#f0ece6] bg-[#fdf8f4]">
        <div className="mx-auto max-w-6xl px-4 py-7 text-center sm:px-6 sm:py-8">
          <h1 className="font-display text-[28px] font-bold tracking-tight text-[#1a1a1a] sm:text-[34px]">
            {BRAND.tagline}
          </h1>
          <p className="mt-1.5 text-[13px] text-[#888]">{BRAND.subtitle}</p>
        </div>
      </section>

      <ReassuranceStrip />

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#aaa]" />
            <input
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search products..."
              className="h-10 w-full rounded-full border border-[#e8e1da] bg-white pl-10 pr-4 text-[13px] outline-none focus:border-brand-500"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex h-10 items-center gap-2 rounded-full border border-[#e8e1da] bg-white px-4 text-[12px] font-medium text-[#555]"
            >
              Sort: <span className="font-semibold text-[#333]">{currentSortLabel}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showSort ? 'rotate-180' : ''}`} />
            </button>
            {showSort && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
                <div className="absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-xl border border-[#eee] bg-white py-1 shadow-lg">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => { setSort(option.value); setShowSort(false); setCurrentPage(1); }}
                      className={`block w-full px-4 py-2 text-left text-[13px] transition-colors hover:bg-[#faf7f4] ${
                        sort === option.value ? 'font-semibold text-brand-600' : 'text-[#555]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {tabs.length > 1 && (
          <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleCategoryChange(tab.id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-[12px] font-semibold transition-colors ${
                  activeCategory === tab.id
                    ? 'bg-brand-600 text-white'
                    : 'border border-[#e8e1da] bg-white text-[#666] hover:bg-[#faf7f4]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-brand-400" /></div>
        ) : paginated.length === 0 ? (
          <p className="py-20 text-center text-sm text-[#999]">{search.trim() ? 'No products match your search.' : 'No products yet.'}</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
              {paginated.map((product) => {
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
            {totalPages > 1 && (
              <p className="mb-4 mt-6 text-center text-[12px] text-[#999]">
                Page {currentPage} of {totalPages} — {filtered.length} products
              </p>
            )}
          </>
        )}

        <StoreStats />
      </div>

      <Footer
        onNavigate={onNavigate}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
