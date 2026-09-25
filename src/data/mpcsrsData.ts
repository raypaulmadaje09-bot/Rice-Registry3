import { OfficialSignatory } from '../types';

export interface MpcsrsBarangayRow {
  id: string;
  barangay: string;
  validatedAreaHa: number;
  newlyPlantedHa?: number;
  vegetativeStageHa?: number;
  reproductiveStageHa?: number;
  maturingStageHa?: number;
}

export interface MpcsrsGroup {
  id: string;
  technicianName?: string;
  subtotalAreaHa?: number;
  rows: MpcsrsBarangayRow[];
}

export interface MpcsrsReportData {
  region: string;
  municipalityProvince: string;
  totalValidatedAreaHa: number;
  groups: MpcsrsGroup[];
  preparedByName: string;
  preparedByTitle: string;
  approvedByName: string;
  approvedByTitle: string;
  signatories?: OfficialSignatory[];
  footnote: string;
}

export const DEFAULT_MPCSRS_DATA: MpcsrsReportData = {
  region: 'REGION VIII',
  municipalityProvince: 'Silago, Southern Leyte',
  totalValidatedAreaHa: 495.0,
  groups: [
    {
      id: 'grp-1',
      technicianName: 'JUNIE T. ELMIDO',
      subtotalAreaHa: 196.25,
      rows: [
        { id: 'm-1', barangay: 'Pob. Dist. I', validatedAreaHa: 43.5, newlyPlantedHa: 13.5 },
        { id: 'm-2', barangay: 'Sudmon', validatedAreaHa: 20.0, newlyPlantedHa: 10.0 },
        { id: 'm-3', barangay: 'Hingatungan', validatedAreaHa: 87.75 },
        { id: 'm-4', barangay: 'Laguma', validatedAreaHa: 35.0, newlyPlantedHa: 25.0 },
        { id: 'm-5', barangay: 'Balagawan', validatedAreaHa: 10.0 }
      ]
    },
    {
      id: 'grp-2',
      subtotalAreaHa: 228.5,
      rows: [
        { id: 'm-6', barangay: 'Pob. Dist. II', validatedAreaHa: 50.0, newlyPlantedHa: 10.0 },
        { id: 'm-7', barangay: 'Tubod', validatedAreaHa: 37.0, newlyPlantedHa: 7.0 },
        { id: 'm-8', barangay: 'Tubod', validatedAreaHa: 37.0 },
        { id: 'm-9', barangay: 'Tubaon', validatedAreaHa: 10.0, newlyPlantedHa: 5.0 },
        { id: 'm-10', barangay: 'Mercedes', validatedAreaHa: 70.5 },
        { id: 'm-11', barangay: 'Salvacion', validatedAreaHa: 30.0 },
        { id: 'm-12', barangay: 'Sap-ang', validatedAreaHa: 31.0, newlyPlantedHa: 21.0 }
      ]
    },
    {
      id: 'grp-3',
      subtotalAreaHa: 70.25,
      rows: [
        { id: 'm-13', barangay: 'Katipunan', validatedAreaHa: 43.0, newlyPlantedHa: 8.0 },
        { id: 'm-14', barangay: 'Catmon', validatedAreaHa: 10.0 },
        { id: 'm-15', barangay: 'Imelda', validatedAreaHa: 1.0, newlyPlantedHa: 1.0 },
        { id: 'm-16', barangay: 'Puntana', validatedAreaHa: 16.25, newlyPlantedHa: 6.25 }
      ]
    }
  ],
  preparedByName: '',
  preparedByTitle: 'Signature over Printed Name / Designation',
  approvedByName: 'JUNIE T. ELMIDO',
  approvedByTitle: 'Municipal/City Agriculturist',
  footnote: '*Based from PSA-BAS Operational Definition on Monthly Palay & Corn Situation Reposting System (MPCSRS) and DA Operational Guidelines.'
};

const MPCSRS_STORAGE_KEY = 'silago_mpcsrs_report_data';

export function loadMpcsrsReportData(): MpcsrsReportData {
  try {
    const raw = localStorage.getItem(MPCSRS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.groups)) {
        // If legacy cached data contained hardcoded WELLA S. BONGON, clear it so Prepared by remains blank
        if (parsed.preparedByName === 'WELLA S. BONGON') {
          parsed.preparedByName = '';
          parsed.preparedByTitle = 'Signature over Printed Name / Designation';
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load MPCSRS report data:', e);
  }
  return DEFAULT_MPCSRS_DATA;
}

export function saveMpcsrsReportData(data: MpcsrsReportData) {
  try {
    localStorage.setItem(MPCSRS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save MPCSRS report data:', e);
  }
}
