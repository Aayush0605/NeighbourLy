import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  ArrowRight, 
  MapPin, 
  ShieldCheck, 
  DollarSign, 
  HelpCircle, 
  RotateCcw,
  CheckCircle2,
  Briefcase,
  Compass
} from 'lucide-react';
import { ServiceListing, TaskRequest, LocationPoint, UserProfile } from '../types';
import { NeighborLyLogo } from './NeighborLyLogo';
import { StudentMascot } from './StudentMascot';

interface AiAssistantProps {
  isOpen?: boolean;
  onClose?: () => void;
  isEmbedded?: boolean; // when rendered as full view tab
  currentLocation: LocationPoint;
  services: ServiceListing[];
  requests: TaskRequest[];
  currentUser: UserProfile | null;
  onSelectService: (service: ServiceListing) => void;
  onOpenPostRequest: () => void;
  onOpenPostService: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedServices?: ServiceListing[];
  actionType?: 'post_request' | 'post_service' | 'explore';
}

export const AiAssistantModal: React.FC<AiAssistantProps> = ({
  isOpen = true,
  onClose,
  isEmbedded = false,
  currentLocation,
  services,
  requests,
  currentUser,
  onSelectService,
  onOpenPostRequest,
  onOpenPostService,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! 👋 I'm your **Neighborly AI Assistant**, powered by **Gemini 3.8 Flash**.\n\nI can help you find trusted skills near **${currentLocation.neighborhood || currentLocation.city}**, estimate fair neighbor pricing, draft task requests, or explain our **Escrow-Lite** safety guarantees. How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: '🔧 Find plumbers & repairs near me', prompt: `Find home repair and plumbing services near ${currentLocation.neighborhood}` },
    { label: '💰 Fair price for Wi-Fi / Tech setup', prompt: `What is the fair market price to pay a neighbor for Wi-Fi and router troubleshooting?` },
    { label: '🛡️ How does Escrow-Lite protection work?', prompt: `Explain how Neighborly's Escrow-Lite protects my money when hiring a neighbor` },
    { label: '📝 Help me write a task for pet sitting', prompt: `Help me draft a task request for a pet sitter for 2 days with recommended budget` },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          userLocation: currentLocation,
          localServices: services,
          taskRequests: requests,
        }),
      });

      if (!response.ok) {
        throw new Error('API response failed');
      }

      const data = await response.json();
      
      // Determine if there are matching services to embed
      const lower = query.toLowerCase();
      const matched = services.filter((s) => 
        lower.includes(s.category.toLowerCase()) ||
        lower.includes(s.title.toLowerCase()) ||
        s.skills.some((sk) => lower.includes(sk.toLowerCase()))
      ).slice(0, 2);

      const assistantMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "I've matched your request with local services in your neighborhood.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedServices: matched.length > 0 ? matched : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      // Graceful fallback
      const assistantMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: `Here are the top active listings near **${currentLocation.neighborhood}**:\n\n• **${services[0]?.title || 'Local Home Help'}** (₹${services[0]?.price || 350})\n• **${services[1]?.title || 'Tech Setup'}** (₹${services[1]?.price || 400})\n\nAll tasks include full **Escrow-Lite** safety.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedServices: services.slice(0, 2),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <div className={`flex flex-col h-full bg-white ${isEmbedded ? 'rounded-3xl border border-zinc-200/80 shadow-soft overflow-hidden' : ''}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-200/80 bg-zinc-50/70 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <StudentMascot variant="avatar" size="md" className="ring-2 ring-purple-300" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-950">
                Neighbor<span className="text-purple-600">Ly</span> AI Assistant
              </h3>
              <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60 px-2 py-0.5 rounded-full">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-purple-600" />
              <span>Learn · Earn · Grow together in {currentLocation.neighborhood}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages([messages[0]])}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          {!isEmbedded && onClose && (
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-zinc-50/40">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-zinc-950 text-white'
                    : 'bg-indigo-600 text-white shadow-soft-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div className="space-y-2 max-w-[85%] sm:max-w-xl">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-zinc-950 text-white rounded-tr-xs shadow-soft-xs'
                      : 'bg-white border border-zinc-200/80 text-zinc-900 rounded-tl-xs shadow-soft-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* If assistant matched specific listings */}
                  {msg.suggestedServices && msg.suggestedServices.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-zinc-100 space-y-2">
                      <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                        Matched Local Listings
                      </p>
                      <div className="space-y-2">
                        {msg.suggestedServices.map((svc) => (
                          <div
                            key={svc.id}
                            onClick={() => onSelectService(svc)}
                            className="p-3 bg-zinc-50 hover:bg-zinc-100/80 rounded-xl border border-zinc-200/70 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                          >
                            <div>
                              <p className="font-bold text-zinc-900 text-xs">{svc.title}</p>
                              <p className="text-[11px] text-zinc-500">
                                {svc.provider?.name} · {svc.distanceKm || '1.2'} km away
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-xs text-zinc-950">₹{svc.price}</span>
                              <span className="block text-[10px] text-blue-600 font-semibold">View →</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-zinc-400 px-1 block">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 mr-auto max-w-xl">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 bg-white border border-zinc-200/80 rounded-2xl rounded-tl-xs shadow-soft-xs flex items-center gap-2 text-xs text-zinc-500">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>Analyzing neighborhood services and estimating rates...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Inquiries Tray */}
      <div className="px-4 py-2 bg-white border-t border-zinc-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0">Suggestions:</span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp.prompt)}
            className="px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200/80 rounded-xl text-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border-t border-zinc-200/80 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Ask AI anything about neighborhood tasks near ${currentLocation.neighborhood}...`}
            className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200/90 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white shadow-2xs"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-5 py-3 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-40 text-white rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-soft flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Ask</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400 px-1">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Escrow-Lite & Identity Verified</span>
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenPostRequest}
              className="text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              + Post a Task Request
            </button>
            <span>·</span>
            <button
              onClick={onOpenPostService}
              className="text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              Offer a Skill
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isEmbedded) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 h-[calc(100vh-140px)] min-h-[600px]">
        {content}
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div 
        className="relative bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full shadow-soft-xl border border-zinc-200/90 overflow-hidden my-0 sm:my-auto flex flex-col h-[90vh] sm:h-[82vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </div>
    </div>
  );
};
