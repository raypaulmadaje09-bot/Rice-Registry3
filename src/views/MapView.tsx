import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
if (typeof window !== 'undefined') {
  (window as any).L = L;
}
import 'leaflet.heat';
import { useApp } from '../context/AppContext';
import { BARANGAYS, matchBarangay } from '../data/barangays';
import { SILAGO_BARANGAY_BOUNDARIES, BarangayBoundary } from '../data/barangayBoundaries';
import { FarmParcel, Barangay } from '../types';
import {
  Search,
  Maximize2,
  Minimize2,
  Ruler,
  Compass,
  MapPin,
  X,
  ExternalLink,
  Wheat,
  CheckCircle2,
  Sparkles,
  Flame,
  Layers,
  Layers2,
  Sliders,
  BarChart3,
  Info,
  ChevronDown,
  ChevronUp,
  Activity,
  Users,
  Scale,
  ShieldCheck,
  Zap,
  PenTool,
  RotateCcw,
  Check,
  Copy,
  FileSpreadsheet,
  FileText,
  Share2,
  TrendingUp,
  Droplets,
  Sun,
  Eye,
  Crosshair,
  Mountain,
  Map as MapIcon,
  ListFilter,
  Navigation,
  ArrowRight,
  Filter,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  AlertTriangle,
  Building2
} from 'lucide-react';

interface MapViewProps {
  onSelectParcel: (parcel: FarmParcel) => void;
  onOpenAddParcelWithCoords?: (coords: { lat: number; lng: number }) => void;
  focusBarangay?: Barangay | null;
}

export type MapDisplayMode = 'markers' | 'heatmap' | 'hybrid';
export type HeatMetric = 'area' | 'farmers' | 'yield';
export type BaseLayerType = 'satellite' | 'osm' | 'topo' | 'dark' | 'voyager';

const TILE_PROVIDERS: Record<
  BaseLayerType,
  {
    name: string;
    label: string;
    tagline: string;
    url: string;
    attribution: string;
    icon: string;
  }
> = {
  satellite: {
    name: 'Satellite',
    label: 'Satellite Imagery',
    tagline: 'High-res aerial imagery (Esri World Imagery)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and GIS User Community',
    icon: '🛰️'
  },
  osm: {
    name: 'Standard OSM',
    label: 'Standard OpenStreetMap',
    tagline: 'Standard road networks, settlements & borders',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    icon: '🗺️'
  },
  topo: {
    name: 'Topographic',
    label: 'Topographic (Elevation)',
    tagline: 'Terrain slopes, elevation contours & watersheds (Esri Topo)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
    icon: '⛰️'
  },
  dark: {
    name: 'Dark GIS',
    label: 'Dark Matter GIS',
    tagline: 'High-contrast nocturnal cartography (CartoDB)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap',
    icon: '🌙'
  },
  voyager: {
    name: 'Voyager',
    label: 'CartoDB Voyager',
    tagline: 'Clean cartographic presentation basemap',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap',
    icon: '🧭'
  }
};

// Strategic municipal agricultural landmarks in Silago
const MUNICIPAL_FACILITIES = [
  {
    name: 'Grain Dryer & Silos',
    type: 'facility',
    lat: 10.5512,
    lng: 125.1745,
    desc: 'LGU Central Mechanical Grain Dryer & Palay Silos'
  },
  {
    name: 'Rice Demo Farm',
    type: 'demofarm',
    lat: 10.5415,
    lng: 125.1762,
    desc: 'SLSU - Silago Agro-Ecological Rice Research & Extension Demo Field'
  },
  {
    name: 'MAO Headquarters',
    type: 'office',
    lat: 10.5312,
    lng: 125.1748,
    desc: 'Silago Municipal Agriculture Office (MAO) Headquarters'
  },
  {
    name: 'Seed Cold Depot',
    type: 'depot',
    lat: 10.5235,
    lng: 125.1682,
    desc: 'DA RFO-8 Certified Palay Seed Cold Storage & Distribution Depot'
  },
  {
    name: 'NIA Irrigation Dam',
    type: 'dam',
    lat: 10.5182,
    lng: 125.1610,
    desc: 'NIA Communal Irrigation System (CIS) River Diversion Weir'
  }
];

const AGRICULTURAL_HEAT_GRADIENT = {
  0.15: '#0284c7',
  0.35: '#06b6d4',
  0.55: '#84cc16',
  0.75: '#eab308',
  0.90: '#f97316',
  1.00: '#dc2626'
};

function getHeatmapRadiusAndBlur(zoom: number): { radius: number; blur: number } {
  if (zoom <= 11) return { radius: 36, blur: 24 };
  if (zoom === 12) return { radius: 30, blur: 20 };
  if (zoom === 13) return { radius: 24, blur: 16 };
  if (zoom === 14) return { radius: 18, blur: 12 };
  if (zoom === 15) return { radius: 14, blur: 10 };
  return { radius: 11, blur: 8 };
}

/**
 * Spherical Geodesic Math Helpers
 */
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculatePolygonAreaHectares(points: [number, number][]): { sqMeters: number; hectares: number } {
  if (points.length < 3) return { sqMeters: 0, hectares: 0 };
  const R = 6378137;
  let total = 0;
  const radPoints = points.map(([lat, lng]) => [lat * (Math.PI / 180), lng * (Math.PI / 180)]);
  const n = radPoints.length;
  for (let i = 0; i < n; i++) {
    const p1 = radPoints[i];
    const p2 = radPoints[(i + 1) % n];
    total += (p2[1] - p1[1]) * (2 + Math.sin(p1[0]) + Math.sin(p2[0]));
  }
  const sqMeters = Math.abs((total * R * R) / 2.0);
  const hectares = sqMeters / 10000;
  return { sqMeters, hectares };
}

function calculatePolygonCentroid(points: [number, number][]): { lat: number; lng: number } {
  if (points.length === 0) return { lat: 10.538, lng: 125.172 };
  let sumLat = 0;
  let sumLng = 0;
  points.forEach(([lat, lng]) => {
    sumLat += lat;
    sumLng += lng;
  });
  return {
    lat: sumLat / points.length,
    lng: sumLng / points.length
  };
}

/**
 * Coordinate sanitization and bounding box validation for Silago, Southern Leyte
 */
function sanitizeSilagoCoordinates(
  rawLat: number | undefined | null,
  rawLng: number | undefined | null,
  barangayName: string,
  tagNumber: string
): { lat: number; lng: number; isCorrected: boolean } {
  let lat = Number(rawLat);
  let lng = Number(rawLng);
  let isCorrected = false;

  if (lat > 100 && lng < 20 && lng > 0) {
    const tmp = lat;
    lat = lng;
    lng = tmp;
    isCorrected = true;
  }

  const isInSilago =
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= 10.32 &&
    lat <= 10.72 &&
    lng >= 125.02 &&
    lng <= 125.38;

  if (!isInSilago) {
    isCorrected = true;
    const matchedBrgy = BARANGAYS.find((b) => matchBarangay(barangayName, b.name));
    if (matchedBrgy) {
      let hash = 0;
      for (let i = 0; i < tagNumber.length; i++) {
        hash = (hash << 5) - hash + tagNumber.charCodeAt(i);
        hash |= 0;
      }
      const offsetLat = ((Math.abs(hash) % 100) - 50) * 0.0001;
      const offsetLng = (((Math.abs(hash * 7) >> 2) % 100) - 50) * 0.0001;
      lat = matchedBrgy.lat + offsetLat;
      lng = matchedBrgy.lng + offsetLng;
    } else {
      lat = 10.538;
      lng = 125.172;
    }
  }

  return { lat, lng, isCorrected };
}

