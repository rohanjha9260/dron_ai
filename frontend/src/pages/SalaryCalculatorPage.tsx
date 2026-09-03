import React, { useState } from 'react';
import { 
  DollarSign, 
  Sparkles, 
  PieChart, 
  Building2, 
  MapPin, 
  TrendingUp, 
  ShieldCheck,
  Award,
  Zap
} from 'lucide-react';

export const SalaryCalculatorPage: React.FC = () => {
  const [ctc, setCtc] = useState<number>(2400000); // 24 LPA
  const [basePercentage, setBasePercentage] = useState<number>(65); // 65% base
  const [bonusPercentage, setBonusPercentage] = useState<number>(15); // 15% performance bonus
  const [esopYears, setEsopYears] = useState<number>(4); // 4 year vesting
  const [city, setCity] = useState<'Bangalore' | 'Hyderabad' | 'Gurgaon' | 'Pune' | 'Remote'>('Bangalore');

  const baseSalary = Math.round((ctc * basePercentage) / 100);
  const bonus = Math.round((ctc * bonusPercentage) / 100);
  const totalEsops = ctc - (baseSalary + bonus);
  const annualEsops = Math.round(totalEsops / esopYears);

  // Approximate monthly take home after taxes (New Tax Regime simplified estimate)
  const monthlyGross = Math.round(baseSalary / 12);
  const estimatedTax = Math.round(monthlyGross * 0.15); // ~15% effective tax
  const monthlyInHand = monthlyGross - estimatedTax;

  const cityIndices = {
    Bangalore: { rent: '₹22,000 - ₹35,000/mo', livingIndex: '1.25x' },
    Hyderabad: { rent: '₹16,000 - ₹26,000/mo', livingIndex: '1.05x' },
    Gurgaon: { rent: '₹20,000 - ₹32,000/mo', livingIndex: '1.20x' },
    Pune: { rent: '₹15,000 - ₹24,000/mo', livingIndex: '1.00x' },
    Remote: { rent: 'Home City / Nil', livingIndex: '0.60x' }
  };

  const currentCity = cityIndices[city];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
          Compensation Intelligence
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Tech Salary & Offer Equity Calculator
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Demystify complex tech offer letters. Calculate real monthly take-home salary, ESOP 4-year vesting, performance bonuses, and city cost of living adjustments.
        </p>
      </div>

      {/* Inputs & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Input Sliders (1 Column) */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-5 text-xs">
          <span className="font-bold text-indigo-300 uppercase tracking-wider font-display block">
            Offer Parameters
          </span>

          <div>
            <div className="flex justify-between font-semibold text-slate-300 mb-1">
              <span>Total Announced CTC</span>
              <span className="text-cyan-400 font-mono font-bold">₹{(ctc / 100000).toFixed(1)} LPA</span>
            </div>
            <input
              type="range"
              min="800000"
              max="6000000"
              step="100000"
              value={ctc}
              onChange={(e) => setCtc(parseInt(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-300 mb-1">
              <span>Fixed Base Salary %</span>
              <span className="text-indigo-400 font-mono font-bold">{basePercentage}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="90"
              step="5"
              value={basePercentage}
              onChange={(e) => setBasePercentage(parseInt(e.target.value))}
              className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Target Location</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value as any)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
            >
              <option value="Bangalore">Bangalore (Tech Capital)</option>
              <option value="Hyderabad">Hyderabad (Cyberabad)</option>
              <option value="Gurgaon">Gurgaon / NCR</option>
              <option value="Pune">Pune (Tech Hub)</option>
              <option value="Remote">Remote / Work from Home</option>
            </select>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">City Living Index ({city}):</span>
            <div className="text-white font-bold">{currentCity.rent}</div>
            <span className="text-[11px] text-slate-500">Living Cost Multiplier: {currentCity.livingIndex}</span>
          </div>
        </div>

        {/* Right: Calculated Metrics & Visual Breakdown (2 Columns) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 flex flex-col justify-between">
          
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">Estimated In-Hand</span>
                <h3 className="text-3xl font-extrabold text-white font-display mt-0.5">
                  ₹{(monthlyInHand).toLocaleString('en-IN')}<span className="text-sm text-slate-400 font-sans font-normal"> / month</span>
                </h3>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase font-semibold block">Annual Fixed Base</span>
                <div className="text-2xl font-bold text-cyan-400 font-mono">₹{(baseSalary / 100000).toFixed(2)} LPA</div>
              </div>
            </div>

            {/* CTC Component Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
              
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Guaranteed Base (Yearly)</span>
                <div className="text-lg font-bold font-mono text-white">₹{(baseSalary).toLocaleString('en-IN')}</div>
                <span className="text-[10px] text-slate-500">Subject to standard PF & TDS</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Variable / Perf. Bonus</span>
                <div className="text-lg font-bold font-mono text-amber-400">₹{(bonus).toLocaleString('en-IN')}</div>
                <span className="text-[10px] text-slate-500">Paid annually on evaluation</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Annual ESOP / Stock Value</span>
                <div className="text-lg font-bold font-mono text-purple-400">₹{(annualEsops).toLocaleString('en-IN')}</div>
                <span className="text-[10px] text-slate-500">25% vested annually</span>
              </div>

            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Negotiation Tip:</strong> Always prioritize maximizing Fixed Base over volatile joining bonuses when comparing competing offers.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
