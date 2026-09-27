export const BRAND = {
  name: 'Cimmple',
  nameLight: 'beauty',
  tagline: 'Everyday beauty, made effortless.',
  subtitle: 'Curated beauty essentials, delivered to your door.',
  whatsappNumber: '2349134536064',
  adminPassword: 'admin123',
  currency: '₦',
  email: 'hello@cimmplebeauty.com',
  instagram: 'https://instagram.com/cimmplebeauty',
  tiktok: 'https://tiktok.com/@cimmplebeauty',
  address: 'Lagos, Nigeria',
  deliveryInfo: 'Nationwide delivery — 2-5 business days',
  reassuranceText: 'No payment here — order goes to WhatsApp. Chat with us before you pay.',
};

export const formatPrice = (price: number): string =>
  `${BRAND.currency}${price.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const PRODUCT_VIDEO_MAX_BYTES = 20 * 1024 * 1024;
export const PRODUCT_VIDEO_TYPES = ['video/mp4', 'video/webm'];

export const PAGE_SIZE = 12;

export const BADGE_OPTIONS = [
  { value: '', label: 'No badge' },
  { value: 'New', label: 'New' },
  { value: 'Bestseller', label: 'Bestseller' },
  { value: 'Limited', label: 'Limited' },
  { value: 'Trending', label: 'Trending' },
  { value: 'Sale', label: 'Sale' },
];

export const DEAL_TYPE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'flash', label: 'Flash Deal' },
  { value: 'bogo', label: 'Buy X Get Y' },
  { value: 'bundle', label: 'Bundle' },
];

export const VARIANT_TYPE_OPTIONS = [
  { value: 'size', label: 'Size' },
  { value: 'color', label: 'Color' },
  { value: 'length', label: 'Length' },
  { value: 'other', label: 'Other' },
];
