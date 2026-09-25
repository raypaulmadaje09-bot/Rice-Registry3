import React, { useState, useEffect, useMemo } from 'react';
import { FarmParcel } from '../types';
import {
  BARANGAYS,
  getAssignedLftForBarangay,
  getUserAssignedBarangays,
  isUserAuthorizedForBarangay,
  matchBarangay
} from '../data/barangays';
import { useApp } from '../context/AppContext';
import { calculateCropGrowthStage, CropGrowthStageCalc } from '../data/riceVarieties';
import { DaLogo, SilagoSeal, BagOngSilagoLogo } from './Seals';
import { ManageReferenceModal, ManageType } from './ManageReferenceModal';
import {
  X,
  Save,
  MapPin,
  Navigation,
  Wheat,
  Calendar,
  Sparkles,
  Settings2,
  Trash2,
  AlertTriangle,
  User,
  Droplets,
  Layers,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Camera,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

interface AddParcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (parcel: FarmParcel) => void;
  editingParcel?: FarmParcel | null;
  initialCoords?: { lat: number; lng: number } | null;
  defaultBarangay?: string;
  onDelete?: (tagNumber: string) => void;
}

export const AddParcelModal: React.FC<AddParcelModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingParcel,
  initialCoords,
  defaultBarangay,
  onDelete
}) => {
  const {
    currentUser,
    varieties,
    ecosystems,
    tenures,
    seasons,
    irrigationAssociations
  } = useApp();

  // Determine LFT jurisdiction
  const assignedBarangays = useMemo(() => {
    return getUserAssignedBarangays(currentUser);
  }, [currentUser]);

  // Check if current user is restricted from editing this parcel
  const isRestrictedForEditing = useMemo(() => {
    if (!editingParcel) return false;
    return !isUserAuthorizedForBarangay(currentUser, editingParcel.barangay);
  }, [editingParcel, currentUser]);

  // Filter available barangays to user's assigned jurisdiction if they are an LFT
  const availableBarangays = useMemo(() => {
    if (!assignedBarangays) return BARANGAYS;
    return BARANGAYS.filter((b) =>
      assignedBarangays.some((ab) => matchBarangay(b.name, ab))
    );
  }, [assignedBarangays]);

  // Determine the effective default barangay for new registrations
  const effectiveDefaultBarangay = useMemo(() => {
    if (assignedBarangays && assignedBarangays.length > 0) {
      const match = assignedBarangays.find((b) =>
        matchBarangay(defaultBarangay || '', b)
      );
      return match || assignedBarangays[0];
    }
    return defaultBarangay || 'Salvacion';
  }, [assignedBarangays, defaultBarangay]);

  // Active Manage Reference Modal state ('variety' | 'ecosystem' | 'tenure' | 'season' | 'irrigationAssociation' | null)
  const [manageType, setManageType] = useState<ManageType | null>(null);

  // Confirm delete dialog in edit mode
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Geolocation state
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoSuccess, setGeoSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<FarmParcel>>({
    tagNumber: '',
    swineNameOrId: '',
    farmerFamilyName: '',
    farmerGivenName: '',
    farmerMiddleName: '',
    raiserName: '',
    birthday: '',
    contactNumber: '0917-555-1234',
    barangay: effectiveDefaultBarangay,
    purok: 'Purok Riverside',
    address: 'Silago, Southern Leyte',
    breed: 'NSIC Rc 222',
    seedType: 'INBRED',
    sex: 'Owner-Cultivator',
    ageMonths: 90,
    weightKg: 1.45,
    scale: 'Smallholder (<2 ha)',
    purpose: 'Irrigated Lowland (NIA)',
    irrigationAssociation: 'Balagawan Communal Irrigators Association (BCIA)',
    vaccinationStatus: 'RSBSA Enrolled & PCIC Insured',
    healthStatus: 'Active Crop (Tillering)',
    biosecurityScore: 'Georeferenced (GPS Polygon Mapped)',
    registrationDate: new Date().toISOString().split('T')[0],
    focalPerson: getAssignedLftForBarangay(effectiveDefaultBarangay).name,
    lat: 10.5335,
    lng: 125.162,
    syncStatus: 'Live Synced',
    targetYieldMt: 6.1,
    plantingDate: '',
    croppingSeason: 'Wet Season (WS) 2026 (June – Nov 2026)',
    commodity: 'Rice',
    pestAdvisoryNotice: 'Routine water and nutrient monitoring advised.'
  });

  // Populate data when modal opens or editingParcel changes
  useEffect(() => {
    if (editingParcel) {
      // Parse family, given, middle if missing
      let fam = editingParcel.farmerFamilyName || '';
      let giv = editingParcel.farmerGivenName || '';
      let mid = editingParcel.farmerMiddleName || '';
      if (!fam && editingParcel.raiserName) {
        const parts = editingParcel.raiserName.split(' ');
        if (parts.length >= 2) {
          fam = parts[parts.length - 1];
          giv = parts.slice(0, parts.length - 1).join(' ');
        } else {
          fam = editingParcel.raiserName;
        }
      }

      setFormData({
        ...editingParcel,
        farmerFamilyName: fam,
        farmerGivenName: giv,
        farmerMiddleName: mid,
        irrigationAssociation:
          editingParcel.irrigationAssociation ||
          irrigationAssociations[0] ||
          'Balagawan Communal Irrigators Association (BCIA)',
        seedType: editingParcel.seedType || 'INBRED',
        commodity: 'Rice'
      });
    } else {
      const randomTag = `SLG-${(defaultBarangay || 'POB1').substring(0, 4).toUpperCase()}-${Math.floor(
        100 + Math.random() * 900
      )}`;
      const randomRsbsa = `08-64-16-${String(Math.floor(1 + Math.random() * 15)).padStart(3, '0')}-${String(
        Math.floor(1000 + Math.random() * 9000)
      )}`;

      setFormData({
        tagNumber: randomTag,
        swineNameOrId: randomRsbsa,
        farmerFamilyName: '',
        farmerGivenName: '',
        farmerMiddleName: '',
        raiserName: '',
        birthday: '1975-06-15',
        contactNumber: '0917-555-1234',
        barangay: effectiveDefaultBarangay,
        purok: 'Purok Riverside',
        address: 'Silago, Southern Leyte',
        breed: varieties[0]?.name || 'NSIC Rc 222',
        seedType: varieties[0]?.seedType || 'INBRED',
        sex: tenures[0] || 'Owner-Cultivator',
        ageMonths: 45,
        weightKg: 1.25,
        scale: 'Smallholder (<2 ha)',
        purpose: ecosystems[0] || 'Irrigated Lowland (NIA)',
        irrigationAssociation:
          irrigationAssociations[0] || 'Balagawan Communal Irrigators Association (BCIA)',
        vaccinationStatus: 'RSBSA Enrolled & PCIC Insured',
        healthStatus: 'Active Crop (Tillering)',
        biosecurityScore: 'Georeferenced (GPS Polygon Mapped)',
        registrationDate: new Date().toISOString().split('T')[0],
        focalPerson: getAssignedLftForBarangay(effectiveDefaultBarangay).name,
        lat: initialCoords ? Number(initialCoords.lat.toFixed(6)) : 10.5335,
        lng: initialCoords ? Number(initialCoords.lng.toFixed(6)) : 125.162,
        syncStatus: 'Live Synced',
        targetYieldMt: 6.0,
        plantingDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        croppingSeason: seasons[0] || 'Wet Season (WS) 2026 (June – Nov 2026)',
        commodity: 'Rice',
        pestAdvisoryNotice: 'Routine water and nutrient monitoring advised.'
      });
    }
    setConfirmDelete(false);
    setError(null);
  }, [editingParcel, defaultBarangay, effectiveDefaultBarangay, initialCoords, isOpen]);

  // Keep Full Name synchronized with Family Name, Given Name, Middle Name
  const handleNameChange = (field: 'family' | 'given' | 'middle', val: string) => {
    setFormData((prev) => {
      const fam = field === 'family' ? val : prev.farmerFamilyName || '';
      const giv = field === 'given' ? val : prev.farmerGivenName || '';
      const mid = field === 'middle' ? val : prev.farmerMiddleName || '';

      const parts = [fam ? fam.toUpperCase() + ',' : '', giv, mid].filter(Boolean);
      const combined = parts.join(' ').trim() || `${giv} ${fam}`.trim();

      return {
        ...prev,
        farmerFamilyName: field === 'family' ? val : prev.farmerFamilyName,
        farmerGivenName: field === 'given' ? val : prev.farmerGivenName,
        farmerMiddleName: field === 'middle' ? val : prev.farmerMiddleName,
        raiserName: combined || prev.raiserName
      };
    });
  };

  // Sync variety and seed type
  const handleVarietyChange = (varietyName: string) => {
    const matched = varieties.find((v) => v.name.toLowerCase() === varietyName.toLowerCase());
    setFormData((prev) => ({
      ...prev,
      breed: varietyName,
      seedType: matched ? matched.seedType : prev.seedType,
      targetYieldMt: matched ? matched.aveYieldMt : prev.targetYieldMt
    }));
  };

  // Live Phenology & Crop Stage Calculation based on plantingDate and variety
  const phenology: CropGrowthStageCalc = useMemo(() => {
    return calculateCropGrowthStage(formData.plantingDate || '', formData.breed || 'NSIC Rc 222');
  }, [formData.plantingDate, formData.breed]);

  // Automatically update healthStatus and ageMonths when planting date or variety changes
  useEffect(() => {
    if (phenology) {
      setFormData((prev) => ({
        ...prev,
        healthStatus: phenology.stage,
        ageMonths: phenology.dap
      }));
    }
  }, [phenology.stage, phenology.dap]);

  // GPS Geolocation Handler
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setGeoSuccess(false);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6))
        }));
        setGeoLoading(false);
        setGeoSuccess(true);
        setTimeout(() => setGeoSuccess(false), 4000);
      },
      (err) => {
        setGeoLoading(false);
        setError(`GPS error: ${err.message}. Defaulting to Silago municipal coordinates.`);
        setFormData((prev) => ({
          ...prev,
          lat: 10.5335,
          lng: 125.162
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Photo upload handler (supports file upload with immediate data URI conversion)
  const handlePhotoUpload = (field: 'photoUrl' | 'fieldPhotoUrl', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setFormData((prev) => ({
          ...prev,
          [field]: e.target?.result as string
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.raiserName && (!formData.farmerFamilyName || !formData.farmerGivenName)) {
      setError('Farmer Name is required (Family Name and Given Name).');
      return;
    }

    const targetBrgy = formData.barangay || effectiveDefaultBarangay;

    // Strict validation rule: LFT can only create or manage parcels in their Assigned Barangays
    if (!isUserAuthorizedForBarangay(currentUser, targetBrgy)) {
      setError(
        `Validation Error: As an assigned LFT (${currentUser?.name}), you are restricted to registering or managing farm parcels in your assigned barangays: ${assignedBarangays?.join(', ')}. Barangay "${targetBrgy}" is outside your jurisdiction.`
      );
      return;
    }

    if (editingParcel && !isUserAuthorizedForBarangay(currentUser, editingParcel.barangay)) {
      setError(
        `Access Denied: This parcel is located in Brgy. ${editingParcel.barangay}. You (${currentUser?.name}) are only authorized to manage parcels in: ${assignedBarangays?.join(', ')}.`
      );
      return;
    }

    const finalRaiserName =
      formData.raiserName ||
      `${formData.farmerFamilyName ? formData.farmerFamilyName.toUpperCase() + ', ' : ''}${
        formData.farmerGivenName || ''
      } ${formData.farmerMiddleName || ''}`.trim();

    const finalParcel: FarmParcel = {
      tagNumber: formData.tagNumber || `SLG-${Date.now().toString().slice(-6)}`,
      swineNameOrId: formData.swineNameOrId || 'NO RSBSA',
      farmerFamilyName: formData.farmerFamilyName || '',
      farmerGivenName: formData.farmerGivenName || '',
      farmerMiddleName: formData.farmerMiddleName || '',
      birthday: formData.birthday || '',
      raiserName: finalRaiserName,
      barangay: targetBrgy,
      purok: formData.purok || 'Purok Riverside',
      address: formData.address || 'Silago, Southern Leyte',
      contactNumber: formData.contactNumber || '0917-000-0000',
      breed: formData.breed || 'NSIC Rc 222',
      seedType: formData.seedType || 'INBRED',
      sex: formData.sex || 'Owner-Cultivator',
      ageMonths: Number(phenology.dap) || Number(formData.ageMonths) || 45,
      weightKg: Number(formData.weightKg) || 1.0,
      scale:
        Number(formData.weightKg) < 2
          ? 'Smallholder (<2 ha)'
          : Number(formData.weightKg) <= 5
          ? 'Medium Farm (2-5 ha)'
          : 'Commercial (>5 ha)',
      purpose: formData.purpose || 'Irrigated Lowland (NIA)',
      irrigationAssociation:
        formData.irrigationAssociation || 'Balagawan Communal Irrigators Association (BCIA)',
      vaccinationStatus: formData.vaccinationStatus || 'RSBSA Enrolled & PCIC Insured',
      healthStatus: phenology.stage || formData.healthStatus || 'Active Crop (Tillering)',
      biosecurityScore: 'Georeferenced (GPS Polygon Mapped)',
      registrationDate: formData.registrationDate || new Date().toISOString().split('T')[0],
      focalPerson:
        formData.focalPerson || getAssignedLftForBarangay(targetBrgy).name,
      lat: Number(formData.lat) || 10.5335,
      lng: Number(formData.lng) || 125.162,
      syncStatus: 'Live Synced',
      targetYieldMt: Number(formData.targetYieldMt) || 6.0,
      plantingDate: formData.plantingDate || '',
      croppingSeason: formData.croppingSeason || 'Wet Season (WS) 2026 (June – Nov 2026)',
      commodity: 'Rice',
      pestAdvisoryNotice: formData.pestAdvisoryNotice || 'Routine monitoring advised.',
      photoUrl: formData.photoUrl,
      fieldPhotoUrl: formData.fieldPhotoUrl
    };

    onSave(finalParcel);
    onClose();
  };

  const handleDelete = () => {
    if (editingParcel && onDelete) {
      if (!isUserAuthorizedForBarangay(currentUser, editingParcel.barangay)) {
        setError(
          `Unauthorized: You cannot delete farm parcels outside your assigned barangays (${assignedBarangays?.join(', ')}).`
        );
        return;
      }
      onDelete(editingParcel.tagNumber);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
        <div className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
          {/* 1. Header with Government Seals with clean horizontal layout */}
          <div className="bg-white px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex items-center gap-2 shrink-0">
                <DaLogo size={38} />
                <SilagoSeal size={38} />
                <BagOngSilagoLogo size={38} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block truncate">
                  Republic of the Philippines • Municipality of Silago
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate">
                  {editingParcel ? 'Edit Rice Farm Registration' : 'Rice Farm Registration Form'}
                </h2>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  Municipal Agriculture Office • Southern Leyte
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer shrink-0 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* LFT Jurisdiction Warning if editing parcel outside jurisdiction */}
          {isRestrictedForEditing && editingParcel && (
            <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Restricted Jurisdiction:</strong> This parcel is located in <strong>Brgy. {editingParcel.barangay}</strong>. Because your account ({currentUser?.name}) is assigned to <strong>{assignedBarangays?.join(', ')}</strong>, you cannot modify or delete this parcel.
              </span>
            </div>
          )}

          {/* Form Body - Simple, Unified, Single Flow */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 overflow-y-auto space-y-6 flex-1 bg-slate-50/40">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* ========================================================
                  SECTION 1: FARMER & RSBSA IDENTIFICATION (from Image 3)
                  ======================================================== */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <User className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    1. Farmer & RSBSA Profile
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* RSBSA Reference Number */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      RSBSA No. / Reference
                    </label>
                    <input
                      type="text"
                      value={formData.swineNameOrId || ''}
                      onChange={(e) => setFormData({ ...formData, swineNameOrId: e.target.value })}
                      placeholder="e.g. 08-64-16-002-000061 or NO RSBSA"
                      className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  {/* Parcel ID (Unique Tag) */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Registration Parcel ID
                    </label>
                    <input
                      type="text"
                      value={formData.tagNumber || ''}
                      onChange={(e) => setFormData({ ...formData, tagNumber: e.target.value })}
                      placeholder="e.g. SLG-BAL-101"
                      className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Mobile / Contact No.
                    </label>
                    <input
                      type="text"
                      value={formData.contactNumber || ''}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      placeholder="0917-555-1234"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Farmer Names (Family Name, Given Name, Middle Name) as in Image 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Family Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.farmerFamilyName || ''}
                      onChange={(e) => handleNameChange('family', e.target.value)}
                      placeholder="e.g. ALAS"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold uppercase focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Given Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.farmerGivenName || ''}
                      onChange={(e) => handleNameChange('given', e.target.value)}
                      placeholder="e.g. MARIO"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold uppercase focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      value={formData.farmerMiddleName || ''}
                      onChange={(e) => handleNameChange('middle', e.target.value)}
                      placeholder="e.g. CABUG-OS"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 uppercase focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Birthday & Residential Address */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.birthday || ''}
                      onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  {/* In Silago barangays shows ONLY the barangay! */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Residential Barangay
                    </label>
                    <select
                      value={formData.address?.replace(', Silago, Southern Leyte', '') || formData.barangay}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: `${e.target.value}, Silago, Southern Leyte`
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                    >
                      {BARANGAYS.map((b) => (
                        <option key={b.name} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Municipality & Province
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Silago, Southern Leyte"
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Farmer Profile Photo Uploader & Preview */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                    Farmer Profile Photo (1x1 / 2x2 ID Photo)
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-600 shrink-0 bg-slate-200 flex items-center justify-center shadow-xs">
                      {formData.photoUrl ? (
                        <img
                          src={formData.photoUrl}
                          alt="Farmer Profile"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-7 h-7 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 w-full space-y-1.5">
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload ID Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handlePhotoUpload('photoUrl', file);
                            }}
                          />
                        </label>
                        {formData.photoUrl && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, photoUrl: undefined })}
                            className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={formData.photoUrl || ''}
                        onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                        placeholder="Or paste direct image URL (https://...)"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================================================
                  SECTION 2: FARM LOCATION & GPS (Shows ONLY barangay)
                  ======================================================== */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      2. Farm Location & GPS Coordinates
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={geoLoading}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      geoSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                    }`}
                  >
                    <Navigation className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
                    <span>
                      {geoLoading
                        ? 'Acquiring GPS...'
                        : geoSuccess
                        ? 'GPS Locked ✓'
                        : 'Auto-Detect Current GPS'}
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                  {/* Farm Barangay - RESTRICTED TO LFT ASSIGNED JURISDICTION */}
                  <div className="space-y-1 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700">
                        Farm Location Barangay <span className="text-red-500">*</span>
                      </label>
                      {assignedBarangays && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          LFT Jurisdiction ({assignedBarangays.length} Assigned)
                        </span>
                      )}
                    </div>
                    <select
                      value={formData.barangay}
                      disabled={isRestrictedForEditing}
                      onChange={(e) => {
                        const newBrgy = e.target.value;
                        const assigned = getAssignedLftForBarangay(newBrgy);
                        setFormData({
                          ...formData,
                          barangay: newBrgy,
                          focalPerson: assigned.name
                        });
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                    >
                      {availableBarangays.map((b) => (
                        <option key={b.name} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Purok / Sitio */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Purok / Sitio</label>
                    <input
                      type="text"
                      value={formData.purok || ''}
                      onChange={(e) => setFormData({ ...formData, purok: e.target.value })}
                      placeholder="e.g. Purok Riverside"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  {/* Farm Area in Hectares */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Farm Area (Hectares) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0.05}
                      max={100}
                      required
                      value={formData.weightKg || ''}
                      onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                      placeholder="e.g. 1.45"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* GPS Coordinates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.lat || ''}
                      onChange={(e) => setFormData({ ...formData, lat: Number(e.target.value) })}
                      placeholder="10.5335"
                      className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.lng || ''}
                      onChange={(e) => setFormData({ ...formData, lng: Number(e.target.value) })}
                      placeholder="125.1620"
                      className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Farm Field Photo Uploader & Preview */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                    Georeferenced Farm Field Photo (Paddy / Field Overview)
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="w-18 h-14 rounded-lg overflow-hidden border-2 border-emerald-600 shrink-0 bg-slate-200 flex items-center justify-center shadow-xs">
                      {formData.fieldPhotoUrl ? (
                        <img
                          src={formData.fieldPhotoUrl}
                          alt="Farm Field"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-7 h-7 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 w-full space-y-1.5">
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Field Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handlePhotoUpload('fieldPhotoUrl', file);
                            }}
                          />
                        </label>
                        {formData.fieldPhotoUrl && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, fieldPhotoUrl: undefined })}
                            className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={formData.fieldPhotoUrl || ''}
                        onChange={(e) => setFormData({ ...formData, fieldPhotoUrl: e.target.value })}
                        placeholder="Or paste direct field image URL (https://...)"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================================================
                  SECTION 3: CROP PROFILE, IRRIGATION & TENURE (with Manage)
                  ======================================================== */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Wheat className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    3. Rice Variety, Irrigation & Tenurial Profile
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Rice Variety with [⚙️ Manage] */}
                  <div className="space-y-1 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700">
                        Rice / Palay Variety <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setManageType('variety')}
                        className="text-[10px] font-extrabold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200/80 flex items-center gap-1 transition cursor-pointer"
                      >
                        <Settings2 className="w-3 h-3" />
                        <span>Manage Varieties</span>
                      </button>
                    </div>
                    <select
                      value={formData.breed}
                      onChange={(e) => handleVarietyChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                    >
                      {varieties.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name} ({v.seedType} • {v.maturityDays} DAS)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Seed Type */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Seed Type</label>
                    <select
                      value={formData.seedType || 'INBRED'}
                      onChange={(e) => setFormData({ ...formData, seedType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                    >
                      <option value="INBRED">INBRED (Certified Seeds)</option>
                      <option value="HYBRID">HYBRID (Hybrid Seeds)</option>
                      <option value="UNKNOWN">UNKNOWN / Farmers Saved</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Agro-Ecosystem / Water Source with [⚙️ Manage] */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700">
                        Agro-Ecosystem / Water Source
                      </label>
                      <button
                        type="button"
                        onClick={() => setManageType('ecosystem')}
                        className="text-[10px] font-extrabold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200/80 flex items-center gap-1 transition cursor-pointer"
                      >
                        <Settings2 className="w-3 h-3" />
                        <span>Manage</span>
                      </button>
                    </div>
                    <select
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                    >
                      {ecosystems.map((eco) => (
                        <option key={eco} value={eco}>
                          {eco}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Irrigation Association (IA) with [⚙️ Manage] - USER REQUEST */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700">
                        Irrigation Association (IA)
                      </label>
                      <button
                        type="button"
                        onClick={() => setManageType('irrigationAssociation')}
                        className="text-[10px] font-extrabold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded-lg border border-teal-200/80 flex items-center gap-1 transition cursor-pointer"
                      >
                        <Settings2 className="w-3 h-3" />
                        <span>Manage</span>
                      </button>
                    </div>
                    <select
                      value={formData.irrigationAssociation}
                      onChange={(e) =>
                        setFormData({ ...formData, irrigationAssociation: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                    >
                      {irrigationAssociations.map((ia) => (
                        <option key={ia} value={ia}>
                          {ia}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tenurial Status with [⚙️ Manage] */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700">
                        Tenurial Status
                      </label>
                      <button
                        type="button"
                        onClick={() => setManageType('tenure')}
                        className="text-[10px] font-extrabold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200/80 flex items-center gap-1 transition cursor-pointer"
                      >
                        <Settings2 className="w-3 h-3" />
                        <span>Manage</span>
                      </button>
                    </div>
                    <select
                      value={formData.sex}
                      onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                    >
                      {tenures.map((ten) => (
                        <option key={ten} value={ten}>
                          {ten}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cropping Season with [⚙️ Manage] */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700">
                        Cropping Season
                      </label>
                      <button
                        type="button"
                        onClick={() => setManageType('season')}
                        className="text-[10px] font-extrabold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-lg border border-purple-200/80 flex items-center gap-1 transition cursor-pointer"
                      >
                        <Settings2 className="w-3 h-3" />
                        <span>Manage</span>
                      </button>
                    </div>
                    <select
                      value={formData.croppingSeason}
                      onChange={(e) => setFormData({ ...formData, croppingSeason: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                    >
                      {seasons.map((seas) => (
                        <option key={seas} value={seas}>
                          {seas}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* ========================================================
                  SECTION 4: DATE OF PLANTING & AUTOMATED PHENOLOGY
                  ======================================================== */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      4. Planting Date & Automated Phenology Calculation
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Auto-Calculating Stage & Maturity</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Date of Planting / Sowing <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.plantingDate || ''}
                      onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Target Yield (Metric Tons)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.targetYieldMt || 6.0}
                      onChange={(e) =>
                        setFormData({ ...formData, targetYieldMt: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Automated Phenology Result Card */}
                <div className="bg-[#fcfdfa] border border-emerald-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800">
                        Current Crop Stage:
                      </span>
                      <span
                        className={`text-xs font-black px-3 py-0.5 rounded-full border ${phenology.colorClass}`}
                      >
                        {phenology.stage}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                      <span>
                        Elapsed: <strong className="text-slate-900">{phenology.dap} DAS</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Maturity: <strong className="text-slate-900">{phenology.percentageMaturity}%</strong>
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${phenology.percentageMaturity}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <p>
                      <strong className="text-slate-800">Growth Phase:</strong> {phenology.phase}
                    </p>
                    <p>
                      <strong className="text-slate-800">Est. Harvest Date:</strong>{' '}
                      <span className="font-bold text-emerald-800">
                        {phenology.estimatedHarvestDate}
                      </span>{' '}
                      ({phenology.maturityDays} Days Cycle)
                    </p>
                  </div>

                  <p className="text-[11.5px] text-slate-600 italic bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                    {phenology.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-white px-5 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div>
                {editingParcel && onDelete && (
                  <>
                    {confirmDelete ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleDelete}
                          className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Confirm Permanent Delete</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(false)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        disabled={isRestrictedForEditing}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-transparent ${
                          isRestrictedForEditing
                            ? 'text-slate-400 cursor-not-allowed'
                            : 'text-red-600 hover:bg-red-50 hover:border-red-200 cursor-pointer'
                        }`}
                        title={
                          isRestrictedForEditing
                            ? 'Restricted: Cannot delete parcels outside your assigned barangays'
                            : undefined
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Parcel</span>
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRestrictedForEditing}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
                    isRestrictedForEditing
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
                  }`}
                  title={
                    isRestrictedForEditing
                      ? 'Restricted: You are only authorized to manage parcels in your assigned barangays'
                      : undefined
                  }
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {editingParcel ? 'Update Registration' : 'Register Farm Parcel'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Dynamic Manage Reference Modal (Variety, Ecosystem, Tenure, Season, IA) with Add, Edit, Delete */}
      {manageType && (
        <ManageReferenceModal
          isOpen={!!manageType}
          onClose={() => setManageType(null)}
          type={manageType}
          onSelect={(val) => {
            if (manageType === 'variety') handleVarietyChange(val);
            else if (manageType === 'ecosystem') setFormData((p) => ({ ...p, purpose: val }));
            else if (manageType === 'tenure') setFormData((p) => ({ ...p, sex: val }));
            else if (manageType === 'season') setFormData((p) => ({ ...p, croppingSeason: val }));
            else if (manageType === 'irrigationAssociation')
              setFormData((p) => ({ ...p, irrigationAssociation: val }));
          }}
        />
      )}
    </>
  );
};
