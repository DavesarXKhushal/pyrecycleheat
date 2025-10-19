import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Box, Mountain, Layers, Map } from 'lucide-react';

interface MapControlsProps {
  onToggle3D: (is3D: boolean) => void;
}

const MapControls = ({ onToggle3D }: MapControlsProps) => {
  const [is3D, setIs3D] = useState(true);

  const handleToggle = (mode: '3D' | '2D') => {
    const newIs3D = mode === '3D';
    setIs3D(newIs3D);
    onToggle3D(newIs3D);
  };

  return (
    <div className="absolute top-6 right-6 z-20">
      <div className="flex flex-col gap-4">
        {/* 3D Control */}
        <div className="relative group">
          <Button
            variant="glass"
            onClick={() => handleToggle('3D')}
            className="relative overflow-hidden rounded-2xl w-16 h-16 p-0"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1))',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              boxShadow: is3D 
                ? '0 8px 32px rgba(255, 255, 255, 0.3), 0 2px 8px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)' 
                : '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
            }}
          >
            {/* Glass effect for inactive state */}
            {!is3D && (
              <>
                <div 
                  className="absolute inset-0 rounded-2xl pointer-events-none opacity-60"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%)'
                  }}
                />
                <div className="absolute inset-[1px] bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-2xl pointer-events-none" />
                <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              </>
            )}

            {/* Active state glass effect */}
            {is3D && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-white/5 rounded-2xl pointer-events-none" />
                <div className="absolute inset-[1px] bg-gradient-to-br from-white/25 via-white/8 to-transparent rounded-2xl pointer-events-none" />
                <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl blur-sm" />
              </>
            )}
            
            <div className="flex flex-col items-center justify-center relative z-10">
            <Box 
              className={`h-7 w-7 mb-1 transition-all duration-300 ${is3D ? 'scale-110' : ''}`}
              style={{
                filter: is3D 
                  ? 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))'
                  : 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.5)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
              }}
            />
            <span className={`text-xs font-semibold font-poppins tracking-wide transition-all duration-300 ${is3D ? 'scale-105' : ''}`}
                  style={{
                    textShadow: is3D 
                      ? '0 1px 2px rgba(255, 255, 255, 0.3)' 
                      : '0 1px 2px rgba(255, 255, 255, 0.8)'
                  }}>
              3D
            </span>
          </div>
            
            {/* Active glow effect */}
            {is3D && (
              <div 
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
                }}
              />
            )}
          </Button>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap font-poppins">
              3D View
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
            </div>
          </div>
        </div>

        {/* 2D Control */}
        <div className="relative group">
          <Button
            variant="glass"
            onClick={() => handleToggle('2D')}
            className="relative h-16 w-16 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1))',
              boxShadow: !is3D
                ? '0 8px 32px rgba(255, 255, 255, 0.4), 0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
                : '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
          >
            {/* Multi-layer glass effects */}
            <div className="absolute inset-[1px] bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-2xl pointer-events-none" />
            <div className="absolute inset-[2px] bg-gradient-to-t from-white/5 to-white/15 rounded-2xl pointer-events-none" />
            
            {/* Top highlight */}
            <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            
            {/* Active glow effect */}
            {!is3D && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl animate-pulse" />
                <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl blur-sm" />
              </>
            )}
            
            <div className="flex flex-col items-center justify-center relative z-10">
              <Map 
                className={`h-7 w-7 mb-1 transition-all duration-300 ${!is3D ? 'scale-110' : ''}`}
                style={{
                  filter: !is3D 
                    ? 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))'
                    : 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.5)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
                }}
              />
              <span className={`text-xs font-semibold font-poppins tracking-wide transition-all duration-300 ${!is3D ? 'scale-105' : ''}`}
                    style={{
                      textShadow: !is3D 
                        ? '0 1px 2px rgba(255, 255, 255, 0.3)' 
                        : '0 1px 2px rgba(255, 255, 255, 0.8)'
                    }}>
                2D
              </span>
            </div>
          </Button>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap font-poppins">
              2D View
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapControls;