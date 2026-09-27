import { BRAND } from '@/config';
import { MessageCircle } from 'lucide-react';

interface Props {
  productName: string;
}

export function FloatingWhatsApp({ productName }: Props) {
  const message = `Hi ${BRAND.name} ${BRAND.nameLight}! I'm interested in ${productName}.`;
  const waUrl = `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform active:scale-90"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
