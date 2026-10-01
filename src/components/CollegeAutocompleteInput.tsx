import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, MapPin, Search, Check, ChevronDown, Sparkles } from 'lucide-react';
import { searchColleges, getNearbyColleges, CollegeInfo } from '../utils/collegeData';

interface CollegeAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  currentCity?: string;
  placeholder?: string;
  label?: string;
  helperText?: string;
  className?: string;
  required?: boolean;
}

export const CollegeAutocompleteInput: React.FC<CollegeAutocompleteInputProps> = ({
  value,
  onChange,
  currentCity = 'Ludhiana',
  placeholder = 'Type your college name (e.g. PCTE, PAU, DU, IIT)...',
  label = 'College / University',
  helperText,
  className = '',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const results = searchColleges(inputValue, currentCity);
  const nearbyDefaults = getNearbyColleges(currentCity);

  const handleSelect = (collegeName: string) => {
    setInputValue(collegeName);
    onChange(collegeName);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setIsOpen(true);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-zinc-800 mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            <span>{label}</span>
            {required && <span className="text-rose-500">*</span>}
          </span>
          {currentCity && (
            <span className="text-[10px] text-zinc-400 font-normal flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5 text-zinc-400" />
              <span>Near {currentCity}</span>
            </span>
          )}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          className="w-full pl-9 pr-8 py-2.5 bg-white border border-zinc-200/90 rounded-2xl text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 transition-all shadow-2xs"
        />
        <GraduationCap className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 cursor-pointer"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {helperText && (
        <p className="text-[11px] text-zinc-400 mt-1">{helperText}</p>
      )}

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-soft-xl border border-zinc-200/90 p-2 z-50 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header indicator */}
          <div className="px-2.5 py-1.5 flex items-center justify-between text-[11px] text-zinc-400 border-b border-zinc-100 font-semibold mb-1">
            <span>
              {inputValue.trim()
                ? `Matching colleges (${results.length})`
                : `Suggested colleges near ${currentCity || 'your campus'}`}
            </span>
            <span className="text-[10px] text-indigo-600 font-bold">Verified Network</span>
          </div>

          <div className="space-y-1">
            {results.slice(0, 10).map((college) => {
              const isSelected = value.toLowerCase() === college.name.toLowerCase();
              return (
                <button
                  key={college.id}
                  type="button"
                  onClick={() => handleSelect(college.name)}
                  className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-950 font-bold border border-indigo-100'
                      : 'hover:bg-zinc-50 text-zinc-800'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-zinc-900 truncate">
                        {college.name}
                      </span>
                      {college.shortCode && (
                        <span className="px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-black shrink-0">
                          {college.shortCode}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      📍 {college.city}, {college.state}
                    </span>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  )}
                </button>
              );
            })}

            {/* Custom option when user typed something specific */}
            {inputValue.trim() && !results.some((c) => c.name.toLowerCase() === inputValue.trim().toLowerCase()) && (
              <button
                type="button"
                onClick={() => handleSelect(inputValue.trim())}
                className="w-full text-left p-2.5 rounded-xl bg-purple-50/70 hover:bg-purple-100/70 text-purple-900 text-xs font-semibold flex items-center gap-2 border border-purple-100 transition-colors cursor-pointer mt-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="truncate">
                  Use custom college: <strong className="font-bold">"{inputValue.trim()}"</strong>
                </span>
              </button>
            )}

            {results.length === 0 && !inputValue.trim() && (
              <div className="py-4 text-center text-xs text-zinc-400">
                Type your college or university name to search
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
