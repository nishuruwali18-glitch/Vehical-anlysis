import { Vehicle, UserInputs, ComparisonScenario, CostEngineOutputs, DetailedYearCost, FuelType, KmDepreciationAnalysis, VehicleType } from '../types';

/**
 * Calculates monthly EMI and total interest for a vehicle purchase.
 */
export function calculateEMI(principal: number, annualRate: number, tenureYears: number) {
  if (principal <= 0 || annualRate <= 0 || tenureYears <= 0) {
    return { monthlyEmi: 0, totalPayment: 0, totalInterest: 0 };
  }
  const r = annualRate / 12 / 100;
  const n = tenureYears * 12;
  const monthlyEmi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = monthlyEmi * n;
  const totalInterest = totalPayment - principal;
  return { monthlyEmi, totalPayment, totalInterest };
}

/**
 * Expected yearly KM benchmarks for different vehicle categories in India.
 */
export function getYearlyKmBenchmark(type: VehicleType): { min: number; max: number; average: number } {
  switch (type) {
    case '2 Wheeler':
      return { min: 8000, max: 12000, average: 10000 };
    case '3 Wheeler':
      return { min: 12000, max: 18000, average: 15000 };
    case '4 Wheeler':
      return { min: 10000, max: 15000, average: 12000 };
    case 'Commercial Vehicle':
      return { min: 25000, max: 60000, average: 40000 };
    default:
      return { min: 10000, max: 15000, average: 12000 };
  }
}

/**
 * Compound age-based baseline depreciation rates.
 */
export function getBaseAgeDepreciationRate(year: number): number {
  if (year === 1) return 0.18; // Year 1: 18%
  if (year <= 5) return 0.10;  // Year 2-5: 10% yearly
  return 0.07;                 // Year 6 onward: 7% yearly
}

/**
 * Fully analyzes a vehicle's kilometers driven against age benchmarks
 * and calculates realistic, multi-factored used values and wear indicators.
 */