export const MapView: React.FC<MapViewProps> = ({
  onSelectParcel,
  onOpenAddParcelWithCoords,
  focusBarangay
}) => {
  const { parcels } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Layers
  const boundariesGroupRef = useRef<L.LayerGroup | null>(null);
  const parcelsGroupRef = useRef<L.LayerGroup | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const labelsGroupRef = useRef<L.LayerGroup | null>(null);
  const facilitiesGroupRef = useRef<L.LayerGroup | null>(null);
  const measureGroupRef = useRef<L.LayerGroup | null>(null);
  const digitizerGroupRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<any>(null);
  const polygonLayersByTagRef = useRef<Map<string, L.Rectangle>>(new Map());
  const boundaryLayersByNameRef = useRef<Map<string, L.Polygon>>(new Map());

  // REQUIREMENT 1: Collapsible Split Screen State
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'split' | 'list' | 'map'>('split');
  const [activeCardTag, setActiveCardTag] = useState<string | null>(null);
  const [hoveredParcelTag, setHoveredParcelTag] = useState<string | null>(null);

  // View & Heatmap state
  const [mapDisplayMode, setMapDisplayMode] = useState<MapDisplayMode>('markers');
  const [heatMetric, setHeatMetric] = useState<HeatMetric>('area');
  const [currentZoom, setCurrentZoom] = useState<number>(13);
  const [isHudExpanded, setIsHudExpanded] = useState(false);

  // Floating Layer Control state
  const [isLayerControlOpen, setIsLayerControlOpen] = useState(false);
  const [activeBaseLayer, setActiveBaseLayer] = useState<BaseLayerType>('satellite');
  const [showParcelsLayer, setShowParcelsLayer] = useState(true);
  const [showBoundariesLayer, setShowBoundariesLayer] = useState(true);
  const [showBarangayLabels, setShowBarangayLabels] = useState(true);
  const [showFacilitiesLayer, setShowFacilitiesLayer] = useState(true);

  // Filters & Tools state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('ALL');
  const [selectedEcosystem, setSelectedEcosystem] = useState('ALL');
  const [selectedVariety, setSelectedVariety] = useState('ALL');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Interaction Tools State
  const [activeTool, setActiveTool] = useState<'none' | 'measure' | 'drop_pin' | 'draw_polygon'>('none');
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [digitizerPoints, setDigitizerPoints] = useState<[number, number][]>([]);
  const [selectedParcelForDrawer, setSelectedParcelForDrawer] = useState<FarmParcel | null>(null);
  const [isCopiedCoords, setIsCopiedCoords] = useState(false);

  // Available rice varieties in registry
  const uniqueVarieties = useMemo(() => {
    const set = new Set<string>();
    parcels.forEach((p) => {
      if (p.breed) set.add(p.breed.trim());
    });
    return Array.from(set).sort();
  }, [parcels]);

  // Filter parcels with sanitization
  const filteredParcels = useMemo(() => {
    return parcels.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        p.tagNumber.toLowerCase().includes(q) ||
        p.raiserName.toLowerCase().includes(q) ||
        p.breed.toLowerCase().includes(q) ||
        p.barangay.toLowerCase().includes(q) ||
        p.swineNameOrId.toLowerCase().includes(q);

      const matchesBrgy =
        selectedBarangay === 'ALL' ||
        p.barangay.toLowerCase() === selectedBarangay.toLowerCase() ||
        matchBarangay(p.barangay, selectedBarangay);

      const matchesEco =
        selectedEcosystem === 'ALL' ||
        (selectedEcosystem === 'IRRIGATED' && p.purpose.toLowerCase().includes('irrigated')) ||
        (selectedEcosystem === 'RAINFED' && p.purpose.toLowerCase().includes('rainfed')) ||
        (selectedEcosystem === 'HYBRID' && p.purpose.toLowerCase().includes('hybrid')) ||
        (selectedEcosystem === 'UPLAND' && p.purpose.toLowerCase().includes('upland'));

      const matchesVar =
        selectedVariety === 'ALL' ||
        p.breed.toLowerCase().includes(selectedVariety.toLowerCase());

      return matchesQuery && matchesBrgy && matchesEco && matchesVar;
    });
  }, [parcels, searchQuery, selectedBarangay, selectedEcosystem, selectedVariety]);

  // Summary analytics HUD calculation
  const analyticsSummary = useMemo(() => {
    const totalParcels = filteredParcels.length;
    const totalAreaHa = filteredParcels.reduce((sum, p) => sum + (p.weightKg || 0), 0);
    const uniqueFarmers = new Set(filteredParcels.map((p) => p.raiserName.trim().toUpperCase())).size;

    let irrigatedHa = 0;
    let rainfedHa = 0;
    let hybridHa = 0;
    let uplandHa = 0;
    let totalEstimatedYieldMt = 0;

    const varietyCounts: Record<string, number> = {};

    filteredParcels.forEach((p) => {
      const area = p.weightKg || 1.0;
      const eco = p.purpose.toLowerCase();
      if (eco.includes('irrigated')) {
        irrigatedHa += area;
        totalEstimatedYieldMt += p.targetYieldMt || area * 4.8;
      } else if (eco.includes('hybrid')) {
        hybridHa += area;
        totalEstimatedYieldMt += p.targetYieldMt || area * 6.0;
      } else if (eco.includes('upland')) {
        uplandHa += area;
        totalEstimatedYieldMt += p.targetYieldMt || area * 2.8;
      } else {
        rainfedHa += area;
        totalEstimatedYieldMt += p.targetYieldMt || area * 3.4;
      }

      if (p.breed) {
        const v = p.breed.split('(')[0].trim();
        varietyCounts[v] = (varietyCounts[v] || 0) + 1;
      }
    });

    let topVariety = 'NSIC Rc 222';
    let maxCount = 0;
    Object.entries(varietyCounts).forEach(([v, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topVariety = v;
      }
    });

    const irrigatedPct = totalAreaHa > 0 ? Math.round((irrigatedHa / totalAreaHa) * 100) : 0;
    const rainfedPct = totalAreaHa > 0 ? Math.round((rainfedHa / totalAreaHa) * 100) : 0;
    const hybridPct = totalAreaHa > 0 ? Math.round((hybridHa / totalAreaHa) * 100) : 0;
    const uplandPct = totalAreaHa > 0 ? 100 - (irrigatedPct + rainfedPct + hybridPct) : 0;

    return {
      totalParcels,
      totalAreaHa: Number(totalAreaHa.toFixed(2)),
      uniqueFarmers,
      irrigatedHa: Number(irrigatedHa.toFixed(2)),
      rainfedHa: Number(rainfedHa.toFixed(2)),
      hybridHa: Number(hybridHa.toFixed(2)),
      uplandHa: Number(uplandHa.toFixed(2)),
      irrigatedPct,
      rainfedPct,
      hybridPct,
      uplandPct: Math.max(0, uplandPct),
      totalEstimatedYieldMt: Number(totalEstimatedYieldMt.toFixed(1)),
      topVariety
    };
  }, [filteredParcels]);

  // Invalidate map size when collapsing/expanding split panel or fullscreen
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 320);
    return () => clearTimeout(timer);
  }, [isLeftPanelCollapsed, isFullscreen, mobileTab]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = focusBarangay ? focusBarangay.lat : 10.538;
    const initialLng = focusBarangay ? focusBarangay.lng : 125.172;
    const initialZoom = 13;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

    const tileLayer = L.tileLayer(TILE_PROVIDERS[activeBaseLayer].url, {
      attribution: TILE_PROVIDERS[activeBaseLayer].attribution,
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Layer groups in specific z-index stacking order
    const boundariesGroup = L.layerGroup().addTo(map);
    const parcelsGroup = L.layerGroup().addTo(map);
    const labelsGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);
    const facilitiesGroup = L.layerGroup().addTo(map);
    const measureGroup = L.layerGroup().addTo(map);
    const digitizerGroup = L.layerGroup().addTo(map);

    boundariesGroupRef.current = boundariesGroup;
    parcelsGroupRef.current = parcelsGroup;
    labelsGroupRef.current = labelsGroup;
    markersGroupRef.current = markersGroup;
    facilitiesGroupRef.current = facilitiesGroup;
    measureGroupRef.current = measureGroup;
    digitizerGroupRef.current = digitizerGroup;
    mapInstanceRef.current = map;

    map.on('zoomend', () => {
      const z = map.getZoom();
      setCurrentZoom(z);
      if (heatLayerRef.current) {
        const { radius, blur } = getHeatmapRadiusAndBlur(z);
        heatLayerRef.current.setOptions({ radius, blur });
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Map click handler for active tools
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (activeTool === 'measure') {
        setMeasurePoints((prev) => [...prev, [lat, lng]]);
      } else if (activeTool === 'draw_polygon') {
        setDigitizerPoints((prev) => [...prev, [lat, lng]]);
      } else if (activeTool === 'drop_pin') {
        if (onOpenAddParcelWithCoords) {
          onOpenAddParcelWithCoords({
            lat: Number(lat.toFixed(7)),
            lng: Number(lng.toFixed(7))
          });
        }
        setActiveTool('none');
      }
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [activeTool, onOpenAddParcelWithCoords]);

  // Handle Tile Provider change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newTile = L.tileLayer(TILE_PROVIDERS[activeBaseLayer].url, {
      attribution: TILE_PROVIDERS[activeBaseLayer].attribution,
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = newTile;
  }, [activeBaseLayer]);

  // Focus on barangay if passed
  useEffect(() => {
    if (focusBarangay && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([focusBarangay.lat, focusBarangay.lng], 15, {
        duration: 1.2
      });
      setSelectedBarangay(focusBarangay.name);
    }
  }, [focusBarangay]);

  // REQUIREMENT 2: DISTINCT BARANGAY ADMINISTRATIVE BOUNDARIES WITH UNIQUE COLORS
  useEffect(() => {
    const group = boundariesGroupRef.current;
    const labelsGroup = labelsGroupRef.current;
    if (!group || !labelsGroup) return;

    group.clearLayers();
    labelsGroup.clearLayers();
    boundaryLayersByNameRef.current.clear();

    if (!showBoundariesLayer) return;

    SILAGO_BARANGAY_BOUNDARIES.forEach((brgy) => {
      const isSelected =
        selectedBarangay !== 'ALL' &&
        (brgy.name.toLowerCase() === selectedBarangay.toLowerCase() ||
          brgy.aliases.some((a) => a.toLowerCase() === selectedBarangay.toLowerCase()));

      const polygon = L.polygon(brgy.polygon, {
        color: isSelected ? '#2563eb' : brgy.color,
        weight: isSelected ? 4 : 2,
        opacity: isSelected ? 1 : 0.9,
        fillColor: brgy.fillColor,
        fillOpacity: isSelected ? 0.32 : 0.22,
        dashArray: undefined
      }).addTo(group);

      boundaryLayersByNameRef.current.set(brgy.name, polygon);

      // Boundary hover and click behaviors with glowing stroke
      polygon.on('mouseover', () => {
        polygon.setStyle({
          weight: 4,
          color: '#2563eb',
          fillOpacity: 0.35,
          opacity: 1
        });
      });

      polygon.on('mouseout', () => {
        if (!isSelected) {
          polygon.setStyle({
            weight: 2,
            color: brgy.color,
            fillOpacity: 0.22,
            opacity: 0.9
          });
        }
      });

      polygon.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedBarangay(brgy.name);
        mapInstanceRef.current?.flyTo([brgy.center[0], brgy.center[1]], 15, { duration: 1.0 });
      });

      polygon.bindTooltip(
        `<div style="font-family: sans-serif; font-size: 11px; padding: 4px;">
          <div style="font-weight: 900; color: ${brgy.color}; font-size: 12px;">🏛️ Brgy. ${brgy.name} (${brgy.zone})</div>
          <div style="color: #334155; font-size: 10px; margin-top: 1px;">${brgy.terrainType}</div>
          <div style="font-weight: 700; color: #0f172a; margin-top: 2px;">Municipal Territory: <strong>${brgy.areaHa} ha</strong></div>
        </div>`,
        { sticky: true }
      );

      // Centered Barangay Name Badge inside Territory
      if (showBarangayLabels) {
        const brgyLabelIcon = L.divIcon({
          className: 'custom-brgy-boundary-badge',
          html: `
            <div style="
              background: #ffffff;
              color: #0f172a;
              font-size: 10.5px;
              font-weight: 800;
              padding: 3px 9px;
              border-radius: 9999px;
              border: 2px solid ${isSelected ? '#2563eb' : brgy.color};
              box-shadow: 0 4px 10px rgba(0,0,0,0.18);
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 5px;
              cursor: pointer;
              transform: translate(-50%, -50%);
              transition: all 0.15s ease;
            ">
              <span style="width: 8px; height: 8px; border-radius: 9999px; background: ${brgy.color};"></span>
              <span style="font-weight: 900; color: #1e3a8a;">${brgy.name}</span>
              <span style="color: #475569; font-size: 9.5px; font-family: monospace; font-weight: 700;">${brgy.areaHa}ha</span>
            </div>
          `,
          iconSize: [140, 24],
          iconAnchor: [70, 12]
        });

        const labelMarker = L.marker([brgy.center[0], brgy.center[1]], { icon: brgyLabelIcon }).addTo(labelsGroup);
        labelMarker.on('click', () => {
          setSelectedBarangay(brgy.name);
          mapInstanceRef.current?.flyTo([brgy.center[0], brgy.center[1]], 15, { duration: 1.0 });
        });
      }
    });
  }, [showBoundariesLayer, showBarangayLabels, selectedBarangay]);

  // Generate weighted GIS Heatmap data points
  const heatPointsData = useMemo(() => {
    if (filteredParcels.length === 0) return [];

    let maxMetricVal = 1;
    filteredParcels.forEach((p) => {
      let val = 1;
      if (heatMetric === 'area') {
        val = p.weightKg || 1.0;
      } else if (heatMetric === 'yield') {
        val = p.targetYieldMt || (p.weightKg || 1.0) * 4.2;
      } else {
        val = 1.0;
      }
      if (val > maxMetricVal) maxMetricVal = val;
    });

    const points: [number, number, number][] = [];

    filteredParcels.forEach((parcel) => {
      const { lat, lng } = sanitizeSilagoCoordinates(
        parcel.lat,
        parcel.lng,
        parcel.barangay,
        parcel.tagNumber
      );

      let metricVal = 1.0;
      if (heatMetric === 'area') {
        metricVal = parcel.weightKg || 1.0;
      } else if (heatMetric === 'yield') {
        metricVal = parcel.targetYieldMt || (parcel.weightKg || 1.0) * 4.2;
      } else {
        metricVal = 1.0;
      }

      const intensity = Math.max(0.25, Math.min(1.0, metricVal / maxMetricVal));
      points.push([lat, lng, intensity]);

      const areaHa = parcel.weightKg || 1.0;
      if (areaHa >= 0.8) {
        const delta = 0.00045 * Math.sqrt(areaHa);
        const subIntensity = intensity * 0.45;
        points.push([lat + delta * 0.7, lng + delta * 0.8, subIntensity]);
        points.push([lat - delta * 0.7, lng - delta * 0.8, subIntensity]);
        points.push([lat + delta * 0.7, lng - delta * 0.8, subIntensity]);
        points.push([lat - delta * 0.7, lng + delta * 0.8, subIntensity]);
      }
    });

    return points;
  }, [filteredParcels, heatMetric]);

  // Heatmap Layer Lifecycle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const isHeatActive = mapDisplayMode === 'heatmap' || mapDisplayMode === 'hybrid';

    if (!isHeatActive) {
      if (heatLayerRef.current && map.hasLayer(heatLayerRef.current)) {
        map.removeLayer(heatLayerRef.current);
      }
      return;
    }

    const { radius, blur } = getHeatmapRadiusAndBlur(map.getZoom() || 13);

    if (!heatLayerRef.current) {
      if ((L as any).heatLayer) {
        const layer = (L as any).heatLayer(heatPointsData, {
          radius,
          blur,
          maxZoom: 18,
          max: 1.0,
          gradient: AGRICULTURAL_HEAT_GRADIENT,
          minOpacity: mapDisplayMode === 'hybrid' ? 0.38 : 0.52
        });
        layer.addTo(map);
        heatLayerRef.current = layer;
      }
    } else {
      heatLayerRef.current.setLatLngs(heatPointsData);
      heatLayerRef.current.setOptions({
        radius,
        blur,
        maxZoom: 18,
        max: 1.0,
        gradient: AGRICULTURAL_HEAT_GRADIENT,
        minOpacity: mapDisplayMode === 'hybrid' ? 0.38 : 0.52
      });
      if (!map.hasLayer(heatLayerRef.current)) {
        heatLayerRef.current.addTo(map);
      }
    }
  }, [heatPointsData, mapDisplayMode, heatMetric]);

  // Facilities Landmarks (Government & Research)
  useEffect(() => {
    const group = facilitiesGroupRef.current;
    if (!group) return;
    group.clearLayers();

    if (!showFacilitiesLayer) return;

    MUNICIPAL_FACILITIES.forEach((fac) => {
      const facIcon = L.divIcon({
        className: 'custom-facility-badge-wrapper',
        html: `
          <div style="
            background: #ffffff;
            color: #1e3a8a;
            font-size: 10px;
            font-weight: 800;
            padding: 3px 8px;
            border-radius: 8px;
            border: 1.5px solid #2563eb;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
          ">
            <span>🏛️</span>
            <span style="font-weight: 900;">${fac.name}</span>
          </div>
        `,
        iconSize: [120, 24],
        iconAnchor: [60, 12]
      });

      const marker = L.marker([fac.lat, fac.lng], { icon: facIcon }).addTo(group);
      marker.bindTooltip(`<strong>${fac.name}</strong><br/>${fac.desc}`, { sticky: true });
    });
  }, [showFacilitiesLayer]);

  // Function to smoothly select and pan to parcel from card click
  const handleSelectParcelFromList = useCallback((parcel: FarmParcel) => {
    setActiveCardTag(parcel.tagNumber);
    setSelectedParcelForDrawer(parcel);

    const { lat, lng } = sanitizeSilagoCoordinates(
      parcel.lat,
      parcel.lng,
      parcel.barangay,
      parcel.tagNumber
    );

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 16, {
        duration: 1.0,
        easeLinearity: 0.25
      });
    }
  }, []);

  // Function to handle map marker/polygon click: sync to left list
  const handleSelectParcelFromMap = useCallback((parcel: FarmParcel) => {
    setActiveCardTag(parcel.tagNumber);
    setSelectedParcelForDrawer(parcel);

    // Auto-scroll left list container to target card if panel is open
    if (!isLeftPanelCollapsed) {
      const cardElement = document.getElementById(`farmer-card-${parcel.tagNumber}`);
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isLeftPanelCollapsed]);

  // REQUIREMENT 3: CUSTOM GPS LOCATION PINPOINT & RICE POLYGONS
  useEffect(() => {
    const group = parcelsGroupRef.current;
    const markersGroup = markersGroupRef.current;
    if (!group || !markersGroup) return;

    group.clearLayers();
    markersGroup.clearLayers();
    polygonLayersByTagRef.current.clear();

    if (!showParcelsLayer) return;

    const isPureHeatmap = mapDisplayMode === 'heatmap';
    if (isPureHeatmap) return;

    filteredParcels.forEach((parcel) => {
      const eco = parcel.purpose.toLowerCase();
      const isIrrigated = eco.includes('irrigated');
      const isHybridCrop = eco.includes('hybrid');
      const isUpland = eco.includes('upland');
      const isSelected = activeCardTag === parcel.tagNumber || selectedParcelForDrawer?.tagNumber === parcel.tagNumber;
      const isHovered = hoveredParcelTag === parcel.tagNumber;
      const isDamageAlert = (parcel.healthStatus || '').toLowerCase().includes('damaged') || (parcel.healthStatus || '').toLowerCase().includes('pest');

      const { lat, lng } = sanitizeSilagoCoordinates(
        parcel.lat,
        parcel.lng,
        parcel.barangay,
        parcel.tagNumber
      );

      const strokeColor = isHybridCrop
        ? '#8b5cf6'
        : isIrrigated
        ? '#2563eb'
        : isUpland
        ? '#0284c7'
        : '#d97706';

      const fillColor = isHybridCrop
        ? '#7c3aed'
        : isIrrigated
        ? '#1d4ed8'
        : isUpland
        ? '#0284c7'
        : '#d97706';

      const delta = 0.00060 * Math.sqrt(parcel.weightKg || 1.2);
      const bounds: [[number, number], [number, number]] = [
        [lat - delta, lng - delta * 1.3],
        [lat + delta, lng + delta * 1.3]
      ];

      // Georeferenced Surveyed Lot Polygon
      const polygon = L.rectangle(bounds, {
        color: isSelected ? '#2563eb' : isHovered ? '#f59e0b' : strokeColor,
        weight: isSelected ? 4 : isHovered ? 3.5 : 2,
        fillColor: isSelected ? '#3b82f6' : isHovered ? '#fbbf24' : fillColor,
        fillOpacity: isSelected ? 0.65 : isHovered ? 0.50 : 0.30,
        dashArray: isSelected ? undefined : isIrrigated ? undefined : '5, 4'
      }).addTo(group);

      polygonLayersByTagRef.current.set(parcel.tagNumber, polygon);

      polygon.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        handleSelectParcelFromMap(parcel);
      });

      // EXACT REQUIREMENT 3: CUSTOM GPS LOCATION PINPOINT DIVICON
      const badgeIcon = isDamageAlert ? '⚠️' : isHybridCrop ? '✨' : '🌾';
      const firstName = parcel.raiserName.split(' ')[0] || parcel.tagNumber;

      const gpsPinHtml = `
        <div class="custom-gps-pin-container ${isSelected ? 'is-selected' : ''} ${isHovered ? 'is-hovered' : ''}">
          <!-- Glowing Concentric Target / Radar Pulse Rings -->
          <div class="gps-radar-wrapper">
            <div class="gps-radar-ring ring-1"></div>
            <div class="gps-radar-ring ring-2"></div>
            <div class="gps-radar-ring ring-3"></div>
            <div class="gps-radar-center-dot"></div>
          </div>

          <!-- Teardrop Location Pin with Hollow Circular Cutout & Facet Shading -->
          <div class="gps-pin-icon-body">
            <svg viewBox="0 0 32 44" width="30" height="42" style="display: block; overflow: visible;">
              <defs>
                <radialGradient id="gpsGrad-${parcel.tagNumber}" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stop-color="#ff5252" />
                  <stop offset="60%" stop-color="${isSelected ? '#2563eb' : '#dc2626'}" />
                  <stop offset="100%" stop-color="${isSelected ? '#1e40af' : '#991b1b'}" />
                </radialGradient>
              </defs>
              <!-- Teardrop shape -->
              <path d="M16 0 C7.16 0 0 7.16 0 16 C0 28 16 42 16 42 C16 42 32 28 32 16 C32 7.16 24.84 0 16 0 Z" 
                    fill="url(#gpsGrad-${parcel.tagNumber})" 
                    stroke="#ffffff" 
                    stroke-width="1.8" />
              <!-- Hollow white circular cutout in the center -->
              <circle cx="16" cy="15" r="6" fill="#ffffff" stroke="rgba(0,0,0,0.15)" stroke-width="0.8" />
              <!-- Inner center core -->
              <circle cx="16" cy="15" r="2.8" fill="${isSelected ? '#2563eb' : '#dc2626'}" />
            </svg>
            
            <!-- Complementary Crop / Alert Badge on upper right -->
            <div style="
              position: absolute;
              top: -4px;
              right: -5px;
              background: #ffffff;
              border: 1.5px solid ${isDamageAlert ? '#e11d48' : '#2563eb'};
              border-radius: 9999px;
              width: 17px;
              height: 17px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            ">
              ${badgeIcon}
            </div>
          </div>

          <!-- Centroid Identification Pill -->
          <div class="gps-pin-pill-label">
            <span>${firstName}</span>
            <span style="color: #60a5fa; font-family: monospace;">${(parcel.weightKg || 1.0).toFixed(1)}ha</span>
          </div>
        </div>
      `;

      const gpsMarkerIcon = L.divIcon({
        className: 'custom-gps-pin-marker',
        html: gpsPinHtml,
        iconSize: [36, 48],
        iconAnchor: [18, 44]
      });

      const pinMarker = L.marker([lat, lng], { icon: gpsMarkerIcon, zIndexOffset: isSelected ? 1000 : 100 }).addTo(markersGroup);

      pinMarker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        handleSelectParcelFromMap(parcel);
      });

      pinMarker.bindTooltip(
        `<div style="font-size: 11px; padding: 4px; font-family: sans-serif;">
          <div style="font-weight: 900; color: #2563eb; font-size: 12px;">${parcel.tagNumber}</div>
          <div style="font-weight: 800; color: #0f172a; margin-top: 1px;">${parcel.raiserName}</div>
          <div style="color: #475569; font-size: 10.5px;">📍 Brgy. ${parcel.barangay} &bull; <strong>${parcel.weightKg} ha</strong></div>
          <div style="font-size: 10px; color: #16a34a; font-weight: 700; margin-top: 2px;">🌾 ${parcel.breed}</div>
        </div>`,
        { sticky: true }
      );
    });
  }, [filteredParcels, activeCardTag, selectedParcelForDrawer, hoveredParcelTag, mapDisplayMode, showParcelsLayer, handleSelectParcelFromMap]);

  // Measurement Tool Visualization
  useEffect(() => {
    const group = measureGroupRef.current;
    if (!group) return;
    group.clearLayers();

    if (measurePoints.length > 1) {
      L.polyline(measurePoints, {
        color: '#2563eb',
        weight: 3.5,
        dashArray: '6, 6'
      }).addTo(group);
    }

    measurePoints.forEach((pt, i) => {
      let label = `Pt ${i + 1}`;
      if (i > 0) {
        const prev = measurePoints[i - 1];
        const distM = calculateDistanceMeters(prev[0], prev[1], pt[0], pt[1]);
        label += ` (+${distM > 1000 ? (distM / 1000).toFixed(2) + 'km' : Math.round(distM) + 'm'})`;
      }

      L.circleMarker(pt, {
        radius: 6,
        color: '#1d4ed8',
        fillColor: '#ffffff',
        fillOpacity: 1,
        weight: 2
      })
        .bindTooltip(label, { permanent: true, direction: 'top', className: 'no-scrollbar' })
        .addTo(group);
    });
  }, [measurePoints]);

  // Field Digitizer (Draw Polygon) Tool Visualization
  useEffect(() => {
    const group = digitizerGroupRef.current;
    if (!group) return;
    group.clearLayers();

    if (digitizerPoints.length >= 2) {
      L.polyline(digitizerPoints, {
        color: '#2563eb',
        weight: 3,
        dashArray: '4, 4'
      }).addTo(group);
    }

    if (digitizerPoints.length >= 3) {
      L.polygon(digitizerPoints, {
        color: '#1d4ed8',
        weight: 2.5,
        fillColor: '#3b82f6',
        fillOpacity: 0.35
      }).addTo(group);
    }

    digitizerPoints.forEach((pt, i) => {
      L.circleMarker(pt, {
        radius: 6,
        color: '#2563eb',
        fillColor: '#ffffff',
        fillOpacity: 1,
        weight: 2
      })
        .bindTooltip(`V${i + 1}`, { permanent: true, direction: 'right' })
        .addTo(group);
    });
  }, [digitizerPoints]);

  const drawnAreaMetrics = useMemo(() => {
    return calculatePolygonAreaHectares(digitizerPoints);
  }, [digitizerPoints]);

  const totalMeasuredDistanceMeters = useMemo(() => {
    if (measurePoints.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < measurePoints.length - 1; i++) {
      total += calculateDistanceMeters(
        measurePoints[i][0],
        measurePoints[i][1],
        measurePoints[i + 1][0],
        measurePoints[i + 1][1]
      );
    }
    return total;
  }, [measurePoints]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleCopyCoordinates = (lat: number, lng: number) => {
    const text = `${lat.toFixed(7)}, ${lng.toFixed(7)}`;
    navigator.clipboard.writeText(text);
    setIsCopiedCoords(true);
    setTimeout(() => setIsCopiedCoords(false), 2000);
  };

  const handleFinishDrawnPolygon = () => {
    if (digitizerPoints.length < 3) return;
    const centroid = calculatePolygonCentroid(digitizerPoints);
    if (onOpenAddParcelWithCoords) {
      onOpenAddParcelWithCoords({
        lat: Number(centroid.lat.toFixed(7)),
        lng: Number(centroid.lng.toFixed(7))
      });
    }
    setDigitizerPoints([]);
    setActiveTool('none');
  };

  // Helper for status badge color
  const getStatusBadge = (healthStatus: string | undefined) => {
    const status = (healthStatus || 'Standing Crop').toLowerCase();
    if (status.includes('harvest') || status.includes('ready')) {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Ready for Harvest'
      };
    }
    if (status.includes('damaged') || status.includes('pest') || status.includes('fail')) {
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        dot: 'bg-rose-500',
        label: 'Inspection Needed'
      };
    }
    if (status.includes('fallow') || status.includes('land prep')) {
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-500',
        label: 'Land Preparation'
      };
    }
    return {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Healthy Standing Crop'
    };
  };

  return (
    <div
      className={`space-y-3 ${
        isFullscreen
          ? 'fixed inset-0 z-50 p-3 bg-slate-900 overflow-hidden flex flex-col h-screen'
          : 'relative'
      }`}
    >
      {/* MOBILE RESPONSIVE SEGMENTED VIEW SWITCHER */}
      <div className="flex lg:hidden items-center justify-between bg-white border border-slate-200 rounded-2xl p-2 text-slate-800 shadow-xs">
        <span className="text-xs font-bold pl-2 flex items-center gap-1.5 text-slate-800">
          <Wheat className="w-4 h-4 text-blue-600" />
          <span>Rice Farm GIS</span>
        </span>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMobileTab('split')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              mobileTab === 'split' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Split View
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              mobileTab === 'list' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            List ({filteredParcels.length})
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              mobileTab === 'map' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Interactive Map
          </button>
        </div>
      </div>

      {/* MAIN COLLAPSIBLE SPLIT SCREEN CONTAINER */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* REQUIREMENT 4: CRISP BLUE & WHITE THEMED LEFT PANEL (COLLAPSIBLE) */}
        <div
          className={`transition-all duration-300 ease-in-out flex flex-col space-y-3 bg-slate-50 border border-slate-200/90 rounded-3xl p-3 sm:p-4 shadow-sm ${
            isLeftPanelCollapsed
              ? 'hidden'
              : 'lg:col-span-5 xl:col-span-5 2xl:col-span-5 flex'
          } ${mobileTab === 'map' ? 'hidden lg:flex' : 'flex'}`}
        >
          {/* 1. TOP HEADER & SEARCH BAR WITH ROYAL BLUE ACCENTS */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-2.5 text-slate-800">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <Wheat className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                    Farmer Landholdings Directory
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    {filteredParcels.length} georeferenced lots matching
                  </span>
                </div>
              </div>

              {/* Quick collapse button inside left panel header */}
              <button
                type="button"
                onClick={() => setIsLeftPanelCollapsed(true)}
                className="hidden lg:flex p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                title="Hide farmer list panel to expand map full width"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input with quick clear */}
            <div className="relative">
              <Search className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search RSBSA, farmer name, variety, barangay..."
                className="w-full pl-10 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <select
                value={selectedBarangay}
                onChange={(e) => {
                  setSelectedBarangay(e.target.value);
                  if (e.target.value !== 'ALL') {
                    const b = BARANGAYS.find((x) => x.name.toLowerCase() === e.target.value.toLowerCase());
                    if (b && mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo([b.lat, b.lng], 15, { duration: 1.2 });
                    }
                  }
                }}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer text-xs shadow-2xs"
              >
                <option value="ALL">📍 All Barangays</option>
                {BARANGAYS.map((b) => (
                  <option key={b.name} value={b.name}>
                    Brgy. {b.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedEcosystem}
                onChange={(e) => setSelectedEcosystem(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer text-xs shadow-2xs"
              >
                <option value="ALL">💧 All Ecosystems</option>
                <option value="IRRIGATED">🟢 Irrigated (NIA)</option>
                <option value="RAINFED">🟡 Rainfed Lowland</option>
                <option value="HYBRID">🟣 Hybrid Seed Field</option>
                <option value="UPLAND">🔵 Upland</option>
              </select>

              <select
                value={selectedVariety}
                onChange={(e) => setSelectedVariety(e.target.value)}
                className="col-span-2 sm:col-span-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer text-xs shadow-2xs"
              >
                <option value="ALL">🌾 All Varieties</option>
                {uniqueVarieties.map((v) => (
                  <option key={v} value={v}>
                    {v.split('(')[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. REQUIREMENT 4: SLEEK ROYAL BLUE GRADIENT SUMMARY BANNER */}
          <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white rounded-2xl p-3.5 shadow-md border border-blue-800/30">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/10 backdrop-blur-xs p-2 rounded-xl border border-white/10">
                <span className="text-[10px] text-blue-100 block font-medium">Registered Farmers</span>
                <span className="font-bold text-base text-white font-mono leading-tight">
                  {analyticsSummary.uniqueFarmers}
                </span>
                <span className="text-[9px] text-blue-200 block font-sans">
                  ({analyticsSummary.totalParcels} farm lots)
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-2 rounded-xl border border-white/10">
                <span className="text-[10px] text-blue-100 block font-medium">Total Land Area</span>
                <span className="font-bold text-base text-emerald-300 font-mono leading-tight">
                  {analyticsSummary.totalAreaHa}
                </span>
                <span className="text-[9px] text-blue-200 block font-sans">Hectares (ha)</span>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-2 rounded-xl border border-white/10">
                <span className="text-[10px] text-blue-100 block font-medium">Top Variety</span>
                <span className="font-bold text-xs text-amber-300 truncate block mt-0.5" title={analyticsSummary.topVariety}>
                  {analyticsSummary.topVariety}
                </span>
                <span className="text-[9px] text-blue-200 block font-mono">
                  {analyticsSummary.irrigatedPct}% Irrigated
                </span>
              </div>
            </div>
          </div>

          {/* 3. REQUIREMENT 4: VERTICALLY SCROLLABLE PURE WHITE FARMER SUMMARY CARDS */}
          <div className="h-[calc(100vh-280px)] min-h-[460px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
            {filteredParcels.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 space-y-3 shadow-xs">
                <Wheat className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">No farm parcels match your search filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedBarangay('ALL');
                    setSelectedEcosystem('ALL');
                    setSelectedVariety('ALL');
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredParcels.map((parcel) => {
                const isSelected = activeCardTag === parcel.tagNumber || selectedParcelForDrawer?.tagNumber === parcel.tagNumber;
                const isHovered = hoveredParcelTag === parcel.tagNumber;
                const statusInfo = getStatusBadge(parcel.healthStatus);
                const isIrrigated = parcel.purpose.toLowerCase().includes('irrigated');
                const isHybrid = parcel.purpose.toLowerCase().includes('hybrid');

                return (
                  <div
                    key={parcel.tagNumber}
                    id={`farmer-card-${parcel.tagNumber}`}
                    onMouseEnter={() => setHoveredParcelTag(parcel.tagNumber)}
                    onMouseLeave={() => setHoveredParcelTag(null)}
                    onClick={() => handleSelectParcelFromList(parcel)}
                    className={`p-4 rounded-2xl border transition-all duration-150 cursor-pointer relative group bg-white shadow-xs ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-500/30 shadow-md bg-blue-50/30'
                        : isHovered
                        ? 'border-blue-300 shadow-md bg-slate-50/50'
                        : 'border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Top Header: Farmer Name, RSBSA badge, Lot Tag ID */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5 mb-2.5">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm text-blue-700 group-hover:text-blue-800 transition">
                            {parcel.raiserName}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                            {parcel.swineNameOrId || 'RSBSA-VERIFIED'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>Brgy. {parcel.barangay}, Silago</span>
                        </div>
                      </div>

                      {/* Lot Tag Badge */}
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 font-mono text-[10px] font-extrabold text-slate-700 shrink-0">
                        {parcel.tagNumber}
                      </span>
                    </div>

                    {/* Metadata Specs Grid in Charcoal / Slate */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">Total Lot Area:</span>
                        <span className="font-bold text-emerald-700 font-mono">
                          {parcel.weightKg} ha
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">Ecosystem:</span>
                        <span className={`font-bold text-[10.5px] truncate ${isIrrigated ? 'text-blue-700' : isHybrid ? 'text-purple-700' : 'text-amber-700'}`}>
                          {parcel.purpose.split(' ')[0]}
                        </span>
                      </div>

                      <div className="col-span-2 bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10.5px]">
                          <Wheat className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Rice Variety:</span>
                        </div>
                        <span className="font-bold text-slate-800 text-xs truncate max-w-[190px]">
                          {parcel.breed}
                        </span>
                      </div>
                    </div>

                    {/* Status Indicator Tag & Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1.5 ${statusInfo.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} animate-pulse`} />
                        <span>{statusInfo.label}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectParcelFromList(parcel);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition flex items-center gap-1 cursor-pointer shadow-xs"
                          title="Center and zoom map on this GPS pinpoint"
                        >
                          <MapPin className="w-3 h-3 text-white" />
                          <span>Locate</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectParcel(parcel);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-200 transition flex items-center gap-1 cursor-pointer"
                          title="Open full farmer profile dossier"
                        >
                          <span>Details</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY INTERACTIVE MAP CONTAINER */}
        <div
          className={`transition-all duration-300 ease-in-out relative ${
            isLeftPanelCollapsed
              ? 'lg:col-span-12'
              : 'lg:col-span-7 xl:col-span-7 2xl:col-span-7'
          } ${mobileTab === 'list' ? 'hidden lg:block' : 'block'}`}
        >
          {/* STICKY MAP CARD */}
          <div className="sticky top-3.5 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
            {/* FLOATING COLLAPSIBLE TOGGLE BUTTON (Floating right along the split border between list & map) */}
            <div className="absolute top-4 left-4 z-400 hidden lg:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                className={`px-3 py-2 text-xs font-bold rounded-xl backdrop-blur-md border shadow-xl transition flex items-center gap-2 cursor-pointer ${
                  isLeftPanelCollapsed
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-400 ring-2 ring-blue-400/40 animate-pulse'
                    : 'bg-white/95 hover:bg-blue-50 text-blue-700 border-slate-200 hover:border-blue-300'
                }`}
                title={isLeftPanelCollapsed ? 'Expand Farmer List Directory (Split Screen)' : 'Collapse Left Panel for 100% Full-Width Map'}
              >
                {isLeftPanelCollapsed ? (
                  <>
                    <ChevronRight className="w-4 h-4 text-white" />
                    <span>Expand Directory</span>
                    <span className="bg-white/20 text-white px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                      {filteredParcels.length}
                    </span>
                  </>
                ) : (
                  <>
                    <ChevronLeft className="w-4 h-4 text-blue-600" />
                    <span>Hide List</span>
                    <PanelLeftClose className="w-3.5 h-3.5 text-slate-400" />
                  </>
                )}
              </button>
            </div>

            {/* FLOATING TOP-RIGHT TOOLBAR (Basemap Switcher, Layer Control, Fullscreen) */}
            <div className="absolute top-4 right-4 z-400 flex items-center gap-2">
              {/* Display Mode Switcher */}
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-1 rounded-xl shadow-lg flex items-center gap-1 text-white">
                <button
                  type="button"
                  onClick={() => setMapDisplayMode('markers')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    mapDisplayMode === 'markers'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Show georeferenced boundary polygons & GPS pinpoints"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Parcels</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMapDisplayMode('heatmap')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    mapDisplayMode === 'heatmap'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Show agricultural density heat map"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Heatmap</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMapDisplayMode('hybrid')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    mapDisplayMode === 'hybrid'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Hybrid view: polygons overlaying heat gradient"
                >
                  <Layers2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hybrid</span>
                </button>
              </div>

              {/* Layer Controls Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLayerControlOpen(!isLayerControlOpen)}
                  className={`p-2 rounded-xl backdrop-blur-md border shadow-lg transition cursor-pointer ${
                    isLayerControlOpen
                      ? 'bg-blue-600 border-blue-400 text-white'
                      : 'bg-slate-900/90 border-slate-700 text-white hover:bg-slate-800'
                  }`}
                  title="Basemap and Layer Overlays"
                >
                  <Layers className="w-4 h-4" />
                </button>

                {isLayerControlOpen && (
                  <div className="absolute right-0 top-12 z-500 w-72 bg-slate-900 border border-slate-700 rounded-2xl p-3.5 shadow-2xl space-y-3 text-white animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                        Basemap Provider
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsLayerControlOpen(false)}
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                      {(Object.keys(TILE_PROVIDERS) as BaseLayerType[]).map((layerKey) => {
                        const provider = TILE_PROVIDERS[layerKey];
                        const isActive = activeBaseLayer === layerKey;
                        return (
                          <button
                            key={layerKey}
                            type="button"
                            onClick={() => {
                              setActiveBaseLayer(layerKey);
                              setIsLayerControlOpen(false);
                            }}
                            className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition cursor-pointer ${
                              isActive
                                ? 'bg-blue-600 text-white font-bold'
                                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{provider.icon}</span>
                              <div>
                                <span className="text-xs block font-bold">{provider.label}</span>
                                <span className="text-[10px] text-slate-300 block truncate max-w-[170px]">
                                  {provider.tagline}
                                </span>
                              </div>
                            </div>
                            {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Layer Overlays
                      </span>

                      <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
                        <span>Distinct Barangay Boundaries</span>
                        <input
                          type="checkbox"
                          checked={showBoundariesLayer}
                          onChange={(e) => setShowBoundariesLayer(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 bg-slate-800 border-slate-700"
                        />
                      </label>

                      <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
                        <span>Barangay Name Badges</span>
                        <input
                          type="checkbox"
                          checked={showBarangayLabels}
                          onChange={(e) => setShowBarangayLabels(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 bg-slate-800 border-slate-700"
                        />
                      </label>

                      <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
                        <span>Farm Parcel Lots &amp; Pins</span>
                        <input
                          type="checkbox"
                          checked={showParcelsLayer}
                          onChange={(e) => setShowParcelsLayer(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 bg-slate-800 border-slate-700"
                        />
                      </label>

                      <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
                        <span>MAO Facilities &amp; Landmarks</span>
                        <input
                          type="checkbox"
                          checked={showFacilitiesLayer}
                          onChange={(e) => setShowFacilitiesLayer(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 bg-slate-800 border-slate-700"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl backdrop-blur-md border border-slate-700 shadow-lg transition cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen GIS Map'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>

            {/* LEAFLET MAP ELEMENT */}
            <div
              ref={mapContainerRef}
              className="w-full h-[calc(100vh-160px)] min-h-[580px] bg-slate-950 relative z-0"
            />

            {/* FLOATING ACTION FIELD TOOLS BAR (BOTTOM CENTER) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-400 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-1.5 shadow-2xl flex items-center gap-1.5 text-white">
              <button
                type="button"
                onClick={() => {
                  setActiveTool(activeTool === 'drop_pin' ? 'none' : 'drop_pin');
                  setMeasurePoints([]);
                  setDigitizerPoints([]);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTool === 'drop_pin'
                    ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                }`}
                title="Click anywhere on the map to pin and register new farm parcel"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Drop GPS Pin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTool(activeTool === 'draw_polygon' ? 'none' : 'draw_polygon');
                  setMeasurePoints([]);
                  setDigitizerPoints([]);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTool === 'draw_polygon'
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                }`}
                title="Digitize custom field polygon boundary by clicking vertices"
              >
                <PenTool className="w-3.5 h-3.5 text-blue-400" />
                <span>Digitize Field</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTool(activeTool === 'measure' ? 'none' : 'measure');
                  setMeasurePoints([]);
                  setDigitizerPoints([]);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTool === 'measure'
                    ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                }`}
                title="Measure distance along irrigation canal or farm road"
              >
                <Ruler className="w-3.5 h-3.5 text-amber-400" />
                <span>Measure Distance</span>
              </button>

              {(measurePoints.length > 0 || digitizerPoints.length > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setMeasurePoints([]);
                    setDigitizerPoints([]);
                    setActiveTool('none');
                  }}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-300 transition cursor-pointer"
                  title="Clear drawing"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* DIGITIZER OVERLAY BANNER */}
            {activeTool === 'draw_polygon' && digitizerPoints.length > 0 && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-400 bg-slate-900/95 border border-blue-500/50 rounded-2xl p-3 shadow-2xl text-white flex items-center gap-3 animate-in fade-in duration-200">
                <div className="text-xs">
                  <span className="font-bold text-sky-400 block">Digitizing Field Polygon</span>
                  <span className="text-[11px] text-slate-300">
                    {digitizerPoints.length} vertices &bull;{' '}
                    <strong className="text-emerald-400">{drawnAreaMetrics.hectares.toFixed(2)} ha</strong> ({Math.round(drawnAreaMetrics.sqMeters).toLocaleString()} m²)
                  </span>
                </div>
                {digitizerPoints.length >= 3 && (
                  <button
                    type="button"
                    onClick={handleFinishDrawnPolygon}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Save Boundary &amp; Register
                  </button>
                )}
              </div>
            )}

            {/* MEASURE TOOL OVERLAY BANNER */}
            {activeTool === 'measure' && measurePoints.length > 0 && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-400 bg-slate-900/95 border border-amber-500/50 rounded-2xl p-3 shadow-2xl text-white flex items-center gap-3 animate-in fade-in duration-200">
                <div className="text-xs">
                  <span className="font-bold text-amber-400 block">Measuring Geodesic Distance</span>
                  <span className="text-[11px] text-slate-300">
                    {measurePoints.length} points &bull; Total:{' '}
                    <strong className="text-amber-300">
                      {totalMeasuredDistanceMeters > 1000
                        ? (totalMeasuredDistanceMeters / 1000).toFixed(2) + ' km'
                        : Math.round(totalMeasuredDistanceMeters) + ' meters'}
                    </strong>
                  </span>
                </div>
              </div>
            )}

            {/* SLIDE-OVER DETAIL DRAWER FOR SELECTED PARCEL */}
            {selectedParcelForDrawer && (
              <div className="absolute bottom-16 right-4 z-400 w-80 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-2xl space-y-3 text-slate-800 animate-in slide-in-from-right-4 duration-200">
                <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[10px] border border-blue-200">
                        {selectedParcelForDrawer.tagNumber}
                      </span>
                      <span className="text-[10.5px] font-mono text-slate-500">
                        {selectedParcelForDrawer.swineNameOrId || 'RSBSA'}
                      </span>
                    </div>
                    <h4 className="font-black text-sm text-slate-900 mt-1">
                      {selectedParcelForDrawer.raiserName}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedParcelForDrawer(null)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Barangay:</span>
                    <span className="font-bold text-slate-900 block truncate">
                      {selectedParcelForDrawer.barangay}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Total Area:</span>
                    <span className="font-bold text-emerald-600 font-mono block">
                      {selectedParcelForDrawer.weightKg} ha
                    </span>
                  </div>

                  <div className="col-span-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Rice Variety &amp; Ecosystem:</span>
                    <span className="font-bold text-slate-800 block text-xs truncate">
                      {selectedParcelForDrawer.breed} ({selectedParcelForDrawer.purpose})
                    </span>
                  </div>
                </div>

                {/* Coordinates & Copy */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                  <div className="text-[11px] font-mono text-slate-700 truncate pr-2">
                    {Number(selectedParcelForDrawer.lat).toFixed(6)}, {Number(selectedParcelForDrawer.lng).toFixed(6)}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyCoordinates(Number(selectedParcelForDrawer.lat), Number(selectedParcelForDrawer.lng))
                    }
                    className="px-2 py-1 rounded bg-white text-blue-600 hover:bg-blue-50 border border-slate-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {isCopiedCoords ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopiedCoords ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Open Full Profile Dossier Button */}
                <button
                  type="button"
                  onClick={() => onSelectParcel(selectedParcelForDrawer)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Open Full Farmer Profile Dossier</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
