import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Three use cases — the market-opportunity argument lives in the intro line;
// the tabs are the evidence. Copy pattern per tab: In / Out / the claim.
// Visuals are RESERVED SLOTS: static In → Out summaries in the established
// bone/chrome frame. Per-tab looping animations land in the animation phase
// (spec from Conner) without changing the slot's dimensions.

const ROYCE = '#5481E8';

interface Tab {
  id: string;
  label: string;
  chrome: string;
  accent: string;
  inLines: string[];
  outLines: string[];
  claim: string;
}

const TABS: Tab[] = [
  {
    id: 'street-interviews',
    label: 'Street interviews',
    chrome: 'street interviews',
    accent: '#5481E8', // royce
    inLines: ['A full day of interviews', '40–80 clips', 'No master file — there never will be one'],
    outLines: ['A recap per guest', 'A compilation', 'Or both'],
    claim:
      'Clik finds the best moments across every clip and builds multiple storylines — without anyone scrubbing hours of footage to find them.',
  },
  {
    id: 'batch-concepts',
    label: 'Batch concepts',
    chrome: 'batch concepts',
    accent: '#F9838E', // salmon
    inLines: ['A shoot day', '~100 files', 'A script or a loose brief'],
    outLines: ['Every concept in its own project', 'Planned', 'Built'],
    claim: 'Clik reads the whole batch and splits it by concept. You never sort a file.',
  },
  {
    id: 'podcast-clipping',
    label: 'Podcast clipping',
    chrome: 'podcast clipping',
    accent: '#9785B8', // lavender
    inLines: ['A finished episode — or the raw recording', 'Your B-roll', 'Your graphics'],
    outLines: ['Clips that cut to your own footage', 'Not stock'],
    claim: 'Most tools can only start once someone has produced the episode. Clik works from either end.',
  },
];

function TabVisual({ tab }: { tab: Tab }) {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: 'rgba(14, 24, 52, 0.10)', background: '#F1EEE5' }}
    >
      {/* Window chrome */}
      <div
        className="flex items-center gap-1.5 px-4 py-3 border-b"
        style={{ borderColor: 'rgba(14, 24, 52, 0.08)' }}
      >
        <div className="w-2 h-2 rounded-full bg-clik-midnight/15" />
        <div className="w-2 h-2 rounded-full bg-clik-midnight/15" />
        <div className="w-2 h-2 rounded-full bg-clik-midnight/15" />
        <span className="ml-3 text-[10px] font-mono" style={{ color: 'rgba(14, 24, 52, 0.4)' }}>
          {tab.chrome}
        </span>
      </div>

      {/* ANIMATION SLOT — static In → Out summary until the animation phase */}
      <div className="px-4 py-5 min-h-[300px] md:min-h-[340px] flex flex-col justify-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(14, 24, 52, 0.5)' }}>
              In
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(14, 24, 52, 0.08)' }} />
          </div>
          <div className="space-y-1.5">
            {tab.inLines.map((line) => (
              <div
                key={line}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2"
                style={{ background: 'rgba(14, 24, 52, 0.04)', border: '1px solid rgba(14, 24, 52, 0.08)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'rgba(14, 24, 52, 0.3)' }} />
                <span className="text-xs" style={{ color: 'rgba(14, 24, 52, 0.7)' }}>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 py-0.5">
          <span className="text-xs" style={{ color: tab.accent }}>↓</span>
          <span className="text-[10px] font-mono" style={{ color: 'rgba(14, 24, 52, 0.45)' }}>clik</span>
          <span className="text-xs" style={{ color: tab.accent }}>↓</span>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(14, 24, 52, 0.5)' }}>
              Out
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(14, 24, 52, 0.08)' }} />
          </div>
          <div className="space-y-1.5">
            {tab.outLines.map((line) => (
              <div
                key={line}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2"
                style={{ background: `${tab.accent}08`, border: `1px solid ${tab.accent}18` }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: tab.accent }} />
                <span className="text-xs" style={{ color: 'rgba(14, 24, 52, 0.78)' }}>{line}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UseCaseTabs() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];

  return (
    <section id="use-cases" className="relative py-24 md:py-32 px-6 md:px-12 overflow-hidden">
      <div className="mx-auto max-w-[1100px]">
        <div className="clik-section-header">
          <span className="idx">[ 01 ]</span>
          <span className="rule"></span>
          <span className="label">USE CASES</span>
        </div>

        {/* The market-opportunity argument, in one line — the tabs are the evidence */}
        <h2
          className="font-display font-medium text-clik-midnight"
          style={{ fontSize: 'clamp(32px, 4.5vw, 44px)', lineHeight: 1.15, letterSpacing: '-0.02em', maxWidth: '28ch' }}
        >
          Every content team wants an automated content system.{' '}
          <span style={{ color: 'rgba(14, 24, 52, 0.45)' }}>
            Right now only one format has one<span style={{ color: ROYCE }}>.</span>
          </span>
        </h2>

        {/* Tab bar */}
        <div
          role="tablist"
          aria-label="Use cases"
          className="mt-10 flex flex-wrap gap-x-7 gap-y-2 border-b"
          style={{ borderColor: 'rgba(14, 24, 52, 0.12)' }}
        >
          {TABS.map((t, i) => (
            <button
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={i === active}
              aria-controls={`panel-${t.id}`}
              onClick={() => setActive(i)}
              className="relative pb-3 font-mono text-[12px] uppercase tracking-[0.14em] transition-colors"
              style={{ color: i === active ? '#0E1834' : 'rgba(14, 24, 52, 0.45)' }}
            >
              {t.label}
              {i === active && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute inset-x-0 -bottom-px block h-[2px]"
                  style={{ background: ROYCE }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab.id}
            role="tabpanel"
            id={`panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="mt-10 flex flex-col lg:flex-row items-start gap-10 lg:gap-16"
          >
            {/* Copy: In / Out / the claim */}
            <div className="flex-1 lg:max-w-md">
              <div className="space-y-5">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: 'rgba(14, 24, 52, 0.45)' }}>
                    In
                  </p>
                  <p className="mt-1.5 font-ui text-clik-midnight" style={{ fontSize: 17, lineHeight: 1.5 }}>
                    {tab.inLines.join('. ')}.
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: 'rgba(14, 24, 52, 0.45)' }}>
                    Out
                  </p>
                  <p className="mt-1.5 font-ui text-clik-midnight" style={{ fontSize: 17, lineHeight: 1.5 }}>
                    {tab.outLines.join('. ')}.
                  </p>
                </div>
              </div>
              <p
                className="mt-7 rounded-xl px-4 py-3.5 font-ui"
                style={{
                  fontSize: 15,
                  lineHeight: 1.55,
                  color: 'rgba(14, 24, 52, 0.75)',
                  background: `${tab.accent}08`,
                  border: `1px solid ${tab.accent}20`,
                }}
              >
                {tab.claim}
              </p>
            </div>

            {/* Visual slot */}
            <div className="flex-1 w-full lg:max-w-xl">
              <TabVisual tab={tab} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
