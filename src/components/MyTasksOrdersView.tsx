import React, { useState } from 'react';
import { 
  Briefcase, 
  MessageSquare, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ArrowUpRight, 
  MapPin, 
  ShieldCheck, 
  Trash2 
} from 'lucide-react';
import { Order, ServiceListing, TaskRequest, UserProfile } from '../types';
import { NeighborLyLogo } from './NeighborLyLogo';
import { EscrowWalletDashboard } from './EscrowWalletDashboard';

interface MyTasksOrdersViewProps {
  currentUser: UserProfile;
  orders: Order[];
  services: ServiceListing[];
  requests: TaskRequest[];
  onOpenOrderChat: (orderId: string) => void;
  onOpenPostService: () => void;
  onOpenPostRequest: () => void;
  onDeleteService: (serviceId: string) => void;
  onUpdateUser?: (updated: UserProfile) => void;
  showToast?: (msg: string) => void;
}

export const MyTasksOrdersView: React.FC<MyTasksOrdersViewProps> = ({
  currentUser,
  orders,
  services,
  requests,
  onOpenOrderChat,
  onOpenPostService,
  onOpenPostRequest,
  onDeleteService,
  onUpdateUser,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'my_services' | 'my_requests' | 'wallet'>('orders');
  const [upiId, setUpiId] = useState('neighbor@upi');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // User's services
  const myServices = services.filter((s) => s.providerId === currentUser.id);

  // User's requests
  const myRequests = requests.filter((r) => r.requesterId === currentUser.id);

  // User's orders (both buying and selling)
  const myOrders = orders.filter(
    (o) => o.buyerId === currentUser.id || o.sellerId === currentUser.id
  );

  // Calculate wallet funds
  const completedEarnings = myOrders
    .filter((o) => o.sellerId === currentUser.id && o.status === 'completed')
    .reduce((sum, o) => sum + o.amount, 0);

  const escrowHold = myOrders
    .filter((o) => o.sellerId === currentUser.id && o.status !== 'completed')
    .reduce((sum, o) => sum + o.amount, 0);

  const handleWithdraw = () => {
    if (completedEarnings <= 0) return;
    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      showToast?.(`Withdrawal of ₹${completedEarnings} processed to ${upiId}`);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 w-full max-w-full overflow-x-hidden">
      
      {/* Header Profile Summary with generous radius and soft depth */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover ring-2 ring-zinc-200 shadow-soft-xs"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-zinc-950">{currentUser.name}</h1>
              <span className="text-[11px] text-zinc-500 bg-zinc-100 font-mono px-2 py-0.5 rounded-lg border border-zinc-200/60">
                @{currentUser.userId}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>{currentUser.location?.neighborhood || 'Current Neighborhood'}, {currentUser.location?.city}</span>
              <span className="text-zinc-300">·</span>
              <span>Joined {currentUser.joinedDate}</span>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          <button
            onClick={onOpenPostService}
            className="flex-1 sm:flex-initial justify-center px-4 py-2.5 text-xs font-semibold text-zinc-800 bg-white hover:bg-zinc-50 rounded-2xl border border-zinc-200/90 shadow-2xs hover:shadow-soft-xs transition-all flex items-center gap-2 cursor-pointer min-h-[42px]"
          >
            <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
            <span>Offer a Skill</span>
          </button>
          <button
            onClick={onOpenPostRequest}
            className="flex-1 sm:flex-initial justify-center px-4 py-2.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-2xl shadow-soft hover:shadow-soft-md transition-all flex items-center gap-2 cursor-pointer min-h-[42px]"
          >
            <Plus className="w-4 h-4" />
            <span>Post a Task</span>
          </button>
        </div>
      </div>

      {/* Segmented Navigation Tabs (Edge-to-edge scroll on mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200/70 no-scrollbar w-full max-w-full">
        {[
          { id: 'orders', label: 'Active Tasks & Orders', count: myOrders.length },
          { id: 'my_services', label: 'My Offered Skills', count: myServices.length },
          { id: 'my_requests', label: 'My Task Requests', count: myRequests.length },
          { id: 'wallet', label: 'Escrow Wallet & Payouts', count: `₹${completedEarnings}` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-zinc-950 text-white shadow-soft'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums ${
                activeTab === tab.id ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab 1: Orders (Buying or Selling) */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {myOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200/80 shadow-soft space-y-4">
              <div className="flex items-center justify-center">
                <NeighborLyLogo size="lg" variant="icon" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-950">No active tasks or orders yet</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Explore services in your neighborhood or post a task to connect with skilled neighbors.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {myOrders.map((order) => {
                const isBuyer = order.buyerId === currentUser.id;
                const otherPartyName = isBuyer ? order.sellerName : order.buyerName;
                const otherPartyAvatar = isBuyer ? order.sellerAvatar : order.buyerAvatar;

                return (
                  <div
                    key={order.id}
                    onClick={() => onOpenOrderChat(order.id)}
                    className="bg-white rounded-3xl p-6 border border-zinc-200/80 hover:border-zinc-300 shadow-soft hover:shadow-soft-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                          {isBuyer ? 'Hired Neighbor' : 'Client Neighbor'}
                        </span>
                        <h3 className="text-base font-bold text-zinc-950 group-hover:text-blue-600 transition-colors mt-0.5">
                          {order.serviceTitle}
                        </h3>
                      </div>
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                        order.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : order.status === 'delivered'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-zinc-100 text-zinc-800'
                      }`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-zinc-100">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={otherPartyAvatar}
                          alt={otherPartyName}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-200"
                        />
                        <span className="font-semibold text-zinc-800">{otherPartyName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-sm text-zinc-950 tabular-nums">₹{order.amount}</span>
                        <div className="p-1 rounded-lg group-hover:bg-zinc-100 text-zinc-400 group-hover:text-zinc-950 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: User's Offered Skills */}
      {activeTab === 'my_services' && (
        <div className="space-y-4">
          {myServices.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200/80 shadow-soft space-y-3">
              <Briefcase className="w-8 h-8 text-zinc-400 mx-auto" />
              <h3 className="text-base font-bold text-zinc-950">You haven't listed any skills yet</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Offer your skills (repairs, tech setup, pet sitting, design) to neighbors in your area.
              </p>
              <button
                onClick={onOpenPostService}
                className="mt-2 px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl text-xs font-semibold shadow-soft cursor-pointer"
              >
                Offer a Skill Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-soft flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">
                      {service.category}
                    </span>
                    <h3 className="text-base font-bold text-zinc-950 mt-1">{service.title}</h3>
                    <p className="text-xs text-zinc-500 line-clamp-2">{service.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-zinc-100">
                    <span className="font-bold text-base text-zinc-950 tabular-nums">₹{service.price}</span>
                    <button
                      onClick={() => onDeleteService(service.id)}
                      className="p-1.5 rounded-xl hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: User's Task Requests */}
      {activeTab === 'my_requests' && (
        <div className="space-y-4">
          {myRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200/80 shadow-soft space-y-3">
              <Plus className="w-8 h-8 text-zinc-400 mx-auto" />
              <h3 className="text-base font-bold text-zinc-950">No task requests posted</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Need immediate help with something in your home or neighborhood? Post a request.
              </p>
              <button
                onClick={onOpenPostRequest}
                className="mt-2 px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl text-xs font-semibold shadow-soft cursor-pointer"
              >
                Post a Task Request
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-soft flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">
                        {req.category}
                      </span>
                      <span className="text-xs text-zinc-500 font-semibold">{req.deadline}</span>
                    </div>
                    <h3 className="text-base font-bold text-zinc-950 mt-1">{req.title}</h3>
                    <p className="text-xs text-zinc-500 line-clamp-2">{req.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-zinc-100">
                    <span className="font-bold text-sm text-zinc-950">Budget: ₹{req.budget}</span>
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      Active Broadcast
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Wallet & Escrow Payouts (Proper Escrow Services with 8% Protection & Verified UPI) */}
      {activeTab === 'wallet' && (
        <EscrowWalletDashboard
          currentUser={currentUser}
          orders={orders}
          onUpdateUser={onUpdateUser || (() => {})}
          showToast={showToast || ((_msg) => {})}
        />
      )}

    </div>
  );
};
