import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { MedicineList } from './components/MedicineList';
import { MedicineFormModal } from './components/MedicineFormModal';
import { DosageCalculator } from './components/DosageCalculator';
import { HistoryView } from './components/HistoryView';
import { NotificationModal } from './components/NotificationModal';
import { 
  MedicineReminder, 
  HistoryItem, 
  ActiveTab 
} from './types';
import { 
  getStoredMedicines, 
  saveStoredMedicines, 
  getStoredHistory, 
  saveStoredHistory, 
  getStoredTheme, 
  saveStoredTheme,
  getTodayDateString,
  playAdherenceChime,
  requestBrowserNotification,
  sendBrowserNotification
} from './utils/storage';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Pill, 
  Heart,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';

export default function App() {
  // Navigation & Theme State
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [darkMode, setDarkMode] = useState<boolean>(() => getStoredTheme() === 'dark');

  // Core Data State
  const [medicines, setMedicines] = useState<MedicineReminder[]>(() => getStoredMedicines());
  const [history, setHistory] = useState<HistoryItem[]>(() => getStoredHistory());

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<MedicineReminder | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return 'Notification' in window ? Notification.permission : 'default';
  });

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'alert' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'alert' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Sync Dark Mode with DOM
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      saveStoredTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      saveStoredTheme('light');
    }
  }, [darkMode]);

  // Persist Medicines to LocalStorage
  useEffect(() => {
    saveStoredMedicines(medicines);
  }, [medicines]);

  // Persist History to LocalStorage
  useEffect(() => {
    saveStoredHistory(history);
  }, [history]);

  // Handle requesting browser notification permission
  const handleRequestNotification = async () => {
    if (!('Notification' in window)) {
      showToast('Notifications are not supported by this browser.', 'alert');
      return;
    }
    const perm = await requestBrowserNotification();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      showToast('Notification permission granted successfully!', 'success');
      playAdherenceChime('success');
      sendBrowserNotification('MediCare Reminder Activated', 'You will receive on-time reminders for your medication schedule.');
    } else {
      setIsNotificationModalOpen(true);
    }
  };

  // Add or Update Medicine Reminder
  const handleSaveMedicine = (
    medicineData: Omit<MedicineReminder, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      setMedicines((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? { ...m, ...medicineData }
            : m
        )
      );
      showToast(`Updated reminder for ${medicineData.name}`, 'success');
    } else {
      const newMed: MedicineReminder = {
        ...medicineData,
        id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      setMedicines((prev) => [newMed, ...prev]);
      showToast(`Added reminder for ${newMed.name} (${newMed.dosage} ${newMed.unit})`, 'success');
    }
    playAdherenceChime('click');
  };

  // Delete Medicine Reminder
  const handleDeleteMedicine = (id: string) => {
    const medToDelete = medicines.find((m) => m.id === id);
    setMedicines((prev) => prev.filter((m) => m.id !== id));
    if (medToDelete) {
      showToast(`Deleted reminder for ${medToDelete.name}`, 'info');
    }
  };

  // Open Edit Modal
  const handleEditMedicine = (med: MedicineReminder) => {
    setEditingMedicine(med);
    setIsAddModalOpen(true);
  };

  // Open New Add Modal
  const handleOpenAddModal = () => {
    setEditingMedicine(null);
    setIsAddModalOpen(true);
  };

  // Mark Medicine as Taken
  const handleMarkAsTaken = (medicine: MedicineReminder, scheduledTime: string) => {
    const today = getTodayDateString();

    // Check if already taken for this specific date and scheduled time
    const alreadyTaken = history.some(
      (h) =>
        h.medicineId === medicine.id &&
        h.date === today &&
        h.scheduledTime === scheduledTime &&
        h.status === 'Taken'
    );

    if (alreadyTaken) {
      showToast(`${medicine.name} at ${scheduledTime} is already marked as taken today!`, 'info');
      return;
    }

    const newHistoryItem: HistoryItem = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      medicineId: medicine.id,
      medicineName: medicine.name,
      dosage: `${medicine.dosage} ${medicine.unit}`,
      scheduledTime,
      status: 'Taken',
      date: today,
      timestamp: new Date().toISOString(),
      notes: medicine.notes || 'Dose completed as scheduled',
    };

    setHistory((prev) => [newHistoryItem, ...prev]);
    playAdherenceChime('success');
    showToast(`Great job! Marked ${medicine.name} as taken.`, 'success');
  };

  // Clear History
  const handleClearHistory = () => {
    setHistory([]);
    showToast('Adherence history cleared.', 'info');
  };

  // Count pending doses for today
  const todayPendingCount = useMemo(() => {
    const todayStr = getTodayDateString();
    let pending = 0;

    medicines.forEach((med) => {
      const isStarted = !med.startDate || todayStr >= med.startDate;
      const isNotEnded = !med.endDate || todayStr <= med.endDate;

      if (isStarted && isNotEnded) {
        const times = med.times.length > 0 ? med.times : ['09:00'];
        times.forEach((t) => {
          const isTaken = history.some(
            (h) =>
              h.medicineId === med.id &&
              h.date === todayStr &&
              h.scheduledTime === t &&
              h.status === 'Taken'
          );
          if (!isTaken) pending++;
        });
      }
    });

    return pending;
  }, [medicines, history]);

  // Periodic reminder checking and notification dispatch
  useEffect(() => {
    const notifiedThisSession = new Set<string>();

    const checkReminders = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayStr = getTodayDateString();

      medicines.forEach((med) => {
        const isStarted = !med.startDate || todayStr >= med.startDate;
        const isNotEnded = !med.endDate || todayStr <= med.endDate;

        if (isStarted && isNotEnded && med.times.includes(currentTimeStr)) {
          const reminderKey = `${med.id}-${todayStr}-${currentTimeStr}`;
          if (!notifiedThisSession.has(reminderKey)) {
            notifiedThisSession.add(reminderKey);

            // Check if already taken
            const isTaken = history.some(
              (h) =>
                h.medicineId === med.id &&
                h.date === todayStr &&
                h.scheduledTime === currentTimeStr &&
                h.status === 'Taken'
            );

            if (!isTaken) {
              playAdherenceChime('alert');
              sendBrowserNotification(
                `Medication Reminder: ${med.name}`,
                `It's time to take your dose of ${med.dosage} ${med.unit}. ${med.notes || ''}`
              );
              showToast(
                `Reminder: Time to take ${med.name} (${med.dosage} ${med.unit})!`,
                'alert'
              );
            }
          }
        }
      });
    };

    // Run immediately and every 30 seconds
    checkReminders();
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [medicines, history, showToast]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenAddModal={handleOpenAddModal}
        notificationPermission={notificationPermission}
        onRequestNotification={() => setIsNotificationModalOpen(true)}
        todayPendingCount={todayPendingCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && (
          <Dashboard
            medicines={medicines}
            history={history}
            setActiveTab={setActiveTab}
            onOpenAddModal={handleOpenAddModal}
            onMarkAsTaken={handleMarkAsTaken}
          />
        )}

        {activeTab === 'medicines' && (
          <MedicineList
            medicines={medicines}
            history={history}
            onOpenAddModal={handleOpenAddModal}
            onEditMedicine={handleEditMedicine}
            onDeleteMedicine={handleDeleteMedicine}
            onMarkAsTaken={handleMarkAsTaken}
          />
        )}

        {activeTab === 'calculator' && <DosageCalculator />}

        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>

      {/* Add / Edit Medicine Modal */}
      <MedicineFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMedicine(null);
        }}
        onSave={handleSaveMedicine}
        editingMedicine={editingMedicine}
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        permission={notificationPermission}
        onRequestPermission={handleRequestNotification}
      />

      {/* Toast Notification Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold transition-all ${
              toast.type === 'success'
                ? 'bg-teal-900 text-white border-teal-700'
                : toast.type === 'alert'
                ? 'bg-amber-900 text-white border-amber-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'alert' && <AlertCircle className="w-5 h-5 text-amber-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Professional Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                <Pill className="w-3.5 h-3.5 -rotate-45" />
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                MediCare Reminder
              </span>
              <span>— Smart reminders for safer medication routines.</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                <span>B.Tech / College Project Showcase Ready</span>
              </span>
              <span>•</span>
              <span>Local Storage Engine</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
            Educational Disclaimer: This tool is designed for educational calculation assistance and personal routine reminders only. It does not provide medical prescriptions or guarantee clinical safety. Consult a licensed physician or pharmacist for medical advice.
          </div>
        </div>
      </footer>
    </div>
  );
}
