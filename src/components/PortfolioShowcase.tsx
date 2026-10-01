import React, { useState } from 'react';
import { Plus, Image, Trash2, ExternalLink, Sparkles, X, Check, Eye } from 'lucide-react';
import { PortfolioItem } from '../types';

interface PortfolioShowcaseProps {
  portfolio: PortfolioItem[];
  isEditable?: boolean;
  onAddPortfolioItem?: (item: PortfolioItem) => void;
  onDeletePortfolioItem?: (id: string) => void;
  onBookSkill?: (item: PortfolioItem) => void;
}

const PRESET_SAMPLE_PROJECTS = [
  {
    title: 'Executive PPT & Pitch Deck Design',
    category: 'PPT & Presentations',
    offeredSkill: 'PPT & Pitch Deck Design',
    startingPrice: 200,
    proficiencyLevel: 'Campus Pro' as const,
    availableForHire: true,
    description: 'Clean modern 20-slide presentation created for university competition, pitch deck, and seminar presentation.',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    tags: ['Canva', 'PowerPoint', 'Minimalist'],
  },
  {
    title: 'Viral Instagram Reel & Short Video Edit',
    category: 'Video Editing',
    offeredSkill: 'Short-Form Video & Reel Editing',
    startingPrice: 350,
    proficiencyLevel: 'Advanced' as const,
    availableForHire: true,
    description: 'High-energy 4K short-form reel edit with sound design, dynamic captions, and motion color grading.',
    imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
    tags: ['Premiere Pro', 'CapCut', 'Color Grade'],
  },
  {
    title: 'Handmade Campus Crochet Plushie & Bags',
    category: 'Handmade & Crafts',
    offeredSkill: 'Custom Crochet & Handmade Accessories',
    startingPrice: 180,
    proficiencyLevel: 'Campus Pro' as const,
    availableForHire: true,
    description: 'Custom handmade crochet keychains, floral tote bags, and personalized student accessories.',
    imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&auto=format&fit=crop&q=80',
    tags: ['Crochet', 'Handmade', 'Custom Order'],
  },
  {
    title: 'Modern Responsive Web Application UI',
    category: 'Web Development',
    offeredSkill: 'Full-Stack Web Development',
    startingPrice: 800,
    proficiencyLevel: 'Campus Pro' as const,
    availableForHire: true,
    description: 'Full-stack responsive web dashboard built with React, Tailwind CSS, and interactive state management.',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    tags: ['React', 'TypeScript', 'Tailwind'],
  },
];

