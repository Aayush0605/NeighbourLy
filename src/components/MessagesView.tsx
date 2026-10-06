import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageSquare, ArrowLeft, Sparkles, Clock, CheckCheck, Shield } from 'lucide-react';
import { Message, UserProfile, Conversation } from '../types';

interface MessagesViewProps {
  currentUser: UserProfile | null;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  messages: Message[];
  onSendMessage: (conversationId: string, text: string) => void;
  onOpenPublicProfile: (user: UserProfile) => void;
  onNavigateBrowse: () => void;
  pendingRecipientUser?: UserProfile | null;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  currentUser,
  conversations,
  activeConversationId,
  onSelectConversation,
  messages,
  onSendMessage,
  onOpenPublicProfile,
  onNavigateBrowse,
  pendingRecipientUser,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickReplies = [
    'Hi! Are you available to help with this task?',
    'What is your delivery turnaround time?',
    'Sounds great, let\'s confirm via Escrow Services.',
    'Could you share a quick sample or details?',
  ];

  // Identify current active conversation
  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  // Find other participant for the active thread
  const otherParticipant = activeConversation
    ? Object.values(activeConversation.participants || {}).find(
        (p) => p.id !== currentUser?.id
      ) || Object.values(activeConversation.participants || {})[0]
    : pendingRecipientUser
    ? {
        id: pendingRecipientUser.id,
        name: pendingRecipientUser.name,
        avatar: pendingRecipientUser.avatar,
        role: pendingRecipientUser.studentUniversity || 'Student Peer',
        email: pendingRecipientUser.email,
        studentUniversity: pendingRecipientUser.studentUniversity,
      }
    : null;

  const handleSend = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSubmit = (customText || inputText).trim();
    if (!textToSubmit) return;