export function analyzeKilometerDepreciation(
  vehicle: Vehicle,
  ageYears: number,
  actualKm: number
): KmDepreciationAnalysis {
  const benchmark = getYearlyKmBenchmark(vehicle.type);
  const expectedKm = ageYears * benchmark.average;
  
  // 1. Calculate Age-based Base Market Value
  let baseValue = vehicle.onRoadPrice;
  for (let y = 1; y <= ageYears; y++) {
    const rate = getBaseAgeDepreciationRate(y);
    baseValue *= (1 - rate);
  }
  const ageDepreciation = vehicle.onRoadPrice - baseValue;
  
  // 2. KM Condition Ratio Analysis
  let ratio = 1.0;
  if (ageYears > 0 && expectedKm > 0) {
    ratio = actualKm / expectedKm;
  } else if (ageYears === 0) {
    ratio = 1.0;
  } else {
    ratio = actualKm > 0 ? 1.5 : 1.0;
  }
  
  let condition: 'Low Usage' | 'Normal' | 'High Usage' | 'Excessive Usage' = 'Normal';
  let conditionPercentage = 0; // Positive for high residuals, negative for depreciation hits
  
  if (ratio < 0.85) {
    condition = 'Low Usage';
    // LOW KM: Up to +10% resale boost
    // Direct linear scaling: 0% at ratio=0.85, up to 10% boost at ratio=0
    conditionPercentage = 0.10 * (1.0 - ratio / 0.85);
    conditionPercentage = Math.max(0, Math.min(0.10, conditionPercentage));
  } else if (ratio <= 1.15) {
    condition = 'Normal';
    conditionPercentage = 0;
  } else if (ratio <= 1.5) {
    condition = 'High Usage';
    // HIGH KM: Reduce value by 5%-15%
    // Linear scaling between ratio=1.15 (5% penalty) and ratio=1.5 (15% penalty)
    conditionPercentage = -0.05 - ((ratio - 1.15) / (1.5 - 1.15)) * 0.10;
    conditionPercentage = Math.max(-0.15, Math.min(-0.05, conditionPercentage));
  } else {
    condition = 'Excessive Usage';
    // VERY HIGH KM: Reduce value by 15%-30%
    // Linear scaling between ratio=1.5 (15% penalty) and ratio=3.0 (30% penalty)
    conditionPercentage = -0.15 - ((ratio - 1.5) / (3.0 - 1.5)) * 0.15;
    conditionPercentage = Math.max(-0.30, Math.min(-0.15, conditionPercentage));
  }
  
  // KM-Based Depreciation
  const kmAdjustment = baseValue * conditionPercentage;
  
  // 3. Extra Wear Factors
  const isEv = vehicle.fuelType === 'EV';
  
  // Engine wear estimation (0% for EV since there is no reciprocating engine)
  let engineWearPercent = 0;
  if (!isEv) {
    const expectedAccumulatedKmForVehicleLife = 160000;
    engineWearPercent = Math.min(100, Math.round((actualKm / expectedAccumulatedKmForVehicleLife) * 100));
  }
  
  // Battery degradation analysis
  let batteryDegradationPercent = 0;
  if (isEv) {
    // High KM increases battery degradation estimate
    const degradationByKm = (actualKm / 180000) * 20; // 20% standard capacity loss at 1.8L KM
    const degradationByAge = ageYears * 1.5; // calendar shelf life aging
    batteryDegradationPercent = Math.min(95, Math.round(degradationByKm + degradationByAge));
  } else {
    // 12V Lead-Acid starting battery wear (regenerates but decays every 4 years)
    batteryDegradationPercent = Math.min(100, Math.round(((ageYears % 4) / 4) * 100));
  }
  
  // Suspension life wear (benchmark 90,000 KM life on Indian city roads)
  const suspensionWearPercent = Math.min(100, Math.round((actualKm / 90000) * 100));
  
  // Reliability score & maintenance risk impacts
  let reliabilityReduction = 0;
  let maintenanceRiskIncrease = 0;
  if (ratio > 1.0) {
    reliabilityReduction = Number(((ratio - 1.0) * 1.5).toFixed(1));
    maintenanceRiskIncrease = Number(((ratio - 1.0) * 2.0).toFixed(1));
  }
  
  // Breakdown Probability percentage
  const baseBreakdownProb = Math.min(85, ageYears * 4.5);
  const kmWearMultiplier = ratio > 1.0 ? 1.0 + (ratio - 1.0) * 0.6 : Math.max(0.4, ratio);
  const breakdownProbabilityPercent = Math.min(99, Math.round(baseBreakdownProb * kmWearMultiplier));
  
  // Monetizing Physical/Wear impacts as a "Condition/Wear Adjustment"
  let wearAdjustment = 0;
  if (ratio > 1.15) {
    // High KM vehicles carry near-term overhaul costs: tires, dampers, exhaust
    const wearRate = 0.02 + Math.min(0.08, (ratio - 1.15) * 0.04);
    wearAdjustment = -1 * baseValue * wearRate;
  } else if (ratio < 0.85 && ageYears > 0) {
    // Premium mechanical health score
    wearAdjustment = baseValue * 0.03 * (1.0 - ratio);
  }
  
  // 4. Market Demand Adjustments
  let marketDemandAdjustment = 0;
  if (vehicle.brand === 'Toyota' || vehicle.brand === 'Maruti Suzuki') {
    marketDemandAdjustment += baseValue * 0.06; // Strong demand in Indian used markets
  }
  if (vehicle.category === 'Luxury' || vehicle.category === 'Premium') {
    marketDemandAdjustment -= baseValue * 0.05; // Fast-depreciating executive segments
  }
  if (vehicle.discontinuedYear) {
    marketDemandAdjustment -= baseValue * 0.08; // Maintenance anxiety penalty
  }
  
  // 5. Final Combined Valuation Price Formula
  let adjustedValue = baseValue + kmAdjustment + wearAdjustment + marketDemandAdjustment;
  
  // Safe boundary check (never value a runic shell lower than 6% scrap metal value)
  const minSalvage = vehicle.onRoadPrice * 0.06;
  if (adjustedValue < minSalvage) {
    adjustedValue = minSalvage;
  }
  
  return {
    expectedKm: Math.round(expectedKm),
    actualKm: Math.round(actualKm),
    condition,
    conditionPercentage: Number(conditionPercentage.toFixed(3)),
    baseValue: Math.round(baseValue),
    ageDepreciation: Math.round(ageDepreciation),
    kmAdjustment: Math.round(kmAdjustment),
    wearAdjustment: Math.round(wearAdjustment),
    marketDemandAdjustment: Math.round(marketDemandAdjustment),
    adjustedValue: Math.round(adjustedValue),
    reliabilityReduction,
    maintenanceRiskIncrease,
    engineWearPercent,
    batteryDegradationPercent,
    suspensionWearPercent,
    breakdownProbabilityPercent,
  };
}

