import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Send, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Download, 
  FileText, 
  Star, 
  Lock,
  ChevronDown,
  MapPin,
  X
} from 'lucide-react';
import { Order, Message, UserProfile } from '../types';
import { NeighborLyLogo } from './NeighborLyLogo';

interface ChatOrderModalProps {
  order: Order;
  messages: Message[];
  currentUser: UserProfile;
  onSendMessage: (orderId: string, text: string, attachmentUrl?: string, attachmentName?: string) => void;
  onDeliverWork: (orderId: string, fileName: string) => void;
  onCompleteOrder: (orderId: string) => void;
  onSubmitReview: (orderId: string, rating: number, comment: string) => void;
  onClose: () => void;
}

export const ChatOrderModal: React.FC<ChatOrderModalProps> = ({
  order,
  messages,
  currentUser,
  onSendMessage,
  onDeliverWork,
  onCompleteOrder,
  onSubmitReview,
  onClose,
}) => {
  const [inputText, setInputText] = useState('');
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [deliverFileName, setDeliverFileName] = useState('Completed_Task_Deliverable.zip');
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('Great communication, prompt delivery, and excellent neighborly help!');
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(order.id, inputText.trim());
      setInputText('');
    }
  };

  const isMeBuyer = currentUser.id === order.buyerId;
  const otherPartyName = isMeBuyer ? order.sellerName : order.buyerName;
  const otherPartyAvatar = isMeBuyer ? order.sellerAvatar : order.buyerAvatar;
  const otherPartyLocation = isMeBuyer ? order.sellerLocation : order.buyerLocation;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div 
        className="relative bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full shadow-soft-xl border border-zinc-200/90 overflow-hidden my-0 sm:my-auto flex flex-col h-[90vh] sm:h-[86vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <img
              src={otherPartyAvatar}
              alt={otherPartyName}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-zinc-200"
            />

            <div>
              <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-1.5">
                <span>{otherPartyName}</span>
                <span className="text-[10px] text-zinc-500 font-normal bg-zinc-100 px-2 py-0.5 rounded-full">
                  {isMeBuyer ? 'Neighbor Provider' : 'Neighbor Client'}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-zinc-400" />
                <span>{otherPartyLocation?.neighborhood || 'Nearby Area'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOrderDetails(!showOrderDetails)}
              className="px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold rounded-xl border border-zinc-200/80 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>₹{order.amount}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Collapsible Order Summary Bar */}
        {showOrderDetails && (
          <div className="bg-zinc-50/90 border-b border-zinc-200/80 p-4 text-xs space-y-2.5 animate-in slide-in-from-top-2 duration-150 shrink-0">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-zinc-600">Task: {order.serviceTitle}</span>
              <span className="text-zinc-950 font-bold bg-white px-2 py-0.5 rounded border border-zinc-200">
                Status: {order.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-500 text-[11px]">
              <span>Escrow Held: ₹{order.amount}</span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <Lock className="w-3 h-3" />
                <span>Protected by Escrow Services</span>
              </span>
            </div>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-zinc-50/50">
          {/* Order Start Alert */}
          <div className="max-w-md mx-auto p-4 bg-white rounded-2xl border border-zinc-200/80 shadow-soft-xs text-center space-y-2">
            <div className="flex items-center justify-center mx-auto">
              <NeighborLyLogo size="sm" variant="icon" />
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <p className="text-xs font-bold text-zinc-950">Neighborly Escrow Services (₹{order.amount})</p>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">Protected</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Funds safely held in escrow vault until {order.buyerName} inspects the deliverable and approves completion.
            </p>
          </div>

          {messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-zinc-950 text-white rounded-br-xs'
                      : 'bg-white border border-zinc-200/80 text-zinc-900 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Attachment if present */}
                  {msg.attachmentName && (
                    <div className={`mt-2.5 p-2 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                      isMe ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-800'
                    }`}>
                      <FileText className="w-4 h-4 shrink-0" />
                      <span className="truncate flex-1">{msg.attachmentName}</span>
                      <Download className="w-3.5 h-3.5 shrink-0 cursor-pointer" />
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-zinc-400 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Action Tray for Deliver / Approve */}
        <div className="bg-white border-t border-zinc-200 px-4 py-3 shrink-0 space-y-3">
          {/* Seller Action: Deliver Work */}
          {!isMeBuyer && order.status === 'in_escrow' && (
            <button
              onClick={() => setShowDeliverModal(true)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-soft-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit & Deliver Completed Task</span>
            </button>
          )}

          {/* Buyer Action: Approve & Release Escrow */}
          {isMeBuyer && order.status === 'delivered' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onCompleteOrder(order.id);
                  setShowReviewModal(true);
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-soft-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Work & Release Escrow (₹{order.amount})</span>
              </button>
            </div>
          )}

          {/* Review prompt if completed */}
          {order.status === 'completed' && !order.review && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-soft-xs"
            >
              <Star className="w-4 h-4" />
              <span>Leave a Neighbor Review</span>
            </button>
          )}

          {/* Chat Message Input Bar */}
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message your neighbor..."
              className="flex-1 px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white shadow-2xs"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-3 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-40 text-white rounded-2xl transition-all shadow-soft cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Deliver Work Modal */}
        {showDeliverModal && (
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-soft-xl">
              <h4 className="text-base font-bold text-zinc-950">Deliver Work to Client</h4>
              <p className="text-xs text-zinc-500">
                Confirm your task is done. The neighbor will review and release payment from escrow.
              </p>
              <input
                type="text"
                value={deliverFileName}
                onChange={(e) => setDeliverFileName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-900"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeliverModal(false)}
                  className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-2xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeliverWork(order.id, deliverFileName);
                    setShowDeliverModal(false);
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-semibold cursor-pointer shadow-soft-xs"
                >
                  Send Deliverable
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && (
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-soft-xl">
              <h4 className="text-base font-bold text-zinc-950">Rate Neighbor Experience</h4>
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your neighborly review..."
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-950"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-2xl text-xs font-semibold cursor-pointer"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSubmitReview(order.id, rating, reviewComment);
                    setShowReviewModal(false);
                  }}
                  className="flex-1 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl text-xs font-semibold cursor-pointer shadow-soft-xs"
                >
                  Post Review
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
