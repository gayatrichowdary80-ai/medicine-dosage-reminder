import React, { useState, useEffect } from 'react';
import { 
  X, 
  Pill, 
  Clock, 
  Calendar, 
  FileText, 
  Plus, 
  Trash2, 
  AlertTriangle,
  Check
} from 'lucide-react';
import { MedicineReminder, MedicineUnit, FrequencyType } from '../types';
import { getTodayDateString } from '../utils/storage';

interface MedicineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medicine: Omit<MedicineReminder, 'id' | 'createdAt'>, editingId?: string) => void;
  editingMedicine?: MedicineReminder | null;
}

const COMMON_MEDICINES = [
  'Paracetamol',
  'Amoxicillin',
  'Metformin',
  'Lisinopril',
  'Omeprazole',
  'Atorvastatin',
  'Cetirizine',
  'Vitamin D3',
  'Ibuprofen',
  'Azithromycin',
];

const UNIT_OPTIONS: MedicineUnit[] = ['mg', 'ml', 'tablet', 'capsule', 'drops'];
const FREQUENCY_OPTIONS: FrequencyType[] = ['Once daily', 'Twice daily', 'Three times daily', 'Custom'];
const COLOR_TAGS = [
  { name: 'emerald', bg: 'bg-emerald-500', border: 'border-emerald-600' },
  { name: 'sky', bg: 'bg-sky-500', border: 'border-sky-600' },
  { name: 'purple', bg: 'bg-purple-500', border: 'border-purple-600' },
  { name: 'amber', bg: 'bg-amber-500', border: 'border-amber-600' },
  { name: 'rose', bg: 'bg-rose-500', border: 'border-rose-600' },
];

