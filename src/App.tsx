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
import { 
  MapPin, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  Lock, 
  Briefcase, 
  PlusCircle, 
  Check 
} from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getSavedAuthUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot_password'>('login');

  // Location State ("Select work from my current location")
  const [currentLocation, setCurrentLocation] = useState<LocationPoint>(() => {
    return currentUser?.location || DEFAULT_LOCATION;
  });
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [isWorkFromCurrentLocation, setIsWorkFromCurrentLocation] = useState<boolean>(true);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  // Navigation View
  const [activeView, setActiveView] = useState<'home' | 'browse' | 'orders'>('home');

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
    showToast('Signed out of NeighborLy');
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

  // Add a new Service
  const handleAddService = (
    data: Omit<ServiceListing, 'id' | 'provider' | 'providerId' | 'rating' | 'reviewCount'>
  ) => {
    if (!currentUser) {
      requireAuth();
      return;
    }

    const newService: ServiceListing = {
      id: `svc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      providerId: currentUser.id,
      provider: currentUser,
      title: data.title,
      description: data.description,
      category: data.category,
      price: data.price,
      rushPrice: data.rushPrice,
      rushHours: data.rushHours,
      deliveryDays: data.deliveryDays,
      deliveryHours: data.deliveryHours,
      revisions: data.revisions,
      isUrgent: data.isUrgent,
      rating: 5.0,
      reviewCount: 0,
      coverGradient: data.coverGradient,
      skills: data.skills,
      location: data.location,
      trsScore: 95,
    };

    setServices((prev) => [newService, ...prev]);
    showToast('Service published to your neighborhood!');
  };

  // Post a Task Request
  const handlePostRequest = (
    data: Omit<
      TaskRequest,
      'id' | 'requesterId' | 'requesterName' | 'requesterAvatar' | 'requesterLocation' | 'status' | 'createdAt'
    >
  ) => {
    if (!currentUser) {
      requireAuth();
      return;
    }

    const newReq: TaskRequest = {
      id: `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterAvatar: currentUser.avatar,
      requesterLocation: currentLocation,
      title: data.title,
      description: data.description,
      category: data.category,
      budget: data.budget,
      deadline: data.deadline,
      isUrgent: data.isUrgent,
      status: 'open',
      createdAt: 'Just now',
      filesAttached: data.filesAttached,
    };

    setRequests((prev) => [newReq, ...prev]);
    showToast('Task posted! Nearby neighbors have been notified.');
  };

  // Delete Service
  const handleDeleteService = (serviceId: string) => {
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
    showToast('Service removed.');
  };

  // Request & Book a Service
  const handleRequestOrder = (service: ServiceListing, withRush: boolean) => {
    if (!currentUser) {
      requireAuth();
      return;
    }

    const orderPrice = withRush ? service.price + (service.rushPrice || 100) : service.price;
    const newOrderId = `ord_${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: newOrderId,
      serviceId: service.id,
      serviceTitle: service.title,
      category: service.category,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerAvatar: currentUser.avatar,
      buyerLocation: currentLocation,
      sellerId: service.providerId,
      sellerName: service.provider.name,
      sellerAvatar: service.provider.avatar,
      sellerLocation: service.location,
      status: 'in_escrow',
      amount: orderPrice,
      rushDelivery: withRush,
      createdAt: 'Just now',
      deadline: withRush ? 'Within 4 hours' : `${service.deliveryDays} Day(s)`,
      escrowStatus: 'held',
      deliveryFiles: [],
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Initial greeting
    const initialMsg: Message = {
      id: `msg_${Date.now()}`,
      orderId: newOrderId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      isSeller: false,
      text: `Hi ${service.provider.name}! I booked your neighborhood service "${service.title}". ₹${orderPrice} is held safely in escrow. Looking forward to working together!`,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, initialMsg]);

    setSelectedService(null);
    setActiveChatOrderId(newOrderId);
    showToast(`Order created! ₹${orderPrice} held in Escrow-Lite.`);
  };

  // Send message
  const handleSendMessage = (orderId: string, text: string) => {
    if (!currentUser) return;
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      orderId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      isSeller: false,
      text,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  // Deliver Work
  const handleDeliverWork = (orderId: string, fileName: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'delivered',
            deliveryFiles: [...(ord.deliveryFiles || []), { name: fileName, size: '4.2 MB' }],
          };
        }
        return ord;
      })
    );

    if (currentUser) {
      const msg: Message = {
        id: `msg_${Date.now()}`,
        orderId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        isSeller: true,
        text: `Delivered files: ${fileName}. Please check and mark complete!`,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, msg]);
    }
    showToast('Work delivered to neighbor for approval.');
  };

  // Complete Order & Release Escrow
  const handleCompleteOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'completed',
            escrowStatus: 'released',
          };
        }
        return ord;
      })
    );
    showToast('Task marked Complete! Escrow funds released.');
  };

  // Submit Review
  const handleSubmitReview = (orderId: string, rating: number, comment: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            review: {
              rating,
              comment,
              createdAt: 'Just now',
            },
          };
        }
        return ord;
      })
    );
    showToast('Thank you! Your verified review has been posted.');
  };

  const activeOrder = orders.find((o) => o.id === activeChatOrderId);
  const activeOrderMessages = messages.filter((m) => m.orderId === activeChatOrderId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        currentLocation={currentLocation}
        radiusKm={radiusKm}
        isWorkFromCurrentLocation={isWorkFromCurrentLocation}
        onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
        currentUser={currentUser}
        onOpenAuth={(mode) => requireAuth(mode || 'login')}
        onLogout={handleLogout}
        onOpenPostRequest={() => {
          if (!currentUser) requireAuth('signup');
          else setIsPostRequestOpen(true);
        }}
        onOpenPostService={() => {
          if (!currentUser) requireAuth('signup');
          else setIsPostServiceOpen(true);
        }}
        activeOrdersCount={orders.filter((o) => o.status !== 'completed').length}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {activeView === 'home' && (
          <div>
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

            {/* Embedded Live Nearby Services Strip */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight">
                    Skills & Services in {currentLocation.neighborhood}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Discovered within {radiusKm} km of your location
                  </p>
                </div>
                <button
                  onClick={() => setActiveView('browse')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  Explore All →
                </button>
              </div>

              <BrowseServices
                services={services}
                currentLocation={currentLocation}
                radiusKm={radiusKm}
                onChangeRadiusKm={setRadiusKm}
                isWorkFromCurrentLocation={isWorkFromCurrentLocation}
                onToggleWorkFromCurrentLocation={setIsWorkFromCurrentLocation}
                onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
                onSelectService={(svc) => setSelectedService(svc)}
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
          </div>
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
            onSelectService={(svc) => setSelectedService(svc)}
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

        {activeView === 'orders' && (
          <MyTasksOrdersView
            currentUser={currentUser || ({} as UserProfile)}
            orders={orders}
            services={services}
            requests={requests}
            onOpenOrderChat={(orderId) => setActiveChatOrderId(orderId)}
            onOpenPostService={() => setIsPostServiceOpen(true)}
            onOpenPostRequest={() => setIsPostRequestOpen(true)}
            onDeleteService={handleDeleteService}
          />
        )}
      </main>

      {/* Modals */}

      {/* 1. Auth Modal (Google Auth, UserID/Email and Password Login, Password Reset) */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          currentLocation={currentLocation}
          initialMode={authModalMode}
        />
      )}

      {/* 2. Location Picker Modal ("Select work from my current location") */}
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

      {/* 3. Offer a Skill / Post Service Modal */}
      {isPostServiceOpen && (
        <PostServiceModal
          onClose={() => setIsPostServiceOpen(false)}
          onSubmit={handleAddService}
          currentLocation={currentLocation}
          currentUser={currentUser}
          onRequireAuth={() => requireAuth('signup')}
        />
      )}

      {/* 4. Post a Task Request Modal */}
      {isPostRequestOpen && (
        <PostRequestModal
          onClose={() => setIsPostRequestOpen(false)}
          onSubmit={handlePostRequest}
          currentLocation={currentLocation}
          currentUser={currentUser}
          onRequireAuth={() => requireAuth('signup')}
        />
      )}

      {/* 5. Service Detail Modal */}
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

      {/* 6. Chat / Order Thread Modal */}
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

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-heading font-black">
                N
              </div>
              <span className="text-base font-heading font-black text-slate-900">
                Neighbor<span className="text-emerald-600">Ly</span>
              </span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Hyperlocal neighborhood skills & task marketplace. Connect with nearby neighbors to get help affordably and reliably.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 w-fit">
              <Lock className="w-3.5 h-3.5" />
              <span>Escrow-Lite Protected</span>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Popular Skills</h4>
            <ul className="space-y-2">
              <li><button onClick={() => { setSelectedCategory('Home & Repairs'); setActiveView('browse'); }} className="hover:text-emerald-700 cursor-pointer">Home Repairs & Assembly</button></li>
              <li><button onClick={() => { setSelectedCategory('Tech & Digital'); setActiveView('browse'); }} className="hover:text-emerald-700 cursor-pointer">PC, Wi-Fi & Tech Setup</button></li>
              <li><button onClick={() => { setSelectedCategory('Creative & Design'); setActiveView('browse'); }} className="hover:text-emerald-700 cursor-pointer">Presentations & Creative Work</button></li>
              <li><button onClick={() => { setSelectedCategory('Lessons & Tutoring'); setActiveView('browse'); }} className="hover:text-emerald-700 cursor-pointer">Neighborhood Tutoring</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Trust & Neighborhood Safety</h4>
            <ul className="space-y-2">
              <li><button onClick={() => requireAuth('signup')} className="hover:text-emerald-700 cursor-pointer">Google & Email Verification</button></li>
              <li><button onClick={() => setIsLocationPickerOpen(true)} className="hover:text-emerald-700 cursor-pointer">Work From Current Location</button></li>
              <li><button onClick={() => showToast('Escrow-Lite holds funds until you confirm satisfaction.')} className="hover:text-emerald-700 cursor-pointer">Escrow Payment Protection</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Your Current Location</h4>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <p className="font-bold text-slate-900 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentLocation.neighborhood}</span>
              </p>
              <p className="text-[11px] text-slate-500">{currentLocation.city}, {currentLocation.state || 'India'}</p>
              <p className="text-[10px] text-emerald-700 font-bold">Search radius: within {radiusKm} km</p>
              <button
                onClick={() => setIsLocationPickerOpen(true)}
                className="text-xs text-emerald-700 font-bold hover:underline block pt-1 cursor-pointer"
              >
                Change or Detect GPS Location →
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 NeighborLy. Built for neighbors to help neighbors.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Community Guidelines</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
