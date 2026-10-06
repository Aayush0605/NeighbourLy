import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  User, 
  MapPin, 
  ShieldCheck, 
  RotateCcw, 
  ChevronDown, 
  Plus, 
  Briefcase, 
  ExternalLink,
  Bot,
  MessageCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { ServiceListing, TaskRequest, LocationPoint, UserProfile } from '../types';
import { NeighborLyLogo } from './NeighborLyLogo';
import { StudentMascot } from './StudentMascot';

interface AiChatbotWidgetProps {
  currentLocation: LocationPoint;
  services: ServiceListing[];
  requests: TaskRequest[];
  currentUser: UserProfile | null;
  onSelectService: (service: ServiceListing) => void;
  onOpenPostRequest: () => void;
  onOpenPostService: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedServices?: ServiceListing[];
}

export const AiChatbotWidget: React.FC<AiChatbotWidgetProps> = ({
  currentLocation,
  services,
  requests,
  currentUser,
  onSelectService,
  onOpenPostRequest,
  onOpenPostService,
  isOpen,
  onToggleOpen,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello neighbor! 👋 I'm your **Neighborly AI Assistant**, powered by **Gemini 3.8 Flash**.\n\nI can help you:\n• Find trusted neighbors for home repairs, tech setup, pet care & tutoring near **${currentLocation.neighborhood || currentLocation.city}**\n• Estimate fair market rates for neighborhood tasks\n• Help draft your task request or skill listing\n• Explain our **Verified Escrow Services** safety guarantees\n\nHow can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickPrompts = [
    { label: '🔧 Find repairs & plumbing', prompt: `Find home repair and plumbing services near ${currentLocation.neighborhood}` },
    { label: '💰 Tech setup price guide', prompt: `What is the fair market rate to pay a neighbor for Wi-Fi and PC troubleshooting?` },
    { label: '🛡️ How do Escrow Services work?', prompt: `How does Neighborly Verified Escrow Protection protect my money?` },
    { label: '📝 Help draft dog walking task', prompt: `Help me draft a task request for pet sitting with recommended budget` },
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isLoading, isOpen]);

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

      // Find matching local services to display as interactive cards
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
    } catch {
      // Graceful intelligent fallback
      const lower = query.toLowerCase();
      let matched = services.filter((s) => 
        lower.includes(s.category.toLowerCase()) ||
        lower.includes(s.title.toLowerCase())
      ).slice(0, 2);

      if (matched.length === 0) {
        matched = services.slice(0, 2);
      }

      const assistantMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: `Here are recommended verified listings near **${currentLocation.neighborhood}**:\n\n• **${matched[0]?.title || 'Neighborhood Helper'}** (₹${matched[0]?.price || 350})\n• **${matched[1]?.title || 'Tech Setup'}** (₹${matched[1]?.price || 400})\n\nAll tasks include complete **Proper Escrow Services** safety.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedServices: matched,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: `Conversation reset. How can I help you find or offer local tasks near **${currentLocation.neighborhood}**?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button with Student Mascot */}
      {!isOpen && (
        <button
          onClick={onToggleOpen}
          aria-label="Open Neighborly AI Assistant"
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 group flex items-center gap-2.5 pl-2 pr-4 py-2 bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20"
        >
          <div className="relative">
            <StudentMascot variant="avatar" size="sm" className="ring-2 ring-white/40 shadow-soft-xs" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-purple-800 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-purple-800" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="block text-xs font-extrabold tracking-tight leading-none text-white">
              NeighborLy AI
            </span>
            <span className="text-[10px] text-purple-200 leading-none">
              Learn · Earn · Grow
            </span>
          </div>
        </button>
      )}

      {/* Floating Chatbot Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-200 flex flex-col bg-white border border-zinc-200/90 shadow-2xl overflow-hidden ${
            isExpanded
              ? 'inset-2 sm:inset-10 rounded-3xl'
              : 'bottom-20 md:bottom-6 left-3 sm:left-auto right-3 sm:right-6 sm:w-[420px] max-w-[calc(100%-1.5rem)] h-[520px] sm:h-[580px] max-h-[80vh] sm:max-h-[85vh] rounded-3xl'
          } animate-in slide-in-from-bottom-4 zoom-in-95 duration-200`}
        >
          {/* Header */}
          <div className="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white flex items-center justify-between shrink-0 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <StudentMascot variant="avatar" size="sm" className="ring-1 ring-white/20" />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    Neighbor<span className="text-purple-400">Ly</span> AI
                  </h3>
                  <span className="text-[9px] bg-purple-500/20 text-purple-300 font-extrabold border border-purple-500/30 px-1.5 py-0.2 rounded-md">
                    Gemini 3.8
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                  <span className="truncate max-w-[190px]">{currentLocation.neighborhood}, {currentLocation.city}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer hidden sm:block"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={onToggleOpen}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-zinc-50/50">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[92%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      isUser
                        ? 'bg-zinc-950 text-white'
                        : 'bg-indigo-600 text-white shadow-soft-xs'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div className="space-y-1.5 max-w-[85%]">
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? 'bg-zinc-950 text-white rounded-tr-xs shadow-soft-xs'
                          : 'bg-white border border-zinc-200/80 text-zinc-800 rounded-tl-xs shadow-soft-xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>

                      {/* Matched Local Listing Cards */}
                      {msg.suggestedServices && msg.suggestedServices.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-zinc-100 space-y-2">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            Recommended Gigs Nearby
                          </p>
                          <div className="space-y-1.5">
                            {msg.suggestedServices.map((svc) => (
                              <div
                                key={svc.id}
                                onClick={() => {
                                  onSelectService(svc);
                                }}
                                className="p-2.5 bg-zinc-50 hover:bg-indigo-50/60 rounded-xl border border-zinc-200/80 flex items-center justify-between gap-2.5 cursor-pointer transition-colors group"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-zinc-900 text-xs truncate group-hover:text-indigo-700">
                                    {svc.title}
                                  </p>
                                  <p className="text-[11px] text-zinc-500 truncate">
                                    {svc.provider?.name} · {svc.distanceKm || '1.2'} km away
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-bold text-xs text-zinc-950">₹{svc.price}</span>
                                  <span className="flex items-center gap-0.5 text-[10px] text-indigo-600 font-semibold group-hover:underline">
                                    <span>View</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] text-zinc-400 px-1 block">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 mr-auto max-w-[85%]">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="p-3 bg-white border border-zinc-200/80 rounded-2xl rounded-tl-xs shadow-soft-xs flex items-center gap-2 text-xs text-zinc-500">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                  <span>Checking local listings with Gemini...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3 py-2 bg-white border-t border-zinc-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.prompt)}
                className="px-2.5 py-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200/80 rounded-xl text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-zinc-200/80 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about local tasks, rates, or helpers..."
                className="flex-1 px-3.5 py-2.5 bg-zinc-50 border border-zinc-200/90 rounded-2xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white shadow-2xs placeholder:text-zinc-400"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-40 text-white rounded-2xl transition-all shadow-soft flex items-center justify-center shrink-0 cursor-pointer"
                title="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400 px-1">
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Proper Escrow Protected</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenPostRequest}
                  className="text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  + Post Task
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={onOpenPostService}
                  className="text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  Offer Skill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
