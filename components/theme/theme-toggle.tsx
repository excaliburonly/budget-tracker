'use client';

import { useTheme } from '@/providers/theme-provider';
import { THEMES } from '@/utils/theme';
import { SwatchIcon } from '@heroicons/react/24/outline';
import { useState, useRef, useEffect } from 'react';

export function ThemeToggle({ align = 'bottom', side = 'left' }: { align?: 'top' | 'bottom', side?: 'left' | 'right' }) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatThemeName = (name: string) => {
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-muted hover:bg-link-hover-bg hover:text-link-hover-text transition-colors text-sm font-medium w-full"
        aria-label="Select theme"
      >
        <SwatchIcon className="w-5 h-5 shrink-0" />
        <span className="hidden sm:inline truncate">{formatThemeName(theme)}</span>
      </button>

      {isOpen && (
        <div className={`absolute ${side === 'left' ? 'left-0' : 'right-0'} w-48 bg-surface border border-surface-border rounded-lg shadow-lg z-[100] overflow-hidden ${
          align === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
        }`}>
          {THEMES.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTheme(t);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                theme === t 
                  ? 'bg-primary text-white' 
                  : 'text-foreground hover:bg-link-hover-bg hover:text-link-hover-text'
              }`}
            >
              {formatThemeName(t)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
