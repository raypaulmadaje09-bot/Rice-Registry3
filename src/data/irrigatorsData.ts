import { OfficialSignatory } from '../types';

export interface IrrigatorsAssociationItem {
  id: string;
  associationName: string;
  contactPerson: string;
  barangay: string;
}

export interface IrrigatorsDirectoryLetterData {
  republicHeader: string;
  provinceHeader: string;
  municipalityHeader: string;
  officeHeader: string;
  totalIrrigatedAreaHa: number;
  totalRainfedAreaHa: number;
  totalRiceFarmersCount: number;
  associations: IrrigatorsAssociationItem[];
  preparedByName: string;
  preparedByTitle: string;
  notedByName: string;
  notedByTitle: string;
  signatories?: OfficialSignatory[];
}

export const DEFAULT_IRRIGATORS_ASSOCIATIONS: IrrigatorsAssociationItem[] = [
  {
    id: 'ia-1',
    associationName: 'PATIK PUNTANA SILAGO FARMERS IRRIGATORS ASSOCIATION',
    contactPerson: 'ADAM REGIS',
    barangay: 'TUBOD'
  },
  {
    id: 'ia-2',
    associationName: 'KATIPUNAN SILAGO IRRIGATORS ASSOCIATION',
    contactPerson: 'RODRIGO E. DOLORITO',
    barangay: 'KATIPUNAN'
  },
  {
    id: 'ia-3',
    associationName: 'BALAGAWAN RICE FARMER ASSOCIATION',
    contactPerson: 'DHONDY MARK T. SUMACOT',
    barangay: 'BALAGAWAN'
  },
  {
    id: 'ia-4',
    associationName: 'LAGUMA IRRIGATORS ASSOCIATION',
    contactPerson: 'RECROCELIO B. RAMAS',
    barangay: 'LAGUMA'
  },
  {
    id: 'ia-5',
    associationName: 'SUDMON GUIMBAOLAN IRIIGATORS ASSOCIATION, INCORPORATION',
    contactPerson: 'GILBERT D. SUMALINOG',
    barangay: 'SUDMON'
  },
  {
    id: 'ia-6',
    associationName: 'SAP-ANG SILAGO FARMERS IRRIGATORS ASSOCIATION, INCORPORATION',
    contactPerson: 'MARIANO O. LABRADOR',
    barangay: 'SAP-ANG'
  },
  {
    id: 'ia-7',
    associationName: 'KASULAO IRRIGATORS ASSOCIATION',
    contactPerson: 'CELSO ABETACION',
    barangay: 'TUBAON'
  },
  {
    id: 'ia-8',
    associationName: 'PUNTANA SILAGO IRRIGATORS ASSOCIATION',
    contactPerson: 'VENERANDO T. ANSALE',
    barangay: 'PUNTANA'
  },
  {
    id: 'ia-9',
    associationName: 'KAABON SMALL FARMERS IRRIGATORS ASSOCIATION',
    contactPerson: 'ROLANDO B. TARRAYO',
    barangay: 'HINGATUNGAN'
  },
  {
    id: 'ia-10',
    associationName: 'HINGATUNGAN IRRIGATORS ASSOCIATION',
    contactPerson: 'VIRGILIO T. TOSLOC',
    barangay: 'HINGATUNGAN'
  },
  {
    id: 'ia-11',
    associationName: 'CATIGBAO SILAGO FARMERS IRRIGATORS ASSOCIATION',
    contactPerson: 'MARCELO S. ALMINE',
    barangay: 'KATIPUNAN'
  },
  {
    id: 'ia-12',
    associationName: 'POBLACION DOS FARMERS ASSOCIATION',
    contactPerson: 'NESARIO DAVID',
    barangay: 'POB. DIST. II'
  },
  {
    id: 'ia-13',
    associationName: 'POBLACION DISTRICT 2 IRRIGATORS ASSOCIATION',
    contactPerson: 'EDWIN MESTIOLA',
    barangay: 'POB. DIST. II'
  },
  {
    id: 'ia-14',
    associationName: 'SALVACION RICE FARMERS IRRIGATORS ASSOCIATION, INCORPORATION',
    contactPerson: 'RODOLFO DAGOOC',
    barangay: 'SALVACION'
  },
  {
    id: 'ia-15',
    associationName: 'ASSOSASYON SA IRRIDERONG NAG-UGMAD SA IRRIGASYON SA BARANGAY MERCEDES',
    contactPerson: 'GRAZY SUMALINOG',
    barangay: 'MERCEDES'
  },
  {
    id: 'ia-16',
    associationName: 'SAGIMSIM IRRIGATORS ASSOCIATION',
    contactPerson: 'LUCIANO RONDON',
    barangay: 'HINGATUNGAN'
  }
];

export const DEFAULT_IRRIGATORS_LETTER_DATA: IrrigatorsDirectoryLetterData = {
  republicHeader: 'Republic of the Philippines',
  provinceHeader: 'Province of Southern Leyte',
  municipalityHeader: 'Municipality of Silago',
  officeHeader: 'Municipal Agriculture Office',
  totalIrrigatedAreaHa: 495,
  totalRainfedAreaHa: 5,
  totalRiceFarmersCount: 500,
  associations: DEFAULT_IRRIGATORS_ASSOCIATIONS,
  preparedByName: '',
  preparedByTitle: 'Signature over Printed Name / Designation',
  notedByName: 'CAREIN M. TOMOL',
  notedByTitle: 'MAO-OIC'
};

const STORAGE_KEY = 'silago_irrigators_letter_data';

export function loadIrrigatorsLetterData(): IrrigatorsDirectoryLetterData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.associations)) {
        // Normalize legacy cached data
        if (parsed.preparedByName === 'WELLA S. BONGON') {
          parsed.preparedByName = '';
          parsed.preparedByTitle = 'Signature over Printed Name / Designation';
        }
        if (parsed.officeHeader === 'OFFICE OF THE MUNICIPAL AGRICULTURAL SERVICES') {
          parsed.officeHeader = 'Municipal Agriculture Office';
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load irrigators letter data:', e);
  }
  return DEFAULT_IRRIGATORS_LETTER_DATA;
}

export function saveIrrigatorsLetterData(data: IrrigatorsDirectoryLetterData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save irrigators letter data:', e);
  }
}
