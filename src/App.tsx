import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/LandingPage';
import { LoginModal } from './components/LoginModal';
import { ParcelDetailModal } from './components/ParcelDetailModal';
import { BarangayDetailModal } from './components/BarangayDetailModal';
import { AddParcelModal } from './components/AddParcelModal';
import { DaLogo, SilagoSeal, BagOngSilagoLogo } from './components/Seals';
import { DashboardView } from './views/DashboardView';
import { LftDashboardView } from './views/LftDashboardView';
import { MapView } from './views/MapView';
import { DatabaseView } from './views/DatabaseView';
import { ReportsView } from './views/ReportsView';
import { AccountsView } from './views/AccountsView';
import { PhotosView } from './views/PhotosView';
import { SettingsView } from './views/SettingsView';
import { FarmParcel, Barangay, PortalTab } from './types';
import { AdminProfileModal } from './components/AdminProfileModal';
import { LftAccountSettingsModal } from './components/LftAccountSettingsModal';
import { UnifiedSidebarNav } from './components/UnifiedSidebarNav';
import {
  LayoutDashboard,
  Compass,
  Wheat,
  FileText,
  Users,
  Image,
  Printer,
  LogOut,
  Globe,
  PlusCircle,
  Menu,
  X,
  Settings,
  Activity,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    parcels,
    addParcel,
    updateParcel,
    deleteParcel,
    language,
    setLanguage,
    bgPhotoUrl,
    bgOpacity,
    bgBlur,
    bgActive,
    adminProfile,
    setSettingsActiveSubTab
  } = useApp();

  const [isAdminProfileOpen, setIsAdminProfileOpen] = useState(false);
  const [isLftAccountModalOpen, setIsLftAccountModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Role permissions check
  const isCentralAdmin = currentUser?.role === 'Central Admin';

  // Primary view: landing page or portal
  const [viewMode, setViewMode] = useState<'landing' | 'portal'>(() => {
    return currentUser ? 'portal' : 'landing';
  });

  const [activeTab, setActiveTab] = useState<PortalTab>(() => {
    return isCentralAdmin ? 'dashboard' : 'lft_dashboard';
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modal states
  const [selectedParcel, setSelectedParcel] = useState<FarmParcel | null>(null);
  const [selectedBarangay, setSelectedBarangay] = useState<Barangay | null>(null);
  const [isAddParcelOpen, setIsAddParcelOpen] = useState(false);
  const [editingParcel, setEditingParcel] = useState<FarmParcel | null>(null);
  const [initialCoordsForAdd, setInitialCoordsForAdd] = useState<{ lat: number; lng: number } | null>(null);
  const [focusBarangayForMap, setFocusBarangayForMap] = useState<Barangay | null>(null);
  const [reportBarangayFilter, setReportBarangayFilter] = useState<string>('Balagawan');

  // Enforce access boundaries: LFTs can access lft_dashboard, map, eartags, reports, settings
  useEffect(() => {
    if (currentUser && !isCentralAdmin) {
      if (activeTab === 'dashboard' || activeTab === 'accounts' || activeTab === 'photos') {
        setActiveTab('lft_dashboard');
      }
    }
  }, [currentUser, isCentralAdmin, activeTab]);

  const handleOpenLogin = () => setIsLoginModalOpen(true);

  const handleLoginSuccess = () => {
    setViewMode('portal');
    if (currentUser?.role !== 'Central Admin') {
      setActiveTab('lft_dashboard');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setViewMode('landing');
  };

  const handleNavigateToPortalTab = (
    tab: PortalTab,
    subTab?: 'profile' | 'municipal' | 'featured_card' | 'display'
  ) => {
    if (tab === 'dashboard' && currentUser?.role !== 'Central Admin') {
      setActiveTab('lft_dashboard');
    } else {
      setActiveTab(tab);
    }
    if (subTab) {
      setSettingsActiveSubTab(subTab);
    }
    setViewMode('portal');
  };

  const handleSaveParcel = (parcel: FarmParcel) => {
    if (editingParcel) {
      updateParcel(parcel.tagNumber, parcel);
      setEditingParcel(null);
    } else {
      addParcel(parcel);
    }
  };

  // Get view title for header
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Executive Dashboard';
      case 'lft_dashboard':
        return 'LFT Field Dashboard';
      case 'map':
        return 'GIS Rice Farm Map & Georeferenced Polygons';
      case 'eartags':
        return 'Rice Farm Records Database';
      case 'reports':
        return 'Official Rice Farm Registry Reports';
      case 'accounts':
        return 'LFT Accounts & Settings';
      case 'photos':
        return 'Photo, Media & Municipal Seals Settings';
      case 'settings':
        return isCentralAdmin ? 'System & Admin Settings' : 'LFT Account Settings';
      default:
        return 'Rice Farm Registry and Georeferencing';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 relative selection:bg-blue-600 selection:text-white">
      {/* Dynamic Background Image Layer */}
      {bgActive && (
        <div
          className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
          style={{
            backgroundImage: `url(${bgPhotoUrl})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            opacity: bgOpacity > 1 ? bgOpacity / 100 : bgOpacity,
            filter: `blur(${bgBlur}px)`
          }}
        />
      )}

      {/* View Switcher: Public Landing Page vs Authenticated / LFT Portal */}
      {viewMode === 'landing' ? (
        <div className="relative z-10">
          <LandingPage
            onOpenLogin={handleOpenLogin}
            onNavigateToPortalTab={(tab, subTab) => handleNavigateToPortalTab(tab as PortalTab, subTab)}
            onSelectBarangayForMap={(b) => setFocusBarangayForMap(b)}
          />
        </div>
      ) : (
        <div className="relative z-10 flex min-h-screen bg-[#f8fafc]">
          {/* Mobile Sidebar Backdrop */}
          {mobileSidebarOpen && (
            <div
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
            />
          )}

          {/* Left Dark Navy Sidebar matching System Specs */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 bg-[#0c2340] text-white flex flex-col justify-between border-r border-slate-800 shadow-xl transition-all duration-300 lg:translate-x-0 lg:static lg:h-screen shrink-0 ${
              mobileSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
            } ${isSidebarCollapsed ? 'lg:w-[74px]' : 'lg:w-72'}`}
          >
            {/* Top Branding & Seals */}
            {!isSidebarCollapsed ? (
              <div className="p-3.5 border-b border-white/10 space-y-2.5 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <DaLogo size={24} />
                    <SilagoSeal size={24} />
                    <BagOngSilagoLogo size={24} />
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Desktop Sidebar Collapse Button */}
                    <button
                      type="button"
                      onClick={() => setIsSidebarCollapsed(true)}
                      className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                      title="Collapse sidebar to icon view"
                    >
                      <PanelLeftClose className="w-4 h-4" />
                    </button>
                    {/* Mobile Sidebar Close Button */}
                    <button
                      type="button"
                      onClick={() => setMobileSidebarOpen(false)}
                      className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-sky-500/20 text-[#38bdf8] border border-sky-400/30 uppercase tracking-wider inline-block">
                      {isCentralAdmin ? 'CENTRAL ADMIN' : 'LFT FIELD OPERATOR'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white block leading-snug mt-1">
                    Rice Farm Registry &amp; GIS
                  </span>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Municipality of Silago • DA-MAO
                  </p>
                </div>

                {/* User Profile Card */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex items-center gap-2.5">
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs overflow-hidden border border-white/20">
                      {(currentUser?.photoUrl || (isCentralAdmin && adminProfile.photoUrl)) ? (
                        <img
                          src={currentUser?.photoUrl || (isCentralAdmin ? adminProfile.photoUrl : '')}
                          alt="User Avatar"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span>{currentUser?.name ? currentUser.name.charAt(0) : (isCentralAdmin ? 'A' : 'L')}</span>
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-[#0c2340]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-white block truncate leading-tight">
                      {currentUser?.name || (isCentralAdmin ? adminProfile.name : 'Authorized LFT')}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate leading-tight mt-0.5">
                      {currentUser?.title || (isCentralAdmin ? adminProfile.title : 'Local Farmer Technician')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (isCentralAdmin) {
                        setIsAdminProfileOpen(true);
                      } else {
                        setIsLftAccountModalOpen(true);
                      }
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
                    title={isCentralAdmin ? 'Profile & Password Settings' : 'LFT Account Settings'}
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Action Button: + Add Rice Farm Registration */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingParcel(null);
                    setIsAddParcelOpen(true);
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md hover:shadow-blue-500/20 active:scale-[0.98]"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-blue-200" />
                  <span>+ Add Rice Farm Registration</span>
                </button>
              </div>
            ) : (
              /* Collapsed Mini Header for Desktop */
              <div className="p-2.5 border-b border-white/10 flex flex-col items-center space-y-2.5 shrink-0">
                <SilagoSeal size={28} />
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Expand sidebar"
                >
                  <PanelLeftOpen className="w-4 h-4 text-blue-400" />
                </button>

                {/* Mini Profile Trigger */}
                <div
                  onClick={() => {
                    if (isCentralAdmin) {
                      setIsAdminProfileOpen(true);
                    } else {
                      setIsLftAccountModalOpen(true);
                    }
                  }}
                  className="relative cursor-pointer group"
                  title={`${currentUser?.name || (isCentralAdmin ? adminProfile.name : 'Authorized LFT')} - Settings`}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs overflow-hidden border border-white/20">
                    {(currentUser?.photoUrl || (isCentralAdmin && adminProfile.photoUrl)) ? (
                      <img
                        src={currentUser?.photoUrl || (isCentralAdmin ? adminProfile.photoUrl : '')}
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span>{currentUser?.name ? currentUser.name.charAt(0) : (isCentralAdmin ? 'A' : 'L')}</span>
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-[#0c2340]" />
                </div>

                {/* Mini + Button */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingParcel(null);
                    setIsAddParcelOpen(true);
                  }}
                  className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition shadow-sm cursor-pointer"
                  title="Add Rice Farm Registration"
                >
                  <PlusCircle className="w-4 h-4 text-white" />
                </button>
              </div>
            )}

            {/* Unified Accordion Sidebar Navigation Component */}
            <UnifiedSidebarNav
              activeTab={activeTab}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                setMobileSidebarOpen(false);
              }}
              onOpenPublicPortal={() => {
                setViewMode('landing');
                setMobileSidebarOpen(false);
              }}
              onOpenAddParcel={() => {
                setEditingParcel(null);
                setIsAddParcelOpen(true);
                setMobileSidebarOpen(false);
              }}
              isCentralAdmin={isCentralAdmin}
              isSidebarCollapsed={isSidebarCollapsed}
              parcelsCount={parcels.length}
            />

            {/* Bottom Controls */}
            {!isSidebarCollapsed ? (
              <div className="p-3 border-t border-white/10 space-y-2 text-xs shrink-0">
                {/* Language Switcher */}
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Language</span>
                  <div className="flex items-center bg-white/5 p-0.5 rounded-lg border border-white/10">
                    <button
                      type="button"
                      onClick={() => setLanguage('EN')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                        language === 'EN' ? 'bg-[#2563eb] text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('CEB')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                        language === 'CEB' ? 'bg-[#2563eb] text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Cebuano
                    </button>
                  </div>
                </div>

                {/* Status Row */}
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    <span className="text-white font-medium">Online</span>
                  </div>
                  <span className="text-slate-400 font-medium">GIS Synced</span>
                </div>

                {/* Sign Out Button */}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-1.5 py-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              /* Collapsed Mini Footer */
              <div className="p-2 border-t border-white/10 flex flex-col items-center space-y-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setLanguage(language === 'EN' ? 'CEB' : 'EN')}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-[10px] flex items-center justify-center transition cursor-pointer"
                  title={`Language: ${language === 'EN' ? 'English (Click for Cebuano)' : 'Cebuano (Click for English)'}`}
                >
                  {language}
                </button>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online & GIS Synced" />
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
            {/* Top Header Bar */}
            <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Mobile sidebar toggle button */}
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  title="Open Navigation Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Desktop sidebar collapse/expand toggle button */}
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="hidden lg:flex p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition cursor-pointer"
                  title={isSidebarCollapsed ? "Expand Sidebar (Full labels)" : "Collapse Sidebar (Icon rail)"}
                >
                  {isSidebarCollapsed ? (
                    <PanelLeftOpen className="w-5 h-5 text-blue-600" />
                  ) : (
                    <PanelLeftClose className="w-5 h-5" />
                  )}
                </button>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Rice Farm Registry and Georeferencing
                  </span>
                  <h1 className="font-serif font-black text-xl sm:text-2xl text-[#0b2545] tracking-tight leading-tight">
                    {getHeaderTitle()}
                  </h1>
                </div>
              </div>

              {/* Public Interface Button */}
              <button
                type="button"
                onClick={() => setViewMode('landing')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-blue-600 font-semibold text-xs transition shadow-2xs cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Public Interface</span>
              </button>
            </header>

            {/* Body View Area */}
            <main className="flex-1 p-4 sm:p-6 bg-[#f8fafc]">
              {activeTab === 'dashboard' && (
                <DashboardView
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                  onSelectParcel={(p) => setSelectedParcel(p)}
                  onOpenAddParcel={() => {
                    setEditingParcel(null);
                    setIsAddParcelOpen(true);
                  }}
                  onSelectBarangay={(b) => setSelectedBarangay(b)}
                />
              )}

              {activeTab === 'lft_dashboard' && (
                <LftDashboardView
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                  onSelectParcel={(p) => setSelectedParcel(p)}
                  onOpenAddParcel={() => {
                    setEditingParcel(null);
                    setIsAddParcelOpen(true);
                  }}
                  onSelectBarangay={(b) => setSelectedBarangay(b)}
                />
              )}

              {activeTab === 'map' && (
                <MapView
                  onSelectParcel={(p) => setSelectedParcel(p)}
                  onOpenAddParcelWithCoords={(coords) => {
                    setEditingParcel(null);
                    setInitialCoordsForAdd(coords);
                    setIsAddParcelOpen(true);
                  }}
                  focusBarangay={focusBarangayForMap}
                />
              )}

              {activeTab === 'eartags' && (
                <DatabaseView
                  onSelectParcel={(p) => setSelectedParcel(p)}
                  onEditParcel={(p) => {
                    setEditingParcel(p);
                    setIsAddParcelOpen(true);
                  }}
                  onOpenAddParcel={() => {
                    setEditingParcel(null);
                    setIsAddParcelOpen(true);
                  }}
                  onOpenPublicInterface={() => setViewMode('landing')}
                  onNavigateToReports={(b) => {
                    if (b) setReportBarangayFilter(b);
                    setActiveTab('reports');
                  }}
                />
              )}

              {activeTab === 'reports' && <ReportsView initialBarangay={reportBarangayFilter} />}

              {activeTab === 'accounts' && isCentralAdmin && <AccountsView />}

              {activeTab === 'photos' && isCentralAdmin && (
                <PhotosView onNavigateToSettings={() => setActiveTab('settings')} />
              )}

              {activeTab === 'settings' && (
                <SettingsView onNavigateToLanding={() => setViewMode('landing')} />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      <ParcelDetailModal
        parcel={selectedParcel}
        onClose={() => setSelectedParcel(null)}
        onEdit={(p) => {
          setEditingParcel(p);
          setIsAddParcelOpen(true);
        }}
        onDelete={(tag) => {
          deleteParcel(tag);
          setSelectedParcel(null);
        }}
      />

      <BarangayDetailModal
        barangay={selectedBarangay}
        parcels={parcels}
        onClose={() => setSelectedBarangay(null)}
        onSelectParcel={(p) => setSelectedParcel(p)}
        onViewOnMap={(b) => {
          setFocusBarangayForMap(b);
          setActiveTab('map');
          setViewMode('portal');
        }}
      />

      <AddParcelModal
        isOpen={isAddParcelOpen}
        onClose={() => {
          setIsAddParcelOpen(false);
          setEditingParcel(null);
          setInitialCoordsForAdd(null);
        }}
        onSave={handleSaveParcel}
        onDelete={(tag) => {
          deleteParcel(tag);
          setIsAddParcelOpen(false);
          setEditingParcel(null);
        }}
        editingParcel={editingParcel}
        initialCoords={initialCoordsForAdd}
        defaultBarangay={currentUser?.barangay}
      />

      <AdminProfileModal
        isOpen={isAdminProfileOpen}
        onClose={() => setIsAdminProfileOpen(false)}
      />

      <LftAccountSettingsModal
        isOpen={isLftAccountModalOpen}
        onClose={() => setIsLftAccountModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