export const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({
  portfolio = [],
  isEditable = false,
  onAddPortfolioItem,
  onDeletePortfolioItem,
  onBookSkill,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<PortfolioItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Creative & Design');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [offeredSkill, setOfferedSkill] = useState('');
  const [startingPrice, setStartingPrice] = useState<number>(200);
  const [proficiencyLevel, setProficiencyLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Campus Pro'>('Campus Pro');
  const [availableForHire, setAvailableForHire] = useState<boolean>(true);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_SAMPLE_PROJECTS[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setDescription(preset.description);
    setImageUrl(preset.imageUrl);
    setTagInput(preset.tags.join(', '));
    setOfferedSkill(preset.offeredSkill);
    setStartingPrice(preset.startingPrice);
    setProficiencyLevel(preset.proficiencyLevel);
    setAvailableForHire(preset.availableForHire);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: PortfolioItem = {
      id: `port_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      category,
      description: description.trim(),
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      tags: tagInput ? tagInput.split(',').map((t) => t.trim()).filter(Boolean) : [category],
      offeredSkill: offeredSkill.trim() || title.trim(),
      startingPrice: Number(startingPrice) || 200,
      proficiencyLevel,
      availableForHire,
    };

    if (onAddPortfolioItem) {
      onAddPortfolioItem(newItem);
    }

    // Reset
    setTitle('');
    setDescription('');
    setImageUrl('');
    setTagInput('');
    setOfferedSkill('');
    setStartingPrice(200);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-4">
      
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-black font-heading text-zinc-950 flex items-center gap-2">
            <span>Portfolio & Work Samples</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
              {portfolio.length} Projects
            </span>
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Showcase proof of work, visual deliverables, and completed projects
          </p>
        </div>

        {isEditable && onAddPortfolioItem && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-soft flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Picture / Project</span>
          </button>
        )}
      </div>

      {/* Grid of Portfolio Cards */}
      {portfolio.length === 0 ? (
        <div className="bg-zinc-50/70 rounded-3xl p-8 text-center border-2 border-dashed border-zinc-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-soft-xs text-indigo-600 flex items-center justify-center mx-auto">
            <Image className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-zinc-900">No portfolio pictures added yet</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Add photos of your slides, edits, code, or art to increase trust and win more orders from campus peers.
            </p>
          </div>
          {isEditable && onAddPortfolioItem && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-soft"
            >
              + Upload Your First Project Photo
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {portfolio.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border border-zinc-200/90 shadow-2xs hover:shadow-soft transition-all duration-200 flex flex-col group"
            >
              {/* Image Preview Container */}
              <div
                onClick={() => setSelectedPhotoModal(item)}
                className="aspect-[16/10] w-full bg-zinc-100 relative overflow-hidden cursor-pointer"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <Image className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-white/95 text-zinc-900 text-xs font-bold flex items-center gap-1 shadow-soft-xs">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Image</span>
                  </span>
                </div>
                {item.category && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-bold text-indigo-900 shadow-2xs">
                    {item.category}
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-950 line-clamp-1">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1 leading-snug">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Offered Skill Badge */}
                {item.offeredSkill && (
                  <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-2 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-amber-950 font-bold truncate">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">Skill: {item.offeredSkill}</span>
                    </div>
                    {item.startingPrice ? (
                      <span className="text-[10px] font-black text-amber-900 bg-amber-200/60 px-1.5 py-0.5 rounded shrink-0">
                        ₹{item.startingPrice}+
                      </span>
                    ) : null}
                  </div>
                )}

                {/* Direct Hire / Inquire Action */}
                {onBookSkill && item.availableForHire !== false && (
                  <button
                    type="button"
                    onClick={() => onBookSkill(item)}
                    className="w-full py-1.5 px-3 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100 transition-all cursor-pointer text-center flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <span>Hire for This Skill</span>
                    <span className="text-[10px]">→</span>
                  </button>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                  <div className="flex flex-wrap gap-1">
                    {item.tags?.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-semibold">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {isEditable && onDeletePortfolioItem && (
                    <button
                      type="button"
                      onClick={() => onDeletePortfolioItem(item.id)}
                      className="p-1 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Portfolio Project & Picture */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div 
            className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-soft-xl border border-zinc-200/90 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Image className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950">Add Portfolio Picture & Work</h3>
                  <p className="text-[11px] text-zinc-500">Show off your skills with photos and project samples</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Inspiration Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>Quick-fill sample category work:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SAMPLE_PROJECTS.map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="px-2.5 py-1 text-[11px] bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-zinc-700 rounded-xl border border-zinc-200/80 transition-all cursor-pointer font-medium"
                  >
                    {preset.category}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Picture Upload / URL Container */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-800">
                  Project Picture / Screenshot <span className="text-rose-500">*</span>
                </label>

                {/* Picture Preview */}
                {imageUrl && (
                  <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 relative group">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* File Upload from Device */}
                  <label className="p-3 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50/80 rounded-2xl flex flex-col items-center justify-center gap-1 text-center cursor-pointer transition-all">
                    <Image className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-950">Upload from Device</span>
                    <span className="text-[10px] text-zinc-500">JPG, PNG, WebP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Or Paste URL */}
                  <div className="flex flex-col justify-center gap-1.5">
                    <span className="text-[11px] font-semibold text-zinc-600">Or Paste Image URL</span>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
                    />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 25-Slide Business PPT for Campus Fest"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
                >
                  <option value="PPT & Presentations">PPT & Presentations</option>
                  <option value="Video Editing">Video Editing</option>
                  <option value="Creative & Design">Creative & Design</option>
                  <option value="Handmade & Crafts">Handmade & Crafts</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Academic Support">Academic Support</option>
                  <option value="Tech & Digital">Tech & Digital</option>
                  <option value="Other">Other Skills</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Description / Deliverable Details
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what you did, tools used, and the result..."
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/30 resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Canva, PowerPoint, Motion Design"
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
                />
              </div>

              {/* Offer a Skill Option for Better Understanding */}
              <div className="p-3.5 bg-gradient-to-r from-amber-50/70 to-indigo-50/50 rounded-2xl border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-black text-zinc-950">Offer a Skill Option</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    Better Understanding
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-snug">
                  Connect this portfolio picture directly to a skill you offer, so clients know exactly what you can deliver and can hire you with one click.
                </p>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-800 mb-1">
                      Skill Name Showcase
                    </label>
                    <input
                      type="text"
                      value={offeredSkill}
                      onChange={(e) => setOfferedSkill(e.target.value)}
                      placeholder="e.g. PPT Presentation Design or Reel Video Editing"
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>

                  {/* Quick skill chips */}
                  <div className="flex flex-wrap gap-1">
                    {[
                      'PPT & Slide Design',
                      'Video & Reel Editing',
                      'Full-Stack Web Dev',
                      'Academic Support',
                      'Graphic Design',
                      'Handmade Crochet',
                    ].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setOfferedSkill(s)}
                        className="px-2 py-0.5 text-[10px] rounded-lg bg-white border border-zinc-200 hover:border-amber-400 hover:bg-amber-50 text-zinc-700 font-medium cursor-pointer transition-all"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-800 mb-1">
                        Starting Price (₹)
                      </label>
                      <input
                        type="number"
                        min="50"
                        value={startingPrice}
                        onChange={(e) => setStartingPrice(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-800 mb-1">
                        Skill Level
                      </label>
                      <select
                        value={proficiencyLevel}
                        onChange={(e) =>
                          setProficiencyLevel(
                            e.target.value as 'Beginner' | 'Intermediate' | 'Advanced' | 'Campus Pro'
                          )
                        }
                        className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      >
                        <option value="Campus Pro">Campus Pro 🌟</option>
                        <option value="Advanced">Advanced 🚀</option>
                        <option value="Intermediate">Intermediate ⚡</option>
                        <option value="Beginner">Beginner 🌱</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={availableForHire}
                      onChange={(e) => setAvailableForHire(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-[11px] text-zinc-700 font-semibold">
                      Enable "Hire for This Skill" button on portfolio piece
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-soft transition-all cursor-pointer"
                >
                  Save to Portfolio
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Expanded Picture Modal */}
      {selectedPhotoModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedPhotoModal(null)}
        >
          <div 
            className="max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-[16/10] w-full bg-zinc-950 relative">
              <img
                src={selectedPhotoModal.imageUrl}
                alt={selectedPhotoModal.title}
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={() => setSelectedPhotoModal(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {selectedPhotoModal.category}
                </span>
                <span className="text-xs text-zinc-400 font-medium">
                  {selectedPhotoModal.date}
                </span>
              </div>
              <h3 className="text-lg font-black font-heading text-zinc-950">
                {selectedPhotoModal.title}
              </h3>
              {selectedPhotoModal.offeredSkill && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/90 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="text-xs font-bold text-amber-950 block">
                        Offered Skill: {selectedPhotoModal.offeredSkill}
                      </span>
                      <span className="text-[10px] text-amber-800">
                        {selectedPhotoModal.proficiencyLevel || 'Campus Pro'} · Verified Student Work
                      </span>
                    </div>
                  </div>
                  {selectedPhotoModal.startingPrice && (
                    <span className="text-xs font-black text-amber-900 bg-amber-100 px-2.5 py-1 rounded-xl">
                      From ₹{selectedPhotoModal.startingPrice}
                    </span>
                  )}
                </div>
              )}
              {selectedPhotoModal.description && (
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {selectedPhotoModal.description}
                </p>
              )}
              {onBookSkill && selectedPhotoModal.availableForHire !== false && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const item = selectedPhotoModal;
                      setSelectedPhotoModal(null);
                      onBookSkill(item);
                    }}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-soft cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Hire Creator for this Skill</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
