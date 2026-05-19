import { useState } from 'react';

const MIN = 1;
const MAX = 500;

export default function EarningsCalculator() {
  const [referrals, setReferrals] = useState(100);
  const yearly = Math.round(referrals * 75 * 0.30 * 12);
  const pct = (referrals - MIN) / (MAX - MIN);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Referral count — big and prominent */}
      <div className="text-center mb-8">
        <p
          className="font-display font-medium text-clik-midnight"
          style={{ fontSize: 'clamp(48px, 7vw, 64px)', letterSpacing: '-0.02em', lineHeight: 1 }}
        >
          {referrals}
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-clik-midnight/55 mt-2">
          creator{referrals !== 1 ? 's' : ''} referred
        </p>
      </div>

      {/* Slider */}
      <div className="relative mb-10 px-4">
        {/* Track background */}
        <div className="relative h-2 rounded-full bg-clik-midnight/10">
          {/* Filled track — Royce */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-clik-royce transition-[width] duration-75"
            style={{ width: `${pct * 100}%` }}
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
          className="absolute top-1/2 w-5 h-5 rounded-full border-2 pointer-events-none bg-clik-royce"
          style={{
            left: `${pct * 100}%`,
            transform: 'translate(-50%, -50%)',
            borderColor: '#F9F7F1',
          }}
        />

        {/* Min / Max labels */}
        <div className="flex justify-between mt-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-clik-midnight/45">1 creator</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-clik-midnight/45">500 creators</span>
        </div>
      </div>

      {/* Result */}
      <div className="text-center">
        <p
          className="font-display font-medium mb-3 text-clik-midnight"
          style={{ fontSize: 'clamp(60px, 9vw, 88px)', letterSpacing: '-0.02em', lineHeight: 1 }}
        >
          ${yearly.toLocaleString()}<span
            className="font-ui text-clik-midnight/45"
            style={{ fontSize: '0.4em', fontWeight: 400 }}
          > /yr</span>
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-clik-midnight/55">
          {referrals} CREATOR{referrals !== 1 ? 'S' : ''} · $75/MO · 30% · 12 MONTHS
        </p>
      </div>
    </div>
  );
}
