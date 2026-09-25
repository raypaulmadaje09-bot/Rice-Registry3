import { OfficialSignatory } from '../types';

export type { OfficialSignatory };

export interface OfficialReportLetter {
  id: string;
  title: string;
  memoRef: string;
  date: string;
  // Header texts that can be customized
  countryHeader?: string;
  republicHeader?: string;
  provinceHeader?: string;
  municipalityHeader?: string;
  officeHeader?: string;
  memorandumFor: string;
  memorandumForTitle: string;
  thru?: string;
  thruTitle?: string;
  from: string;
  fromOfficer?: string;
  fromTitle: string;
  subject: string;
  openingGreeting: string;
  bodyParagraph1: string;
  includeStatsSummaryTable: boolean;
  bodyParagraph2: string;
  closingStatement: string;
  preparedBy: string;
  preparedTitle: string;
  reviewedBy: string;
  reviewedTitle: string;
  approvedBy: string;
  approvedTitle: string;
  signatories?: OfficialSignatory[];
  isDefault?: boolean;
}

export const DEFAULT_REPORT_LETTERS: OfficialReportLetter[] = [
  {
    id: 'letter-irrigators-overview',
    title: 'Irrigators Association & Rice Land Overview',
    memoRef: 'SLG-MAO-IA-2024-01',
    date: 'February 21, 2024',
    countryHeader: '',
    republicHeader: 'Republic of the Philippines',
    provinceHeader: 'Province of Southern Leyte',
    municipalityHeader: 'Municipality of Silago',
    officeHeader: 'Municipal Agriculture Office',
    memorandumFor: 'HON. LEMUEL P. HONOR',
    memorandumForTitle: 'Municipal Mayor, Municipality of Silago',
    thru: 'CAREIN M. TOMOL',
    thruTitle: 'MAO-OIC, Municipal Agriculture Office',
    from: 'WELLA S. BONGON',
    fromTitle: 'Rice Technician / Agricultural Technologist',
    subject: 'SUMMARY OF IRRIGATED & RAINFED RICE LANDS AND DIRECTORY OF ACTIVE IRRIGATORS ASSOCIATIONS',
    openingGreeting: 'Summary of verified municipal rice landholdings and active irrigators associations:',
    bodyParagraph1: 'Official agricultural profile encompassing 495 hectares of Irrigated Rice Lands, 5 hectares of Rainfed Rice Land, and 500 registered Rice Farmers across the sixteen (16) duly accredited Irrigators Associations of the Municipality of Silago.',
    includeStatsSummaryTable: false,
    bodyParagraph2: 'All sixteen (16) Irrigators Associations are actively operating under the coordination of the Municipal Agriculture Office, providing vital irrigation distribution, field clustering, and water management across our municipal agricultural zones.',
    closingStatement: 'Submitted for official municipal records, program coordination, and operational planning.',
    preparedBy: 'WELLA S. BONGON',
    preparedTitle: 'RICE TECHNICIAN',
    reviewedBy: 'CAREIN M. TOMOL',
    reviewedTitle: 'MAO-OIC',
    approvedBy: 'CAREIN M. TOMOL',
    approvedTitle: 'MAO-OIC',
    isDefault: true
  },
  {
    id: 'letter-mpcsrs-monthly',
    title: 'MPCSRS Monthly Palay & Crop Validation Report',
    memoRef: 'SLG-MAO-MPCSRS-2024-02',
    date: 'February 21, 2024',
    countryHeader: '',
    republicHeader: 'REGION VIII • REGION 8 (EASTERN VISAYAS)',
    provinceHeader: 'Municipality/City: Silago, Southern Leyte',
    municipalityHeader: 'Department of Agriculture & PSA-BAS Reporting System',
    officeHeader: 'MONTHLY PALAY & CORN SITUATION REPORTING SYSTEM (MPCSRS)',
    memorandumFor: 'REGIONAL EXECUTIVE DIRECTOR',
    memorandumForTitle: 'Department of Agriculture - Regional Field Office VIII',
    thru: 'PROVINCIAL STATISTICIAN & PROVINCIAL AGRICULTURIST',
    thruTitle: 'Southern Leyte Provincial Field Office',
    from: 'JUNIE T. ELMIDO',
    fromTitle: 'Municipal/City Agriculturist',
    subject: 'MONTHLY PALAY STANDING CROP & VALIDATED BARANGAY AREA HARVEST SITUATION REPORT',
    openingGreeting: 'Monthly consolidated standing crop and validated rice area report:',
    bodyParagraph1: 'Submitting herewith the validated rice area distribution totaling 495.00 hectares across all municipal barangays, categorized into Newly Planted/Seedling Stage, Vegetative Stage, Reproductive Stage, and Maturing Stage under the supervision of assigned Agricultural Technicians.',
    includeStatsSummaryTable: true,
    bodyParagraph2: 'Based from PSA-BAS Operational Definition on Monthly Palay & Corn Situation Reporting System (MPCSRS) and Department of Agriculture operational field guidelines.',
    closingStatement: 'Certified correct and verified through ground surveys by the municipal consolidator and field technicians.',
    preparedBy: 'WELLA S. BONGON',
    preparedTitle: 'AT/Report Officer/Consolidator',
    reviewedBy: 'JUNIE T. ELMIDO',
    reviewedTitle: 'Municipal/City Agriculturist',
    approvedBy: 'JUNIE T. ELMIDO',
    approvedTitle: 'Municipal/City Agriculturist',
    isDefault: true
  },
  {
    id: 'letter-transmittal-mayor-sb',
    title: 'Transmittal to Mayor & Sangguniang Bayan',
    memoRef: 'SLG-MAO-RICE-2024-02B',
    date: 'February 21, 2024',
    memorandumFor: 'HON. LEMUEL P. HONOR',
    memorandumForTitle: 'Municipal Mayor, Municipality of Silago',
    thru: 'THE SANGGUNIANG BAYAN / COMMITTEE ON AGRICULTURE',
    thruTitle: 'Municipality of Silago, Province of Southern Leyte',
    from: 'ENGR. ARNALDO M. VALDEZ',
    fromTitle: 'Municipal Agriculturist / Municipal LFT Coordinator',
    subject: 'TRANSMITTAL AND ENDORSEMENT OF OFFICIAL MASTERLIST OF RSBSA-REGISTERED RICE FARMERS AND GIS-MAPPED PARCELS FOR BARANGAY {BARANGAY}',
    openingGreeting: 'Greetings of peace and progress in agriculture!',
    bodyParagraph1: 'Respectfully submitting herewith the official, field-validated Masterlist and GIS Land Registry of registered rice farmers and agricultural parcels within the jurisdiction of Barangay {BARANGAY}, Municipality of Silago, Southern Leyte for the {SEASON} cropping period.',
    includeStatsSummaryTable: true,
    bodyParagraph2: 'This masterlist was comprehensively surveyed, geo-referenced, and cross-referenced with the Registry System for Basic Sectors in Agriculture (RSBSA) database by our designated Local Farmer Technicians (LFTs) and Agricultural Field Officers. All listed landholdings have been verified on-ground to ensure accuracy in boundary mapping, legitimate land tenure status, and actual standing crop condition.',
    closingStatement: 'This submission is formally tendered for legislative noting, program validation, resource allocation, and inclusion in the municipal agricultural registry and socio-economic profiling of Silago.',
    preparedBy: 'Wella S. Bongons',
    preparedTitle: 'Local Farmer Technician (LFT) / Rice Sector Focal',
    reviewedBy: 'Engr. Arnaldo M. Valdez',
    reviewedTitle: 'Municipal Agriculturist / Municipal LFT Coordinator',
    approvedBy: 'Hon. Lemuel P. Honor',
    approvedTitle: 'Municipal Mayor - Silago, Southern Leyte',
    isDefault: true
  },
  {
    id: 'letter-endorsement-da-rfo8',
    title: 'Endorsement to DA RFO-8 & Provincial Agriculture',
    memoRef: 'SLG-MAO-RICE-2024-03E',
    date: 'February 25, 2024',
    memorandumFor: 'HON. DAMIAN G. MERCADO',
    memorandumForTitle: 'Governor, Province of Southern Leyte',
    thru: 'DR. ILUMINADO C. VALDEZ',
    thruTitle: 'Provincial Agriculturist, Southern Leyte Agricultural Office',
    from: 'ENGR. ARNALDO M. VALDEZ',
    fromTitle: 'Municipal Agriculturist, Silago, Southern Leyte',
    subject: 'ENDORSEMENT OF VERIFIED RICE FARMERS MASTERLIST FOR DA RFO-8 INTERVENTIONS AND PCIC CROP INSURANCE',
    openingGreeting: 'Warm agricultural greetings!',
    bodyParagraph1: 'The Municipal Agricultural Office of Silago respectfully transmits and endorses the attached masterlist of verified rice producers and farm parcels from Barangay {BARANGAY} for eligibility under the Department of Agriculture Regional Field Office VIII (DA RFO-8) Masagana Rice Industry Development Program (MRIDP).',
    includeStatsSummaryTable: true,
    bodyParagraph2: 'The beneficiaries listed herein have been fully verified with authentic RSBSA reference numbers and precision GPS parcel coordinates. We hereby endorse them for prioritized allocation of Certified Inbred/Hybrid Seeds, Fertilizer Discount Vouchers (FDV), Fuel Assistance, and Philippine Crop Insurance Corporation (PCIC) comprehensive crop coverage.',
    closingStatement: 'Favorable action, accreditation, and inclusion in the upcoming provincial distribution schedule are earnestly sought.',
    preparedBy: 'Wella S. Bongons',
    preparedTitle: 'Local Farmer Technician (LFT)',
    reviewedBy: 'Engr. Arnaldo M. Valdez',
    reviewedTitle: 'Municipal Agriculturist',
    approvedBy: 'Hon. Lemuel P. Honor',
    approvedTitle: 'Municipal Mayor',
    isDefault: true
  },
  {
    id: 'letter-certification-barangay-posting',
    title: 'Barangay Hall RSBSA Posting Certification',
    memoRef: 'SLG-MAO-CERT-2024-01A',
    date: 'March 01, 2024',
    memorandumFor: 'ALL CONCERNED RICE FARMERS AND RESIDENTS',
    memorandumForTitle: 'Barangay {BARANGAY}, Silago, Southern Leyte',
    thru: 'PUNONG BARANGAY AND SANGGUNIANG BARANGAY MEMBERS',
    thruTitle: 'Barangay Local Government Unit of {BARANGAY}',
    from: 'Municipal Agriculture Office',
    fromTitle: 'Municipality of Silago, Southern Leyte',
    subject: 'PUBLIC CERTIFICATION AND POSTING OF VERIFIED RSBSA MASTERLIST OF RICE PRODUCERS',
    openingGreeting: 'To all agricultural stakeholders and constituent farmers:',
    bodyParagraph1: 'THIS IS TO CERTIFY that the attached registry containing {FARMER_COUNT} registered rice farmers covering an aggregate cultivated area of {TOTAL_AREA} hectares in Barangay {BARANGAY} has been duly verified and posted on the official bulletin board of the Barangay Hall for public scrutiny and transparency.',
    includeStatsSummaryTable: true,
    bodyParagraph2: 'Farmers whose names are listed are confirmed registered under the RSBSA system. Any omission, spelling correction, or parcel boundary adjustment may be formally reported to the assigned Local Farmer Technician (LFT) or at the Municipal Agriculture Office within fifteen (15) working days from this date.',
    closingStatement: 'Issued this {DATE} at Silago, Southern Leyte for all legal, administrative, and subsidy entitlement purposes.',
    preparedBy: 'Wella S. Bongons',
    preparedTitle: 'Local Farmer Technician (LFT)',
    reviewedBy: 'Engr. Arnaldo M. Valdez',
    reviewedTitle: 'Municipal Agriculturist',
    approvedBy: 'Hon. Lemuel P. Honor',
    approvedTitle: 'Municipal Mayor',
    isDefault: true
  }
];

