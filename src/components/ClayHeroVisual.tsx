import React from 'react';
import { Sparkles, Check, Laptop, GraduationCap, ShieldCheck, Star, Code2, Palette, FileText, Coffee } from 'lucide-react';

interface ClayHeroVisualProps {
  onSearch: (query: string) => void;
  onNavigateBrowse: () => void;
}

export const ClayHeroVisual: React.FC<ClayHeroVisualProps> = ({
  onSearch,
  onNavigateBrowse,
}) => {
  return (
    <div className="relative w-full max-w-full select-none overflow-hidden rounded-3xl">
      {/* Ambient background clay orbs */}
      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-gradient-to-br from-purple-300/40 to-indigo-300/20 blur-xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-gradient-to-tr from-pink-300/40 to-purple-200/30 blur-xl pointer-events-none" />

      {/* Main Claymorphism Card Container */}
      <div className="relative clay-hero-frame overflow-hidden aspect-[4/3] sm:aspect-[16/11] group">
        
        {/* Clay Background Scene with Ambient Depth (Given Background) */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/75 via-purple-50/80 to-pink-100/70 overflow-hidden">
          {/* Ambient Clay Orbs with Inset Highlight and Soft Drop */}
          <div className="absolute top-6 left-10 w-24 h-24 rounded-full bg-white/60 shadow-[inset_3px_3px_8px_rgba(255,255,255,0.9),inset_-3px_-3px_8px_rgba(165,180,252,0.3)] blur-[1px]" />
          <div className="absolute bottom-12 right-12 w-32 h-32 rounded-full bg-purple-200/40 shadow-[inset_4px_4px_10px_rgba(255,255,255,0.9),inset_-4px_-4px_10px_rgba(147,51,234,0.15)] blur-[1px]" />
          <div className="absolute top-1/2 left-4 w-16 h-16 rounded-full bg-indigo-200/50 shadow-[inset_2px_2px_6px_rgba(255,255,255,0.8),inset_-2px_-2px_6px_rgba(99,102,241,0.2)]" />
        </div>

        {/* 3D CLAYMORPHIC STUDENT COLLABORATION ARTWORK */}
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4 z-10">
          
          {/* Pure SVG & CSS 3D Clay Scene */}
          <svg
            viewBox="0 0 520 380"
            className="w-full h-full max-h-[360px] drop-shadow-[0_16px_24px_rgba(99,102,241,0.18)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Clay Linear & Radial Gradients for 3D Puffy Depth */}
              <linearGradient id="clayTable" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E0E7FF" />
              </linearGradient>

              <linearGradient id="clayIndigo" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>

              <linearGradient id="clayPurple" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#C084FC" />
                <stop offset="100%" stopColor="#7E22CE" />
              </linearGradient>

              <linearGradient id="clayPeach" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FDBA74" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>

              <linearGradient id="clayMint" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6EE7B7" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>

              <linearGradient id="clayPink" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F472B6" />
                <stop offset="100%" stopColor="#DB2777" />
              </linearGradient>

              <linearGradient id="clayYellow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>

              <radialGradient id="claySpecular" cx="30%" cy="25%" r="60%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </radialGradient>

              {/* Clay Soft Bevel Filter */}
              <filter id="clayShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="3" dy="6" stdDeviation="5" floodColor="#4338CA" floodOpacity="0.18" />
              </filter>

              <filter id="clayGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Clay Desk / Collaboration Platform */}
            <g filter="url(#clayShadow)">
              <rect x="50" y="270" width="420" height="48" rx="24" fill="url(#clayTable)" />
              {/* Highlight rim on desk */}
              <rect x="52" y="272" width="416" height="6" rx="3" fill="#FFFFFF" fillOpacity="0.9" />
              {/* Subtle desk shadow line */}
              <rect x="54" y="310" width="412" height="4" rx="2" fill="#C7D2FE" fillOpacity="0.5" />
            </g>

            {/* --- STUDENT 1: DESIGNER / CREATOR (Left) --- */}
            <g filter="url(#clayShadow)" className="transition-transform duration-300 hover:scale-105 origin-bottom">
              {/* Body / Lilac Clay Sweater */}
              <path
                d="M100 280 C100 225, 160 225, 160 280 Z"
                fill="url(#clayPurple)"
              />
              <path
                d="M103 277 C103 230, 157 230, 157 277 Z"
                fill="url(#claySpecular)"
              />

              {/* Head / Peach Skin */}
              <ellipse cx="130" cy="195" rx="26" ry="29" fill="#FED7AA" />
              <ellipse cx="130" cy="195" rx="26" ry="29" fill="url(#claySpecular)" opacity="0.6" />

              {/* Hair / Stylish Clay Bun */}
              <path
                d="M106 195 C106 160, 154 160, 154 195 C154 185, 140 178, 130 178 C120 178, 106 185, 106 195 Z"
                fill="#4C1D95"
              />
              <circle cx="130" cy="162" r="14" fill="#581C87" />
              <circle cx="127" cy="158" r="6" fill="#A855F7" fillOpacity="0.5" />

              {/* Cute Clay Face Features */}
              <ellipse cx="122" cy="194" rx="2.5" ry="3.5" fill="#4C1D95" />
              <ellipse cx="138" cy="194" rx="2.5" ry="3.5" fill="#4C1D95" />
              {/* Cheerful Smile */}
              <path d="M125 204 Q130 209 135 204" stroke="#BE185D" strokeWidth="2.5" strokeLinecap="round" />
              {/* Rosy Cheeks */}
              <ellipse cx="117" cy="201" rx="4" ry="2.5" fill="#F472B6" fillOpacity="0.5" />
              <ellipse cx="143" cy="201" rx="4" ry="2.5" fill="#F472B6" fillOpacity="0.5" />

              {/* Clay Stylus / Apple Pencil */}
              <rect x="150" y="240" width="6" height="32" rx="3" fill="#FFFFFF" transform="rotate(-30 150 240)" />
              <polygon points="148,272 153,275 145,278" fill="#F43F5E" />
            </g>

            {/* --- STUDENT 2: TECH / CODER (Center) --- */}
            <g filter="url(#clayShadow)" className="transition-transform duration-300 hover:scale-105 origin-bottom">
              {/* Body / Mint Clay Hoodie */}
              <path
                d="M210 275 C210 205, 310 205, 310 275 Z"
                fill="url(#clayMint)"
              />
              <path
                d="M214 272 C214 210, 306 210, 306 272 Z"
                fill="url(#claySpecular)"
              />

              {/* Head / Warm Clay Tone */}
              <ellipse cx="260" cy="170" rx="30" ry="33" fill="#FDBA74" />
              <ellipse cx="260" cy="170" rx="30" ry="33" fill="url(#claySpecular)" opacity="0.6" />

              {/* Short Wavy Clay Hair */}
              <path
                d="M230 165 C230 130, 290 130, 290 165 C285 150, 275 145, 260 145 C245 145, 235 150, 230 165 Z"
                fill="#1E1B4B"
              />
              {/* Cool Clay Headphones */}
              <path d="M228 170 C228 135, 292 135, 292 170" stroke="#4F46E5" strokeWidth="6" strokeLinecap="round" fill="none" />
              <rect x="224" y="165" width="8" height="18" rx="4" fill="#4338CA" />
              <rect x="288" y="165" width="8" height="18" rx="4" fill="#4338CA" />

              {/* Cute Clay Face */}
              <ellipse cx="251" cy="168" rx="3" ry="4" fill="#1E1B4B" />
              <ellipse cx="269" cy="168" rx="3" ry="4" fill="#1E1B4B" />
              <path d="M255 179 Q260 185 265 179" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />

              {/* 3D Clay Laptop (In front of Student 2) */}
              <g filter="url(#clayShadow)">
                {/* Screen Base Back */}
                <rect x="220" y="215" width="80" height="52" rx="10" fill="url(#clayIndigo)" />
                <rect x="222" y="217" width="76" height="48" rx="8" fill="#1E1B4B" />
                {/* Glowing Code Screen */}
                <rect x="225" y="220" width="70" height="42" rx="6" fill="#312E81" />
                {/* Code syntax lines */}
                <rect x="230" y="226" width="22" height="3" rx="1.5" fill="#34D399" />
                <rect x="256" y="226" width="30" height="3" rx="1.5" fill="#A78BFA" />
                <rect x="234" y="233" width="40" height="3" rx="1.5" fill="#F472B6" />
                <rect x="238" y="240" width="28" height="3" rx="1.5" fill="#6EE7B7" />
                <rect x="230" y="247" width="34" height="3" rx="1.5" fill="#FBBF24" />
                <circle cx="280" cy="248" r="4" fill="#818CF8" />

                {/* Keyboard Platform Bevel */}
                <path d="M208 268 L312 268 L320 282 L200 282 Z" fill="#4338CA" />
                <path d="M214 270 L306 270 L312 280 L208 280 Z" fill="#6366F1" />
                {/* Touchpad */}
                <rect x="250" y="274" width="20" height="5" rx="2" fill="#818CF8" />
              </g>
            </g>

            {/* --- STUDENT 3: SCHOLAR / PRESENTER (Right) --- */}
            <g filter="url(#clayShadow)" className="transition-transform duration-300 hover:scale-105 origin-bottom">
              {/* Body / Pastel Rose Clay Top */}
              <path
                d="M360 280 C360 220, 420 220, 420 280 Z"
                fill="url(#clayPink)"
              />
              <path
                d="M363 277 C363 226, 417 226, 417 277 Z"
                fill="url(#claySpecular)"
              />

              {/* Head / Warm Clay Tone */}
              <ellipse cx="390" cy="190" rx="25" ry="28" fill="#FFEDD5" />
              <ellipse cx="390" cy="190" rx="25" ry="28" fill="url(#claySpecular)" opacity="0.6" />

              {/* Sleek Dark Clay Hair */}
              <path
                d="M366 185 C366 152, 414 152, 414 185 C408 175, 400 170, 390 170 C380 170, 372 175, 366 185 Z"
                fill="#312E81"
              />

              {/* Stylish Round Clay Glasses */}
              <circle cx="382" cy="188" r="7" stroke="#4F46E5" strokeWidth="2" fill="none" />
              <circle cx="398" cy="188" r="7" stroke="#4F46E5" strokeWidth="2" fill="none" />
              <line x1="389" y1="188" x2="391" y2="188" stroke="#4F46E5" strokeWidth="2" />

              {/* Cute Eyes & Smile */}
              <ellipse cx="382" cy="188" rx="2" ry="2.5" fill="#312E81" />
              <ellipse cx="398" cy="188" rx="2" ry="2.5" fill="#312E81" />
              <path d="M385 199 Q390 204 395 199" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />

              {/* Hand Holding Clay Diploma / Assignment with Star */}
              <g filter="url(#clayShadow)">
                <rect x="340" y="235" width="34" height="44" rx="6" fill="#FFFFFF" transform="rotate(-15 340 235)" />
                {/* Document Gold Ribbon */}
                <rect x="340" y="250" width="34" height="6" fill="#F59E0B" transform="rotate(-15 340 235)" />
                {/* Mini Star Seal */}
                <circle cx="355" cy="256" r="5" fill="#D97706" />
                <circle cx="355" cy="256" r="3" fill="#FCD34D" />
              </g>
            </g>

            {/* --- 3D CLAY PROPS & ACCESSORIES --- */}

            {/* 3D Clay Coffee Mug with Steam */}
            <g filter="url(#clayShadow)">
              <rect x="175" y="260" width="18" height="22" rx="6" fill="url(#clayPeach)" />
              <path d="M193 264 C198 264, 198 274, 193 274" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" fill="none" />
              {/* Steam curly lines */}
              <path d="M180 254 Q183 248 180 244" stroke="#C7D2FE" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
              <path d="M186 252 Q189 246 186 242" stroke="#C7D2FE" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
            </g>

            {/* Stack of 3D Clay Books */}
            <g filter="url(#clayShadow)">
              <rect x="70" y="264" width="46" height="8" rx="4" fill="url(#clayIndigo)" />
              <rect x="72" y="255" width="44" height="8" rx="4" fill="url(#clayMint)" />
              <rect x="74" y="247" width="40" height="8" rx="4" fill="url(#clayYellow)" />
              {/* Bookmark ribbon hanging */}
              <path d="M104 250 L104 266 L108 262 L112 266 L112 250 Z" fill="#EF4444" />
            </g>

            {/* Glowing 3D Clay Idea Lightbulb (Floating Top-Center) */}
            <g filter="url(#clayGlow)">
              <circle cx="260" cy="85" r="20" fill="url(#clayYellow)" />
              <circle cx="255" cy="78" r="6" fill="#FFFFFF" fillOpacity="0.8" />
              {/* Bulb Base */}
              <rect x="254" y="103" width="12" height="6" rx="2" fill="#9CA3AF" />
              <rect x="256" y="109" width="8" height="3" rx="1.5" fill="#6B7280" />
              {/* Radiating Sparkle Beams */}
              <line x1="260" y1="56" x2="260" y2="48" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
              <line x1="284" y1="68" x2="292" y2="62" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
              <line x1="236" y1="68" x2="228" y2="62" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
            </g>

            {/* Floating 3D Clay Sparkles & Stars */}
            <g filter="url(#clayShadow)">
              {/* Sparkle 1 */}
              <path
                d="M170 120 Q175 128 183 128 Q175 128 170 136 Q165 128 157 128 Q165 128 170 120 Z"
                fill="url(#clayPink)"
              />
              {/* Sparkle 2 */}
              <path
                d="M340 115 Q344 122 351 122 Q344 122 340 129 Q336 122 329 122 Q336 122 340 115 Z"
                fill="url(#clayMint)"
              />
              {/* Sparkle 3 */}
              <path
                d="M440 210 Q443 216 449 216 Q443 216 440 222 Q437 216 431 216 Q437 216 440 210 Z"
                fill="url(#clayYellow)"
              />
            </g>

          </svg>

          {/* Inner Clay Highlight Edge */}
          <div className="absolute inset-0 rounded-[34px] pointer-events-none shadow-[inset_0_2px_8px_rgba(255,255,255,0.9),inset_0_-4px_12px_rgba(79,70,229,0.18)]" />
        </div>

      </div>
    </div>
  );
};
