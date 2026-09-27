import type { Product } from '@/types';
import { formatPrice } from '@/config';
import { ProductImage } from '@/components/ProductImage';
import { Star } from 'lucide-react';

interface Props {
  products: Product[];
  ratingsMap: Record<string, { avg: number; count: number }>;
  onNavigate: (path: string) => void;
}

export function PairsWellWith({ products, ratingsMap, onNavigate }: Props) {
  if (products.length === 0) return null;

  return (
    <div className="mt-10 border-t border-[#f0ece6] pt-8">
      <h3 className="mb-4 font-display text-lg font-bold text-[#1a1a1a]">Pairs Well With</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {products.map((product) => {
          const r = ratingsMap[product.id];
          return (
            <button
              key={product.id}
              onClick={() => onNavigate(`/product/${product.id}`)}
              className="group overflow-hidden rounded-lg border border-[#f0ece6] text-left transition-all hover:shadow-md"
            >
              <div className="relative aspect-square overflow-hidden bg-[#f9f5f0]">
                <ProductImage
                  product={product}
                  className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-2.5">
                <h4 className="line-clamp-1 text-[12px] font-medium text-[#333]">{product.name}</h4>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-brand-600">{formatPrice(product.price)}</span>
                  {r && r.count > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-[#999]">
                      <Star className="h-2.5 w-2.5 fill-brand-400 text-brand-400" />
                      {r.avg.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
