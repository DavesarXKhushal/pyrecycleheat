import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Server } from 'lucide-react';
import { createRoot } from 'react-dom/client';
import DataCenterPopup from './DataCenterPopup';
import MapControls from './MapControls';
import dataCenters from '@/data/dataCenters.json';

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

interface MapComponentProps {
  searchQuery?: string;
}

const MapComponent = ({ searchQuery }: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [selectedDataCenter, setSelectedDataCenter] = useState<DataCenter | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [is3D, setIs3D] = useState(true);

  const SF_BOUNDS: maplibregl.LngLatBoundsLike = [
    [-122.55, 37.7],
    [-121.9, 37.85]
  ];

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          },
          'terrain': {
            type: 'raster-dem',
            url: 'https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=demo',
            tileSize: 256
          }
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
            paint: {
              'raster-contrast': 0.1,
              'raster-saturation': 0.8,
              'raster-brightness-min': 0.4,
              'raster-brightness-max': 1.0,
              'raster-hue-rotate': 5
            }
          }
        ],
        terrain: {
          source: 'terrain',
          exaggeration: 1.2
        }
      },
      center: [-122.4194, 37.7749],
      zoom: 12,
      pitch: is3D ? 60 : 0,
      bearing: is3D ? -15 : 0,
      maxBounds: SF_BOUNDS,
      maxZoom: 18,
      minZoom: 10
    });

    map.current.addControl(
      new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      if (!map.current) return;

      map.current.addSource('sf-buildings', {
        type: 'vector',
        url: 'https://api.maptiler.com/tiles/buildings-3d/tiles.json?key=demo'
      });

      map.current.addLayer({
        id: 'building-base',
        source: 'sf-buildings',
        'source-layer': 'building',
        type: 'fill',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12, 'hsl(210, 15%, 92%)',
            16, 'hsl(210, 20%, 95%)'
          ],
          'fill-opacity': 0.8
        }
      });

      map.current.addLayer({
        id: '3d-buildings',
        source: 'sf-buildings',
        'source-layer': 'building',
        type: 'fill-extrusion',
        minzoom: 13,
        layout: {
          'visibility': is3D ? 'visible' : 'none'
        },
        paint: {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['zoom'],
            13, 'hsl(210, 25%, 88%)',
            15, 'hsl(210, 30%, 90%)',
            17, 'hsl(210, 35%, 92%)'
          ],
          'fill-extrusion-height': [
            'case',
            ['has', 'height'],
            ['*', ['get', 'height'], 1.2],
            ['*', ['get', 'levels'], 4]
          ],
          'fill-extrusion-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            13, 0.9,
            16, 0.95
          ],
          'fill-extrusion-base': 0
        }
      });

      addDataCenterMarkers();
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const createMarkerElement = (dataCenter: DataCenter) => {
    const el = document.createElement('div');
    el.className = 'cursor-pointer transform transition-all duration-300 hover:scale-110 hover:-translate-y-1';
    el.innerHTML = `
      <div class="relative group">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center relative overflow-hidden border-2 border-white shadow-lg" 
             style="background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 6px 24px rgba(16, 185, 129, 0.25);">
          
          <div class="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent rounded-lg"></div>
          <div class="absolute inset-[1px] bg-gradient-to-br from-white/20 via-transparent to-black/5 rounded-lg"></div>
          
          <div class="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="relative z-10 drop-shadow-md group-hover:scale-105 transition-transform duration-200">
            <rect width="20" height="8" x="2" y="2" rx="2" ry="2"/>
            <rect width="20" height="8" x="2" y="14" rx="2" ry="2"/>
            <line x1="6" x2="6" y1="6" y2="10"/>
            <line x1="6" x2="6" y1="18" y2="22"/>
          </svg>
          
          <div class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-white shadow-sm animate-pulse"></div>
        </div>
        
        <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 rotate-45 border border-white/30 shadow-md"
             style="background: linear-gradient(135deg, #10b981, #059669);"></div>
        
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl -z-10 group-hover:bg-emerald-400/15 transition-all duration-300"></div>
      </div>
    `;

    el.addEventListener('click', () => {
      setSelectedDataCenter(dataCenter);
      showPopup(dataCenter);
    });

    return el;
  };

  const showPopup = (dataCenter: DataCenter) => {
    if (!map.current) return;

    if (popupRef.current) {
      popupRef.current.remove();
    }

    const popupEl = document.createElement('div');
    const root = createRoot(popupEl);
    
    root.render(
      <DataCenterPopup
        dataCenter={dataCenter}
        onClose={() => {
          if (popupRef.current) {
            popupRef.current.remove();
            popupRef.current = null;
          }
          setSelectedDataCenter(null);
        }}
      />
    );

    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: [0, -10],
      className: 'data-center-popup',
    })
      .setLngLat([dataCenter.longitude, dataCenter.latitude])
      .setDOMContent(popupEl)
      .addTo(map.current);
  };

  const addDataCenterMarkers = () => {
    if (!map.current) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    dataCenters.forEach((dataCenter: DataCenter) => {
      const el = createMarkerElement(dataCenter);

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'bottom'
      })
        .setLngLat([dataCenter.longitude, dataCenter.latitude])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    if (!searchQuery) {
      markersRef.current.forEach(marker => {
        marker.getElement().style.display = 'block';
      });
      return;
    }

    const query = searchQuery.toLowerCase();
    markersRef.current.forEach((marker, index) => {
      const dataCenter = dataCenters[index];
      const matches = 
        dataCenter.name.toLowerCase().includes(query) ||
        dataCenter.description.toLowerCase().includes(query) ||
        dataCenter.provider.toLowerCase().includes(query);
      
      marker.getElement().style.display = matches ? 'block' : 'none';
    });
  }, [searchQuery]);

  const handle3DToggle = (newIs3D: boolean) => {
    setIs3D(newIs3D);
    if (map.current) {
      if (newIs3D) {
        map.current.easeTo({
          pitch: 60,
          bearing: -15,
          duration: 1000
        });
        if (map.current.getLayer('3d-buildings')) {
          map.current.setLayoutProperty('3d-buildings', 'visibility', 'visible');
        }
      } else {
        map.current.easeTo({
          pitch: 0,
          bearing: 0,
          duration: 1000
        });
        if (map.current.getLayer('3d-buildings')) {
          map.current.setLayoutProperty('3d-buildings', 'visibility', 'none');
        }
      }
    }
  };

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="absolute inset-0" />
      <MapControls onToggle3D={handle3DToggle} />
    </div>
  );
};

export default MapComponent;