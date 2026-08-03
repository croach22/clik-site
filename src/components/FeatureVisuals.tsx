import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// Abstract product-UI mockups for the bento cards.
// Skeleton-UI language (muted placeholder bars + a few accent chips) rather
// than literal data. Deliberately NO window chrome — the bento card is already
// a frame, so the UI fragments float directly on it.

const ROYCE = '#5481E8';
const SALMON = '#F9838E';
const SAGE = '#7CA088';
const LAVENDER = '#9785B8';
const OCHRE = '#C5A578';

const C = (a: number) => `rgba(249, 247, 241, ${a})`;
const INSET = 'rgba(249, 247, 241, 0.04)';
const NODE_BG = '#101B3E';

// ── Primitives ───────────────────────────────────────────────
function Bar({ w, h = 6, o = 0.1, r = 3 }: { w: number | string; h?: number; o?: number; r?: number }) {
  return (
    <span
      className="block flex-shrink-0"
      style={{ width: typeof w === 'number' ? `${w}%` : w, height: h, borderRadius: r, background: C(o) }}
    />
  );
}

function Chip({ label, accent = ROYCE, solid = false }: { label: string; accent?: string; solid?: boolean }) {
  return (
    <span
      className="inline-flex flex-shrink-0 items-center rounded-full px-2 py-0.5 font-mono uppercase"
      style={{
        fontSize: 8,
        letterSpacing: '0.1em',
        background: solid ? `${accent}22` : `${accent}12`,
        color: `${accent}EE`,
        border: `1px solid ${accent}40`,
      }}
    >
      {label}
    </span>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono uppercase" style={{ fontSize: 8, letterSpacing: '0.12em', color: C(0.4) }}>
      {children}
    </span>
  );
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  return { ref, inView };
}

const rise = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.05 + i * 0.07, duration: 0.4 },
});

// Soft accent glow so floating elements still sit in atmosphere
function Glow({ accent, className }: { accent: string; className: string }) {
  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      style={{ background: `radial-gradient(closest-side, ${accent}1F, transparent 72%)` }}
      aria-hidden="true"
    />
  );
}

// ── 1. Brand & org memory ────────────────────────────────────
const MEMORY_ITEMS = [
  { label: 'Caption style', accent: ROYCE, preview: 'caption' },
  { label: 'Title card', accent: SALMON, preview: 'title' },
  { label: 'Hook', accent: OCHRE, preview: 'hook' },
  { label: 'Skills', accent: SAGE, preview: 'skills' },
  { label: 'Brand assets', accent: LAVENDER, preview: 'assets' },
] as const;

function MemoryPreview({ kind, accent }: { kind: string; accent: string }) {
  if (kind === 'caption') {
    return (
      <div className="relative h-full w-full">
        <span
          className="absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-sm"
          style={{ width: '62%', height: 5, background: accent }}
        />
        <span
          className="absolute left-1/2 block -translate-x-1/2 rounded-sm"
          style={{ top: '62%', width: '38%', height: 4, background: `${accent}66` }}
        />
      </div>
    );
  }
  if (kind === 'title') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1">
        <span className="block rounded-sm" style={{ width: '52%', height: 5, background: accent }} />
        <span className="block rounded-sm" style={{ width: '34%', height: 3, background: `${accent}55` }} />
      </div>
    );
  }
  if (kind === 'hook') {
    return (
      <div className="flex h-full w-full items-center justify-center gap-1">
        <span className="block rounded-[2px]" style={{ width: 10, height: '58%', background: accent, opacity: 0.9 }} />
        <span className="block rounded-[2px]" style={{ width: 10, height: '34%', background: `${accent}44` }} />
        <span className="block rounded-[2px]" style={{ width: 10, height: '34%', background: `${accent}44` }} />
      </div>
    );
  }
  if (kind === 'skills') {
    return (
      <div className="flex h-full w-full flex-col justify-center gap-1 px-2">
        {[70, 50, 60].map((w, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className="block h-1 w-1 rounded-full" style={{ background: accent }} />
            <span className="block rounded-sm" style={{ width: `${w}%`, height: 3, background: C(0.12) }} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block rounded"
          style={{ width: 12, height: 12, background: `${accent}${i === 0 ? '' : '44'}`, opacity: i === 0 ? 0.9 : 1 }}
        />
      ))}
    </div>
  );
}

