export type MedicineUnit = 'mg' | 'ml' | 'tablet' | 'capsule' | 'drops';

export type FrequencyType = 'Once daily' | 'Twice daily' | 'Three times daily' | 'Custom';

export type ReminderStatus = 'Upcoming' | 'Taken' | 'Missed';

export interface MedicineReminder {
  id: string;
  name: string;
  dosage: number;
  unit: MedicineUnit;
  frequency: FrequencyType;
  times: string[]; // e.g. ["08:00", "20:00"] (24-hour HH:mm)
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
  colorTag?: string; // emerald, sky, purple, amber, rose
}

export interface HistoryItem {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  status: 'Taken' | 'Missed';
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO string
  notes?: string;
}

export interface BasicDoseInputs {
  requiredDose: string;
  availableDose: string;
  availableQuantity: string;
  doseUnit: string;
  quantityUnit: string;
}

export interface WeightDoseInputs {
  patientWeightKg: string;
  prescribedDoseMgKg: string;
  dosesPerDay: string;
}

export type ActiveTab = 'home' | 'medicines' | 'calculator' | 'history';
