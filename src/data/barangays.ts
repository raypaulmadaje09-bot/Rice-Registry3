import { Barangay, User } from '../types';
import rawBarangays from '../data_barangays.json';

// Explicit 10 Assigned Barangays specified by Municipal Agriculture
export const ASSIGNED_10_BARANGAYS = [
  'Salvacion',
  'Laguma',
  'Pd2',
  'Pd1',
  'Sap-ang',
  'Brando',
  'Mercedes',
  'Katipunan',
  'Puntana',
  'Hingatungan'
] as const;

export type AssignedBarangay = typeof ASSIGNED_10_BARANGAYS[number];

// Official 2 Assigned Local Farmer Technicians (LFTs)
export const WELLA_ASSIGNED_BARANGAYS = [
  'Salvacion',
  'Laguma',
  'Pd2',
  'Pd1',
  'Sap-ang'
] as const;

export const BRANDO_ASSIGNED_BARANGAYS = [
  'Mercedes',
  'Katipunan',
  'Puntana',
  'Hingatungan',
  'Brando'
] as const;

export const LFT_OFFICERS_INFO = {
  wella: {
    name: 'Wella S. Bongons',
    title: 'Local Farmer Technician (LFT)',
    role: 'Barangay Focal Person' as const,
    username: 'wella.bongons',
    contactNumber: '0917-829-4501',
    email: 'wella.bongons@silago-agriculture.gov.ph',
    assignedBarangays: ['Salvacion', 'Laguma', 'Pd2', 'Pd1', 'Sap-ang']
  },
  brando: {
    name: 'Brando T. Tabugon',
    title: 'Local Farmer Technician (LFT)',
    role: 'Barangay Focal Person' as const,
    username: 'brando.tabugon',
    contactNumber: '0928-554-7123',
    email: 'brando.tabugon@silago-agriculture.gov.ph',
    assignedBarangays: ['Mercedes', 'Katipunan', 'Puntana', 'Hingatungan', 'Brando']
  }
};

/**
 * Returns the assigned LFT officer for a given barangay.
 * Wella S. Bongons: Salvacion, Laguma, Pd2, Pd1, Sap-ang
 * Brando T. Tabugon: Mercedes, Katipunan, Puntana, Hingatungan (and Brando / other)
 */
export function getAssignedLftForBarangay(barangayName: string) {
  if (!barangayName) return LFT_OFFICERS_INFO.wella;
  const lower = barangayName.trim().toLowerCase();
  if (
    lower.includes('salvacion') ||
    lower.includes('laguma') ||
    lower.includes('pd2') ||
    lower.includes('pob2') ||
    lower.includes('poblacion 2') ||
    lower.includes('poblacion district 2') ||
    lower.includes('pd1') ||
    lower.includes('pob1') ||
    lower.includes('poblacion 1') ||
    lower.includes('poblacion district 1') ||
    lower.includes('sap-ang') ||
    lower.includes('sapang')
  ) {
    return LFT_OFFICERS_INFO.wella;
  }
  return LFT_OFFICERS_INFO.brando;
}

// Additional / standard definitions
const rawList: Barangay[] = (rawBarangays as Barangay[]).map((b) => {
  const lft = getAssignedLftForBarangay(b.name);
  return {
    ...b,
    focalPerson: lft.name,
    contactNumber: lft.contactNumber,
    username: lft.username
  };
});