export function BrandMemoryVisual() {
  const { ref, inView } = useReveal();
  return (
    <div ref={ref} className="relative">
      <Glow accent={SALMON} className="-right-10 -top-10 h-40 w-48" />

      <div className="relative mb-2.5 flex items-center justify-between">
        <Label>Saved rules</Label>
        <Chip label="auto-applied" />
      </div>

      <div className="relative grid grid-cols-2 gap-1.5">
        {MEMORY_ITEMS.map((item, i) => (
          <motion.div
            key={item.label}
            {...rise(i)}
            animate={inView ? rise(i).animate : rise(i).initial}
            className={`rounded-lg border p-2 ${i === MEMORY_ITEMS.length - 1 ? 'col-span-2' : ''}`}
            style={{ borderColor: `${item.accent}2E`, background: `${item.accent}0A` }}
          >
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="block h-1.5 w-1.5 rounded-full" style={{ background: item.accent }} />
              <span style={{ fontSize: 10, color: C(0.8) }}>{item.label}</span>
            </div>
            <div className="rounded" style={{ height: 34, background: INSET, border: `1px solid ${C(0.06)}` }}>
              <MemoryPreview kind={item.preview} accent={item.accent} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── 2. Planning agent ────────────────────────────────────────
const PLAN_STEPS = [
  { label: 'Analyze concepts', accent: ROYCE, out: ['3 concepts'] },
  { label: 'Read dialogue + visuals', accent: SALMON, out: ['transcript', 'scene'] },
  { label: 'Classify footage', accent: SAGE, out: ['interview', 'b-roll'] },
  { label: 'Draft ideas on brand', accent: LAVENDER, out: ['12 planned'] },
];

export function PlanningVisual() {
  const { ref, inView } = useReveal();
  return (
    <div ref={ref} className="relative">
      <Glow accent={ROYCE} className="-left-12 -top-8 h-48 w-64" />

      {/* connector rail */}
      <span
        className="absolute left-[6px] top-4 bottom-24 w-px"
        style={{ background: `linear-gradient(${ROYCE}55, ${LAVENDER}55)` }}
        aria-hidden="true"
      />

      <div className="relative space-y-2.5">
        {PLAN_STEPS.map((step, i) => (
          <motion.div
            key={step.label}
            {...rise(i)}
            animate={inView ? rise(i).animate : rise(i).initial}
            className="relative flex items-center gap-3"
          >
            <span
              className="relative z-10 flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full"
              style={{ background: NODE_BG, border: `1.5px solid ${step.accent}` }}
            >
              <span className="block h-1 w-1 rounded-full" style={{ background: step.accent }} />
            </span>

            <div
              className="flex flex-1 items-center gap-3 rounded-lg border px-3 py-2"
              style={{ borderColor: C(0.09), background: INSET }}
            >
              <span className="flex-shrink-0" style={{ fontSize: 11, color: C(0.82) }}>
                {step.label}
              </span>
              <span className="hidden flex-1 sm:block">
                <Bar w="100%" h={4} o={0.07} />
              </span>
              <span className="flex flex-shrink-0 gap-1">
                {step.out.map((o) => (
                  <Chip key={o} label={o} accent={step.accent} />
                ))}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* output slate */}
      <motion.div
        {...rise(PLAN_STEPS.length)}
        animate={inView ? rise(PLAN_STEPS.length).animate : rise(PLAN_STEPS.length).initial}
        className="relative ml-6 mt-3 rounded-lg border p-2.5"
        style={{ borderColor: `${ROYCE}30`, background: `${ROYCE}0C` }}
      >
        <div className="mb-2 flex items-center justify-between">
          <Label>Planned slate</Label>
          <Chip label="awaiting approval" />
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[ROYCE, SALMON, SAGE, LAVENDER].map((a, i) => (
            <div key={i} className="rounded p-1.5" style={{ background: `${a}12`, border: `1px solid ${a}33` }}>
              <span className="mb-1 block rounded-sm" style={{ height: 3, width: '70%', background: `${a}AA` }} />
              <Bar w={90} h={3} o={0.08} />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ── 3. Edit / build agent ────────────────────────────────────
const TALK_SEGMENTS = [
  { w: 16, gap: false },
  { w: 5, gap: true },
  { w: 22, gap: false },
  { w: 4, gap: true },
  { w: 18, gap: false },
  { w: 6, gap: true },
  { w: 20, gap: false },
];

const BROLL = [
  { left: 6, w: 16, accent: SAGE, label: 'kitchen' },
  { left: 32, w: 14, accent: OCHRE, label: 'street' },
  { left: 58, w: 18, accent: LAVENDER, label: 'product' },
];

export function EditAgentVisual() {
  const { ref, inView } = useReveal();
  return (
    <div ref={ref} className="relative space-y-3">
      <Glow accent={LAVENDER} className="-right-12 top-1/3 h-48 w-64" />

      {/* directive line */}
      <motion.div
        {...rise(0)}
        animate={inView ? rise(0).animate : rise(0).initial}
        className="relative flex items-center gap-2 rounded-lg border px-3 py-2"
        style={{ borderColor: `${ROYCE}30`, background: `${ROYCE}0C` }}
      >
        <span style={{ color: SALMON, fontSize: 11 }}>✦</span>
        <span style={{ fontSize: 11, color: C(0.85) }}>Cutting dead air, matching B-roll to meaning…</span>
      </motion.div>

      {/* dialogue track */}
      <motion.div {...rise(1)} animate={inView ? rise(1).animate : rise(1).initial} className="relative">
        <div className="mb-1.5 flex items-center justify-between">
          <Label>Dialogue</Label>
          <Chip label="14 pauses removed" accent={SALMON} />
        </div>
        <div className="flex gap-[3px]">
          {TALK_SEGMENTS.map((s, i) => (
            <span
              key={i}
              className="block rounded-sm"
              style={{
                width: `${s.w}%`,
                height: 26,
                background: s.gap ? 'transparent' : `${ROYCE}22`,
                border: s.gap ? `1px dashed ${SALMON}55` : `1px solid ${ROYCE}44`,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* b-roll track */}
      <motion.div {...rise(2)} animate={inView ? rise(2).animate : rise(2).initial} className="relative">
        <div className="mb-1.5 flex items-center justify-between">
          <Label>B-roll · matched by meaning</Label>
          <Chip label="from your library" accent={SAGE} />
        </div>
        <div className="relative" style={{ height: 26 }}>
          <span className="absolute inset-0 rounded-sm" style={{ background: INSET, border: `1px solid ${C(0.06)}` }} />
          {BROLL.map((b) => (
            <span
              key={b.label}
              className="absolute flex items-center justify-center rounded-sm"
              style={{
                left: `${b.left}%`,
                width: `${b.w}%`,
                top: 0,
                height: 26,
                background: `${b.accent}22`,
                border: `1px solid ${b.accent}66`,
              }}
            >
              <span className="font-mono" style={{ fontSize: 7, color: `${b.accent}EE` }}>
                {b.label}
              </span>
            </span>
          ))}
        </div>
      </motion.div>

      {/* result */}
      <motion.div
        {...rise(3)}
        animate={inView ? rise(3).animate : rise(3).initial}
        className="relative flex items-center justify-between rounded-lg border px-3 py-2"
        style={{ borderColor: C(0.09), background: INSET }}
      >
        <span style={{ fontSize: 10, color: C(0.6) }}>Runtime 4:12 → 3:06</span>
        <Chip label="ready for review" solid />
      </motion.div>
    </div>
  );
}

// ── 4. Project dashboard ─────────────────────────────────────
const COLUMNS = [
  { name: 'Planned', accent: LAVENDER, cards: [1, 2] },
  { name: 'Building', accent: ROYCE, cards: [1, 2, 3] },
  { name: 'Review', accent: SAGE, cards: [1] },
];

export function DashboardVisual() {
  const { ref, inView } = useReveal();
  return (
    <div ref={ref} className="relative">
      <Glow accent={SAGE} className="-left-10 -top-10 h-40 w-48" />

      {/* toolbar */}
      <div className="relative mb-2.5 flex items-center gap-1.5">
        <span
          className="flex flex-1 items-center gap-1.5 rounded-md border px-2 py-1"
          style={{ borderColor: C(0.09), background: INSET }}
        >
          <span className="block h-2 w-2 rounded-full border" style={{ borderColor: C(0.3) }} aria-hidden="true" />
          <Bar w={52} h={4} o={0.09} />
        </span>
        <Chip label="this week" />
      </div>

      <div className="relative grid grid-cols-3 gap-1.5">
        {COLUMNS.map((col, ci) => (
          <div key={col.name}>
            <div className="mb-1.5 flex items-center gap-1">
              <span className="block h-1.5 w-1.5 rounded-full" style={{ background: col.accent }} />
              <span style={{ fontSize: 9, color: C(0.55) }}>{col.name}</span>
              <span className="font-mono" style={{ fontSize: 8, color: C(0.3) }}>
                {col.cards.length}
              </span>
            </div>
            <div className="space-y-1.5">
              {col.cards.map((_, i) => (
                <motion.div
                  key={i}
                  {...rise(ci * 2 + i)}
                  animate={inView ? rise(ci * 2 + i).animate : rise(ci * 2 + i).initial}
                  className="rounded-md border p-1.5"
                  style={{
                    borderColor: ci === 1 && i === 0 ? `${col.accent}55` : C(0.09),
                    background: ci === 1 && i === 0 ? `${col.accent}12` : INSET,
                  }}
                >
                  <span
                    className="mb-1.5 block rounded-sm"
                    style={{ height: 3, width: i % 2 ? '60%' : '78%', background: C(0.14) }}
                  />
                  <div className="flex items-center gap-1">
                    <span className="block rounded-sm" style={{ width: 12, height: 8, background: `${col.accent}44` }} />
                    <span className="block rounded-sm" style={{ width: 12, height: 8, background: `${col.accent}26` }} />
                    <span className="ml-auto block h-2.5 w-2.5 rounded-full" style={{ background: C(0.12) }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* footer stat */}
      <motion.div
        {...rise(7)}
        animate={inView ? rise(7).animate : rise(7).initial}
        className="relative mt-2.5 flex items-center justify-between rounded-md border px-2.5 py-1.5"
        style={{ borderColor: C(0.09), background: INSET }}
      >
        <span style={{ fontSize: 9, color: C(0.5) }}>29 videos in flight</span>
        <div className="flex -space-x-1">
          {[0.16, 0.12, 0.09].map((o, i) => (
            <span
              key={i}
              className="block h-3 w-3 rounded-full"
              style={{ background: C(o), border: `1px solid ${NODE_BG}` }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
