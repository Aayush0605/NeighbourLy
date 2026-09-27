import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Zap, 
  DollarSign, 
  Tag
} from 'lucide-react';
import { ServiceCategory, LocationPoint, ServiceListing, UserProfile } from '../types';

interface PostServiceModalProps {
  onClose: () => void;
  onSubmit: (service: Omit<ServiceListing, 'id' | 'provider' | 'providerId' | 'rating' | 'reviewCount'>) => void;
  currentLocation: LocationPoint;
  currentUser: UserProfile | null;
  onRequireAuth: () => void;
}

export const PostServiceModal: React.FC<PostServiceModalProps> = ({
  onClose,
  onSubmit,
  currentLocation,
  currentUser,
  onRequireAuth,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('Home & Repairs');
  const [price, setPrice] = useState<number>(350);
  const [rushPrice, setRushPrice] = useState<number>(100);
  const [deliveryDays, setDeliveryDays] = useState<number>(1);
  const [revisions, setRevisions] = useState<number>(2);
  const [isUrgent, setIsUrgent] = useState(false);
  const [skillsInput, setSkillsInput] = useState('Local Help, Quick Turnaround');

  const categories: ServiceCategory[] = [
    'Home & Repairs',
    'Tech & Digital',
    'Creative & Design',
    'Lessons & Tutoring',
    'Pet Care',
    'Errands & Delivery',
    'Gardening & Outdoors',
    'Craft & Handmade',
    'Others',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth();
      return;
    }

    if (!title.trim() || !description.trim()) return;

    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Pick random gradient
    const gradients = [
      'from-emerald-900 via-teal-900 to-slate-950',
      'from-indigo-900 via-purple-900 to-slate-950',
      'from-blue-900 via-cyan-900 to-slate-950',
      'from-amber-900 via-orange-950 to-stone-950',
      'from-rose-950 via-slate-900 to-stone-900',
    ];
    const coverGradient = gradients[Math.floor(Math.random() * gradients.length)];

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      price,
      rushPrice,
      rushHours: 4,
      deliveryDays,
      deliveryHours: deliveryDays * 24,
      revisions,
      isUrgent,
      coverGradient,
      skills: skills.length > 0 ? skills : [category],
      location: currentLocation,
      trsScore: 92,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-heading font-black text-slate-900">Offer a Skill in Your Neighborhood</h2>
            <p className="text-xs text-slate-500">List what you can help with. Neighbors can book your fixed-price service.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800">
              Service Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wi-Fi Router Setup & PC Cleanup, or Professional PPT Design"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you will do, your experience, and what the neighbor should provide..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Base Price (₹)</label>
              <input
                type="number"
                min="50"
                step="50"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Turnaround (Days)</label>
              <input
                type="number"
                min="0"
                max="14"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Rush Option (+₹)</label>
              <input
                type="number"
                min="0"
                step="25"
                value={rushPrice}
                onChange={(e) => setRushPrice(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Revisions</label>
              <input
                type="number"
                min="0"
                max="5"
                value={revisions}
                onChange={(e) => setRevisions(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800">Skills / Tags (comma-separated)</label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g. Wi-Fi, Hardware, Windows, macOS"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Offering from: <strong>{currentLocation.neighborhood}, {currentLocation.city}</strong>
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Local Service
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-200 transition-all cursor-pointer"
          >
            Publish Service to Neighborhood
          </button>
        </form>

      </div>
    </div>
  );
};
