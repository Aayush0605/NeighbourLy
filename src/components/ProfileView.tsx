import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Briefcase, 
  Plus, 
  ShieldCheck, 
  Trash2, 
  Edit3, 
  DollarSign, 
  Award, 
  ExternalLink,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react';
import { UserProfile, ServiceListing, PortfolioItem, Order } from '../types';
import { AdminDashboard } from './AdminDashboard';
import { getServicePhoto } from '../utils/categoryImages';
import { CollegeAutocompleteInput } from './CollegeAutocompleteInput';
import { PortfolioShowcase } from './PortfolioShowcase';
import { ProfileReviewsSection } from './ProfileReviewsSection';

interface ProfileViewProps {
  currentUser: UserProfile;
  services: ServiceListing[];
  orders: Order[];
  onUpdateProfile: (updated: UserProfile) => void;
  onNavigateSeller: () => void;
  onNavigateOrders: () => void;
  onDeleteService: (serviceId: string) => void;
  onOpenOrderChat: (orderId: string) => void;
  onOpenPostService?: () => void;
  onAdminUpdateOrderStatus?: (orderId: string, status: any, escrowStatus: any) => void;
  onOpenVerificationModal?: () => void;
  onNavigatePortfolio?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  services,
  orders,
  onUpdateProfile,
  onNavigateSeller,
  onNavigateOrders,
  onDeleteService,
  onOpenOrderChat,
  onOpenPostService,
  onAdminUpdateOrderStatus,
  onOpenVerificationModal,
  onNavigatePortfolio,
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'portfolio' | 'credentials' | 'reviews' | 'admin'>('services');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(currentUser.bio || '');
  const [nameInput, setNameInput] = useState(currentUser.name || 'You');
  const [collegeInput, setCollegeInput] = useState(currentUser.studentUniversity || 'College / University');
  const [rateInput, setRateInput] = useState(currentUser.hourlyRate || 200);

