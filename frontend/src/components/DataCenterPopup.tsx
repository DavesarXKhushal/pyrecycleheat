import { X, Server, Zap, Calendar, MapPin, ExternalLink, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MapMarker, HeatCenter, DemandSite } from '@/types';

interface DataCenter {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  provider: string;
  capacity: string;
  established: string;
  website?: string;
  address?: string;
}

interface DataCenterPopupProps {
  dataCenter?: DataCenter;
  marker?: MapMarker;
  onClose: () => void;
}

const DataCenterPopup = ({ dataCenter, marker, onClose }: DataCenterPopupProps) => {
  // Use marker data if available, otherwise fall back to dataCenter
  const displayData = marker ? {
    name: marker.name,
    type: marker.type,
    status: marker.status,
    data: marker.data as HeatCenter | DemandSite,
    latitude: marker.latitude,
    longitude: marker.longitude
  } : dataCenter;

  if (!displayData) return null;

  const isHeatCenter = marker?.type === 'heat_center';
  const isDemandSite = marker?.type === 'demand_site';
  
  const heatCenterData = isHeatCenter ? marker.data as HeatCenter : null;
  const demandSiteData = isDemandSite ? marker.data as DemandSite : null;

  const handleWebsiteClick = () => {
    if (dataCenter?.website) {
      window.open(dataCenter.website, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className="relative w-64 sm:w-72 max-w-[85vw] rounded-2xl border border-white/30 shadow-xl backdrop-blur-xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1))',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.12), 0 6px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 1001,
        maxHeight: '70vh',
        overflowY: 'auto'
      }}
    >
      {/* Multi-layer glass effects */}
      <div className="absolute inset-[1px] bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-3xl pointer-events-none" />
      <div className="absolute inset-[2px] bg-gradient-to-t from-white/5 to-white/15 rounded-3xl pointer-events-none" />
      
      {/* Top highlight */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      <div className="absolute top-1 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      
      {/* Ambient glow effect */}
      <div 
        className="absolute inset-0 rounded-3xl pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.3) 0%, transparent 70%)',
          filter: 'blur(20px)',
          transform: 'scale(1.1)'
        }}
      />
      
      <div className="relative z-10 p-3 sm:p-4">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isHeatCenter && <Zap className="w-4 h-4 text-red-600 flex-shrink-0" />}
              {isDemandSite && <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />}
              {!marker && <Server className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
              <h3 className="text-base sm:text-lg font-bold text-gray-900 font-poppins truncate"
                  style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)' }}>
                {displayData.name}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge 
                variant="secondary" 
                className={`text-xs font-medium ${
                  isHeatCenter 
                    ? heatCenterData?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    : isDemandSite 
                    ? demandSiteData?.is_connected ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isHeatCenter 
                  ? (heatCenterData?.is_active ? 'Active' : 'Inactive')
                  : isDemandSite 
                  ? (demandSiteData?.is_connected ? 'Connected' : 'Disconnected')
                  : dataCenter?.provider || 'Data Center'
                }
              </Badge>
              {marker && (
                <Badge variant="outline" className="text-xs">
                  {marker.type === 'heat_center' ? 'Heat Center' : 'Demand Site'}
                </Badge>
              )}
            </div>
          </div>
          
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl hover:bg-white/30 text-gray-700 hover:text-gray-900 transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 shadow-lg shrink-0 ml-2"
            style={{
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              background: 'rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
            }}
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 drop-shadow-sm" />
          </Button>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {/* Description/Details Section */}
          <div className="p-2.5 sm:p-3 rounded-xl border border-white/20 backdrop-blur-sm"
               style={{
                 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                 boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
               }}>
            <p className="text-xs text-gray-800 leading-relaxed font-medium"
               style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)' }}>
              {isHeatCenter 
                ? `Heat generation facility with ${heatCenterData?.fuel_type} fuel type`
                : isDemandSite 
                ? `${demandSiteData?.site_type} facility requiring thermal energy`
                : dataCenter?.description || 'Data center facility'
              }
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {/* Capacity/Output Section */}
            <div className="p-2.5 sm:p-3 rounded-xl border border-white/20 backdrop-blur-sm"
                 style={{
                   background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                   boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                 }}>
              <div className="text-xs text-gray-600 font-semibold mb-1 uppercase tracking-wide"
                   style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)' }}>
                {isHeatCenter ? 'Max Capacity' : isDemandSite ? 'Peak Demand' : 'Capacity'}
              </div>
              <div className="text-sm font-bold text-emerald-700"
                   style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)' }}>
                {isHeatCenter 
                  ? `${heatCenterData?.max_capacity_mw} MW`
                  : isDemandSite 
                  ? `${demandSiteData?.peak_demand_mw} MW`
                  : dataCenter?.capacity || 'N/A'
                }
              </div>
            </div>

            {/* Current Output/Status Section */}
            <div className="p-2.5 sm:p-3 rounded-xl border border-white/20 backdrop-blur-sm"
                 style={{
                   background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                   boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                 }}>
              <div className="text-xs text-gray-600 font-semibold mb-1 uppercase tracking-wide"
                   style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)' }}>
                {isHeatCenter ? 'Current Output' : isDemandSite ? 'Site Type' : 'Established'}
              </div>
              <div className="text-sm font-bold text-emerald-700"
                   style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)' }}>
                {isHeatCenter 
                  ? `${heatCenterData?.current_output_mw} MW`
                  : isDemandSite 
                  ? demandSiteData?.site_type || 'Unknown'
                  : dataCenter?.established || 'N/A'
                }
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="p-2.5 sm:p-3 rounded-xl border border-white/20 backdrop-blur-sm"
               style={{
                 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                 boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
               }}>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-3 h-3 text-gray-600" />
              <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide"
                    style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)' }}>
                Location
              </span>
            </div>
            <div className="text-xs text-gray-800 font-medium break-all"
                 style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)' }}>
              {marker 
                ? `${marker.data.location_lat.toFixed(4)}, ${marker.data.location_lng.toFixed(4)}`
                : dataCenter?.address || `${dataCenter?.latitude.toFixed(4)}, ${dataCenter?.longitude.toFixed(4)}`
              }
            </div>
          </div>

          {/* Connection Status */}
           <div className="p-2.5 sm:p-3 rounded-xl border border-white/20 backdrop-blur-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}>
             <div className="text-xs text-gray-800 font-medium"
                  style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)' }}>
               <span className="font-semibold">Connection Status:</span> {
                 isHeatCenter 
                   ? (heatCenterData?.is_active ? 'Active' : 'Inactive')
                   : isDemandSite 
                   ? (demandSiteData?.is_connected ? 'Connected' : 'Disconnected')
                   : 'Unknown'
               }
             </div>
           </div>
        </div>
      </div>
      
      {/* Bottom reflection effect */}
      <div 
        className="absolute -bottom-2 left-6 right-6 h-2 opacity-30 rounded-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
          filter: 'blur(2px)'
        }}
      />
    </div>
  );
};

export default DataCenterPopup;