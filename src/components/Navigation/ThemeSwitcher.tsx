import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';

interface ThemeSwitcherProps {
  variant?: 'icon' | 'compact' | 'pill' | 'segmented';
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ 
  variant = 'icon',
  className = '' 
}) => {
  const { theme, setTheme, toggleTheme } = useSupabase();

  if (variant === 'segmented') {
    return (
      <div 
        id="theme-switcher-segmented"
        className={`inline-flex items-center p-1 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] text-xs font-medium ${className}`}
      >
        <button
          type="button"
          onClick={() => setTheme('warm-ivory')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            theme === 'warm-ivory'
              ? 'bg-[#FFFDF9] text-[#8B1E3F] font-semibold border border-[#E8DDD2] shadow-2xs'
              : 'text-[#685559] hover:text-[#2B1D20]'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-[#D97706]" />
          <span>Warm Ivory</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('midnight')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            theme === 'midnight'
              ? 'bg-[#FFFDF9] text-[#8B1E3F] font-semibold border border-[#E8DDD2] shadow-2xs'
              : 'text-[#685559] hover:text-[#2B1D20]'
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-[#E0486D]" />
          <span>Midnight Dark</span>
        </button>
      </div>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        id="btn-theme-toggle-pill"
        onClick={toggleTheme}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E8DDD2] bg-[#FAF7F2] hover:bg-[#F4EFEA] text-xs font-medium text-[#2B1D20] transition-colors shadow-2xs ${className}`}
        title={`Current: ${theme === 'warm-ivory' ? 'Warm Ivory' : 'Midnight Dark'} (Click to toggle)`}
      >
        {theme === 'warm-ivory' ? (
          <>
            <Sun className="w-3.5 h-3.5 text-[#D97706]" />
            <span className="hidden sm:inline">Warm Ivory</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-[#FF5A84]" />
            <span className="hidden sm:inline">Midnight</span>
          </>
        )}
      </button>
    );
  }

  // Default: Icon button
  return (
    <button
      type="button"
      id="btn-theme-toggle"
      onClick={toggleTheme}
      className={`p-2 rounded-lg border border-[#E8DDD2] bg-[#FAF7F2] hover:bg-[#F4EFEA] text-[#685559] hover:text-[#2B1D20] transition-all shadow-2xs relative group ${className}`}
      title={theme === 'warm-ivory' ? 'Switch to Midnight Dark Theme' : 'Switch to Warm Ivory Theme'}
      aria-label="Toggle visual theme"
    >
      {theme === 'warm-ivory' ? (
        <Sun className="w-4 h-4 text-[#D97706] transition-transform duration-200 group-hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-[#FF5A84] transition-transform duration-200 group-hover:-rotate-12" />
      )}
    </button>
  );
};
