export const BRAND = {
  name: 'Cimmple',
  nameLight: 'beauty',
  tagline: 'Everyday beauty, made effortless.',
  whatsappNumber: '2349134536064',
  adminPassword: 'admin123',
  currency: '₦',
  email: 'hello@cimmplebeauty.com',
  instagram: 'https://instagram.com/cimmplebeauty',
  tiktok: 'https://tiktok.com/@cimmplebeauty',
};

export const formatPrice = (price: number): string =>
  `${BRAND.currency}${price.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const PAGE_SIZE = 12;

export const BADGE_OPTIONS = [
  { value: '', label: 'No badge' },
  { value: 'New', label: 'New' },
  { value: 'Top Selling', label: 'Top Selling' },
  { value: 'Best Seller', label: 'Best Seller' },
  { value: 'Trending', label: 'Trending' },
  { value: 'Limited', label: 'Limited' },
];
