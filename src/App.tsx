import React, { useState, useEffect } from 'react';
import MobileShell from './components/MobileShell';
import StepIndicator from './components/StepIndicator';
import VehicleSelector from './components/VehicleSelector';
import InputsForm from './components/InputsForm';
import TcoDashboard from './components/TcoDashboard';
import SavedReportsView from './components/SavedReportsView';
import GuideView from './components/GuideView';
import { Vehicle, VehicleType, FuelType, ComparisonScenario, UserInputs, CalculatedReport } from './types';
import { calculateVehicleTCO, generateVerdicts, getYearlyKmBenchmark } from './utils/calculator';
import { INDIAN_VEHICLES } from './data/vehicles';
import { Sparkles, BarChart3, Clock, Compass, HelpCircle, ChevronRight, CheckCircle2, Heart, Scale, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('explore');
  const [currentScreen, setCurrentScreen] = useState<number>(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [savedReports, setSavedReports] = useState<CalculatedReport[]>([]);

  // Detailed Comparison States
  const [selectedType, setSelectedType] = useState<VehicleType | null>(null);
  const [selectedFuel, setSelectedFuel] = useState<FuelType | null>(null);
  const [scenario, setScenario] = useState<ComparisonScenario | null>(null);
  const [activeReport, setActiveReport] = useState<CalculatedReport | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem('treo_tco_favorites');
      if (storedFavs) {
        setFavorites(JSON.parse(storedFavs));
      }
      const storedReports = localStorage.getItem('treo_tco_reports');
      if (storedReports) {
        setSavedReports(JSON.parse(storedReports));
      }
    } catch (e) {
      console.error('Error loading localStorage keys', e);
    }
  }, []);

  // Sync favorites
  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('treo_tco_favorites', JSON.stringify(next));
      return next;
    });
  };

  // Step names
  const stepLabels = [
    'Choose Vehicle Category',
    'Choose Petrol / EV Drive System',
    'Select Specific Model',
    'Amortization Target Type',
    'Define Pre-owned Age',
    'Planned Holding Period',
    'Calibrate Expenses & EMIs',
  ];

  // Screen 1: Select type
  const handleSelectType = (type: VehicleType) => {
    setSelectedType(type);
    setCurrentScreen(2);
  };

  // Screen 2: Select fuel
  const handleSelectFuel = (fuel: FuelType) => {
    setSelectedFuel(fuel);
    setCurrentScreen(3);
  };

  // Screen 3: Select vehicle
  const handleSelectVehicle = (vehicle: Vehicle) => {
    // Determine a default used vehicle price and initial default states
    const defaultInputs: UserInputs = {
      annualKilometers: 12000,
      fuelPrice: 101.5, // Realistic Indian petrol rate
      electricityRate: 7.2, // Realistic Indian unit rate
      fuelInflation: 6,
      serviceInflation: 5,
      newDownPayment: Math.round(vehicle.onRoadPrice * 0.20), // 20% down
      newLoanTenure: 5,
      newLoanInterest: 8.75, // standard SBI rate
      usedDownPayment: Math.round(vehicle.onRoadPrice * 0.15),
      usedLoanTenure: 3,
      usedLoanInterest: 12.5, // used auto loans are notoriously higher in India
      parkingCosts: 300,
      tollUsage: 500,
      insuranceType: 'Comprehensive',
      drivingStyle: 'Balanced / Economical'
    };

    setScenario({
      vehicleType: vehicle.type,
      fuelType: vehicle.fuelType,
      newVehicle: vehicle,
      isSameVehicle: true,
      usedVehicle: vehicle,
      usedVehicleAge: 4, // Default mid life age
      usedVehicleOdometer: 4 * getYearlyKmBenchmark(vehicle.type).average, // Default odometer based on age and benchmark
      ownershipDuration: 5, // Default holding period
      inputs: defaultInputs
    });

    setCurrentScreen(4);
  };

  const handleNextScreen = () => {
    setCurrentScreen((prev) => Math.min(7, prev + 1));
  };

  const handlePrevScreen = () => {
    setCurrentScreen((prev) => {
      if (prev === 4) return 3;
      return Math.max(1, prev - 1);
    });
  };

  const handleResetWorkflow = () => {
    setSelectedType(null);
    setSelectedFuel(null);
    setScenario(null);
    setActiveReport(null);
    setCurrentScreen(1);
    setActiveTab('explore');
  };

  // Calculates outputs and shows dashboard
  const handleCalculateTCO = () => {
    if (!scenario) return;

    const newOut = calculateVehicleTCO(
      scenario.newVehicle,
      true,
      0,
      0, // starting odometer of brand new is 0 KM
      scenario.ownershipDuration,
      scenario.inputs
    );

    const usedOut = calculateVehicleTCO(
      scenario.usedVehicle,
      false,
      scenario.usedVehicleAge,
      scenario.usedVehicleOdometer ?? (scenario.usedVehicleAge * getYearlyKmBenchmark(scenario.usedVehicle.type).average),
      scenario.ownershipDuration,
      scenario.inputs
    );

    const verdicts = generateVerdicts(scenario, newOut, usedOut);

    const finalReport: CalculatedReport = {
      id: `report-${Date.now()}`,
      title: `${scenario.newVehicle.brand} ${scenario.newVehicle.model} comparison`,
      createdAt: new Date().toISOString(),
      scenario,
      newOutputs: newOut,
      usedOutputs: usedOut,
      verdicts
    };

    setActiveReport(finalReport);
    setCurrentScreen(8); // Analytics Dashboard View
  };

  // Appends to local logs journal
  const saveReportToHistory = () => {
    if (!activeReport) return;
    setSavedReports((prev) => {
      // Check if already in list to prevent duplicate insertions
      if (prev.some((r) => r.id === activeReport.id)) return prev;
      const next = [activeReport, ...prev];
      localStorage.setItem('treo_tco_reports', JSON.stringify(next));
      return next;
    });
  };

  const deleteReport = (id: string) => {
    setSavedReports((prev) => {
      const next = prev.filter((r) => r.id !== id);
      localStorage.setItem('treo_tco_reports', JSON.stringify(next));
      return next;
    });
  };

  const clearAllReports = () => {
    if (confirm('Are you certain you want to erase all saved cost estimations?')) {
      setSavedReports([]);
      localStorage.removeItem('treo_tco_reports');
    }
  };

  const loadSavedReport = (report: CalculatedReport) => {
    setActiveReport(report);
    setScenario(report.scenario);
    setSelectedType(report.scenario.vehicleType);
    setSelectedFuel(report.scenario.fuelType);
    setCurrentScreen(8); // Jump directly to analytics
    setActiveTab('compare');
  };

  return (
    <MobileShell 
      activeTab={activeTab} 
      setActiveTab={(tab) => {
        setActiveTab(tab);
        // If switching tabs, don't break active calculation screen, but reset to screen 1 if no scenario started
        if (tab === 'compare' && currentScreen === 8 && !activeReport) {
          setCurrentScreen(1);
        }
      }} 
      title="TrueTCO"
    >
      
      {/* TAB A: THE PORTAL GREETINGS / DISCOVER HOME */}
      {activeTab === 'explore' && (
        <div className="flex flex-col h-full gap-5">
          <div className="text-center py-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/20 mb-3 animate-bounce">
              <Scale size={24} />
            </div>
            
            <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">
              True ownership cost
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 px-4 leading-relaxed">
              Evaluating new vs pre-owned cars in India under RTO rates, loan profiles, EV degradation, and periodic wear.
            </p>
          </div>

          {/* Value Highlights Cards Grid */}
          <div className="grid grid-cols-2 gap-3 pb-2">
            
            <div className="p-3.5 rounded-2.5xl border border-zinc-250 bg-white/40 dark:border-white/5 dark:bg-zinc-950/20">
              <span className="text-emerald-500 font-extrabold text-[15px] block">18%</span>
              <span className="text-[10px] font-bold text-slate-700 dark:text-white block mt-1">Showroom Dip</span>
              <span className="text-[9px] text-zinc-500 dark:text-zinc-450 block leading-tight mt-0.5">Estimated depreciation loss on day one of a new car purchase.</span>
            </div>

            <div className="p-3.5 rounded-2.5xl border border-zinc-250 bg-white/40 dark:border-white/5 dark:bg-zinc-950/20">
              <span className="text-cyan-500 font-extrabold text-[15px] block">₹12.5%</span>
              <span className="text-[10px] font-bold text-slate-700 dark:text-white block mt-1">Loan Hikes</span>
              <span className="text-[9px] text-zinc-500 dark:text-zinc-450 block leading-tight mt-0.5">Used car financing interest rates compound much faster.</span>
            </div>

            <div className="p-3.5 rounded-2.5xl border border-zinc-250 bg-white/40 dark:border-white/5 dark:bg-zinc-950/20">
              <span className="text-amber-500 font-extrabold text-[15px] block">40K KM</span>
              <span className="text-[10px] font-bold text-slate-700 dark:text-white block mt-1">Tyre Wear</span>
              <span className="text-[9px] text-zinc-500 dark:text-zinc-450 block leading-tight mt-0.5">Hidden replacement events accounted for in TCO algorithms.</span>
            </div>

            <div className="p-3.5 rounded-2.5xl border border-zinc-250 bg-white/40 dark:border-white/5 dark:bg-zinc-950/20">
              <span className="text-purple-500 font-extrabold text-[15px] block">0-15 Yrs</span>
              <span className="text-[10px] font-bold text-slate-700 dark:text-white block mt-1">Pre-owned Age</span>
              <span className="text-[9px] text-zinc-500 dark:text-zinc-450 block leading-tight mt-0.5">Fully custom pre-owned parameters and holding limits.</span>
            </div>

          </div>

          <button
            onClick={() => {
              setActiveTab('compare');
              setCurrentScreen(1);
            }}
            className="w-full mt-auto py-3.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs text-white rounded-2.5xl transition-all shadow-lg shadow-emerald-500/20 tracking-wider uppercase"
          >
            Start Analyzing New vs Used →
          </button>
        </div>
      )}

      {/* TAB B: COMPARISON ENGINE STEPS */}
      {activeTab === 'compare' && (
        <div className="flex flex-col h-full">
          
          {/* Step indicator on wizard screens (1 through 7) */}
          {currentScreen <= 7 && (
            <StepIndicator 
              currentStep={currentScreen} 
              totalSteps={7} 
              stepLabels={stepLabels} 
            />
          )}

          {/* Render Active Screen Wizard State */}
          {currentScreen <= 3 ? (
            <VehicleSelector
              currentScreen={currentScreen}
              selectedType={selectedType}
              selectedFuel={selectedFuel}
              selectedNewVehicle={scenario?.newVehicle || null}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onSelectType={handleSelectType}
              onSelectFuel={handleSelectFuel}
              onSelectVehicle={handleSelectVehicle}
              onBack={() => {
                if (currentScreen === 3) {
                  setCurrentScreen(2);
                } else if (currentScreen === 2) {
                  setCurrentScreen(1);
                }
              }}
            />
          ) : currentScreen <= 7 ? (
            scenario && (
              <InputsForm
                currentScreen={currentScreen}
                newVehicle={scenario.newVehicle}
                isSameVehicle={scenario.isSameVehicle}
                usedVehicle={scenario.usedVehicle}
                usedVehicleAge={scenario.usedVehicleAge}
                ownershipDuration={scenario.ownershipDuration}
                inputs={scenario.inputs}
                setScenario={setScenario}
                onNextScreen={handleNextScreen}
                onPrevScreen={handlePrevScreen}
                onCalculate={handleCalculateTCO}
              />
            )
          ) : (
            // Screen 8: Dashboards
            activeReport && (
              <TcoDashboard
                report={activeReport}
                onSaveReport={saveReportToHistory}
                onRestart={handleResetWorkflow}
              />
            )
          )}

        </div>
      )}

      {/* TAB C: SAVED COMPARISON HISTORY */}
      {activeTab === 'reports' && (
        <SavedReportsView
          reports={savedReports}
          onSelectReport={loadSavedReport}
          onDeleteReport={deleteReport}
          onClearAll={clearAllReports}
        />
      )}

      {/* TAB D: METHODOLOGY MATHEMATICS GUIDELINES */}
      {activeTab === 'methodology' && <GuideView />}

    </MobileShell>
  );
}
