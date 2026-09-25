import { BackgroundPreset, FarmParcel } from '../types';

export const DEFAULT_BG_PHOTO = "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1920&q=80";
export const DEFAULT_RICE_PHOTO = "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80";
export const DEFAULT_SLSU_PHOTO = DEFAULT_RICE_PHOTO;

export const RICE_DEFAULTS = {
  centerTitle: "SILAGO RICE PRODUCTION & RESEARCH CENTER",
  centerSubtitle: "Silago Model Rice Farm & Certified Inbred Seed Complex",
  badgeTag: "SILAGO RICE DEMONSTRATION COMPLEX",
  topTags: "• HIGH YIELD • CERTIFIED SEED • CLIMATE RESILIENT •",
  motto: "• CLIMATE RESILIENT • CERTIFIED SEED • HIGH YIELD •",
  caption: "High-yield palay demonstration, climate-resilient inbred seed repository & farmer field school",
  programName: "DA-MAO Silago Rice Program"
};

export const SLSU_DEFAULTS = {
  universityName: RICE_DEFAULTS.centerTitle,
  motto: RICE_DEFAULTS.motto,
  year: "Rice Program",
  centerTitle: RICE_DEFAULTS.centerTitle,
  centerSubtitle: RICE_DEFAULTS.centerSubtitle,
  caption: RICE_DEFAULTS.caption,
  badgeTag: RICE_DEFAULTS.badgeTag,
  topTags: RICE_DEFAULTS.topTags
};

export const PRESET_BACKGROUNDS: BackgroundPreset[] = [
  {
    id: "preset-terraces",
    url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1920&q=80",
    name: "Silago Verdant Rice Terraces",
    timestamp: "Emerald green terraced rice paddies with mountain mist",
    source: "preset"
  },
  {
    id: "preset-river",
    url: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=1920&q=80",
    name: "Hinabian River Irrigation Basin",
    timestamp: "Freshwater stream canal network nourishing lowland rice",
    source: "preset"
  },
  {
    id: "preset-sunrise",
    url: "https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&w=1920&q=80",
    name: "Southern Leyte Mountain Sunrise",
    timestamp: "Morning fog rising over lush tropical agricultural valleys",
    source: "preset"
  },
  {
    id: "preset-harvest",
    url: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1920&q=80",
    name: "Golden Grain Harvest Season",
    timestamp: "Abundant golden palay heads ready for mechanical harvesting",
    source: "preset"
  },
  {
    id: "preset-coastal",
    url: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f7?auto=format&fit=crop&w=1920&q=80",
    name: "Pacific Coast Lowland Farmlands",
    timestamp: "Coastal agro-ecosystem between the Pacific and mountains",
    source: "preset"
  }
];

export interface SlsuPreset {
  id: string;
  name: string;
  desc: string;
  url: string;
}

export const SLSU_EXTENSION_PRESETS: SlsuPreset[] = [
  {
    id: "rice-center",
    name: "Silago Rice Demonstration & Training Center",
    desc: "Municipal rice demonstration complex & farmer training hall",
    url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "rice-agronomy",
    name: "Agronomy Demonstration & Seed Farm",
    desc: "Field trial plots for high-yield certified inbred rice varieties",
    url: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "rice-nursery",
    name: "Community Rice Seedling Nursery",
    desc: "Municipal certified seedling nursery bed for farmer distribution",
    url: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "rice-workshop",
    name: "Farmer Field School & Palay Harvest Demo",
    desc: "Rice specialists and local palay tillers in technical field session",
    url: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f7?auto=format&fit=crop&w=1200&q=80"
  }
];

export const RICE_EXTENSION_PRESETS = SLSU_EXTENSION_PRESETS;

export const FALLBACK_FARMER_PHOTOS = [
  { url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80", name: "Senior Farmer Tiller", role: "Owner-Cultivator (RSBSA Verified)" },
  { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80", name: "Woman Agrarian Beneficiary", role: "Agrarian Reform Beneficiary (ARB)" },
  { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80", name: "Experienced Palay Tiller", role: "Registered Owner-Cultivator" },
  { url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80", name: "Certified Rice Seed Producer", role: "Hybrid Rice Cooperator" },
  { url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80", name: "Rural Women Farmer", role: "Tenant Farmer" }
];

export const FALLBACK_LAND_PHOTOS = [
  { url: "https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&w=800&q=80", title: "Irrigated Lowland Palay Terraces", desc: "Lush green rice paddy plots with NIA lateral canal water distribution." },
  { url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80", title: "River Basin Rice Plots", desc: "Alluvial fertile lowland rice field bordering tropical coconut groves." },
  { url: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f7?auto=format&fit=crop&w=800&q=80", title: "Emerald Palay Basin", desc: "Active tillering stage palay parcels with boundary bunds and dikes." },
  { url: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80", title: "Ripening Golden Palay Panicles", desc: "Healthy certified palay crop ready for mechanical threshing." }
];

export function getLandPhoto(parcel: Partial<FarmParcel>): string {
  if (parcel.fieldPhotoUrl && parcel.fieldPhotoUrl.trim() !== '') return parcel.fieldPhotoUrl;
  if (parcel.landPhotoUrl && parcel.landPhotoUrl.trim() !== '') return parcel.landPhotoUrl;
  let hash = 0;
  const str = (parcel.tagNumber || '') + (parcel.barangay || '');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return FALLBACK_LAND_PHOTOS[Math.abs(hash) % FALLBACK_LAND_PHOTOS.length].url;
}

export function getFarmerPhoto(parcel: Partial<FarmParcel>): string {
  if (parcel.photoUrl && parcel.photoUrl.trim() !== '') return parcel.photoUrl;
  if (parcel.farmerPhotoUrl && parcel.farmerPhotoUrl.trim() !== '') return parcel.farmerPhotoUrl;
  let hash = 0;
  const str = (parcel.raiserName || '') + (parcel.swineNameOrId || '');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return FALLBACK_FARMER_PHOTOS[Math.abs(hash) % FALLBACK_FARMER_PHOTOS.length].url;
}
