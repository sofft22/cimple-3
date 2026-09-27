import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { BRAND } from '@/config';
import { ShoppingBag, Heart } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
  currentPath: string;
}

export function Header({ onNavigate, currentPath }: Props) {
  const { totalItems, openCart } = useCart();
  const { count, toggle, has } = useWishlist();
  const isAdmin = currentPath.startsWith('/admin');

  const headerBg = isAdmin ? 'bg-[#1a1a1a]' : 'bg-white/95 backdrop-blur-md';
  const borderColor = isAdmin ? 'border-b border-white/10' : 'border-b border-[#f0ece6]';
  const textColor = isAdmin ? 'text-white' : 'text-[#1a1a1a]';
  const hoverBg = isAdmin ? 'hover:bg-white/10' : 'hover:bg-[#fdf2f8]';
  const subTextColor = isAdmin ? 'text-white/60' : 'text-[#666]';
  const iconColor = isAdmin ? 'text-white' : 'text-[#1a1a1a]';

  return (
    <header className={`sticky top-0 z-40 ${borderColor} ${headerBg} transition-colors`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <button
          onClick={() => onNavigate(isAdmin ? '/admin' : '/')}
          className="flex items-center gap-0"
          aria-label="Cimmple Beauty home"
        >
          <span className={`font-display text-xl font-bold tracking-tight ${textColor}`}>
            {BRAND.name}
          </span>
          <span className={`font-display text-xl font-light tracking-tight ${textColor}`}>
            {BRAND.nameLight}
          </span>
          <span className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onNavigate('/deals')}
            className={`rounded-full px-3 py-2 text-[12px] font-semibold transition-colors ${hoverBg} ${subTextColor}`}
          >
            Deals
          </button>
          <button
            onClick={() => onNavigate('/my-orders')}
            className={`rounded-full px-3 py-2 text-[12px] font-semibold transition-colors ${hoverBg} ${subTextColor}`}
          >
            My Orders
          </button>
          {currentPath.startsWith('/product/') && (() => {
            const pid = currentPath.match(/^\/product\/(.+)$/)?.[1] ?? '';
            return (
              <button
                onClick={() => pid && toggle(pid)}
                className={`relative rounded-full p-2 transition-colors ${hoverBg}`}
                aria-label="Toggle wishlist"
              >
                <Heart
                  className={`h-[20px] w-[20px] ${pid && has(pid) ? 'fill-brand-500 text-brand-500' : iconColor}`}
                  strokeWidth={1.8}
                />
              </button>
            );
          })()}
          <button
            onClick={openCart}
            className={`relative rounded-full p-2 transition-colors ${hoverBg}`}
            aria-label={`Cart with ${totalItems} items`}
          >
            <ShoppingBag className={`h-[20px] w-[20px] ${iconColor}`} strokeWidth={1.8} />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
