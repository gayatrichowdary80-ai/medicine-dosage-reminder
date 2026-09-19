import React, { useState } from 'react';
import { 
  Calculator, 
  Scale, 
  AlertTriangle, 
  ShieldAlert, 
  HelpCircle, 
  RotateCcw, 
  CheckCircle, 
  Info,
  ArrowRight
} from 'lucide-react';

export const DosageCalculator: React.FC = () => {
  const [activeCalculator, setActiveCalculator] = useState<'basic' | 'weight'>('basic');

  // Calculator 1: Basic Dose Calculation
  // Amount to administer = (Required dose / Available dose) * Available quantity
  const [requiredDose, setRequiredDose] = useState<string>('250');
  const [availableDose, setAvailableDose] = useState<string>('500');
  const [availableQuantity, setAvailableQuantity] = useState<string>('1');
  const [doseUnit, setDoseUnit] = useState<string>('mg');
  const [quantityUnit, setQuantityUnit] = useState<string>('tablet');

  // Calculator 2: Weight-Based Calculation
  // Total Daily Dose = Weight (kg) * Prescribed Dose (mg/kg)
  // Dose per administration = Total Daily Dose / Doses per day
  const [weightKg, setWeightKg] = useState<string>('20');
  const [dosePerKg, setDosePerKg] = useState<string>('15');
  const [dosesPerDay, setDosesPerDay] = useState<string>('3');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  // Reset helpers
  const handleResetBasic = () => {
    setRequiredDose('');
    setAvailableDose('');
    setAvailableQuantity('1');
  };

  const handleResetWeight = () => {
    setWeightKg('');
    setDosePerKg('');
    setDosesPerDay('2');
  };

  // Basic Calculation Math & Validation
  const reqNum = parseFloat(requiredDose);
  const availNum = parseFloat(availableDose);
  const qtyNum = parseFloat(availableQuantity);

  let basicError = '';
  let basicWarning = '';
  let calculatedAdministerAmount: number | null = null;

  if (requiredDose || availableDose || availableQuantity) {
    if (isNaN(reqNum) || reqNum <= 0) {
      basicError = 'Required dose must be a valid number greater than 0.';
    } else if (isNaN(availNum) || availNum <= 0) {
      basicError = 'Available on-hand dose must be greater than 0.';
    } else if (isNaN(qtyNum) || qtyNum <= 0) {
      basicError = 'Available quantity must be greater than 0.';
    } else {
      calculatedAdministerAmount = (reqNum / availNum) * qtyNum;

      // Check unusual ratios
      const ratio = reqNum / availNum;
      if (ratio > 5) {
        basicWarning =
          'Caution: Calculated administration amount is more than 5x standard package unit. Please double check prescription order and package concentration.';
      } else if (ratio < 0.1) {
        basicWarning =
          'Caution: Required dose is less than 10% of on-hand strength. Splitting micro-doses may result in inaccurate delivery.';
      }
    }
  }

  // Weight-based Calculation Math & Validation
  const rawWeight = parseFloat(weightKg);
  const effectiveWeightKg = weightUnit === 'lbs' ? rawWeight * 0.453592 : rawWeight;
  const dosePerKgNum = parseFloat(dosePerKg);
  const dosesPerDayNum = parseInt(dosesPerDay, 10);

  let weightError = '';
  let weightWarning = '';
  let calculatedTotalDailyDose: number | null = null;
  let calculatedSingleDose: number | null = null;

  if (weightKg || dosePerKg || dosesPerDay) {
    if (isNaN(rawWeight) || rawWeight <= 0) {
      weightError = 'Patient weight must be a positive number greater than 0.';
    } else if (isNaN(dosePerKgNum) || dosePerKgNum <= 0) {
      weightError = 'Prescribed dose per kg must be greater than 0.';
    } else if (isNaN(dosesPerDayNum) || dosesPerDayNum < 1 || dosesPerDayNum > 12) {
      weightError = 'Number of doses per day must be between 1 and 12.';
    } else {
      calculatedTotalDailyDose = effectiveWeightKg * dosePerKgNum;
      calculatedSingleDose = calculatedTotalDailyDose / dosesPerDayNum;

      // Clinical warnings for unusual values
      if (effectiveWeightKg < 2.5) {
        weightWarning =
          'Neonate / extreme low weight detected (< 2.5 kg). Pediatric and neonatal dosing requires specialized hospital micro-measurement and attending physician guidance.';
      } else if (effectiveWeightKg > 200) {
        weightWarning =
          'Weight exceeds 200 kg. High-weight dosing often requires adjusted ideal body weight (IBW) capping rather than actual weight.';
      } else if (dosePerKgNum > 100) {
        weightWarning =
          'Dose per kg is unusually high (> 100 mg/kg). Verify if this is mg/kg/day or single administration.';
      }
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
          Clinical Dosage Verification Calculator
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Precision mathematical formulas for healthcare calculations and nurse-order cross checking.
        </p>
      </div>

      {/* Critical Mandatory Safety Banner */}
      <div className="rounded-2xl border-2 border-amber-300 dark:border-amber-700/80 bg-gradient-to-br from-amber-50 to-orange-50/40 dark:from-amber-950/40 dark:to-orange-950/20 p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500 text-white flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-2 text-xs sm:text-sm">
            <h4 className="font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide flex items-center gap-2">
              <span>Mandatory Educational & Clinical Safety Notice</span>
            </h4>
            <p className="text-amber-800 dark:text-amber-300 font-semibold leading-relaxed">
              “For educational and calculation assistance only. Always verify medication dosage with a doctor or pharmacist.”
            </p>
            <ul className="list-disc list-inside text-xs text-amber-900/90 dark:text-amber-300/80 space-y-1 pt-1">
              <li>This calculator does not recommend medications or provide clinical prescriptions.</li>
              <li>Calculated values are purely mathematical and never substitute for licensed pharmacist verification.</li>
              <li>Dosage appropriateness depends strictly on patient age, renal/hepatic function, specific drug monograph, and clinical diagnosis.</li>
              <li>Do not calculate doses for controlled substances or emergency resuscitation drugs.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Calculator Tab Switcher */}
      <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-md">
        <button
          id="tab-basic-dose"
          onClick={() => setActiveCalculator('basic')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            activeCalculator === 'basic'
              ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>1. Basic Dose Calculator</span>
        </button>
        <button
          id="tab-weight-dose"
          onClick={() => setActiveCalculator('weight')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            activeCalculator === 'weight'
              ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>2. Weight-Based Calculator</span>
        </button>
      </div>

      {/* Calculator 1: Basic Dose Calculation */}
      {activeCalculator === 'basic' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Inputs Column */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Basic Dose Calculation
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Formula: (Desired / On Hand) × Vehicle
                  </p>
                </div>
              </div>

              <button
                onClick={handleResetBasic}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            {/* Formula display box */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                Formula
              </span>
              <p className="text-xs sm:text-sm font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                Amount to Administer = (Required Dose / Available Dose) × Available Quantity
              </p>
            </div>

            {/* Input: Required Dose */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Required Dose (Doctor's Order) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="calc-required-dose"
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="e.g. 250"
                  value={requiredDose}
                  onChange={(e) => setRequiredDose(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
                <select
                  value={doseUnit}
                  onChange={(e) => setDoseUnit(e.target.value)}
                  className="w-24 px-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 dark:text-white font-medium"
                >
                  <option value="mg">mg</option>
                  <option value="mcg">mcg</option>
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                  <option value="units">units</option>
                </select>
              </div>
            </div>

            {/* Input: Available Dose */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Available Dose (Strength on hand) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="calc-available-dose"
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="e.g. 500"
                  value={availableDose}
                  onChange={(e) => setAvailableDose(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
                <div className="w-24 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold flex items-center justify-center">
                  {doseUnit}
                </div>
              </div>
            </div>

            {/* Input: Available Quantity */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Available Quantity / Vehicle Volume <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="calc-available-qty"
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="e.g. 1"
                  value={availableQuantity}
                  onChange={(e) => setAvailableQuantity(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
                <select
                  value={quantityUnit}
                  onChange={(e) => setQuantityUnit(e.target.value)}
                  className="w-32 px-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 dark:text-white font-medium"
                >
                  <option value="tablet">tablet(s)</option>
                  <option value="capsule">capsule(s)</option>
                  <option value="ml">ml</option>
                  <option value="drops">drop(s)</option>
                  <option value="tsp">tsp (5 ml)</option>
                </select>
              </div>
            </div>

            {/* Validation and Warnings */}
            {basicError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{basicError}</span>
              </div>
            )}

            {basicWarning && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{basicWarning}</span>
              </div>
            )}
          </div>

          {/* Results and Step Breakdown Column */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Calculated Outcome
              </h4>

              {calculatedAdministerAmount !== null && !basicError ? (
                <div className="mt-4 p-5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-center animate-fadeIn">
                  <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                    Amount to Administer
                  </span>
                  <div className="mt-2 text-4xl font-extrabold text-teal-900 dark:text-teal-100 font-heading">
                    {calculatedAdministerAmount % 1 === 0
                      ? calculatedAdministerAmount
                      : calculatedAdministerAmount.toFixed(2)}
                  </div>
                  <span className="mt-1 inline-block text-sm font-bold text-teal-800 dark:text-teal-300">
                    {quantityUnit}
                    {calculatedAdministerAmount !== 1 && !quantityUnit.endsWith('s')
                      ? 's'
                      : ''}
                  </span>
                </div>
              ) : (
                <div className="mt-4 p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-slate-400 text-xs">
                  Enter required dose, available strength, and volume to see administration calculation.
                </div>
              )}

              {/* Step-by-Step Calculation Breakdown */}
              {calculatedAdministerAmount !== null && !basicError && (
                <div className="mt-5 space-y-3">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Step-by-Step Calculation Steps
                  </h5>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-mono">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
                      <span className="text-teal-600 dark:text-teal-400 font-bold">Step 1: </span>
                      Ratio = {reqNum} {doseUnit} ÷ {availNum} {doseUnit} = {(reqNum / availNum).toFixed(3)}
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
                      <span className="text-teal-600 dark:text-teal-400 font-bold">Step 2: </span>
                      Multiply by volume: {(reqNum / availNum).toFixed(3)} × {qtyNum} {quantityUnit}
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 font-bold text-emerald-800 dark:text-emerald-300">
                      <span>Result: </span>
                      {calculatedAdministerAmount % 1 === 0
                        ? calculatedAdministerAmount
                        : calculatedAdministerAmount.toFixed(2)}{' '}
                      {quantityUnit}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
              <Info className="w-4 h-4 flex-shrink-0 text-slate-400 mt-0.5" />
              <span>
                Standard nursing math check: If liquid dose exceeds 15 ml or tablets exceed 3 units, double check the order with a second clinician.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Calculator 2: Weight-Based Calculation */}
      {activeCalculator === 'weight' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Inputs Column */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Weight-Based Dose Calculator
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Formula: Weight (kg) × Dose (mg/kg) ÷ Doses/day
                  </p>
                </div>
              </div>

              <button
                onClick={handleResetWeight}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            {/* Formula display box */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs sm:text-sm font-mono space-y-1">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block font-sans">
                  Formulas
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Total Daily Dose = Patient Weight (kg) × Prescribed Dose (mg/kg)
                </span>
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                Dose per Administration = Total Daily Dose ÷ Number of Doses per Day
              </div>
            </div>

            {/* Input: Patient Weight */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Patient Weight <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setWeightUnit('kg')}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      weightUnit === 'kg'
                        ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-2xs'
                        : 'text-slate-500'
                    }`}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeightUnit('lbs')}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      weightUnit === 'lbs'
                        ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-2xs'
                        : 'text-slate-500'
                    }`}
                  >
                    lbs
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  id="calc-patient-weight"
                  type="number"
                  step="any"
                  min="0.1"
                  placeholder={weightUnit === 'kg' ? 'e.g. 20' : 'e.g. 44'}
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  {weightUnit}
                  {weightUnit === 'lbs' && rawWeight > 0 && (
                    <span className="ml-1 text-slate-500">
                      (≈ {effectiveWeightKg.toFixed(1)} kg)
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Input: Prescribed Dose per kg */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Prescribed Dose (mg / kg) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="calc-dose-per-kg"
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="e.g. 15"
                  value={dosePerKg}
                  onChange={(e) => setDosePerKg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  mg / kg / day
                </span>
              </div>
            </div>

            {/* Input: Doses per Day */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Number of Doses per Day (Divided doses) <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setDosesPerDay(num.toString())}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      dosesPerDay === num.toString()
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {num} {num === 1 ? 'dose' : 'doses'}
                  </button>
                ))}
              </div>
            </div>

            {/* Validation & Warnings */}
            {weightError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{weightError}</span>
              </div>
            )}

            {weightWarning && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{weightWarning}</span>
              </div>
            )}

            {/* Specific Pediatric Warning Notice */}
            <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs text-sky-800 dark:text-sky-200">
              <span className="font-bold">Pediatric Advisory: </span>
              In pediatric patients, physiological maturity, organ clearance, and maximum daily adult dose ceilings must always be cross-referenced with official pediatric formulary guidelines.
            </div>
          </div>

          {/* Results and Step Breakdown Column */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Calculated Outcome
              </h4>

              {calculatedTotalDailyDose !== null && calculatedSingleDose !== null && !weightError ? (
                <div className="mt-4 space-y-3 animate-fadeIn">
                  {/* Dose per administration */}
                  <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-center">
                    <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                      Dose per Administration ({dosesPerDayNum}x daily)
                    </span>
                    <div className="mt-1 text-3xl font-extrabold text-teal-900 dark:text-teal-100 font-heading">
                      {calculatedSingleDose % 1 === 0
                        ? calculatedSingleDose
                        : calculatedSingleDose.toFixed(2)}{' '}
                      <span className="text-base font-bold text-teal-700 dark:text-teal-300">mg</span>
                    </div>
                  </div>

                  {/* Total Daily Dose */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      Total Daily Dose:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                      {calculatedTotalDailyDose % 1 === 0
                        ? calculatedTotalDailyDose
                        : calculatedTotalDailyDose.toFixed(2)}{' '}
                      mg / day
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-slate-400 text-xs">
                  Enter patient weight, mg/kg dose, and daily frequency to calculate exact administration and total daily amounts.
                </div>
              )}

              {/* Step-by-step breakdown */}
              {calculatedTotalDailyDose !== null && calculatedSingleDose !== null && !weightError && (
                <div className="mt-5 space-y-3">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Step-by-Step Breakdown
                  </h5>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-mono">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
                      <span className="text-teal-600 dark:text-teal-400 font-bold">1. Total Daily Dose: </span>
                      {effectiveWeightKg.toFixed(2)} kg × {dosePerKgNum} mg/kg = {calculatedTotalDailyDose.toFixed(2)} mg
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
                      <span className="text-teal-600 dark:text-teal-400 font-bold">2. Divided Admin: </span>
                      {calculatedTotalDailyDose.toFixed(2)} mg ÷ {dosesPerDayNum} times = {calculatedSingleDose.toFixed(2)} mg
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
              <Info className="w-4 h-4 flex-shrink-0 text-slate-400 mt-0.5" />
              <span>
                Always double check against maximum single dose limits (e.g. Paracetamol max 15 mg/kg single or 1000 mg ceiling).
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
