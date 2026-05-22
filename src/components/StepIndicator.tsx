import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export default function StepIndicator({ currentStep, totalSteps, stepLabels }: StepIndicatorProps) {
  const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full mb-6 py-2 px-1 select-none">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
          {stepLabels[currentStep - 1]}
        </span>
      </div>

      {/* Progress Track */}
      <div className="relative h-1.5 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full transition-all duration-300" 
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Miniature Dot Grid for Steps */}
      <div className="flex justify-between items-center mt-2.5 px-0.5">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          
          return (
            <div 
              key={stepNum} 
              className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                isCompleted 
                  ? 'bg-emerald-500 text-white w-4 h-4' 
                  : isActive
                    ? 'bg-emerald-500 text-white w-4 h-4 scale-110 shadow-sm shadow-emerald-500/40 ring-2 ring-emerald-500/20'
                    : 'bg-slate-300 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 w-3.5 h-3.5'
              }`}
            >
              {isCompleted ? (
                <Check size={9} className="stroke-[3]" />
              ) : (
                <span className="text-[8px] font-bold">{stepNum}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
