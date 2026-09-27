import React from 'react';

interface StudentMascotProps {
  variant?: 'banner' | 'avatar' | 'card' | 'speech';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTags?: boolean;
}

export const StudentMascot: React.FC<StudentMascotProps> = ({
  variant = 'avatar',
  size = 'md',
  className = '',
  showTags = true,
}) => {
  const avatarSizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  /**
   * High-Fidelity Vector Student Mascot
   * Reconstructed from "11. MASCOT / FRIENDLY CHARACTER":
   * - Cheerful smiling student with friendly eyes & messy brown/dark hair
   * - Purple hoodie with white letter 'N' logo on chest
   * - Backpack with dark straps
   * - Enthusiastic thumbs up gesture
   */
  const MascotCharacter = ({ className: c = 'w-full h-full' }: { className?: string }) => (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={c}
      aria-label="NeighborLy Student Mascot"
    >
      <defs>
        {/* Skin gradients */}
        <radialGradient id="mascotSkin" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#FFE0BD" />
          <stop offset="85%" stopColor="#FBD1A2" />
          <stop offset="100%" stopColor="#F5BF8A" />
        </radialGradient>
        <linearGradient id="mascotCheek" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB7185" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
        </linearGradient>

        {/* Purple hoodie gradient matching NeighborLy Brand Palette */}
        <linearGradient id="hoodieGrad" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="hoodieDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5B21B6" />
          <stop offset="100%" stopColor="#4C1D95" />
        </linearGradient>

        {/* Hair gradient */}
        <linearGradient id="mascotHair" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="#3E2723" />
          <stop offset="60%" stopColor="#2E1C14" />
          <stop offset="100%" stopColor="#1B0F0B" />
        </linearGradient>

        {/* Backpack gradient */}
        <linearGradient id="backpackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#1F2937" />
        </linearGradient>
      </defs>

      {/* Backpack visible behind left shoulder */}
      <path
        d="M 28 92 C 16 92, 10 115, 12 145 C 14 165, 26 172, 40 172 C 45 152, 48 130, 48 110 Z"
        fill="url(#backpackGrad)"
        stroke="#111827"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M 20 120 C 16 135, 18 150, 24 160"
        stroke="#4B5563"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Body / Purple Hoodie Torso */}
      <path
        d="M 44 140 C 44 125, 62 120, 82 118 C 96 117, 108 118, 122 120 C 140 123, 155 130, 156 150 C 158 172, 155 195, 154 200 L 40 200 C 40 188, 43 162, 44 140 Z"
        fill="url(#hoodieGrad)"
        stroke="#1F1B2C"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Backpack Straps over shoulders */}
      <path
        d="M 52 134 C 48 150, 47 172, 48 190"
        stroke="#1F2937"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M 124 134 C 127 150, 128 172, 128 190"
        stroke="#1F2937"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Hoodie Collar / Drawstrings */}
      <path
        d="M 72 120 C 80 128, 102 128, 110 120 C 114 126, 110 138, 91 140 C 74 138, 68 126, 72 120 Z"
        fill="url(#hoodieDark)"
        stroke="#1F1B2C"
        strokeWidth="3.5"
      />
      {/* Drawstring ties */}
      <path d="M 82 135 L 80 152" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="80" cy="153" r="2" fill="#E5E7EB" />
      <path d="M 100 135 L 102 150" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="102" cy="151" r="2" fill="#E5E7EB" />

      {/* Signature White 'N' Logo on Hoodie Chest */}
      <path
        d="M 78 178 V 154 L 95 174 V 154"
        stroke="#FFFFFF"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Neck */}
      <path
        d="M 78 104 L 78 122 C 86 126, 96 126, 104 122 L 104 104 Z"
        fill="url(#mascotSkin)"
        stroke="#1F1B2C"
        strokeWidth="3.5"
      />
      {/* Neck shadow */}
      <path
        d="M 78 108 C 88 116, 96 116, 104 108 L 104 116 C 96 122, 86 122, 78 116 Z"
        fill="#E2AA72"
        opacity="0.6"
      />

      {/* Head / Ears */}
      {/* Left Ear */}
      <ellipse cx="56" cy="74" rx="7" ry="10" transform="rotate(-10 56 74)" fill="url(#mascotSkin)" stroke="#1F1B2C" strokeWidth="3" />
      <path d="M 55 70 C 53 74, 55 78, 58 77" stroke="#D79960" strokeWidth="2" strokeLinecap="round" />
      {/* Right Ear */}
      <ellipse cx="126" cy="72" rx="7" ry="10" transform="rotate(10 126 72)" fill="url(#mascotSkin)" stroke="#1F1B2C" strokeWidth="3" />
      <path d="M 127 68 C 129 72, 127 76, 124 75" stroke="#D79960" strokeWidth="2" strokeLinecap="round" />

      {/* Face Base */}
      <path
        d="M 58 64 C 54 82, 60 102, 91 103 C 122 102, 128 82, 124 64 C 122 45, 60 45, 58 64 Z"
        fill="url(#mascotSkin)"
        stroke="#1F1B2C"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Blushing Cheeks */}
      <ellipse cx="68" cy="80" rx="9" ry="5" fill="url(#mascotCheek)" />
      <ellipse cx="114" cy="79" rx="9" ry="5" fill="url(#mascotCheek)" />

      {/* Eyebrows */}
      <path d="M 64 54 C 68 50, 78 51, 80 54" stroke="#2E1C14" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 102 53 C 105 50, 114 49, 118 53" stroke="#2E1C14" strokeWidth="3.5" strokeLinecap="round" />

      {/* Big Cheerful Eyes */}
      {/* Left Eye */}
      <ellipse cx="73" cy="67" rx="6" ry="8" fill="#1C1917" />
      <circle cx="71" cy="64" r="2.8" fill="#FFFFFF" />
      <circle cx="75" cy="71" r="1.4" fill="#FFFFFF" />
      {/* Right Eye */}
      <ellipse cx="109" cy="66" rx="6" ry="8" fill="#1C1917" />
      <circle cx="107" cy="63" r="2.8" fill="#FFFFFF" />
      <circle cx="111" cy="70" r="1.4" fill="#FFFFFF" />

      {/* Cute Nose */}
      <path d="M 90 70 C 90 73, 93 75, 95 73" stroke="#C98850" strokeWidth="2.5" strokeLinecap="round" />

      {/* Warm Friendly Smile */}
      <path
        d="M 76 80 C 80 93, 102 93, 106 80"
        fill="#831843"
        stroke="#1F1B2C"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Upper teeth white highlight */}
      <path
        d="M 80 81 C 86 85, 96 85, 102 81 Z"
        fill="#FFFFFF"
      />
      {/* Cute tongue */}
      <path
        d="M 86 88 C 88 85, 94 85, 96 88 C 94 92, 88 92, 86 88 Z"
        fill="#F43F5E"
      />

      {/* Stylish Messy Anime Student Hair */}
      <path
        d="M 52 54 C 48 42, 54 28, 68 20 C 82 12, 104 12, 118 20 C 132 28, 136 42, 132 54 C 130 50, 126 44, 120 44 C 122 36, 115 30, 106 28 C 98 26, 90 28, 86 32 C 80 28, 72 30, 68 36 C 62 38, 56 46, 52 54 Z"
        fill="url(#mascotHair)"
        stroke="#1F1B2C"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Front hair tufts / bangs */}
      <path
        d="M 62 44 C 68 48, 74 54, 76 60 C 78 52, 84 46, 92 48 C 94 44, 100 44, 104 50 C 108 46, 114 48, 118 52 C 119 46, 122 42, 126 44"
        fill="url(#mascotHair)"
        stroke="#1F1B2C"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Spiky hair strands at top/sides */}
      <path d="M 50 42 C 42 36, 44 26, 52 24 C 54 30, 56 36, 52 42" fill="url(#mascotHair)" stroke="#1F1B2C" strokeWidth="2.5" />
      <path d="M 78 16 C 80 8, 90 8, 92 15" fill="url(#mascotHair)" stroke="#1F1B2C" strokeWidth="2.5" />
      <path d="M 122 22 C 130 18, 138 24, 134 32" fill="url(#mascotHair)" stroke="#1F1B2C" strokeWidth="2.5" />

      {/* Right Arm & Thumbs Up Hand Gesture */}
      {/* Arm reaching forward/up */}
      <path
        d="M 148 142 C 158 136, 168 130, 172 120 C 174 116, 170 110, 164 114 C 158 118, 150 128, 144 136 Z"
        fill="url(#hoodieGrad)"
        stroke="#1F1B2C"
        strokeWidth="3.5"
      />
      {/* Hand cuff */}
      <path d="M 166 114 L 174 122" stroke="#5B21B6" strokeWidth="4" strokeLinecap="round" />

      {/* Thumbs Up Hand */}
      {/* Palm / folded fingers */}
      <path
        d="M 168 112 C 172 108, 180 109, 184 113 C 188 117, 187 124, 182 128 C 178 130, 172 128, 169 123 Z"
        fill="url(#mascotSkin)"
        stroke="#1F1B2C"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Upright Thumb */}
      <path
        d="M 172 110 C 172 100, 174 92, 178 90 C 182 89, 184 94, 182 104 C 182 108, 180 111, 176 113 Z"
        fill="url(#mascotSkin)"
        stroke="#1F1B2C"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Thumb knuckle line */}
      <path d="M 176 98 C 178 99, 180 98, 181 97" stroke="#D79960" strokeWidth="1.8" strokeLinecap="round" />
      {/* Finger curls */}
      <path d="M 181 116 C 184 117, 185 120, 182 122" stroke="#D79960" strokeWidth="1.8" />
    </svg>
  );

  // Avatar variant (for AI Assistant, Chat, Navbar profile)
  if (variant === 'avatar') {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl bg-gradient-to-br from-purple-100 via-indigo-50 to-purple-200 border border-purple-200/90 shadow-soft-xs overflow-hidden ${avatarSizes[size]} ${className}`}>
        <div className="w-[115%] h-[115%] translate-y-1">
          <MascotCharacter />
        </div>
      </div>
    );
  }

  // Speech bubble variant
  if (variant === 'speech') {
    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        <div className="w-14 h-14 shrink-0 rounded-2xl bg-purple-100 border border-purple-200 shadow-soft-xs overflow-hidden">
          <div className="w-[115%] h-[115%] translate-y-1">
            <MascotCharacter />
          </div>
        </div>
        <div className="relative bg-white px-3.5 py-2 rounded-2xl rounded-tl-xs border border-purple-200/90 shadow-soft text-xs text-zinc-800">
          <span className="font-extrabold text-purple-700 block text-[11px] mb-0.5">Learn · Earn · Grow Together!</span>
          <span>Students helping students across campus & neighborhood.</span>
        </div>
      </div>
    );
  }

  // Full Hero / Spotlight Mascot Banner (Image 2, Item 11)
  return (
    <div className={`relative bg-gradient-to-br from-purple-50/90 via-indigo-50/50 to-pink-50/60 rounded-3xl border border-purple-200/80 p-5 sm:p-7 shadow-soft overflow-hidden ${className}`}>
      {/* Background ambient confetti doodle shapes */}
      <div className="absolute top-3 right-6 text-amber-400 opacity-60 text-lg font-bold select-none">✦</div>
      <div className="absolute top-12 right-20 text-indigo-400 opacity-50 text-sm select-none">★</div>
      <div className="absolute bottom-4 left-44 text-purple-400 opacity-40 text-xs select-none">●</div>
      <div className="absolute top-6 left-32 text-pink-400 opacity-40 text-sm select-none">♥</div>

      <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-7 relative z-10">
        
        {/* Mascot Character with shadow disc */}
        <div className="relative shrink-0 w-28 h-28 sm:w-36 sm:h-36">
          <div className="absolute bottom-1 inset-x-3 h-5 bg-purple-950/10 rounded-full blur-xs" />
          <MascotCharacter />
        </div>

        {/* Speech Cloud & NeighborLy Brand Lockup */}
        <div className="space-y-3 text-center sm:text-left flex-1">
          
          {/* Cloud Speech Bubble with hand-drawn feel */}
          <div className="inline-block relative">
            <div className="bg-white/95 backdrop-blur-xs px-4 py-2 rounded-2xl border border-purple-200 shadow-soft-xs text-xs sm:text-sm font-heading font-black text-purple-950 tracking-tight flex items-center gap-1.5 mx-auto sm:mx-0">
              <span className="text-purple-600">✦</span>
              <span>Learn · Earn · Grow Together!</span>
            </div>
            {/* Speech bubble tail pointer */}
            <div className="hidden sm:block absolute -left-2 top-3 w-3 h-3 bg-white border-l border-b border-purple-200 rotate-45" />
          </div>

          {/* Logo + Tagline */}
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-zinc-950">
              Neighbor<span className="text-purple-600">Ly</span>
            </h3>
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-purple-700">
              Students Helping Students
            </p>
          </div>

          <p className="text-xs text-zinc-600 max-w-md leading-relaxed">
            Need assignment help, dorm moving, coding tips, or want to earn by offering your skills? Connect with verified peers right from your campus.
          </p>

          {/* Tag Badges (Friendly · Relatable · Student-Centric · Memorable) */}
          {showTags && (
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100/90 border border-purple-200/80 px-2.5 py-0.5 rounded-full">
                Friendly
              </span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/90 border border-indigo-200/80 px-2.5 py-0.5 rounded-full">
                Relatable
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100/90 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
                Student-Centric
              </span>
              <span className="text-[10px] font-bold text-pink-700 bg-pink-100/90 border border-pink-200/80 px-2.5 py-0.5 rounded-full">
                Memorable
              </span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
