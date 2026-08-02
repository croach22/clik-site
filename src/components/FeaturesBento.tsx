import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BatchVisual } from './FeatureWorkflows';
import { BrandGuideVisual } from './FeatureBrandMemory';
import { DashboardVisual } from './FeatureDashboard';

// The four-part flow as a bento grid (dark restyle) — card anatomy borrowed
// from the Mintlify-style inspo: glyph top-left, abstract product mockup in
// the middle, title + description at the bottom. Copy unchanged from the
// row-based feature sections. Product screenshots can replace any mockup via
// the SCREENSHOT_SRC constants in the visual components' source files.

const ROYCE = '#5481E8';
const SALMON = '#F9838E';
const SAGE = '#7CA088';
const LAVENDER = '#9785B8';
const OCHRE = '#C5A578';
const CREAM = (a: string) => `rgba(249, 247, 241, ${a})`;

// ── Build-agent mockup: chat direction → timeline assembling ──
const MOCK_CLIPS = [
  { label: 'Final Plating', color: SALMON, width: 74, isHook: true },
  { label: '"Let\'s make Bolognese"', color: LAVENDER, width: 88 },
  { label: 'Cutting onion', color: SALMON, width: 66 },
  { label: 'Grating carrots', color: OCHRE, width: 62 },
  { label: 'Adding meat', color: ROYCE, width: 68 },
];

function BuildMockVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  return (
    <div ref={ref}>
      <motion.div
        animate={{ opacity: isInView ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: CREAM('0.10'), background: '#13204A' }}
      >
        <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: CREAM('0.09') }}>
          <div className="w-2 h-2 rounded-full bg-clik-cream/20" />
          <div className="w-2 h-2 rounded-full bg-clik-cream/20" />
          <div className="w-2 h-2 rounded-full bg-clik-cream/20" />
          <span className="ml-3 text-[10px] font-mono" style={{ color: CREAM('0.45') }}>clik editor</span>
        </div>
        <div className="px-4 py-5 space-y-4">
          <div
            className="space-y-2 rounded-xl px-3.5 py-3"
            style={{ border: `1px solid ${ROYCE}30`, background: `${ROYCE}0C` }}
          >
            {['Executing the approved plan...', 'Moving final plating to the front as your hook.'].map((line, i) => (
              <motion.div
                key={line}
                initial={{ opacity: 0, y: 8 }}
                animate={isInView ? { opacity: i === 1 ? 1 : 0.55, y: 0 } : { opacity: 0, y: 8 }}
                transition={{ delay: 0.2 + i * 0.35, duration: 0.35 }}
                className="flex items-start gap-2"
              >
                <span className="mt-0.5 text-xs" style={{ color: SALMON }}>✦</span>
                <span className="text-sm" style={{ color: CREAM(i === 1 ? '0.85' : '0.55') }}>{line}</span>
              </motion.div>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px flex-1" style={{ background: CREAM('0.10') }} />
              <span className="text-[10px] font-mono" style={{ color: CREAM('0.45') }}>hook optimized · ready to publish</span>
              <div className="h-px flex-1" style={{ background: CREAM('0.10') }} />
            </div>
            <div className="flex gap-1">
              {MOCK_CLIPS.map((clip, i) => (
                <motion.div
                  key={clip.label}
                  initial={{ width: 0, opacity: 0 }}
                  animate={isInView ? { width: clip.width, opacity: 1 } : { width: 0, opacity: 0 }}
                  transition={{ delay: 0.9 + i * 0.1, type: 'spring', stiffness: 120, damping: 20 }}
                  className="relative flex-shrink-0 rounded-md overflow-hidden"
                  style={{
                    height: 40,
                    background: `${clip.color}18`,
                    border: `1px solid ${clip.color}${clip.isHook ? '70' : '35'}`,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center px-1">
                    <span className="text-[8px] font-mono truncate" style={{ color: `${clip.color}DD` }}>
                      {clip.isHook && <span style={{ color: clip.color }}>▶ </span>}
                      {clip.label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Bento cards ──
interface Card {
  glyph: string;
  glyphColor: string;
  title: string;
  desc: string;
  wide: boolean;
  Visual: () => JSX.Element;
}

const CARDS: Card[] = [
  {
    glyph: '⌘',
    glyphColor: ROYCE,
    title: 'A full batch in. Every video planned',
    desc: 'The agent takes a complete set of inputs — a batch day, a podcast plus your B-roll — and plans every video output from it. No more per-video setup.',
    wide: true,
    Visual: BatchVisual,
  },
  {
    glyph: '◆',
    glyphColor: SALMON,
    title: 'Teach it once',
    desc: 'Caption styles, title cards, logos, format rules — held upstream of every project, instead of you briefing someone every time.',
    wide: false,
    Visual: BrandGuideVisual,
  },
  {
    glyph: '▤',
    glyphColor: SAGE,
    title: 'See where everything stands',
    desc: "Status across every project — what's planned, building, and ready to review — the whole engine in one view.",
    wide: false,
    Visual: DashboardVisual,
  },
  {
    glyph: '▶',
    glyphColor: LAVENDER,
    title: 'Approved plan in. Built videos out',
    desc: 'Executes the plan downstream of your brand guide and workflow. Review anything in the built-in editor, or let it run.',
    wide: true,
    Visual: BuildMockVisual,
  },
];

function BentoCard({ card }: { card: Card }) {
  const { Visual } = card;
  return (
    <div
      className={`bento-card flex flex-col gap-6 border p-6 md:p-7 ${card.wide ? 'md:col-span-2' : ''}`}
      style={{ borderColor: CREAM('0.10'), background: CREAM('0.03') }}
    >
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm"
        style={{
          color: card.glyphColor,
          background: `${card.glyphColor}14`,
          border: `1px solid ${card.glyphColor}35`,
        }}
        aria-hidden="true"
      >
        {card.glyph}
      </span>
      <div className="flex-1 flex flex-col justify-center">
        <Visual />
      </div>
      <div>
        <h3
          className="font-display font-medium text-clik-cream"
          style={{ fontSize: 21, letterSpacing: '-0.01em', lineHeight: 1.2 }}
        >
          {card.title}
          <span style={{ color: ROYCE }}>.</span>
        </h3>
        <p className="mt-2 font-ui" style={{ fontSize: 15, lineHeight: 1.55, color: CREAM('0.65'), maxWidth: '52ch' }}>
          {card.desc}
        </p>
      </div>
    </div>
  );
}

export default function FeaturesBento() {
  return (
    <section id="features" className="relative py-24 md:py-32 px-6 md:px-12 overflow-hidden">
      <div className="mx-auto max-w-[1200px]">
        <div className="clik-section-header">
          <span className="idx">[ 03 ]</span>
          <span className="rule"></span>
          <span className="label">THE SYSTEM</span>
        </div>

        <h2
          className="font-display font-medium text-clik-cream"
          style={{ fontSize: 'clamp(36px, 4.5vw, 46px)', lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: '20ch' }}
        >
          One engine. Four parts<span style={{ color: ROYCE }}>.</span>
        </h2>
        <p className="mt-5 max-w-[620px] font-ui" style={{ fontSize: 17, lineHeight: 1.55, color: CREAM('0.7') }}>
          The same flow regardless of format — brand memory upstream, workflows planning at the batch level, a build
          agent constructing every video, and a dashboard so the whole team can see it.
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {CARDS.map((card) => (
            <BentoCard key={card.title} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