export const REPORT_LETTERS_STORAGE_KEY = 'silago_official_report_letters';

export function loadSavedReportLetters(): OfficialReportLetter[] {
  try {
    const raw = localStorage.getItem(REPORT_LETTERS_STORAGE_KEY);
    if (!raw) return DEFAULT_REPORT_LETTERS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Normalize legacy text
      const normalized = parsed.map((item: OfficialReportLetter) => {
        if (item.officeHeader === 'OFFICE OF THE MUNICIPAL AGRICULTURAL SERVICES') {
          item.officeHeader = 'Municipal Agriculture Office';
        }
        if (item.from === 'OFFICE OF THE MUNICIPAL AGRICULTURAL SERVICES') {
          item.from = 'Municipal Agriculture Office';
        }
        return item;
      });
      // Merge in any missing default templates so new features are immediately accessible
      const existingIds = new Set(normalized.map((p: OfficialReportLetter) => p.id));
      const missingDefaults = DEFAULT_REPORT_LETTERS.filter((def) => !existingIds.has(def.id));
      if (missingDefaults.length > 0) {
        const merged = [...missingDefaults, ...normalized];
        saveReportLetters(merged);
        return merged;
      }
      return normalized;
    }
  } catch (e) {
    console.warn('Failed to load letters from localStorage:', e);
  }
  return DEFAULT_REPORT_LETTERS;
}

export function saveReportLetters(letters: OfficialReportLetter[]) {
  try {
    localStorage.setItem(REPORT_LETTERS_STORAGE_KEY, JSON.stringify(letters));
  } catch (e) {
    console.warn('Failed to save letters to localStorage:', e);
  }
}
