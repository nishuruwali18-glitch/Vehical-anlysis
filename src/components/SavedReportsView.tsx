import React from 'react';
import { motion } from 'motion/react';
import { Trash2, FileText, ChevronRight, AlertCircle, Sparkles, Calendar, TrendingUp } from 'lucide-react';
import { CalculatedReport } from '../types';

interface SavedReportsViewProps {
  reports: CalculatedReport[];
  onSelectReport: (report: CalculatedReport) => void;
  onDeleteReport: (id: string) => void;
  onClearAll: () => void;
}

export default function SavedReportsView({
  reports,
  onSelectReport,
  onDeleteReport,
  onClearAll,
}: SavedReportsViewProps) {

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4">
        <div className="p-4 rounded-full bg-slate-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/5 text-zinc-400 dark:text-zinc-500 mb-4 animate-pulse">
          <FileText size={32} />
        </div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">No Evaluation History Yet</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs leading-relaxed">
          When you finish comparing vehicles on the main tab, save your report using the floppy icon to persist them in your local journal.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between pb-1">
        <div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Stored Evaluations</span>
          <h2 className="text-base font-extrabold text-slate-800 dark:text-white">Local Report Logs</h2>
        </div>
        
        <button
          onClick={onClearAll}
          className="text-[10px] font-bold text-rose-500 hover:text-rose-600 border border-rose-500/20 hover:border-rose-500/45 px-2.5 py-1 rounded-xl transition-all"
        >
          Clear Logs
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 max-h-[580px] pr-0.5">
        {reports.map((report) => {
          const { scenario, newOutputs, usedOutputs, verdicts } = report;
          const { newVehicle, usedVehicle, ownershipDuration, usedVehicleAge } = scenario;
          
          return (
            <motion.div
              key={report.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => onSelectReport(report)}
              className="p-3.5 rounded-2.5xl border bg-white/40 border-zinc-200 dark:bg-zinc-950/20 dark:border-white/5 hover:border-emerald-500/20 cursor-pointer flex items-center justify-between gap-3 relative overflow-hidden transition-all shadow-sm group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[8px] font-bold bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded uppercase">
                    {newVehicle.type}
                  </span>
                  <span className="text-[9px] font-medium text-zinc-500 dark:text-zinc-400">
                    {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h3 className="font-extrabold text-xs text-slate-800 dark:text-white mt-1 group-hover:text-emerald-500 transition-colors">
                  {newVehicle.brand} {newVehicle.model} vs Used ({usedVehicleAge}y)
                </h3>

                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                  <span className="font-mono">TCO: <strong>{formatPrice(newOutputs.totalTCO)}</strong> (New)</span>
                  <span>•</span>
                  <span className="font-mono">TCO: <strong>{formatPrice(usedOutputs.totalTCO)}</strong> (Used)</span>
                </div>

                <div className="flex items-center gap-1.5 mt-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <p className="text-[9.5px] font-medium text-slate-700 dark:text-zinc-300 line-clamp-1 italic">
                    {verdicts.financialRecommendation === 'NEW' ? '✓ New asset recommended financially.' : '✓ Used asset recommended financially.'}
                  </p>
                </div>
              </div>

              {/* Delete individual log button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteReport(report.id);
                }}
                className="p-2 text-slate-400 dark:text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all"
                title="Delete Log entry"
              >
                <Trash2 size={13} />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
