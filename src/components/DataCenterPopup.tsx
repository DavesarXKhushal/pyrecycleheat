import { X, Server, Zap, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  dataCenter: DataCenter;
  onClose: () => void;
}

const DataCenterPopup = ({ dataCenter, onClose }: DataCenterPopupProps) => {
  const handleWebsiteClick = () => {
    if (dataCenter.website) {
      window.open(dataCenter.website, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="w-96 relative overflow-hidden border-2 bg-glass/20 backdrop-blur-xl"
          style={{ 
            borderColor: 'var(--glass-border-enhanced)',
            backdropFilter: 'var(--glass-backdrop-enhanced)',
            WebkitBackdropFilter: 'var(--glass-backdrop-enhanced)'
          }}>
      <div 
        className="absolute inset-0 rounded-lg"
        style={{ boxShadow: 'var(--glass-shadow-enhanced)' }}
      />
      <div 
        className="absolute inset-0 rounded-lg pointer-events-none opacity-70"
        style={{ background: 'var(--glass-highlight-enhanced)' }}
      />
      <div className="absolute inset-[2px] bg-gradient-to-br from-white/6 via-transparent to-black/8 rounded-lg pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-bold text-foreground leading-tight text-lg mb-2">{dataCenter.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-medium">
                {dataCenter.provider}
              </Badge>
            </div>
            {dataCenter.address && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{dataCenter.address}</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-white/15 text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-5 relative z-10">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {dataCenter.description}
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/20 rounded-xl p-3 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Capacity</div>
            </div>
            <div className="font-semibold text-foreground">{dataCenter.capacity}</div>
          </div>
          
          <div className="bg-muted/20 rounded-xl p-3 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Established</div>
            </div>
            <div className="font-semibold text-foreground">{dataCenter.established}</div>
          </div>
        </div>
        
        <div className="flex gap-3 pt-2">
          {dataCenter.website && (
            <Button 
              onClick={handleWebsiteClick}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 hover:scale-[1.02] shadow-lg"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Website
            </Button>
          )}
          <Button 
            variant="outline" 
            className="flex-1 border-border/50 hover:bg-muted/30 font-medium transition-all duration-200"
          >
            <Server className="h-4 w-4 mr-2" />
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataCenterPopup;