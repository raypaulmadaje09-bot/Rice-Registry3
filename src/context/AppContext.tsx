import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, FarmParcel, Language, BackgroundPreset, LftAccount, SeasonalProductionRecord } from '../types';
import { INITIAL_PARCELS } from '../data/parcels';
import { BARANGAYS, getAssignedLftForBarangay } from '../data/barangays';
import { DEFAULT_BG_PHOTO, DEFAULT_SLSU_PHOTO, SLSU_DEFAULTS, PRESET_BACKGROUNDS } from '../data/photos';
import { RiceVariety, RICE_VARIETIES } from '../data/riceVarieties';
import { generateInitialSeasonalRecords, CROPPING_SEASONS, ACTIVE_SEASON } from '../data/seasonalProduction';

const DEFAULT_ECOSYSTEMS = [
  'Irrigated Lowland (NIA)',
  'Rainfed Lowland',
  'Hybrid Seed Production',
  'Upland Terraces'
];

const DEFAULT_TENURES = [
  'Owner-Cultivator',
  'Tenant Farmer',
  'Agrarian Reform Beneficiary (ARB)',
  'Leaseholder'
];

const DEFAULT_SEASONS = [
  'Wet Season (WS) 2026 (June – Nov 2026)',
  'Dry Season (DS) 2026 (Dec 2025 – May 2026)',
  'Wet Season (WS) 2025 (June – Nov 2025)'
];

const DEFAULT_IRRIGATION_ASSOCIATIONS = [
  'Balagawan Communal Irrigators Association (BCIA)',
  'Silago River Irrigation System IA (SRIS-IA)',
  'Hinabian Farmers Irrigators Association',
  'Katipunan-Mercedes Irrigators Association',
  'Lagoma-Tubod Irrigators Association',
  'Puntana-Salvacion Farmers IA',
  'San Isidro-San Roque Irrigators Group',
  'Individual / Non-IA Member (Rainfed / Shallow Tube)'
];

