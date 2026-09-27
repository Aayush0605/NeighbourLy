export type ServiceCategory = 
  | 'Home & Repairs'
  | 'Tech & Digital'
  | 'Creative & Design'
  | 'Lessons & Tutoring'
  | 'Pet Care'
  | 'Errands & Delivery'
  | 'Gardening & Outdoors'
  | 'Craft & Handmade'
  | 'Others';

export interface LocationPoint {
  lat: number;
  lng: number;
  neighborhood: string;
  city: string;
  address: string;
  state?: string;
  pincode?: string;
}

export interface UserProfile {
  id: string;
  userId: string; // unique username/handle
  email: string;
  name: string;
  avatar: string;
  location: LocationPoint;
  rating: number;
  reviewCount: number;
  tasksCompleted: number;
  onTimePercent: number;
  followersCount: number;
  isFollowing?: boolean;
  skills: string[];
  verified: boolean;
  verificationMethod: 'id_upload' | 'google_oauth' | 'email';
  isOnline: boolean;
  bio: string;
  phone?: string;
  joinedDate: string;
  authProvider?: 'google' | 'password';
}

export interface ServiceListing {
  id: string;
  providerId: string;
  provider: UserProfile;
  title: string;
  description: string;
  category: ServiceCategory;
  price: number;
  rushPrice?: number;
  rushHours?: number;
  deliveryDays: number;
  deliveryHours?: number;
  revisions: number;
  isUrgent: boolean;
  rating: number;
  reviewCount: number;
  coverGradient: string;
  skills: string[];
  saved?: boolean;
  location: LocationPoint;
  distanceKm?: number;
  trsScore?: number;
}

// Alias for backwards compatibility
export type Gig = ServiceListing;
export type GigCategory = ServiceCategory;

export interface TaskRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  requesterLocation: LocationPoint;
  title: string;
  description: string;
  category: ServiceCategory;
  budget: number;
  deadline: string;
  isUrgent?: boolean;
  status: 'open' | 'assigned' | 'completed';
  createdAt: string;
  filesAttached?: string[];
  distanceKm?: number;
}

export type OrderStatus = 
  | 'requested'
  | 'accepted'
  | 'in_escrow'
  | 'delivered'
  | 'completed'
  | 'disputed';

export interface Order {
  id: string;
  serviceId?: string;
  requestId?: string;
  serviceTitle: string;
  category: ServiceCategory;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  buyerLocation: LocationPoint;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerLocation: LocationPoint;
  status: OrderStatus;
  amount: number;
  rushDelivery: boolean;
  createdAt: string;
  deadline: string;
  deliveryFiles?: { name: string; size: string; url?: string }[];
  escrowStatus: 'held' | 'released' | 'refunded';
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
}

export interface Message {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  isSeller: boolean;
  text: string;
  timestamp: string;
  attachment?: {
    type: 'image' | 'file';
    name: string;
    url?: string;
    previewUrl?: string;
  };
}

export interface AuthSession {
  user: UserProfile;
  token: string;
}