  // New portfolio item modal state
  const [isAddPortfolioOpen, setIsAddPortfolioOpen] = useState(false);
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioDesc, setPortfolioDesc] = useState('');
  const [portfolioCategory, setPortfolioCategory] = useState('Academic Support');
  const [portfolioImageUrl, setPortfolioImageUrl] = useState('');

  // Robust matching for user's own services (by id, email, username, or name)
  const myServices = services.filter((s) => {
    if (s.providerId === currentUser.id) return true;
    if (s.provider?.id === currentUser.id) return true;
    if (currentUser.email && s.provider?.email && s.provider.email.toLowerCase() === currentUser.email.toLowerCase()) return true;
    if (currentUser.userId && s.provider?.userId && s.provider.userId === currentUser.userId) return true;
    if (currentUser.name && s.provider?.name && s.provider.name.toLowerCase() === currentUser.name.toLowerCase()) return true;
    return false;
  });

  // Calculate real metrics (No fake demo data)
  const totalOrders = orders.filter((o) => o.sellerId === currentUser.id || o.buyerId === currentUser.id).length;
  const completedJobs = orders.filter((o) => o.sellerId === currentUser.id && o.status === 'completed').length;
  const grossEarnings = orders
    .filter((o) => o.sellerId === currentUser.id && o.status === 'completed')
    .reduce((acc, o) => acc + o.amount, 0);
  const platformCommission = Math.round(grossEarnings * 0.08); // 8% commission cut
  const netEarnings = Math.max(0, grossEarnings - platformCommission); // 92% student payout

  // Profile completion calculation
  const completionPercent = Math.min(
    100,
    30 +
      (currentUser.bio ? 20 : 0) +
      (currentUser.studentVerified ? 20 : 0) +
      (myServices.length > 0 ? 15 : 0) +
      (currentUser.portfolio && currentUser.portfolio.length > 0 ? 15 : 0)
  );

  const handleSaveProfile = () => {
    const updated: UserProfile = {
      ...currentUser,
      name: nameInput.trim() || currentUser.name,
      bio: bioInput.trim(),
      studentUniversity: collegeInput.trim(),
      hourlyRate: Number(rateInput),
    };
    onUpdateProfile(updated);
    setIsEditingBio(false);
  };

  const handleAddPortfolioItem = () => {
    if (!portfolioTitle.trim()) return;
    const newItem: PortfolioItem = {
      id: `port_${Date.now()}`,
      title: portfolioTitle.trim(),
      description: portfolioDesc.trim(),
      category: portfolioCategory,
      imageUrl: portfolioImageUrl.trim() || getServicePhoto(portfolioCategory),
      date: 'Sep 2026',
    };
    const updatedPortfolio = [...(currentUser.portfolio || []), newItem];
    onUpdateProfile({
      ...currentUser,
      portfolio: updatedPortfolio,
    });
    setPortfolioTitle('');
    setPortfolioDesc('');
    setPortfolioImageUrl('');
    setIsAddPortfolioOpen(false);
  };

  const handleDeletePortfolioItem = (id: string) => {
    const updated = (currentUser.portfolio || []).filter((p) => p.id !== id);
    onUpdateProfile({ ...currentUser, portfolio: updated });
  };

  return (
    <div className="bg-[#FAF8F5] min-h-[calc(100vh-4rem)] py-8 sm:py-12 w-full max-w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 w-full max-w-full">
        
        {/* Top Profile Card (Exact Screenshot 3 Match) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/90 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            
            {/* Left Avatar & Bio */}
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-100 flex items-center justify-center text-3xl shrink-0 overflow-hidden ring-2 ring-zinc-200">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black font-heading text-zinc-950">
                    {currentUser.name}
                  </h1>
                  {currentUser.role === 'admin' && (
                    <span className="text-[10px] font-mono font-bold bg-zinc-950 text-white px-2 py-0.5 rounded">
                      ADMIN
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{currentUser.location?.neighborhood || 'Near Campus'}</span>
                </p>

                <p className="text-xs sm:text-sm text-zinc-600 max-w-lg leading-relaxed pt-1">
                  {currentUser.bio || 'Add a short bio so students and neighbors know your skills before booking.'}
                </p>

                {/* Profile Completion Bar */}
                <div className="pt-2 max-w-sm space-y-1">
                  <span className="text-[11px] text-zinc-500 font-semibold block">
                    Profile completion — {completionPercent}%
                  </span>
                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Quick Action Buttons */}
            <div className="flex flex-row sm:flex-col gap-2 shrink-0">
              <button
                onClick={() => setIsEditingBio(!isEditingBio)}
                className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer text-center"
              >
                {isEditingBio ? 'Close Editor' : 'Edit Profile'}
              </button>
              {onOpenVerificationModal && (
                <button
                  type="button"
                  onClick={onOpenVerificationModal}
                  className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>ID & Password Security</span>
                </button>
              )}
              {onNavigatePortfolio && (
                <button
                  type="button"
                  onClick={onNavigatePortfolio}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Portfolio (PPT/Video)</span>
                </button>
              )}
              <button
                onClick={() => {
                  setActiveTab('services');
                  document.getElementById('profile-services-tab')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-4 py-2 border text-xs font-semibold rounded-xl transition-all cursor-pointer text-center ${
                  activeTab === 'services'
                    ? 'bg-zinc-950 text-white border-zinc-950 shadow-soft-xs'
                    : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800'
                }`}
              >
                My Services ({myServices.length})
              </button>
              <button
                onClick={onNavigateOrders}
                className="px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold rounded-xl transition-all cursor-pointer text-center"
              >
                My Orders
              </button>
            </div>

          </div>

          {/* Inline Edit Form */}
          {isEditingBio && (
            <div className="pt-6 border-t border-zinc-100 space-y-4 animate-in fade-in duration-150">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Edit Your Information & Portfolio
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  />
                </div>
                  <div>
                    <CollegeAutocompleteInput
                      value={collegeInput}
                      onChange={setCollegeInput}
                      currentCity={currentUser.location?.city || 'Ludhiana'}
                      label="College / University"
                      placeholder="Start typing (e.g. PC for PCTE Ludhiana)..."
                      helperText="Type 'PC' for PCTE Ludhiana or select nearby colleges"
                    />
                  </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">About You / Short Bio</label>
                <textarea
                  rows={3}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="Share your college background, skills, and how you help peers..."
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-soft cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* 4 Metric Stats Cards (Live zero-demo-data metrics) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/90 shadow-2xs text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-black font-heading text-zinc-950 block">
              {myServices.length}
            </span>
            <span className="text-xs text-zinc-500 font-medium block">
              Services listed
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/90 shadow-2xs text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-black font-heading text-zinc-950 block">
              {totalOrders}
            </span>
            <span className="text-xs text-zinc-500 font-medium block">
              Total orders
            </span>
          </div>

          <button
            type="button"
            onClick={onNavigateOrders}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/90 shadow-2xs text-center space-y-1 hover:border-indigo-300 transition-all cursor-pointer group"
            title="Open Escrow Wallet & Direct Payouts"
          >
            <span className="text-2xl sm:text-3xl font-black font-heading text-emerald-700 block group-hover:scale-105 transition-transform">
              ₹{netEarnings}
            </span>
            <span className="text-xs text-zinc-500 font-medium block">
              Net Earnings (8% fee cut)
            </span>
            <span className="text-[10px] text-indigo-600 font-bold block">
              {currentUser.upiVerified ? '✓ Verified UPI Linked' : 'Verify UPI for Payouts →'}
            </span>
          </button>

          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/90 shadow-2xs text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-black font-heading text-zinc-950 block">
              {completedJobs}
            </span>
            <span className="text-xs text-zinc-500 font-medium block">
              Completed jobs
            </span>
          </div>
        </div>

        {/* Tab Navigation for Dashboard Management */}
        <div id="profile-services-tab" className="flex items-center gap-2 border-b border-zinc-200 pb-2 overflow-x-auto no-scrollbar w-full max-w-full whitespace-nowrap">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'services'
                ? 'bg-zinc-950 text-white shadow-soft-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            My Offered Services ({myServices.length})
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'portfolio'
                ? 'bg-zinc-950 text-white shadow-soft-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Portfolio & Work Showcase ({currentUser.portfolio?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'credentials'
                ? 'bg-zinc-950 text-white shadow-soft-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Student Badges & Trust
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'bg-zinc-950 text-white shadow-soft-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <span>Verified Task Reviews</span>
            <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-full font-mono font-bold">
              {currentUser.reviewCount || 0}
            </span>
          </button>
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === 'admin'
                  ? 'bg-rose-600 text-white shadow-soft-xs'
                : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Escrow Vault</span>
            </button>
          )}
        </div>

        {/* TAB 1: My Offered Services */}
        {activeTab === 'services' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-950">Services You Provide to Peers</h2>
              <button
                onClick={onNavigateSeller}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-soft flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Service</span>
              </button>
            </div>

            {myServices.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-zinc-200/80 shadow-2xs space-y-3">
                <span className="text-3xl">💼</span>
                <h3 className="text-sm font-bold text-zinc-900">You haven't listed any services yet</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Earn money on your own schedule by offering tutoring, coding, designs, or college assignment help.
                </p>
                <button
                  onClick={onNavigateSeller}
                  className="mt-2 px-5 py-2.5 bg-zinc-950 text-white text-xs font-bold rounded-xl shadow-soft cursor-pointer"
                >
                  List a Skill / Become a Seller
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myServices.map((service, idx) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-2xl overflow-hidden border border-zinc-200/90 shadow-2xs flex flex-col justify-between group"
                  >
                    <div className="h-36 w-full bg-zinc-100 overflow-hidden relative">
                      <img
                        src={service.coverImage || getServicePhoto(service.category, idx)}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded">
                          {service.category}
                        </span>
                      </div>
                      <div className="absolute bottom-2.5 right-2.5">
                        <span className="text-xs font-black text-white bg-indigo-600/90 backdrop-blur-xs px-2 py-1 rounded-lg">
                          ₹{service.price}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-zinc-950">{service.title}</h3>
                        <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{service.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-zinc-100 text-xs">
                        <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Active Listing</span>
                        </span>
                        <button
                          onClick={() => onDeleteService(service.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Portfolio Showcase */}
        {activeTab === 'portfolio' && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-zinc-200/90 shadow-2xs animate-in fade-in duration-200">
            <PortfolioShowcase
              portfolio={currentUser.portfolio || []}
              isEditable={true}
              onAddPortfolioItem={(newItem) => {
                const updatedPortfolio = [...(currentUser.portfolio || []), newItem];
                const newSkills = [...(currentUser.skills || [])];
                if (newItem.offeredSkill && !newSkills.includes(newItem.offeredSkill)) {
                  newSkills.push(newItem.offeredSkill);
                }
                const updatedUser: UserProfile = { 
                  ...currentUser, 
                  portfolio: updatedPortfolio,
                  skills: newSkills
                };
                onUpdateProfile(updatedUser);
              }}
              onDeletePortfolioItem={(itemId) => {
                const updatedPortfolio = (currentUser.portfolio || []).filter((p) => p.id !== itemId);
                const updatedUser: UserProfile = { ...currentUser, portfolio: updatedPortfolio };
                onUpdateProfile(updatedUser);
              }}
            />
          </div>
        )}

        {/* TAB 3: Student Credentials & Trust Badges */}
        {activeTab === 'credentials' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/90 shadow-2xs space-y-6 animate-in fade-in duration-200">
            <h2 className="text-base font-bold text-zinc-950">Campus Student Trust Verification</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-zinc-900">Campus Student Verified</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">
                    {currentUser.studentUniversity || 'Verified College Student Enrollment'}
                  </p>
                  <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-full inline-block mt-2">
                    Verified 🎓
                  </span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-zinc-900">Proper Escrow Services Active</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">
                    100% funds safely held in escrow and released upon client sign-off.
                  </p>
                  <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full inline-block mt-2">
                    100% Secured 🔒
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Verified Task Reviews */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/90 shadow-2xs space-y-6 animate-in fade-in duration-200">
            <ProfileReviewsSection
              targetUser={currentUser}
              currentUser={currentUser}
              orders={orders}
              onUpdateTargetUser={onUpdateProfile}
            />
          </div>
        )}

        {/* TAB 5: Admin Escrow Vault (Only visible if logged in as Admin) */}
        {activeTab === 'admin' && currentUser.role === 'admin' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <AdminDashboard
              services={services}
              requests={[]}
              orders={orders}
              currentLocation={currentUser.location || { lat: 28.6139, lng: 77.2090, neighborhood: 'Campus Area', city: 'Local City' }}
              currentUser={currentUser}
              onDeleteService={onDeleteService}
              onUpdateOrderStatus={onAdminUpdateOrderStatus || (() => {})}
              onOpenOrderChat={onOpenOrderChat}
              onNavigateHome={() => setActiveTab('services')}
            />
          </div>
        )}

      </div>
    </div>
  );
};