    const targetConvId = activeConversationId || (pendingRecipientUser ? `conv_${[currentUser?.id || 'guest', pendingRecipientUser.id].sort().join('__')}` : null);
    if (targetConvId) {
      onSendMessage(targetConvId, textToSubmit);
      setInputText('');
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatThreadDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  // If there are zero conversations and no pending recipient
  if (conversations.length === 0 && !pendingRecipientUser) {
    return (
      <div className="bg-[#FAF8F5] min-h-[calc(100vh-4rem)] py-10 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-soft">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-zinc-950">
              Your Inbox
            </h1>
            <p className="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
              No conversations yet. When you message a student seller, inquire about a skill, or collaborate on a task request, your live chats will appear here!
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={onNavigateBrowse}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-soft cursor-pointer transition-all"
            >
              Browse Campus Skills & Tasks
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] min-h-[calc(100vh-4rem)] py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-zinc-950">
              Messages
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
              Live peer-to-peer chats and task milestone discussions
            </p>
          </div>
          <button
            onClick={onNavigateBrowse}
            className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Explore Skills</span>
          </button>
        </div>

        {/* Messaging Layout Container */}
        <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-2xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
          
          {/* Left Column: Conversation Threads List */}
          <div className="md:col-span-4 border-r border-zinc-100 flex flex-col bg-zinc-50/50">
            <div className="p-4 border-b border-zinc-100 bg-white">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Conversations ({conversations.length + (pendingRecipientUser && !conversations.some(c => c.id === activeConversationId) ? 1 : 0)})
              </span>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-zinc-100">
              {/* If there is a pending recipient being messaged that is not yet in conversation list */}
              {pendingRecipientUser && !conversations.some(c => c.id === activeConversationId) && (
                <div
                  className="p-4 bg-indigo-50/60 border-l-4 border-indigo-600 flex items-center gap-3 cursor-pointer"
                >
                  <img
                    src={pendingRecipientUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={pendingRecipientUser.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-400/40"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-zinc-900 truncate">
                        {pendingRecipientUser.name}
                      </h3>
                      <span className="text-[10px] text-indigo-600 font-bold">New</span>
                    </div>
                    <p className="text-xs text-indigo-700/80 truncate">
                      Starting new conversation...
                    </p>
                  </div>
                </div>
              )}

              {/* Real Conversation Threads from Firestore */}
              {conversations.map((thread) => {
                const isActive = thread.id === activeConversationId;
                const other = Object.values(thread.participants || {}).find(
                  (p) => p.id !== currentUser?.id
                ) || Object.values(thread.participants || {})[0];

                const displayName = other?.name || 'Student Peer';
                const displayAvatar = other?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';

                return (
                  <div
                    key={thread.id}
                    onClick={() => onSelectConversation(thread.id)}
                    className={`p-4 transition-all flex items-center gap-3 cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50/70 border-l-4 border-indigo-600'
                        : 'hover:bg-zinc-100/70'
                    }`}
                  >
                    <img
                      src={displayAvatar}
                      alt={displayName}
                      className="w-11 h-11 rounded-full object-cover ring-1 ring-zinc-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-sm truncate ${isActive ? 'font-black text-indigo-950' : 'font-bold text-zinc-900'}`}>
                          {displayName}
                        </h3>
                        <span className="text-[10px] text-zinc-400 font-medium shrink-0 ml-1">
                          {formatThreadDate(thread.updatedAt)}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 truncate leading-snug">
                        {thread.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Conversation Messages Stream */}
          <div className="md:col-span-8 flex flex-col h-full bg-white">
            
            {/* Conversation Active Header */}
            {otherParticipant ? (
              <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-white z-10">
                <div
                  onClick={() => {
                    const pseudo: UserProfile = {
                      id: otherParticipant.id,
                      userId: otherParticipant.id,
                      name: otherParticipant.name,
                      email: otherParticipant.email || 'peer@college.edu',
                      avatar: otherParticipant.avatar,
                      location: { lat: 28.6139, lng: 77.2090, neighborhood: 'Campus Area', city: 'Campus' },
                      authProvider: 'password',
                      verified: true,
                      studentVerified: true,
                      studentUniversity: otherParticipant.studentUniversity || 'College Student',
                      role: 'user',
                      tasksCompleted: 1,
                      rating: 5.0,
                      reviewCount: 1,
                      joinedDate: 'Member',
                    };
                    onOpenPublicProfile(pseudo);
                  }}
                  className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity"
                  title="View user profile"
                >
                  <img
                    src={otherParticipant.avatar}
                    alt={otherParticipant.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-1.5">
                      <span>{otherParticipant.name}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Online" />
                    </h3>
                    <p className="text-[11px] text-indigo-700 font-semibold truncate max-w-[200px] sm:max-w-xs">
                      {otherParticipant.studentUniversity || otherParticipant.role || 'Campus Member'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-100">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Escrow Protected</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border-b border-zinc-100 text-xs text-zinc-400">
                Select a conversation
              </div>
            )}

            {/* Conversation Messages Body */}
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 max-h-[460px] bg-[#FCFBF9]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-zinc-900">
                      Start your conversation with {otherParticipant?.name || 'your peer'}
                    </h4>
                    <p className="text-xs text-zinc-500 max-w-sm">
                      Send a message or pick a quick prompt below to discuss requirements, turnaround time, or deliverable details.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === currentUser?.id || (!currentUser && m.senderName === 'You');
                  
                  if (m.isSystem) {
                    return (
                      <div key={m.id} className="flex justify-center my-2">
                        <div className="bg-indigo-50 text-indigo-900 px-4 py-2 rounded-xl text-xs font-semibold border border-indigo-100 shadow-2xs max-w-[85%] text-center">
                          {m.text}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col space-y-1 max-w-[85%] sm:max-w-[75%] ${
                        isMe ? 'items-end ml-auto' : 'items-start'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 px-1">
                        <span className="font-semibold text-zinc-600">{isMe ? 'You' : m.senderName}</span>
                        <span>•</span>
                        <span>{formatTime(m.timestamp)}</span>
                      </div>
                      
                      <div
                        className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-tr-xs shadow-soft-xs'
                            : 'bg-white text-zinc-900 rounded-tl-xs border border-zinc-200/80 shadow-2xs'
                        }`}
                      >
                        {m.text}
                      </div>

                      {m.attachmentName && (
                        <div className="text-[11px] bg-zinc-100 text-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200 flex items-center gap-1.5">
                          <span>📎 Deliverable:</span>
                          <span className="font-bold underline">{m.attachmentName}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggested Replies */}
            <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider shrink-0">
                Quick reply:
              </span>
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => handleSend(undefined, reply)}
                  className="px-3 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-zinc-700 rounded-full border border-zinc-200 text-xs font-medium whitespace-nowrap transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Bottom Message Input Bar */}
            <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-zinc-100">
              <div className="relative flex items-center bg-zinc-50 rounded-2xl border border-zinc-200/90 p-1.5 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600/20 transition-all">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message ${otherParticipant?.name || 'peer'}...`}
                  className="w-full pl-3 pr-12 py-2 bg-transparent text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-soft-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

          </div>

        </div>

      </div>
    </div>
  );
};
