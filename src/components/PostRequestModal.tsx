import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { ServiceCategory, LocationPoint, TaskRequest, UserProfile } from '../types';

interface PostRequestModalProps {
  onClose: () => void;
  onSubmit: (request: Omit<TaskRequest, 'id' | 'requesterId' | 'requesterName' | 'requesterAvatar' | 'requesterLocation' | 'status' | 'createdAt'>) => void;
  currentLocation: LocationPoint;
  currentUser: UserProfile | null;
  onRequireAuth: () => void;
}

export const PostRequestModal: React.FC<PostRequestModalProps> = ({
  onClose,
  onSubmit,
  currentLocation,
  currentUser,
  onRequireAuth,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('Home & Repairs');
  const [deadline, setDeadline] = useState('Tomorrow, 5:00 PM');
  const [budget, setBudget] = useState<number>(400);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

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

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      deadline,
      budget,
      isUrgent,
      filesAttached: [],
    });

    setIsSubmittedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div 
        className="relative bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-soft-xl border border-zinc-200/90 overflow-hidden my-0 sm:my-auto flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/60 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-heading font-extrabold text-zinc-950">
              Post a Task Needed
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Nearby neighbors will see your request and can contact you to help.
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmittedSuccess ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-soft-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-zinc-950">Task Request Posted!</h3>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
              Your request is broadcast to neighbors in {currentLocation.neighborhood}. You'll be notified when a neighbor accepts.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5 overflow-y-auto">
            
            {/* Location context tag */}
            <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-2xl border border-zinc-200/80 text-xs text-zinc-700">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Visible to neighbors near <strong>{currentLocation.neighborhood}</strong></span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-900">Task Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Need help assembling IKEA wardrobe tonight"
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
                <label className="text-xs font-bold text-zinc-900">Target Budget (₹ INR)</label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  required
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white shadow-2xs tabular-nums"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-900">Task Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the task clearly, tools needed, location details..."
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-900">Needed By / Deadline</label>
                <input
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="e.g. Today by 8 PM, or Tomorrow morning"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white shadow-2xs"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-zinc-800">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="accent-zinc-950 h-4 w-4 rounded"
                  />
                  <span>Mark as Urgent (Priority local ping)</span>
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-soft hover:shadow-soft-md cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
              >
                Post Task Request
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
