import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Review } from '@/types';
import { Star, Loader2, BadgeCheck } from 'lucide-react';

interface Props {
  productId: string;
}

export function ReviewSection({ productId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [canReview, setCanReview] = useState(false);

  const loadReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (data) setReviews(data);
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const checkEligibility = async () => {
    if (!phone.trim()) {
      setCanReview(false);
      return;
    }
    const { data } = await supabase
      .from('orders')
      .select('id, status, items')
      .eq('phone', phone.trim())
      .eq('status', 'delivered');
    const hasProductInOrder = data?.some((o) =>
      o.items?.some((item: { product_id: string }) => item.product_id === productId)
    );
    setCanReview(!!hasProductInOrder);
  };

  useEffect(() => {
    if (phone.trim().length >= 7) {
      const timer = setTimeout(checkEligibility, 500);
      return () => clearTimeout(timer);
    }
    setCanReview(false);
  }, [phone, productId]);

  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number to verify your purchase.');
      return;
    }
    if (!canReview) {
      setError('Only customers with a delivered order for this product can review it.');
      return;
    }
    setSubmitting(true);
    const { error: insertError } = await supabase.from('reviews').insert({
      product_id: productId,
      reviewer_name: name.trim(),
      rating,
      comment: comment.trim(),
      phone: phone.trim(),
      verified: true,
    });
    if (insertError) {
      setError('Could not submit review. Please try again.');
      setSubmitting(false);
      return;
    }
    setName('');
    setPhone('');
    setRating(5);
    setComment('');
    setShowForm(false);
    setSubmitting(false);
    loadReviews();
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="mt-10 border-t border-[#f0ece6] pt-8">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-lg font-bold text-[#1a1a1a]">Reviews</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1">
              <Star className="h-3.5 w-3.5 fill-brand-500 text-brand-500" />
              <span className="text-[13px] font-bold text-brand-700">{avgRating.toFixed(1)}</span>
              <span className="text-[11px] text-brand-400">({reviews.length})</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg border border-[#e0dcd6] px-3 py-1.5 text-[12px] font-medium text-[#555] transition-colors hover:bg-[#faf7f4]"
        >
          {showForm ? 'Cancel' : 'Write a review'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl bg-[#faf7f4] p-4">
          <div className="space-y-3">
            <div className="rounded-lg bg-brand-50 p-2.5 text-[11px] text-brand-700">
              Only customers with a delivered order for this product can leave a review. Enter your phone number to verify.
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#666]">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#e0dcd6] bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                placeholder="Jane D."
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#666]">Phone number (for verification)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#e0dcd6] bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                placeholder="2349..."
              />
              {phone.trim().length >= 7 && (
                <p className={`mt-1 text-[11px] font-medium ${canReview ? 'text-green-600' : 'text-[#999]'}`}>
                  {canReview ? 'Verified — you can review this product.' : 'No delivered order found for this phone + product.'}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#666]">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} aria-label={`${star} stars`}>
                    <Star
                      className={`h-6 w-6 transition-colors ${star <= rating ? 'fill-brand-500 text-brand-500' : 'text-[#ddd]'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#666]">Comment (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-[#e0dcd6] bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                placeholder="Share your experience..."
              />
            </div>
            {error && <p className="text-xs font-medium text-red-500">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={submitting || !canReview}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Review'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-[#ddd]" /></div>
      ) : reviews.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#999]">No reviews yet. Only verified buyers can review.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-[#f0ece6] p-4">
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-[#333]">{review.reviewer_name}</span>
                  {review.verified && (
                    <span className="flex items-center gap-0.5 rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-600">
                      <BadgeCheck className="h-3 w-3" /> Verified Buyer
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#aaa]">{formatDate(review.created_at)}</span>
              </div>
              <div className="mb-2 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${star <= review.rating ? 'fill-brand-500 text-brand-500' : 'text-[#eee]'}`}
                  />
                ))}
              </div>
              {review.comment && <p className="text-[13px] leading-relaxed text-[#666]">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
