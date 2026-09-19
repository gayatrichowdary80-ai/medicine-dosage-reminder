import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Download, 
  Calendar, 
  Clock, 
  FileText,
  AlertTriangle,
  X
} from 'lucide-react';
import { HistoryItem } from '../types';
import { formatDisplayDate, formatTime12h } from '../utils/storage';

interface HistoryViewProps {
  history: HistoryItem[];
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
}) => {
  const [filterStatus, setFilterStatus] = useState<'All' | 'Taken' | 'Missed'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);

  // Filter history items
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch =
        item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.dosage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterStatus === 'All') return true;
      return item.status === filterStatus;
    });
  }, [history, searchTerm, filterStatus]);

  // Statistics
  const totalTaken = history.filter((h) => h.status === 'Taken').length;
  const totalMissed = history.filter((h) => h.status === 'Missed').length;
  const totalLogs = history.length;
  const overallAdherence = totalLogs > 0 ? Math.round((totalTaken / totalLogs) * 100) : 100;

  // Export CSV
  const handleExportCSV = () => {
    if (history.length === 0) return;

    const headers = ['Date', 'Scheduled Time', 'Medicine Name', 'Dosage', 'Status', 'Logged At', 'Notes'];
    const rows = history.map((h) => [
      `"${h.date}"`,
      `"${h.scheduledTime}"`,
      `"${h.medicineName}"`,
      `"${h.dosage}"`,
      `"${h.status}"`,
      `"${h.timestamp}"`,
      `"${h.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `medicare_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Medication Adherence History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete audit trail of taken and missed medication doses.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {history.length > 0 && (
            <>
              <button
                id="export-csv-btn"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="Download CSV report"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                id="clear-history-btn"
                onClick={() => setShowClearModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Logged Doses
          </span>
          <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white font-heading">
            {totalLogs}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-emerald-200/70 dark:border-emerald-900/50 p-4 shadow-xs">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Taken On Schedule
          </span>
          <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-heading">
            {totalTaken}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              ({overallAdherence}% adherence)
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-rose-200/70 dark:border-rose-900/50 p-4 shadow-xs">
          <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Missed / Delayed
          </span>
          <div className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400 font-heading">
            {totalMissed}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              incident{totalMissed !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search history by medicine or note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
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

        {/* Filter Buttons */}
        <div className="flex items-center gap-1">
          {(['All', 'Taken', 'Missed'] as const).map((status) => {
            const isSelected = filterStatus === status;
            return (
              <button
                key={status}
                id={`history-filter-${status.toLowerCase()}`}
                onClick={() => setFilterStatus(status)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* History Items List / Table */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-3">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {searchTerm || filterStatus !== 'All'
              ? 'No Matching History Records'
              : 'No Medication History Logged Yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            As you mark doses as "Taken" or when scheduled windows elapse, your daily adherence logs will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredHistory.map((item) => {
              const isTaken = item.status === 'Taken';

              return (
                <div
                  key={item.id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isTaken
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                      }`}
                    >
                      {isTaken ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                          {item.medicineName}
                        </h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                          {item.dosage}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDisplayDate(item.date)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Scheduled: {formatTime12h(item.scheduledTime)}
                        </span>
                        {item.notes && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-600 dark:text-slate-300 max-w-xs truncate">
                              "{item.notes}"
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge & Timestamp */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        isTaken
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {isTaken ? 'Taken' : 'Missed'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Logged {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 shadow-2xl text-center animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Clear Medication History?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              This will erase all recorded logs of taken and missed medication doses. This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                id="confirm-clear-history-btn"
                onClick={() => {
                  onClearHistory();
                  setShowClearModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
