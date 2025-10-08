import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import MapComponent from '@/components/MapComponent';
import SearchBar from '@/components/SearchBar';
import StatsSidebar from '@/components/StatsSidebar';
import Header from '@/components/Header';
import About from '@/pages/About';
import Settings from '@/pages/Settings';
import { heatCenterService, demandSiteService } from '@/services/api';

/**
 * Main application page component
 * Orchestrates the layout and data flow between header, sidebar, map components, and navigation
 */
const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'settings'>('home');
  const { toast } = useToast();

  // Fetch heat centers data with proper error handling and caching
  const { data: heatCenters = [], isLoading: isLoadingHeat, error: heatError } = useQuery({
    queryKey: ['heatCenters'],
    queryFn: () => heatCenterService.getAll(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    retry: 3, // Retry failed requests up to 3 times
  });

  // Fetch demand sites data with proper error handling and caching
  const { data: demandSites = [], isLoading: isLoadingDemand, error: demandError } = useQuery({
    queryKey: ['demandSites'],
    queryFn: () => demandSiteService.getAll(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    retry: 3, // Retry failed requests up to 3 times
  });

  const isLoading = isLoadingHeat || isLoadingDemand;
  const hasError = heatError || demandError;

  // Calculate summary statistics for header
  const totalSites = heatCenters.length + demandSites.length;
  const activeConnections = heatCenters.filter(center => center.is_active).length + 
                           demandSites.filter(site => site.is_connected).length;

  // Handle search functionality with user feedback
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      toast({
        title: "Searching heat centers and demand sites",
        description: `Looking for: ${query}`,
      });
    } else {
      setSearchQuery('');
    }
  };

  // Handle voice search placeholder functionality
  const handleMicrophoneClick = () => {
    toast({
      title: "Voice search",
      description: "Voice search feature coming soon!",
    });
  };

  // Display error state if data fetching fails
  if (hasError && !isLoading) {
    return (
      <div className="flex flex-col w-full h-screen bg-gray-50">
        <Header totalSites={0} activeConnections={0} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Unable to Load Data
            </h2>
            <p className="text-gray-600 mb-4">
              There was an error connecting to the server. Please check your connection and try again.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle navigation between pages
  const handleNavigate = (page: 'home' | 'about' | 'settings') => {
    setCurrentPage(page);
  };

  // Show About page
  if (currentPage === 'about') {
    return <About onNavigate={handleNavigate} />;
  }

  // Show Settings page
  if (currentPage === 'settings') {
    return <Settings onNavigate={handleNavigate} />;
  }

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-gray-50">
      {/* Application Header */}
      <Header 
        totalSites={totalSites} 
        activeConnections={activeConnections} 
        onNavigate={handleNavigate}
      />
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Statistics Sidebar */}
        <StatsSidebar 
          heatCenters={heatCenters} 
          demandSites={demandSites}
          isLoading={isLoading}
        />
        
        {/* Map and Search Area */}
        <div className="relative flex-1 h-full">
          <MapComponent searchQuery={searchQuery} />
          <SearchBar 
            onSearch={handleSearch} 
            onMicrophoneClick={handleMicrophoneClick} 
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
