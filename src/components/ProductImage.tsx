import type { Product, ProductImage as PImage } from '@/types';
import { Package } from 'lucide-react';

interface Props {
  product: Product;
  className?: string;
  imageIndex?: number;
}

export function ProductImage({ product, className = '', imageIndex }: Props) {
  const gallery = product.product_images ?? [];
  const galleryImg: PImage | undefined =
    imageIndex != null && gallery.length > 0
      ? gallery[Math.min(imageIndex, gallery.length - 1)]
      : undefined;
  const url = galleryImg?.image_url ?? product.image_url;
  const positionX = galleryImg?.position_x ?? product.image_position_x ?? 50;
  const positionY = galleryImg?.position_y ?? product.image_position_y ?? 50;
  const scale = galleryImg?.scale ?? product.image_scale ?? 1;

  return (
    <div className={`overflow-hidden bg-[#f9f5f0] ${className}`}>
      {url ? (
        <img
          src={url}
          alt={product.name}
          className="h-full w-full object-cover"
          style={{
            objectPosition: `${positionX}% ${positionY}%`,
            transform: `scale(${scale})`,
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[#ddd0c0]">
          <Package className="h-10 w-10" />
        </div>
      )}
    </div>
  );
}
