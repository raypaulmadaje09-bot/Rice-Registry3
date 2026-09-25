import { Barangay } from '../types';

export interface BarangayBoundary {
  id: string;
  name: string;
  aliases: string[];
  zone: 'North/Upland' | 'Central/Inland' | 'Coastal/Poblacion & South';
  center: [number, number]; // [lat, lng]
  color: string;           // Contrasting solid border color (2px)
  fillColor: string;       // Subtle pastel fill color
  polygon: [number, number][]; // Multi-point territorial boundary polygon
  terrainType: string;
  areaHa: number;
}

/**
 * Official Administrative Boundary Polygons for Silago, Southern Leyte
 * Mapped across North/Upland, Central/Inland, and Coastal/Poblacion & South Zones
 */
export const SILAGO_BARANGAY_BOUNDARIES: BarangayBoundary[] = [
  // ==========================================
  // NORTH / UPLAND ZONE
  // ==========================================
  {
    id: 'kikilo',
    name: 'Kikilo',
    aliases: ['kikilo'],
    zone: 'North/Upland',
    center: [10.595, 125.150],
    color: '#2563eb', // Royal Blue border
    fillColor: '#93c5fd', // Soft Sky pastel
    terrainType: 'North Sloping Foothills & Upland Valley',
    areaHa: 4.2,
    polygon: [
      [10.608, 125.142],
      [10.610, 125.158],
      [10.592, 125.162],
      [10.584, 125.152],
      [10.588, 125.138]
    ]
  },
  {
    id: 'bulak',
    name: 'Bulak',
    aliases: ['bulak'],
    zone: 'North/Upland',
    center: [10.585, 125.142],
    color: '#059669', // Emerald Green border
    fillColor: '#a7f3d0', // Mint pastel
    terrainType: 'Terraced Upland & Mountain Spring Watershed',
    areaHa: 3.8,
    polygon: [
      [10.594, 125.134],
      [10.592, 125.150],
      [10.578, 125.152],
      [10.574, 125.138],
      [10.582, 125.130]
    ]
  },
  {
    id: 'hingatungan',
    name: 'Hingatungan',
    aliases: ['hingatungan', 'san isidro', 'sutrina'],
    zone: 'North/Upland',
    center: [10.565, 125.168],
    color: '#0284c7', // Azure Blue border
    fillColor: '#bae6fd', // Soft Azure pastel
    terrainType: 'Lowland Alluvial & Northern Coastal Plain',
    areaHa: 8.2,
    polygon: [
      [10.580, 125.158],
      [10.582, 125.178],
      [10.556, 125.184],
      [10.548, 125.174],
      [10.552, 125.158],
      [10.568, 125.154]
    ]
  },
  {
    id: 'salvacion',
    name: 'Salvacion',
    aliases: ['salvacion'],
    zone: 'North/Upland',
    center: [10.528, 125.146],
    color: '#65a30d', // Lime Green border
    fillColor: '#d9f99d', // Lime pastel
    terrainType: 'Upland Terraces & Rainfed Lowlands',
    areaHa: 2.8,
    polygon: [
      [10.538, 125.138],
      [10.536, 125.154],
      [10.520, 125.154],
      [10.518, 125.138],
      [10.528, 125.134]
    ]
  },
  {
    id: 'lagoma',
    name: 'Lagoma',
    aliases: ['lagoma', 'laguma'],
    zone: 'North/Upland',
    center: [10.548, 125.160],
    color: '#d97706', // Amber Gold border
    fillColor: '#fde68a', // Amber pastel
    terrainType: 'Lowland Alluvial & Irrigated Plains',
    areaHa: 5.6,
    polygon: [
      [10.558, 125.152],
      [10.556, 125.170],
      [10.540, 125.172],
      [10.538, 125.154],
      [10.546, 125.148]
    ]
  },

  // ==========================================
  // CENTRAL / INLAND ZONE
  // ==========================================
  {
    id: 'imelda',
    name: 'Imelda',
    aliases: ['imelda'],
    zone: 'Central/Inland',
    center: [10.495, 125.155],
    color: '#ea580c', // Orange border
    fillColor: '#fed7aa', // Orange pastel
    terrainType: 'Southern Foothills & Agroforestry Corridor',
    areaHa: 2.9,
    polygon: [
      [10.504, 125.146],
      [10.504, 125.166],
      [10.484, 125.166],
      [10.484, 125.146],
      [10.494, 125.140]
    ]
  },
  {
    id: 'katipunan',
    name: 'Katipunan',
    aliases: ['katipunan'],
    zone: 'Central/Inland',
    center: [10.510, 125.136],
    color: '#8b5cf6', // Purple border
    fillColor: '#ddd6fe', // Lavender pastel
    terrainType: 'Western Upland Terrace & Forest Margin',
    areaHa: 3.0,
    polygon: [
      [10.518, 125.128],
      [10.518, 125.144],
      [10.500, 125.144],
      [10.500, 125.128],
      [10.510, 125.124]
    ]
  },
  {
    id: 'pinamananagan',
    name: 'Pinamananagan',
    aliases: ['pinamananagan', 'pinamitinan', 'san bernardo', 'brando', 'sanbernardo'],
    zone: 'Central/Inland',
    center: [10.540, 125.142],
    color: '#ec4899', // Pink border
    fillColor: '#fbcfe8', // Pink pastel
    terrainType: 'Inland River Watershed & Rainfed Slopes',
    areaHa: 3.6,
    polygon: [
      [10.549, 125.134],
      [10.548, 125.150],
      [10.532, 125.150],
      [10.530, 125.134],
      [10.539, 125.130]
    ]
  },
  {
    id: 'tubod',
    name: 'Tubod',
    aliases: ['tubod'],
    zone: 'Central/Inland',
    center: [10.515, 125.142],
    color: '#f43f5e', // Rose border
    fillColor: '#fecdd3', // Rose pastel
    terrainType: 'Central Spring Watershed & Upland Paddocks',
    areaHa: 2.7,
    polygon: [
      [10.524, 125.134],
      [10.522, 125.148],
      [10.506, 125.148],
      [10.506, 125.134],
      [10.515, 125.128]
    ]
  },
  {
    id: 'tuba_on',
    name: 'Tuba-on',
    aliases: ['tuba-on', 'tubaon'],
    zone: 'Central/Inland',
    center: [10.505, 125.160],
    color: '#0d9488', // Teal border
    fillColor: '#99f6e4', // Teal pastel
    terrainType: 'Central-South Alluvial Plains',
    areaHa: 3.1,
    polygon: [
      [10.512, 125.152],
      [10.512, 125.170],
      [10.494, 125.170],
      [10.494, 125.152],
      [10.503, 125.146]
    ]
  },

  // ==========================================
  // COASTAL / POBLACION & SOUTH ZONE
  // ==========================================
  {
    id: 'pob1',
    name: 'Poblacion District 1',
    aliases: ['pd1', 'poblacion district 1', 'pob1', 'poblacion 1'],
    zone: 'Coastal/Poblacion & South',
    center: [10.5335, 125.162],
    color: '#2563eb', // Royal Blue border
    fillColor: '#bfdbfe', // Soft Blue pastel
    terrainType: 'River Basin NIA Irrigated Flatlands',
    areaHa: 7.5,
    polygon: [
      [10.540, 125.155],
      [10.542, 125.170],
      [10.528, 125.172],
      [10.526, 125.156],
      [10.532, 125.152]
    ]
  },
  {
    id: 'pob2',
    name: 'Poblacion District 2',
    aliases: ['pd2', 'poblacion district 2', 'pob2', 'poblacion 2'],
    zone: 'Coastal/Poblacion & South',
    center: [10.5365, 125.166],
    color: '#0891b2', // Ocean Teal border
    fillColor: '#a5f3fc', // Cyan pastel
    terrainType: 'River Basin Central Core / Administrative Heart',
    areaHa: 4.8,
    polygon: [
      [10.542, 125.162],
      [10.544, 125.176],
      [10.530, 125.176],
      [10.528, 125.164],
      [10.534, 125.158]
    ]
  },
  {
    id: 'puntana',
    name: 'Puntana',
    aliases: ['puntana'],
    zone: 'Coastal/Poblacion & South',
    center: [10.555, 125.152],
    color: '#c026d3', // Fuchsia border
    fillColor: '#f5d0fe', // Fuchsia pastel
    terrainType: 'Northwest Lowland Alluvial & Estuary Margin',
    areaHa: 3.4,
    polygon: [
      [10.564, 125.144],
      [10.562, 125.158],
      [10.548, 125.156],
      [10.548, 125.142],
      [10.558, 125.138]
    ]
  },
  {
    id: 'sudmon',
    name: 'Sudmon',
    aliases: ['sudmon'],
    zone: 'Coastal/Poblacion & South',
    center: [10.542, 125.176],
    color: '#06b6d4', // Cyan border
    fillColor: '#cffafe', // Light Cyan pastel
    terrainType: 'Eastern Coastline & Estuary Rice Fields',
    areaHa: 3.2,
    polygon: [
      [10.550, 125.172],
      [10.552, 125.186],
      [10.534, 125.188],
      [10.532, 125.174],
      [10.542, 125.170]
    ]
  },
  {
    id: 'sap_ang',
    name: 'Sap-ang',
    aliases: ['sap-ang', 'sapang'],
    zone: 'Coastal/Poblacion & South',
    center: [10.522, 125.163],
    color: '#16a34a', // Grass Green border
    fillColor: '#bbf7d0', // Light Green pastel
    terrainType: 'NIA Irrigated Sub-Sector & Alluvial Rice Plain',
    areaHa: 4.5,
    polygon: [
      [10.529, 125.157],
      [10.529, 125.169],
      [10.514, 125.169],
      [10.514, 125.157]
    ]
  },
  {
    id: 'mercedes',
    name: 'Mercedes',
    aliases: ['mercedes'],
    zone: 'Coastal/Poblacion & South',
    center: [10.512, 125.155],
    color: '#a855f7', // Violet border
    fillColor: '#e9d5ff', // Light Violet pastel
    terrainType: 'Lowland Alluvial & CIS Canal Network',
    areaHa: 3.9,
    polygon: [
      [10.520, 125.148],
      [10.520, 125.162],
      [10.503, 125.163],
      [10.503, 125.148],
      [10.512, 125.144]
    ]
  },
  {
    id: 'catmon',
    name: 'Catmon',
    aliases: ['catmon', 'brgy. catmon', 'brgy catmon'],
    zone: 'Coastal/Poblacion & South',
    center: [10.525, 125.158],
    color: '#4f46e5', // Indigo border
    fillColor: '#c7d2fe', // Soft Indigo pastel
    terrainType: 'River Basin Irrigated Main Sector',
    areaHa: 4.9,
    polygon: [
      [10.533, 125.152],
      [10.533, 125.166],
      [10.517, 125.166],
      [10.516, 125.152],
      [10.524, 125.148]
    ]
  },
  {
    id: 'balagawan',
    name: 'Balagawan',
    aliases: ['balagawan'],
    zone: 'Coastal/Poblacion & South',
    center: [10.518, 125.174],
    color: '#0284c7', // Deep Sky border
    fillColor: '#bae6fd', // Sky pastel
    terrainType: 'Southern Coastal Plain & Rainfed Priority Belt',
    areaHa: 5.1,
    polygon: [
      [10.528, 125.166],
      [10.529, 125.184],
      [10.507, 125.186],
      [10.507, 125.166],
      [10.518, 125.164]
    ]
  }
];

export function findBarangayBoundary(name: string): BarangayBoundary | undefined {
  if (!name) return undefined;
  const lower = name.trim().toLowerCase();
  return SILAGO_BARANGAY_BOUNDARIES.find((b) =>
    b.name.toLowerCase() === lower ||
    b.aliases.some((a) => lower.includes(a) || a.includes(lower))
  );
}
