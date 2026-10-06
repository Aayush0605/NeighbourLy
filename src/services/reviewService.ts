import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc 
} from 'firebase/firestore';
import { UserReview, UserProfile, Order } from '../types';

/**
 * Checks if the current user is eligible to write a review for the target profile.
 * STRICT ENFORCEMENT: A review option is ONLY unlocked if the users have completed at least one task together.
 */
export function canUserReviewProfile(
  currentUser: UserProfile | null | undefined,
  targetUserId: string,
  orders: Order[]
): { canReview: boolean; completedOrders: Order[]; reason?: string } {
  if (!currentUser) {
    return {
      canReview: false,
      completedOrders: [],
      reason: 'Please log in to leave a review.',
    };
  }

  if (currentUser.id === targetUserId || currentUser.userId === targetUserId) {
    return {
      canReview: false,
      completedOrders: [],
      reason: 'You cannot review your own profile.',
    };
  }

  // Look for any order that is completed and involves both users
  const completedOrders = orders.filter((o) => {
    if (o.status !== 'completed') return false;
    const isBuyer = o.buyerId === currentUser.id || o.buyerId === currentUser.userId;
    const isSeller = o.sellerId === currentUser.id || o.sellerId === currentUser.userId;
    const targetIsBuyer = o.buyerId === targetUserId;
    const targetIsSeller = o.sellerId === targetUserId;

    return (isBuyer && targetIsSeller) || (isSeller && targetIsBuyer);
  });

  if (completedOrders.length === 0) {
    return {
      canReview: false,
      completedOrders: [],
      reason: 'Reviews are locked. You must complete at least one task together with this student before you can leave a review.',
    };
  }

  return {
    canReview: true,
    completedOrders,
  };
}

/**
 * Fetches verified reviews for a specific user from Firestore
 */
export async function fetchUserReviews(targetUserId: string): Promise<UserReview[]> {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('targetUserId', '==', targetUserId)
    );
    const snap = await getDocs(q);
    const list: UserReview[] = [];
    snap.forEach((d) => {
      list.push(d.data() as UserReview);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (err) {
    console.warn('Error fetching reviews from Firestore:', err);
    // Return sample verified reviews if newly created or offline
    return [];
  }
}

/**
 * Submits a new verified review for a student profile
 */
export async function submitUserReview(params: {
  targetUserId: string;
  author: UserProfile;
  orderId: string;
  taskTitle: string;
  rating: number;
  comment: string;
}): Promise<{ success: boolean; review?: UserReview; error?: string }> {
  try {
    const { targetUserId, author, orderId, taskTitle, rating, comment } = params;

    const safeRating = Math.max(1, Math.min(5, Math.round(rating)));
    if (!comment.trim()) {
      return { success: false, error: 'Please enter a review comment.' };
    }

    const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const review: UserReview = {
      id: reviewId,
      targetUserId,
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatar,
      orderId,
      taskTitle: taskTitle || 'Completed Task Deliverable',
      rating: safeRating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    // Save to global reviews collection
    const revRef = doc(db, 'reviews', reviewId);
    await setDoc(revRef, review);

    // Also mirror to user subcollection
    const userRevRef = doc(db, 'users', targetUserId, 'reviews', reviewId);
    await setDoc(userRevRef, review);

    // Update target user's aggregate rating and review count
    try {
      const userRef = doc(db, 'users', targetUserId);
      const existingReviews = await fetchUserReviews(targetUserId);
      const allReviews = [review, ...existingReviews.filter((r) => r.id !== reviewId)];
      const totalScore = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const newAverage = Number((totalScore / allReviews.length).toFixed(1));

      await updateDoc(userRef, {
        rating: newAverage,
        reviewCount: allReviews.length,
      });
    } catch (e) {
      console.warn('Could not update user review aggregate:', e);
    }

    return { success: true, review };
  } catch (err: any) {
    console.error('Error submitting review:', err);
    return { success: false, error: err?.message || 'Failed to submit review.' };
  }
}