// Ensure all official Silago barangays are present in masterlist
const requiredBarangays: Partial<Barangay>[] = [
  {
    name: 'Sap-ang',
    puroks: 4,
    terrain: 'Lowland Alluvial & Coastal',
    registeredSwine: 3,
    registeredRaisers: 3,
    totalAreaHa: 4.5,
    irrigatedAreaHa: 3.6,
    rainfedAreaHa: 0.9,
    lat: 10.522,
    lng: 125.163,
    asfStatus: 'NIA Irrigated Sector'
  },
  {
    name: 'Kikilo',
    puroks: 3,
    terrain: 'North Sloping Foothills',
    registeredSwine: 2,
    registeredRaisers: 2,
    totalAreaHa: 4.2,
    irrigatedAreaHa: 2.1,
    rainfedAreaHa: 2.1,
    lat: 10.595,
    lng: 125.150,
    asfStatus: 'Rainfed Priority'
  },
  {
    name: 'Bulak',
    puroks: 3,
    terrain: 'Terraced Upland',
    registeredSwine: 2,
    registeredRaisers: 2,
    totalAreaHa: 3.8,
    irrigatedAreaHa: 1.9,
    rainfedAreaHa: 1.9,
    lat: 10.585,
    lng: 125.142,
    asfStatus: 'Rainfed Priority'
  },
  {
    name: 'Pinamananagan',
    puroks: 4,
    terrain: 'Inland River Watershed',
    registeredSwine: 3,
    registeredRaisers: 3,
    totalAreaHa: 3.6,
    irrigatedAreaHa: 2.4,
    rainfedAreaHa: 1.2,
    lat: 10.540,
    lng: 125.142,
    asfStatus: 'NIA Irrigated Sector'
  },
  {
    name: 'Sudmon',
    puroks: 3,
    terrain: 'Coastline & Estuary Lowland',
    registeredSwine: 2,
    registeredRaisers: 2,
    totalAreaHa: 3.2,
    irrigatedAreaHa: 2.5,
    rainfedAreaHa: 0.7,
    lat: 10.542,
    lng: 125.176,
    asfStatus: 'High Yield Zone'
  }
];

requiredBarangays.forEach((item) => {
  if (!rawList.some((b) => b.name.toLowerCase() === item.name!.toLowerCase())) {
    const lft = getAssignedLftForBarangay(item.name!);
    rawList.push({
      name: item.name!,
      puroks: item.puroks || 3,
      terrain: item.terrain || 'Lowland Alluvial',
      registeredSwine: item.registeredSwine || 2,
      registeredRaisers: item.registeredRaisers || 2,
      totalAreaHa: item.totalAreaHa || 3.5,
      irrigatedAreaHa: item.irrigatedAreaHa || 2.0,
      rainfedAreaHa: item.rainfedAreaHa || 1.5,
      focalPerson: lft.name,
      contactNumber: lft.contactNumber,
      username: lft.username,
      lat: item.lat || 10.538,
      lng: item.lng || 125.172,
      asfStatus: item.asfStatus || 'NIA Irrigated Sector'
    });
  }
});

export const BARANGAYS: Barangay[] = rawList;

export const TOTAL_SILAGO_STATS = {
  totalBarangays: 16,
  assignedBarangaysCount: 10,
  registeredParcels: 45,
  totalFarmers: 45,
  totalAreaHa: 73.4,
  irrigatedAreaHa: 56.0,
  rainfedAreaHa: 17.4,
  municipalAgriculturist: 'Engr. Arnaldo M. Valdez',
  municipalMayor: 'Hon. Lemuel P. Honor',
  centerCoordinates: { lat: 10.542, lng: 125.175 }
};

/**
 * Matches a database record's barangay string to an assigned barangay query.
 * Handles abbreviations (e.g. Pd1 -> Poblacion District 1, Brando -> San Bernardo, etc.)
 */
