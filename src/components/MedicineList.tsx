import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Clock, 
  Calendar, 
  Pill, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  X,
  FileText
} from 'lucide-react';
import { MedicineReminder, HistoryItem, ReminderStatus } from '../types';
import { 
  formatTime12h, 
  formatDisplayDate, 
  getMedicineStatusToday 
} from '../utils/storage';

interface MedicineListProps {
  medicines: MedicineReminder[];
  history: HistoryItem[];
  onOpenAddModal: () => void;
  onEditMedicine: (medicine: MedicineReminder) => void;
  onDeleteMedicine: (id: string) => void;
  onMarkAsTaken: (medicine: MedicineReminder, scheduledTime: string) => void;
}

export const MedicineList: React.FC<MedicineListProps> = ({
  medicines,
  history,
  onOpenAddModal,
  onEditMedicine,
  onDeleteMedicine,
  onMarkAsTaken,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ReminderStatus>('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Compute status for all medicines
  const medicineStatusMap = useMemo(() => {
    const map = new Map<string, ReminderStatus>();
    medicines.forEach((med) => {
      map.set(med.id, getMedicineStatusToday(med, history));
    });
    return map;
  }, [medicines, history]);

  // Filtered medicines
  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      const matchesSearch =
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.dosage.toString().includes(searchTerm) ||
        (med.notes && med.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (statusFilter === 'All') return true;

      const currentStatus = medicineStatusMap.get(med.id);
      return currentStatus === statusFilter;
    });
  }, [medicines, searchTerm, statusFilter, medicineStatusMap]);

  const getStatusBadge = (status: ReminderStatus) => {
    switch (status) {
      case 'Taken':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Taken
          </span>
        );
      case 'Missed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-3.5 h-3.5" /> Missed
          </span>
        );
      case 'Upcoming':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <Clock className="w-3.5 h-3.5" /> Upcoming
          </span>
        );
    }
  };

  const getCardBorderColor = (tag?: string) => {
    switch (tag) {
      case 'sky':
        return 'border-sky-200 dark:border-sky-900/60';
      case 'purple':
        return 'border-purple-200 dark:border-purple-900/60';
      case 'amber':
        return 'border-amber-200 dark:border-amber-900/60';
      case 'rose':
        return 'border-rose-200 dark:border-rose-900/60';
      case 'emerald':
      default:
        return 'border-teal-200/80 dark:border-teal-900/60';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Prescription & Reminder Schedule
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your daily doses, timing intervals, and adherence confirmations
          </p>
        </div>

        <button
          id="add-medicine-header-btn"
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-md shadow-teal-600/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="medicine-search-input"
            type="text"
            placeholder="Search by medicine name, dosage, or note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500 focus:bg-white dark:focus:bg-slate-800"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {(['All', 'Upcoming', 'Taken', 'Missed'] as const).map((tab) => {
            const isSelected = statusFilter === tab;
            return (
              <button
                key={tab}
                id={`filter-tab-${tab.toLowerCase()}`}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Medicines Grid / Cards */}
      {filteredMedicines.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4">
            <Pill className="w-7 h-7 -rotate-45" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
            {searchTerm || statusFilter !== 'All'
              ? 'No Medicines Matching Filters'
              : 'No Medication Reminders Yet'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1.5">
            {searchTerm || statusFilter !== 'All'
              ? 'Try adjusting your search query or reset status filters to view all scheduled medicines.'
              : 'Add your first medication to establish timely automated reminders and adherence history.'}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            {searchTerm || statusFilter !== 'All' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
              >
                Reset Filters
              </button>
            ) : (
              <button
                id="empty-state-add-btn"
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Reminder</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMedicines.map((med) => {
            const status = medicineStatusMap.get(med.id) || 'Upcoming';
            const primaryTime = med.times[0] || '08:00';

            return (
              <div
                key={med.id}
                id={`medicine-card-${med.id}`}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-xs transition-all duration-200 hover:shadow-md flex flex-col justify-between ${getCardBorderColor(
                  med.colorTag
                )}`}
              >
                {/* Top: Name, Dose, Status */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                        <Pill className="w-5 h-5 -rotate-45" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                          {med.name}
                        </h3>
                        <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                          {med.dosage} {med.unit}
                        </span>
                      </div>
                    </div>
                    <div>{getStatusBadge(status)}</div>
                  </div>

                  {/* Frequency & Time Badges */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{med.times.map(formatTime12h).join(', ')}</span>
                    </div>

                    <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                      {med.frequency}
                    </span>
                  </div>

                  {/* Start & End Date */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {med.startDate ? formatDisplayDate(med.startDate) : 'Ongoing'}
                      {med.endDate ? ` → ${formatDisplayDate(med.endDate)}` : ' (Ongoing)'}
                    </span>
                  </div>

                  {/* Notes if available */}
                  {med.notes && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <p className="line-clamp-2 italic">{med.notes}</p>
                    </div>
                  )}
                </div>

                {/* Bottom Actions: Mark Taken, Edit, Delete */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    id={`card-mark-taken-${med.id}`}
                    onClick={() => onMarkAsTaken(med, primaryTime)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:hover:bg-teal-900 dark:text-teal-200 border border-teal-200/80 dark:border-teal-800/80 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Mark as Taken</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      id={`card-edit-${med.id}`}
                      onClick={() => onEditMedicine(med)}
                      className="p-2 rounded-xl text-slate-500 hover:text-teal-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Reminder"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      id={`card-delete-${med.id}`}
                      onClick={() => setDeleteConfirmId(med.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      title="Delete Reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation Overlay */}
                {deleteConfirmId === med.id && (
                  <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 rounded-2xl p-4 flex flex-col justify-center items-center text-center backdrop-blur-xs z-10 animate-fadeIn">
                    <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Delete this reminder?
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                      This will remove scheduled reminders for {med.name}.
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          onDeleteMedicine(med.id);
                          setDeleteConfirmId(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
                      >
                        Yes, Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
