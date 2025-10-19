import { X, Server, Zap, MapPin, Building2 } from 'lucide-react';
import type { MapMarker, HeatCenter, DemandSite } from '@/types';
import { useEffect, useRef } from 'react';

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
  const popupRef = useRef<HTMLDivElement>(null);

  // Auto-close functionality when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

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

  return (
    <div 
      ref={popupRef}
      className="relative w-80 max-w-[90vw] rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        zIndex: 1001,
        fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, sans-serif'
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Single container with all content */}
      <div className="p-5">
        {/* Header with close button */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {isHeatCenter && <Zap className="w-4 h-4 text-gray-700 flex-shrink-0" />}
              {isDemandSite && <Building2 className="w-4 h-4 text-gray-700 flex-shrink-0" />}
              {!marker && <Server className="w-4 h-4 text-gray-700 flex-shrink-0" />}
              <h3 className="text-lg font-semibold text-gray-900 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {displayData.name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span 
                className="text-xs px-2 py-1 rounded-full border border-white/30"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                {isHeatCenter 
                  ? (heatCenterData?.is_active ? '● Active' : '○ Inactive')
                  : isDemandSite 
                  ? (demandSiteData?.is_connected ? '● Connected' : '○ Disconnected')
                  : dataCenter?.provider || 'Data Center'
                }
              </span>
              {marker && (
                <span 
                  className="text-xs px-2 py-1 rounded-full border border-white/30"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                >
                  {marker.type === 'heat_center' ? 'Heat Center' : 'Demand Site'}
                </span>
              )}
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full flex items-center justify-center ml-3 shrink-0 transition-all duration-200 hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <X className="h-3 w-3 text-gray-700" />
          </button>
        </div>

        {/* Location */}
        <div className="flex items-start gap-3 p-3 rounded-xl mb-3" style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
          <MapPin className="w-4 h-4 text-gray-700 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-800 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Location</p>
            <p className="text-xs text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {marker 
                ? `${marker.data.location_lat.toFixed(4)}, ${marker.data.location_lng.toFixed(4)}`
                : dataCenter?.address || `${dataCenter?.latitude.toFixed(4)}, ${dataCenter?.longitude.toFixed(4)}`
              }
            </p>
          </div>
        </div>

        {/* Type-specific information */}
        {isHeatCenter && heatCenterData && (
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-gray-700" />
              <span className="text-sm font-medium text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>Heat Center Details</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                <p className="text-xs text-gray-700 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Max Capacity</p>
                <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>{heatCenterData.max_capacity_mw} MW</p>
              </div>
              <div className="p-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                <p className="text-xs text-gray-700 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Current Output</p>
                <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>{heatCenterData.current_output_mw} MW</p>
              </div>
            </div>
            <div className="p-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
              <p className="text-xs text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <span className="font-medium">Fuel Type:</span> {heatCenterData.fuel_type}
              </p>
            </div>
          </div>
        )}

        {isDemandSite && demandSiteData && (
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-gray-700" />
              <span className="text-sm font-medium text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>Demand Site Details</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                <p className="text-xs text-gray-700 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Peak Demand</p>
                <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>{demandSiteData.peak_demand_mw} MW</p>
              </div>
              <div className="p-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                <p className="text-xs text-gray-700 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Site Type</p>
                <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>{demandSiteData.site_type}</p>
              </div>
            </div>
          </div>
        )}

        {!marker && dataCenter && (
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-4 h-4 text-gray-700" />
              <span className="text-sm font-medium text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>Data Center Details</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                <span className="text-xs text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>Provider:</span>
                <span className="text-xs font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>{dataCenter.provider}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                <span className="text-xs text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>Capacity:</span>
                <span className="text-xs font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>{dataCenter.capacity}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                <span className="text-xs text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>Established:</span>
                <span className="text-xs font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>{dataCenter.established}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataCenterPopup;