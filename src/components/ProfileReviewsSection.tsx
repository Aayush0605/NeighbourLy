import React, { useState, useEffect } from 'react';
import { 
  Star, 
  CheckCircle2, 
  Lock, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { UserProfile, Order, UserReview } from '../types';
import { canUserReviewProfile, fetchUserReviews, submitUserReview } from '../services/reviewService';

interface ProfileReviewsSectionProps {
  targetUser: UserProfile;
  currentUser: UserProfile | null;
  orders: Order[];
  onUpdateTargetUser?: (updated: UserProfile) => void;
  showToast?: (msg: string) => void;
}

export const ProfileReviewsSection: React.FC<ProfileReviewsSectionProps> = ({
  targetUser,
  currentUser,
  orders,
  onUpdateTargetUser,
  showToast = (_msg) => {},
}) => {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check eligibility: ONLY allow review if they have completed a task together
  const eligibility = canUserReviewProfile(currentUser, targetUser.id, orders);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchUserReviews(targetUser.id).then((fetched) => {
      if (isMounted) {
        setReviews(fetched);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [targetUser.id]);

  useEffect(() => {
    if (eligibility.completedOrders.length > 0 && !selectedOrderId) {
      setSelectedOrderId(eligibility.completedOrders[0].id);
    }
  }, [eligibility.completedOrders, selectedOrderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!comment.trim()) {
      showToast('Please write a brief review comment.');
      return;
    }

    const matchedOrder = eligibility.completedOrders.find((o) => o.id === selectedOrderId) || eligibility.completedOrders[0];
    const taskTitle = matchedOrder?.serviceTitle || 'Completed Neighborhood Task';

    setIsSubmitting(true);
    try {
      const res = await submitUserReview({
        targetUserId: targetUser.id,
        author: currentUser,
        orderId: matchedOrder?.id || `ord_${Date.now()}`,
        taskTitle,
        rating,
        comment: comment.trim(),
      });

      if (res.success && res.review) {
        const newReviews = [res.review, ...reviews];
        setReviews(newReviews);
        setComment('');
        setIsFormOpen(false);

        // Calculate new rating
        const totalRating = newReviews.reduce((sum, r) => sum + r.rating, 0);
        const newAvg = Number((totalRating / newReviews.length).toFixed(1));

        if (onUpdateTargetUser) {
          onUpdateTargetUser({
            ...targetUser,
            rating: newAvg,
            reviewCount: newReviews.length,
          });
        }

        showToast(`Review submitted successfully! Thank you for reviewing ${targetUser.name}.`);
      } else {
        showToast(res.error || 'Failed to submit review.');
      }
    } catch (err: any) {
      showToast('Error submitting review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black font-heading text-zinc-950">
              Verified Task Reviews
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {reviews.length || targetUser.reviewCount || 0} Reviews
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Peer feedback exclusively from verified completed tasks & milestones
          </p>
        </div>

        {/* Action Button: Only visible if eligible, otherwise lock banner explains condition */}
        {eligibility.canReview ? (
          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black shadow-md cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
          >
            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>{isFormOpen ? 'Close Review Form' : 'Write Verified Review'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-zinc-100/90 text-zinc-500 text-xs font-bold shrink-0">
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Review Option Locked</span>
          </div>
        )}
      </div>

      {/* CONDITION BANNER: When user is not eligible to review because no completed task exists */}
      {!eligibility.canReview && (
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/90 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div className="space-y-1 text-xs">
            <p className="font-bold text-zinc-900 flex items-center gap-1.5">
              <span>Task Completion Required to Review</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                Anti-Fraud Safety
              </span>
            </p>
            <p className="text-zinc-500 leading-relaxed text-[11px]">
              To maintain 100% genuine peer trust, reviews are only unlocked after completing a task together with this student through Proper Escrow Services protection.
            </p>
          </div>
        </div>
      )}

      {/* REVIEW FORM: Unlocked when task is completed */}
      {eligibility.canReview && isFormOpen && (
        <form onSubmit={handleSubmit} className="p-5 rounded-3xl bg-indigo-50/70 border border-indigo-200 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Leave Verified Review for {targetUser.name}</span>
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Task Completed ✓
            </span>
          </div>

          {/* Completed Task Selector */}
          {eligibility.completedOrders.length > 1 && (
            <div>
              <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                Select Completed Task
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:outline-none focus:border-indigo-600"
              >
                {eligibility.completedOrders.map((ord) => (
                  <option key={ord.id} value={ord.id}>
                    {ord.serviceTitle} (₹{ord.amount})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Interactive Star Rating */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-700 block">
              Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 rounded-lg hover:scale-115 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                          : 'fill-zinc-200 text-zinc-300'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="text-xs font-black text-zinc-800 ml-2">
                {rating} out of 5 stars
              </span>
            </div>
          </div>

          {/* Review Textarea */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-700 block">
              Your Feedback
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was their quality, delivery speed, and communication?"
              className="w-full p-3 bg-white border border-zinc-200 rounded-2xl text-xs text-zinc-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 placeholder:text-zinc-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Posting...' : 'Submit Verified Review'}</span>
            </button>
          </div>
        </form>
      )}

      {/* REVIEWS LIST */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-zinc-400">Loading verified reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-zinc-50 border border-zinc-200/80 space-y-2">
            <Star className="w-6 h-6 text-zinc-300 mx-auto" />
            <h4 className="text-xs font-bold text-zinc-700">No Verified Reviews Yet</h4>
            <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
              Reviews appear here after tasks are completed and approved under Proper Escrow Services protection.
            </p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-2.5 transition-all hover:border-zinc-300"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={rev.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={rev.authorName}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-zinc-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-zinc-950 truncate">
                      {rev.authorName}
                    </h5>
                    <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">Task: {rev.taskTitle}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-zinc-200 text-zinc-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-0.5">
                    {new Date(rev.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-700 leading-relaxed pl-10">
                "{rev.comment}"
              </p>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
