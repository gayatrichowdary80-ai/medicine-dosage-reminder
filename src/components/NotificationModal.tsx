import React from 'react';
import { 
  Bell, 
  BellRing, 
  X, 
  CheckCircle2, 
  Volume2, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { playAdherenceChime, sendBrowserNotification } from '../utils/storage';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  permission: NotificationPermission;
  onRequestPermission: () => Promise<void>;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  permission,
  onRequestPermission,
}) => {
  if (!isOpen) return null;

  const isGranted = permission === 'granted';

  const handleTestAlert = () => {
    playAdherenceChime('success');
    sendBrowserNotification(
      'MediCare Reminder: Test Notification',
      'This is a sample alert demonstrating your medication schedule reminder.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3.5 ${
              isGranted
                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
                : 'bg-teal-100 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400'
            }`}
          >
            {isGranted ? <BellRing className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
          </div>

          <h3 className="font-bold text-lg text-slate-900 dark:text-white font-heading">
            {isGranted ? 'Reminders & Notifications Active' : 'Enable Medication Reminders'}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            {isGranted
              ? 'Your browser has granted permission for notifications. MediCare Reminder will alert you at your scheduled times with desktop banners and audio chimes.'
              : 'Allow desktop notifications so MediCare Reminder can alert you right on time when it is time to take your doses, even when you are browsing other tabs.'}
          </p>

          <div className="mt-5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>100% private — running locally in your browser</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              <Volume2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>Synthesized chime for gentle auditory cues</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            {!isGranted ? (
              <button
                id="request-notification-btn"
                onClick={onRequestPermission}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Request Notification Permission
              </button>
            ) : (
              <button
                id="test-notification-btn"
                onClick={handleTestAlert}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                <span>Test Alert & Audio Chime</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
