import { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  images: string[];
  startIndex: number;
  onClose: () => void;
}

export function ImageLightbox({ images, startIndex, onClose }: Props) {
  const handleClose = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 animate-fade-in"
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
      <img
        src={images[startIndex]}
        alt="Product full view"
        className="max-h-[90vh] max-w-full rounded-lg object-contain"
      />
    </div>
  );
}