/**
 * Estimates the purchase price of a used vehicle today based on its age, miles driven, and model-specific benchmarks.
 */
export function estimateUsedVehiclePurchasePrice(
  vehicle: Vehicle,
  ageYears: number,
  odometerKM?: number
): { base: number; min: number; max: number; analysis: KmDepreciationAnalysis } {
  const benchmark = getYearlyKmBenchmark(vehicle.type);
  const actualKm = odometerKM ?? (ageYears * benchmark.average);
  
  const analysis = analyzeKilometerDepreciation(vehicle, ageYears, actualKm);
  
  // Margin of uncertainty (used car markets are highly variable across India)
  const rangeMultiplier = 0.10 + (ageYears * 0.01); // 10% to 25% uncertainty depending on age
  const min = Math.max(vehicle.onRoadPrice * 0.06, analysis.adjustedValue * (1 - rangeMultiplier));
  const max = Math.max(vehicle.onRoadPrice * 0.09, analysis.adjustedValue * (1 + rangeMultiplier));
  const base = Math.max(vehicle.onRoadPrice * 0.08, analysis.adjustedValue);

  return { 
    base: Math.round(base), 
    min: Math.round(min), 
    max: Math.round(max),
    analysis
  };
}

/**
 * Generates the full true cost of ownership (TCO) report.
 */
