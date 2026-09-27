import { BRAND } from '@/config';
import { ShieldCheck, MessageCircle } from 'lucide-react';

export function ReassuranceStrip() {
  return (
    <div className="flex items-center justify-center gap-2.5 bg-brand-600 px-4 py-2.5 text-white">
      <ShieldCheck className="h-4 w-4 flex-shrink-0" />
      <p className="text-[12px] font-medium leading-tight sm:text-[13px]">
        {BRAND.reassuranceText}
      </p>
      <MessageCircle className="h-4 w-4 flex-shrink-0" />
    </div>
  );
}
