import type { Product } from '@/types';
import { formatPrice } from '@/config';
import { ProductImage } from '@/components/ProductImage';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Star, Heart, ShoppingBag, ChevronRight } from 'lucide-react';

interface Props {
  product: Product;
  rating: number;
  reviewCount: number;
  onClick: () => void;
}

const badgeStyles: Record<string, string> = {
  'New': 'bg-brand-600 text-white',
  'Bestseller': 'bg-[#1a1a1a] text-white',
  'Limited': 'bg-[#f59e0b] text-white',
  'Trending': 'bg-[#ec4899] text-white',
  'Sale': 'bg-red-500 text-white',
  'Top Selling': 'bg-[#1a1a1a] text-white',
};

export function ProductCard({ product, rating, reviewCount, onClick }: Props) {
  const { addToCart } = useCart();
  const { has, toggle } = useWishlist();

  const hasDiscount =
    product.compare_at_price != null &&
    product.compare_at_price > product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-xl border border-[#f0ece6] bg-white transition-all hover:shadow-md"
      aria-label={`View ${product.name}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f9f5f0]">
        <ProductImage
          product={product}
          className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.badge && (
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${badgeStyles[product.badge] ?? 'bg-brand-600 text-white'}`}>
              {product.badge}
            </span>
          )}
          {product.badge2 && (
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${badgeStyles[product.badge2] ?? 'bg-brand-600 text-white'}`}>
              {product.badge2}
            </span>
          )}
          {hasDiscount && (
            <span className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              Sale
            </span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); toggle(product.id); }}
          className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 backdrop-blur-sm transition-colors hover:bg-white"
          aria-label="Toggle wishlist"
        >
          <Heart
            className={`h-4 w-4 ${has(product.id) ? 'fill-brand-500 text-brand-500' : 'text-[#999]'}`}
          />
        </button>
        {!product.in_stock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#333]">Sold Out</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="line-clamp-1 text-[13px] font-medium text-[#333]">{product.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[15px] font-bold text-brand-600">{formatPrice(product.price)}</span>
          {hasDiscount && product.compare_at_price && (
            <span className="text-[12px] text-[#bbb] line-through">{formatPrice(product.compare_at_price)}</span>
          )}
          {reviewCount > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] text-[#999]">
              <Star className="h-3 w-3 fill-brand-400 text-brand-400" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        {product.in_stock && (
          <button
            onClick={product.has_variants ? onClick : handleAddToCart}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 py-2 text-[12px] font-semibold text-brand-600 transition-colors hover:bg-brand-100"
          >
            {product.has_variants ? (
              <>Choose Options <ChevronRight className="h-3.5 w-3.5" /></>
            ) : (
              <><ShoppingBag className="h-3.5 w-3.5" /> Add to Cart</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