export function calculateVehicleTCO(
  vehicle: Vehicle,
  isNew: boolean,
  usedVehicleAge: number, // 0 if new
  usedVehicleOdometer: number, // actual starting KM of pre-owned
  ownershipDuration: number,
  inputs: UserInputs
): CostEngineOutputs {
  const yearlyBreakdown: DetailedYearCost[] = [];
  
  // Determine immediate purchase value
  let purchasePrice = vehicle.onRoadPrice;
  let registrationCharges = vehicle.onRoadPrice * 0.10; // Included in on-road normally, but for reference
  
  let initialKmAnalysis: KmDepreciationAnalysis | undefined = undefined;
  
  if (!isNew) {
    const estimates = estimateUsedVehiclePurchasePrice(vehicle, usedVehicleAge, usedVehicleOdometer);
    purchasePrice = estimates.base;
    registrationCharges = purchasePrice * 0.03; // transferring charges in India
    initialKmAnalysis = estimates.analysis;
  } else {
    // Initial analysis for a new vehicle has 0 age and 0 km
    initialKmAnalysis = analyzeKilometerDepreciation(vehicle, 0, 0);
  }

  // Finance calculations
  const downPayment = isNew ? inputs.newDownPayment : inputs.usedDownPayment;
  const loanTenure = isNew ? inputs.newLoanTenure : inputs.usedLoanTenure;
  const loanInterest = isNew ? inputs.newLoanInterest : inputs.usedLoanInterest;

  const actualPrincipal = Math.max(0, purchasePrice - downPayment);
  const emiOutput = calculateEMI(actualPrincipal, loanInterest, loanTenure);
  
  // Totals trackers
  let totalFuelCost = 0;
  let totalMaintenanceCost = 0;
  let totalInsuranceCost = 0;
  let totalParkingTollCost = 0;
  let totalMiscCost = 0;
  let totalDepreciation = 0;

  let currentVehicleValue = purchasePrice;
  let accumulatedKm = 0;
  const startingOdometer = isNew ? 0 : usedVehicleOdometer;

  // Yearly simulation
  for (let year = 1; year <= ownershipDuration; year++) {
    const elapsedVehicleAge = isNew ? year : usedVehicleAge + year;
    
    // 1. Fuel / Electricity Cost with inflation
    const dynamicFuelPrice = inputs.fuelPrice * Math.pow(1 + inputs.fuelInflation / 100, year - 1);
    const dynamicElectricityRate = inputs.electricityRate * Math.pow(1 + inputs.fuelInflation / 100, year - 1);
    
    let annualFuelElecCost = 0;
    if (vehicle.fuelType === 'EV') {
      // Mileage is in km/kWh. Electricity needed = total_km / mileage
      // Add a battery degradation charging penalty (older batteries are less efficient)
      let efficiencyLoss = 1.0;
      if (elapsedVehicleAge > 4) {
        efficiencyLoss = 1.0 + Math.min(0.25, (elapsedVehicleAge - 4) * 0.03);
      }
      const energyRequired = (inputs.annualKilometers / vehicle.mileage) * efficiencyLoss;
      annualFuelElecCost = energyRequired * dynamicElectricityRate;
    } else {
      // Mileage is in km/L (or km/kg for CNG)
      // Driving style penalty
      let styleMultiplier = 1.0;
      if (inputs.drivingStyle === 'Aggressive') {
        styleMultiplier = 1.2;
      } else if (inputs.drivingStyle === 'City Stop-and-Go') {
        styleMultiplier = 1.15;
      } else if (inputs.drivingStyle === 'Highway Cruiser') {
        styleMultiplier = 0.90;
      }
      const fuelRequired = (inputs.annualKilometers / (vehicle.mileage * (2 - styleMultiplier)));
      annualFuelElecCost = fuelRequired * dynamicFuelPrice;
    }
    
    // 2. Base Maintenance with inflation
    // Higher age means higher baseline maintenance
    let baseMaintenanceRate = 0;
    if (vehicle.type === '2 Wheeler') {
      baseMaintenanceRate = isNew ? 2500 : 4000;
    } else if (vehicle.type === '3 Wheeler') {
      baseMaintenanceRate = isNew ? 6000 : 10000;
    } else if (vehicle.type === '4 Wheeler') {
      baseMaintenanceRate = isNew ? 8000 : 14000;
      if (vehicle.category === 'Premium') baseMaintenanceRate *= 1.8;
      if (vehicle.category === 'Luxury') baseMaintenanceRate *= 3.0;
    } else { // commercial
      baseMaintenanceRate = isNew ? 12000 : 22000;
    }

    // Modifier for brand reliability
    baseMaintenanceRate = baseMaintenanceRate * (1 + (10 - vehicle.reliabilityScore) * 0.06);

    // Apply year-by-year wear factor and inflation
    const yearWearFactor = 1.0 + (elapsedVehicleAge * 0.08);
    let annualMaintenance = baseMaintenanceRate * yearWearFactor * Math.pow(1 + inputs.serviceInflation / 100, year - 1);

    // EV maintenance is generally 40% lower (no engine oil, fewer moving parts)
    if (vehicle.fuelType === 'EV') {
      annualMaintenance *= 0.60;
    }

    // 3. Periodic Parts Replacement (Tires, Brakes, Battery)
    accumulatedKm += inputs.annualKilometers;
    let partsReplacementCost = 0;

    // Standard 12V Battery replacement every 4 years
    if (year % 4 === 0) {
      partsReplacementCost += vehicle.type === '2 Wheeler' ? 1500 : vehicle.type === '3 Wheeler' ? 3000 : 6000;
    }

    // Tires (Every 40,000 km)
    const tireCycles = Math.floor(accumulatedKm / 40000) - Math.floor((accumulatedKm - inputs.annualKilometers) / 40000);
    if (tireCycles > 0) {
      let tireSetCost = 0;
      if (vehicle.type === '2 Wheeler') tireSetCost = 4000;
      else if (vehicle.type === '3 Wheeler') tireSetCost = 6000;
      else if (vehicle.type === '4 Wheeler') {
        tireSetCost = vehicle.category === 'Budget' ? 16000 : vehicle.category === 'Executive' ? 24000 : 45000;
      } else { // Commercial
        tireSetCost = 30000;
      }
      partsReplacementCost += tireSetCost * tireCycles;
    }

    // Brakes / Brake pads (Every 25,000 km)
    const brakeCycles = Math.floor(accumulatedKm / 25000) - Math.floor((accumulatedKm - inputs.annualKilometers) / 25000);
    if (brakeCycles > 0) {
      let brakeCost = 0;
      if (vehicle.type === '2 Wheeler') brakeCost = 800;
      else if (vehicle.type === '3 Wheeler') brakeCost = 1500;
      else if (vehicle.type === '4 Wheeler') {
        brakeCost = vehicle.category === 'Budget' ? 3500 : vehicle.category === 'Executive' ? 6000 : 15000;
      } else {
        brakeCost = 10000;
      }
      partsReplacementCost += brakeCost * brakeCycles;
    }

    // EV main traction battery replacement risk
    // If the EV is older than 8 years, or battery reaches 1,60,000 km, there's a risk of replacement
    if (vehicle.fuelType === 'EV' && vehicle.batteryCapacity) {
      const batteryEndofLife = elapsedVehicleAge >= 8 || accumulatedKm >= 140000;
      if (batteryEndofLife) {
        // Amortized battery replacement cost as an annual risk factor
        const actualReplacementValue = vehicle.batteryCapacity * 15000; // ~15k INR per kWh (INR 4.5L for 30kWh)
        partsReplacementCost += actualReplacementValue * 0.15; // 15% annual risk premium
      }
    }

    // 4. Unexpected Repairs & Breakdown Risk
    // Older cars have significantly higher unexpected failure risk
    let unexpectedRepairCost = 0;
    if (elapsedVehicleAge > 3) {
      const severityIndex = Math.pow(elapsedVehicleAge - 3, 1.3);
      const categoryRisk = vehicle.category === 'Luxury' ? 6000 : vehicle.category === 'Premium' ? 3500 : 1200;
      // Scaled by reliability score
      const reliabilityMultiplier = (11 - vehicle.reliabilityScore) / 5;
      unexpectedRepairCost = severityIndex * categoryRisk * reliabilityMultiplier;
    }

    // 5. Pollution certificates (PUC) & Mandatory standard checks
    const pucCost = vehicle.fuelType === 'EV' ? 0 : (vehicle.type === '2 Wheeler' ? 200 : 400); 

    // 6. Insurance with dynamic age-related NCB (No Claim Bonus)
    let annualInsurance = vehicle.insuranceEstimate;
    if (inputs.insuranceType === 'Third Party') {
      annualInsurance *= 0.40; // third party is much cheaper
    } else if (inputs.insuranceType === 'Zero Depreciation') {
      annualInsurance *= 1.30; // brand new zero dep is premium
    }
    
    const idvDepreciationMultiplier = Math.max(0.35, Math.pow(0.88, elapsedVehicleAge));
    annualInsurance = annualInsurance * idvDepreciationMultiplier;

    // 7. Parking and Tolls with inflation
    const annualParkingToll = (inputs.parkingCosts + inputs.tollUsage) * 12 * Math.pow(1.05, year - 1);

    // 8. EMI / Financing costs
    const annualEmiPaid = year <= loanTenure ? emiOutput.monthlyEmi * 12 : 0;

    // 9. Depreciation of asset value (used for resale calculations)
    // Runs on the unified kilometer-and-age-based valuation engine
    const totalKmAtYearEnd = startingOdometer + accumulatedKm;
    const previousValue = currentVehicleValue;
    const analysisForResale = analyzeKilometerDepreciation(vehicle, elapsedVehicleAge, totalKmAtYearEnd);
    currentVehicleValue = analysisForResale.adjustedValue;
    const annualDepreciation = Math.max(0, previousValue - currentVehicleValue);

    // Consolidate Year Cost
    const finalMisc = partsReplacementCost + unexpectedRepairCost + pucCost;
    const yearTotalCost =
      annualFuelElecCost +
      annualMaintenance +
      annualInsurance +
      annualEmiPaid +
      annualParkingToll +
      finalMisc;

    yearlyBreakdown.push({
      year,
      fuelElectricityCost: Math.round(annualFuelElecCost),
      maintenanceCost: Math.round(annualMaintenance),
      insuranceCost: Math.round(annualInsurance),
      emiPaid: Math.round(annualEmiPaid),
      depreciation: Math.round(annualDepreciation),
      parkingTollCost: Math.round(annualParkingToll),
      miscellaneousCost: Math.round(finalMisc),
      totalCost: Math.round(yearTotalCost),
      resaleValue: Math.round(currentVehicleValue)
    });

    // Accumulate
    totalFuelCost += annualFuelElecCost;
    totalMaintenanceCost += annualMaintenance;
    totalInsuranceCost += annualInsurance;
    totalParkingTollCost += annualParkingToll;
    totalMiscCost += finalMisc;
    totalDepreciation += annualDepreciation;
  }

  // Calculate final metrics
  const totalEmisPaid = emiOutput.monthlyEmi * 12 * Math.min(loanTenure, ownershipDuration);
  const totalOperatingCost = totalFuelCost + totalMaintenanceCost + totalInsuranceCost + totalParkingTollCost + totalMiscCost;
  
  const totalTCO = (downPayment + registrationCharges + totalEmisPaid + totalOperatingCost) - currentVehicleValue;
  const monthlyTCO = totalTCO / (ownershipDuration * 12);
  const totalKmTravelled = inputs.annualKilometers * ownershipDuration;
  const costPerKm = totalKmTravelled > 0 ? totalTCO / totalKmTravelled : 0;

  return {
    purchasePrice: Math.round(purchasePrice),
    registrationCharges: Math.round(registrationCharges),
    totalEmi: Math.round(totalEmisPaid),
    totalInterest: Math.round(emiOutput.totalInterest),
    totalFuelCost: Math.round(totalFuelCost),
    totalMaintenanceCost: Math.round(totalMaintenanceCost),
    totalInsuranceCost: Math.round(totalInsuranceCost),
    totalDepreciation: Math.round(totalDepreciation),
    expectedResaleValue: Math.round(currentVehicleValue),
    totalParkingTollCost: Math.round(totalParkingTollCost),
    totalMiscCost: Math.round(totalMiscCost),
    totalTCO: Math.round(totalTCO),
    monthlyTCO: Math.round(monthlyTCO),
    costPerKm: Number(costPerKm.toFixed(2)),
    yearlyBreakdown,
    kmDepreciationDetails: initialKmAnalysis
  };
}

