import React, { useState } from 'react';
import { MessageSquare, ShieldCheck, CheckCircle2, Clock, Wallet, Star } from 'lucide-react';
import { Order, UserProfile } from '../types';
import { getServicePhoto } from '../utils/categoryImages';
import { EscrowWalletDashboard } from './EscrowWalletDashboard';

interface OrdersViewProps {
  orders: Order[];
  currentUser: UserProfile | null;
  onOpenOrderChat: (orderId: string) => void;
  onNavigateBrowse: () => void;
  onReleaseEscrow: (orderId: string) => void;
  onUpdateUser?: (updated: UserProfile) => void;
  showToast?: (msg: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  currentUser,
  onOpenOrderChat,
  onNavigateBrowse,
  onReleaseEscrow,
  onUpdateUser,
  showToast,
}) => {
  const [tab, setTab] = useState<'active' | 'completed' | 'cancelled' | 'wallet'>('active');

  const filteredOrders = orders.filter((o) => {
    if (tab === 'active') return o.status !== 'completed' && o.status !== 'cancelled';
    if (tab === 'completed') return o.status === 'completed';
    return o.status === 'cancelled';
  });

  const getStatusBadge = (order: Order) => {
    if (order.status === 'completed') {
      return (
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">
          Completed
        </span>
      );
    }
    if (order.status === 'delivered') {
      return (
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
          Ready for Review
        </span>
      );
    }
    if (order.status === 'in_escrow') {
      return (
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100/90 text-amber-800">
          In Progress
        </span>
      );
    }
    return (
      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-800">
        Confirmed
      </span>
    );
  };

  return (
    <div className="bg-[#FAF8F5] min-h-[calc(100vh-4rem)] py-8 sm:py-12 w-full max-w-full overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full">
        
        {/* Header (Exact Screenshot Match) */}
        <div className="mb-6 space-y-1">
          <h1 className="text-3xl font-heading font-black text-zinc-950">
            Your orders
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Track services you've booked, in progress, and completed.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1 no-scrollbar w-full max-w-full whitespace-nowrap">
          {[
            { id: 'active', label: 'Active Tasks' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
            { id: 'wallet', label: 'Escrow Wallet & Payouts (8% Fee)', icon: <Wallet className="w-3.5 h-3.5" /> },
          ].map((t) => {
            const isSelected = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'clay-button-primary text-white shadow-md'
                    : 'clay-pill text-zinc-700 hover:text-indigo-600'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content: Wallet & Payouts */}
        {tab === 'wallet' && currentUser && (
          <EscrowWalletDashboard
            currentUser={currentUser}
            orders={orders}
            onUpdateUser={onUpdateUser || (() => {})}
            showToast={showToast || (() => {})}
          />
        )}

        {/* Orders List for Active / Completed / Cancelled */}
        {tab !== 'wallet' && (
          <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200/80 shadow-2xs space-y-3">
              <span className="text-3xl">📦</span>
              <h3 className="text-base font-bold text-zinc-900">No {tab} orders</h3>
              <p className="text-xs text-zinc-500">Discover skills and services offered by peers near you.</p>
              <button
                onClick={onNavigateBrowse}
                className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            filteredOrders.map((order, idx) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-zinc-200/80 shadow-2xs hover:shadow-soft transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left Section: Photo, Title, Seller & Date */}
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={getServicePhoto(order.category || 'Academic Support', idx)}
                    alt={order.serviceTitle}
                    className="w-14 h-14 rounded-2xl object-cover ring-1 ring-zinc-200 shrink-0"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-zinc-950 truncate">
                      {order.serviceTitle}
                    </h3>
                    <p className="text-xs text-zinc-500 flex items-center gap-2">
                      <img
                        src={order.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={order.sellerName}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span>{order.sellerName} · {order.createdAt}</span>
                    </p>
                  </div>
                </div>

                {/* Right Section: Price, Status Badge, Actions */}
                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100 min-w-0">
                  <div className="text-right">
                    <span className="text-base font-black text-zinc-950 font-heading block">
                      ₹{order.amount}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-semibold block">
                      8% fee: ₹{Math.round(order.amount * 0.08)}
                    </span>
                  </div>

                  {getStatusBadge(order)}

                  <div className="flex items-center gap-2">
                    {order.status === 'delivered' && order.escrowStatus === 'held' && (
                      <button
                        onClick={() => onReleaseEscrow(order.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-soft transition-all cursor-pointer"
                      >
                        Approve & Release
                      </button>
                    )}
                    {order.status === 'completed' && !order.review && (
                      <button
                        onClick={() => onOpenOrderChat(order.id)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-soft transition-all cursor-pointer flex items-center gap-1"
                        title="Leave review for completed task"
                      >
                        <Star className="w-3.5 h-3.5 fill-white text-white" />
                        <span>Leave Review</span>
                      </button>
                    )}
                    {order.status === 'completed' && order.review && (
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>Reviewed ({order.review.rating}★)</span>
                      </span>
                    )}
                    <button
                      onClick={() => onOpenOrderChat(order.id)}
                      className="px-4 py-1.5 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold rounded-xl border border-zinc-200/90 transition-all cursor-pointer"
                    >
                      Message
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
        )}

      </div>
    </div>
  );
};
