import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, ShieldAlert, BarChart3, TrendingUp, Info, Activity, 
  HelpCircle, CheckCircle2, AlertTriangle, IndianRupee, Save, FileText, Share2, Compass
} from 'lucide-react';
import { CalculatedReport, CostEngineOutputs, ComparisonScenario } from '../types';
import { calculateBreakEven } from '../utils/calculator';

interface TcoDashboardProps {
  report: CalculatedReport;
  onSaveReport: () => void;
  onRestart: () => void;
}

export default function TcoDashboard({ report, onSaveReport, onRestart }: TcoDashboardProps) {
  const { scenario, newOutputs, usedOutputs, verdicts, createdAt } = report;
  const { newVehicle, usedVehicle, usedVehicleAge, ownershipDuration } = scenario;
  
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'detail'>('overview');

  // Compute break-even
  const breakEven = calculateBreakEven(scenario, newOutputs, usedOutputs);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  const handleSaveClick = () => {
    onSaveReport();
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handlePrintClick = () => {
    window.print();
  };

  // SVG Chart Dimensions & Computations
  const yearsArray = Array.from({ length: ownershipDuration }, (_, idx) => idx + 1);
  
  // 1. Chart: Depreciation Curve (Asset Value Trend)
  const maxVal = Math.max(newOutputs.purchasePrice, usedOutputs.purchasePrice);
  const getSvgPoints = (outputs: CostEngineOutputs) => {
    const points: string[] = [];
    // Start point (Year 0)
    points.push(`0,${180 - (outputs.purchasePrice / maxVal) * 150}`);
    
    outputs.yearlyBreakdown.forEach((y, i) => {
      const x = ((i + 1) / ownershipDuration) * 240;
      const yPos = 180 - (y.resaleValue / maxVal) * 150;
      points.push(`${Math.round(x)},${Math.round(yPos)}`);
    });
    return points.join(' ');
  };

  // 2. Chart: Yearly Maintenance & Repair Cost
  const maxMaint = Math.max(
    ...newOutputs.yearlyBreakdown.map(y => y.maintenanceCost + y.miscellaneousCost),
    ...usedOutputs.yearlyBreakdown.map(y => y.maintenanceCost + y.miscellaneousCost),
    1000 // Safeguard
  );
  
  const getMaintPoints = (outputs: CostEngineOutputs) => {
    const points: string[] = [];
    outputs.yearlyBreakdown.forEach((y, i) => {
      const x = (i / (ownershipDuration - 1 || 1)) * 240;
      const mCost = y.maintenanceCost + y.miscellaneousCost;
      const yPos = 180 - (mCost / maxMaint) * 150;
      points.push(`${Math.round(x)},${Math.round(yPos)}`);
    });
    return points.join(' ');
  };

  return (
    <div className="flex flex-col gap-5 print:p-0">
      
      {/* Dynamic Upper Cards Actions */}
      <div className="flex items-center justify-between border-b pb-3 border-zinc-200/40 dark:border-white/5 z-10 print:hidden">
        <div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Comparative Outcome</span>
          <h2 className="text-base font-extrabold text-slate-800 dark:text-white">Ownership Dashboard</h2>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSaveClick}
            className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
              showSaveSuccess 
                ? 'bg-emerald-500 text-white border-emerald-600' 
                : 'bg-white/40 border-zinc-200 dark:bg-zinc-950/20 dark:border-white/10 text-slate-700 dark:text-zinc-300 hover:scale-105'
            }`}
            title="Save Report"
          >
            <Save size={14} />
          </button>

          <button
            onClick={handlePrintClick}
            className="p-2.5 rounded-xl border bg-white/40 border-zinc-200 dark:bg-zinc-950/20 dark:border-white/10 text-slate-700 dark:text-zinc-300 hover:scale-105 transition-all"
            title="Export Report PDF / Print"
          >
            <FileText size={14} />
          </button>
        </div>
      </div>

      {showSaveSuccess && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-2 text-center text-[10px] font-bold text-white bg-emerald-500 rounded-xl"
        >
          ✓ Analysis saved to history logs successfully!
        </motion.div>
      )}

      {/* Main Highlights Comparison Panels */}
      <div className="grid grid-cols-2 gap-3.5">
        
        {/* New Vehicle Box */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 relative overflow-hidden flex flex-col justify-between">
          <div>
            <span className="text-[8px] font-extrabold text-emerald-500 uppercase tracking-widest">Option A (New)</span>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white mt-0.5 line-clamp-1">{newVehicle.brand} {newVehicle.model}</h3>
            
            <div className="mt-2.5 space-y-1">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-medium">Outlay: <strong>{formatPrice(newOutputs.purchasePrice)}</strong></span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-medium">Operating Ops/Yr: <strong>{formatPrice((newOutputs.totalFuelCost + newOutputs.totalMaintenanceCost)/ownershipDuration)}</strong></span>
            </div>
          </div>

          <div className="mt-4 border-t border-emerald-500/10 pt-2">
            <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 block">Total Est TCO:</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block leading-tight">{formatPrice(newOutputs.totalTCO)}</span>
            <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono">₹{newOutputs.costPerKm}/KM • {formatPrice(newOutputs.monthlyTCO)}/Mo</span>
          </div>
        </div>

        {/* Used Vehicle Box */}
        <div className="p-3.5 rounded-2xl bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/10 dark:border-cyan-500/20 relative overflow-hidden flex flex-col justify-between">
          <div>
            <span className="text-[8px] font-extrabold text-cyan-500 uppercase tracking-widest">Option B (Used, {usedVehicleAge} Yr)</span>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white mt-0.5 line-clamp-1">{usedVehicle.brand} {usedVehicle.model}</h3>
            
            <div className="mt-2.5 space-y-1">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-medium flex items-center gap-0.5">
                Outlay: <strong>{formatPrice(usedOutputs.purchasePrice)}</strong>
                <span className="text-[8px] text-zinc-500" title="Used market variance scale">±10%</span>
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-medium">Operating Ops/Yr: <strong>{formatPrice((usedOutputs.totalFuelCost + usedOutputs.totalMaintenanceCost)/ownershipDuration)}</strong></span>
            </div>
          </div>

          <div className="mt-4 border-t border-cyan-500/10 pt-2">
            <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 block">Total Est TCO:</span>
            <span className="text-sm font-black text-cyan-600 dark:text-cyan-400 block leading-tight">{formatPrice(usedOutputs.totalTCO)}</span>
            <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono">₹{usedOutputs.costPerKm}/KM • {formatPrice(usedOutputs.monthlyTCO)}/Mo</span>
          </div>
        </div>

      </div>

      {/* Nav Tabs overview, trends, detail */}
      <div className="flex border border-zinc-200/50 dark:border-white/5 rounded-xl overflow-hidden text-xs bg-slate-100/30 dark:bg-zinc-950/20 print:hidden mt-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-1.5 font-bold transition-all ${activeTab === 'overview' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-zinc-400'}`}
        >
          Verdicts
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`flex-1 py-1.5 font-bold transition-all ${activeTab === 'trends' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-zinc-400'}`}
        >
          Charts
        </button>
        <button
          onClick={() => setActiveTab('detail')}
          className={`flex-1 py-1.5 font-bold transition-all ${activeTab === 'detail' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-zinc-400'}`}
        >
          Amortization Matrix
        </button>
      </div>

      {/* OVERVIEW VERDICTS PANEL */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          
          {/* Main Financial Recommendation Card */}
          <div className="p-4 rounded-2.5xl border border-zinc-200/50 bg-white/40 dark:border-white/5 dark:bg-zinc-950/10 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 shrink-0">
                <Sparkles size={14} />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Financial Verdict Recommendation</h4>
            </div>
            
            <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 leading-relaxed">
              {verdicts.financialVerdict}
            </p>
            
            <div className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-zinc-950/40 border border-zinc-200/30 dark:border-white/5 text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-405">
              <strong>Assessment Synthesis:</strong> {verdicts.overallVerdict}
            </div>
          </div>

          {/* Risk Dashboard Grid */}
          <div className="grid grid-cols-3 gap-2">
            
            {/* Confidence Gauge */}
            <div className="p-2.5 rounded-xl bg-slate-100/40 dark:bg-zinc-950/20 border border-zinc-200/30 dark:border-white/5 text-center flex flex-col justify-between">
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-tight block">Confidence</span>
              <span className={`text-base font-black ${verdicts.usedConfidenceScore >= 75 ? 'text-emerald-500' : verdicts.usedConfidenceScore >= 50 ? 'text-amber-500' : 'text-rose-500'} block mt-1.5`}>
                {verdicts.usedConfidenceScore}%
              </span>
              <span className="text-[7px] text-zinc-500 leading-tight block mt-1">Pre-owned Risk</span>
            </div>

            {/* Reliability Rating */}
            <div className="p-2.5 rounded-xl bg-slate-100/40 dark:bg-zinc-950/20 border border-zinc-200/30 dark:border-white/5 text-center flex flex-col justify-between">
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-tight block">Reliability</span>
              <span className="text-base font-black text-amber-500 block mt-1.5">
                ★ {usedVehicle.reliabilityScore}/10
              </span>
              <span className="text-[7px] text-zinc-500 leading-tight block mt-1">Used Rating</span>
            </div>

            {/* Maintenance Score */}
            <div className="p-2.5 rounded-xl bg-slate-100/40 dark:bg-zinc-950/20 border border-zinc-200/30 dark:border-white/5 text-center flex flex-col justify-between">
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-tight block">Maint. Risk</span>
              <span className={`text-base font-black ${usedVehicle.maintenanceRiskScore <= 3 ? 'text-emerald-500' : usedVehicle.maintenanceRiskScore <= 6 ? 'text-amber-500' : 'text-rose-500'} block mt-1.5`}>
                {usedVehicle.maintenanceRiskScore}/10
              </span>
              <span className="text-[7px] text-zinc-500 leading-tight block mt-1">Potential Swaps</span>
            </div>

          </div>

          {/* Physical Kilometer Wear & Value Reconciliation Diagnostics */}
          {usedOutputs.kmDepreciationDetails && (
            <div className="p-4 rounded-2.5xl border border-zinc-200/50 bg-white/40 dark:border-white/5 dark:bg-zinc-950/10 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider">
                  <Activity size={14} className="text-cyan-500" />
                  <span>Physical Wear Diagnostics</span>
                </div>
                <span className="text-[9px] font-mono text-zinc-500">
                  Odometer: {usedOutputs.kmDepreciationDetails.actualKm.toLocaleString('en-IN')} KM
                </span>
              </div>

              {/* Progress bars Grid */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* Engine Wear (or EV degradation title if fuel is EV) */}
                <div className="p-2.5 rounded-xl bg-slate-100/40 dark:bg-zinc-950/20 border border-zinc-200/30 dark:border-white/5 space-y-1">
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block">
                    {usedVehicle.fuelType === 'EV' ? 'Battery Degradation' : 'Engine System Wear'}
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-black text-slate-700 dark:text-zinc-250">
                      {usedVehicle.fuelType === 'EV' 
                        ? `${usedOutputs.kmDepreciationDetails.batteryDegradationPercent}% Cap Loss` 
                        : `${usedOutputs.kmDepreciationDetails.engineWearPercent}%`
                      }
                    </span>
                    <span className="text-[7px] text-zinc-550">Life consumed</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-900 rounded-full overflow-hidden mt-1.5">
                    <div 
                      className={`h-full rounded-full ${
                        (usedVehicle.fuelType === 'EV' ? usedOutputs.kmDepreciationDetails.batteryDegradationPercent : usedOutputs.kmDepreciationDetails.engineWearPercent) > 65
                          ? 'bg-rose-500' 
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${usedVehicle.fuelType === 'EV' ? usedOutputs.kmDepreciationDetails.batteryDegradationPercent : usedOutputs.kmDepreciationDetails.engineWearPercent}%` }}
                    />
                  </div>
                </div>

                {/* Suspension Life Consumed */}
                <div className="p-2.5 rounded-xl bg-slate-100/40 dark:bg-zinc-950/20 border border-zinc-200/30 dark:border-white/5 space-y-1">
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block">Suspension Wear</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-black text-slate-700 dark:text-zinc-250">
                      {usedOutputs.kmDepreciationDetails.suspensionWearPercent}%
                    </span>
                    <span className="text-[7px] text-zinc-550">Damper wear</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-900 rounded-full overflow-hidden mt-1.5">
                    <div 
                      className={`h-full rounded-full ${usedOutputs.kmDepreciationDetails.suspensionWearPercent > 70 ? 'bg-rose-500' : 'bg-cyan-500'}`}
                      style={{ width: `${usedOutputs.kmDepreciationDetails.suspensionWearPercent}%` }}
                    />
                  </div>
                </div>

                {/* Breakdown Risk multiplier */}
                <div className="p-2.5 rounded-xl bg-slate-100/40 dark:bg-zinc-950/20 border border-zinc-200/30 dark:border-white/5 space-y-1 col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block">Annual Breakdown Probability</span>
                    <span className="text-[9px] font-black text-slate-700 dark:text-zinc-250">
                      {usedOutputs.kmDepreciationDetails.breakdownProbabilityPercent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-900 rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full rounded-full ${
                        usedOutputs.kmDepreciationDetails.breakdownProbabilityPercent > 50 
                          ? 'bg-rose-400' 
                          : usedOutputs.kmDepreciationDetails.breakdownProbabilityPercent > 25 
                            ? 'bg-amber-400' 
                            : 'bg-emerald-400'
                      }`}
                      style={{ width: `${usedOutputs.kmDepreciationDetails.breakdownProbabilityPercent}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-zinc-500 block leading-normal pt-1">
                    Computed based on physical calendar ageing combined with road kilometer cycles driven relative to expected Indian highway stress factors.
                  </span>
                </div>

              </div>

              {/* Valuation Price Reconciliation Breakdown */}
              <div className="pt-2.5 border-t border-zinc-200/50 dark:border-white/5 space-y-1.5">
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block">Used Asset Value Reconciliation:</span>
                
                <div className="space-y-1 text-[10px] text-slate-700 dark:text-zinc-350">
                  <div className="flex items-center justify-between">
                    <span>Baseline New On-Road Price:</span>
                    <span className="font-semibold">{formatPrice(usedVehicle.onRoadPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Base Age-Based Depreciation ({usedVehicleAge} Yrs):</span>
                    <span className="font-semibold text-rose-500">-{formatPrice(usedOutputs.kmDepreciationDetails.ageDepreciation)}</span>
                  </div>
                  
                  {usedOutputs.kmDepreciationDetails.kmAdjustment !== 0 && (
                    <div className="flex items-center justify-between">
                      <span>Odometer Mileage Adjustment ({usedOutputs.kmDepreciationDetails.condition}):</span>
                      <span className={`font-semibold ${usedOutputs.kmDepreciationDetails.kmAdjustment < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {usedOutputs.kmDepreciationDetails.kmAdjustment < 0 ? '-' : '+'}{formatPrice(Math.abs(usedOutputs.kmDepreciationDetails.kmAdjustment))}
                      </span>
                    </div>
                  )}

                  {usedOutputs.kmDepreciationDetails.wearAdjustment !== 0 && (
                    <div className="flex items-center justify-between">
                      <span>Mechanical Wear & Parts Risk Premium:</span>
                      <span className={`font-semibold ${usedOutputs.kmDepreciationDetails.wearAdjustment < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {usedOutputs.kmDepreciationDetails.wearAdjustment < 0 ? '-' : '+'}{formatPrice(Math.abs(usedOutputs.kmDepreciationDetails.wearAdjustment))}
                      </span>
                    </div>
                  )}

                  {usedOutputs.kmDepreciationDetails.marketDemandAdjustment !== 0 && (
                    <div className="flex items-center justify-between">
                      <span>Model Demand & Brand Residual Markup:</span>
                      <span className={`font-semibold ${usedOutputs.kmDepreciationDetails.marketDemandAdjustment < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {usedOutputs.kmDepreciationDetails.marketDemandAdjustment < 0 ? '-' : '+'}{formatPrice(Math.abs(usedOutputs.kmDepreciationDetails.marketDemandAdjustment))}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-zinc-200/50 dark:border-white/5 pt-1.5 text-xs font-black text-slate-800 dark:text-white">
                    <span>Final Calculated Pre-Owned Purchase Price:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{formatPrice(usedOutputs.kmDepreciationDetails.adjustedValue)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Risk Bulletins */}
          <div className="space-y-2">
            
            {/* Reliability Alert */}
            <div className="flex gap-2.5 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 dark:border-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] leading-relaxed">
              <Activity size={15} className="shrink-0 mt-0.5" />
              <div>
                <strong className="block uppercase tracking-wider text-[8px] font-extrabold mb-0.5">Reliability Outlook:</strong>
                {verdicts.reliabilityVerdict}
              </div>
            </div>

            {/* Maintenance Alert */}
            <div className="flex gap-2.5 p-3 rounded-2xl bg-rose-500/5 border border-rose-500/15 dark:border-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] leading-relaxed">
              <ShieldAlert size={15} className="shrink-0 mt-0.5" />
              <div>
                <strong className="block uppercase tracking-wider text-[8px] font-extrabold mb-0.5">Critical Maintenance Risks & Lifecycle:</strong>
                {verdicts.maintenanceRiskVerdict}
              </div>
            </div>

          </div>

          {/* Break-even Indicator Widget */}
          {breakEven.canBreakEven ? (
            <div className="p-3.5 rounded-2.5xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/20 text-[10px] space-y-1">
              <div className="flex items-center gap-1 text-emerald-500 font-bold uppercase tracking-wider">
                <CheckCircle2 size={12} />
                <span>New-Vehicle Break-Even Attained!</span>
              </div>
              <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                {breakEven.message} Saving approx <strong>{formatPrice(breakEven.annualSaving)}</strong> annually on diesel/EV utility rates allows you to recover the <strong>{formatPrice(breakEven.upfrontSaving)}</strong> buying price premium within your ownership tenure.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-2.5xl bg-zinc-100 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 text-[10px] space-y-1">
              <div className="flex items-center gap-1 text-zinc-500 font-bold uppercase tracking-wider">
                <Info size={12} />
                <span>No Break-Even Within Holding Window</span>
              </div>
              <p className="text-zinc-650 dark:text-zinc-400 leading-relaxed">
                {breakEven.message}
              </p>
            </div>
          )}

          {/* Core Modeling Assumptions Panel */}
          <div className="p-3.5 rounded-2.5xl border bg-white dark:bg-zinc-950/10 border-zinc-200 dark:border-white/5 text-[9px] text-zinc-500 dark:text-zinc-400">
            <span className="font-extrabold uppercase tracking-widest block text-[8px]">Underlying Modeling Assumptions:</span>
            <ul className="list-disc list-inside mt-1.5 space-y-1">
              <li>Fuel Inflation: {scenario.inputs.fuelInflation}% / Service Inflation: {scenario.inputs.serviceInflation}% per year compounding.</li>
              <li>EV battery replacement costs are modeled probabilistically starting at year 8 at current cells rates.</li>
              <li>Road transits incorporate toll rates and parking taxes of ₹{(scenario.inputs.parkingCosts + scenario.inputs.tollUsage).toLocaleString('en-IN')}/Mo.</li>
              <li>Pre-owned values estimate a ±10-15% variance based on state transfer rules and localized demands.</li>
            </ul>
          </div>

        </div>
      )}

      {/* TREND CHATS PANEL */}
      {activeTab === 'trends' && (
        <div className="space-y-4">
          
          {/* Depreciation curve Line Chart */}
          <div className="p-4 rounded-2.5xl border border-zinc-200/50 bg-white/40 dark:border-white/5 dark:bg-zinc-950/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Residual Valuation Curve</h4>
                <p className="text-[9px] text-zinc-500">Asset worth over the {ownershipDuration} year evaluation period</p>
              </div>
              <div className="flex gap-2 text-[8px] font-bold">
                <span className="flex items-center gap-1 text-emerald-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> NEW
                </span>
                <span className="flex items-center gap-1 text-cyan-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> USED
                </span>
              </div>
            </div>

            <div className="relative h-[200px] bg-slate-100/30 dark:bg-zinc-950/40 rounded-xl border border-zinc-200/30 dark:border-white/5 flex items-center justify-center pt-2">
              <svg className="w-[280px] h-[180px] overflow-visible">
                {/* Y Axes Lines */}
                <line x1="0" y1="30" x2="240" y2="30" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="90" x2="240" y2="90" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="150" x2="240" y2="150" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1" strokeDasharray="3" />
                
                {/* New Path Grid */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={getSvgPoints(newOutputs)}
                  className="transition-all duration-500"
                />

                {/* Used Path Grid */}
                <polyline
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={getSvgPoints(usedOutputs)}
                  className="transition-all duration-500"
                />

                {/* Draw Year Tooltips labels */}
                <text x="0" y="175" className="fill-zinc-400 text-[8px]" fontStyle="normal">Start</text>
                <text x="120" y="175" className="fill-zinc-400 text-[8px]" textAnchor="middle">Mid-Tenure</text>
                <text x="240" y="175" className="fill-zinc-400 text-[8px]" textAnchor="end">Yr {ownershipDuration}</text>
              </svg>
            </div>
            
            <div className="flex justify-between text-[9px] text-zinc-500 leading-normal px-1">
              <span>Original New Residual: <strong>{formatPrice(newOutputs.expectedResaleValue)}</strong></span>
              <span>Used Residual: <strong>{formatPrice(usedOutputs.expectedResaleValue)}</strong></span>
            </div>
          </div>

          {/* Annual Maintenance Trends Line Chart */}
          <div className="p-4 rounded-2.5xl border border-zinc-200/50 bg-white/40 dark:border-white/5 dark:bg-zinc-950/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Yearly Maintenance Escalation</h4>
                <p className="text-[9px] text-zinc-500">Includes fluid refills, brakes, tyres & sudden failures risks</p>
              </div>
            </div>

            <div className="relative h-[200px] bg-slate-100/30 dark:bg-zinc-950/40 rounded-xl border border-zinc-200/30 dark:border-white/5 flex items-center justify-center pt-2">
              <svg className="w-[280px] h-[180px] overflow-visible">
                {/* Y Axes lines */}
                <line x1="0" y1="30" x2="240" y2="30" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="90" x2="240" y2="90" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="150" x2="240" y2="150" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1" strokeDasharray="3" />

                {/* New Path Grid */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={getMaintPoints(newOutputs)}
                  className="transition-all duration-500"
                />

                {/* Used Path Grid */}
                <polyline
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={getMaintPoints(usedOutputs)}
                  className="transition-all duration-500"
                />

                {/* Y labels */}
                <text x="0" y="175" className="fill-zinc-400 text-[8px]" fontStyle="normal">Yr 1</text>
                <text x="120" y="175" className="fill-zinc-400 text-[8px]" textAnchor="middle">Mid-Tenure</text>
                <text x="240" y="175" className="fill-zinc-400 text-[8px]" textAnchor="end">Yr {ownershipDuration}</text>
              </svg>
            </div>

            <div className="flex justify-between text-[9px] text-zinc-500 leading-normal px-1">
              <span>Max Year Peak Expense: <strong>{formatPrice(maxMaint)}</strong></span>
              <span className="text-[8px] text-rose-500">*Includes probabilistic wear penalties of age.</span>
            </div>
          </div>

        </div>
      )}

      {/* AMORTIZATION MATRIX DETAILS PANEL */}
      {activeTab === 'detail' && (
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Click a year to view side-by-side expense sheets</span>
          
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-0.5">
            {yearsArray.map((year) => {
              const isOpen = expandedYear === year;
              const nY = newOutputs.yearlyBreakdown[year - 1];
              const uY = usedOutputs.yearlyBreakdown[year - 1];
              
              if (!nY || !uY) return null;

              return (
                <div 
                  key={year}
                  className="rounded-2xl border border-zinc-200/50 dark:border-white/5 overflow-hidden transition-all bg-white/40 dark:bg-zinc-950/20"
                >
                  <button
                    onClick={() => setExpandedYear(isOpen ? null : year)}
                    className="w-full p-3 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-100/50 dark:hover:bg-zinc-950/30"
                  >
                    <span>Year {year} Financial Amortization</span>
                    <span className="text-[10px] font-bold text-emerald-500">
                      {isOpen ? 'Collapse -' : 'Expand +'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="p-3 border-t border-zinc-200/40 dark:border-white/5 bg-slate-100/45 dark:bg-black/30 space-y-3.5 text-[10.5px]">
                      
                      {/* Metric Comparison rows */}
                      <div className="grid grid-cols-2 gap-3 pb-2 border-b border-dashed border-zinc-200/50 dark:border-white/5 font-bold uppercase tracking-wider text-[8px]">
                        <span className="text-emerald-500">New Sheet</span>
                        <span className="text-cyan-500">Used Sheet</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* New column info */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Fuel Cost:</span>
                            <span className="font-mono">{formatPrice(nY.fuelElectricityCost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Basic Service:</span>
                            <span className="font-mono">{formatPrice(nY.maintenanceCost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Insurance:</span>
                            <span className="font-mono">{formatPrice(nY.insuranceCost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">EMIs Paid:</span>
                            <span className="font-mono">{formatPrice(nY.emiPaid)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Depreciation:</span>
                            <span className="font-mono">{formatPrice(nY.depreciation)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Tolls/Roads:</span>
                            <span className="font-mono">{formatPrice(nY.parkingTollCost)}</span>
                          </div>
                          <div className="flex justify-between border-t border-zinc-350 dark:border-zinc-850 pt-1.5 font-extrabold text-emerald-500">
                            <span>Total Cashout:</span>
                            <span className="font-mono">{formatPrice(nY.totalCost)}</span>
                          </div>
                        </div>

                        {/* Used column info */}
                        <div className="space-y-1.5 border-l border-zinc-300 dark:border-zinc-800 pl-3">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Fuel Cost:</span>
                            <span className="font-mono">{formatPrice(uY.fuelElectricityCost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Basic Service:</span>
                            <span className="font-mono">{formatPrice(uY.maintenanceCost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Insurance:</span>
                            <span className="font-mono">{formatPrice(uY.insuranceCost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">EMIs Paid:</span>
                            <span className="font-mono">{formatPrice(uY.emiPaid)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Depreciation:</span>
                            <span className="font-mono">{formatPrice(uY.depreciation)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Tolls/Roads:</span>
                            <span className="font-mono">{formatPrice(uY.parkingTollCost)}</span>
                          </div>
                          <div className="flex justify-between border-t border-zinc-350 dark:border-zinc-850 pt-1.5 font-extrabold text-cyan-500">
                            <span>Total Cashout:</span>
                            <span className="font-mono">{formatPrice(uY.totalCost)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[9px] text-zinc-500 border-t border-zinc-200/50 dark:border-white/5 pt-1 flex justify-between">
                        <span>New Value End Year: <strong>{formatPrice(nY.resaleValue)}</strong></span>
                        <span>Used Value End Year: <strong>{formatPrice(uY.resaleValue)}</strong></span>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary Control restart button */}
      <button
        onClick={onRestart}
        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs rounded-2xl hover:brightness-105 active:scale-98 transition-all shadow-md flex items-center justify-center gap-1.5 print:hidden"
      >
        <Compass size={14} />
        <span>Compare Another Vehicle</span>
      </button>

    </div>
  );
}
