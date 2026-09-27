import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product, Review, ProductVariant } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice } from '@/config';
import { ProductImage } from '@/components/ProductImage';
import { ImageLightbox } from '@/components/ImageLightbox';
import { ReviewSection } from '@/components/ReviewSection';
import { Footer } from '@/components/Footer';
import { PairsWellWith } from '@/components/PairsWellWith';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { ArrowLeft, Check, Minus, Plus, Loader2, Star, Expand, ChevronLeft, ChevronRight, Heart, Play, ShoppingBag } from 'lucide-react';

interface Props {
  productId: string;
  onNavigate: (path: string) => void;
}

export function ProductDetailPage({ productId, onNavigate }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [pairProducts, setPairProducts] = useState<Product[]>([]);
  const [pairRatings, setPairRatings] = useState<Record<string, { avg: number; count: number }>>({});
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { addToCart, openCart } = useCart();
  const { has, toggle } = useWishlist();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*), product_variants(*), reviews(*)')
        .eq('id', productId)
        .maybeSingle();
      if (!error && data) {
        setProduct(data);
        setActiveImg(0);
        setReviews(data.reviews ?? []);
        const variants = data.product_variants ?? [];
        if (variants.length > 0) {
          const firstInStock = variants.find((v: ProductVariant) => v.in_stock) ?? variants[0];
          setSelectedVariant(firstInStock);
        }
      }
      setLoading(false);
    })();
  }, [productId]);

  useEffect(() => {
    if (!product) return;
    (async () => {
      const { data: allProducts } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .neq('id', productId)
        .limit(4);
      if (allProducts && allProducts.length > 0) {
        setPairProducts(allProducts.slice(0, 4));
        const { data: reviewData } = await supabase
          .from('reviews')
          .select('product_id, rating');
        if (reviewData) {
          const map: Record<string, { avg: number; count: number }> = {};
          for (const r of reviewData) {
            if (!map[r.product_id]) map[r.product_id] = { avg: 0, count: 0 };
            map[r.product_id].avg += r.rating;
            map[r.product_id].count += 1;
          }
          for (const key of Object.keys(map)) {
            map[key].avg = map[key].avg / map[key].count;
          }
          setPairRatings(map);
        }
      }
    })();
  }, [product, productId]);

  const allImages: string[] = product
    ? [product.image_url, ...(product.product_images?.map((img) => img.image_url) ?? [])].filter(Boolean)
    : [];

  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  useEffect(() => {
    if (allImages.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveImg((prev) => (prev + 1) % allImages.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [allImages.length]);

  const currentPrice = selectedVariant ? selectedVariant.price : product?.price ?? 0;
  const hasDiscount =
    !selectedVariant &&
    product?.compare_at_price != null &&
    product.compare_at_price > product.price;

  const handleAdd = () => {
    if (!product) return;
    addToCart(product, quantity, selectedVariant?.id, selectedVariant?.variant_name, selectedVariant?.price);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  const handleAddAndOpen = () => {
    if (!product) return;
    addToCart(product, quantity, selectedVariant?.id, selectedVariant?.variant_name, selectedVariant?.price);
    openCart();
  };

  const variantGroups: Record<string, ProductVariant[]> = {};
  (product?.product_variants ?? []).forEach((v) => {
    if (!variantGroups[v.variant_type]) variantGroups[v.variant_type] = [];
    variantGroups[v.variant_type].push(v);
  });

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-brand-400" /></div>;

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-[#999]">Product not found.</p>
        <button onClick={() => onNavigate('/')} className="mt-4 font-semibold text-brand-600">Back to home</button>
      </div>
    );
  }

  const showVideoThumb = product.video_url && !showVideo;

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <button onClick={() => onNavigate('/')} className="mb-5 flex items-center gap-1 text-[13px] font-medium text-[#666] transition-colors hover:text-[#222]">
          <ArrowLeft className="h-4 w-4" /> Back to collection
        </button>

        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <div
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-[#f9f5f0]"
              onClick={() => showVideo ? setShowVideo(false) : setLightboxOpen(true)}
            >
              {showVideo && product.video_url ? (
                <video
                  ref={videoRef}
                  src={product.video_url}
                  controls
                  autoPlay
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <ProductImage
                    product={product}
                    imageIndex={activeImg > 0 ? activeImg - 1 : undefined}
                    className="h-full w-full"
                  />
                  {showVideoThumb && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowVideo(true); }}
                      className="absolute inset-0 flex items-center justify-center bg-black/20"
                      aria-label="Play video"
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                        <Play className="h-5 w-5 fill-brand-600 text-brand-600" />
                      </span>
                    </button>
                  )}
                  <div className="absolute right-3 top-3 rounded-full bg-white/80 p-2 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                    <Expand className="h-4 w-4 text-[#555]" />
                  </div>
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveImg((prev) => (prev - 1 + allImages.length) % allImages.length); }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-1.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-4 w-4 text-[#555]" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveImg((prev) => (prev + 1) % allImages.length); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-1.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-4 w-4 text-[#555]" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                        {allImages.map((_, i) => (
                          <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setActiveImg(i); }}
                            aria-label={`Go to image ${i + 1}`}
                            className={`h-1.5 rounded-full transition-all ${activeImg === i ? 'w-5 bg-brand-600' : 'w-1.5 bg-white/70'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {allImages.map((url, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveImg(i); setShowVideo(false); }}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${activeImg === i && !showVideo ? 'border-brand-600' : 'border-transparent'}`}
                >
                  <img src={url} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
              {product.video_url && (
                <button
                  onClick={() => setShowVideo(true)}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${showVideo ? 'border-brand-600' : 'border-transparent'}`}
                >
                  <div className="flex h-full w-full items-center justify-center bg-[#1a1a1a]">
                    <Play className="h-4 w-4 fill-white text-white" />
                  </div>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap gap-1">
                {product.badge && (
                  <span className="inline-flex w-fit rounded-full bg-brand-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    {product.badge}
                  </span>
                )}
                {product.badge2 && (
                  <span className="inline-flex w-fit rounded-full bg-[#1a1a1a] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    {product.badge2}
                  </span>
                )}
              </div>
              <button
                onClick={() => toggle(product.id)}
                className="rounded-full p-2 transition-colors hover:bg-[#fdf2f8]"
                aria-label="Toggle wishlist"
              >
                <Heart className={`h-5 w-5 ${has(product.id) ? 'fill-brand-500 text-brand-500' : 'text-[#ccc]'}`} />
              </button>
            </div>

            <h1 className="mt-2 font-display text-[26px] font-bold uppercase leading-tight tracking-tight text-[#1a1a1a]">{product.name}</h1>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[22px] font-bold text-brand-600">{formatPrice(currentPrice)}</span>
              {hasDiscount && product.compare_at_price && (
                <span className="text-[16px] text-[#bbb] line-through">{formatPrice(product.compare_at_price)}</span>
              )}
            </div>

            <div className="mt-2 flex items-center gap-3">
              <span className={`text-[13px] font-medium ${product.in_stock ? 'text-[#38925d]' : 'text-[#999]'}`}>
                {product.in_stock ? 'In Stock' : 'Sold Out'}
              </span>
              {reviews.length > 0 && (
                <span className="flex items-center gap-1 text-[12px] text-[#999]">
                  <Star className="h-3.5 w-3.5 fill-brand-500 text-brand-500" />
                  {avgRating.toFixed(1)} ({reviews.length} reviews)
                </span>
              )}
            </div>

            {product.description && (
              <p className="mt-5 text-[14px] leading-7 text-[#666]">{product.description}</p>
            )}

            {Object.keys(variantGroups).length > 0 && (
              <div className="mt-6 space-y-4">
                {Object.entries(variantGroups).map(([type, variants]) => (
                  <div key={type}>
                    <p className="mb-2 text-[13px] font-medium capitalize text-[#444]">{type}</p>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          disabled={!v.in_stock}
                          className={`rounded-lg border px-3 py-2 text-[12px] font-medium transition-colors disabled:opacity-40 ${
                            selectedVariant?.id === v.id
                              ? 'border-brand-600 bg-brand-50 text-brand-600'
                              : 'border-[#e0dcd6] text-[#555] hover:bg-[#faf7f4]'
                          }`}
                        >
                          {v.variant_name} — {formatPrice(v.price)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {product.in_stock && (
              <>
                <div className="mt-7">
                  <p className="mb-2 text-[13px] font-medium text-[#444]">Quantity</p>
                  <div className="flex w-fit items-center overflow-hidden rounded-lg border border-[#e0dcd6]">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex h-10 w-11 items-center justify-center text-[#555] hover:bg-[#faf7f4]" aria-label="Decrease">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="flex h-10 w-11 items-center justify-center border-x border-[#e0dcd6] text-sm font-semibold">{quantity}</span>
                    <button onClick={() => setQuantity((q) => q + 1)} className="flex h-10 w-11 items-center justify-center text-[#555] hover:bg-[#faf7f4]" aria-label="Increase">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                  <button
                    onClick={handleAdd}
                    className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.98] ${added ? 'bg-[#38925d]' : 'bg-[#1a1a1a] hover:bg-[#333]'}`}
                  >
                    {added ? <><Check className="h-4 w-4" /> Added to cart</> : <><ShoppingBag className="h-4 w-4" /> Add to cart</>}
                  </button>
                  <button
                    onClick={handleAddAndOpen}
                    className="flex h-12 flex-1 items-center justify-center rounded-lg bg-brand-600 text-sm font-semibold text-white transition-all hover:bg-brand-700 active:scale-[0.98]"
                  >
                    Buy now
                  </button>
                </div>
              </>
            )}

            <ReviewSection productId={product.id} />
          </div>
        </div>

        <PairsWellWith products={pairProducts} ratingsMap={pairRatings} onNavigate={onNavigate} />
      </div>

      {lightboxOpen && allImages.length > 0 && (
        <ImageLightbox images={allImages} startIndex={activeImg} onClose={() => setLightboxOpen(false)} />
      )}

      <FloatingWhatsApp productName={product.name} />

      <Footer onNavigate={onNavigate} currentPage={1} totalPages={1} onPageChange={() => {}} />
    </div>
  );
}
