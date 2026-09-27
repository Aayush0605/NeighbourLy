import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  DollarSign, 
  Tag,
  Briefcase
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
      coverGradient: 'from-zinc-800 to-zinc-950',
      skills: skills.length > 0 ? skills : [category],
      location: currentLocation,
      trsScore: 95,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div 
        className="relative bg-white rounded-t-3xl sm:rounded-3xl max-w-xl w-full shadow-soft-xl border border-zinc-200/90 overflow-hidden my-0 sm:my-auto flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/60 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-heading font-extrabold text-zinc-950">
              Offer a Skill in Your Neighborhood
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              List what you can help with. Neighbors can book your fixed-price service.
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5 overflow-y-auto">
          
          {/* Location Context Banner */}
          <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-2xl border border-zinc-200/80 text-xs text-zinc-700">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Listing in <strong>{currentLocation.neighborhood}, {currentLocation.city}</strong></span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-900">Service Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Home Wi-Fi & Printer Setup, Furniture Assembly, Math Tutoring"
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-900">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full px-3.5 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white cursor-pointer shadow-2xs"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-900">Base Price (₹ INR)</label>
              <input
                type="number"
                min="50"
                step="50"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white shadow-2xs tabular-nums"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-900">Description & What's Included</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you will do, your experience or tools, and what the neighbor needs to provide..."
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-900">Turnaround Time</label>
              <select
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(Number(e.target.value))}
                className="w-full px-3.5 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white cursor-pointer shadow-2xs"
              >
                <option value={0}>Same Day (Within hours)</option>
                <option value={1}>1 Day (Next day)</option>
                <option value={2}>2 Days</option>
                <option value={3}>3 Days</option>
                <option value={7}>1 Week</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-900">Rush Delivery Add-on (+₹)</label>
              <input
                type="number"
                min="0"
                step="50"
                value={rushPrice}
                onChange={(e) => setRushPrice(Number(e.target.value))}
                placeholder="Optional extra fee for urgent delivery"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white shadow-2xs tabular-nums"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-900">Keywords & Skills (comma separated)</label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g. Wi-Fi, Router, Hardware, On-Site"
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white shadow-2xs"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-soft hover:shadow-soft-md cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            >
              Publish Local Skill Listing
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
