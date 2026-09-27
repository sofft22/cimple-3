import { BRAND } from '@/config';
import { Instagram, MapPin, Truck } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Footer({ onNavigate, currentPage, totalPages, onPageChange }: Props) {
  return (
    <footer className="mt-auto bg-[#111] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {totalPages > 1 && (
          <div className="mb-5 flex items-center justify-center gap-1.5">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex h-9 items-center rounded-full px-4 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  page === currentPage
                    ? 'bg-brand-600 text-white'
                    : 'text-white/60 hover:bg-white/10'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex h-9 items-center rounded-full px-4 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              Next
            </button>
          </div>
        )}

        <div className="flex flex-col items-center gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-0.5"
            >
              <span className="font-display text-base font-bold text-white">{BRAND.name}</span>
              <span className="font-display text-base font-light text-white">{BRAND.nameLight}</span>
              <span className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
            </button>
            <div className="flex items-center gap-1.5 text-[11px] text-white/40">
              <MapPin className="h-3.5 w-3.5" /> {BRAND.address}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/40">
              <Truck className="h-3.5 w-3.5" /> {BRAND.deliveryInfo}
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 sm:items-end">
            <div className="flex gap-3">
              <button
                onClick={() => onNavigate('/deals')}
                className="text-[11px] text-white/50 transition-colors hover:text-brand-400"
              >
                Deals
              </button>
              <button
                onClick={() => onNavigate('/my-orders')}
                className="text-[11px] text-white/50 transition-colors hover:text-brand-400"
              >
                My Orders
              </button>
            </div>
            <a
              href={BRAND.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 transition-colors hover:text-brand-400"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-white/30 sm:text-right">
          © {new Date().getFullYear()} {BRAND.name} {BRAND.nameLight}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
