import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Paperclip, 
  Send, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Download, 
  FileText, 
  Star, 
  Sparkles,
  Lock,
  ChevronDown,
  MapPin
} from 'lucide-react';
import { Order, Message, UserProfile } from '../types';

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col h-[88vh]">
        
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <img
              src={otherPartyAvatar}
              alt={otherPartyName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-100 shadow-2xs"
            />

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900">{otherPartyName}</h3>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-1.5 py-0.2 rounded">
                  Neighbor
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                <span>{otherPartyLocation?.neighborhood || 'Nearby'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowOrderDetails(!showOrderDetails)}
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors flex items-center gap-1.5 border border-emerald-200 cursor-pointer"
          >
            <span>
              {order.status === 'completed'
                ? 'Completed'
                : order.status === 'delivered'
                ? 'Delivered'
                : `Escrow Hold (₹${order.amount})`}
            </span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Details dropdown */}
        {showOrderDetails && (
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 space-y-2 animate-in slide-in-from-top-1 duration-150 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">{order.serviceTitle}</span>
                <p className="text-[11px] text-slate-500">Order ID: #{order.id} · Deadline: {order.deadline}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-slate-900">₹{order.amount}</span>
                <p className="text-[10px] text-emerald-700 font-bold">Escrow-Lite Protected</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
              {order.status !== 'completed' && order.status !== 'delivered' && (
                <button
                  onClick={() => setShowDeliverModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Deliver Work Files
                </button>
              )}

              {order.status === 'delivered' && isMeBuyer && (
                <button
                  onClick={() => onCompleteOrder(order.id)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Approve & Release Escrow Funds
                </button>
              )}

              {order.status === 'completed' && !order.review && isMeBuyer && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Leave Rating & Review
                </button>
              )}
            </div>
          </div>
        )}

        {/* Delivered notification */}
        {order.status === 'delivered' && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-emerald-950">Work has been delivered!</p>
                <p className="text-[11px] text-emerald-800">Review deliverables. Funds are released when buyer marks complete.</p>
              </div>
            </div>
            {isMeBuyer && (
              <button
                onClick={() => onCompleteOrder(order.id)}
                className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer"
              >
                Mark Complete
              </button>
            )}
          </div>
        )}

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
          <div className="text-center my-2">
            <span className="text-[10px] font-semibold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">
              Task started: {order.createdAt}
            </span>
          </div>

          {messages.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No messages yet. Send a greeting to start coordinating!
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 ring-1 ring-slate-200"
                    />
                  )}

                  <div className={`max-w-[78%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-2xl p-3 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                        isMe
                          ? 'bg-emerald-600 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                    <div className={`text-[10px] text-slate-400 px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp}
                    </div>
                  </div>

                  {isMe && (
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 ring-1 ring-emerald-200"
                    />
                  )}
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message to your neighbor..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm text-slate-900 bg-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 border border-slate-200/80"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-md shadow-emerald-200 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>

        {/* Deliver Work Modal */}
        {showDeliverModal && (
          <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Upload Task Deliverables</h4>
              <p className="text-xs text-slate-500">
                Notify the requester that the work has been completed.
              </p>

              <div>
                <label className="text-xs font-bold text-slate-700">File Name / Link</label>
                <input
                  type="text"
                  value={deliverFileName}
                  onChange={(e) => setDeliverFileName(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeliverModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeliverWork(order.id, deliverFileName);
                    setShowDeliverModal(false);
                  }}
                  className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer"
                >
                  Send Delivery
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leave Review Modal */}
        {showReviewModal && (
          <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Leave a Review</h4>
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer"
                  >
                    <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Comment</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  className="w-full mt-1 p-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-2 text-xs text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSubmitReview(order.id, rating, reviewComment);
                    setShowReviewModal(false);
                  }}
                  className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl cursor-pointer"
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
