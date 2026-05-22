import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, BarChart3, Clock, HelpCircle, Sun, Moon, Sparkles, BatteryCharging, Signal, Wifi } from 'lucide-react';

interface MobileShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  title: string;
}

export default function MobileShell({ children, activeTab, setActiveTab, title }: MobileShellProps) {
  const [currentTime, setCurrentTime] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to gorgeous futuristic dark theme

  useEffect(() => {
    // Keep internal local time accurate
    const updateTime = () => {
      const date = new Date();
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 12 hour format
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // Sync style classes on body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const tabs = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'compare', label: 'Compare', icon: BarChart3 },
    { id: 'reports', label: 'History', icon: Clock },
    { id: 'methodology', label: 'Guide', icon: HelpCircle },
  ];

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 py-6 px-4 ${isDarkMode ? 'bg-radial from-slate-900 via-zinc-950 to-black text-gray-100' : 'bg-radial from-slate-50 via-gray-100 to-zinc-200 text-slate-900'}`}>
      
      {/* Background Decorative Ambient Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container mimicking a premium responsive physical device/tablet frame */}
      <div className="relative w-full max-w-md h-[860px] flex flex-col rounded-[48px] overflow-hidden border transition-all duration-300 shadow-2xl backdrop-blur-xl border-zinc-200/50 bg-white/75 dark:border-white/10 dark:bg-black/40">
        
        {/* Device Bezel Camera Notch Mock (Desktop only) */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-zinc-900 rounded-b-2.5xl z-50 flex items-center justify-center pointer-events-none">
          <div className="w-3 h-3 bg-zinc-800 rounded-full border border-zinc-700 mr-2" />
          <div className="w-16 h-1 bg-zinc-800 rounded-full" />
        </div>

        {/* Dynamic Mobile Status Bar */}
        <div className="h-10 px-8 flex items-center justify-between text-xs font-semibold z-40 select-none bg-transparent pt-3">
          <span className="text-slate-600 dark:text-zinc-400 font-mono">{currentTime}</span>
          <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
            <Signal size={12} />
            <Wifi size={12} />
            <BatteryCharging size={13} className="text-emerald-500" />
          </div>
        </div>

        {/* Fluid Glass App Header */}
        <header className="px-6 py-4 flex items-center justify-between border-b bg-white/30 dark:bg-black/10 border-zinc-200/40 dark:border-white/5 z-40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 shadow-sm">
              <Sparkles size={16} />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-800 dark:text-white uppercase leading-none">
                TrueTCO
              </h1>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Cost Analyzer</span>
            </div>
          </div>
          
          {/* Theme Switcher Button */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full border bg-white/40 dark:bg-zinc-950/40 border-zinc-200/50 dark:border-white/10 text-slate-700 dark:text-zinc-300 hover:scale-105 active:scale-95 transition-all shadow-sm"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
          </button>
        </header>

        {/* Scrollable Viewport Content */}
        <main className="flex-1 overflow-y-auto px-5 py-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 pb-24 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Responsive Glassmorphic Bottom Navigation Drawer */}
        <nav className="absolute bottom-5 left-5 right-5 h-16 rounded-3xl border shadow-xl flex items-center justify-around px-2 backdrop-blur-2xl z-40 bg-white/80 border-zinc-200/60 dark:bg-zinc-950/80 dark:border-white/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all duration-300"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-xl border border-emerald-500/20"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                <Icon 
                  size={18} 
                  className={`transition-colors duration-300 ${isActive ? 'text-emerald-500 scale-110 font-bold' : 'text-slate-500 dark:text-zinc-400'}`} 
                />
                <span className={`text-[9px] mt-1 font-semibold tracking-wider transition-colors duration-300 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-zinc-400'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

      </div>
    </div>
  );
}
