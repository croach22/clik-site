import { useState } from 'react';

const MIN = 1;
const MAX = 500;

export default function EarningsCalculator() {
  const [referrals, setReferrals] = useState(100);
  const yearly = Math.round(referrals * 29 * 0.30 * 12);
  const pct = (referrals - MIN) / (MAX - MIN);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Referral count — big and prominent */}
      <div className="text-center mb-8">
        <p className="text-5xl md:text-6xl font-bold font-display text-brand-cream">
          {referrals}
        </p>
        <p className="text-sm text-brand-cream/40 mt-1">
          creator{referrals !== 1 ? 's' : ''} referred
        </p>
      </div>

      {/* Slider */}
      <div className="relative mb-10 px-4">
        {/* Track background */}
        <div className="relative h-2 rounded-full bg-white/10">
          {/* Filled track */}
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-75"
            style={{
              width: `${pct * 100}%`,
              background: 'linear-gradient(90deg, #D4A853, #e8c36a)',
            }}
          />
        </div>

        {/* Invisible range input on top */}
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={1}
          value={referrals}
          onChange={(e) => setReferrals(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ height: '2.75rem', top: '-1.25rem' }}
        />

        {/* Custom thumb */}
        <div
          className="absolute top-1/2 w-5 h-5 rounded-full border-2 border-white pointer-events-none"
          style={{
            left: `${pct * 100}%`,
            transform: 'translate(-50%, -50%)',
            background: '#D4A853',
            boxShadow: '0 0 12px rgba(212, 168, 83, 0.5)',
          }}
        />

        {/* Min / Max labels */}
        <div className="flex justify-between mt-4">
          <span className="text-xs text-brand-cream/30">1 creator</span>
          <span className="text-xs text-brand-cream/30">500 creators</span>
        </div>
      </div>

      {/* Result */}
      <div className="text-center">
        <p
          className="text-6xl md:text-7xl font-bold font-display mb-3"
          style={{ color: '#D4A853' }}
        >
          ${yearly.toLocaleString()}
          <span className="text-3xl md:text-4xl text-brand-cream/40">/yr</span>
        </p>
        <p className="text-brand-cream/50 text-base">
          {referrals} creator{referrals !== 1 ? 's' : ''} &times; $29/mo &times; 30% &times; 12 months
        </p>
      </div>
    </div>
  );
}
