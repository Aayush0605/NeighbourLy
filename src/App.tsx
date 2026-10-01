import React, { useState, useEffect, useRef } from 'react';
import { 
  UserProfile, 
  LocationPoint, 
  ServiceListing, 
  TaskRequest, 
  Order, 
  Message, 
  ServiceCategory,
  Conversation,
  AppNotification
} from './types';
import { 
  DEFAULT_LOCATION, 
  detectBrowserLocation 
} from './utils/location';
import { 
  getSavedAuthUser, 
  saveAuthUser 
} from './utils/auth';
import { 
  getStoredServices, 
  saveStoredServices, 
  getStoredRequests, 
  saveStoredRequests, 
  getStoredOrders, 
  saveStoredOrders, 
  getStoredMessages, 
  saveStoredMessages
} from './data/mockData';
import { 
  syncUserProfileToCloud, 
  syncServiceToCloud, 
  deleteServiceFromCloud,
  syncRequestToCloud, 
  deleteRequestFromCloud,
  syncOrderToCloud, 
  syncMessageToCloud,
  fetchServicesFromCloud,
  fetchRequestsFromCloud,
  subscribeToServices,
  subscribeToRequests,
  subscribeToOrders,
  syncConversationToCloud,
  subscribeToConversations,
  syncConversationMessageToCloud,
  subscribeToConversationMessages,
  subscribeToOrderMessages,
  syncNotificationToCloud,
  subscribeToUserNotifications,
  markNotificationAsReadInCloud,
  markAllNotificationsAsReadInCloud
} from './services/firestoreSync';
import { ensureFirebaseAuth, signOutUser } from './services/authService';
import { 
  createOrderViaServer, 
  updateOrderStatusViaServer 
} from './services/orderService';
import { Navbar, NavViewType } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { BrowseServices } from './components/BrowseServices';
import { BecomeSellerView } from './components/BecomeSellerView';
import { MessagesView } from './components/MessagesView';
import { OrdersView } from './components/OrdersView';
import { ProfileView } from './components/ProfileView';
import { PublicSellerModal } from './components/PublicSellerModal';
import { GigDetailModal } from './components/GigDetailModal';
import { PostServiceModal } from './components/PostServiceModal';
import { PostRequestModal } from './components/PostRequestModal';
import { LocationPickerModal } from './components/LocationPickerModal';
import { AuthModal } from './components/AuthModal';
import { ChatOrderModal } from './components/ChatOrderModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { AiChatbotWidget } from './components/AiChatbotWidget';
import { AdminDashboard } from './components/AdminDashboard';
import { UserProfileModal } from './components/UserProfileModal';
import { NeighborLyLogo } from './components/NeighborLyLogo';
import { MobileBottomNav } from './components/MobileBottomNav';
import { getAdminSession } from './utils/adminAuth';
import { updateDynamicMetaTags } from './utils/seo';
import { 
  MapPin, 
  Lock, 
  Check
} from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getSavedAuthUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot_password' | 'admin'>('login');

  // Location State
  const [currentLocation, setCurrentLocation] = useState<LocationPoint>(() => {
    return currentUser?.location || DEFAULT_LOCATION;
  });
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [isWorkFromCurrentLocation, setIsWorkFromCurrentLocation] = useState<boolean>(true);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  // Navigation View & AI Chatbot State
  const [activeView, setActiveView] = useState<NavViewType>('home');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Sync Hash for direct deep navigation
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase().replace('#', '');
      if (hash === 'admin') {
        if (currentUser?.role === 'admin' || getAdminSession()) {
          setActiveView('admin');
        } else {
          setAuthModalMode('admin');
          setIsAuthModalOpen(true);
        }
      } else if (hash === 'login') {
        setAuthModalMode('login');
        setIsAuthModalOpen(true);
      } else if (hash === 'signup') {
        setAuthModalMode('signup');
        setIsAuthModalOpen(true);
      } else if (hash === 'browse') {
        setActiveView('browse');
      } else if (hash === 'seller' || hash === 'become') {
        setActiveView('seller');
      } else if (hash === 'messages') {
        setActiveView('messages');
      } else if (hash === 'orders') {
        setActiveView('orders');
      } else if (hash === 'profile') {
        setActiveView('profile');
      } else if (hash === 'ai') {
        setActiveView('ai');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [currentUser]);

  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Real Persistent Data
  const [services, setServices] = useState<ServiceListing[]>(() => getStoredServices());
  const [requests, setRequests] = useState<TaskRequest[]>(() => getStoredRequests());
  const [orders, setOrders] = useState<Order[]>(() => getStoredOrders());
  const [messages, setMessages] = useState<Message[]>(() => getStoredMessages());

  // Real-Time Cross-User Conversations & Messages
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [pendingRecipientUser, setPendingRecipientUser] = useState<UserProfile | null>(null);

  // Real-Time Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeChatOrderId, setActiveChatOrderId] = useState<string | null>(null);
  const [activeOrderMessages, setActiveOrderMessages] = useState<Message[]>([]);

  // Cloud Hydration & Real-Time Sync across all users/IDs
  useEffect(() => {
    // Fetch initial cloud data for services and requests
    async function loadCloudData() {
      try {
        const [cloudServices, cloudRequests] = await Promise.all([
          fetchServicesFromCloud(),
          fetchRequestsFromCloud(),
        ]);
        setServices(cloudServices || []);
        setRequests(cloudRequests || []);
      } catch (err) {
        console.warn('Could not sync remote cloud data on init:', err);
      }
    }
    loadCloudData();

    // Realtime Firestore Listeners: when ANY ID adds/edits/deletes, ALL other IDs update in realtime!
    const unsubServices = subscribeToServices((cloudServices) => {
      setServices(cloudServices || []);
    });

    const unsubRequests = subscribeToRequests((cloudRequests) => {
      setRequests(cloudRequests || []);
    });

    const unsubOrders = subscribeToOrders((cloudOrders) => {
      setOrders(cloudOrders || []);
    });

    return () => {
      unsubServices();
      unsubRequests();
      unsubOrders();
    };
  }, []);

  // Realtime subscription for Conversations of the logged in or guest user
  const effectiveUserId = currentUser?.id || localStorage.getItem('neighborly_client_id') || 'guest_user';
  useEffect(() => {
    if (!localStorage.getItem('neighborly_client_id')) {
      localStorage.setItem('neighborly_client_id', `usr_client_${Date.now()}`);
    }
  }, []);

  useEffect(() => {
    const targetUserOrId = currentUser || effectiveUserId;
    const unsub = subscribeToConversations(targetUserOrId, (userConvs) => {
      setConversations(userConvs);
      if (userConvs.length > 0 && !activeConversationId) {
        setActiveConversationId(userConvs[0].id);
      }
    });
    return () => unsub();
  }, [currentUser, effectiveUserId, activeConversationId]);

  // Realtime subscription for Messages in Active Conversation
  useEffect(() => {
    if (!activeConversationId) {
      setConversationMessages([]);
      return;
    }
    const unsub = subscribeToConversationMessages(activeConversationId, (msgs) => {
      setConversationMessages(msgs);
    });
    return () => unsub();
  }, [activeConversationId]);

  // Realtime subscription for Messages in Active Order Chat
  useEffect(() => {
    if (!activeChatOrderId) {
      setActiveOrderMessages([]);
      return;
    }
    const unsub = subscribeToOrderMessages(activeChatOrderId, (msgs) => {
      setActiveOrderMessages(msgs);
    });
    return () => unsub();
  }, [activeChatOrderId]);

  // Realtime subscription for User Notifications
  const prevNotifsCountRef = useRef<number>(-1);
  useEffect(() => {
    const targetUserOrId = currentUser || effectiveUserId;
    const unsub = subscribeToUserNotifications(targetUserOrId, (userNotifs) => {
      setNotifications(userNotifs);
      if (prevNotifsCountRef.current !== -1 && userNotifs.length > prevNotifsCountRef.current) {
        const newest = userNotifs[0];
        if (newest && !newest.read) {
          showToast(`🔔 ${newest.title}: ${newest.body}`);
        }
      }
      prevNotifsCountRef.current = userNotifs.length;
    });
    return () => unsub();
  }, [currentUser, effectiveUserId]);

  // Active Modals & Public Profile Inspector
  const [selectedService, setSelectedService] = useState<ServiceListing | null>(null);
  const [isPostServiceOpen, setIsPostServiceOpen] = useState(false);
  const [isPostRequestOpen, setIsPostRequestOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPublicUserModalOpen, setIsPublicUserModalOpen] = useState(false);
  const [inspectedUser, setInspectedUser] = useState<UserProfile | null>(null);

  const handleOpenProfile = (userToInspect?: UserProfile) => {
    setInspectedUser(userToInspect || currentUser);
    setIsProfileModalOpen(true);
  };

  const handleOpenPublicProfile = (user: UserProfile) => {
    setInspectedUser(user);
    setIsPublicUserModalOpen(true);
  };

  const handleUpdateUserProfile = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    saveAuthUser(updatedUser);
    setInspectedUser(updatedUser);
    syncUserProfileToCloud(updatedUser);
    showToast('Trust Profile credentials updated successfully!');
  };

  // Admin order status update handler
  const handleUpdateOrderStatus = async (
    orderId: string,
    status: Order['status'],
    escrowStatus: Order['escrowStatus']
  ) => {
    const action = status === 'completed' ? 'release' : status === 'delivered' ? 'deliver' : status === 'disputed' ? 'dispute' : 'refund';
    await updateOrderStatusViaServer(orderId, action, currentUser?.id);
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated = { ...o, status, escrowStatus };
          return updated;
        }
        return o;
      })
    );
    showToast(`Order status updated to ${status}`);
  };

  // Toast banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Local storage persistence
  useEffect(() => {
    saveStoredServices(services);
  }, [services]);

  useEffect(() => {
    saveStoredRequests(requests);
  }, [requests]);

  useEffect(() => {
    saveStoredOrders(orders);
  }, [orders]);

  useEffect(() => {
    saveStoredMessages(messages);
  }, [messages]);

  // Dynamic SEO, OpenGraph, and Twitter Meta Tags Synchronization
  useEffect(() => {
    const neighborhood = currentLocation.neighborhood || currentLocation.city || 'Neighborhood';
    const city = currentLocation.city || 'Bengaluru';

    if (selectedService) {
      updateDynamicMetaTags({
        title: `${selectedService.title} by ${selectedService.provider?.name || 'Student'} (₹${selectedService.price}) — NeighborLy`,
        description: `${selectedService.description?.slice(0, 140)}... Verified student neighbor in ${selectedService.location?.neighborhood || neighborhood}. Escrow-Lite protected.`,
        image: selectedService.provider?.avatar,
        type: 'product',
      });
      return;
    }

    switch (activeView) {
      case 'home':
        updateDynamicMetaTags({
          title: `NeighborLy — Hyperlocal Skills & Gigs in ${neighborhood}, ${city}`,
          description: `Find trusted student neighbors for homework help, web development, art, crafts & tutoring near ${neighborhood} with Escrow-Lite safety.`,
          type: 'website',
        });
        break;

      case 'browse': {
        const catText = selectedCategory !== 'All' ? selectedCategory : 'Verified Services';
        updateDynamicMetaTags({
          title: `Explore ${catText} near ${neighborhood} — NeighborLy`,
          description: `Browse ${services.length} active neighborhood skill listings and student gigs within ${radiusKm}km of ${neighborhood}, ${city}. Book with Escrow-Lite.`,
          type: 'website',
        });
        break;
      }

      case 'seller':
        updateDynamicMetaTags({
          title: `Become a Student Seller — NeighborLy`,
          description: `Offer your skills to neighbors, set your hourly price, and earn on your schedule with 100% Escrow-Lite payment protection.`,
          type: 'website',
        });
        break;

      case 'messages':
        updateDynamicMetaTags({
          title: `Messages & Direct Neighbor Chat — NeighborLy`,
          description: `Chat directly with student sellers and buyers in your local neighborhood.`,
          type: 'website',
        });
        break;

      case 'orders':
        updateDynamicMetaTags({
          title: `My Tasks & Orders (${orders.length}) — NeighborLy`,
          description: `Track your active neighborhood service orders, milestones, and release Escrow-Lite payments upon task sign-off.`,
          type: 'website',
        });
        break;

      case 'profile':
        updateDynamicMetaTags({
          title: `Student Portfolio & Dashboard — NeighborLy`,
          description: `Manage your student seller bio, active services, portfolio items, and earnings.`,
          type: 'website',
        });
        break;

      case 'ai':
        updateDynamicMetaTags({
          title: `Neighborly AI Assistant — NeighborLy`,
          description: `Ask the Neighborly AI Assistant for local task matching, coding help, tutoring rates, and negotiation tips in ${neighborhood}.`,
          type: 'website',
        });
        break;

      default:
        updateDynamicMetaTags({
          title: `NeighborLy — Hyperlocal Student Skills & Task Marketplace`,
          description: `Peer-to-peer campus and neighborhood marketplace connecting students with local tasks and gigs with Escrow-Lite protection.`,
          type: 'website',
        });
    }
  }, [activeView, selectedService, selectedCategory, currentLocation, radiusKm, services.length, orders.length]);

  // Detect GPS location
  const handleDetectGPS = async () => {
    showToast('Locating your GPS coordinates...');
    try {
      const detected = await detectBrowserLocation();
      setCurrentLocation(detected);
      setIsWorkFromCurrentLocation(true);
      showToast(`Location set to ${detected.neighborhood}, ${detected.city}`);
    } catch {
      showToast('Could not detect location. Using default neighborhood.');
    }
  };

  // Auth Handlers
  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    saveAuthUser(user);
    syncUserProfileToCloud(user);
    if (user.location) {
      setCurrentLocation(user.location);
    }
    showToast(`Welcome, ${user.name}!`);
    if (user.role === 'admin') {
      setActiveView('admin');
      showToast('Master Admin mode unlocked');
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    saveAuthUser(null);
    setCurrentUser(null);
    showToast('Signed out of NeighborLy');
    setActiveView('home');
  };

  const requireAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Toggle Save Service
  const handleToggleSaveService = (serviceId: string) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === serviceId) {
          const nextSaved = !s.saved;
          showToast(nextSaved ? 'Saved to favorites' : 'Removed from favorites');
          return { ...s, saved: nextSaved };
        }
        return s;
      })
    );
  };

  // Create Service Listing with Real Cloud Sync
  const handleAddService = async (
    newServiceData: any
  ) => {
    let activeUser = currentUser || newServiceData.provider || getSavedAuthUser();
    if (!activeUser) {
      activeUser = {
        id: `user_${Date.now()}`,
        userId: 'student_seller',
        name: 'College Student',
        email: 'student@campus.edu',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        location: currentLocation,
        authProvider: 'password',
        verified: true,
        role: 'user',
        studentVerified: true,
        tasksCompleted: 0,
        rating: 5.0,
        reviewCount: 0,
        joinedDate: 'Joined Sep 2026',
      };
      saveAuthUser(activeUser);
    }
    setCurrentUser(activeUser);

    const activeUid = activeUser.id;

    const newService: ServiceListing = {
      ...newServiceData,
      id: newServiceData.id || `srv_${Date.now()}`,
      providerId: activeUid,
      provider: {
        ...(newServiceData.provider || activeUser),
        id: activeUid,
      },
      price: Number(newServiceData.price) || 250,
      deliveryDays: Number(newServiceData.deliveryDays) || 1,
      rating: 5.0,
      reviewCount: 0,
      saved: false,
    };

    setServices((prev) => [newService, ...prev.filter((s) => s.id !== newService.id)]);
    const synced = await syncServiceToCloud(newService);
    if (synced) {
      showToast('Skill published live to cloud database & neighborhood!');
    } else {
      showToast('Skill saved! (Syncing with network...)');
    }
  };

  // Delete Service from Local & Cloud Firestore
  const handleDeleteService = async (serviceId: string) => {
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
    await deleteServiceFromCloud(serviceId);
    showToast('Service listing removed from database');
  };

  // Create Task Request with Real Cloud Broadcast
  const handlePostRequest = async (
    requestData: any
  ) => {
    let activeUser = currentUser || getSavedAuthUser();
    if (!activeUser) {
      activeUser = {
        id: `user_${Date.now()}`,
        userId: 'campus_resident',
        name: 'Campus Resident',
        email: 'resident@campus.edu',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        location: currentLocation,
        authProvider: 'password',
        verified: true,
        role: 'user',
        tasksCompleted: 0,
        rating: 5.0,
        reviewCount: 0,
        joinedDate: 'Joined Sep 2026',
      };
      saveAuthUser(activeUser);
    }
    setCurrentUser(activeUser);

    const activeUid = activeUser.id;

    const newReq: TaskRequest = {
      ...requestData,
      id: requestData.id || `req_${Date.now()}`,
      requesterId: activeUid,
      requesterName: activeUser.name,
      requesterAvatar: activeUser.avatar,
      requesterLocation: currentLocation,
      budget: Number(requestData.budget) || 300,
      status: 'open',
      createdAt: 'Just now',
    };

    setRequests((prev) => [newReq, ...prev.filter((r) => r.id !== newReq.id)]);
    const synced = await syncRequestToCloud(newReq);
    if (synced) {
      showToast('Task request broadcast live across campus & neighborhood!');
    } else {
      showToast('Task request posted! (Syncing with network...)');
    }
  };

  // Book Service (Create Escrow Order via secure server authority)
  const handleRequestOrder = async (service: ServiceListing, withRush: boolean) => {
    if (!currentUser) {
      requireAuth('login');
      return;
    }

    const orderAmount = withRush ? service.price + (service.rushPrice || 100) : service.price;

    // Authoritative Server Order Creation
    const serverResult = await createOrderViaServer({
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerAvatar: currentUser.avatar,
      buyerLocation: currentLocation,
      serviceId: service.id,
      serviceTitle: service.title,
      sellerId: service.providerId,
      sellerName: service.provider?.name || 'Neighbor Provider',
      sellerAvatar: service.provider?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      sellerLocation: service.location || currentLocation,
      amount: orderAmount,
      withRush,
      deadline: withRush ? 'Within 4 Hours' : `${service.deliveryDays || 1} Days`,
    });

    const orderId = serverResult ? serverResult.id : `ord_${Date.now()}`;
    const newOrder: Order = serverResult || {
      id: orderId,
      serviceId: service.id,
      serviceTitle: service.title,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerAvatar: currentUser.avatar,
      buyerLocation: currentLocation,
      sellerId: service.providerId,
      sellerName: service.provider?.name || 'Neighbor Provider',
      sellerAvatar: service.provider?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      sellerLocation: service.location || currentLocation,
      status: 'in_escrow',
      escrowStatus: 'held',
      amount: orderAmount,
      createdAt: 'Just now',
      deadline: withRush ? 'Within 4 Hours' : `${service.deliveryDays || 1} Days`,
    };

    const initialMessage: Message = {
      id: `msg_${Date.now()}`,
      orderId: orderId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: `Hello! I have booked your service "${service.title}". ₹${orderAmount} has been deposited into Escrow-Lite protection (Demo).`,
      timestamp: new Date().toISOString(),
      isSystem: true,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setMessages((prev) => [...prev, initialMessage]);
    await syncOrderToCloud(newOrder);
    await syncMessageToCloud(orderId, initialMessage);

    // Also link or create real conversation for messaging tab
    const convId = `conv_${[currentUser.id, service.providerId].sort().join('__')}`;
    const newConv: Conversation = {
      id: convId,
      orderId,
      participantIds: [currentUser.id, service.providerId],
      participants: {
        [currentUser.id]: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          role: currentUser.role,
          studentUniversity: currentUser.studentUniversity || 'Campus Member',
          email: currentUser.email,
        },
        [service.providerId]: {
          id: service.providerId,
          name: service.provider?.name || 'Student Provider',
          avatar: service.provider?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
          role: service.provider?.role || 'Seller',
          studentUniversity: service.provider?.studentUniversity || 'College Student',
          email: service.provider?.email,
        },
      },
      lastMessage: `Booked: ${service.title} (₹${orderAmount})`,
      lastSenderId: currentUser.id,
      lastSenderName: currentUser.name,
      updatedAt: new Date().toISOString(),
      serviceTitle: service.title,
    };
    await syncConversationToCloud(newConv);
    await syncConversationMessageToCloud(convId, initialMessage, {
      lastMessage: initialMessage.text,
      lastSenderId: currentUser.id,
      lastSenderName: currentUser.name,
    });

    // Notify seller of new order
    await syncNotificationToCloud({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: service.providerId,
      title: `New Order: ${service.title}`,
      body: `${currentUser.name} booked your service! ₹${orderAmount} held in Escrow-Lite.`,
      type: 'order',
      linkView: 'orders',
      linkId: orderId,
      read: false,
      createdAt: new Date().toISOString(),
      actorName: currentUser.name,
      actorAvatar: currentUser.avatar,
    });

    setSelectedService(null);
    setActiveChatOrderId(orderId);
    showToast(`Order initiated! ₹${orderAmount} safely placed in Escrow-Lite.`);
  };

  // Direct peer-to-peer message starter
  const handleOpenMessageWithUser = async (targetUser: UserProfile, service?: ServiceListing) => {
    const sender = currentUser || {
      id: localStorage.getItem('neighborly_client_id') || `usr_client_${Date.now()}`,
      userId: 'guest_user',
      name: 'Campus Member',
      email: 'member@campus.edu',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      location: currentLocation,
      authProvider: 'password' as const,
      verified: true,
      role: 'user' as const,
      tasksCompleted: 0,
      rating: 5.0,
      reviewCount: 0,
      joinedDate: 'Guest',
    };

    const convId = `conv_${[sender.id, targetUser.id].sort().join('__')}`.replace(/[^a-zA-Z0-9_]/g, '_');
    const participantIds = Array.from(
      new Set([
        sender.id,
        targetUser.id,
        sender.email || '',
        targetUser.email || '',
        sender.userId || '',
        targetUser.userId || '',
      ])
    ).filter(Boolean);

    const newConv: Conversation = {
      id: convId,
      participantIds,
      participants: {
        [sender.id]: {
          id: sender.id,
          name: sender.name,
          avatar: sender.avatar,
          role: sender.role,
          studentUniversity: sender.studentUniversity || 'Campus Member',
          email: sender.email,
        },
        [targetUser.id]: {
          id: targetUser.id,
          name: targetUser.name,
          avatar: targetUser.avatar,
          role: targetUser.role,
          studentUniversity: targetUser.studentUniversity || 'Student Peer',
          email: targetUser.email,
        },
      },
      lastMessage: service ? `Inquiring about: ${service.title}` : 'Started conversation',
      lastSenderId: sender.id,
      lastSenderName: sender.name,
      updatedAt: new Date().toISOString(),
      serviceTitle: service?.title,
    };

    await syncConversationToCloud(newConv);
    setConversations((prev) => {
      const exists = prev.some((c) => c.id === convId);
      return exists ? prev.map((c) => (c.id === convId ? newConv : c)) : [newConv, ...prev];
    });

    setActiveConversationId(convId);
    setPendingRecipientUser(targetUser);
    setActiveView('messages');
  };

  // Real-time Chat message send across different IDs
  const handleSendMessage = async (
    targetId: string, // conversationId or orderId
    text: string, 
    attachmentUrl?: string, 
    attachmentName?: string
  ) => {
    const sender = currentUser || {
      id: localStorage.getItem('neighborly_client_id') || `usr_client_${Date.now()}`,
      userId: 'campus_member',
      name: 'Campus Member',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      email: 'member@campus.edu',
      role: 'user' as const,
    };

    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId: targetId,
      orderId: targetId.startsWith('ord_') ? targetId : undefined,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      text,
      attachmentUrl,
      attachmentName,
      timestamp: new Date().toISOString(),
    };

    // Update local state immediately for responsive feel
    setConversationMessages((prev) => [...prev, newMsg]);
    setActiveOrderMessages((prev) => [...prev, newMsg]);

    // Ensure parent conversation exists in Firestore before sending
    const currentConv = conversations.find((c) => c.id === targetId);
    if (!currentConv && pendingRecipientUser) {
      const targetUser = pendingRecipientUser;
      const participantIds = Array.from(
        new Set([
          sender.id,
          targetUser.id,
          sender.email || '',
          targetUser.email || '',
          sender.userId || '',
          targetUser.userId || '',
        ])
      ).filter(Boolean);

      const createdConv: Conversation = {
        id: targetId,
        participantIds,
        participants: {
          [sender.id]: {
            id: sender.id,
            name: sender.name,
            avatar: sender.avatar,
            role: sender.role,
            email: sender.email,
          },
          [targetUser.id]: {
            id: targetUser.id,
            name: targetUser.name,
            avatar: targetUser.avatar,
            role: targetUser.role,
            email: targetUser.email,
          },
        },
        lastMessage: text,
        lastSenderId: sender.id,
        lastSenderName: sender.name,
        updatedAt: new Date().toISOString(),
      };
      await syncConversationToCloud(createdConv);
    }

    // Save to Firestore
    await syncConversationMessageToCloud(targetId, newMsg, {
      lastMessage: text,
      lastSenderId: sender.id,
      lastSenderName: sender.name,
    });

    if (targetId.startsWith('ord_')) {
      await syncMessageToCloud(targetId, newMsg);
    }

    // Determine recipient user ID & email to notify them
    let recipientId: string | null = null;
    let recipientEmail: string | null = null;
    if (currentConv) {
      const otherP = Object.values(currentConv.participants || {}).find(
        (p) => p.id !== sender.id && p.email !== sender.email
      );
      if (otherP) {
        recipientId = otherP.id;
        recipientEmail = otherP.email || null;
      } else {
        recipientId =
          currentConv.participantIds.find(
            (id) => id !== sender.id && id !== sender.email && id !== sender.userId
          ) || null;
      }
    } else if (targetId.startsWith('ord_')) {
      const ord = orders.find((o) => o.id === targetId);
      if (ord) {
        recipientId = ord.buyerId === sender.id ? ord.sellerId : ord.buyerId;
      }
    } else if (pendingRecipientUser) {
      recipientId = pendingRecipientUser.id;
      recipientEmail = pendingRecipientUser.email;
    }

    // Send real in-app notification to the recipient user in Firestore
    if (recipientId && recipientId !== sender.id) {
      await syncNotificationToCloud({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: recipientId,
        title: `New message from ${sender.name}`,
        body: text.slice(0, 120),
        type: 'message',
        linkView: 'messages',
        linkId: targetId,
        read: false,
        createdAt: new Date().toISOString(),
        actorName: sender.name,
        actorAvatar: sender.avatar,
      });

      if (recipientEmail && recipientEmail !== recipientId) {
        await syncNotificationToCloud({
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: recipientEmail,
          title: `New message from ${sender.name}`,
          body: text.slice(0, 120),
          type: 'message',
          linkView: 'messages',
          linkId: targetId,
          read: false,
          createdAt: new Date().toISOString(),
          actorName: sender.name,
          actorAvatar: sender.avatar,
        });
      }
    }
  };

  // Deliver work
  const handleDeliverWork = async (orderId: string, fileName: string) => {
    await updateOrderStatusViaServer(orderId, 'deliver', currentUser?.id);
    const ord = orders.find((o) => o.id === orderId);
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated = { ...o, status: 'delivered' as const };
          return updated;
        }
        return o;
      })
    );

    if (currentUser) {
      const deliveryMsg: Message = {
        id: `msg_${Date.now()}`,
        orderId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        text: `I have completed the task and uploaded the work deliverable: "${fileName}". Please inspect and approve to release payment.`,
        attachmentName: fileName,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, deliveryMsg]);
      await syncMessageToCloud(orderId, deliveryMsg);

      // Notify the buyer
      if (ord) {
        await syncNotificationToCloud({
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: ord.buyerId,
          title: `Deliverable ready: ${ord.serviceTitle}`,
          body: `${currentUser.name} marked the task as delivered with "${fileName}". Please review!`,
          type: 'order',
          linkView: 'orders',
          linkId: orderId,
          read: false,
          createdAt: new Date().toISOString(),
          actorName: currentUser.name,
          actorAvatar: currentUser.avatar,
        });
      }
    }

    showToast('Task marked as delivered to client!');
  };

  // Complete Order (Approve Escrow Release)
  const handleCompleteOrder = async (orderId: string) => {
    await updateOrderStatusViaServer(orderId, 'release', currentUser?.id);
    const ord = orders.find((o) => o.id === orderId);
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated = { ...o, status: 'completed' as const, escrowStatus: 'released' as const };
          return updated;
        }
        return o;
      })
    );

    if (currentUser) {
      const sysMsg: Message = {
        id: `msg_${Date.now()}`,
        orderId,
        senderId: 'system',
        senderName: 'Neighborly Escrow',
        senderAvatar: '',
        text: `Escrow payment has been released to the student provider! Thank you for supporting your neighbor.`,
        timestamp: new Date().toISOString(),
        isSystem: true,
      };
      setMessages((prev) => [...prev, sysMsg]);
      await syncMessageToCloud(orderId, sysMsg);

      // Notify the seller
      if (ord) {
        await syncNotificationToCloud({
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: ord.sellerId,
          title: `Escrow Payment Released! (₹${ord.amount})`,
          body: `${currentUser.name} approved the deliverable for "${ord.serviceTitle}". Earnings released!`,
          type: 'order',
          linkView: 'orders',
          linkId: orderId,
          read: false,
          createdAt: new Date().toISOString(),
          actorName: currentUser.name,
          actorAvatar: currentUser.avatar,
        });
      }
    }

    showToast('Payment released to student provider! Thank you.');
  };

  // Submit Review
  const handleSubmitReview = (orderId: string, rating: number, comment: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated = {
            ...o,
            review: {
              rating,
              comment,
              reviewerName: currentUser?.name || 'Neighbor',
              createdAt: 'Just now',
            },
          };
          syncOrderToCloud(updated);
          return updated;
        }
        return o;
      })
    );
    showToast('Review submitted! Thank you.');
  };

  // Active Chat Order
  const activeOrder = orders.find((o) => o.id === activeChatOrderId);

  // Active orders count for badges
  const activeOrdersCount = orders.filter(
    (o) =>
      (o.buyerId === currentUser?.id || o.sellerId === currentUser?.id) &&
      o.status !== 'completed' &&
      o.status !== 'cancelled'
  ).length;

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-950 flex flex-col font-sans selection:bg-zinc-950 selection:text-white pb-20 md:pb-0 w-full max-w-full overflow-x-hidden relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-zinc-950 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-soft-xl flex items-center gap-2.5 animate-in slide-in-from-top-3 fade-in duration-200 border border-zinc-800 max-w-[calc(100vw-2rem)]">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <Navbar
        currentLocation={currentLocation}
        radiusKm={radiusKm}
        isWorkFromCurrentLocation={isWorkFromCurrentLocation}
        onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenAiAssistant={() => setIsChatbotOpen(true)}
        onOpenPostTask={() => setIsPostRequestOpen(true)}
        activeOrdersCount={activeOrdersCount}
        unreadMessagesCount={unreadNotificationsCount}
        notifications={notifications}
        onMarkNotificationRead={async (id) => {
          setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
          await markNotificationAsReadInCloud(id);
        }}
        onMarkAllNotificationsRead={async () => {
          if (currentUser?.id) {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            await markAllNotificationsAsReadInCloud(currentUser.id);
          }
        }}
        onSelectNotification={(notif) => {
          if (notif.linkView === 'messages') {
            if (notif.linkId) setActiveConversationId(notif.linkId);
            setActiveView('messages');
          } else if (notif.linkView === 'orders') {
            if (notif.linkId) setActiveChatOrderId(notif.linkId);
            setActiveView('orders');
          } else if (notif.linkView) {
            setActiveView(notif.linkView);
          }
        }}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        
        {/* VIEW 1: HOME LANDING */}
        {activeView === 'home' && (
          <>
            <LandingHero
              onSearch={(query) => {
                setSearchQuery(query);
                setActiveView('browse');
              }}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setActiveView('browse');
              }}
              onNavigateBrowse={() => setActiveView('browse')}
              onBecomeSeller={() => setActiveView('seller')}
              onPostTask={() => setIsPostRequestOpen(true)}
              onOpenAuthSignup={() => requireAuth('signup')}
              onNavigateMessages={() => setActiveView('messages')}
              onNavigateOrders={() => setActiveView('orders')}
              currentLocation={currentLocation}
            />

            {/* Quick Highlights Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-heading font-black text-zinc-950">
                    Featured Student Services in {currentLocation.neighborhood}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                    Verified student skills & gigs within {radiusKm}km of your campus & street
                  </p>
                </div>
                <button
                  onClick={() => setActiveView('browse')}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  View All Services →
                </button>
              </div>

              <BrowseServices
                services={services}
                requests={requests}
                currentLocation={currentLocation}
                radiusKm={radiusKm}
                onChangeRadiusKm={setRadiusKm}
                onSelectService={(s) => setSelectedService(s)}
                onOpenMessageWithUser={(u, s) => {
                  handleOpenMessageWithUser(u, s);
                }}
                onOpenPublicProfile={handleOpenPublicProfile}
                onOpenPostService={() => setActiveView('seller')}
                onOpenPostRequest={() => setIsPostRequestOpen(true)}
                onDeleteRequest={async (reqId) => {
                  setRequests((prev) => prev.filter((r) => r.id !== reqId));
                  await deleteRequestFromCloud(reqId);
                  showToast('Task request removed');
                }}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          </>
        )}

        {/* VIEW 2: BROWSE SERVICES */}
        {activeView === 'browse' && (
          <BrowseServices
            services={services}
            requests={requests}
            currentLocation={currentLocation}
            radiusKm={radiusKm}
            onChangeRadiusKm={setRadiusKm}
            onSelectService={(s) => setSelectedService(s)}
            onOpenMessageWithUser={(u, s) => {
              handleOpenMessageWithUser(u, s);
            }}
            onOpenPublicProfile={handleOpenPublicProfile}
            onOpenPostService={() => setActiveView('seller')}
            onOpenPostRequest={() => setIsPostRequestOpen(true)}
            onDeleteRequest={async (reqId) => {
              setRequests((prev) => prev.filter((r) => r.id !== reqId));
              await deleteRequestFromCloud(reqId);
              showToast('Task request removed');
            }}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {/* VIEW 3: BECOME A SELLER */}
        {activeView === 'seller' && (
          <BecomeSellerView
            currentUser={currentUser}
            currentLocation={currentLocation}
            onPublishService={(newService) => {
              handleAddService(newService);
              setActiveView('profile');
            }}
            onNavigateBrowse={() => setActiveView('browse')}
            onOpenAuth={(mode) => {
              setAuthModalMode(mode || 'signup');
              setIsAuthModalOpen(true);
            }}
          />
        )}

        {/* VIEW 4: MESSAGES VIEW */}
        {activeView === 'messages' && (
          <MessagesView
            currentUser={currentUser}
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={(id) => {
              setActiveConversationId(id);
              setPendingRecipientUser(null);
            }}
            messages={conversationMessages}
            onSendMessage={(convId, text) => handleSendMessage(convId, text)}
            onOpenPublicProfile={handleOpenPublicProfile}
            onNavigateBrowse={() => setActiveView('browse')}
            pendingRecipientUser={pendingRecipientUser}
          />
        )}

        {/* VIEW 5: ORDERS VIEW */}
        {activeView === 'orders' && (
          <OrdersView
            orders={orders}
            currentUser={currentUser}
            onOpenOrderChat={(id) => setActiveChatOrderId(id)}
            onNavigateBrowse={() => setActiveView('browse')}
            onReleaseEscrow={handleCompleteOrder}
          />
        )}

        {/* VIEW 6: STUDENT PORTFOLIO & DASHBOARD */}
        {activeView === 'profile' && (
          currentUser ? (
            <ProfileView
              currentUser={currentUser}
              services={services}
              orders={orders}
              onUpdateProfile={handleUpdateUserProfile}
              onNavigateSeller={() => setActiveView('seller')}
              onNavigateOrders={() => setActiveView('orders')}
              onDeleteService={handleDeleteService}
              onOpenOrderChat={(id) => setActiveChatOrderId(id)}
              onOpenPostService={() => setIsPostServiceOpen(true)}
              onAdminUpdateOrderStatus={handleUpdateOrderStatus}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 px-4">
              <div className="bg-white rounded-3xl p-8 border border-zinc-200/90 shadow-soft text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto text-2xl">
                  🎓
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-black font-heading text-zinc-950">
                    Student Profile & Portfolio
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Sign in to showcase your skills, manage offered gigs, and track your escrow earnings.
                  </p>
                </div>
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => requireAuth('login')}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-soft transition-all cursor-pointer"
                  >
                    Sign In to Profile
                  </button>
                  <button
                    onClick={() => requireAuth('signup')}
                    className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-2xl transition-all cursor-pointer"
                  >
                    Create New Account
                  </button>
                </div>
                <div className="pt-3 border-t border-zinc-100">
                  <p className="text-[11px] text-zinc-400 font-semibold mb-2">Or test 1-click profiles:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => {
                        const demoUser: UserProfile = {
                          id: 'user_aanya',
                          userId: 'aanya_student',
                          name: 'Aanya S.',
                          email: 'aanya.s@du.ac.in',
                          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                          location: currentLocation,
                          authProvider: 'password',
                          verified: true,
                          role: 'user',
                          trustScore: 96,
                          verificationTier: 'verified_student',
                          studentVerified: true,
                          studentUniversity: 'Delhi University / Campus',
                          studentMajor: 'Economics & Math',
                          tasksCompleted: 14,
                          rating: 4.9,
                          reviewCount: 14,
                          bio: 'College student offering tutoring, presentation slides, notes review, and academic assistance.',
                          joinedDate: 'Joined Aug 2026',
                        };
                        handleAuthSuccess(demoUser);
                      }}
                      className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded-xl border border-purple-200 cursor-pointer"
                    >
                      🎓 Student Seller
                    </button>
                    <button
                      onClick={() => {
                        const demoUser: UserProfile = {
                          id: 'user_alex',
                          userId: 'alex_buyer',
                          name: 'Alex M.',
                          email: 'alex.neighbor@gmail.com',
                          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                          location: currentLocation,
                          authProvider: 'password',
                          verified: true,
                          role: 'user',
                          trustScore: 90,
                          verificationTier: 'verified_neighbor',
                          studentVerified: false,
                          tasksCompleted: 8,
                          rating: 4.8,
                          reviewCount: 8,
                          bio: 'Local neighbor hiring college students for tech, design, and errand tasks with Escrow-Lite safety.',
                          joinedDate: 'Joined Sep 2026',
                        };
                        handleAuthSuccess(demoUser);
                      }}
                      className="p-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-bold rounded-xl border border-zinc-200 cursor-pointer"
                    >
                      🏡 Neighbor Client
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* VIEW 7: AI ASSISTANT EXPANDED */}
        {activeView === 'ai' && (
          <AiAssistantModal
            isEmbedded={true}
            currentLocation={currentLocation}
            services={services}
            requests={requests}
            currentUser={currentUser}
            onSelectService={(s) => setSelectedService(s)}
            onOpenPostRequest={() => setIsPostRequestOpen(true)}
            onOpenPostService={() => setActiveView('seller')}
          />
        )}

        {/* VIEW 8: MASTER ADMIN DASHBOARD */}
        {activeView === 'admin' && (
          <AdminDashboard
            services={services}
            requests={requests}
            orders={orders}
            currentLocation={currentLocation}
            currentUser={currentUser}
            onDeleteService={handleDeleteService}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onOpenOrderChat={(id) => setActiveChatOrderId(id)}
            onNavigateHome={() => setActiveView('home')}
          />
        )}

      </main>

      {/* Floating Production-Grade AI Assistance Chat Bot */}
      <AiChatbotWidget
        currentLocation={currentLocation}
        services={services}
        requests={requests}
        currentUser={currentUser}
        onSelectService={(s) => setSelectedService(s)}
        onOpenPostRequest={() => {
          if (!currentUser) requireAuth('signup');
          else setIsPostRequestOpen(true);
        }}
        onOpenPostService={() => {
          if (!currentUser) requireAuth('signup');
          else setIsPostServiceOpen(true);
        }}
        isOpen={isChatbotOpen}
        onToggleOpen={() => setIsChatbotOpen(!isChatbotOpen)}
      />

      {/* Modals & Dialogs */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleAuthSuccess}
          defaultMode={authModalMode === 'signup' ? 'signup' : 'login'}
          currentLocation={currentLocation}
        />
      )}

      {isLocationPickerOpen && (
        <LocationPickerModal
          currentLocation={currentLocation}
          onSelectLocation={(loc) => {
            setCurrentLocation(loc);
            showToast(`Location set to ${loc.neighborhood}, ${loc.city}`);
          }}
          radiusKm={radiusKm}
          onChangeRadiusKm={setRadiusKm}
          isWorkFromCurrentLocation={isWorkFromCurrentLocation}
          onToggleWorkFromCurrentLocation={setIsWorkFromCurrentLocation}
          onClose={() => setIsLocationPickerOpen(false)}
        />
      )}

      {isPostServiceOpen && (
        <PostServiceModal
          onClose={() => setIsPostServiceOpen(false)}
          onSubmit={handleAddService}
          currentLocation={currentLocation}
          currentUser={currentUser}
          onRequireAuth={() => requireAuth('signup')}
        />
      )}

      {isPostRequestOpen && (
        <PostRequestModal
          onClose={() => setIsPostRequestOpen(false)}
          onSubmit={handlePostRequest}
          currentLocation={currentLocation}
          currentUser={currentUser}
          onRequireAuth={() => requireAuth('signup')}
        />
      )}

      {selectedService && (
        <GigDetailModal
          service={selectedService}
          currentLocation={currentLocation}
          currentUser={currentUser}
          onRequireAuth={() => requireAuth('login')}
          onClose={() => setSelectedService(null)}
          onRequestOrder={handleRequestOrder}
          onToggleSave={handleToggleSaveService}
          onOpenMessage={(provider, srv) => {
            setSelectedService(null);
            handleOpenMessageWithUser(provider, srv);
          }}
        />
      )}

      {activeChatOrderId && activeOrder && currentUser && (
        <ChatOrderModal
          order={activeOrder}
          messages={activeOrderMessages}
          currentUser={currentUser}
          onSendMessage={handleSendMessage}
          onDeliverWork={handleDeliverWork}
          onCompleteOrder={handleCompleteOrder}
          onSubmitReview={handleSubmitReview}
          onClose={() => setActiveChatOrderId(null)}
        />
      )}

      {/* User Trust Profile & Verification Modal */}
      {isProfileModalOpen && (inspectedUser || currentUser) && (
        <UserProfileModal
          user={inspectedUser || currentUser!}
          isOpen={isProfileModalOpen}
          isCurrentUser={currentUser?.id === (inspectedUser?.id || currentUser?.id)}
          onClose={() => setIsProfileModalOpen(false)}
          onUpdateUser={handleUpdateUserProfile}
        />
      )}

      {/* Public Seller & Portfolio Showcase Modal */}
      {isPublicUserModalOpen && inspectedUser && (
        <PublicSellerModal
          user={inspectedUser}
          isOpen={isPublicUserModalOpen}
          onClose={() => setIsPublicUserModalOpen(false)}
          services={services}
          onOpenMessage={() => {
            setIsPublicUserModalOpen(false);
            if (!currentUser) requireAuth('login');
            else handleOpenMessageWithUser(inspectedUser);
          }}
          onSelectService={(srv) => {
            setIsPublicUserModalOpen(false);
            setSelectedService(srv);
          }}
        />
      )}

      {/* Clean Minimalist Footer */}
      <footer className="bg-white border-t border-zinc-200/80 mt-16 sm:mt-24 py-14 sm:py-16 text-zinc-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-4 gap-10">
          <div className="space-y-4">
            <NeighborLyLogo size="md" showTagline={true} tagline="Students Helping Students" />
            <p className="text-zinc-500 leading-relaxed text-xs">
              Hyperlocal student skills and task marketplace. Connect with nearby students and neighbors to get help affordably and reliably.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-700 bg-zinc-100/80 px-3 py-1.5 rounded-xl border border-zinc-200/70 w-fit font-medium">
              <Lock className="w-3.5 h-3.5 text-zinc-600" />
              <span>Escrow-Lite Protected</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-zinc-950 mb-3.5 uppercase tracking-wider text-[11px]">Popular Skills</h4>
            <ul className="space-y-2.5">
              <li><button onClick={() => { setSelectedCategory('Academic Support'); setActiveView('browse'); }} className="hover:text-zinc-950 cursor-pointer">Academic & Homework Help</button></li>
              <li><button onClick={() => { setSelectedCategory('Creative & Design'); setActiveView('browse'); }} className="hover:text-zinc-950 cursor-pointer">Art & Poster Design</button></li>
              <li><button onClick={() => { setSelectedCategory('Handmade & Crafts'); setActiveView('browse'); }} className="hover:text-zinc-950 cursor-pointer">Handmade Crafts & Crochet</button></li>
              <li><button onClick={() => { setSelectedCategory('Tech & Digital'); setActiveView('browse'); }} className="hover:text-zinc-950 cursor-pointer">Web & Tech Troubleshooting</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-zinc-950 mb-3.5 uppercase tracking-wider text-[11px]">Safety & Trust</h4>
            <ul className="space-y-2.5">
              <li><button onClick={() => { setAuthModalMode('signup'); setIsAuthModalOpen(true); }} className="hover:text-zinc-950 cursor-pointer">College ID & Email Verification</button></li>
              <li><button onClick={() => setIsLocationPickerOpen(true)} className="hover:text-zinc-950 cursor-pointer">Work From Current Location</button></li>
              <li><button onClick={() => showToast('Escrow-Lite holds funds until you approve the task.')} className="hover:text-zinc-950 cursor-pointer">Escrow-Lite Protection</button></li>
              <li><button onClick={() => setActiveView('ai')} className="hover:text-zinc-950 cursor-pointer">AI Real-Time Problem Solver</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-zinc-950 mb-3.5 uppercase tracking-wider text-[11px]">Current Location</h4>
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-1.5">
              <p className="font-bold text-zinc-950 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>{currentLocation.neighborhood}</span>
              </p>
              <p className="text-xs text-zinc-500">{currentLocation.city}, {currentLocation.state || 'India'}</p>
              <p className="text-[11px] text-zinc-600 font-medium">Search radius: within {radiusKm} km</p>
              <button
                onClick={() => setIsLocationPickerOpen(true)}
                className="text-xs text-indigo-600 font-bold hover:underline block pt-1.5 cursor-pointer"
              >
                Change or Detect GPS →
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-10 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-400">
          <p>© 2026 NeighbourLy. Students Helping Students.</p>
          <div className="flex items-center gap-4 text-xs">
            <button onClick={() => showToast('Privacy Policy: User location and college verification data are securely encrypted.')} className="hover:text-zinc-600 transition-colors cursor-pointer">Privacy Policy</button>
            <span>·</span>
            <button onClick={() => showToast('Terms of Service: All peer transactions are guarded with Escrow-Lite protection.')} className="hover:text-zinc-600 transition-colors cursor-pointer">Terms of Service</button>
            <span>·</span>
            <button onClick={() => showToast('Community Guidelines: Zero tolerance for scams, honest reviews, mutual peer respect.')} className="hover:text-zinc-600 transition-colors cursor-pointer">Community Guidelines</button>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Phone & Tablet) */}
      <MobileBottomNav
        activeView={activeView}
        onNavigate={(view) => {
          if (view === 'profile' && !currentUser) {
            requireAuth('login');
          } else {
            setActiveView(view);
          }
        }}
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setIsAuthModalOpen(true);
        }}
        onOpenPostTask={() => {
          if (!currentUser) requireAuth('signup');
          else setIsPostRequestOpen(true);
        }}
        onOpenPostSkill={() => {
          if (!currentUser) requireAuth('signup');
          else setIsPostServiceOpen(true);
        }}
        activeOrdersCount={activeOrdersCount}
      />

    </div>
  );
}
