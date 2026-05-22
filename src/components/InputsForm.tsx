import React, { useState } from 'react';
import { motion } from 'motion/react';
import { HelpCircle, ChevronRight, ChevronLeft, Info, Calendar, Car, Shield, Sparkles, Gauge } from 'lucide-react';
import { Vehicle, UserInputs, ComparisonScenario, InsuranceType, DrivingStyle, VehicleType } from '../types';
import { INDIAN_VEHICLES } from '../data/vehicles';
import { getYearlyKmBenchmark } from '../utils/calculator';

interface InputsFormProps {
  currentScreen: number;
  newVehicle: Vehicle;
  isSameVehicle: boolean;
  usedVehicle: Vehicle;
  usedVehicleAge: number;
  usedVehicleOdometer?: number;
  ownershipDuration: number;
  inputs: UserInputs;
  setScenario: React.Dispatch<React.SetStateAction<ComparisonScenario | null>>;
  onNextScreen: () => void;
  onPrevScreen: () => void;
  onCalculate: () => void;
}

export default function InputsForm({
  currentScreen,
  newVehicle,
  isSameVehicle,
  usedVehicle,
  usedVehicleAge,
  usedVehicleOdometer = 0,
  ownershipDuration,
  inputs,
  setScenario,
  onNextScreen,
  onPrevScreen,
  onCalculate,
}: InputsFormProps) {

  // Handle same vs different comparison toggle (Screen 4)
  const handleSameVehicleToggle = (same: boolean) => {
    setScenario((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        isSameVehicle: same,
        // Reset used vehicle to newVehicle if selecting yes, otherwise keep or pick first alternative
        usedVehicle: same 
          ? prev.newVehicle 
          : INDIAN_VEHICLES.find(v => v.type === prev.newVehicle.type && v.id !== prev.newVehicle.id) || prev.newVehicle
      };
    });
  };

  // Change used vehicle pointer when isSameVehicle is false
  const handleUsedVehicleChange = (id: string) => {
    const selected = INDIAN_VEHICLES.find(v => v.id === id);
    if (selected) {
      setScenario((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          usedVehicle: selected
        };
      });
    }
  };

  // Age slider / numerical validation (Screen 5)
  const handleUsedAgeChange = (val: number) => {
    const cleanVal = Math.max(0, Math.min(15, val));
    setScenario((prev) => {
      if (!prev) return null;
      const benchmark = getYearlyKmBenchmark(prev.usedVehicle.type);
      return { 
        ...prev, 
        usedVehicleAge: cleanVal,
        usedVehicleOdometer: cleanVal * benchmark.average
      };
    });
  };

  // Odometer slider / input validator (Screen 5)
  const handleUsedOdometerChange = (val: number) => {
    const cleanVal = Math.max(0, Math.min(300000, val));
    setScenario((prev) => {
      if (!prev) return null;
      return { ...prev, usedVehicleOdometer: cleanVal };
    });
  };

  // Ownership tenure slider/numerical (Screen 6)
  const handleOwnershipDurationChange = (val: number) => {
    const cleanVal = Math.max(1, Math.min(15, val));
    setScenario((prev) => {
      if (!prev) return null;
      return { ...prev, ownershipDuration: cleanVal };
    });
  };

  // Operational variable modifiers (Screen 7)
  const handleInputChange = (field: keyof UserInputs, val: any) => {
    setScenario((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        inputs: {
          ...prev.inputs,
          [field]: val
        }
      };
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  // ================= SCREEN 4 — COMPARISON TYPE =================
  if (currentScreen === 4) {
    const alternatives = INDIAN_VEHICLES.filter(v => v.type === newVehicle.type && v.id !== newVehicle.id);
    
    return (
      <div className="flex flex-col gap-5">
        <div className="text-center mb-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500">Matching Platform</span>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white mt-1">Comparison Target</h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">Compare the exact same model or evaluate against an alternative asset?</p>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => handleSameVehicleToggle(true)}
            className={`flex-1 p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all ${
              isSameVehicle 
                ? 'bg-emerald-500/10 border-emerald-500 dark:bg-emerald-500/15'
                : 'bg-white/40 border-zinc-200/50 dark:bg-zinc-950/20 dark:border-white/5'
            }`}
          >
            <div className="flex items-center gap-1.5 text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Option A</span>
            </div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Same Model</h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-tight">
              Compare a brand new <strong>{newVehicle.model}</strong> vs its pre-depreciated used model.
            </p>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => handleSameVehicleToggle(false)}
            className={`flex-1 p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all ${
              !isSameVehicle
                ? 'bg-emerald-500/10 border-emerald-500 dark:bg-emerald-500/15'
                : 'bg-white/40 border-zinc-200/50 dark:bg-zinc-950/20 dark:border-white/5'
            }`}
          >
            <div className="flex items-center gap-1.5 text-cyan-500">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Option B</span>
            </div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Different Asset</h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-tight">
              Compare a new <strong>{newVehicle.model}</strong> vs an alternative reliable second-hand asset.
            </p>
          </motion.button>
        </div>

        {/* Alternative Vehicle Dropdown if NO selected */}
        {!isSameVehicle && (
          <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-zinc-900/20 border border-zinc-200/50 dark:border-white/5 space-y-2">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">Select Used Vehicle Target</span>
            <select
              value={usedVehicle.id}
              onChange={(e) => handleUsedVehicleChange(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border bg-white dark:bg-zinc-950 border-zinc-200/50 dark:border-white/5 text-slate-800 dark:text-white focus:outline-none"
            >
              {INDIAN_VEHICLES.filter(v => v.type === newVehicle.type).map(v => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} ({v.variant}) - On-road ₹{(v.onRoadPrice/100000).toFixed(1)}L
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={onPrevScreen}
            className="flex-1 py-3 text-xs font-semibold rounded-2xl border border-zinc-200/50 dark:border-white/5 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
          >
            Back
          </button>
          <button
            onClick={onNextScreen}
            className="flex-1 py-3 text-xs font-semibold rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
          >
            Next Step
          </button>
        </div>
      </div>
    );
  }

  // ================= SCREEN 5 — USED VEHICLE PARAMETERS =================
  if (currentScreen === 5) {
    const benchmark = getYearlyKmBenchmark(usedVehicle.type);
    const expectedKm = usedVehicleAge * benchmark.average;
    
    // Determine condition factor live
    let ratio = 1.0;
    if (usedVehicleAge > 0 && expectedKm > 0) {
      ratio = usedVehicleOdometer / expectedKm;
    }
    
    let conditionLabel = 'Normal';
    let conditionColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    let conditionImpact = 'Vehicle age and mileage driven align with average Indian commuter wear models.';
    
    if (ratio < 0.85) {
      conditionLabel = 'Low Usage';
      conditionColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      conditionImpact = 'Excellent premium status. Shorter component life depletion means higher reliability and resale value.';
    } else if (ratio > 1.15 && ratio <= 1.5) {
      conditionLabel = 'High Usage';
      conditionColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      conditionImpact = 'Heavy baseline wear. Expect early recurring wear-out repair bills for tyres, brake systems, and damper elements.';
    } else if (ratio > 1.5) {
      conditionLabel = 'Excessive Usage';
      conditionColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      conditionImpact = 'Critical wear stress. Near-term overhead risks are high. Secure a strong pre-owned buying discount.';
    }

    if (usedVehicleAge === 0) {
      conditionLabel = 'Like New';
      conditionColor = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      conditionImpact = 'Virtually new status without substantial physical age degradation.';
    }

    return (
      <div className="flex flex-col gap-6">
        <div className="text-center mb-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500">Asset Health Profile</span>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white mt-1">Pre-Owned Conditioning</h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">Configure both the odometer reading and vehicle age to calculate true physical wear.</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-200/30 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-white/5 space-y-5">
          {/* SECTION 1: AGE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-400 flex items-center gap-1.5">
                <Calendar size={13} className="text-emerald-500" />
                Vehicle Age
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={usedVehicleAge}
                  onChange={(e) => handleUsedAgeChange(Number(e.target.value))}
                  className="w-14 text-center text-xs font-bold py-0.5 px-1 border rounded bg-white dark:bg-zinc-950 border-zinc-200/50 dark:border-white/5 text-slate-800 dark:text-white"
                />
                <span className="text-[10px] font-semibold text-zinc-500">Yrs</span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={usedVehicleAge}
              onChange={(e) => handleUsedAgeChange(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[9px] text-zinc-500">
              <span>0 Yrs (New)</span>
              <span>7 Yrs (Mid)</span>
              <span>15 Yrs (Max)</span>
            </div>
          </div>

          {/* SECTION 2: ODOMETER */}
          <div className="space-y-2 pt-2 border-t border-zinc-200/50 dark:border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-400 flex items-center gap-1.5">
                <Gauge size={13} className="text-emerald-500" />
                Kilometers Driven
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="300000"
                  step="5000"
                  value={usedVehicleOdometer}
                  onChange={(e) => handleUsedOdometerChange(Number(e.target.value))}
                  className="w-20 text-center text-xs font-bold py-0.5 px-1 border rounded bg-white dark:bg-zinc-950 border-zinc-200/50 dark:border-white/5 text-slate-800 dark:text-white"
                />
                <span className="text-[10px] font-semibold text-zinc-500">KM</span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="180000"
              step="2500"
              value={Math.min(180000, usedVehicleOdometer)}
              onChange={(e) => handleUsedOdometerChange(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[9px] text-zinc-500">
              <span>0 KM</span>
              <span>{Math.round(benchmark.average * 4).toLocaleString('en-IN')} KM (Avg at 4y)</span>
              <span>180,000+ KM</span>
            </div>
          </div>

          {/* Live Diagnostics Metrics Row */}
          {usedVehicleAge > 0 && (
            <div className="pt-3 border-t border-zinc-200/50 dark:border-white/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
                  Indian Commute Benchmark:
                </span>
                <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300">
                  {benchmark.min.toLocaleString('en-IN')} - {benchmark.max.toLocaleString('en-IN')} KM / Yr
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
                  Expected Mileage (for age):
                </span>
                <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-350">
                  {expectedKm.toLocaleString('en-IN')} KM ({usedVehicleAge} Yrs)
                </span>
              </div>

              {/* Dynamic condition badge */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
                  Usage Condition Class:
                </span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${conditionColor}`}>
                  {conditionLabel}
                </span>
              </div>

              {/* Wear impacts comment */}
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-zinc-950 border border-zinc-200/50 dark:border-white/5 text-[10px] leading-relaxed text-slate-600 dark:text-zinc-400">
                {conditionImpact}
              </div>
            </div>
          )}

          {/* EV Battery Specific Warning */}
          {usedVehicle.fuelType === 'EV' && (
            <div className="flex gap-2 p-2.5 rounded-2xl bg-purple-500/5 border border-purple-500/15 text-purple-600 dark:text-purple-400">
              <Sparkles size={14} className="shrink-0 mt-0.5" />
              <p className="text-[9px] leading-tight">
                <strong>EV Cycle Tracking:</strong> Battery wear escalates exponentially with storage age and cycle usage. The cost engine dynamically projects lithium-ion pack degradation.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrevScreen}
            className="flex-1 py-3 text-xs font-semibold rounded-2xl border border-zinc-200/50 dark:border-white/5 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
          >
            Back
          </button>
          <button
            onClick={onNextScreen}
            className="flex-1 py-3 text-xs font-semibold rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
          >
            Next Step
          </button>
        </div>
      </div>
    );
  }

  // ================= SCREEN 6 — OWNERSHIP DURATION =================
  if (currentScreen === 6) {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center mb-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500">Ownership Window</span>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white mt-1">Holding Duration</h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">How many years do you plan to keep and operate the vehicle?</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-200/30 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-400">Your planned holding limit</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                max="15"
                value={ownershipDuration}
                onChange={(e) => handleOwnershipDurationChange(Number(e.target.value))}
                className="w-16 text-center text-sm font-bold py-1 px-1.5 border rounded-lg bg-white dark:bg-zinc-950 border-zinc-200/50 dark:border-white/5 text-slate-800 dark:text-white"
              />
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Years</span>
            </div>
          </div>

          <input
            type="range"
            min="1"
            max="15"
            step="1"
            value={ownershipDuration}
            onChange={(e) => handleOwnershipDurationChange(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />

          <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
            <span>1 Year (Short term)</span>
            <span>7 Years (Medium)</span>
            <span>15 Years (Max Limit)</span>
          </div>

          <div className="flex gap-2.5 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Calendar size={16} className="shrink-0 mt-0.5" />
            <p className="text-[10px] leading-relaxed">
              TCO logic will compute amortized loan payments, recurring insurance premiums, battery decay, and resale projections exactly for this <strong>{ownershipDuration}-year</strong> period.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrevScreen}
            className="flex-1 py-3 text-xs font-semibold rounded-2xl border border-zinc-200/50 dark:border-white/5 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
          >
            Back
          </button>
          <button
            onClick={onNextScreen}
            className="flex-1 py-3 text-xs font-semibold rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
          >
            Next Step
          </button>
        </div>
      </div>
    );
  }

  // ================= SCREEN 7 — USER INPUTS =================
  const insuranceOptions: InsuranceType[] = ['Comprehensive', 'Third Party', 'Zero Depreciation'];
  const drivingOptions: DrivingStyle[] = ['Balanced / Economical', 'Aggressive', 'City Stop-and-Go', 'Highway Cruiser'];

  // Accordion section selectors to organize Screen 7 beautifully
  const [activeSec, setActiveSec] = useState<'running' | 'finance' | 'lifestyle'>('running');

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center mb-1">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500">{newVehicle.type} ({newVehicle.fuelType})</span>
        <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">Fine-tune Indian Benchmarks</h2>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Customise financing, fuel inflation, and daily driving lifestyles.</p>
      </div>

      {/* Accordion Tabs */}
      <div className="flex border border-zinc-200/50 dark:border-white/5 rounded-xl overflow-hidden text-xs bg-slate-100/30 dark:bg-zinc-950/20">
        <button
          onClick={() => setActiveSec('running')}
          className={`flex-1 py-2 font-bold transition-all ${activeSec === 'running' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-zinc-400'}`}
        >
          Running Info
        </button>
        <button
          onClick={() => setActiveSec('finance')}
          className={`flex-1 py-2 font-bold transition-all ${activeSec === 'finance' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-zinc-400'}`}
        >
          Finance EMIs
        </button>
        <button
          onClick={() => setActiveSec('lifestyle')}
          className={`flex-1 py-2 font-bold transition-all ${activeSec === 'lifestyle' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-zinc-400'}`}
        >
          Lifestyle
        </button>
      </div>

      {/* Accordion Container content (Limited height to prevent button overflow in device frames) */}
      <div className="overflow-y-auto max-h-[350px] pr-0.5 space-y-3.5 py-1">
        
        {/* RUNNING CRITERIA CODES */}
        {activeSec === 'running' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex justify-between">
                <span>Annual Travelled</span>
                <span className="text-emerald-500 font-mono text-xs">{inputs.annualKilometers.toLocaleString('en-IN')} KM</span>
              </label>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={inputs.annualKilometers}
                onChange={(e) => handleInputChange('annualKilometers', Number(e.target.value))}
                className="w-full h-1 accent-emerald-500 mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-400">Fuel Price (₹ / Litre)</label>
                <input
                  type="number"
                  value={inputs.fuelPrice}
                  onChange={(e) => handleInputChange('fuelPrice', Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-xl border bg-white dark:bg-zinc-950 border-zinc-200/50 dark:border-white/5 font-semibold text-slate-800 dark:text-white mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-400">Electricity (₹ / kWh)</label>
                <input
                  type="number"
                  value={inputs.electricityRate}
                  onChange={(e) => handleInputChange('electricityRate', Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-xl border bg-white dark:bg-zinc-950 border-zinc-200/50 dark:border-white/5 font-semibold text-slate-800 dark:text-white mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-400">Fuel Inflation (% / Yr)</label>
                <input
                  type="number"
                  value={inputs.fuelInflation}
                  onChange={(e) => handleInputChange('fuelInflation', Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-xl border bg-white dark:bg-zinc-950 border-zinc-200/50 dark:border-white/5 font-semibold text-slate-800 dark:text-white mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-400">Maintenance Inflation (%)</label>
                <input
                  type="number"
                  value={inputs.serviceInflation}
                  onChange={(e) => handleInputChange('serviceInflation', Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-xl border bg-white dark:bg-zinc-950 border-zinc-200/50 dark:border-white/5 font-semibold text-slate-800 dark:text-white mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* FINANCE SCHEDULING */}
        {activeSec === 'finance' && (
          <div className="space-y-4">
            
            {/* New Car Amortization indicators */}
            <div className="p-3 rounded-2xl bg-zinc-100/60 dark:bg-zinc-950/40 border border-zinc-200/40 dark:border-white/5 space-y-2">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-500">NEW Vehicles Loan (₹{(newVehicle.onRoadPrice/100000).toFixed(1)}L total)</span>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-semibold text-zinc-500">Downpayment (₹)</label>
                  <input
                    type="number"
                    value={inputs.newDownPayment}
                    onChange={(e) => handleInputChange('newDownPayment', Math.min(newVehicle.onRoadPrice, Number(e.target.value)))}
                    className="w-full p-1.5 text-xs rounded-lg border bg-white dark:bg-zinc-950 border-zinc-200/50 dark:border-white/5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-semibold text-zinc-500">Interest rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.newLoanInterest}
                    onChange={(e) => handleInputChange('newLoanInterest', Number(e.target.value))}
                    className="w-full p-1.5 text-xs rounded-lg border bg-white dark:bg-zinc-950 border-zinc-200/50 dark:border-white/5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-semibold text-zinc-500 flex justify-between">
                  <span>Loan Tensor</span>
                  <span>{inputs.newLoanTenure} Years</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="7"
                  step="1"
                  value={inputs.newLoanTenure}
                  onChange={(e) => handleInputChange('newLoanTenure', Number(e.target.value))}
                  className="w-full h-1 accent-emerald-500 mt-0.5"
                />
              </div>
            </div>

            {/* Used asset loan tracker */}
            <div className="p-3 rounded-2xl bg-zinc-100/60 dark:bg-zinc-950/40 border border-zinc-200/40 dark:border-white/5 space-y-2">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-cyan-500">USED Vehicle Loan (₹{(usedVehicle.onRoadPrice * 0.5 /100000).toFixed(1)}L est.)</span>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-semibold text-zinc-500">Downpayment (₹)</label>
                  <input
                    type="number"
                    value={inputs.usedDownPayment}
                    onChange={(e) => handleInputChange('usedDownPayment', Number(e.target.value))}
                    className="w-full p-1.5 text-xs rounded-lg border bg-white dark:bg-zinc-950 border-zinc-200/50 dark:border-white/5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-semibold text-zinc-500">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.usedLoanInterest}
                    onChange={(e) => handleInputChange('usedLoanInterest', Number(e.target.value))}
                    className="w-full p-1.5 text-xs rounded-lg border bg-white dark:bg-zinc-950 border-zinc-200/50 dark:border-white/5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-semibold text-zinc-500 flex justify-between">
                  <span>Loan Tenure</span>
                  <span>{inputs.usedLoanTenure} Years</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={inputs.usedLoanTenure}
                  onChange={(e) => handleInputChange('usedLoanTenure', Number(e.target.value))}
                  className="w-full h-1 accent-emerald-500 mt-0.5"
                />
              </div>
            </div>

          </div>
        )}

        {/* LIFESTYLE OVERRIDES */}
        {activeSec === 'lifestyle' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-400">Monthly Parking (₹)</label>
                <input
                  type="number"
                  value={inputs.parkingCosts}
                  onChange={(e) => handleInputChange('parkingCosts', Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-xl border bg-white dark:bg-zinc-950 border-zinc-200/50 dark:border-white/5 font-semibold mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-400">Monthly Toll (₹)</label>
                <input
                  type="number"
                  value={inputs.tollUsage}
                  onChange={(e) => handleInputChange('tollUsage', Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-xl border bg-white dark:bg-zinc-950 border-zinc-200/50 dark:border-white/5 font-semibold mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-400">Insurance Framework</label>
              <select
                value={inputs.insuranceType}
                onChange={(e) => handleInputChange('insuranceType', e.target.value as InsuranceType)}
                className="w-full text-xs p-2.5 rounded-xl border bg-white dark:bg-zinc-950 border-zinc-200/50 dark:border-white/5 font-semibold mt-0.5"
              >
                {insuranceOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-400">Driving Habits</label>
              <select
                value={inputs.drivingStyle}
                onChange={(e) => handleInputChange('drivingStyle', e.target.value as DrivingStyle)}
                className="w-full text-xs p-2.5 rounded-xl border bg-white dark:bg-zinc-950 border-zinc-200/50 dark:border-white/5 font-semibold mt-0.5"
              >
                {drivingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        )}

      </div>

      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={onPrevScreen}
          className="flex-1 py-3 text-xs font-semibold rounded-2xl border border-zinc-200/50 dark:border-white/5 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onCalculate}
          className="flex-1 py-3 text-xs font-semibold rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
        >
          Analyze True Cost
        </button>
      </div>
    </div>
  );
}
