import React, { useState } from 'react';
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  MapPin, 
  DollarSign, 
  Clock, 
  CheckCircle2,
  ShieldCheck,
  Image,
  Plus,
  X,
  Upload
} from 'lucide-react';
import { ServiceListing, ServiceCategory, LocationPoint, UserProfile } from '../types';
import { getServicePhoto } from '../utils/categoryImages';
import { CollegeAutocompleteInput } from './CollegeAutocompleteInput';

interface BecomeSellerViewProps {
  currentUser: UserProfile | null;
  currentLocation: LocationPoint;
  onPublishService: (service: ServiceListing) => void;
  onNavigateBrowse: () => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
}

export const BecomeSellerView: React.FC<BecomeSellerViewProps> = ({
  currentUser,
  currentLocation,
  onPublishService,
  onNavigateBrowse,
  onOpenAuth,
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('Academic Support');
  const [price, setPrice] = useState<number>(250);
  const [pricingType, setPricingType] = useState<'fixed' | 'hourly'>('fixed');
  const [deliveryDays, setDeliveryDays] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string>('Tutoring, Homework Help');
  const [collegeName, setCollegeName] = useState(currentUser?.studentUniversity || 'PCTE Group of Institutes, Ludhiana');
  const [coverImage, setCoverImage] = useState<string>('');
  const [sampleImages, setSampleImages] = useState<string[]>([]);
  const [sampleUrlInput, setSampleUrlInput] = useState<string>('');
  const [highlights, setHighlights] = useState<string[]>([
    'Source File Included',
    'High Resolution Deliverable',
    'Free Revisions Included',
  ]);
  const [newHighlight, setNewHighlight] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const categories: { id: ServiceCategory; label: string; icon: string }[] = [
    { id: 'Academic Support', label: 'Academic Support', icon: '📚' },
    { id: 'Creative & Design', label: 'Creative & Design', icon: '🎨' },
    { id: 'Handmade & Crafts', label: 'Handmade & Crafts', icon: '🧶' },
    { id: 'Tech & Digital', label: 'Tech & Digital', icon: '💻' },
    { id: 'Home Help', label: 'Home Help', icon: '🏠' },
    { id: 'Events', label: 'Events', icon: '🎉' },
    { id: 'Other', label: 'Other', icon: '✨' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSampleImages((prev) => [...prev, result]);
        if (!coverImage) setCoverImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSampleUrl = () => {
    if (sampleUrlInput.trim()) {
      setSampleImages((prev) => [...prev, sampleUrlInput.trim()]);
      if (!coverImage) setCoverImage(sampleUrlInput.trim());
      setSampleUrlInput('');
    }
  };

  const handleRemoveSample = (index: number) => {
    setSampleImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddHighlight = () => {
    if (newHighlight.trim() && !highlights.includes(newHighlight.trim())) {
      setHighlights((prev) => [...prev, newHighlight.trim()]);
      setNewHighlight('');
    }
  };

  const handleRemoveHighlight = (item: string) => {
    setHighlights((prev) => prev.filter((h) => h !== item));
  };

  const handleNext = () => {
    if (!currentUser) {
      onOpenAuth('signup');
      return;
    }
    if (step === 1 && !title.trim()) {
      setTitle(`${category} Guidance & Skills`);
    }
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = () => {
    if (!currentUser) {
      onOpenAuth('signup');
      return;
    }

    const activeSeller = currentUser;

    const finalCover = coverImage || (sampleImages.length > 0 ? sampleImages[0] : getServicePhoto(category));

    const newService: ServiceListing = {
      id: `srv_${Date.now()}`,
      providerId: activeSeller.id,
      provider: activeSeller,
      title: title.trim() || `${category} Assistance & Support`,
      description: description.trim() || 'Friendly, high quality neighborhood & campus skill assistance with secured Escrow Protection.',
      category: category,
      price: Number(price) || 250,
      pricingType: pricingType,
      deliveryDays: Number(deliveryDays) || 1,
      coverImage: finalCover,
      rating: 5.0,
      reviewCount: 0,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      location: activeSeller.location || currentLocation,
      distanceKm: 0.8,
    };

    onPublishService(newService);
    setIsPublished(true);
  };

  if (isPublished) {
    return (
      <div className="bg-[#FAF8F5] min-h-[calc(100vh-4rem)] py-16 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto bg-white rounded-3xl p-8 border border-zinc-200/90 shadow-soft text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
            ✓
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black font-heading text-zinc-950">
              Service is Live!
            </h2>
            <p className="text-xs text-zinc-500">
              Your service "{title}" has been published to the neighborhood catalog and is discoverable by local residents and students.
            </p>
          </div>
          <div className="pt-3 space-y-2">
            <button
              onClick={onNavigateBrowse}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-soft transition-all cursor-pointer"
            >
              Browse in Marketplace
            </button>
            <button
              onClick={() => {
                setIsPublished(false);
                setStep(1);
                setTitle('');
                setDescription('');
              }}
              className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-2xl transition-all cursor-pointer"
            >
              List Another Skill
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] min-h-[calc(100vh-4rem)] py-10 sm:py-16">
      <div className="max-w-2xl mx-auto px-4">
        
        {/* Header (Exact Screenshot Match) */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-zinc-950">
            Become a Seller
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            List a skill or service in a few short steps.
          </p>
        </div>

        {/* Multi-Step Card (Exact Screenshot Match) */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-zinc-200/90 shadow-soft space-y-8">
          
          {/* 5-Step Segmented Progress Bar (Exact Screenshot Match) */}
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-indigo-600' : 'bg-indigo-100'
                }`}
              />
            ))}
          </div>

          {/* Unauthenticated User Notice */}
          {!currentUser && (
            <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-indigo-200/90 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-indigo-950">Registration Required to Offer Skills</h4>
                  <p className="text-[11px] text-zinc-500">Create an account or sign in with student verification to publish your listing.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-soft-xs cursor-pointer whitespace-nowrap text-xs"
              >
                Sign Up / Sign In
              </button>
            </div>
          )}

          {/* STEP 1: Basic Information (Exact Screenshot 2) */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-lg font-heading font-bold text-zinc-950">
                Basic information
              </h2>

              {/* Service Title */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-800 block">
                  Service title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. PPT Presentation Design, Calculus Tutoring"
                  className="w-full px-4 py-3 bg-white border border-zinc-200/90 rounded-2xl text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                />

                {/* Quick Title Suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-zinc-400 self-center mr-1">Suggestions:</span>
                  {[
                    'PPT & Slide Design',
                    'Calculus & Exam Help',
                    'Video Editing for Reels',
                    'Web & Python Coding',
                    'Handmade Crochet Gifts',
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setTitle(sug)}
                      className="px-2.5 py-1 bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-700 text-zinc-700 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Pills with Emoji Icons (Exact Screenshot 2) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-800 block">
                  Category
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {categories.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold shadow-2xs'
                            : 'bg-white border-zinc-200/80 text-zinc-700 hover:bg-zinc-50'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Pricing & Turnaround */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-lg font-heading font-bold text-zinc-950">
                Pricing & Turnaround
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPricingType('fixed')}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    pricingType === 'fixed'
                      ? 'border-indigo-600 bg-indigo-50/60 font-bold text-indigo-950'
                      : 'border-zinc-200 bg-white text-zinc-700'
                  }`}
                >
                  <p className="text-xs font-bold">Fixed Task Price</p>
                  <p className="text-[11px] text-zinc-500 font-normal mt-0.5">One-time flat payment</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPricingType('hourly')}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    pricingType === 'hourly'
                      ? 'border-indigo-600 bg-indigo-50/60 font-bold text-indigo-950'
                      : 'border-zinc-200 bg-white text-zinc-700'
                  }`}
                >
                  <p className="text-xs font-bold">Hourly Rate</p>
                  <p className="text-[11px] text-zinc-500 font-normal mt-0.5">Charged per hour of work</p>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-800 block">
                  Price (in ₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">₹</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    min="50"
                    step="50"
                    className="w-full pl-8 pr-4 py-3 bg-white border border-zinc-200/90 rounded-2xl text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-800 block">
                  Delivery / Turnaround Time
                </label>
                <select
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white border border-zinc-200/90 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                >
                  <option value={1}>Same Day / 24 Hours</option>
                  <option value={2}>2 Days</option>
                  <option value={3}>3 Days</option>
                  <option value={7}>1 Week</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: Description, Pictures & Deliverables */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-lg font-heading font-bold text-zinc-950">
                  Description, Deliverable Pictures & Details
                </h2>
                <p className="text-xs text-zinc-500">
                  Add photos of your work and clear deliverable points so neighbors understand exactly what you offer.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-800 block">
                  Explain what is included
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what you will do, how you deliver, and what tools/skills you use..."
                  className="w-full px-4 py-3 bg-white border border-zinc-200/90 rounded-2xl text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>

              {/* Picture Upload / Samples for Better Understanding */}
              <div className="space-y-3 p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                    <Image className="w-4 h-4 text-indigo-600" />
                    <span>Attach Work Pictures & Samples (Recommended)</span>
                  </span>
                  <span className="text-[10px] text-indigo-700 font-bold">Boosts inquiries 3x</span>
                </div>

                {/* Uploaded sample pictures preview */}
                {sampleImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {sampleImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 bg-white group">
                        <img src={img} alt={`Sample ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveSample(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="p-3 bg-white hover:bg-zinc-50 border border-dashed border-indigo-300 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-950">Upload Picture from Device</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>

                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      value={sampleUrlInput}
                      onChange={(e) => setSampleUrlInput(e.target.value)}
                      placeholder="Or paste photo URL..."
                      className="flex-1 px-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                    />
                    <button
                      type="button"
                      onClick={handleAddSampleUrl}
                      disabled={!sampleUrlInput.trim()}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Deliverables / Highlights for better understanding */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-800 block">
                  Key Deliverables & Highlights (For better buyer understanding)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {highlights.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      <span>✓ {item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(item)}
                        className="text-emerald-600 hover:text-emerald-900 cursor-pointer ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddHighlight(); } }}
                    placeholder="Add deliverable (e.g. Canva link, 24h turnaround, MP4 4K)..."
                    className="flex-1 px-3 py-2 bg-white border border-zinc-200/90 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="px-3 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-800 block">
                  Tags / Key Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Calculus, Economics, Homework, Study Notes"
                  className="w-full px-4 py-3 bg-white border border-zinc-200/90 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Campus & Location with Smart College Autocomplete */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-lg font-heading font-bold text-zinc-950">
                  Location & Campus Selection
                </h2>
                <p className="text-xs text-zinc-500">
                  Choose your college to connect with students on campus. Suggestions automatically surface nearby colleges as you type (e.g. "PC" for PCTE Ludhiana).
                </p>
              </div>

              <div className="space-y-2">
                <CollegeAutocompleteInput
                  value={collegeName}
                  onChange={setCollegeName}
                  currentCity={currentLocation.city || 'Ludhiana'}
                  label="College / Campus Name"
                  placeholder="Type college name (e.g. PCTE, PAU, DU, IIT)..."
                  helperText="Search by acronym (e.g. 'PC' for PCTE Ludhiana) or full college name"
                />
              </div>

              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center gap-3 text-xs">
                <MapPin className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                  <p className="font-bold text-zinc-900">Neighborhood Radius Hub</p>
                  <p className="text-zinc-500">{currentLocation.neighborhood || currentLocation.city || 'Ludhiana Campus Area'}</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Review & Publish */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-lg font-heading font-bold text-zinc-950">
                Review your Listing
              </h2>

              {/* Card preview with Photography */}
              <div className="rounded-3xl overflow-hidden border border-indigo-100 bg-white shadow-soft-xs space-y-3">
                <div className="h-44 w-full relative bg-zinc-100 overflow-hidden">
                  <img
                    src={coverImage || (sampleImages.length > 0 ? sampleImages[0] : getServicePhoto(category))}
                    alt={title || category}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full">
                      {category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="text-sm font-black text-white bg-indigo-600/90 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-soft-xs">
                      ₹{price} {pricingType === 'hourly' ? '/hr' : ''}
                    </span>
                  </div>
                </div>

                {/* Sample pictures thumbnail strip */}
                {sampleImages.length > 0 && (
                  <div className="px-4 flex items-center gap-2 overflow-x-auto py-1">
                    {sampleImages.map((s, idx) => (
                      <img key={idx} src={s} alt="Work sample" className="w-14 h-10 object-cover rounded-lg border border-zinc-200" />
                    ))}
                  </div>
                )}

                <div className="p-4 pt-1 space-y-2">
                  <h3 className="text-base font-bold text-zinc-950">{title || 'Untitled Service'}</h3>
                  <p className="text-xs text-zinc-600">{description || 'No description provided.'}</p>

                  {/* Highlights pills */}
                  {highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {highlights.map((h) => (
                        <span key={h} className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100">
                          ✓ {h}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 flex items-center gap-4 text-xs text-zinc-500 border-t border-zinc-100">
                    <span>⏱️ {deliveryDays} day delivery</span>
                    <span>📍 {currentLocation.neighborhood}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Protected by Escrow Services: 100% agreed payout released upon buyer delivery approval.</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 bg-indigo-950 hover:bg-indigo-900 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-2xl transition-all shadow-soft cursor-pointer flex items-center gap-2 ml-auto"
            >
              <span>{step === totalSteps ? 'Publish Listing' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
