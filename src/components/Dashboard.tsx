import React from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Calculator, 
  ChevronRight, 
  ShieldAlert, 
  Pill,
  Sparkles,
  Check
} from 'lucide-react';
import { MedicineReminder, HistoryItem, ActiveTab } from '../types';
import { formatTime12h, getTodayDateString } from '../utils/storage';

interface DashboardProps {
  medicines: MedicineReminder[];
  history: HistoryItem[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onMarkAsTaken: (medicine: MedicineReminder, scheduledTime: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  medicines,
  history,
  setActiveTab,
  onOpenAddModal,
  onMarkAsTaken,
}) => {
  const todayStr = getTodayDateString();
  const todayDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate medicines scheduled today
  const todaysSchedules: {
    medicine: MedicineReminder;
    time: string;
    isTaken: boolean;
    isMissed: boolean;
  }[] = [];

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  medicines.forEach((med) => {
    // Check if within active date range
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

        const [hStr, mStr] = t.split(':');
        const schedMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);
        const isMissed = !isTaken && currentMinutes > schedMinutes + 45;

        todaysSchedules.push({
          medicine: med,
          time: t,
          isTaken,
          isMissed,
        });
      });
    }
  });

  // Sort today's schedules by time
  todaysSchedules.sort((a, b) => a.time.localeCompare(b.time));

  const totalScheduledToday = todaysSchedules.length;
  const takenToday = todaysSchedules.filter((s) => s.isTaken).length;
  const missedToday = todaysSchedules.filter((s) => s.isMissed).length;
  const pendingToday = totalScheduledToday - takenToday;

  // Next upcoming medicine reminder
  const upcomingToday = todaysSchedules.find((s) => !s.isTaken && !s.isMissed);
  const nextMedicine = upcomingToday || todaysSchedules.find((s) => !s.isTaken);

  const adherenceRate =
    totalScheduledToday > 0
      ? Math.round((takenToday / totalScheduledToday) * 100)
      : 100;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-teal-950/10">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-600/50 border border-teal-400/30 text-xs font-semibold text-teal-100 mb-3 tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Healthcare Adherence Suite</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading">
            MediCare Reminder
          </h1>
          <p className="mt-2 text-base sm:text-lg text-teal-100/90 font-medium">
            Smart reminders for safer medication routines.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-teal-200">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
              <Calendar className="w-4 h-4 text-teal-300" />
              <span>{todayDateFormatted}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
              <Clock className="w-4 h-4 text-teal-300" />
              <span>
                {pendingToday === 0
                  ? 'All doses taken today!'
                  : `${pendingToday} dose${pendingToday > 1 ? 's' : ''} remaining today`}
              </span>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              id="dashboard-btn-add-medicine"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-teal-900 hover:bg-teal-50 font-semibold text-sm shadow-md transition-all duration-150 active:scale-95"
            >
              <Plus className="w-4 h-4 text-teal-700" />
              <span>Add Medicine</span>
            </button>
            <button
              id="dashboard-btn-calculator"
              onClick={() => setActiveTab('calculator')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600/70 hover:bg-teal-600 text-white font-semibold text-sm border border-teal-400/30 transition-all duration-150 active:scale-95"
            >
              <Calculator className="w-4 h-4" />
              <span>Dosage Calculator</span>
            </button>
            <button
              id="dashboard-btn-view-reminders"
              onClick={() => setActiveTab('medicines')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all duration-150"
            >
              <span>View Reminders</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Metric 1: Scheduled Today */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Scheduled Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
              {totalScheduledToday}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              doses total
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {medicines.length} active registered prescription{medicines.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Metric 2: Next Upcoming Medicine */}
        <div className="bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-900/60 rounded-xl p-5 shadow-xs bg-gradient-to-br from-white to-teal-50/40 dark:from-slate-900 dark:to-teal-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
              Next Upcoming
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {nextMedicine ? (
              <>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                  {nextMedicine.medicine.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 text-xs font-bold">
                    {formatTime12h(nextMedicine.time)}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {nextMedicine.medicine.dosage} {nextMedicine.medicine.unit}
                  </span>
                </div>
              </>
            ) : (
              <div className="py-1">
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> All completed
                </span>
                <p className="text-xs text-slate-500 mt-0.5">No more doses for today</p>
              </div>
            )}
          </div>
          {nextMedicine && !nextMedicine.isTaken && (
            <button
              onClick={() => onMarkAsTaken(nextMedicine.medicine, nextMedicine.time)}
              className="mt-3 text-xs font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200 flex items-center gap-1 underline underline-offset-2"
            >
              Mark as Taken now
            </button>
          )}
        </div>

        {/* Metric 3: Today's Completed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Taken Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-heading">
              {takenToday}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              of {totalScheduledToday} logged
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${adherenceRate}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Adherence / Missed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Daily Adherence
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              missedToday > 0 
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' 
                : 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400'
            }`}>
              {missedToday > 0 ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
              {adherenceRate}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {missedToday > 0 ? `${missedToday} missed` : 'On track'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {missedToday > 0 ? 'Action required for delayed dose' : 'Great adherence record today!'}
          </p>
        </div>

      </div>

      {/* Today's Medication Schedule Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-600" />
              <span>Today's Medication Schedule</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live chronological schedule for {todayDateFormatted}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('medicines')}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Manage All Prescriptions</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todaysSchedules.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              No Medicines Scheduled for Today
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              Add your current medications or adjust your start/end dates to set up daily routines.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Medicine
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 mt-2">
            {todaysSchedules.map((schedule, idx) => {
              const { medicine, time, isTaken, isMissed } = schedule;

              return (
                <div
                  key={`${medicine.id}-${time}-${idx}`}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                        isTaken
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : isMissed
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300'
                      }`}
                    >
                      {isTaken ? (
                        <Check className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                          {medicine.name}
                        </h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {medicine.dosage} {medicine.unit}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {formatTime12h(time)}
                        </span>
                        <span>•</span>
                        <span>{medicine.frequency}</span>
                        {medicine.notes && (
                          <>
                            <span>•</span>
                            <span className="italic truncate max-w-xs text-slate-600 dark:text-slate-400">
                              "{medicine.notes}"
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status & Action */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isTaken ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Taken
                      </span>
                    ) : isMissed ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          <AlertCircle className="w-3.5 h-3.5" /> Missed
                        </span>
                        <button
                          id={`dash-mark-taken-${medicine.id}-${time}`}
                          onClick={() => onMarkAsTaken(medicine, time)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 shadow-2xs"
                        >
                          Mark Taken
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                          Upcoming
                        </span>
                        <button
                          id={`dash-mark-taken-${medicine.id}-${time}`}
                          onClick={() => onMarkAsTaken(medicine, time)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-2xs"
                        >
                          Mark as Taken
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clinical Disclaimer & Educational Banner */}
      <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 p-4 sm:p-5 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
          <span className="font-bold">Educational Safety Notice: </span>
          MediCare Reminder is an educational tracking and dosage calculation utility. It does not prescribe medication, diagnose illnesses, or replace licensed physician or pharmacist counsel. Always verify prescribed regimens and clinical dosages directly with your medical provider.
        </div>
      </div>
    </div>
  );
};
