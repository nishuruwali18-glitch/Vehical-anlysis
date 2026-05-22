import React from 'react';
import { 
  BookOpen, Sparkles, Scale, Percent, Zap, ShieldAlert, BadgeInfo 
} from 'lucide-react';

export default function GuideView() {
  return (
    <div className="flex flex-col gap-5 h-full">
      <div>
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Core Engine Mechanics</span>
        <h2 className="text-base font-extrabold text-slate-800 dark:text-white">Assumptions & Math Guide</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 max-h-[640px] pr-0.5 text-xs text-slate-700 dark:text-zinc-300">
        
        {/* Dynamic Depreciation Schedule CARD */}
        <div className="p-4 rounded-2.5xl border border-zinc-200/50 bg-white/40 dark:border-white/5 dark:bg-zinc-950/20 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-500">
            <Percent size={14} />
            <span className="font-bold uppercase tracking-wider text-[10px]">Depreciation Calculus</span>
          </div>
          <p className="leading-relaxed">
            Every vehicle brand depreciates uniquely across the Indian second-hand market. Our analyzer implements:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-1 font-medium pl-1 text-zinc-650 dark:text-zinc-400">
            <li><strong>New Vehicles:</strong> 18% dropped instantly in Year 1, 10% annually compiled until Year 5, then 7% annually thereafter.</li>
            <li><strong>Used Vehicles:</strong> 6-8% yearly depreciation starting immediately.</li>
            <li><strong>Modifiers:</strong> Toyota & Maruti models retain value up to 2.5% better. Luxury vehicles (BMW, Mercedes) and discontinued models lose value up to 4.5% faster due to parts scarcity.</li>
          </ul>
        </div>

        {/* Hidden Operational Expenses Scheduling CAR */}
        <div className="p-4 rounded-2.5xl border border-zinc-200/50 bg-white/40 dark:border-white/5 dark:bg-zinc-950/20 space-y-2">
          <div className="flex items-center gap-1.5 text-cyan-500">
            <Scale size={14} />
            <span className="font-bold uppercase tracking-wider text-[10px]">Unveiling Hidden Costs</span>
          </div>
          <p className="leading-relaxed">
            True TCO represents more than just fuel and EMIs. Our calculation engine triggers realistic wear schedules based on accumulated mileage:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-1 font-medium pl-1 text-zinc-650 dark:text-zinc-400">
            <li><strong>Tire replacement:</strong> Evaluated every 40,000 KM. (₹4,000/set for 2W up to ₹45,000/set for Premium cars).</li>
            <li><strong>Brake overhaul:</strong> Evaluated every 25,000 KM.</li>
            <li><strong>12V Auxiliary Batteries:</strong> Automatically replaced every 4 years.</li>
            <li><strong>Pollution Certificates (PUC):</strong> Factored into maintenance quarterly/half-yearly (₹400/yr for ICE cars).</li>
          </ul>
        </div>

        {/* EV Lithium Chemistry Section Card */}
        <div className="p-4 rounded-2.5xl border border-zinc-200/50 bg-white/40 dark:border-white/5 dark:bg-zinc-950/20 space-y-2">
          <div className="flex items-center gap-1.5 text-amber-500">
            <Zap size={14} />
            <span className="font-bold uppercase tracking-wider text-[10px]">EV Battery Degradation Rules</span>
          </div>
          <p className="leading-relaxed">
            In electric vehicles, battery packs degrade based on time and charging cycles. 
          </p>
          <p className="leading-relaxed text-zinc-650 dark:text-zinc-400">
            If an EV exceeds <strong>8 years</strong> of age or <strong>1,40,000 KM</strong> of cumulative travel:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-1 font-medium pl-1 text-zinc-650 dark:text-zinc-400">
            <li>Efficiency is reduced by up to 25% (older lithium batteries demand more charging current to cover the same distance).</li>
            <li>Our engine introduces a <strong>15% annual probabilistic risk premium</strong> mapping the event of a total traction battery module failure (estimated at ₹15,000 per kWh battery capacity).</li>
          </ul>
        </div>

        {/* Financial Loan Amortization math */}
        <div className="p-4 rounded-2.5xl border border-zinc-200/50 bg-white/40 dark:border-white/5 dark:bg-zinc-950/20 space-y-2">
          <div className="flex items-center gap-1.5 text-purple-500">
            <BookOpen size={14} />
            <span className="font-bold uppercase tracking-wider text-[10px]">Loan Compounding</span>
          </div>
          <p className="leading-relaxed">
            Monthly EMI payments use the exact standard banking formula:
          </p>
          <div className="p-2 bg-slate-100 dark:bg-black/30 rounded-xl font-mono text-center text-emerald-500 font-bold my-1">
            EMI = [P x r x (1+r)ⁿ] / [(1+r)ⁿ - 1]
          </div>
          <p className="leading-relaxed text-zinc-650 dark:text-zinc-400 text-[10px]">
            Where <strong>P</strong> represents the net loan balance (on-road minus downpayment), <strong>r</strong> is the monthly interest rate, and <strong>n</strong> is the amortization duration in months. Total cashoutflows accurately count downpayments plus cumulative interests paid.
          </p>
        </div>

        {/* Diesel Rules */}
        <div className="p-4 rounded-2.5xl border border-zinc-200/50 bg-white/40 dark:border-white/5 dark:bg-zinc-950/20 space-y-2 text-rose-500 border-rose-500/20 bg-rose-500/5">
          <div className="flex items-center gap-1.5 text-rose-500">
            <ShieldAlert size={14} />
            <span className="font-bold uppercase tracking-wider text-[10px]">Legal/NCR Regulatory Warning</span>
          </div>
          <p className="leading-relaxed">
            In metropolitan areas like Delhi-NCR, National Green Tribunal ordinances restrict diesel engine lifespans to strictly <strong>10 years</strong> and petrol to <strong>15 years</strong>. Buying a pre-owned diesel car older than 6 years represents severe regulatory hazard as ownership transfer/fitness permits cannot be renewed.
          </p>
        </div>

      </div>
    </div>
  );
}