/**
 * Generates textual assessments, reliability indicators, and structural scores.
 */
export function generateVerdicts(
  scenario: ComparisonScenario,
  newOut: CostEngineOutputs,
  usedOut: CostEngineOutputs
) {
  const years = scenario.ownershipDuration;
  const costDiff = usedOut.totalTCO - newOut.totalTCO;
  const costDiffAbs = Math.abs(costDiff);
  
  // Financial Verdict logic
  let financialVerdict = '';
  let financialRecommendation: 'NEW' | 'USED' | 'TIE' = 'TIE';
  
  const formattedDiff = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(costDiffAbs);

  if (costDiff > 30000) {
    financialRecommendation = 'NEW';
    financialVerdict = `Buying NEW saves approximately ${formattedDiff} over ${years} years compared to the used asset due to better fuel efficiency, lower maintenance costs, and stronger residual value.`;
  } else if (costDiff < -30000) {
    financialRecommendation = 'USED';
    financialVerdict = `Buying USED saves approximately ${formattedDiff} over ${years} years, avoiding the massive initial 18%+ new car depreciation hit.`;
  } else {
    financialRecommendation = 'TIE';
    financialVerdict = `The total cost of ownership is neck-and-neck (difference is less than ₹30,000). Your choice depends purely on preference for newer features vs lower initial loan debt.`;
  }

  // Reliability Verdict
  const newReliability = scenario.newVehicle.reliabilityScore;
  const usedReliability = scenario.usedVehicle.reliabilityScore;
  let reliabilityVerdict = '';
  
  if (scenario.usedVehicleAge > 7) {
    reliabilityVerdict = `CRITICAL ASSESS: The used vehicle is ${scenario.usedVehicleAge} years old. Expect frequent component failures (worn alternator, suspension bushings, and cooling line updates) with a low reliability rating of ${usedReliability}/10.`;
  } else if (scenario.usedVehicleAge > 4) {
    reliabilityVerdict = `MODERATE RISK: At ${scenario.usedVehicleAge} years of age, standard elements like timing belts and clutch elements will require active maintenance, but remains manageable. Used vehicle reliability score: ${usedReliability}/10.`;
  } else {
    reliabilityVerdict = `EXCELLENT HEALTH: At just ${scenario.usedVehicleAge} years old, the used option still behaves similar to new, maintaining a high reliability rating.`;
  }

  // Kilometer usage diagnostic additions
  if (usedOut.kmDepreciationDetails) {
    const details = usedOut.kmDepreciationDetails;
    if (details.condition === 'Excessive Usage') {
      reliabilityVerdict += ` CRITICAL KM WARNING: This used vehicle has excessive usage (${details.actualKm.toLocaleString('en-IN')} KM vs average benchmark of ${details.expectedKm.toLocaleString('en-IN')} KM). Estimated engine/battery wear is critical (${details.engineWearPercent || details.batteryDegradationPercent}%), creating peak breakdown risks.`;
    } else if (details.condition === 'High Usage') {
      reliabilityVerdict += ` HIGH KM ADVICE: Above-average mileage (${details.actualKm.toLocaleString('en-IN')} KM) targets early suspension wear (${details.suspensionWearPercent}%) and wear-out events.`;
    } else if (details.condition === 'Low Usage') {
      reliabilityVerdict += ` LOW KM PREMIUM: Outstandingly low pre-owned mileage (${details.actualKm.toLocaleString('en-IN')} KM vs benchmark ${details.expectedKm.toLocaleString('en-IN')} KM) represents prime mechanical integrity.`;
    }
  }

  // Maintenance risk verdict
  let maintenanceRiskVerdict = '';
  if (scenario.usedVehicle.fuelType === 'EV') {
    const batteryRiskAge = (scenario.usedVehicleAge + years) >= 8;
    maintenanceRiskVerdict = batteryRiskAge 
      ? `EV BATTERY ALERT: The used EV will exceed 8 years of age during your ownership. An eventual traction battery replacement represents a high financial risk (estimated replacement up to ₹${Math.round((scenario.usedVehicle.batteryCapacity || 0) * 15000)}).`
      : `EV STABILITY: Low mechanical parts count. High probability the lithium battery remains within its 8-year warrantied lifespan.`;
  } else {
    const totalAge = scenario.usedVehicleAge + years;
    if (totalAge > 10 && scenario.usedVehicle.fuelType === 'Diesel') {
      maintenanceRiskVerdict = `DIESEL REGULATORY HAZARD: Diesel vehicles face strict registration bans after 10 years in critical regions (e.g., Delhi NCR), rendering the vehicle asset potentially untransferable or highly depreciated.`;
    } else if (totalAge > 8) {
      maintenanceRiskVerdict = `HIGH AGE WEAR: Expect complete engine overhaul, brake rotors, and exhaust elements wear as total age reaches ${totalAge} years.`;
    } else {
      maintenanceRiskVerdict = `STANDARD MAINTENANCE: Routine fluid flushes and brake pad service represent the majority of expenses.`;
    }
  }

  // Used Vehicle Confidence Score (0% - 100%)
  // High score = reliable brand, low age, active service history assumptions, high initial reliability
  let confidenceScore = 90;
  confidenceScore -= scenario.usedVehicleAge * 5; // -5% for each year
  confidenceScore += usedReliability * 2; // +score
  if (scenario.usedVehicle.discontinuedYear) confidenceScore -= 15; // penalty for discontinued
  if (scenario.usedVehicle.fuelType === 'EV') confidenceScore -= 8; // battery degradation caution
  
  // Apply kilometer-based reliability penalties / risk overrides
  if (usedOut.kmDepreciationDetails) {
    const details = usedOut.kmDepreciationDetails;
    confidenceScore -= Math.round(details.reliabilityReduction * 4.5);
    confidenceScore -= Math.round(details.maintenanceRiskIncrease * 3.5);
    if (details.condition === 'Low Usage') {
      confidenceScore += 6; // low mileage bonus
    }
  }
  confidenceScore = Math.max(15, Math.min(98, confidenceScore));

  // Overall verdict synthesis
  let overallVerdict = '';
  if (financialRecommendation === 'USED' && confidenceScore > 75) {
    overallVerdict = `The USED option (${scenario.usedVehicle.brand} ${scenario.usedVehicle.model}) is highly recommended. It saves a significant sum of money, has high reliability, and represents a safe purchase with high overall confidence.`;
  } else if (financialRecommendation === 'USED' && confidenceScore <= 55) {
    overallVerdict = `Though the USED option is cheaper on paper, the low confidence score (${confidenceScore}%) and rising age (${scenario.usedVehicleAge} yrs) warn of severe hidden mechanics risks. Opt for the NEW alternative if peace of mind is your priority.`;
  } else if (financialRecommendation === 'NEW') {
    overallVerdict = `The NEW option (${scenario.newVehicle.brand} ${scenario.newVehicle.model}) is the clear winner. The used vehicle's lower purchase cost is completely offset by high servicing overheads, rapid wear, and near-zero residual value in your ownership tenure.`;
  } else {
    overallVerdict = `Both options represent excellent value. If you want hassle-free warranty protection, go NEW. If you want to bypass initial cash layout, go USED.`;
  }

  return {
    financialVerdict,
    financialRecommendation,
    reliabilityVerdict,
    maintenanceRiskVerdict,
    usedConfidenceScore: confidenceScore,
    overallVerdict
  };
}

