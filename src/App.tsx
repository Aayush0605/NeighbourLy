import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  LocationPoint, 
  ServiceListing, 
  TaskRequest, 
  Order, 
  Message, 
  ServiceCategory 
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
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { BrowseServices } from './components/BrowseServices';
import { GigDetailModal } from './components/GigDetailModal';
import { PostServiceModal } from './components/PostServiceModal';
import { PostRequestModal } from './components/PostRequestModal';
import { LocationPickerModal } from './components/LocationPickerModal';
import { AuthModal } from './components/AuthModal';
import { ChatOrderModal } from './components/ChatOrderModal';
import { MyTasksOrdersView } from './components/MyTasksOrdersView';
import { AiAssistantModal } from './components/AiAssistantModal';
import { AiChatbotWidget } from './components/AiChatbotWidget';
import { AdminDashboard } from './components/AdminDashboard';
import { NeighborLyLogo } from './components/NeighborLyLogo';
import { MobileBottomNav } from './components/MobileBottomNav';
import { getAdminSession } from './utils/adminAuth';
import { updateDynamicMetaTags } from './utils/seo';
import { 
  MapPin, 
  ShieldCheck, 
  Lock, 
  Check,
  Home,
  Compass,
  PlusCircle,
  MessageSquare,
  User,
  Plus,
  Sparkles
} from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getSavedAuthUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot_password' | 'admin'>('login');

  // Location State ("Select work from my current location")
  const [currentLocation, setCurrentLocation] = useState<LocationPoint>(() => {
    return currentUser?.location || DEFAULT_LOCATION;
  });
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [isWorkFromCurrentLocation, setIsWorkFromCurrentLocation] = useState<boolean>(true);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  // Navigation View & AI Chatbot State
  const [activeView, setActiveView] = useState<'home' | 'browse' | 'orders' | 'ai' | 'admin' | 'auth'>('home');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Sync Hash for direct navigation (e.g. #admin, #login, #signup)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin') {
        if (getAdminSession()) {
          setActiveView('admin');
        } else {
          setAuthModalMode('admin');
          setActiveView('auth');
        }
      } else if (hash === '#login') {
        setAuthModalMode('login');
        setActiveView('auth');
      } else if (hash === '#signup') {
        setAuthModalMode('signup');
        setActiveView('auth');
      } else if (hash === '#browse') {
        setActiveView('browse');
      } else if (hash === '#orders') {
        setActiveView('orders');
      } else if (hash === '#ai') {
        setActiveView('ai');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Real Persistent Data (Zero dummy data)
  const [services, setServices] = useState<ServiceListing[]>(() => getStoredServices());
  const [requests, setRequests] = useState<TaskRequest[]>(() => getStoredRequests());
  const [orders, setOrders] = useState<Order[]>(() => getStoredOrders());
  const [messages, setMessages] = useState<Message[]>(() => getStoredMessages());

  // Active Modals
  const [selectedService, setSelectedService] = useState<ServiceListing | null>(null);
  const [activeChatOrderId, setActiveChatOrderId] = useState<string | null>(null);
  const [isPostServiceOpen, setIsPostServiceOpen] = useState(false);
  const [isPostRequestOpen, setIsPostRequestOpen] = useState(false);

  // Admin order status update handler
  const handleUpdateOrderStatus = (
    orderId: string,
    status: Order['status'],
    escrowStatus: Order['escrowStatus']
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, escrowStatus } : o))
    );
    showToast(`Order status updated to ${status}`);
  };

  // Toast banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync state to storage
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
        title: `${selectedService.title} by ${selectedService.provider.name} (₹${selectedService.price}) — NeighborLy`,
        description: `${selectedService.description.slice(0, 140)}... Verified neighbor in ${selectedService.location?.neighborhood || neighborhood}. Escrow-Lite payment protection guaranteed.`,
        image: selectedService.provider?.avatar,
        type: 'product',
      });
      return;
    }

    switch (activeView) {
      case 'home':
        updateDynamicMetaTags({
          title: `NeighborLy — Hyperlocal Skills & Gigs in ${neighborhood}, ${city}`,
          description: `Find trusted neighbors for home repairs, tech setup, pet care & tutoring near ${neighborhood} with 0% platform fee and Escrow-Lite safety.`,
          type: 'website',
        });
        break;

      case 'browse': {
        const catText = selectedCategory !== 'All' ? selectedCategory : 'Verified Services';
        updateDynamicMetaTags({
          title: `Explore ${catText} near ${neighborhood} — NeighborLy`,
          description: `Browse ${services.length} active neighborhood skill listings and gigs within ${radiusKm}km of ${neighborhood}, ${city}. Book with Escrow-Lite.`,
          type: 'website',
        });
        break;
      }

      case 'orders':
        updateDynamicMetaTags({
          title: `My Tasks & Orders (${orders.length}) — NeighborLy`,
          description: `Track your active neighborhood service orders, direct neighbor chat messages, and approve Escrow-Lite fund releases.`,
          type: 'website',
        });
        break;

      case 'ai':
        updateDynamicMetaTags({
          title: `Neighborly AI Assistant (Gemini 3.8 Flash) — NeighborLy`,
          description: `Ask the Neighborly AI Assistant for local task matching, fair neighbor rate estimates, and task drafting in ${neighborhood}.`,
          type: 'website',
        });
        break;

      case 'admin':
        updateDynamicMetaTags({
          title: `Administrative Command Center — NeighborLy`,
          description: `Restricted administrative gateway for hyperlocal marketplace moderation, escrow vault auditing, and dispute settlements.`,
          type: 'website',
        });
        break;

      case 'auth':
        updateDynamicMetaTags({
          title: `${authModalMode === 'signup' ? 'Create Your Account' : authModalMode === 'admin' ? 'Admin Gateway' : 'Sign In'} — NeighborLy`,
          description: `Join NeighborLy to hire nearby helpers or earn by offering skills in ${neighborhood} with full Escrow-Lite security.`,
          type: 'website',
        });
        break;

      default:
        updateDynamicMetaTags({
          title: `NeighborLy — Hyperlocal Skills & Task Marketplace`,
          description: `Hyperlocal peer-to-peer neighborhood marketplace to find and offer local services, gigs, and tasks right from your current location with Escrow-Lite security.`,
          type: 'website',
        });
    }
  }, [activeView, selectedService, selectedCategory, currentLocation, radiusKm, services.length, orders.length, authModalMode]);

  // Detect GPS location on initial load if available
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
    if (user.location) {
      setCurrentLocation(user.location);
    }
    showToast(`Welcome, ${user.name}!`);
  };

  const handleLogout = () => {
    saveAuthUser(null);
    setCurrentUser(null);
    showToast('Signed out of Neighborly');
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
          showToast(nextSaved ? 'Saved to your favorites' : 'Removed from favorites');
          return { ...s, saved: nextSaved };
        }
        return s;
      })
    );
  };

  // Create Service Listing
  const handleAddService = (
    newServiceData: Omit<ServiceListing, 'id' | 'provider' | 'providerId' | 'rating' | 'reviewCount'>
  ) => {
    if (!currentUser) return;

    const newService: ServiceListing = {
      ...newServiceData,
      id: `service_${Date.now()}`,
      providerId: currentUser.id,
      provider: {
        id: currentUser.id,
        name: currentUser.name,
        userId: currentUser.userId,
        avatar: currentUser.avatar,
        email: currentUser.email,
        location: currentLocation,
        verified: true,
        tasksCompleted: currentUser.tasksCompleted || 0,
        rating: 5.0,
        reviewCount: 0,
        skills: [newServiceData.category],
        joinedDate: currentUser.joinedDate,
        authProvider: currentUser.authProvider || 'google',
      },
      rating: 5.0,
      reviewCount: 0,
      saved: false,
    };

    setServices((prev) => [newService, ...prev]);
    showToast('Skill published successfully in your neighborhood!');
  };

  // Delete Service
  const handleDeleteService = (serviceId: string) => {
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
    showToast('Service listing removed');
  };

  // Create Task Request
  const handlePostRequest = (
    requestData: Omit<TaskRequest, 'id' | 'requesterId' | 'requesterName' | 'requesterAvatar' | 'requesterLocation' | 'status' | 'createdAt'>
  ) => {
    if (!currentUser) return;

    const newReq: TaskRequest = {
      ...requestData,
      id: `req_${Date.now()}`,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterAvatar: currentUser.avatar,
      requesterLocation: currentLocation,
      status: 'open',
      createdAt: 'Just now',
    };

    setRequests((prev) => [newReq, ...prev]);
    showToast('Task request posted! Nearby neighbors have been notified.');
  };

  // Book Service (Create Escrow Order)
  const handleRequestOrder = (service: ServiceListing, withRush: boolean) => {
    if (!currentUser) {
      requireAuth('login');
      return;
    }

    const orderAmount = withRush ? service.price + (service.rushPrice || 100) : service.price;
    const orderId = `ord_${Date.now()}`;

    const newOrder: Order = {
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
      text: `Hello! I have booked your service "${service.title}". ₹${orderAmount} has been deposited into Escrow-Lite protection.`,
      timestamp: new Date().toISOString(),
      isSystem: true,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setMessages((prev) => [...prev, initialMessage]);
    setSelectedService(null);
    setActiveChatOrderId(orderId);
    showToast(`Order initiated! ₹${orderAmount} safely placed in escrow.`);
  };

  // Chat message send
  const handleSendMessage = (orderId: string, text: string, attachmentUrl?: string, attachmentName?: string) => {
    if (!currentUser) return;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      orderId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text,
      attachmentUrl,
      attachmentName,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
  };

  // Deliver work
  const handleDeliverWork = (orderId: string, fileName: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'delivered' } : o))
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
    }

    showToast('Task marked as delivered to client!');
  };

  // Complete Order (Approve Escrow Release)
  const handleCompleteOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'completed', escrowStatus: 'released' }
          : o
      )
    );

    if (currentUser) {
      const sysMsg: Message = {
        id: `msg_${Date.now()}`,
        orderId,
        senderId: 'system',
        senderName: 'Neighborly Escrow',
        senderAvatar: '',
        text: `Escrow payment has been released to the provider! Thank you for supporting your neighbor.`,
        timestamp: new Date().toISOString(),
        isSystem: true,
      };
      setMessages((prev) => [...prev, sysMsg]);
    }

    showToast('Payment released to neighbor! Thank you.');
  };

  // Submit Review
  const handleSubmitReview = (orderId: string, rating: number, comment: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              review: {
                rating,
                comment,
                reviewerName: currentUser?.name || 'Neighbor',
                createdAt: 'Just now',
              },
            }
          : o
      )
    );
    showToast('Review submitted! Thank you.');
  };

  // Active Chat Order
  const activeOrder = orders.find((o) => o.id === activeChatOrderId);
  const activeOrderMessages = messages.filter((m) => m.orderId === activeChatOrderId);

  // Count active orders for badge
  const activeOrdersCount = orders.filter(
    (o) =>
      (o.buyerId === currentUser?.id || o.sellerId === currentUser?.id) &&
      o.status !== 'completed' &&
      o.status !== 'cancelled'
  ).length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-950 flex flex-col font-sans selection:bg-zinc-950 selection:text-white pb-20 md:pb-0">
      
      {/* Toast Notification with larger radius and soft shadow */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-zinc-950 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-soft-xl flex items-center gap-2.5 animate-in slide-in-from-top-3 fade-in duration-200 border border-zinc-800">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
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
          setActiveView('auth');
        }}
        onLogout={handleLogout}
        onOpenPostRequest={() => {
          if (!currentUser) requireAuth('signup');
          else setIsPostRequestOpen(true);
        }}
        onOpenPostService={() => {
          if (!currentUser) requireAuth('signup');
          else setIsPostServiceOpen(true);
        }}
        onOpenAiAssistant={() => setIsChatbotOpen(true)}
        activeOrdersCount={activeOrdersCount}
      />

      {/* Main View Router */}
      <main className="flex-1">
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
              currentLocation={currentLocation}
              radiusKm={radiusKm}
              isWorkFromCurrentLocation={isWorkFromCurrentLocation}
              onDetectLocation={handleDetectGPS}
              onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
              onPostRequest={() => {
                if (!currentUser) requireAuth('signup');
                else setIsPostRequestOpen(true);
              }}
              onPostService={() => {
                if (!currentUser) requireAuth('signup');
                else setIsPostServiceOpen(true);
              }}
            />

            {/* Quick Service Highlights on Home */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-zinc-950">
                    Nearby in {currentLocation.neighborhood}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                    Skills offered within {radiusKm}km of your location
                  </p>
                </div>
                <button
                  onClick={() => setActiveView('browse')}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  View All Services →
                </button>
              </div>

              {/* Browse Services Component in Highlights Mode */}
              <BrowseServices
                services={services}
                currentLocation={currentLocation}
                radiusKm={radiusKm}
                onChangeRadiusKm={setRadiusKm}
                isWorkFromCurrentLocation={isWorkFromCurrentLocation}
                onToggleWorkFromCurrentLocation={setIsWorkFromCurrentLocation}
                onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
                onSelectService={(s) => setSelectedService(s)}
                onToggleSaveService={handleToggleSaveService}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onOpenPostService={() => {
                  if (!currentUser) requireAuth('signup');
                  else setIsPostServiceOpen(true);
                }}
                onOpenPostRequest={() => {
                  if (!currentUser) requireAuth('signup');
                  else setIsPostRequestOpen(true);
                }}
              />
            </div>
          </>
        )}

        {activeView === 'browse' && (
          <BrowseServices
            services={services}
            currentLocation={currentLocation}
            radiusKm={radiusKm}
            onChangeRadiusKm={setRadiusKm}
            isWorkFromCurrentLocation={isWorkFromCurrentLocation}
            onToggleWorkFromCurrentLocation={setIsWorkFromCurrentLocation}
            onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
            onSelectService={(s) => setSelectedService(s)}
            onToggleSaveService={handleToggleSaveService}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenPostService={() => {
              if (!currentUser) requireAuth('signup');
              else setIsPostServiceOpen(true);
            }}
            onOpenPostRequest={() => {
              if (!currentUser) requireAuth('signup');
              else setIsPostRequestOpen(true);
            }}
          />
        )}

        {activeView === 'orders' && currentUser && (
          <MyTasksOrdersView
            currentUser={currentUser}
            orders={orders}
            services={services}
            requests={requests}
            onOpenOrderChat={(id) => setActiveChatOrderId(id)}
            onOpenPostService={() => setIsPostServiceOpen(true)}
            onOpenPostRequest={() => setIsPostRequestOpen(true)}
            onDeleteService={handleDeleteService}
          />
        )}

        {activeView === 'ai' && (
          <AiAssistantModal
            isEmbedded={true}
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
          />
        )}

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

        {activeView === 'auth' && (
          <AuthModal
            isEmbeddedPage={true}
            onClose={() => setActiveView('home')}
            onSuccess={(user) => {
              handleAuthSuccess(user);
              setActiveView('home');
            }}
            onAdminSuccess={() => {
              setActiveView('admin');
              showToast('Authenticated to Administrative Command Center');
            }}
            currentLocation={currentLocation}
            initialMode={authModalMode}
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

      {/* Mobile Persistent Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200/80 shadow-soft-lg md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          
          <button
            onClick={() => setActiveView('home')}
            className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-colors ${
              activeView === 'home' ? 'text-zinc-950 font-bold' : 'text-zinc-500'
            }`}
          >
            <Home className="w-5 h-5 mb-1" />
            <span className="text-[10px]">Home</span>
          </button>

          <button
            onClick={() => setActiveView('browse')}
            className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-colors ${
              activeView === 'browse' ? 'text-zinc-950 font-bold' : 'text-zinc-500'
            }`}
          >
            <Compass className="w-5 h-5 mb-1" />
            <span className="text-[10px]">Explore</span>
          </button>

          {/* Quick Post Center Button */}
          <button
            onClick={() => {
              if (!currentUser) requireAuth('signup');
              else setIsPostRequestOpen(true);
            }}
            className="flex flex-col items-center justify-center -mt-5 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-950 text-white flex items-center justify-center shadow-soft-lg hover:scale-105 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-zinc-900 mt-1">Post</span>
          </button>

          <button
            onClick={() => setActiveView('ai')}
            className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-colors ${
              activeView === 'ai' ? 'text-indigo-600 font-bold' : 'text-zinc-500'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-1 text-indigo-600" />
            <span className="text-[10px]">AI Match</span>
          </button>

          <button
            onClick={() => {
              if (!currentUser) requireAuth('login');
              else setActiveView('orders');
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer relative transition-colors ${
              activeView === 'orders' ? 'text-zinc-950 font-bold' : 'text-zinc-500'
            }`}
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 mb-1" />
              {activeOrdersCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-zinc-950 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {activeOrdersCount}
                </span>
              )}
            </div>
            <span className="text-[10px]">Tasks</span>
          </button>

        </div>
      </div>

      {/* Modals & Dialogs */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          onAdminSuccess={() => {
            setActiveView('admin');
            showToast('Authenticated to Administrative Command Center');
          }}
          currentLocation={currentLocation}
          initialMode={authModalMode}
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

      {/* Clean Minimalist Footer with generous vertical spacing and radii */}
      <footer className="bg-white border-t border-zinc-200/80 mt-16 sm:mt-24 py-14 sm:py-16 text-zinc-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-4 gap-10">
          <div className="space-y-4">
            <NeighborLyLogo size="md" showTagline={true} tagline="Students Helping Students" />
            <p className="text-zinc-500 leading-relaxed text-xs">
              Hyperlocal neighborhood skills & task marketplace. Connect with nearby neighbors to get help affordably and reliably.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-700 bg-zinc-100/80 px-3 py-1.5 rounded-xl border border-zinc-200/70 w-fit font-medium">
              <Lock className="w-3.5 h-3.5 text-zinc-600" />
              <span>Escrow-Lite Protected</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-zinc-950 mb-3.5 uppercase tracking-wider text-[11px]">Popular Skills</h4>
            <ul className="space-y-2.5">
              <li><button onClick={() => { setSelectedCategory('Home & Repairs'); setActiveView('browse'); }} className="hover:text-zinc-950 cursor-pointer">Home Repairs & Assembly</button></li>
              <li><button onClick={() => { setSelectedCategory('Tech & Digital'); setActiveView('browse'); }} className="hover:text-zinc-950 cursor-pointer">PC, Wi-Fi & Tech Setup</button></li>
              <li><button onClick={() => { setSelectedCategory('Creative & Design'); setActiveView('browse'); }} className="hover:text-zinc-950 cursor-pointer">Design & Presentations</button></li>
              <li><button onClick={() => { setSelectedCategory('Lessons & Tutoring'); setActiveView('browse'); }} className="hover:text-zinc-950 cursor-pointer">Neighborhood Tutoring</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-zinc-950 mb-3.5 uppercase tracking-wider text-[11px]">Safety & Trust</h4>
            <ul className="space-y-2.5">
              <li><button onClick={() => { setAuthModalMode('signup'); setActiveView('auth'); }} className="hover:text-zinc-950 cursor-pointer">Google & Email Verification</button></li>
              <li><button onClick={() => setIsLocationPickerOpen(true)} className="hover:text-zinc-950 cursor-pointer">Work From Current Location</button></li>
              <li><button onClick={() => showToast('Escrow holds payment until you approve the task.')} className="hover:text-zinc-950 cursor-pointer">Escrow Payment Protection</button></li>
              <li>
                <button 
                  onClick={() => {
                    const session = getAdminSession();
                    if (session) {
                      setActiveView('admin');
                    } else {
                      setAuthModalMode('admin');
                      setIsAuthModalOpen(true);
                    }
                  }} 
                  className="hover:text-blue-600 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <span>Admin Command Portal</span> →
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-zinc-950 mb-3.5 uppercase tracking-wider text-[11px]">Current Location</h4>
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-1.5">
              <p className="font-bold text-zinc-950 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{currentLocation.neighborhood}</span>
              </p>
              <p className="text-xs text-zinc-500">{currentLocation.city}, {currentLocation.state || 'India'}</p>
              <p className="text-[11px] text-zinc-600 font-medium">Search radius: within {radiusKm} km</p>
              <button
                onClick={() => setIsLocationPickerOpen(true)}
                className="text-xs text-blue-600 font-bold hover:underline block pt-1.5 cursor-pointer"
              >
                Change or Detect GPS →
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-10 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-400">
          <p>© 2026 Neighborly. Built for neighbors to help neighbors.</p>
          <div className="flex items-center gap-4 text-xs">
            <span>Privacy</span>
            <span>·</span>
            <span>Terms</span>
            <span>·</span>
            <span>Guidelines</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Phone & Tablet) */}
      <MobileBottomNav
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setActiveView('auth');
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
