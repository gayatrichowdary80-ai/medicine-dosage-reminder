import { MedicineReminder, HistoryItem } from '../types';

const getTodayString = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_MEDICINES: MedicineReminder[] = [
  {
    id: 'med-1',
    name: 'Amoxicillin',
    dosage: 500,
    unit: 'mg',
    frequency: 'Twice daily',
    times: ['08:00', '20:00'],
    startDate: getTodayString(-3),
    endDate: getTodayString(4),
    notes: 'Take after meals with plenty of water. Finish full course.',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    colorTag: 'emerald',
  },
  {
    id: 'med-2',
    name: 'Metformin',
    dosage: 850,
    unit: 'mg',
    frequency: 'Once daily',
    times: ['13:00'],
    startDate: getTodayString(-15),
    endDate: getTodayString(45),
    notes: 'Take with lunch to reduce stomach upset.',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    colorTag: 'sky',
  },
  {
    id: 'med-3',
    name: 'Vitamin D3 Drops',
    dosage: 4,
    unit: 'drops',
    frequency: 'Once daily',
    times: ['09:00'],
    startDate: getTodayString(-5),
    endDate: getTodayString(25),
    notes: 'Place drops directly on tongue or in juice.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    colorTag: 'amber',
  },
  {
    id: 'med-4',
    name: 'Lisinopril',
    dosage: 10,
    unit: 'mg',
    frequency: 'Once daily',
    times: ['21:00'],
    startDate: getTodayString(-10),
    endDate: getTodayString(50),
    notes: 'Take at night for blood pressure control.',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    colorTag: 'purple',
  }
];

export const INITIAL_HISTORY: HistoryItem[] = [
  {
    id: 'hist-1',
    medicineId: 'med-1',
    medicineName: 'Amoxicillin',
    dosage: '500 mg',
    scheduledTime: '08:00',
    status: 'Taken',
    date: getTodayString(0),
    timestamp: new Date().toISOString(),
    notes: 'Taken on schedule with breakfast',
  },
  {
    id: 'hist-2',
    medicineId: 'med-3',
    medicineName: 'Vitamin D3 Drops',
    dosage: '4 drops',
    scheduledTime: '09:00',
    status: 'Taken',
    date: getTodayString(0),
    timestamp: new Date().toISOString(),
    notes: 'Taken with morning glass of water',
  },
  {
    id: 'hist-3',
    medicineId: 'med-2',
    medicineName: 'Metformin',
    dosage: '850 mg',
    scheduledTime: '13:00',
    status: 'Taken',
    date: getTodayString(-1),
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    notes: 'Taken after lunch',
  },
  {
    id: 'hist-4',
    medicineId: 'med-1',
    medicineName: 'Amoxicillin',
    dosage: '500 mg',
    scheduledTime: '20:00',
    status: 'Missed',
    date: getTodayString(-1),
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    notes: 'Missed evening dose while traveling',
  }
];
