import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  Video, 
  FileText, 
  Presentation, 
  Image as ImageIcon, 
  Code, 
  Music, 
  ExternalLink, 
  Download, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Lock, 
  CheckCircle2, 
  ShieldCheck, 
  Star, 
  Tag, 
  X, 
  Upload, 
  ArrowRight,
  Maximize2,
  SlidersHorizontal,
  GraduationCap
} from 'lucide-react';
import { PortfolioItem, PortfolioMediaFormat, ServiceListing, UserProfile, LocationPoint } from '../types';
import { NeighborLyLogo } from './NeighborLyLogo';

interface PortfolioPageProps {
  currentUser: UserProfile | null;
  currentLocation: LocationPoint;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onBookSkill: (item: PortfolioItem) => void;
  onOpenAddModal?: () => void;
}

// Initial rich multi-format student portfolio data
export const INITIAL_PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'port_1',
    title: 'AI & Sustainable Tech Investor Pitch Deck',
    category: 'PPT & Presentations',
    mediaFormat: 'presentation',
    offeredSkill: 'PPT & Pitch Deck Design',
    startingPrice: 250,
    proficiencyLevel: 'Campus Pro',
    availableForHire: true,
    description: 'A 16-slide high-impact modern presentation designed for campus entrepreneurship summits and startup funding pitches. Includes data charts, custom iconography, and sleek dark-mode aesthetics.',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
    presentationUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
    slideCount: 16,
    tags: ['Canva Pro', 'PowerPoint', 'Pitch Deck', 'Modern UI'],
    authorId: 'usr_pcte_aarav',
    authorName: 'Aarav Sharma',
    authorUniversity: 'PCTE Group of Institutes, Ludhiana',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    date: 'Oct 2026',
  },
  {
    id: 'port_2',
    title: 'Viral Campus Fest Teaser & 4K Reel Edit',
    category: 'Video Editing',
    mediaFormat: 'video',
    offeredSkill: 'Short-Form Reel & 4K Video Editing',
    startingPrice: 350,
    proficiencyLevel: 'Campus Pro',
    availableForHire: true,
    description: 'High-energy 4K short video edit with fast rhythmic cuts, dynamic typography, speed ramps, and trending sound design. Reached 85K+ views on Instagram reels.',
    imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-student-typing-on-a-laptop-43284-large.mp4',
    tags: ['Premiere Pro', 'CapCut Pro', 'Sound Design', '4K 60fps'],
    fileSize: '48 MB',
    authorId: 'usr_pau_simran',
    authorName: 'Simran Kaur',
    authorUniversity: 'Punjab Agricultural University (PAU)',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    date: 'Sep 2026',
  },
  {
    id: 'port_3',
    title: 'Complete Data Structures & Algorithms Solved Formula Sheets',
    category: 'Academic Support',
    mediaFormat: 'document',
    offeredSkill: 'DSA Tutoring & Solved Notes',
    startingPrice: 180,
    proficiencyLevel: 'Advanced',
    availableForHire: true,
    description: 'Handcrafted 14-page PDF document covering complete Graph Algorithms, Dynamic Programming patterns, Time-Space complexity tables, and solved university midterm questions.',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&auto=format&fit=crop&q=80',
    documentUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&auto=format&fit=crop&q=80',
    pageCount: 14,
    fileSize: '8.4 MB (PDF)',
    tags: ['PDF Notes', 'C++', 'Java DSA', 'University Solved'],
    authorId: 'usr_pcte_rohit',
    authorName: 'Rohit Verma',
    authorUniversity: 'PCTE Group of Institutes, Ludhiana',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    date: 'Oct 2026',
  },
  {
    id: 'port_4',
    title: 'Ludhiana Heritage Food Festival Brand & Menu Graphics',
    category: 'Creative & Design',
    mediaFormat: 'image',
    offeredSkill: 'Brand Identity & Social Media Design',
    startingPrice: 400,
    proficiencyLevel: 'Campus Pro',
    availableForHire: true,
    description: 'Complete visual identity package including modern minimalist logo, vibrant printable food menu, 5 Instagram carousel templates, and entrance banner.',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&auto=format&fit=crop&q=80',
    tags: ['Figma', 'Illustrator', 'Branding', 'Vector Art'],
    authorId: 'usr_du_tanvi',
    authorName: 'Tanvi Kapoor',
    authorUniversity: 'Delhi University (DU)',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    date: 'Aug 2026',
  },
  {
    id: 'port_5',
    title: 'Full-Stack React & Node Campus Escrow Web App',
    category: 'Tech & Digital',
    mediaFormat: 'code',
    offeredSkill: 'Full-Stack Web & API Development',
    startingPrice: 750,
    proficiencyLevel: 'Campus Pro',
    availableForHire: true,
    description: 'Production-ready full-stack web application with responsive Tailwind UI, Express REST API, peer escrow transaction simulation, and live state sync.',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
    codeUrl: 'https://github.com/neighborly/campus-marketplace',
    tags: ['React 19', 'TypeScript', 'Tailwind', 'Node.js'],
    authorId: 'usr_pcte_karan',
    authorName: 'Karan Mehra',
    authorUniversity: 'PCTE Group of Institutes, Ludhiana',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    date: 'Oct 2026',
  },
  {
    id: 'port_6',
    title: 'Bilingual Commercial Voiceover & Podcast Intro Audio',
    category: 'Creative & Design',
    mediaFormat: 'audio',
    offeredSkill: 'Voiceover & Podcast Audio Production',
    startingPrice: 300,
    proficiencyLevel: 'Advanced',
    availableForHire: true,
    description: 'Warm, articulate bilingual voiceover samples recorded in studio quality (English & Hindi) suitable for explainer videos, YouTube intros, and podcast hosting.',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
    fileSize: '4.2 MB (MP3)',
    tags: ['Voiceover', 'Studio Mic', 'Podcast Audio'],
    authorId: 'usr_pau_ananya',
    authorName: 'Ananya Joshi',
    authorUniversity: 'Punjab Agricultural University (PAU)',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    date: 'Sep 2026',
  }
];

