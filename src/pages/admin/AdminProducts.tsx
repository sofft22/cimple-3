import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product, Category, ProductImage as PImage, ProductVariant } from '@/types';
import {
  formatPrice,
  PRODUCT_IMAGE_MAX_BYTES,
  PRODUCT_IMAGE_TYPES,
  PRODUCT_VIDEO_MAX_BYTES,
  PRODUCT_VIDEO_TYPES,
  BADGE_OPTIONS,
  DEAL_TYPE_OPTIONS,
  VARIANT_TYPE_OPTIONS,
} from '@/config';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Upload,
  ImageIcon,
  ZoomIn,
  Move,
  Video as VideoIcon,
} from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export function AdminProducts({ onNavigate }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), product_variants(*)')
      .order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleStock = async (p: Product) => {
    await supabase
      .from('products')
      .update({ in_stock: !p.in_stock })
      .eq('id', p.id);
    load();
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    await supabase.from('products').delete().eq('id', p.id);
    load();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/admin')}
            className="p-1 -ml-1 text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-1 h-9 px-3 rounded-xl bg-brand-500 text-white text-sm font-semibold active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">No products yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-3 text-brand-600 font-medium text-sm"
          >
            Add your first product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-gray-200 p-3 flex items-center gap-3 shadow-sm"
            >
              <ThumbImage product={p} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">
                  {p.name}
                </h3>
                <p className="text-brand-600 font-bold text-sm">
                  {formatPrice(p.price)}
                </p>
                {(p.product_images?.length ?? 0) > 0 && (
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {(p.product_images?.length ?? 0) + 1} photos
                  </p>
                )}
              </div>
              <button
                onClick={() => toggleStock(p)}
                className="flex-shrink-0"
                title={p.in_stock ? 'In Stock' : 'Sold Out'}
              >
                {p.in_stock ? (
                  <ToggleRight className="w-7 h-7 text-brand-500" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-gray-300" />
                )}
              </button>
              <button
                onClick={() => {
                  setEditing(p);
                  setShowForm(true);
                }}
                className="text-gray-400 hover:text-gray-900 transition-colors flex-shrink-0"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(p)}
                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function ThumbImage({ product }: { product: Product }) {
  const px = product.image_position_x ?? 50;
  const py = product.image_position_y ?? 50;
  const scale = product.image_scale ?? 1;
  return (
    <div className="w-14 h-14 rounded-xl bg-brand-50 overflow-hidden flex-shrink-0">
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-cover"
          style={{
            objectPosition: `${px}% ${py}%`,
            transform: `scale(${scale})`,
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-brand-200">
          <ImageIcon className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}

interface GalleryImage {
  id: string;
  url: string;
  posX: number;
  posY: number;
  scale: number;
}

interface VariantRow {
  id: string;
  variant_type: string;
  variant_name: string;
  price: string;
  in_stock: boolean;
}

function ProductForm({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product ? product.price.toString() : '');
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '');
  const [posX, setPosX] = useState(product?.image_position_x ?? 50);
  const [posY, setPosY] = useState(product?.image_position_y ?? 50);
  const [scale, setScale] = useState(product?.image_scale ?? 1);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(
    (product?.product_images ?? []).map((img: PImage) => ({
      id: img.id,
      url: img.image_url,
      posX: img.position_x,
      posY: img.position_y,
      scale: Number(img.scale),
    }))
  );
  const [deletedGalleryIds, setDeletedGalleryIds] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState<string>(
    product?.category_id ?? ''
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [inStock, setInStock] = useState(product?.in_stock ?? true);
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compare_at_price?.toString() ?? '');
  const [badge, setBadge] = useState(product?.badge ?? '');
  const [badge2, setBadge2] = useState(product?.badge2 ?? '');
  const [dealType, setDealType] = useState(product?.deal_type ?? 'none');
  const [videoUrl, setVideoUrl] = useState(product?.video_url ?? '');
  const [hasVariants, setHasVariants] = useState(product?.has_variants ?? false);
  const [variants, setVariants] = useState<VariantRow[]>(
    (product?.product_variants ?? []).map((v: ProductVariant) => ({
      id: v.id,
      variant_type: v.variant_type,
      variant_name: v.variant_name,
      price: v.price.toString(),
      in_stock: v.in_stock,
    }))
  );
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'move' | 'zoom'>('move');
  const [activeImage, setActiveImage] = useState<'main' | number>('main');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('name')
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, []);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!PRODUCT_IMAGE_TYPES.includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP image.');
      return null;
    }
    if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
      setError('Image is too large. Maximum size is 5 MB.');
      return null;
    }
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { contentType: file.type });
    if (upErr) {
      setError('Could not upload image. Please try again.');
      return null;
    }
    const { data: pub } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
    return pub.publicUrl;
  };

  const handleFile = async (file: File) => {
    setError('');
    setUploading(true);
    const url = await uploadImage(file);
    if (url) setImageUrl(url);
    setUploading(false);
  };

  const uploadVideo = async (file: File): Promise<string | null> => {
    if (!PRODUCT_VIDEO_TYPES.includes(file.type)) {
      setError('Please upload an MP4 or WebM video.');
      return null;
    }
    if (file.size > PRODUCT_VIDEO_MAX_BYTES) {
      setError('Video is too large. Maximum size is 20 MB.');
      return null;
    }
    const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
    const fileName = `vid-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { contentType: file.type });
    if (upErr) {
      setError('Could not upload video. Please try again.');
      return null;
    }
    const { data: pub } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
    return pub.publicUrl;
  };

  const handleVideoFile = async (file: File) => {
    setError('');
    setUploadingVideo(true);
    const url = await uploadVideo(file);
    if (url) setVideoUrl(url);
    setUploadingVideo(false);
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, { id: `temp-${Date.now()}`, variant_type: 'size', variant_name: '', price: '', in_stock: true }]);
    setHasVariants(true);
  };

  const updateVariant = (idx: number, field: keyof VariantRow, value: string | boolean) => {
    setVariants((prev) => prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v)));
  };

  const removeVariant = (idx: number) => {
    const v = variants[idx];
    if (!v.id.startsWith('temp-')) {
      setDeletedVariantIds((prev) => [...prev, v.id]);
    }
    setVariants((prev) => prev.filter((_, i) => i !== idx));
    if (variants.length <= 1) setHasVariants(false);
  };

  const handleGalleryFile = async (file: File) => {
    setError('');
    setUploadingGallery(true);
    const url = await uploadImage(file);
    if (url) {
      const newImg: GalleryImage = {
        id: `temp-${Date.now()}`,
        url,
        posX: 50,
        posY: 50,
        scale: 1,
      };
      setGalleryImages((prev) => [...prev, newImg]);
    }
    setUploadingGallery(false);
  };

  const removeGalleryImage = (idx: number) => {
    const img = galleryImages[idx];
    if (!img.id.startsWith('temp-')) {
      setDeletedGalleryIds((prev) => [...prev, img.id]);
    }
    setGalleryImages((prev) => prev.filter((_, i) => i !== idx));
    if (activeImage === idx) setActiveImage('main');
  };

  const currentImg: GalleryImage | null =
    activeImage === 'main'
      ? null
      : galleryImages[activeImage] ?? null;

  const currentPosX = currentImg ? currentImg.posX : posX;
  const currentPosY = currentImg ? currentImg.posY : posY;
  const currentScale = currentImg ? currentImg.scale : scale;
  const currentUrl = currentImg ? currentImg.url : imageUrl;

  const updateCurrent = (x: number, y: number, s: number) => {
    if (currentImg) {
      setGalleryImages((prev) =>
        prev.map((img, i) =>
          i === activeImage
            ? { ...img, posX: x, posY: y, scale: s }
            : img
        )
      );
    } else {
      setPosX(x);
      setPosY(y);
      setScale(s);
    }
  };

  const onDragStart = useCallback((e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onDragMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      const el = dragRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (mode === 'move') {
        const xPct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        const yPct = Math.round(((e.clientY - rect.top) / rect.height) * 100);
        const cx = Math.min(100, Math.max(0, xPct));
        const cy = Math.min(100, Math.max(0, yPct));
        updateCurrent(cx, cy, currentScale);
      } else {
        const yPct = (e.clientY - rect.top) / rect.height;
        const s = Math.min(3, Math.max(1, 1 + (0.5 - yPct) * 2));
        updateCurrent(currentPosX, currentPosY, s);
      }
    },
    [mode, currentScale, currentPosX, currentPosY, activeImage]
  );

  const onDragEnd = useCallback(() => {
    draggingRef.current = false;
  }, []);

  const handleSave = async () => {
    setError('');
    if (!name.trim() || !price.trim()) {
      setError('Name and price are required.');
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Price must be a valid number.');
      return;
    }
    setSaving(true);

    const compareNum = compareAtPrice.trim() ? parseFloat(compareAtPrice) : null;
    if (compareNum !== null && (isNaN(compareNum) || compareNum < 0)) {
      setError('Compare-at price must be a valid number.');
      setSaving(false);
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: priceNum,
      compare_at_price: compareNum,
      image_url: imageUrl,
      image_position_x: posX,
      image_position_y: posY,
      image_scale: scale,
      video_url: videoUrl || null,
      category_id: categoryId || null,
      in_stock: inStock,
      badge: badge || null,
      badge2: badge2 || null,
      deal_type: dealType,
      has_variants: hasVariants,
    };

    let productId = product?.id;

    if (product) {
      const { error: e } = await supabase
        .from('products')
        .update(payload)
        .eq('id', product.id);
      if (e) {
        setError('Could not save product. Please try again.');
        setSaving(false);
        return;
      }
    } else {
      const { data: newProd, error: e } = await supabase
        .from('products')
        .insert(payload)
        .select()
        .maybeSingle();
      if (e || !newProd) {
        setError('Could not save product. Please try again.');
        setSaving(false);
        return;
      }
      productId = newProd.id;
    }

    if (productId) {
      for (const img of galleryImages) {
        if (img.id.startsWith('temp-')) {
          await supabase.from('product_images').insert({
            product_id: productId,
            image_url: img.url,
            position_x: img.posX,
            position_y: img.posY,
            scale: img.scale,
          });
        } else {
          await supabase
            .from('product_images')
            .update({
              position_x: img.posX,
              position_y: img.posY,
              scale: img.scale,
            })
            .eq('id', img.id);
        }
      }

      for (const delId of deletedGalleryIds) {
        await supabase.from('product_images').delete().eq('id', delId);
      }

      for (const v of variants) {
        const vPrice = parseFloat(v.price);
        if (isNaN(vPrice)) continue;
        if (v.id.startsWith('temp-')) {
          await supabase.from('product_variants').insert({
            product_id: productId,
            variant_type: v.variant_type,
            variant_name: v.variant_name.trim(),
            price: vPrice,
            in_stock: v.in_stock,
          });
        } else {
          await supabase.from('product_variants').update({
            variant_type: v.variant_type,
            variant_name: v.variant_name.trim(),
            price: vPrice,
            in_stock: v.in_stock,
          }).eq('id', v.id);
        }
      }

      for (const delVId of deletedVariantIds) {
        await supabase.from('product_variants').delete().eq('id', delVId);
      }
    }

    setSaving(false);
    onSaved();
  };

  const inputCls =
    'w-full h-11 px-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-gray-100 z-10">
          <h2 className="font-bold text-gray-900">
            {product ? 'Edit Product' : 'New Product'}
          </h2>
          <button onClick={onClose} className="text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Main Image */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
              Main Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            {imageUrl ? (
              <div className="space-y-3">
                <div
                  ref={dragRef}
                  onPointerDown={onDragStart}
                  onPointerMove={onDragMove}
                  onPointerUp={onDragEnd}
                  onPointerCancel={onDragEnd}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-brand-50 cursor-grab active:cursor-grabbing touch-none select-none"
                >
                  <img
                    src={currentUrl}
                    alt="Preview"
                    draggable={false}
                    className="h-full w-full object-cover pointer-events-none"
                    style={{
                      objectPosition: `${currentPosX}% ${currentPosY}%`,
                      transform: `scale(${currentScale})`,
                    }}
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full pointer-events-none">
                    {mode === 'move' ? 'Drag to reposition' : 'Drag up/down to zoom'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode('move')}
                    className={`flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                      mode === 'move'
                        ? 'bg-brand-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Move className="w-3.5 h-3.5" /> Position
                  </button>
                  <button
                    onClick={() => setMode('zoom')}
                    className={`flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                      mode === 'zoom'
                        ? 'bg-brand-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <ZoomIn className="w-3.5 h-3.5" /> Zoom
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 px-3 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600"
                  >
                    Replace
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full aspect-square rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/50 flex flex-col items-center justify-center gap-2 text-brand-400 active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-8 h-8" />
                    <span className="text-sm font-medium">Tap to upload</span>
                    <span className="text-xs">JPG, PNG, or WebP — max 5 MB</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Additional Images */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
              Additional Photos
            </label>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleGalleryFile(f);
              }}
            />
            <div className="flex gap-2 flex-wrap">
              {galleryImages.map((img, i) => (
                <div
                  key={img.id}
                  className="relative w-16 h-16 rounded-xl overflow-hidden border-2 cursor-pointer"
                  onClick={() => setActiveImage(i)}
                >
                  <img
                    src={img.url}
                    alt={`Gallery ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeGalleryImage(i);
                    }}
                    className="absolute top-0 right-0 bg-black/60 text-white rounded-bl-lg w-5 h-5 flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {activeImage === i && (
                    <div className="absolute inset-0 ring-2 ring-brand-500 rounded-xl" />
                  )}
                </div>
              ))}
              <button
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingGallery}
                className="w-16 h-16 rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/50 flex items-center justify-center text-brand-400 active:scale-95 transition-transform disabled:opacity-50"
              >
                {uploadingGallery ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Tap a photo to adjust its position and zoom.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="Product name"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
              Price (₦)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputCls}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputCls}
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              placeholder="Product description"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Compare-at Price (optional)</label>
            <input type="number" step="0.01" min="0" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} className={inputCls} placeholder="Original price for discounts" />
            <p className="text-[11px] text-gray-400 mt-1">Set to show a crossed-out original price.</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Badge 1</label>
            <select value={badge} onChange={(e) => setBadge(e.target.value)} className={inputCls}>
              {BADGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Badge 2 (optional)</label>
            <select value={badge2} onChange={(e) => setBadge2(e.target.value)} className={inputCls}>
              {BADGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Deal Type</label>
            <select value={dealType} onChange={(e) => setDealType(e.target.value as typeof dealType)} className={inputCls}>
              {DEAL_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Video Upload */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Product Video (optional, under 10s)</label>
            <input ref={videoInputRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoFile(f); }} />
            {videoUrl ? (
              <div className="flex items-center gap-2">
                <video src={videoUrl} className="h-16 w-16 rounded-lg object-cover bg-gray-100" />
                <span className="text-xs text-gray-500 flex-1 truncate">{videoUrl.split('/').pop()}</span>
                <button onClick={() => videoInputRef.current?.click()} className="text-xs font-semibold text-gray-600 px-2 py-1 rounded-lg bg-gray-100">Replace</button>
                <button onClick={() => setVideoUrl('')} className="text-xs font-semibold text-red-500 px-2 py-1">Remove</button>
              </div>
            ) : (
              <button onClick={() => videoInputRef.current?.click()} disabled={uploadingVideo} className="w-full h-11 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-gray-500 text-sm disabled:opacity-50">
                {uploadingVideo ? <Loader2 className="w-5 h-5 animate-spin" /> : <><VideoIcon className="w-4 h-4" /> Upload short video</>}
              </button>
            )}
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-700">Variants (sizes, colors, etc.)</label>
              <button onClick={() => setHasVariants(!hasVariants)} className="text-xs font-semibold text-brand-600">{hasVariants ? 'Disable' : 'Enable'}</button>
            </div>
            {hasVariants && (
              <div className="space-y-2">
                {variants.map((v, i) => (
                  <div key={v.id} className="flex items-center gap-2">
                    <select value={v.variant_type} onChange={(e) => updateVariant(i, 'variant_type', e.target.value)} className="h-9 px-2 rounded-lg border border-gray-200 text-xs flex-shrink-0">
                      {VARIANT_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <input type="text" value={v.variant_name} onChange={(e) => updateVariant(i, 'variant_name', e.target.value)} className="h-9 px-2 rounded-lg border border-gray-200 text-xs flex-1" placeholder="e.g. Large" />
                    <input type="number" step="0.01" min="0" value={v.price} onChange={(e) => updateVariant(i, 'price', e.target.value)} className="h-9 px-2 rounded-lg border border-gray-200 text-xs w-20" placeholder="Price" />
                    <button onClick={() => updateVariant(i, 'in_stock', !v.in_stock)} className="flex-shrink-0">
                      {v.in_stock ? <ToggleRight className="w-6 h-6 text-brand-500" /> : <ToggleLeft className="w-6 h-6 text-gray-300" />}
                    </button>
                    <button onClick={() => removeVariant(i)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button onClick={addVariant} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
                  <Plus className="w-3.5 h-3.5" /> Add variant
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setInStock(!inStock)}
            className="w-full flex items-center justify-between p-3 rounded-xl border-2 border-gray-200"
          >
            <span className="text-sm font-medium text-gray-700">In Stock</span>
            {inStock ? (
              <ToggleRight className="w-7 h-7 text-brand-500" />
            ) : (
              <ToggleLeft className="w-7 h-7 text-gray-300" />
            )}
          </button>

          {error && (
            <p className="text-red-500 text-xs font-medium">{error}</p>
          )}
        </div>

        <div className="sticky bottom-0 bg-white px-5 py-4 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-11 rounded-xl font-bold bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Save Product'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
