import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import MapComponent from '@/components/MapComponent';
import SearchBar from '@/components/SearchBar';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      toast({
        title: "Searching data centers",
        description: `Looking for: ${query}`,
      });
    } else {
      setSearchQuery('');
    }
  };

  const handleMicrophoneClick = () => {
    toast({
      title: "Voice search",
      description: "Voice search feature coming soon!",
    });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <MapComponent searchQuery={searchQuery} />
      <SearchBar onSearch={handleSearch} onMicrophoneClick={handleMicrophoneClick} />
    </div>
  );
};

export default Index;
