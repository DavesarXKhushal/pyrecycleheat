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
    <Card className="w-96 relative overflow-hidden border-2 border-emerald-200/50 bg-white/95 backdrop-blur-xl shadow-2xl">
      <div 
        className="absolute inset-0 rounded-lg bg-gradient-to-br from-emerald-50/80 via-white/60 to-green-50/80"
      />
      <div 
        className="absolute inset-0 rounded-lg pointer-events-none opacity-30"
        style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))' }}
      />
      <div className="absolute inset-[2px] bg-gradient-to-br from-white/40 via-transparent to-emerald-50/20 rounded-lg pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 leading-tight text-lg mb-2">{dataCenter.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200 font-medium">
                {dataCenter.provider}
              </Badge>
            </div>
            {dataCenter.address && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span>{dataCenter.address}</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-emerald-100 text-gray-500 hover:text-gray-700 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-5 relative z-10">
        <p className="text-sm text-gray-600 leading-relaxed">
          {dataCenter.description}
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50/80 rounded-xl p-3 border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-100">
                <Zap className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Capacity</div>
            </div>
            <div className="font-semibold text-gray-900">{dataCenter.capacity}</div>
          </div>
          
          <div className="bg-emerald-50/80 rounded-xl p-3 border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-100">
                <Calendar className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Established</div>
            </div>
            <div className="font-semibold text-gray-900">{dataCenter.established}</div>
          </div>
        </div>
        
        <div className="flex gap-3 pt-2">
          {dataCenter.website && (
            <Button 
              onClick={handleWebsiteClick}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-all duration-200 hover:scale-[1.02] shadow-lg"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Website
            </Button>
          )}
          <Button 
            variant="outline" 
            className="flex-1 border-emerald-200 hover:bg-emerald-50 text-emerald-700 font-medium transition-all duration-200"
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