export const INITIAL_LFT_ACCOUNTS: LftAccount[] = [
  {
    id: 'lft-wella-s-bongons',
    name: 'Wella S. Bongons',
    barangay: 'Salvacion, Laguma, Pd2, Pd1, Sap-ang',
    assignedBarangays: ['Salvacion', 'Laguma', 'Pd2', 'Pd1', 'Sap-ang'],
    username: 'wella.bongons',
    contactNumber: '0917-829-4501',
    terrain: 'NIA Irrigated Lowland & River Basin Sector',
    areaHa: 25.4,
    status: 'Certified Field LFT (Active)',
    email: 'wella.bongons@silago-agriculture.gov.ph',
    puroks: 22
  },
  {
    id: 'lft-brando-t-tabugon',
    name: 'Brando T. Tabugon',
    barangay: 'Mercedes, Katipunan, Puntana, Hingatungan',
    assignedBarangays: ['Mercedes', 'Katipunan', 'Puntana', 'Hingatungan', 'Brando'],
    username: 'brando.tabugon',
    contactNumber: '0928-554-7123',
    terrain: 'Lowland Alluvial & High Yield Plain',
    areaHa: 22.1,
    status: 'Certified Field LFT (Active)',
    email: 'brando.tabugon@silago-agriculture.gov.ph',
    puroks: 20
  }
];

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  updateCurrentUserProfile: (profile: Partial<User>) => void;
  updateCurrentUserPassword: (newPassword: string) => void;
  verifyCurrentUserPassword: (password: string) => boolean;
  parcels: FarmParcel[];
  addParcel: (parcel: FarmParcel) => void;
  updateParcel: (tagNumber: string, updated: Partial<FarmParcel>) => void;
  deleteParcel: (tagNumber: string) => void;
  resetParcels: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;

  // LFT Officer Accounts Management
  lftAccounts: LftAccount[];
  addLftAccount: (account: Omit<LftAccount, 'id'>) => void;
  updateLftAccount: (id: string, updated: Partial<LftAccount>) => void;
  deleteLftAccount: (id: string) => void;
  resetLftAccounts: () => void;
  reorderLftAccounts: (accountsOrStartIndex: LftAccount[] | number, endIndex?: number) => void;

  bgPhotoUrl: string;
  bgOpacity: number;
  bgBlur: number;
  bgActive: boolean;
  setBgPhotoUrl: (url: string, name?: string, source?: 'upload' | 'preset') => void;
  setBgOpacity: (opacity: number) => void;
  setBgBlur: (blur: number) => void;
  setBgActive: (active: boolean) => void;
  removeBgPhoto: () => void;
  backgroundHistory: BackgroundPreset[];
  addToBackgroundHistory: (url: string, name?: string, source?: 'upload' | 'preset') => void;
  removeFromBackgroundHistory: (id: string) => void;
  clearBackgroundHistory: () => void;

  daLogoUrl: string | null;
  setDaLogoUrl: (url: string | null) => void;
  silagoLogoUrl: string | null;
  setSilagoLogoUrl: (url: string | null) => void;
  bagOngSilagoLogoUrl: string | null;
  setBagOngSilagoLogoUrl: (url: string | null) => void;
  southernLeyteLogoUrl: string | null;
  setSouthernLeyteLogoUrl: (url: string | null) => void;
  bagongPilipinasLogoUrl: string | null;
  setBagongPilipinasLogoUrl: (url: string | null) => void;
  portalBannerUrl: string | null;
  setPortalBannerUrl: (url: string | null) => void;
  resetLogos: () => void;

  // Central Admin Profile & Password Settings
  adminProfile: {
    name: string;
    title: string;
    email: string;
    contactNumber: string;
    office: string;
    photoUrl?: string;
  };
  updateAdminProfile: (data: Partial<{
    name: string;
    title: string;
    email: string;
    contactNumber: string;
    office: string;
    photoUrl?: string;
  }>) => void;
  verifyAdminPassword: (password: string) => boolean;
  updateAdminPassword: (newPassword: string) => void;

  slsuPhotoUrl: string;
  setSlsuPhotoUrl: (url: string) => void;
  slsuLayoutMode: 'banner' | 'full' | 'seal';
  setSlsuLayoutMode: (mode: 'banner' | 'full' | 'seal') => void;
  slsuCaption: string;
  setSlsuCaption: (caption: string) => void;
  slsuSealLogoUrl: string | null;
  setSlsuSealLogoUrl: (url: string | null) => void;
  slsuUniversityName: string;
  setSlsuUniversityName: (name: string) => void;
  slsuMotto: string;
  setSlsuMotto: (motto: string) => void;
  slsuYear: string;
  setSlsuYear: (year: string) => void;
  slsuCenterTitle: string;
  setSlsuCenterTitle: (title: string) => void;
  slsuCenterSubtitle: string;
  setSlsuCenterSubtitle: (sub: string) => void;
  slsuBadgeTag: string;
  setSlsuBadgeTag: (tag: string) => void;
  slsuTopTags: string;
  setSlsuTopTags: (tags: string) => void;
  settingsActiveSubTab: 'profile' | 'municipal' | 'featured_card' | 'display';
  setSettingsActiveSubTab: (subTab: 'profile' | 'municipal' | 'featured_card' | 'display') => void;
  resetSlsuDetails: () => void;
  resetAllDefaults: () => void;

  // Manage Varieties (Add, Edit, Delete)
  varieties: RiceVariety[];
  addVariety: (variety: RiceVariety) => void;
  updateVariety: (oldName: string, updated: Partial<RiceVariety>) => void;
  deleteVariety: (name: string) => void;

  // Manage Ecosystems (Add, Edit, Delete)
  ecosystems: string[];
  addEcosystem: (name: string) => void;
  updateEcosystem: (oldName: string, newName: string) => void;
  deleteEcosystem: (name: string) => void;

  // Manage Tenures (Add, Edit, Delete)
  tenures: string[];
  addTenure: (name: string) => void;
  updateTenure: (oldName: string, newName: string) => void;
  deleteTenure: (name: string) => void;

  // Manage Cropping Seasons (Add, Edit, Delete)
  seasons: string[];
  addSeason: (name: string) => void;
  updateSeason: (oldName: string, newName: string) => void;
  deleteSeason: (name: string) => void;

  // Manage Irrigation Associations (Add, Edit, Delete)
  irrigationAssociations: string[];
  addIrrigationAssociation: (name: string) => void;
  updateIrrigationAssociation: (oldName: string, newName: string) => void;
  deleteIrrigationAssociation: (name: string) => void;

  // Master-Detail Seasonal Production Management
  activeSeason: string;
  setActiveSeason: (season: string) => void;
  addSeasonalRecord: (
    parcelTag: string,
    record: Omit<SeasonalProductionRecord, 'id' | 'parcelTag' | 'recordedAt'>
  ) => void;
  updateSeasonalRecord: (
    parcelTag: string,
    recordId: string,
    updated: Partial<SeasonalProductionRecord>
  ) => void;
  deleteSeasonalRecord: (parcelTag: string, recordId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('silago_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('silago_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('silago_auth_user');
    }
  }, [currentUser]);

  // Farm Parcels Database State (Auto-migrates to official photo-based records)
  const [parcels, setParcels] = useState<FarmParcel[]>(() => {
    const DB_VERSION_KEY = 'silago_farm_parcels_db_version';
    const CURRENT_VERSION = 'v2_photo_registry_balagawan';
    const storedVersion = localStorage.getItem(DB_VERSION_KEY);

    if (storedVersion !== CURRENT_VERSION) {
      // Clear previous database and seed with the photo-based official records
      localStorage.removeItem('silago_farm_parcels_db');
      localStorage.setItem(DB_VERSION_KEY, CURRENT_VERSION);
      localStorage.setItem('silago_farm_parcels_db', JSON.stringify(INITIAL_PARCELS));
      return INITIAL_PARCELS;
    }

    const saved = localStorage.getItem('silago_farm_parcels_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If previous data lacked photo records, replace with INITIAL_PARCELS
          const hasPhotoRecords = parsed.some((p: FarmParcel) => p.farmerFamilyName === 'ALAS' || p.raiserName?.includes('ALAS'));
          if (!hasPhotoRecords) {
            localStorage.setItem('silago_farm_parcels_db', JSON.stringify(INITIAL_PARCELS));
            return INITIAL_PARCELS;
          }

          return parsed.map((p: FarmParcel) => {
            const assignedLft = getAssignedLftForBarangay(p.barangay).name;
            const updatedSeasonal = (p.seasonalRecords && p.seasonalRecords.length > 0
              ? p.seasonalRecords
              : generateInitialSeasonalRecords({ ...p, focalPerson: assignedLft })
            ).map((r) => ({
              ...r,
              lftOfficerName: (r.lftOfficerName && (r.lftOfficerName.includes('Wella') || r.lftOfficerName.includes('Brando')))
                ? r.lftOfficerName
                : assignedLft
            }));

            return {
              ...p,
              focalPerson: assignedLft,
              seasonalRecords: updatedSeasonal
            };
          });
        }
      } catch (e) {
        console.error('Failed to parse saved parcels', e);
      }
    }
    return INITIAL_PARCELS;
  });

  // Active Cropping Season (LFT Twice-a-Year Rice Production)
  const [activeSeason, setActiveSeason] = useState<string>(ACTIVE_SEASON);

  const saveParcels = (newParcels: FarmParcel[]) => {
    setParcels(newParcels);
    try {
      localStorage.setItem('silago_farm_parcels_db', JSON.stringify(newParcels));
    } catch (e) {
      console.warn('Storage quota limit reached when saving parcels', e);
    }
  };

  const addParcel = (parcel: FarmParcel) => {
    const withSeasonal: FarmParcel = {
      ...parcel,
      seasonalRecords:
        parcel.seasonalRecords && parcel.seasonalRecords.length > 0
          ? parcel.seasonalRecords
          : generateInitialSeasonalRecords(parcel)
    };
    const updated = [withSeasonal, ...parcels];
    saveParcels(updated);
  };

  const updateParcel = (tagNumber: string, updatedFields: Partial<FarmParcel>) => {
    const updated = parcels.map((p) => (p.tagNumber === tagNumber ? { ...p, ...updatedFields } : p));
    saveParcels(updated);
  };

  const deleteParcel = (tagNumber: string) => {
    const updated = parcels.filter((p) => p.tagNumber !== tagNumber);
    saveParcels(updated);
  };

  const resetParcels = () => {
    saveParcels(INITIAL_PARCELS);
  };

  // Master-Detail Seasonal Production Record Methods
  const addSeasonalRecord = (
    parcelTag: string,
    record: Omit<SeasonalProductionRecord, 'id' | 'parcelTag' | 'recordedAt'>
  ) => {
    const newRecord: SeasonalProductionRecord = {
      ...record,
      id: `PROD-${parcelTag}-${Date.now().toString().slice(-6)}`,
      parcelTag,
      recordedAt: new Date().toISOString()
    };

    const updated = parcels.map((p) => {
      if (p.tagNumber === parcelTag) {
        const existing = p.seasonalRecords || [];
        const filtered = existing.filter((r) => r.season !== record.season);
        return {
          ...p,
          seasonalRecords: [newRecord, ...filtered],
          breed: record.seedVariety,
          plantingDate: record.plantingDate,
          croppingSeason: record.season,
          targetYieldMt: record.yieldMtPerHa,
          healthStatus:
            record.growthStage ||
            (record.productionStatus === 'Harvest Completed' ? 'Harvested' : 'Active Crop')
        };
      }
      return p;
    });
    saveParcels(updated);
  };

  const updateSeasonalRecord = (
    parcelTag: string,
    recordId: string,
    updatedFields: Partial<SeasonalProductionRecord>
  ) => {
    const updated = parcels.map((p) => {
      if (p.tagNumber === parcelTag) {
        const existing = p.seasonalRecords || [];
        const newRecords = existing.map((r) =>
          r.id === recordId ? { ...r, ...updatedFields } : r
        );
        return {
          ...p,
          seasonalRecords: newRecords
        };
      }
      return p;
    });
    saveParcels(updated);
  };

  const deleteSeasonalRecord = (parcelTag: string, recordId: string) => {
    const updated = parcels.map((p) => {
      if (p.tagNumber === parcelTag) {
        return {
          ...p,
          seasonalRecords: (p.seasonalRecords || []).filter((r) => r.id !== recordId)
        };
      }
      return p;
    });
    saveParcels(updated);
  };

  // LFT Accounts State
  const [lftAccounts, setLftAccounts] = useState<LftAccount[]>(() => {
    const saved = localStorage.getItem('silago_lft_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasLegacy = Array.isArray(parsed) && parsed.some((a: any) =>
          a.name?.includes('Maria Elena') ||
          a.name?.includes('Ramon Mercado') ||
          a.name?.includes('Guillermo') ||
          a.name?.includes('Eduardo Balatero') ||
          a.name?.includes('Danilo Baldomero') ||
          a.name?.includes('Vicente') ||
          a.username?.includes('poblacion')
        );
        if (!hasLegacy && Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved LFT accounts', e);
      }
    }
    localStorage.setItem('silago_lft_accounts', JSON.stringify(INITIAL_LFT_ACCOUNTS));
    return INITIAL_LFT_ACCOUNTS;
  });

  const saveLftAccounts = (accounts: LftAccount[]) => {
    setLftAccounts(accounts);
    try {
      localStorage.setItem('silago_lft_accounts', JSON.stringify(accounts));
    } catch (e) {
      console.warn('Storage quota limit reached when saving LFT accounts', e);
    }
  };

  const addLftAccount = (accountData: Omit<LftAccount, 'id'>) => {
    const newAccount: LftAccount = {
      ...accountData,
      id: `lft-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    };
    const updated = [newAccount, ...lftAccounts];
    saveLftAccounts(updated);
  };

  const updateLftAccount = (id: string, updatedFields: Partial<LftAccount>) => {
    const updated = lftAccounts.map((acc) => (acc.id === id ? { ...acc, ...updatedFields } : acc));
    saveLftAccounts(updated);
  };

  const deleteLftAccount = (id: string) => {
    const updated = lftAccounts.filter((acc) => acc.id !== id);
    saveLftAccounts(updated);
  };

  const resetLftAccounts = () => {
    saveLftAccounts(INITIAL_LFT_ACCOUNTS);
  };

  const reorderLftAccounts = (accountsOrStartIndex: LftAccount[] | number, endIndex?: number) => {
    if (typeof accountsOrStartIndex === 'number' && typeof endIndex === 'number') {
      const result: LftAccount[] = [...lftAccounts];
      if (
        accountsOrStartIndex >= 0 &&
        accountsOrStartIndex < result.length &&
        endIndex >= 0 &&
        endIndex < result.length
      ) {
        const [removed] = result.splice(accountsOrStartIndex, 1);
        result.splice(endIndex, 0, removed);
        saveLftAccounts(result);
      }
    } else if (Array.isArray(accountsOrStartIndex)) {
      saveLftAccounts(accountsOrStartIndex);
    }
  };

  // Language State
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('silago_language') as Language) || 'EN';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('silago_language', lang);
  };

  // Background & Media Settings
  const [bgPhotoUrl, setBgPhotoUrlState] = useState<string>(() => {
    return localStorage.getItem('silago_bg_photo_url') || DEFAULT_BG_PHOTO;
  });

  const [bgOpacity, setBgOpacityState] = useState<number>(() => {
    const saved = localStorage.getItem('silago_bg_opacity');
    return saved !== null ? Number(saved) : 0.09;
  });

  const [bgBlur, setBgBlurState] = useState<number>(() => {
    const saved = localStorage.getItem('silago_bg_blur');
    return saved !== null ? Number(saved) : 1;
  });

  const [bgActive, setBgActiveState] = useState<boolean>(() => {
    const saved = localStorage.getItem('silago_bg_active');
    return saved !== null ? saved === 'true' : true;
  });

  const [backgroundHistory, setBackgroundHistory] = useState<BackgroundPreset[]>(() => {
    const saved = localStorage.getItem('silago_bg_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse background history', e);
      }
    }
    return PRESET_BACKGROUNDS;
  });

  const updateHistory = (history: BackgroundPreset[]) => {
    setBackgroundHistory(history);
    try {
      localStorage.setItem('silago_bg_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Storage quota limit reached when saving background history', e);
    }
  };

  const addToBackgroundHistory = (url: string, name?: string, source: 'upload' | 'preset' = 'upload') => {
    const existingIdx = backgroundHistory.findIndex((h) => h.url === url);
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    let updated: BackgroundPreset[] = [
      {
        id: `bg-hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        url,
        name: name || (source === 'upload' ? `Uploaded Photo (${dateStr})` : 'Custom Background Photo'),
        timestamp: dateStr,
        source
      },
      ...backgroundHistory.filter((_, idx) => idx !== existingIdx)
    ];
    if (updated.length > 25) updated = updated.slice(0, 25);
    updateHistory(updated);
  };

  const removeFromBackgroundHistory = (id: string) => {
    const updated = backgroundHistory.filter((h) => h.id !== id);
    updateHistory(updated);
  };

  const clearBackgroundHistory = () => {
    const current = backgroundHistory.find((h) => h.url === bgPhotoUrl);
    updateHistory(current ? [current] : []);
  };

  const setBgPhotoUrl = (url: string, name?: string, source: 'upload' | 'preset' = 'upload') => {
    setBgPhotoUrlState(url);
    setBgActiveState(true);
    localStorage.setItem('silago_bg_photo_url', url);
    localStorage.setItem('silago_bg_active', 'true');
    addToBackgroundHistory(url, name, source);
  };

  const setBgOpacity = (val: number) => {
    setBgOpacityState(val);
    localStorage.setItem('silago_bg_opacity', String(val));
  };

  const setBgBlur = (val: number) => {
    setBgBlurState(val);
    localStorage.setItem('silago_bg_blur', String(val));
  };

  const setBgActive = (val: boolean) => {
    setBgActiveState(val);
    localStorage.setItem('silago_bg_active', String(val));
  };

  const removeBgPhoto = () => {
    setBgActiveState(false);
    localStorage.setItem('silago_bg_active', 'false');
  };

  // Logos Settings
  const [daLogoUrl, setDaLogoUrlState] = useState<string | null>(() => localStorage.getItem('silago_da_logo_url'));
  const [silagoLogoUrl, setSilagoLogoUrlState] = useState<string | null>(() => localStorage.getItem('silago_seal_url'));
  const [bagOngSilagoLogoUrl, setBagOngSilagoLogoUrlState] = useState<string | null>(() => localStorage.getItem('silago_bag_ong_logo_url'));
  const [southernLeyteLogoUrl, setSouthernLeyteLogoUrlState] = useState<string | null>(() => localStorage.getItem('silago_southern_leyte_logo_url'));
  const [bagongPilipinasLogoUrl, setBagongPilipinasLogoUrlState] = useState<string | null>(() => localStorage.getItem('silago_bagong_pilipinas_logo_url'));
  const [portalBannerUrl, setPortalBannerUrlState] = useState<string | null>(() => localStorage.getItem('silago_portal_banner_url'));

  const setDaLogoUrl = (url: string | null) => {
    setDaLogoUrlState(url);
    if (url) localStorage.setItem('silago_da_logo_url', url);
    else localStorage.removeItem('silago_da_logo_url');
  };

  const setSilagoLogoUrl = (url: string | null) => {
    setSilagoLogoUrlState(url);
    if (url) localStorage.setItem('silago_seal_url', url);
    else localStorage.removeItem('silago_seal_url');
  };

  const setBagOngSilagoLogoUrl = (url: string | null) => {
    setBagOngSilagoLogoUrlState(url);
    if (url) localStorage.setItem('silago_bag_ong_logo_url', url);
    else localStorage.removeItem('silago_bag_ong_logo_url');
  };

  const setSouthernLeyteLogoUrl = (url: string | null) => {
    setSouthernLeyteLogoUrlState(url);
    if (url) localStorage.setItem('silago_southern_leyte_logo_url', url);
    else localStorage.removeItem('silago_southern_leyte_logo_url');
  };

  const setBagongPilipinasLogoUrl = (url: string | null) => {
    setBagongPilipinasLogoUrlState(url);
    if (url) localStorage.setItem('silago_bagong_pilipinas_logo_url', url);
    else localStorage.removeItem('silago_bagong_pilipinas_logo_url');
  };

  const setPortalBannerUrl = (url: string | null) => {
    setPortalBannerUrlState(url);
    if (url) localStorage.setItem('silago_portal_banner_url', url);
    else localStorage.removeItem('silago_portal_banner_url');
  };

  const resetLogos = () => {
    setDaLogoUrl(null);
    setSilagoLogoUrl(null);
    setBagOngSilagoLogoUrl(null);
    setSouthernLeyteLogoUrl(null);
    setBagongPilipinasLogoUrl(null);
    setPortalBannerUrl(null);
    localStorage.removeItem('silago_da_logo_url');
    localStorage.removeItem('silago_seal_url');
    localStorage.removeItem('silago_bag_ong_logo_url');
    localStorage.removeItem('silago_southern_leyte_logo_url');
    localStorage.removeItem('silago_bagong_pilipinas_logo_url');
    localStorage.removeItem('silago_portal_banner_url');
  };

  // Central Administrator Profile & Password
  const [adminProfile, setAdminProfile] = useState<{
    name: string;
    title: string;
    email: string;
    contactNumber: string;
    office: string;
    photoUrl?: string;
  }>(() => {
    const saved = localStorage.getItem('silago_admin_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name && parsed.name !== 'Engr. Arnaldo M. Valdez') {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse admin profile', e);
      }
    }
    return {
      name: 'Ray Paul Madaje',
      title: 'Municipal Agriculturist / LFT Program Coordinator',
      email: 'mao.silago@southernleyte.gov.ph',
      contactNumber: '(053) 545-1200 / 0917-555-4321',
      office: 'Silago Municipal Agriculture Office (DA-MAO)',
      photoUrl: ''
    };
  });

  const updateAdminProfile = (data: Partial<typeof adminProfile>) => {
    const updated = { ...adminProfile, ...data };
    setAdminProfile(updated);
    localStorage.setItem('silago_admin_profile', JSON.stringify(updated));

    // If currently logged in as Central Admin, update currentUser state
    if (currentUser?.role === 'Central Admin') {
      const updatedUser: User = {
        ...currentUser,
        name: updated.name,
        title: updated.title,
        email: updated.email,
        contactNumber: updated.contactNumber,
        office: updated.office,
        photoUrl: updated.photoUrl
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('silago_auth_user', JSON.stringify(updatedUser));
    }
  };

  const verifyAdminPassword = (pwd: string): boolean => {
    const saved = localStorage.getItem('silago_admin_password') || 'admin123';
    return pwd === saved;
  };

  const updateAdminPassword = (newPassword: string) => {
    localStorage.setItem('silago_admin_password', newPassword);
  };

  const updateCurrentUserProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser: User = {
      ...currentUser,
      ...data
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('silago_auth_user', JSON.stringify(updatedUser));

    if (currentUser.role === 'Central Admin') {
      updateAdminProfile({
        name: updatedUser.name,
        title: updatedUser.title,
        email: updatedUser.email,
        contactNumber: updatedUser.contactNumber,
        office: updatedUser.office,
        photoUrl: updatedUser.photoUrl
      });
    } else {
      const matchingAccount = lftAccounts.find(
        (acc) => acc.username === currentUser.username || acc.name === currentUser.name
      );
      if (matchingAccount) {
        updateLftAccount(matchingAccount.id, {
          name: updatedUser.name,
          contactNumber: updatedUser.contactNumber || matchingAccount.contactNumber,
          email: updatedUser.email || matchingAccount.email
        });
      }
    }
  };

  const updateCurrentUserPassword = (newPassword: string) => {
    if (!currentUser) return;
    if (currentUser.role === 'Central Admin') {
      updateAdminPassword(newPassword);
    } else {
      localStorage.setItem(`silago_lft_password_${currentUser.username}`, newPassword);
    }
  };

  const verifyCurrentUserPassword = (pwd: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'Central Admin') {
      return verifyAdminPassword(pwd);
    } else {
      const saved = localStorage.getItem(`silago_lft_password_${currentUser.username}`) || 'lft123';
      return pwd === saved || pwd === 'admin123';
    }
  };

  // SLSU Center Settings
  const [slsuPhotoUrl, setSlsuPhotoUrlState] = useState<string>(() => localStorage.getItem('silago_slsu_photo_url') || DEFAULT_SLSU_PHOTO);
  const [slsuLayoutMode, setSlsuLayoutModeState] = useState<'banner' | 'full' | 'seal'>(() => {
    const saved = localStorage.getItem('silago_slsu_layout_mode');
    return (saved as 'banner' | 'full' | 'seal') || 'full';
  });
  const [slsuCaption, setSlsuCaptionState] = useState<string>(() => localStorage.getItem('silago_slsu_caption') || SLSU_DEFAULTS.caption);
  const [slsuSealLogoUrl, setSlsuSealLogoUrlState] = useState<string | null>(() => localStorage.getItem('silago_slsu_seal_logo_url'));
  const [slsuUniversityName, setSlsuUniversityNameState] = useState<string>(() => localStorage.getItem('silago_slsu_university_name') || SLSU_DEFAULTS.universityName);
  const [slsuMotto, setSlsuMottoState] = useState<string>(() => localStorage.getItem('silago_slsu_motto') || SLSU_DEFAULTS.motto);
  const [slsuYear, setSlsuYearState] = useState<string>(() => localStorage.getItem('silago_slsu_year') || SLSU_DEFAULTS.year);
  const [slsuCenterTitle, setSlsuCenterTitleState] = useState<string>(() => localStorage.getItem('silago_slsu_center_title') || SLSU_DEFAULTS.centerTitle);
  const [slsuCenterSubtitle, setSlsuCenterSubtitleState] = useState<string>(() => localStorage.getItem('silago_slsu_center_subtitle') || SLSU_DEFAULTS.centerSubtitle);
  const [slsuBadgeTag, setSlsuBadgeTagState] = useState<string>(() => localStorage.getItem('silago_slsu_badge_tag') || SLSU_DEFAULTS.badgeTag || 'SILAGO RICE DEMONSTRATION COMPLEX');
  const [slsuTopTags, setSlsuTopTagsState] = useState<string>(() => localStorage.getItem('silago_slsu_top_tags') || SLSU_DEFAULTS.topTags || '• HIGH YIELD • CERTIFIED SEED • CLIMATE RESILIENT •');
  const [settingsActiveSubTab, setSettingsActiveSubTab] = useState<'profile' | 'municipal' | 'featured_card' | 'display'>('profile');

  const setSlsuPhotoUrl = (url: string) => {
    setSlsuPhotoUrlState(url);
    localStorage.setItem('silago_slsu_photo_url', url);
  };
  const setSlsuLayoutMode = (mode: 'banner' | 'full' | 'seal') => {
    setSlsuLayoutModeState(mode);
    localStorage.setItem('silago_slsu_layout_mode', mode);
  };
  const setSlsuCaption = (cap: string) => {
    setSlsuCaptionState(cap);
    localStorage.setItem('silago_slsu_caption', cap);
  };
  const setSlsuSealLogoUrl = (url: string | null) => {
    setSlsuSealLogoUrlState(url);
    if (url) localStorage.setItem('silago_slsu_seal_logo_url', url);
    else localStorage.removeItem('silago_slsu_seal_logo_url');
  };
  const setSlsuUniversityName = (name: string) => {
    setSlsuUniversityNameState(name);
    localStorage.setItem('silago_slsu_university_name', name);
  };
  const setSlsuMotto = (motto: string) => {
    setSlsuMottoState(motto);
    localStorage.setItem('silago_slsu_motto', motto);
  };
  const setSlsuYear = (year: string) => {
    setSlsuYearState(year);
    localStorage.setItem('silago_slsu_year', year);
  };
  const setSlsuCenterTitle = (title: string) => {
    setSlsuCenterTitleState(title);
    localStorage.setItem('silago_slsu_center_title', title);
  };
  const setSlsuCenterSubtitle = (sub: string) => {
    setSlsuCenterSubtitleState(sub);
    localStorage.setItem('silago_slsu_center_subtitle', sub);
  };
  const setSlsuBadgeTag = (tag: string) => {
    setSlsuBadgeTagState(tag);
    localStorage.setItem('silago_slsu_badge_tag', tag);
  };
  const setSlsuTopTags = (tags: string) => {
    setSlsuTopTagsState(tags);
    localStorage.setItem('silago_slsu_top_tags', tags);
  };

  const resetSlsuDetails = () => {
    setSlsuUniversityNameState(SLSU_DEFAULTS.universityName);
    setSlsuMottoState(SLSU_DEFAULTS.motto);
    setSlsuYearState(SLSU_DEFAULTS.year);
    setSlsuCenterTitleState(SLSU_DEFAULTS.centerTitle);
    setSlsuCenterSubtitleState(SLSU_DEFAULTS.centerSubtitle);
    setSlsuBadgeTagState(SLSU_DEFAULTS.badgeTag || 'SILAGO RICE DEMONSTRATION COMPLEX');
    setSlsuTopTagsState(SLSU_DEFAULTS.topTags || '• HIGH YIELD • CERTIFIED SEED • CLIMATE RESILIENT •');
    setSlsuSealLogoUrlState(null);
    setSlsuPhotoUrlState(DEFAULT_SLSU_PHOTO);
    setSlsuCaptionState(SLSU_DEFAULTS.caption);
    localStorage.removeItem('silago_slsu_university_name');
    localStorage.removeItem('silago_slsu_motto');
    localStorage.removeItem('silago_slsu_year');
    localStorage.removeItem('silago_slsu_center_title');
    localStorage.removeItem('silago_slsu_center_subtitle');
    localStorage.removeItem('silago_slsu_badge_tag');
    localStorage.removeItem('silago_slsu_top_tags');
    localStorage.removeItem('silago_slsu_seal_logo_url');
    localStorage.removeItem('silago_slsu_photo_url');
    localStorage.removeItem('silago_slsu_caption');
  };

  const resetAllDefaults = () => {
    setBgPhotoUrlState(DEFAULT_BG_PHOTO);
    setBgOpacityState(0.09);
    setBgBlurState(1);
    setBgActiveState(true);
    resetLogos();
    resetSlsuDetails();
    updateHistory(PRESET_BACKGROUNDS);
    saveParcels(INITIAL_PARCELS);
    setCurrentUser(null);
    setLanguageState('EN');
    localStorage.clear();
  };

  // ==========================================
  // DYNAMIC REFERENCE DATA (ADD, EDIT, DELETE)
  // ==========================================

  // 1. Rice Varieties
  const [varieties, setVarieties] = useState<RiceVariety[]>(() => {
    const saved = localStorage.getItem('silago_rice_varieties');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse varieties', e);
      }
    }
    return RICE_VARIETIES;
  });

  const saveVarieties = (newVarieties: RiceVariety[]) => {
    setVarieties(newVarieties);
    try {
      localStorage.setItem('silago_rice_varieties', JSON.stringify(newVarieties));
    } catch (e) {
      console.warn('Storage quota limit reached when saving varieties', e);
    }
  };

  const addVariety = (variety: RiceVariety) => {
    const updated = [variety, ...varieties.filter((v) => v.name.toLowerCase() !== variety.name.toLowerCase())];
    saveVarieties(updated);
  };

  const updateVariety = (oldName: string, updatedFields: Partial<RiceVariety>) => {
    const updated = varieties.map((v) => (v.name === oldName ? { ...v, ...updatedFields } : v));
    saveVarieties(updated);
  };

  const deleteVariety = (name: string) => {
    const updated = varieties.filter((v) => v.name !== name);
    saveVarieties(updated);
  };

  // 2. Agro-Ecosystems
  const [ecosystems, setEcosystems] = useState<string[]>(() => {
    const saved = localStorage.getItem('silago_ecosystems');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse ecosystems', e);
      }
    }
    return DEFAULT_ECOSYSTEMS;
  });

  const saveEcosystems = (items: string[]) => {
    setEcosystems(items);
    try {
      localStorage.setItem('silago_ecosystems', JSON.stringify(items));
    } catch (e) {
      console.warn('Storage quota limit reached when saving ecosystems', e);
    }
  };

  const addEcosystem = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || ecosystems.includes(trimmed)) return;
    saveEcosystems([...ecosystems, trimmed]);
  };

  const updateEcosystem = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    saveEcosystems(ecosystems.map((e) => (e === oldName ? trimmed : e)));
  };

  const deleteEcosystem = (name: string) => {
    saveEcosystems(ecosystems.filter((e) => e !== name));
  };

  // 3. Tenurial Statuses
  const [tenures, setTenures] = useState<string[]>(() => {
    const saved = localStorage.getItem('silago_tenures');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse tenures', e);
      }
    }
    return DEFAULT_TENURES;
  });

  const saveTenures = (items: string[]) => {
    setTenures(items);
    try {
      localStorage.setItem('silago_tenures', JSON.stringify(items));
    } catch (e) {
      console.warn('Storage quota limit reached when saving tenures', e);
    }
  };

  const addTenure = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || tenures.includes(trimmed)) return;
    saveTenures([...tenures, trimmed]);
  };

  const updateTenure = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    saveTenures(tenures.map((t) => (t === oldName ? trimmed : t)));
  };

  const deleteTenure = (name: string) => {
    saveTenures(tenures.filter((t) => t !== name));
  };

  // 4. Cropping Seasons
  const [seasons, setSeasons] = useState<string[]>(() => {
    const saved = localStorage.getItem('silago_seasons');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse seasons', e);
      }
    }
    return DEFAULT_SEASONS;
  });

  const saveSeasons = (items: string[]) => {
    setSeasons(items);
    try {
      localStorage.setItem('silago_seasons', JSON.stringify(items));
    } catch (e) {
      console.warn('Storage quota limit reached when saving seasons', e);
    }
  };

  const addSeason = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || seasons.includes(trimmed)) return;
    saveSeasons([...seasons, trimmed]);
  };

  const updateSeason = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    saveSeasons(seasons.map((s) => (s === oldName ? trimmed : s)));
  };

  const deleteSeason = (name: string) => {
    saveSeasons(seasons.filter((s) => s !== name));
  };

  // 5. Irrigation Associations (IA)
  const [irrigationAssociations, setIrrigationAssociations] = useState<string[]>(() => {
    const saved = localStorage.getItem('silago_irrigation_associations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse irrigation associations', e);
      }
    }
    return DEFAULT_IRRIGATION_ASSOCIATIONS;
  });

  const saveIrrigationAssociations = (items: string[]) => {
    setIrrigationAssociations(items);
    try {
      localStorage.setItem('silago_irrigation_associations', JSON.stringify(items));
    } catch (e) {
      console.warn('Storage quota limit reached when saving IAs', e);
    }
  };

  const addIrrigationAssociation = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || irrigationAssociations.includes(trimmed)) return;
    saveIrrigationAssociations([...irrigationAssociations, trimmed]);
  };

  const updateIrrigationAssociation = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    saveIrrigationAssociations(irrigationAssociations.map((ia) => (ia === oldName ? trimmed : ia)));
  };

  const deleteIrrigationAssociation = (name: string) => {
    saveIrrigationAssociations(irrigationAssociations.filter((ia) => ia !== name));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        parcels,
        addParcel,
        updateParcel,
        deleteParcel,
        resetParcels,
        lftAccounts,
        addLftAccount,
        updateLftAccount,
        deleteLftAccount,
        resetLftAccounts,
        reorderLftAccounts,
        language,
        setLanguage,
        bgPhotoUrl,
        bgOpacity,
        bgBlur,
        bgActive,
        setBgPhotoUrl,
        setBgOpacity,
        setBgBlur,
        setBgActive,
        removeBgPhoto,
        backgroundHistory,
        addToBackgroundHistory,
        removeFromBackgroundHistory,
        clearBackgroundHistory,
        daLogoUrl,
        setDaLogoUrl,
        silagoLogoUrl,
        setSilagoLogoUrl,
        bagOngSilagoLogoUrl,
        setBagOngSilagoLogoUrl,
        southernLeyteLogoUrl,
        setSouthernLeyteLogoUrl,
        bagongPilipinasLogoUrl,
        setBagongPilipinasLogoUrl,
        portalBannerUrl,
        setPortalBannerUrl,
        resetLogos,
        adminProfile,
        updateAdminProfile,
        verifyAdminPassword,
        updateAdminPassword,
        slsuPhotoUrl,
        setSlsuPhotoUrl,
        slsuLayoutMode,
        setSlsuLayoutMode,
        slsuCaption,
        setSlsuCaption,
        slsuSealLogoUrl,
        setSlsuSealLogoUrl,
        slsuUniversityName,
        setSlsuUniversityName,
        slsuMotto,
        setSlsuMotto,
        slsuYear,
        setSlsuYear,
        slsuCenterTitle,
        setSlsuCenterTitle,
        slsuCenterSubtitle,
        setSlsuCenterSubtitle,
        slsuBadgeTag,
        setSlsuBadgeTag,
        slsuTopTags,
        setSlsuTopTags,
        settingsActiveSubTab,
        setSettingsActiveSubTab,
        resetSlsuDetails,
        resetAllDefaults,
        // Manage Varieties (Add, Edit, Delete)
        varieties,
        addVariety,
        updateVariety,
        deleteVariety,
        // Manage Ecosystems (Add, Edit, Delete)
        ecosystems,
        addEcosystem,
        updateEcosystem,
        deleteEcosystem,
        // Manage Tenures (Add, Edit, Delete)
        tenures,
        addTenure,
        updateTenure,
        deleteTenure,
        // Manage Cropping Seasons (Add, Edit, Delete)
        seasons,
        addSeason,
        updateSeason,
        deleteSeason,
        // Manage Irrigation Associations (Add, Edit, Delete)
        irrigationAssociations,
        addIrrigationAssociation,
        updateIrrigationAssociation,
        deleteIrrigationAssociation,
        // Master-Detail Seasonal Production
        activeSeason,
        setActiveSeason,
        addSeasonalRecord,
        updateSeasonalRecord,
        deleteSeasonalRecord
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
