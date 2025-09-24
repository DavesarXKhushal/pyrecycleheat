import { useState } from 'react';
import { Search, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onMicrophoneClick: () => void;
}

const SearchBar = ({ onSearch, onMicrophoneClick }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-4xl px-6">
      <form onSubmit={handleSubmit} className="relative group">
        <div className={`flex items-center relative overflow-hidden rounded-3xl transition-all duration-500 ease-out ${
          isFocused ? 'scale-[1.02] shadow-2xl' : 'hover:scale-[1.01]'
        }`}>
          {/* Main glass background */}
          <div 
            className="absolute inset-0 rounded-3xl border border-white/20"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.12),
                0 2px 8px rgba(0, 0, 0, 0.08),
                inset 0 1px 0 rgba(255, 255, 255, 0.3),
                inset 0 -1px 0 rgba(255, 255, 255, 0.1)
              `
            }}
          />
          
          {/* Liquid glass highlight */}
          <div 
            className="absolute inset-0 rounded-3xl pointer-events-none opacity-60"
            style={{ 
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%)'
            }}
          />
          
          {/* Inner glow */}
          <div className="absolute inset-[1px] bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-3xl pointer-events-none" />
          
          {/* Top highlight line */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          
          {/* Focus ring */}
          {isFocused && (
            <div 
              className="absolute -inset-1 rounded-3xl pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.2))',
                filter: 'blur(2px)'
              }}
            />
          )}
          
          <div className="flex-1 flex items-center pl-8 pr-4 py-5 relative z-10">
            <Search className={`h-6 w-6 mr-5 shrink-0 transition-all duration-300 ${
              isFocused ? 'text-emerald-600 scale-110' : 'text-gray-500'
            }`} />
            <Input
              type="text"
              placeholder="Search data centers in San Francisco..."
              value={query}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="border-0 bg-transparent text-gray-800 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-medium h-auto p-0 w-full font-poppins"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            />
          </div>
          
          <div className="flex items-center gap-3 pr-6 relative z-10">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onMicrophoneClick}
              className="h-12 w-12 rounded-2xl hover:bg-white/20 text-gray-600 hover:text-gray-800 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button
              type="submit"
              size="icon"
              className="h-12 w-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Subtle bottom reflection */}
        <div 
          className="absolute -bottom-1 left-8 right-8 h-px opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)'
          }}
        />
      </form>
    </div>
  );
};

export default SearchBar;