export const MedicineFormModal: React.FC<MedicineFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMedicine,
}) => {
  const today = getTodayDateString();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [unit, setUnit] = useState<MedicineUnit>('mg');
  const [frequency, setFrequency] = useState<FrequencyType>('Once daily');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [colorTag, setColorTag] = useState('emerald');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editingMedicine) {
      setName(editingMedicine.name);
      setDosage(editingMedicine.dosage.toString());
      setUnit(editingMedicine.unit);
      setFrequency(editingMedicine.frequency);
      setTimes(editingMedicine.times.length > 0 ? [...editingMedicine.times] : ['08:00']);
      setStartDate(editingMedicine.startDate || today);
      setEndDate(editingMedicine.endDate || '');
      setNotes(editingMedicine.notes || '');
      setColorTag(editingMedicine.colorTag || 'emerald');
    } else {
      setName('');
      setDosage('');
      setUnit('mg');
      setFrequency('Once daily');
      setTimes(['08:00']);
      setStartDate(today);
      // Default end date 7 days later
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 14);
      setEndDate(nextWeek.toISOString().split('T')[0]);
      setNotes('');
      setColorTag('emerald');
    }
    setErrors({});
  }, [editingMedicine, isOpen, today]);

  // Handle frequency changes and set smart default reminder times
  const handleFrequencyChange = (newFreq: FrequencyType) => {
    setFrequency(newFreq);
    if (newFreq === 'Once daily') {
      setTimes(['08:00']);
    } else if (newFreq === 'Twice daily') {
      setTimes(['08:00', '20:00']);
    } else if (newFreq === 'Three times daily') {
      setTimes(['08:00', '14:00', '20:00']);
    } else if (newFreq === 'Custom') {
      if (times.length === 0) setTimes(['08:00']);
    }
  };

  const handleTimeChange = (index: number, newTime: string) => {
    const updated = [...times];
    updated[index] = newTime;
    setTimes(updated);
  };

  const handleAddCustomTime = () => {
    if (times.length >= 6) return;
    setTimes([...times, '12:00']);
  };

  const handleRemoveCustomTime = (index: number) => {
    if (times.length <= 1) return;
    setTimes(times.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Medicine name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Please enter at least 2 characters';
    }

    const doseNum = parseFloat(dosage);
    if (!dosage || isNaN(doseNum) || doseNum <= 0) {
      newErrors.dosage = 'Enter a valid positive dosage number (e.g. 500)';
    }

    if (times.some((t) => !t)) {
      newErrors.times = 'Please select valid reminder times';
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (startDate && endDate && endDate < startDate) {
      newErrors.endDate = 'End date cannot be earlier than start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave(
      {
        name: name.trim(),
        dosage: parseFloat(dosage),
        unit,
        frequency,
        times: times.sort(),
        startDate,
        endDate: endDate || '',
        notes: notes.trim(),
        colorTag,
      },
      editingMedicine ? editingMedicine.id : undefined
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="medicine-modal-card"
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all my-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Pill className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading">
                {editingMedicine ? 'Edit Medicine Reminder' : 'Add New Medicine Reminder'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure accurate doses and scheduled daily alerts
              </p>
            </div>
          </div>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Medicine Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Medicine Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="medicine-name-input"
              type="text"
              placeholder="e.g. Paracetamol, Amoxicillin, Metformin"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 dark:text-white transition-colors focus:outline-hidden focus:ring-2 ${
                errors.name
                  ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/20'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {errors.name}
              </p>
            )}

            {/* Quick-pick suggestions */}
            {!editingMedicine && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase font-semibold text-slate-400 mr-1">
                  Suggestions:
                </span>
                {COMMON_MEDICINES.slice(0, 5).map((med) => (
                  <button
                    key={med}
                    type="button"
                    onClick={() => setName(med)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/60 dark:hover:text-teal-300 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                  >
                    + {med}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dosage and Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Dosage Amount <span className="text-rose-500">*</span>
              </label>
              <input
                id="medicine-dosage-input"
                type="number"
                step="any"
                min="0.1"
                placeholder="e.g. 500"
                value={dosage}
                onChange={(e) => {
                  setDosage(e.target.value);
                  if (errors.dosage) setErrors({ ...errors, dosage: '' });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 dark:text-white transition-colors focus:outline-hidden focus:ring-2 ${
                  errors.dosage
                    ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/20'
                }`}
              />
              {errors.dosage && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {errors.dosage}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Unit <span className="text-rose-500">*</span>
              </label>
              <select
                id="medicine-unit-select"
                value={unit}
                onChange={(e) => setUnit(e.target.value as MedicineUnit)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Frequency & Reminder Times */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Frequency <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FREQUENCY_OPTIONS.map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => handleFrequencyChange(freq)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                      frequency === freq
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            {/* Reminder Times */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>Reminder Time(s)</span>
                </label>
                {frequency === 'Custom' && times.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddCustomTime}
                    className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Time
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {times.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={t}
                      onChange={(e) => handleTimeChange(idx, e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                    {frequency === 'Custom' && times.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomTime(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {errors.times && (
                <p className="mt-1 text-xs text-rose-500">{errors.times}</p>
              )}
            </div>
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>Start Date</span> <span className="text-rose-500">*</span>
              </label>
              <input
                id="start-date-input"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (errors.startDate) setErrors({ ...errors, startDate: '' });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
              {errors.startDate && (
                <p className="mt-1 text-xs text-rose-500">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>End Date (Optional)</span>
              </label>
              <input
                id="end-date-input"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (errors.endDate) setErrors({ ...errors, endDate: '' });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
              {errors.endDate && (
                <p className="mt-1 text-xs text-rose-500">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Color Tag & Notes */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Color Marker Tag
              </label>
              <div className="flex items-center gap-3">
                {COLOR_TAGS.map((tag) => (
                  <button
                    key={tag.name}
                    type="button"
                    onClick={() => setColorTag(tag.name)}
                    className={`w-7 h-7 rounded-full ${tag.bg} flex items-center justify-center transition-transform ${
                      colorTag === tag.name
                        ? 'ring-3 ring-offset-2 ring-teal-500 scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {colorTag === tag.name && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-teal-600" />
                <span>Optional Instructions / Notes</span>
              </label>
              <textarea
                id="medicine-notes-input"
                rows={2}
                placeholder="e.g. Take after breakfast with water, avoid citrus juices"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 resize-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-reminder-btn"
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-md shadow-teal-600/20 transition-all active:scale-95"
            >
              {editingMedicine ? 'Update Reminder' : 'Save Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
