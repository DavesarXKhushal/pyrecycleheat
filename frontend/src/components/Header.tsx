import React from 'react';
import { MapPin, Activity, Settings, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  totalSites?: number;
  activeConnections?: number;
}

/**
 * Application header component providing branding, navigation, and system status
 * Displays the SF District Heating System title with real-time connection statistics
 */
const Header: React.FC<HeaderProps> = ({ 
  totalSites = 0, 
  activeConnections = 0 
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section - Branding */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                SF District Heating Explorer
              </h1>
              <p className="text-sm text-gray-600">
                Real-time energy distribution network
              </p>
            </div>
          </div>
        </div>

        {/* Center Section - Status Indicators */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <Activity className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">
              System Status
            </span>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Online
            </Badge>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span className="font-medium">{totalSites}</span>
              <span>Total Sites</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-1">
              <span className="font-medium text-green-600">{activeConnections}</span>
              <span>Active</span>
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            <Info className="h-4 w-4 mr-2" />
            About
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;