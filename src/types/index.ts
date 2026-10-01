export interface LocationPoint {
  lat: number;
  lng: number;
  neighborhood: string;
  city: string;
  address?: string;
  state?: string;
  pincode?: string;
}

export type ServiceCategory = 
  | 'Academic Support'
  | 'PPT & Presentations'
  | 'Design & Graphics'
  | 'Creative & Design'
  | 'Video Editing'
  | 'Web Development'
  | 'Assignments & Academics'
  | 'Resume & Career Help'
  | 'Data & Research'
  | 'Social Media'
  | 'Handmade & Crafts'
  | 'Tech & Digital'
  | 'Home Help'
  | 'Events'
  | 'Other'
  | 'Home & Repairs'
  | 'Lessons & Tutoring'
  | 'Pet Care'
  | 'Errands & Delivery'
  | 'Gardening & Outdoors'
  | 'Others';

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  category?: string;
  date?: string;
  tags?: string[];
  link?: string;
  offeredSkill?: string; // Explicit offered skill showcased by this item
  startingPrice?: number; // Starting rate for hiring this skill
  proficiencyLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Campus Pro';
  availableForHire?: boolean;
}

export type TrustBadgeType = 
  | 'student_verified'     // 🎓 Campus Student ID Verified
  | 'id_verified'          // 🛡️ Govt / Resident ID Verified
  | 'phone_verified'       // 📱 Phone Verified (OTP)
  | 'email_verified'       // ✉️ Verified University or Personal Email
  | 'escrow_champion'      // 🔒 100% Escrow Completion Record (Zero Disputes)
  | 'top_rated'            // ⭐ 4.8+ Star Rating with 3+ Reviews
  | 'fast_responder'       // ⚡ Fast Response Time (< 15 mins)
  | 'community_pillar';    // 🏛️ Verified Longstanding Neighborhood Pillar

export type VerificationTier = 
  | 'unverified'
  | 'basic_member'
  | 'verified_neighbor'
  | 'verified_student'
  | 'neighborhood_pro';

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string;
  location: LocationPoint;
  authProvider: 'google' | 'password';
  verified: boolean;
  role?: 'user' | 'admin' | 'seller';
  
  // Neighborhood Trust Score & Verification Badges
  trustScore?: number;          // 0 to 100 dynamic calculated score
  verificationTier?: VerificationTier;
  trustBadges?: TrustBadgeType[];
  idVerified?: boolean;
  studentVerified?: boolean;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  backgroundChecked?: boolean;
  studentUniversity?: string;
  studentMajor?: string;
  studentGradYear?: string;
  phoneNumber?: string;
  responseTimeMinutes?: number;
  disputeFreeRate?: number;     // e.g. 100%
  repeatHireCount?: number;

  tasksCompleted: number;
  rating: number;
  reviewCount: number;
  onTimePercent?: number;
  followersCount?: number;
  verificationMethod?: string;
  isOnline?: boolean;
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  earningsMock?: number;
  portfolio?: PortfolioItem[];
  joinedDate: string;
}

export interface ServiceListing {
  id: string;
  providerId: string;
  provider: UserProfile;
  title: string;
  description: string;
  category: ServiceCategory;
  price: number;
  pricingType?: 'fixed' | 'hourly';
  coverImage?: string;
  rushPrice?: number;
  rushHours?: number;
  deliveryDays: number;
  deliveryHours?: number;
  revisions?: number;
  isUrgent?: boolean;
  rating: number;
  reviewCount: number;
  coverGradient?: string;
  skills: string[];
  location: LocationPoint;
  distanceKm?: number;
  trsScore?: number;
  saved?: boolean;
}

export interface TaskRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  requesterLocation: LocationPoint;
  title: string;
  description: string;
  category: ServiceCategory | string;
  budget: number;
  deadline: string;
  isUrgent: boolean;
  status: 'open' | 'assigned' | 'completed' | 'closed';
  createdAt: string;
  filesAttached?: string[];
}

export type OrderStatus = 'in_escrow' | 'delivered' | 'completed' | 'disputed' | 'cancelled';
export type EscrowStatus = 'held' | 'released' | 'refunded';

export interface OrderDeliverable {
  name: string;
  size: string;
  url?: string;
}

export interface OrderReview {
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Order {
  id: string;
  serviceId?: string;
  serviceTitle: string;
  category?: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  buyerLocation?: LocationPoint;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerLocation?: LocationPoint;
  status: OrderStatus;
  amount: number;
  rushDelivery?: boolean;
  deadline: string;
  escrowStatus: EscrowStatus;
  createdAt: string;
  deliveryFiles?: OrderDeliverable[];
  review?: OrderReview;
}

export interface Message {
  id: string;
  orderId?: string;
  conversationId?: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  isSeller?: boolean;
  isSystem?: boolean;
  text: string;
  attachmentUrl?: string;
  attachmentName?: string;
  timestamp: string;
  createdAt?: string;
}

export interface ConversationParticipant {
  id: string;
  name: string;
  avatar: string;
  role?: string;
  email?: string;
  studentUniversity?: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants: Record<string, ConversationParticipant>;
  lastMessage: string;
  lastSenderId: string;
  lastSenderName: string;
  updatedAt: string;
  orderId?: string;
  serviceTitle?: string;
  unreadCount?: Record<string, number>;
}

export interface AppNotification {
  id: string;
  userId: string; // Recipient user ID
  title: string;
  body: string;
  type: 'message' | 'order' | 'request' | 'system';
  linkView?: 'messages' | 'orders' | 'browse';
  linkId?: string; // conversationId, orderId, or requestId
  read: boolean;
  createdAt: string;
  actorName?: string;
  actorAvatar?: string;
}

