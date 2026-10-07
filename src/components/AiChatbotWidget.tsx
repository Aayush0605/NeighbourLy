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
  Maximize2,
  DollarSign,
  SlidersHorizontal,
  Presentation,
  Video,
  FileText
} from 'lucide-react';
import { ServiceListing, TaskRequest, LocationPoint, UserProfile } from '../types';
import { getAuthHeaders } from '../services/authService';
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
  suggestedRequests?: TaskRequest[];
}

function cleanChatMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/^#{1,6}\s+/gm, '') // Remove markdown heading hashtags
    .replace(/\*{1,3}(.*?)\*{1,3}/g, '$1') // Remove asterisks
    .replace(/_{1,3}(.*?)_{1,3}/g, '$1') // Remove underscores
    .replace(/`([^`]+)`/g, '$1') // Remove backticks
    .trim();
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
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(5);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello neighbor! 👋 I am your NeighborLy AI Assistant, powered by live platform data.\n\nI have direct access to our live ${currentLocation.neighborhood || currentLocation.city} database to help you:\n\n• 📍 Radius Search: Match skills and tasks within ${selectedRadiusKm} km\n• 💰 Real Pricing: PPT & Pitch Decks (₹200–₹450), 4K Video Edits (₹300–₹600), Tutoring (₹180–₹350)\n• 📋 Open Field Works: Browse or post offline campus tasks\n• 🛡️ Escrow Protection: Full money safety with transparent 8% platform fee\n\nHow can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickPrompts = [
    { label: '📊 PPT Presentation rates', prompt: `What are the market rates and top student creators for PPT pitch deck design in ${currentLocation.city}?` },
    { label: '🎬 4K Video & Reel editors', prompt: `Find 4K video editing and reel creators near ${currentLocation.neighborhood}` },
    { label: '📋 Open Field Works', prompt: `Show all active open field works and task requests in ${currentLocation.neighborhood}` },
    { label: '📍 Within 2 km Radius', prompt: `Show all verified student services available within 2 km of ${currentLocation.neighborhood}` },
    { label: '🛡️ How does Escrow work?', prompt: `How does Neighborly Verified Escrow Protection work with the 8% fee?` },
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
      const headers = await getAuthHeaders();
      const response = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt: query,
          userLocation: currentLocation,
          localServices: services.slice(0, 20).map((s) => ({
            id: s.id,
            title: s.title,
            category: s.category,
            price: s.price,
            deliveryDays: s.deliveryDays,
            provider: {
              name: s.provider?.name,
              studentUniversity: s.provider?.studentUniversity,
              studentVerified: s.provider?.studentVerified,
            },
            distanceKm: s.distanceKm,
            location: s.location,
            skills: s.skills,
          })),
          taskRequests: requests.slice(0, 15).map((r) => ({
            id: r.id,
            title: r.title,
            category: r.category,
            budget: r.budget,
            requesterName: r.requesterName,
            requesterLocation: r.requesterLocation,
            urgent: r.isUrgent || r.urgent,
          })),
          maxRadiusKm: selectedRadiusKm,
        }),
      });

      if (!response.ok) {
        throw new Error('API response failed');
      }

      const data = await response.json();

      // Only show suggested cards if user explicitly asked for recommendations / skills or server returned them
      const lower = query.toLowerCase();
      const isRecommendationIntent = 
        lower.includes('recommend') ||
        lower.includes('suggest') ||
        lower.includes('show') ||
        lower.includes('find') ||
        lower.includes('hire') ||
        lower.includes('service') ||
        lower.includes('skill') ||
        lower.includes('tutor') ||
        lower.includes('editor') ||
        lower.includes('deck') ||
        lower.includes('ppt') ||
        lower.includes('video') ||
        lower.includes('who can');

      const isTaskIntent =
        lower.includes('field') ||
        lower.includes('task') ||
        lower.includes('open work') ||
        lower.includes('urgent');

      const matchedServices = isRecommendationIntent
        ? services.filter((s) => 
            lower.includes(s.category.toLowerCase()) ||
            lower.includes(s.title.toLowerCase()) ||
            s.skills.some((sk) => lower.includes(sk.toLowerCase()))
          ).slice(0, 3)
        : [];

      const matchedRequests = isTaskIntent
        ? requests.slice(0, 2)
        : undefined;

      const rawReply = data.reply || "I've matched your query with our live platform database.";
      const cleanedReply = cleanChatMarkdown(rawReply);

      const assistantMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: cleanedReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedServices: Array.isArray(data.suggestedServices) && data.suggestedServices.length > 0 
          ? data.suggestedServices 
          : (matchedServices.length > 0 ? matchedServices : undefined),
        suggestedRequests: Array.isArray(data.suggestedRequests) && data.suggestedRequests.length > 0 
          ? data.suggestedRequests 
          : matchedRequests,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      // Graceful intelligent fallback without # or *
      const lower = query.toLowerCase();
      const isRecommendationIntent = 
        lower.includes('recommend') ||
        lower.includes('suggest') ||
        lower.includes('find') ||
        lower.includes('service') ||
        lower.includes('skill') ||
        lower.includes('tutor');

      let matched = isRecommendationIntent
        ? services.filter((s) => 
            lower.includes(s.category.toLowerCase()) ||
            lower.includes(s.title.toLowerCase())
          ).slice(0, 2)
        : [];

      const fallbackText = isRecommendationIntent && matched.length > 0
        ? `📍 Top matches in your area (${selectedRadiusKm} km scope):\n\n• ${matched[0]?.title || 'PPT Design'} (₹${matched[0]?.price || 250}) by ${matched[0]?.provider?.name || 'Verified Student'}\n• ${matched[1]?.title || 'Video Editing'} (₹${matched[1]?.price || 350}) by ${matched[1]?.provider?.name || 'Campus Pro'}\n\nAll tasks include 100% Verified Escrow Protection.`
        : `I can help you browse tutors, designers, editors, or open field works in your campus area. Ask me about pricing, tutors, or escrow protection!`;

      const assistantMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: cleanChatMarkdown(fallbackText),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedServices: matched.length > 0 ? matched : undefined,
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
        text: `Conversation reset. How can I help you find or offer local tasks near ${currentLocation.neighborhood || currentLocation.city}?`,
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

                      {/* Matched Local Listing Cards in Proper Interactive Tab Style */}
                      {msg.suggestedServices && msg.suggestedServices.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-zinc-100 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600">
                            <span className="flex items-center gap-1 text-purple-700">
                              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                              <span>Matched Services ({selectedRadiusKm}km scope)</span>
                            </span>
                            <span className="text-[10px] text-zinc-400">Click to open & book</span>
                          </div>
                          
                          <div className="space-y-2">
                            {msg.suggestedServices.map((svc) => (
                              <div
                                key={svc.id}
                                onClick={() => {
                                  onSelectService(svc);
                                }}
                                className="p-3 bg-gradient-to-r from-purple-50/70 to-indigo-50/70 hover:from-purple-100/90 hover:to-indigo-100/90 rounded-2xl border border-purple-200/80 shadow-2xs hover:shadow-soft-xs transition-all cursor-pointer group flex flex-col gap-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                      <span className="text-[10px] font-extrabold uppercase tracking-wide bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded-md">
                                        {svc.category}
                                      </span>
                                      <span className="text-[10px] text-emerald-800 bg-emerald-100/80 font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                        <ShieldCheck className="w-2.5 h-2.5" />
                                        <span>Escrow</span>
                                      </span>
                                    </div>
                                    <h4 className="font-extrabold text-zinc-950 text-xs sm:text-sm group-hover:text-purple-900 transition-colors leading-snug line-clamp-1">
                                      {svc.title}
                                    </h4>
                                    <p className="text-[11px] text-zinc-600 truncate mt-0.5">
                                      {svc.provider?.name} · {svc.provider?.studentUniversity || 'Verified Student'}
                                    </p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="font-black text-sm text-zinc-950 block">₹{svc.price}</span>
                                    <span className="text-[10px] text-purple-700 font-semibold">
                                      📍 {svc.distanceKm ? `${svc.distanceKm.toFixed(1)} km` : 'Near you'}
                                    </span>
                                  </div>
                                </div>

                                {/* Direct Action Bar */}
                                <div className="pt-2 border-t border-purple-200/60 flex items-center justify-between">
                                  <span className="text-[10px] text-zinc-500 font-medium">
                                    ⭐ {typeof svc.rating === 'number' ? svc.rating.toFixed(1) : '5.0'} · {svc.deliveryDays === 0 ? 'Same Day' : `${svc.deliveryDays}d delivery`}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectService(svc);
                                    }}
                                    className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 group-hover:bg-purple-800 text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-2xs"
                                  >
                                    <span>Open in Services</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matched Open Field Works & Task Requests */}
                      {msg.suggestedRequests && msg.suggestedRequests.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-zinc-100 space-y-2">
                          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center justify-between">
                            <span>Active Field Works & Tasks</span>
                            <span className="text-amber-600 font-bold">Campus Open</span>
                          </p>
                          <div className="space-y-1.5">
                            {msg.suggestedRequests.map((req) => (
                              <div
                                key={req.id}
                                className="p-2.5 bg-amber-50/50 hover:bg-amber-100/60 rounded-xl border border-amber-200/80 flex items-center justify-between gap-2.5 transition-colors"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-amber-950 text-xs truncate">
                                    {req.title}
                                  </p>
                                  <p className="text-[11px] text-zinc-500 truncate">
                                    {req.requesterName} · {req.requesterLocation?.neighborhood || 'Nearby Campus'}
                                  </p>
                                  {(req.isUrgent || req.urgent) && (
                                    <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-1 py-0.2 rounded border border-rose-200 inline-block mt-0.5">
                                      ⚡ Urgent Task
                                    </span>
                                  )}
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-bold text-xs text-emerald-800">₹{req.budget}</span>
                                  <button
                                    type="button"
                                    onClick={() => onOpenPostRequest()}
                                    className="text-[10px] text-amber-800 font-bold block hover:underline cursor-pointer"
                                  >
                                    View / Apply
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between px-1">
                      <span className="text-[9px] text-zinc-400">
                        {msg.timestamp}
                      </span>
                      {!isUser && msg.id !== 'welcome' && (
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await fetch('/api/gemini/chat/feedback', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    feedbackId: msg.id,
                                    prompt: 'User chat prompt',
                                    reply: msg.text,
                                    feedback: 'up',
                                    userLocation: currentLocation,
                                  }),
                                });
                              } catch (e) {}
                            }}
                            className="p-1 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors text-[11px]"
                            title="Helpful response"
                          >
                            👍
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await fetch('/api/gemini/chat/feedback', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    feedbackId: msg.id,
                                    prompt: 'User chat prompt',
                                    reply: msg.text,
                                    feedback: 'down',
                                    userLocation: currentLocation,
                                  }),
                                });
                              } catch (e) {}
                            }}
                            className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors text-[11px]"
                            title="Not helpful"
                          >
                            👎
                          </button>
                        </div>
                      )}
                    </div>
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

          {/* Radius Scope Selector */}
          <div className="px-3 py-1.5 bg-purple-50/80 border-t border-purple-100 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1 text-[11px] font-bold text-purple-900">
              <MapPin className="w-3 h-3 text-purple-600 shrink-0" />
              <span>Radius Scope:</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 5, 10].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRadiusKm(r)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    selectedRadiusKm === r
                      ? 'bg-purple-700 text-white shadow-soft-xs'
                      : 'bg-white text-purple-700 hover:bg-purple-100 border border-purple-200'
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>
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
