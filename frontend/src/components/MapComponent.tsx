import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Server, Zap, Building2 } from 'lucide-react';
import { createRoot } from 'react-dom/client';
import DataCenterPopup from './DataCenterPopup';
import MapControls from './MapControls';
import { api } from '@/services/api';
import type { HeatCenter, DemandSite, MapMarker } from '@/types';

/**
 * Legacy interface maintained for backward compatibility with existing popup components
 * TODO: Refactor to use unified data types across the application
 */
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

/**
 * Main map component that renders an interactive map of San Francisco
 * showing heat centers and demand sites with 3D visualization capabilities
 */
const MapComponent = ({ searchQuery }: MapComponentProps) => {
  // Map instance and container references
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  
  // Component state management
  const [selectedDataCenter, setSelectedDataCenter] = useState<DataCenter | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [is3D, setIs3D] = useState(true);
  const [heatCenters, setHeatCenters] = useState<HeatCenter[]>([]);
  const [demandSites, setDemandSites] = useState<DemandSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // San Francisco geographical bounds for map constraints
  const SF_BOUNDS: maplibregl.LngLatBoundsLike = [
    [-122.55, 37.7], // Southwest corner
    [-121.9, 37.85]  // Northeast corner
  ];

  /**
   * Initialize the map when component mounts
   * Sets up the base map with San Francisco focus and 3D terrain
   */
  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize MapLibre GL map instance
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          // OpenStreetMap tiles for base map layer
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          },
          // Terrain data for 3D elevation effects
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
              // Subtle styling adjustments for better visual appeal
              'raster-contrast': 0.1,
              'raster-saturation': 0.8,
              'raster-brightness-min': 0.4,
              'raster-brightness-max': 1.0,
              'raster-hue-rotate': 5
            }
          }
        ],
        // Enable 3D terrain with moderate exaggeration
        terrain: {
          source: 'terrain',
          exaggeration: 1.2
        }
      },
      // Center on San Francisco with appropriate zoom level
      center: [-122.4194, 37.7749],
      zoom: 12,
      // 3D view settings - pitch and bearing for dramatic effect
      pitch: is3D ? 60 : 0,
      bearing: is3D ? -15 : 0,
      // Constrain map to San Francisco area
      maxBounds: SF_BOUNDS,
      maxZoom: 18,
      minZoom: 10
    });

    // Add navigation controls with compass and zoom buttons
    map.current.addControl(
      new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true,
      }),
      'top-right'
    );

    // Set up 3D buildings and additional map features once map loads
    map.current.on('load', () => {
      if (!map.current) return;

      // Add 3D building data source
      map.current.addSource('sf-buildings', {
        type: 'vector',
        url: 'https://api.maptiler.com/tiles/buildings-3d/tiles.json?key=demo'
      });

      // Base building layer with subtle styling
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
            12, 'hsl(210, 15%, 92%)', // Light gray at lower zoom
            16, 'hsl(210, 20%, 95%)'  // Slightly lighter at higher zoom
          ],
          'fill-opacity': 0.8
        }
      });

      // 3D building extrusions for depth and realism
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

      // Initial marker setup will be handled by the data loading effect
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  /**
   * Load heat centers and demand sites data from the backend API
   * Handles loading states and error management
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both data types concurrently for better performance
        const [heatCentersData, demandSitesData] = await Promise.all([
          api.heatCenters.getAll(),
          api.demandSites.getAll()
        ]);
        
        setHeatCenters(heatCentersData);
        setDemandSites(demandSitesData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data from backend');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /**
   * Add markers to the map once data is loaded and map is ready
   * This effect runs whenever the data changes or loading state updates
   */
  useEffect(() => {
    if (!loading && !error && map.current) {
      addAllMarkers();
    }
  }, [heatCenters, demandSites, loading, error]);

  /**
   * Creates a visually appealing heat center marker with liquid glass effect
   * Features hover animations, status indicators, and click handlers
   * @param heatCenter - The heat center data to create a marker for
   * @returns HTML element for the marker
   */
  const createHeatCenterMarkerElement = (heatCenter: HeatCenter) => {
    const el = document.createElement('div');
    el.className = 'cursor-pointer transform transition-all duration-500 hover:scale-110 hover:-translate-y-2 hover:rotate-1';
    
    // Complex HTML structure for liquid glass effect with multiple layers
    el.innerHTML = `
      <div class="relative group">
        <!-- Main liquid glass container with backdrop blur -->
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden border border-white/30 backdrop-blur-xl" 
             style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1)); 
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);">
          
          <!-- Multi-layer glass effects for depth -->
          <div class="absolute inset-[1px] bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-2xl"></div>
          <div class="absolute inset-[2px] bg-gradient-to-t from-white/5 to-white/15 rounded-2xl"></div>
          
          <!-- Top highlight for glass reflection -->
          <div class="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
          <div class="absolute top-1 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          
          <!-- Hover glow effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-red-400/20 to-orange-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          
          <!-- Inner heat glow for thematic consistency -->
          <div class="absolute inset-2 bg-gradient-to-br from-red-400/10 to-orange-600/5 rounded-xl opacity-60"></div>
          
          <!-- Zap icon representing heat/energy -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" 
               class="relative z-10 text-gray-700 group-hover:text-red-700 transition-all duration-300 group-hover:scale-110">
            <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
          </svg>
          
          <!-- Status indicator - green for active, red for inactive -->
          <div class="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white/50 backdrop-blur-sm animate-pulse"
               style="background: linear-gradient(135deg, ${heatCenter.is_active ? 'rgba(34, 197, 94, 0.9), rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.8)'});"></div>
        </div>
        
        <!-- Enhanced pointer with liquid glass effect -->
        <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 border border-white/40 backdrop-blur-sm"
             style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1));
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);"></div>
      </div>
    `;

    // Add click handler to show popup with marker details
    el.addEventListener('click', () => {
       const marker: MapMarker = {
         id: heatCenter.id,
         name: heatCenter.name,
         type: 'heat_center',
         latitude: heatCenter.location_lat,
         longitude: heatCenter.location_lng,
         status: heatCenter.is_active ? 'active' : 'inactive',
         data: heatCenter
       };
       setSelectedMarker(marker);
       showPopup(marker);
     });

    return el;
  };

  /**
   * Creates a demand site marker with building-themed styling
   * Similar structure to heat center markers but with different visual theme
   * @param demandSite - The demand site data to create a marker for
   * @returns HTML element for the marker
   */
  const createDemandSiteMarkerElement = (demandSite: DemandSite) => {
    const el = document.createElement('div');
    el.className = 'cursor-pointer transform transition-all duration-500 hover:scale-110 hover:-translate-y-2 hover:rotate-1';
    el.innerHTML = `
      <div class="relative group">
        <!-- Main liquid glass container -->
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden border border-white/30 backdrop-blur-xl" 
             style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1)); 
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);">
          
          <!-- Multi-layer glass effects -->
          <div class="absolute inset-[1px] bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-2xl"></div>
          <div class="absolute inset-[2px] bg-gradient-to-t from-white/5 to-white/15 rounded-2xl"></div>
          
          <!-- Top highlight -->
          <div class="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
          <div class="absolute top-1 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          
          <!-- Hover glow effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          
          <!-- Inner demand glow -->
          <div class="absolute inset-2 bg-gradient-to-br from-blue-400/10 to-cyan-600/5 rounded-xl opacity-60"></div>
          
          <!-- Building icon for demand site -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" 
               class="relative z-10 text-gray-700 group-hover:text-blue-700 transition-all duration-300 group-hover:scale-110">
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
            <path d="M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2"/>
            <path d="M10 6h4"/>
            <path d="M10 10h4"/>
            <path d="M10 14h4"/>
            <path d="M10 18h4"/>
          </svg>
          
          <!-- Status indicator -->
          <div class="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white/50 backdrop-blur-sm animate-pulse"
               style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.8));"></div>
        </div>
        
        <!-- Enhanced pointer with liquid glass -->
        <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 border border-white/40 backdrop-blur-sm"
             style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1));
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);"></div>
      </div>
    `;

    el.addEventListener('click', () => {
       const marker: MapMarker = {
         id: demandSite.id,
         name: demandSite.name,
         type: 'demand_site',
         latitude: demandSite.location_lat,
         longitude: demandSite.location_lng,
         status: demandSite.is_connected ? 'connected' : 'disconnected',
         data: demandSite
       };
       setSelectedMarker(marker);
       showPopup(marker);
     });

    return el;
  };

  const addAllMarkers = () => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add heat center markers
     heatCenters.forEach((heatCenter: HeatCenter) => {
       const el = createHeatCenterMarkerElement(heatCenter);
       const marker = new maplibregl.Marker({
         element: el,
         anchor: 'bottom'
       })
         .setLngLat([heatCenter.location_lng, heatCenter.location_lat])
         .addTo(map.current!);

       markersRef.current.push(marker);
     });

     // Add demand site markers
     demandSites.forEach((demandSite: DemandSite) => {
       const el = createDemandSiteMarkerElement(demandSite);
       const marker = new maplibregl.Marker({
         element: el,
         anchor: 'bottom'
       })
         .setLngLat([demandSite.location_lng, demandSite.location_lat])
         .addTo(map.current!);

       markersRef.current.push(marker);
     });
  };

  const showPopup = (marker: MapMarker) => {
    if (!map.current) return;

    if (popupRef.current) {
      popupRef.current.remove();
    }

    const popupEl = document.createElement('div');
    const root = createRoot(popupEl);
    
    root.render(
      <DataCenterPopup
        marker={marker}
        onClose={() => {
          if (popupRef.current) {
            popupRef.current.remove();
            popupRef.current = null;
          }
          setSelectedMarker(null);
        }}
      />
    );

    // Calculate smart positioning to prevent overflow
    const markerPoint = map.current.project([marker.data.location_lng, marker.data.location_lat]);
    const mapContainer = map.current.getContainer();
    const containerWidth = mapContainer.offsetWidth;
    const containerHeight = mapContainer.offsetHeight;
    
    // Determine best anchor position based on marker location
    let anchor: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'bottom';
    let offset: [number, number] = [0, -10];
    
    // Check if marker is in the top half of the screen
    if (markerPoint.y < containerHeight * 0.4) {
      // Check if marker is on the left or right side
      if (markerPoint.x < containerWidth * 0.3) {
        anchor = 'bottom-right';
        offset = [-10, -10];
      } else if (markerPoint.x > containerWidth * 0.7) {
        anchor = 'bottom-left';
        offset = [10, -10];
      } else {
        anchor = 'top';
        offset = [0, 10];
      }
    } else if (markerPoint.y > containerHeight * 0.6) {
      // Marker is in bottom half - use bottom anchor but check sides
      if (markerPoint.x < containerWidth * 0.3) {
        anchor = 'top-right';
        offset = [-10, 10];
      } else if (markerPoint.x > containerWidth * 0.7) {
        anchor = 'top-left';
        offset = [10, 10];
      } else {
        anchor = 'bottom';
        offset = [0, -10];
      }
    } else {
      // Marker is in middle vertically - check horizontal position
      if (markerPoint.x < containerWidth * 0.25) {
        anchor = 'left';
        offset = [10, 0];
      } else if (markerPoint.x > containerWidth * 0.75) {
        anchor = 'right';
        offset = [-10, 0];
      } else {
        anchor = 'bottom';
        offset = [0, -10];
      }
    }

    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: offset,
      className: 'data-center-popup',
      maxWidth: '90vw',
      anchor: anchor
    })
      .setLngLat([marker.data.location_lng, marker.data.location_lat])
      .setDOMContent(popupEl)
      .addTo(map.current);
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
      const allMarkers = [...heatCenters, ...demandSites];
      const markerData = allMarkers[index];
      const matches = 
        markerData?.name.toLowerCase().includes(query) || false;
      
      marker.getElement().style.display = matches ? 'block' : 'none';
    });
  }, [searchQuery, heatCenters, demandSites]);

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