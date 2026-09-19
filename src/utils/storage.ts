import { MedicineReminder, HistoryItem, ReminderStatus } from '../types';
import { INITIAL_MEDICINES, INITIAL_HISTORY } from '../data/initialData';

const MEDICINES_STORAGE_KEY = 'medicare_reminders_v1';
const HISTORY_STORAGE_KEY = 'medicare_history_v1';
const THEME_STORAGE_KEY = 'medicare_theme';

export const getStoredMedicines = (): MedicineReminder[] => {
  try {
    const raw = localStorage.getItem(MEDICINES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MEDICINES_STORAGE_KEY, JSON.stringify(INITIAL_MEDICINES));
      return INITIAL_MEDICINES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading medicines from localStorage:', e);
    return INITIAL_MEDICINES;
  }
};

export const saveStoredMedicines = (medicines: MedicineReminder[]): void => {
  try {
    localStorage.setItem(MEDICINES_STORAGE_KEY, JSON.stringify(medicines));
  } catch (e) {
    console.error('Error saving medicines to localStorage:', e);
  }
};

export const getStoredHistory = (): HistoryItem[] => {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(INITIAL_HISTORY));
      return INITIAL_HISTORY;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading history from localStorage:', e);
    return INITIAL_HISTORY;
  }
};

export const saveStoredHistory = (history: HistoryItem[]): void => {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Error saving history to localStorage:', e);
  }
};

export const getStoredTheme = (): 'light' | 'dark' => {
  try {
    const theme = localStorage.getItem(THEME_STORAGE_KEY);
    if (theme === 'dark' || theme === 'light') return theme;
    return 'light'; // Default to clean medical light theme
  } catch {
    return 'light';
  }
};

export const saveStoredTheme = (theme: 'light' | 'dark'): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    console.error('Error saving theme:', e);
  }
};

// Date & Time Utility helpers
export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatTime12h = (time24: string): string => {
  if (!time24) return '';
  const [hoursStr, minutesStr] = time24.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr || '00';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  return `${hours}:${minutes} ${ampm}`;
};

// Evaluate current medicine status for today
export const getMedicineStatusToday = (
  medicine: MedicineReminder,
  history: HistoryItem[]
): ReminderStatus => {
  const today = getTodayDateString();

  // Check if today is within start and end date
  if (medicine.startDate && today < medicine.startDate) {
    return 'Upcoming';
  }
  if (medicine.endDate && today > medicine.endDate) {
    return 'Taken'; // Completed course
  }

  // Check today's history entries for this medicine
  const todayEntries = history.filter(
    h => h.medicineId === medicine.id && h.date === today
  );

  const takenEntries = todayEntries.filter(h => h.status === 'Taken');
  const allScheduledTimes = medicine.times.length > 0 ? medicine.times : ['09:00'];

  // If user has taken all scheduled doses for today
  if (takenEntries.length >= allScheduledTimes.length && allScheduledTimes.length > 0) {
    return 'Taken';
  }

  // Check if any scheduled dose was missed or is overdue
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let hasPendingUpcoming = false;
  let hasOverdueMissed = false;

  for (const t of allScheduledTimes) {
    const isTaken = takenEntries.some(e => e.scheduledTime === t);
    if (!isTaken) {
      const [hStr, mStr] = t.split(':');
      const timeMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);
      
      // If overdue by more than 45 minutes
      if (currentMinutes > timeMinutes + 45) {
        hasOverdueMissed = true;
      } else {
        hasPendingUpcoming = true;
      }
    }
  }

  if (hasOverdueMissed && !hasPendingUpcoming) {
    return 'Missed';
  }

  return 'Upcoming';
};

// Play a pleasant chime tone using Web Audio API
export const playAdherenceChime = (type: 'success' | 'alert' | 'click' = 'success'): void => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === 'success') {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(659.25, now + 0.1);
      osc2.frequency.exponentialRampToValueAtTime(783.99, now + 0.25); // G5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.2);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.4);
    } else if (type === 'alert') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(330, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (e) {
    // Ignore audio errors in restricted browser states
  }
};

// Request Notification Permission
export const requestBrowserNotification = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.warn('Could not request notification permission:', e);
    return 'denied';
  }
};

// Dispatch a system or fallback notification
export const sendBrowserNotification = (title: string, body: string): boolean => {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/assets/medicare-icon.png',
      });
      return true;
    } catch (e) {
      console.warn('Notification failed, falling back:', e);
    }
  }
  return false;
};
