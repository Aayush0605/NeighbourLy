import React, { useState } from 'react';
import { 
  Briefcase, 
  MessageSquare, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  ArrowUpRight, 
  MapPin, 
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { Order, ServiceListing, TaskRequest, UserProfile } from '../types';

interface MyTasksOrdersViewProps {
  currentUser: UserProfile;
  orders: Order[];
  services: ServiceListing[];
  requests: TaskRequest[];
  onOpenOrderChat: (orderId: string) => void;
  onOpenPostService: () => void;
  onOpenPostRequest: () => void;
  onDeleteService: (serviceId: string) => void;
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
    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      alert(`₹${completedEarnings} sent directly to ${upiId} via Instant UPI!`);
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 tracking-tight">
            My Tasks & Neighborhood Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your booked tasks, services offered, and escrow payments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPostService}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
            <span>+ Offer a Skill</span>
          </button>
          <button
            onClick={onOpenPostRequest}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Post a Task</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'orders', label: `Active Orders (${myOrders.length})` },
          { id: 'my_services', label: `My Offered Skills (${myServices.length})` },
          { id: 'my_requests', label: `My Task Requests (${myRequests.length})` },
          { id: 'wallet', label: 'Escrow Wallet & Payout' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        
        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {myOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
                <Clock className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No active orders right now</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Browse neighborhood services or post a request to connect with local neighbors.
                </p>
                <div className="pt-2">
                  <button
                    onClick={onOpenPostRequest}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 cursor-pointer"
                  >
                    Post a Task You Need Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {myOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={ord.buyerId === currentUser.id ? ord.sellerAvatar : ord.buyerAvatar}
                        alt="User"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-100"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{ord.serviceTitle}</h4>
                        <p className="text-xs text-slate-500">
                          {ord.buyerId === currentUser.id
                            ? `Provider: ${ord.sellerName}`
                            : `Requester: ${ord.buyerName}`}{' '}
                          · Deadline: {ord.deadline}
                        </p>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                          Status: {ord.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <div className="text-right">
                        <span className="text-base font-black text-slate-900">₹{ord.amount}</span>
                        <span className="text-[10px] text-emerald-700 block font-medium">Escrow Protected</span>
                      </div>
                      <button
                        onClick={() => onOpenOrderChat(ord.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Open Thread</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Offered Skills */}
        {activeTab === 'my_services' && (
          <div className="space-y-4">
            {myServices.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
                <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">You haven't listed any skills yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Offer a skill in your neighborhood (e.g. computer repair, tutoring, handy work, design).
                </p>
                <div className="pt-2">
                  <button
                    onClick={onOpenPostService}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 cursor-pointer"
                  >
                    + Offer Your First Skill
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myServices.map((svc) => (
                  <div key={svc.id} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {svc.category}
                      </span>
                      <span className="text-sm font-black text-slate-900">₹{svc.price}</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{svc.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{svc.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-400">{svc.deliveryDays}d turnaround</span>
                      <button
                        onClick={() => onDeleteService(svc.id)}
                        className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: My Task Requests */}
        {activeTab === 'my_requests' && (
          <div className="space-y-4">
            {myRequests.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
                <PlusCircle className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No posted requests yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Need help with something? Broadcast a request to nearby neighbors.
                </p>
                <div className="pt-2">
                  <button
                    onClick={onOpenPostRequest}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 cursor-pointer"
                  >
                    + Post a Task Request
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((req) => (
                  <div key={req.id} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {req.category}
                      </span>
                      <span className="text-sm font-black text-slate-900">₹{req.budget}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{req.title}</h4>
                    <p className="text-xs text-slate-500">{req.description}</p>
                    <p className="text-[11px] text-slate-400">Due: {req.deadline}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Wallet */}
        {activeTab === 'wallet' && (
          <div className="max-w-md mx-auto space-y-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Available for Payout</span>
              <p className="text-3xl font-heading font-black text-slate-900 tabular-nums">
                ₹{completedEarnings}
              </p>
              {escrowHold > 0 && (
                <p className="text-xs text-amber-700 font-medium">
                  + ₹{escrowHold} held in active task escrow
                </p>
              )}
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800">Your UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="name@upi"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
              />
            </div>

            <button
              onClick={handleWithdraw}
              disabled={completedEarnings <= 0 || isWithdrawing}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{isWithdrawing ? 'Transferring...' : `Withdraw ₹${completedEarnings} to UPI`}</span>
            </button>

            <div className="p-3 bg-emerald-50 rounded-xl text-[11px] text-emerald-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero marketplace commission for direct peer neighborhood help.</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
