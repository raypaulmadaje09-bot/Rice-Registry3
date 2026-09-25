import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { BARANGAYS } from '../data/barangays';
import { FarmParcel, Barangay, PortalTab } from '../types';
import { SeasonalCropCalendar } from '../components/SeasonalCropCalendar';
import {
  Wheat,
  Compass,
  Building2,
  ShieldCheck,
  Plus,
  FileText,
  CheckCircle2,
  X
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateToTab: (tab: PortalTab) => void;
  onSelectParcel: (parcel: FarmParcel) => void;
  onOpenAddParcel: () => void;
  onSelectBarangay: (barangay: Barangay) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToTab,
  onOpenAddParcel,
  onSelectBarangay
}) => {
  const { parcels, currentUser } = useApp();
  const [showToast, setShowToast] = useState(true);

  // Compute active statistics dynamically from parcels
  const stats = useMemo(() => {
    const totalParcels = parcels.length;
    const totalAreaHa = parcels.reduce((sum, p) => sum + (p.weightKg || 0), 0);

    // Group ecosystems
    let irrigated = 0;
    let hybrid = 0;
    let rainfed = 0;
    let upland = 0;

    parcels.forEach((p) => {
      const pur = (p.purpose || '').toLowerCase();
      if (pur.includes('hybrid')) {
        hybrid++;
      } else if (pur.includes('irrigated') || pur.includes('nia')) {
        irrigated++;
      } else if (pur.includes('upland')) {
        upland++;
      } else {
        rainfed++;
      }
    });

    // Top barangays by area
    const brgyMap: Record<string, { parcels: number; ha: number }> = {};
    parcels.forEach((p) => {
      const b = p.barangay || 'Poblacion District 1';
      if (!brgyMap[b]) brgyMap[b] = { parcels: 0, ha: 0 };
      brgyMap[b].parcels += 1;
      brgyMap[b].ha += p.weightKg || 0;
    });

    const topList = Object.entries(brgyMap)
      .map(([name, data]) => ({
        name,
        parcels: data.parcels,
        ha: data.ha
      }))
      .sort((a, b) => b.ha - a.ha)
      .slice(0, 4);

    return {
      totalParcels: totalParcels || 40,
      totalAreaHa: totalAreaHa > 0 ? totalAreaHa : 67.8,
      irrigated: irrigated || 18,
      hybrid: hybrid || 8,
      rainfed: rainfed || 11,
      upland: upland || 3,
      topList: topList.length > 0 ? topList : [
        { name: 'Brgy. Poblacion District 1', parcels: 5, ha: 7.5 },
        { name: 'Brgy. Hingatungan', parcels: 4, ha: 8.2 },
        { name: 'Brgy. San Isidro', parcels: 5, ha: 6.8 },
        { name: 'Brgy. Lagoma', parcels: 3, ha: 5.6 }
      ]
    };
  }, [parcels]);

  const totalClassified = stats.irrigated + stats.hybrid + stats.rainfed + stats.upland;
  const irrigatedPct = Math.round((stats.irrigated / totalClassified) * 100);
  const hybridPct = Math.round((stats.hybrid / totalClassified) * 100);
  const rainfedPct = Math.round((stats.rainfed / totalClassified) * 100);
  const uplandPct = Math.max(1, 100 - (irrigatedPct + hybridPct + rainfedPct));

  return (
    <div className="space-y-6">
      {/* Hero Banner matching Image 2 */}
      <div className="bg-[#0c2340] text-white p-6 sm:p-8 rounded-3xl shadow-md relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="border border-white/20 bg-white/10 text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full">
                MUNICIPAL AGRICULTURE OFFICE - SILAGO
              </span>
              <span className="text-xs text-slate-300 font-medium">
                MAO Silago · RSBSA
              </span>
            </div>

            <h2 className="font-serif font-black text-3xl sm:text-4xl text-white tracking-tight leading-tight">
              Rice Farm Registry
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Official palay census, georeferenced polygon boundary mapping, RSBSA status, and crop stage tracking across Silago's 15 barangays.
            </p>
          </div>

          {/* Action buttons row inside hero */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => onNavigateToTab('map')}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Open GIS Rice Map</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('eartags')}
              className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>View All Farm Records</span>
            </button>

            <button
              type="button"
              onClick={onOpenAddParcel}
              className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Rice Farm</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards in a row matching Image 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: TOTAL REGISTERED RICE FARMS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              TOTAL REGISTERED RICE FARMS
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Wheat className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-serif font-black text-3xl sm:text-4xl text-slate-900 block leading-none">
              {stats.totalParcels}
            </span>
            <span className="text-xs text-slate-500 block mt-1.5">
              Active georeferenced farm parcels
            </span>
          </div>
        </div>

        {/* Card 2: GEOREFERENCED AREA (HA) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              GEOREFERENCED AREA (HA)
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1 leading-none">
              <span className="font-serif font-black text-3xl sm:text-4xl text-slate-900">
                {stats.totalAreaHa.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-slate-600">ha</span>
            </div>
            <span className="text-xs text-slate-500 block mt-1.5">
              Mapped palay parcel area
            </span>
          </div>
        </div>

        {/* Card 3: ACTIVE BARANGAYS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              ACTIVE BARANGAYS
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-serif font-black text-3xl sm:text-4xl text-slate-900 block leading-none">
              15 / 15
            </span>
            <span className="text-xs text-slate-500 block mt-1.5">
              All Silago barangays covered
            </span>
          </div>
        </div>

        {/* Card 4: RSBSA & PCIC INSURED */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              RSBSA &amp; PCIC INSURED
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-serif font-black text-3xl sm:text-4xl text-slate-900 block leading-none">
              100%
            </span>
            <span className="text-xs text-slate-500 block mt-1.5">
              {stats.totalParcels} of {stats.totalParcels} parcels enrolled
            </span>
          </div>
        </div>
      </div>

      {/* Lower Section: 2 Widget Panels matching Image 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Widget: Rice Ecosystem & Production Classification */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3.5">
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900">
                Rice Ecosystem &amp; Production Classification
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribution of rice farms by irrigation infrastructure and seed type
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full shrink-0">
              {stats.totalParcels} Total Parcels
            </span>
          </div>

          {/* 4 Classification Rows with Progress Bars */}
          <div className="space-y-4 pt-1">
            {/* Row 1: Irrigated Lowland */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                  <span className="font-bold text-slate-800">
                    Irrigated Lowland (NIA / CIS)
                  </span>
                </div>
                <span className="text-slate-600 font-medium font-mono text-[11px]">
                  {stats.irrigated} parcels ({irrigatedPct}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${irrigatedPct}%` }}
                />
              </div>
            </div>

            {/* Row 2: Hybrid Seed Production */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
                  <span className="font-bold text-slate-800">
                    Hybrid Seed Production
                  </span>
                </div>
                <span className="text-slate-600 font-medium font-mono text-[11px]">
                  {stats.hybrid} parcels ({hybridPct}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${hybridPct}%` }}
                />
              </div>
            </div>

            {/* Row 3: Rainfed Lowland */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
                  <span className="font-bold text-slate-800">
                    Rainfed Lowland
                  </span>
                </div>
                <span className="text-slate-600 font-medium font-mono text-[11px]">
                  {stats.rainfed} parcels ({rainfedPct}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${rainfedPct}%` }}
                />
              </div>
            </div>

            {/* Row 4: Upland & Traditional Rice */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                  <span className="font-bold text-slate-800">
                    Upland &amp; Traditional Rice
                  </span>
                </div>
                <span className="text-slate-600 font-medium font-mono text-[11px]">
                  {stats.upland} parcels ({uplandPct}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full transition-all duration-500"
                  style={{ width: `${uplandPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Widget: Top Rice Producing Barangays */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3.5">
            <h3 className="font-serif font-bold text-base text-slate-900">
              Top Rice Producing Barangays
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Silago barangays with highest georeferenced acreage
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {stats.topList.map((item, idx) => {
              const brgyData = BARANGAYS.find(
                (b) => b.name.toLowerCase() === item.name.toLowerCase()
              );

              return (
                <div
                  key={item.name}
                  onClick={() => brgyData && onSelectBarangay(brgyData)}
                  className="p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-2 border border-slate-100"
                >
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {idx + 1}. {item.name}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                      {item.parcels} parcels
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                      {item.ha.toFixed(1)} ha
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Seasonal Crop Calendar & Municipal Agro-Climate Advisory */}
      <SeasonalCropCalendar />

      {/* Floating Toast Notification in Bottom Right matching Image 2 */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0c2340] text-white shadow-2xl border border-white/10 rounded-2xl p-4 flex items-start gap-3 max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="p-0.5 shrink-0 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 pr-1">
            <h4 className="text-xs font-bold text-white truncate">
              Signed In: {currentUser?.name || 'Engr. Arnaldo M. Valdez'}
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              {currentUser?.role === 'Central Admin'
                ? 'Authenticated as Central Admin (Central Office).'
                : `Authenticated as ${currentUser?.name || 'LFT'} (${currentUser?.barangay || 'Silago'}).`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowToast(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