/**
 * Calculates how many years or kilometers it takes for a new vehicle (typically higher purchase price but cheaper running cost like electric/diesel)
 * to break even with the used counterpart.
 */
export function calculateBreakEven(
  scenario: ComparisonScenario,
  newOut: CostEngineOutputs,
  usedOut: CostEngineOutputs
) {
  const newOutlay = newOut.purchasePrice + newOut.registrationCharges;
  const usedOutlay = usedOut.purchasePrice + usedOut.registrationCharges;
  const upfrontSaving = newOutlay - usedOutlay;

  if (upfrontSaving <= 0) {
    return {
      canBreakEven: false,
      message: 'The new vehicle is actually cheaper or equal to purchase upfront than the used one.'
    };
  }

  // Calculate annual operating savings of New vs Used
  // e.g. New is EV, Used is Petrol. New saves on fuel but costs more upfront.
  const newAnnualOps = (newOut.totalFuelCost + newOut.totalMaintenanceCost) / scenario.ownershipDuration;
  const usedAnnualOps = (usedOut.totalFuelCost + usedOut.totalMaintenanceCost) / scenario.ownershipDuration;
  const annualSaving = usedAnnualOps - newAnnualOps;

  if (annualSaving <= 0) {
    return {
      canBreakEven: false,
      message: `The New vehicle's operating and maintenance expenses are higher or identical to the Used one (₹${Math.round(newAnnualOps)} vs ₹${Math.round(usedAnnualOps)}/yr). You will never break even on the premium purchase price.`
    };
  }

  const breakEvenYears = upfrontSaving / annualSaving;
  return {
    canBreakEven: breakEvenYears <= scenario.ownershipDuration,
    breakEvenYears: Number(breakEvenYears.toFixed(1)),
    annualSaving: Math.round(annualSaving),
    upfrontSaving: Math.round(upfrontSaving),
    message: breakEvenYears <= scenario.ownershipDuration
      ? `You will break even in ${breakEvenYears.toFixed(1)} years, after which the New vehicle becomes cheaper overall due to lower running costs.`
      : `It would take ${breakEvenYears.toFixed(1)} years to recover the premium of ₹${Math.round(upfrontSaving)} paid upfront. Since your ownership is only ${scenario.ownershipDuration} years, you will NOT break even.`
  };
}
