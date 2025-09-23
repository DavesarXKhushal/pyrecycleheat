import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Box, Mountain } from 'lucide-react';

interface MapControlsProps {
  onToggle3D: (is3D: boolean) => void;
}

const MapControls = ({ onToggle3D }: MapControlsProps) => {
  const [is3D, setIs3D] = useState(true);

  const handleToggle = () => {
    const newIs3D = !is3D;
    setIs3D(newIs3D);
    onToggle3D(newIs3D);
  };

  return (
    <div className="absolute top-6 right-6 z-20">
      <div className="flex flex-col gap-3">
        <div className="relative overflow-hidden rounded-xl">
          <div 
            className="absolute inset-0 bg-glass border rounded-xl"
            style={{
              backdropFilter: 'var(--glass-backdrop-enhanced)',
              WebkitBackdropFilter: 'var(--glass-backdrop-enhanced)',
              boxShadow: 'var(--glass-shadow-enhanced)',
              borderColor: 'var(--glass-border-enhanced)'
            }}
          />
          
          <div 
            className="absolute inset-0 rounded-xl pointer-events-none opacity-60"
            style={{ background: 'var(--glass-highlight-enhanced)' }}
          />
          <div className="absolute inset-[1px] bg-gradient-to-br from-white/8 via-transparent to-black/5 rounded-xl pointer-events-none" />
          
          <div className="relative z-10 p-2">
            <div className="flex rounded-lg bg-muted/20 p-1">
              <Button
                variant={is3D ? "secondary" : "ghost"}
                size="sm"
                onClick={handleToggle}
                className={`flex-1 rounded-md transition-all duration-300 ${
                  is3D 
                    ? 'bg-background/90 text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/20'
                }`}
              >
                <Mountain className="h-4 w-4 mr-2" />
                3D
              </Button>
              <Button
                variant={!is3D ? "secondary" : "ghost"}
                size="sm"
                onClick={handleToggle}
                className={`flex-1 rounded-md transition-all duration-300 ${
                  !is3D 
                    ? 'bg-background/90 text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/20'
                }`}
              >
                <Box className="h-4 w-4 mr-2" />
                2D
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapControls;