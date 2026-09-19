import React, { useState } from 'react';
import { 
  Pill, 
  Home, 
  Calendar, 
  Calculator, 
  History, 
  Sun, 
  Moon, 
  Bell, 
  BellRing,
  Menu, 
  X, 
  Plus
} from 'lucide-react';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenAddModal: () => void;
  notificationPermission: NotificationPermission;
  onRequestNotification: () => void;
  todayPendingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  onOpenAddModal,
  notificationPermission,
  onRequestNotification,
  todayPendingCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'medicines', label: 'Medicines', icon: <Calendar className="w-4 h-4" /> },
    { id: 'calculator', label: 'Dosage Calculator', icon: <Calculator className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and Brand */}
          <div 
            id="brand-logo"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
              <Pill className="w-5 h-5 text-white transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white font-heading">
                  MediCare
                </span>
                <span className="font-semibold text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/70 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
                  Reminder
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Clinical Routines & Dosage Tools
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.id === 'medicines' && todayPendingCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
                      {todayPendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Actions / Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Add Button */}
            <button
              id="header-quick-add-btn"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-medium shadow-sm transition-all duration-150 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Reminder</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* Notification Permission Indicator */}
            <button
              id="notification-permission-btn"
              onClick={onRequestNotification}
              title={
                notificationPermission === 'granted'
                  ? 'Browser notifications active'
                  : 'Click to enable reminder alerts'
              }
              className={`p-2 rounded-lg text-xs font-medium border transition-all duration-150 flex items-center justify-center ${
                notificationPermission === 'granted'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:border-teal-400'
              }`}
            >
              {notificationPermission === 'granted' ? (
                <BellRing className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle Dark Mode"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              id="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 px-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'medicines' && todayPendingCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-xs font-bold">
                      {todayPendingCount} due
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