export const PortfolioPage: React.FC<PortfolioPageProps> = ({
  currentUser,
  currentLocation,
  onOpenAuth,
  onBookSkill,
}) => {
  const [items, setItems] = useState<PortfolioItem[]>(() => {
    try {
      const saved = localStorage.getItem('neighborly_custom_portfolios');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return [...parsed, ...INITIAL_PORTFOLIO_ITEMS];
      }
    } catch {}
    return INITIAL_PORTFOLIO_ITEMS;
  });

  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemModal, setSelectedItemModal] = useState<PortfolioItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Add Item Form State
  const [newTitle, setNewTitle] = useState('');
  const [newFormat, setNewFormat] = useState<'presentation' | 'video' | 'document' | 'image' | 'code' | 'audio'>('presentation');
  const [newCategory, setNewCategory] = useState('PPT & Presentations');
  const [newSkill, setNewSkill] = useState('PPT Design & Pitch Decks');
  const [newPrice, setNewPrice] = useState<number>(250);
  const [newDescription, setNewDescription] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newTags, setNewTags] = useState('Canva, PPT, Assignment');
  const [newSlideCount, setNewSlideCount] = useState<number>(12);
  const [newPageCount, setNewPageCount] = useState<number>(10);

  const formatFilters: { id: string; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'all', label: 'All Formats', icon: <Sparkles className="w-3.5 h-3.5" />, count: items.length },
    { id: 'presentation', label: '📊 PPT & Slides', icon: <Presentation className="w-3.5 h-3.5" />, count: items.filter(i => i.mediaFormat === 'presentation').length },
    { id: 'video', label: '🎬 Videos & Reels', icon: <Video className="w-3.5 h-3.5" />, count: items.filter(i => i.mediaFormat === 'video').length },
    { id: 'document', label: '📄 PDFs & Notes', icon: <FileText className="w-3.5 h-3.5" />, count: items.filter(i => i.mediaFormat === 'document').length },
    { id: 'image', label: '🎨 Graphic Designs', icon: <ImageIcon className="w-3.5 h-3.5" />, count: items.filter(i => i.mediaFormat === 'image').length },
    { id: 'code', label: '💻 Code & Web', icon: <Code className="w-3.5 h-3.5" />, count: items.filter(i => i.mediaFormat === 'code').length },
    { id: 'audio', label: '🎵 Audio & Voices', icon: <Music className="w-3.5 h-3.5" />, count: items.filter(i => i.mediaFormat === 'audio').length },
  ];

  const filteredItems = items.filter((item) => {
    const matchesFormat = selectedFormat === 'all' || item.mediaFormat === selectedFormat;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.offeredSkill && item.offeredSkill.toLowerCase().includes(q)) ||
      (item.authorUniversity && item.authorUniversity.toLowerCase().includes(q)) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(q)));
    return matchesFormat && matchesSearch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePortfolioItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const createdItem: PortfolioItem = {
      id: `port_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      mediaFormat: newFormat,
      offeredSkill: newSkill.trim() || newTitle.trim(),
      startingPrice: Number(newPrice) || 250,
      proficiencyLevel: 'Campus Pro',
      availableForHire: true,
      description: newDescription.trim() || 'High quality student work created with verified escrow safety.',
      imageUrl: newImage || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
      presentationUrl: newFormat === 'presentation' ? newMediaUrl || newImage : undefined,
      videoUrl: newFormat === 'video' ? newMediaUrl || 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-student-typing-on-a-laptop-43284-large.mp4' : undefined,
      documentUrl: newFormat === 'document' ? newMediaUrl || newImage : undefined,
      codeUrl: newFormat === 'code' ? newMediaUrl || 'https://github.com' : undefined,
      audioUrl: newFormat === 'audio' ? newMediaUrl : undefined,
      slideCount: newFormat === 'presentation' ? newSlideCount : undefined,
      pageCount: newFormat === 'document' ? newPageCount : undefined,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      authorId: currentUser?.id || 'usr_me',
      authorName: currentUser?.name || 'Verified Student',
      authorUniversity: currentUser?.studentUniversity || 'PCTE Group of Institutes, Ludhiana',
      authorAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      date: 'Just now',
    };

    setItems(prev => [createdItem, ...prev]);
    try {
      const saved = JSON.parse(localStorage.getItem('neighborly_custom_portfolios') || '[]');
      localStorage.setItem('neighborly_custom_portfolios', JSON.stringify([createdItem, ...saved]));
    } catch {}

    setIsAddModalOpen(false);
    // Reset form
    setNewTitle('');
    setNewDescription('');
    setNewImage('');
    setNewMediaUrl('');
  };

  const getFormatBadge = (format?: PortfolioMediaFormat) => {
    switch (format) {
      case 'presentation':
        return { label: 'PPT Deck', icon: <Presentation className="w-3.5 h-3.5 text-amber-600" />, bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'video':
        return { label: 'Video / Reel', icon: <Video className="w-3.5 h-3.5 text-purple-600" />, bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'document':
        return { label: 'PDF / Notes', icon: <FileText className="w-3.5 h-3.5 text-blue-600" />, bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'code':
        return { label: 'Code Project', icon: <Code className="w-3.5 h-3.5 text-emerald-600" />, bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'audio':
        return { label: 'Audio / Voice', icon: <Music className="w-3.5 h-3.5 text-rose-600" />, bg: 'bg-rose-50 text-rose-800 border-rose-200' };
      default:
        return { label: 'Design Graphic', icon: <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />, bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAF8F5] pb-20">
      
      {/* Hero Header Section */}
      <div className="relative bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient Aurora Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-purple-300">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Multi-Format Student Portfolio Hub</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-white tracking-tight">
                Showcase Work in <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">Every Format</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
                Discover verified college student work across <strong>Presentations (PPT)</strong>, <strong>Videos & Reels</strong>, <strong>PDF Notes</strong>, <strong>Designs</strong>, and <strong>Code</strong> with transparent escrow hiring.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    onOpenAuth('signup');
                  } else {
                    setIsAddModalOpen(true);
                  }
                }}
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-all shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Work to Portfolio</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by skill (e.g. PPT, Video Editing, DSA Notes, Figma, PCTE)..."
                className="w-full pl-11 pr-4 py-3 bg-white/10 hover:bg-white/15 focus:bg-white text-zinc-100 focus:text-zinc-950 placeholder:text-zinc-400 rounded-2xl border border-white/20 focus:border-white focus:outline-none transition-all text-xs sm:text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Format Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 pb-1">
            {formatFilters.map((fmt) => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => setSelectedFormat(fmt.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  selectedFormat === fmt.id
                    ? 'bg-white text-zinc-950 shadow-md ring-2 ring-white/30'
                    : 'bg-white/10 text-zinc-300 hover:bg-white/20 hover:text-white border border-white/10'
                }`}
              >
                {fmt.icon}
                <span>{fmt.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-inherit font-mono">
                  {fmt.count}
                </span>
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Main Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        
        {/* Results Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200/80 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-800">
              Showing <strong>{filteredItems.length}</strong> portfolio works
            </span>
            {selectedFormat !== 'all' && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                Filtered: {selectedFormat.toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">100% Escrow Protected Booking</span>
          </div>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="py-16 text-center space-y-4 max-w-md mx-auto bg-white rounded-3xl p-8 border border-zinc-200 shadow-soft">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto text-2xl">
              📂
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-950">No portfolio work matches your filter</h3>
              <p className="text-xs text-zinc-500">Try resetting search keywords or choose another media format above.</p>
            </div>
            <button
              type="button"
              onClick={() => { setSelectedFormat('all'); setSearchQuery(''); }}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-xl cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Portfolio Cards Masonry / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredItems.map((item) => {
            const badge = getFormatBadge(item.mediaFormat);
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-zinc-200/90 shadow-soft-sm hover:shadow-soft-lg transition-all overflow-hidden flex flex-col group"
              >
                {/* Visual Media Header with Format Overlay */}
                <div 
                  className="relative aspect-[16/10] bg-zinc-900 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedItemModal(item)}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Format Badge Top Left */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1 shadow-sm backdrop-blur-md ${badge.bg}`}>
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  {/* Media Info Badge Top Right */}
                  <div className="absolute top-3 right-3">
                    {item.slideCount && (
                      <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold">
                        {item.slideCount} Slides
                      </span>
                    )}
                    {item.pageCount && (
                      <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold">
                        {item.pageCount} Pages
                      </span>
                    )}
                    {item.mediaFormat === 'video' && (
                      <span className="px-2 py-0.5 rounded-lg bg-purple-600/90 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                        <Play className="w-2.5 h-2.5 fill-white" /> 4K Video
                      </span>
                    )}
                  </div>

                  {/* Play / Expand Indicator Center on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <span className="px-4 py-2 rounded-xl bg-white text-zinc-950 text-xs font-bold shadow-lg flex items-center gap-1.5 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect {badge.label}</span>
                    </span>
                  </div>

                  {/* Title Preview on Bottom of Image */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold text-sm leading-snug line-clamp-1 drop-shadow-md">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    
                    {/* Author Line */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={item.authorName}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-200"
                        />
                        <div>
                          <p className="text-xs font-bold text-zinc-900 leading-none">
                            {item.authorName}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate max-w-[170px] mt-0.5">
                            {item.authorUniversity || 'Campus Creator'}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 flex items-center gap-0.5">
                        🎓 Verified
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Tag Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags?.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 block uppercase">Skill Hire Rate</span>
                      <span className="text-base font-black text-zinc-950">
                        ₹{item.startingPrice || 250}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedItemModal(item)}
                        className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold cursor-pointer transition-colors"
                        title="View sample"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onBookSkill(item)}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-soft-xs flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <span>Book Skill</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* INSPECT ITEM LIGHTBOX / VIEWER MODAL */}
      {selectedItemModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
          onClick={() => setSelectedItemModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  {getFormatBadge(selectedItemModal.mediaFormat).icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950">
                    {selectedItemModal.title}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    By {selectedItemModal.authorName} · {selectedItemModal.authorUniversity}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItemModal(null)}
                className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Interactive Multi-Format Viewer */}
            <div className="overflow-y-auto p-5 sm:p-7 space-y-6 flex-1">
              
              {/* FORMAT 1: Presentation (PPT Viewer) */}
              {selectedItemModal.mediaFormat === 'presentation' && (
                <div className="space-y-3">
                  <div className="aspect-[16/10] w-full rounded-2xl bg-zinc-950 relative overflow-hidden flex items-center justify-center shadow-inner">
                    <img
                      src={selectedItemModal.imageUrl}
                      alt="Slide preview"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-3 inset-x-3 flex items-center justify-between bg-black/60 backdrop-blur-md p-2 rounded-xl text-white text-xs">
                      <span>Slide {activeSlideIndex + 1} of {selectedItemModal.slideCount || 16}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                          disabled={activeSlideIndex === 0}
                          className="p-1 rounded bg-white/20 hover:bg-white/40 disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSlideIndex(prev => Math.min((selectedItemModal.slideCount || 16) - 1, prev + 1))}
                          disabled={activeSlideIndex >= (selectedItemModal.slideCount || 16) - 1}
                          className="p-1 rounded bg-white/20 hover:bg-white/40 disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 text-center font-medium">
                    📊 Interactive slide sample. Hire this student to generate custom decks for your assignments or pitch decks.
                  </p>
                </div>
              )}

              {/* FORMAT 2: Video Player */}
              {selectedItemModal.mediaFormat === 'video' && (
                <div className="space-y-3">
                  <div className="aspect-[16/9] w-full rounded-2xl bg-zinc-950 overflow-hidden shadow-lg">
                    {selectedItemModal.videoUrl?.endsWith('.mp4') ? (
                      <video
                        src={selectedItemModal.videoUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white space-y-2 p-6 text-center">
                        <Play className="w-12 h-12 text-purple-400" />
                        <p className="text-sm font-bold">4K Reel & Video Showcase</p>
                        <a
                          href={selectedItemModal.videoUrl || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
                        >
                          Watch on YouTube / Drive ↗
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* FORMAT 3: PDF / Document */}
              {selectedItemModal.mediaFormat === 'document' && (
                <div className="space-y-3">
                  <div className="p-6 bg-blue-50/60 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md">
                        PDF
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-blue-950">{selectedItemModal.title}</h4>
                        <p className="text-xs text-blue-700">{selectedItemModal.pageCount || 14} Pages · Complete Study Notes & Solved Midterms</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert(`Downloading verified study document sample...`)}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-soft flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Sample PDF</span>
                    </button>
                  </div>
                  <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100">
                    <img src={selectedItemModal.imageUrl} alt="Document page" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* FORMAT 4: Graphic Image */}
              {selectedItemModal.mediaFormat === 'image' && (
                <div className="aspect-[16/10] w-full rounded-2xl bg-zinc-900 overflow-hidden shadow-md">
                  <img src={selectedItemModal.imageUrl} alt={selectedItemModal.title} className="w-full h-full object-contain" />
                </div>
              )}

              {/* FORMAT 5: Code Project */}
              {selectedItemModal.mediaFormat === 'code' && (
                <div className="space-y-3">
                  <div className="p-4 bg-zinc-950 text-white rounded-2xl border border-zinc-800 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between text-zinc-400 pb-2 border-b border-zinc-800">
                      <span>Repository: {selectedItemModal.codeUrl || 'github.com/campus-app'}</span>
                      <span className="text-emerald-400">● Live Clean Build</span>
                    </div>
                    <pre className="text-zinc-300 overflow-x-auto text-[11px] p-2 bg-zinc-900 rounded-lg">
                      {`// React + TypeScript Component\nexport const EscrowService = () => {\n  const [heldFunds, setHeldFunds] = useState(250);\n  return <EscrowBadge verified={true} />;\n};`}
                    </pre>
                  </div>
                </div>
              )}

              {/* Description & Skill Hiring Summary */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-zinc-900">About this work & offered skill</h4>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {selectedItemModal.description}
                </p>

                <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-950 block">
                      Offered Skill: <strong>{selectedItemModal.offeredSkill}</strong>
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Protected under 100% Escrow Protection · 8% Transparent Safety Fee
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedItemModal;
                      setSelectedItemModal(null);
                      onBookSkill(target);
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-soft cursor-pointer transition-all whitespace-nowrap"
                  >
                    Hire {selectedItemModal.authorName} (₹{selectedItemModal.startingPrice})
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ADD WORK MODAL (Multi-Format Support) */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
          onClick={() => setIsAddModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950">Add Multi-Format Work</h3>
                  <p className="text-xs text-zinc-500">Showcase PPTs, Videos, PDFs, Designs & Code</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSavePortfolioItem} className="overflow-y-auto p-5 sm:p-7 space-y-4">
              
              {/* Media Format Picker */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1.5">Select Work Format</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { id: 'presentation', label: 'PPT', icon: <Presentation className="w-4 h-4" /> },
                    { id: 'video', label: 'Video', icon: <Video className="w-4 h-4" /> },
                    { id: 'document', label: 'PDF', icon: <FileText className="w-4 h-4" /> },
                    { id: 'image', label: 'Design', icon: <ImageIcon className="w-4 h-4" /> },
                    { id: 'code', label: 'Code', icon: <Code className="w-4 h-4" /> },
                    { id: 'audio', label: 'Audio', icon: <Music className="w-4 h-4" /> },
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setNewFormat(f.id as any)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold cursor-pointer transition-all ${
                        newFormat === f.id
                          ? 'bg-purple-50 border-purple-600 text-purple-950 shadow-soft-xs'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      {f.icon}
                      <span>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Project / Work Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. PCTE Seminar AI Presentation or 4K Event Reel"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                />
              </div>

              {/* Media File Upload or URL */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Cover Image / File Upload</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 border border-dashed border-zinc-300 hover:border-indigo-500 rounded-xl bg-zinc-50 text-xs font-bold text-zinc-700 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span>{newImage ? 'Change Uploaded File' : 'Upload File / Image'}</span>
                    <input type="file" accept="image/*,.pdf,.pptx" onChange={handleFileUpload} className="hidden" />
                  </label>
                  {newImage && (
                    <img src={newImage} alt="Preview" className="w-12 h-12 object-cover rounded-xl border border-zinc-200 shrink-0" />
                  )}
                </div>
              </div>

              {/* Link / URL */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Live URL / Drive / YouTube Link (Optional)</label>
                <input
                  type="url"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or https://github.com/..."
                  className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              {/* Offered Skill & Starting Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Offered Skill</label>
                  <input
                    type="text"
                    required
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="e.g. PPT Design, Video Editing"
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Starting Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none font-bold"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Description & Tools Used</label>
                <textarea
                  rows={3}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Explain your work, software/tools used (Canva, Figma, CapCut, Premiere, Python)..."
                  className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-soft cursor-pointer transition-all"
              >
                Publish to Portfolio Showcase
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
