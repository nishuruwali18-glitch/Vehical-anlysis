export type VehicleType = '2 Wheeler' | '3 Wheeler' | '4 Wheeler' | 'Commercial Vehicle';

export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'EV' | 'Hybrid' | 'Flex Fuel';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  variant: string;
  type: VehicleType;
  fuelType: FuelType;
  mileage: number; // km/L or km/kWh
  batteryCapacity?: number; // kWh (for EVs)
  exShowroomPrice: number; // in INR
  onRoadPrice: number; // in INR
  insuranceEstimate: number; // in INR
  launchYear: number;
  discontinuedYear?: number; // undefined if current
  reliabilityScore: number; // 1-10 scale
  maintenanceRiskScore: number; // 1-10 scale
  category: 'Budget' | 'Executive' | 'Utility' | 'Premium' | 'Luxury';
}

export type InsuranceType = 'Comprehensive' | 'Third Party' | 'Zero Depreciation';
export type DrivingStyle = 'Balanced / Economical' | 'Aggressive' | 'City Stop-and-Go' | 'Highway Cruiser';

export interface UserInputs {
  annualKilometers: number;
  fuelPrice: number; // INR/L
  electricityRate: number; // INR/kWh
  fuelInflation: number; // annual percentage, e.g., 6%
  serviceInflation: number; // annual percentage, e.g., 5%
  
  // Financing for New Vehicle
  newDownPayment: number;
  newLoanTenure: number; // in years
  newLoanInterest: number; // rate in %
  
  // Financing for Used Vehicle
  usedDownPayment: number;
  usedLoanTenure: number; // in years; 0 if no loan
  usedLoanInterest: number; // rate in %

  parkingCosts: number; // monthly in INR
  tollUsage: number; // monthly in INR
  insuranceType: InsuranceType;
  drivingStyle: DrivingStyle;
}

export interface ComparisonScenario {
  vehicleType: VehicleType;
  fuelType: FuelType;
  newVehicle: Vehicle;
  isSameVehicle: boolean;
  usedVehicle: Vehicle; // Can be different if isSameVehicle is false
  usedVehicleAge: number; // 0-15 years
  usedVehicleOdometer?: number; // Total kilometers driven by the used vehicle before purchase
  ownershipDuration: number; // 1-15 years
  inputs: UserInputs;
}

export interface KmDepreciationAnalysis {
  expectedKm: number;
  actualKm: number;
  condition: 'Low Usage' | 'Normal' | 'High Usage' | 'Excessive Usage';
  conditionPercentage: number; // e.g. -0.15 for -15%
  baseValue: number; // Value purely based on age
  ageDepreciation: number; // Depreciation due to age
  kmAdjustment: number; // Price offset based on KM ratio (positive or negative)
  wearAdjustment: number; // Extra physical wear & replacement risk adjustment
  marketDemandAdjustment: number; // Brand/category demand adjustment (+/-)
  adjustedValue: number; // Final calculated used vehicle price
  
  // Extra wear metrics (expressed in percentages/risk scores)
  reliabilityReduction: number; // points/percent reduction
  maintenanceRiskIncrease: number; // risk score boost
  engineWearPercent: number; // estimated physical engine health wear
  batteryDegradationPercent: number; // EV battery health degradation
  suspensionWearPercent: number; // suspension life degradation
  breakdownProbabilityPercent: number; // likelihood of unexpected repairs
}

export interface DetailedYearCost {
  year: number;
  fuelElectricityCost: number;
  maintenanceCost: number;
  insuranceCost: number;
  emiPaid: number;
  depreciation: number;
  parkingTollCost: number;
  miscellaneousCost: number; // breakdown, PUC, unexpected repairs, tire/battery replacements
  totalCost: number;
  resaleValue: number;
}

export interface CostEngineOutputs {
  purchasePrice: number; // final on-road price
  registrationCharges: number;
  totalEmi: number;
  totalInterest: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  totalInsuranceCost: number;
  totalDepreciation: number;
  expectedResaleValue: number;
  totalParkingTollCost: number;
  totalMiscCost: number; // batteries, tires, repairs, PUC
  
  // Cumulative TCO
  totalTCO: number;
  monthlyTCO: number;
  costPerKm: number;
  
  // Detailed Year-by-Year Tracker
  yearlyBreakdown: DetailedYearCost[];
  
  // Kilometer Analysis Results
  kmDepreciationDetails?: KmDepreciationAnalysis;
}

export interface CalculatedReport {
  id: string; // unique ID
  title: string;
  createdAt: string;
  scenario: ComparisonScenario;
  newOutputs: CostEngineOutputs;
  usedOutputs: CostEngineOutputs;
  verdicts: {
    financialVerdict: string;
    financialRecommendation: 'NEW' | 'USED' | 'TIE';
    reliabilityVerdict: string;
    maintenanceRiskVerdict: string;
    usedConfidenceScore: number; // 0-100%
    overallVerdict: string;
  };
}
