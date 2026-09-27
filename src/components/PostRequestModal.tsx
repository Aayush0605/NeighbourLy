import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  AlertCircle
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
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
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
      filesAttached: attachedFiles,
    });

    setIsSubmittedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-heading font-black text-slate-900">Post a Neighborhood Task</h2>
            <p className="text-xs text-slate-500">Need something fixed, designed, or done? Broadcast to nearby neighbors.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmittedSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-heading font-bold text-slate-900">Request Broadcasted to Neighbors!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Neighbors in <strong>{currentLocation.neighborhood}</strong> matching this task have been notified. You can review applications in your dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">
                Task Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Need curtain rod assembled or Wi-Fi extended"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">
                Details & Scope <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what needs to be done, location specifics, tools required..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Offered Budget (₹)</label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">Target Deadline / Preferred Time</label>
                <label className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                  />
                  <span>Urgent (Today)</span>
                </label>
              </div>
              <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <input
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="e.g. Today by 8 PM or Weekend morning"
                  className="w-full text-xs font-medium text-slate-800 bg-transparent focus:outline-none"
                />
                <Calendar className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Posting near: <strong>{currentLocation.neighborhood}, {currentLocation.city}</strong>
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Nearby Neighbors
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-200 transition-all cursor-pointer"
            >
              Broadcast Task to Neighbors
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
