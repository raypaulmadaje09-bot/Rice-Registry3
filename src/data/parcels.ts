import { FarmParcel } from '../types';
import rawParcels from '../data_parcels.json';
import { generateInitialSeasonalRecords } from './seasonalProduction';
import { getAssignedLftForBarangay } from './barangays';

const baseList: FarmParcel[] = (rawParcels as FarmParcel[]).map((p) => {
  const assignedLft = getAssignedLftForBarangay(p.barangay).name;
  const updatedParcel = {
    ...p,
    focalPerson: assignedLft
  };
  const rawRecords = p.seasonalRecords && p.seasonalRecords.length > 0
    ? p.seasonalRecords
    : generateInitialSeasonalRecords(updatedParcel);

  const seasonalRecords = rawRecords.map((r) => ({
    ...r,
    lftOfficerName: assignedLft
  }));

  return {
    ...updatedParcel,
    seasonalRecords
  };
});

export const INITIAL_PARCELS: FarmParcel[] = baseList;