export function matchBarangay(recordBarangay: string, targetBarangay: string): boolean {
  if (!recordBarangay || !targetBarangay) return false;
  if (targetBarangay === 'ALL' || targetBarangay === 'ASSIGNED_10') return true;

  const rec = recordBarangay.trim().toLowerCase();
  const tgt = targetBarangay.trim().toLowerCase();

  if (rec === tgt) return true;

  // Pd1 mapping
  if ((tgt === 'pd1' || tgt === 'poblacion district 1' || tgt === 'pob1' || tgt === 'poblacion 1') &&
      (rec === 'pd1' || rec.includes('poblacion district 1') || rec === 'pob1' || rec === 'poblacion 1')) {
    return true;
  }

  // Pd2 mapping
  if ((tgt === 'pd2' || tgt === 'poblacion district 2' || tgt === 'pob2' || tgt === 'poblacion 2') &&
      (rec === 'pd2' || rec.includes('poblacion district 2') || rec === 'pob2' || rec === 'poblacion 2')) {
    return true;
  }

  // Brando / San Bernardo mapping
  if ((tgt === 'brando' || tgt === 'san bernardo' || tgt === 'sanbernardo') &&
      (rec === 'brando' || rec.includes('san bernardo') || rec === 'sanbernardo')) {
    return true;
  }

  // Sap-ang mapping
  if ((tgt === 'sap-ang' || tgt === 'sapang') &&
      (rec === 'sap-ang' || rec === 'sapang' || rec.includes('sap-ang'))) {
    return true;
  }

  // Salvacion
  if (tgt.includes('salvacion') && rec.includes('salvacion')) return true;
  // Laguma
  if (tgt.includes('laguma') && rec.includes('laguma')) return true;
  // Mercedes
  if (tgt.includes('mercedes') && rec.includes('mercedes')) return true;
  // Katipunan
  if (tgt.includes('katipunan') && rec.includes('katipunan')) return true;
  // Puntana
  if (tgt.includes('puntana') && rec.includes('puntana')) return true;
  // Hingatungan
  if (tgt.includes('hingatungan') && rec.includes('hingatungan')) return true;

  return rec.includes(tgt) || tgt.includes(rec);
}

/**
 * Normalizes any barangay name to its standard assigned label if applicable
 */
export function getDisplayBarangay(name: string): string {
  if (!name) return '';
  const lower = name.trim().toLowerCase();
  if (lower === 'pd1' || lower.includes('poblacion district 1') || lower === 'pob1') return 'Pd1';
  if (lower === 'pd2' || lower.includes('poblacion district 2') || lower === 'pob2') return 'Pd2';
  if (lower === 'brando' || lower.includes('san bernardo') || lower === 'sanbernardo') return 'Brando';
  if (lower === 'sap-ang' || lower === 'sapang') return 'Sap-ang';
  if (lower.includes('salvacion')) return 'Salvacion';
  if (lower.includes('laguma')) return 'Laguma';
  if (lower.includes('mercedes')) return 'Mercedes';
  if (lower.includes('katipunan')) return 'Katipunan';
  if (lower.includes('puntana')) return 'Puntana';
  if (lower.includes('hingatungan')) return 'Hingatungan';
  return name;
}

/**
 * Returns the specific list of assigned barangays for an LFT officer,
 * or null if the user is a Central Admin with full municipal jurisdiction.
 */
export function getUserAssignedBarangays(user: User | null | undefined): string[] | null {
  if (!user || user.role === 'Central Admin') {
    return null; // All barangays permitted
  }
  if (user.role === 'Barangay Focal Person') {
    const uname = (user.username || '').toLowerCase();
    const unameStr = (user.name || '').toLowerCase();
    if (uname.includes('wella') || unameStr.includes('wella')) {
      return [...WELLA_ASSIGNED_BARANGAYS];
    }
    if (uname.includes('brando') || unameStr.includes('brando')) {
      return [...BRANDO_ASSIGNED_BARANGAYS];
    }
    if (user.assignedBarangays && user.assignedBarangays.length > 0) {
      return user.assignedBarangays;
    }
    if (user.barangay) {
      return [user.barangay];
    }
    return [...WELLA_ASSIGNED_BARANGAYS];
  }
  return [];
}

/**
 * Validates whether a user (LFT officer or Admin) is authorized
 * to create, edit, or delete a farm parcel in the specified barangay.
 */
export function isUserAuthorizedForBarangay(user: User | null | undefined, barangayName: string): boolean {
  if (!user || user.role === 'Central Admin') return true;
  const assigned = getUserAssignedBarangays(user);
  if (!assigned) return true; // Admin
  return assigned.some((b) => matchBarangay(barangayName, b));
}

