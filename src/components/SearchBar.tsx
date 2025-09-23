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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-3xl px-6">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="flex items-center relative overflow-hidden rounded-2xl">
          <div 
            className="absolute inset-0 bg-glass border rounded-2xl"
            style={{
              backdropFilter: 'var(--glass-backdrop-enhanced)',
              WebkitBackdropFilter: 'var(--glass-backdrop-enhanced)',
              boxShadow: 'var(--glass-shadow-enhanced)',
              borderColor: 'var(--glass-border-enhanced)'
            }}
          />
          
          <div 
            className="absolute inset-0 rounded-2xl pointer-events-none opacity-60"
            style={{ background: 'var(--glass-highlight-enhanced)' }}
          />
          <div className="absolute inset-[1px] bg-gradient-to-br from-white/8 via-transparent to-black/5 rounded-2xl pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          
          <div className="flex-1 flex items-center pl-7 pr-3 py-4 relative z-10">
            <Search className="h-6 w-6 text-muted-foreground/90 mr-4 shrink-0" />
            <Input
              type="text"
              placeholder="Search data centers in San Francisco..."
              value={query}
              onChange={handleInputChange}
              className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-medium h-auto p-0 w-full"
            />
          </div>
          <div className="flex items-center gap-3 pr-4 relative z-10">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onMicrophoneClick}
              className="h-11 w-11 rounded-xl hover:bg-white/15 text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105"
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button
              type="submit"
              size="icon"
              className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;