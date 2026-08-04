import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// Hero showcase — four real workflows, auto-cycling, each showing the claim,
// the prompt that produced it, what went in, and what came out.
//
// ── DROPPING IN REAL FOOTAGE ────────────────────────────────────────────
// Each variant has `raw` (the before) and per-output `src` (the after).
// Both are null today and fall back to abstract tiles. To go live:
//   1. put files in  public/videos/showcase/<variant-id>/
//   2. set  raw: '/videos/showcase/podcast-clipping/raw.mp4'
//      and  src: '/videos/showcase/podcast-clipping/ep42_clip01.mp4'
// Nothing else changes — layout, sizing and playback are already wired.
// ────────────────────────────────────────────────────────────────────────

const ROYCE = '#5481E8';
const SALMON = '#F9838E';
const SAGE = '#7CA088';
const LAVENDER = '#9785B8';
const OCHRE = '#C5A578';

const C = (a: number) => `rgba(249, 247, 241, ${a})`;
const INSET = 'rgba(249, 247, 241, 0.04)';
const PANEL = '#13204A';

const TYPE_COLOR = {
  'a-roll': ROYCE,
  'b-roll': SAGE,
  graphics: LAVENDER,
} as const;

const SIGNUP = 'https://app.clik.vision/sign-up';
const CYCLE_MS = 7000; // hold per workflow before auto-advancing

interface Output {
  label: string;
  dur: string;
  accent: string;
  src?: string | null;
}

interface Variant {
  id: string;
  tab: string;
  inputSummary: string;
  inputFiles: {
    name: string;
    /** a-roll | b-roll | graphics — colour-coded consistently */
    type: keyof typeof TYPE_COLOR;
    /** what's actually in the shot */
    tags: string[];
    /** looping excerpt of the real file, when we have it */
    src?: string;
  }[];
  moreCount: number;
  outLabel: string;
  claim: string;
  promptPreview: string;
  prompt: string;
  outputs: Output[];
  /** outputs produced beyond the ones shown */
  moreOutputs?: number;
  raw?: string | null;
}

const VARIANTS: Variant[] = [
  {
    id: 'podcast-clipping',
    tab: 'Podcast clipping',
    inputSummary: 'Episode 42 · plus your B-roll',
    inputFiles: [
      { name: 'ep42_full.mp4', type: 'a-roll', tags: ['episode'] },
      { name: 'broll_studio.mp4', type: 'b-roll', tags: ['studio'] },
      { name: 'broll_city.mp4', type: 'b-roll', tags: ['city'] },
      { name: 'lower_thirds.mp4', type: 'graphics', tags: ['lower thirds'] },
    ],
    moreCount: 12,
    outLabel: '8 clips · your B-roll',
    claim: 'Most tools can only start once someone has produced the episode. Clik works from either end.',
    promptPreview: 'Pull the 8 strongest moments from ep 42 and cut away to my own B-roll.',
    prompt:
      "Here's episode 42, plus my B-roll library and my graphics.\n\nPull the 8 strongest moments from the episode and build them as vertical clips.\n\nWhen a moment needs a cutaway, use my own B-roll, matched to what's actually being said. Never stock.\n\nUse my saved caption style and title cards, and cut the dead air out of the dialogue.",
    outputs: [
      { label: 'ep42_clip01', dur: '0:41', accent: ROYCE },
      { label: 'ep42_clip02', dur: '0:37', accent: SALMON },
      { label: 'ep42_clip03', dur: '0:55', accent: SAGE },
      { label: 'ep42_clip04', dur: '0:29', accent: LAVENDER },
      { label: 'ep42_clip05', dur: '0:46', accent: OCHRE },
      { label: 'ep42_clip06', dur: '0:33', accent: ROYCE },
    ],
    raw: null,
  },
  {
    id: 'content-day',
    tab: 'Content day',
    inputSummary: '79 clips · one shoot day',
    inputFiles: [
      {
        name: 'IMG_3237.mov',
        type: 'a-roll',
        tags: ['interview'],
        src: '/videos/showcase/content-day/raw-a.mp4',
      },
      {
        name: 'DJI_0003.mp4',
        type: 'b-roll',
        tags: ['drone', 'exterior'],
        src: '/videos/showcase/content-day/raw-b.mp4',
      },
      {
        name: 'IMG_3299.mov',
        type: 'b-roll',
        tags: ['firepole', 'station'],
        src: '/videos/showcase/content-day/raw-c.mp4',
      },
    ],
    moreCount: 76,
    outLabel: '10 videos · 4 concepts',
    claim: 'Clik reads the whole batch and splits it by concept. You never sort a file.',
    promptPreview: 'Sort 79 clips, plan 4 concepts, build 2 hooks each.',
    prompt:
      "Here's a full content day, 79 clips, unsorted.\n\nSort the footage into A-roll, B-roll, and graphics. Read the dialogue and visuals, then plan 4 concepts you can actually make from what's here.\n\nBuild every concept vertical, with 2 hook variants each. Use my saved caption style, title cards, and hook rules. Cut the dead air, and pull B-roll from my own footage where it fits the meaning.\n\nTell me anything the brief called for that I didn't shoot.",
    outputs: [
      {
        label: 'vidA_hookA',
        dur: '0:57',
        accent: ROYCE,
        src: '/videos/showcase/content-day/out-a.mp4',
      },
      {
        label: 'vidB_hookA',
        dur: '0:47',
        accent: SALMON,
        src: '/videos/showcase/content-day/out-b.mp4',
      },
    ],
    moreOutputs: 8,
    raw: null,
  },
  {
    id: 'street-interviews',
    tab: 'Street interviews',
    inputSummary: '60 clips · no master file',
    inputFiles: [
      { name: 'IMG_2210.mp4', type: 'a-roll', tags: ['guest 01'] },
      { name: 'IMG_2214.mp4', type: 'a-roll', tags: ['guest 02'] },
      { name: 'IMG_2231.mp4', type: 'a-roll', tags: ['guest 03'] },
      { name: 'IMG_2247.mp4', type: 'b-roll', tags: ['street'] },
    ],
    moreCount: 56,
    outLabel: '5 videos',
    claim:
      'Clik finds the best moments across every clip and builds multiple storylines. Nobody scrubs hours of footage to find them.',
    promptPreview: 'Find the best moments across 60 clips. One recap per guest, plus a compilation.',
    prompt:
      "This is a day of street interviews. About 60 clips, no master file, every answer is its own file.\n\nWatch all of it and find the strongest moments across every clip. Group them by guest.\n\nBuild me one recap per guest, plus a compilation of the best answers of the day and a short teaser using the single best line.\n\nAll vertical, my caption style, cut the dead air.",
    outputs: [
      { label: 'recap_guest01', dur: '0:48', accent: ROYCE },
      { label: 'recap_guest02', dur: '0:52', accent: SALMON },
      { label: 'recap_guest03', dur: '0:44', accent: SAGE },
      { label: 'compilation_best', dur: '1:24', accent: LAVENDER },
      { label: 'teaser_hookA', dur: '0:22', accent: OCHRE },
    ],
    raw: null,
  },
  {
    id: 'yap-batch',
    tab: 'Yap batch',
    inputSummary: '18 takes · one sitting',
    inputFiles: [
      { name: 'take_01.mp4', type: 'a-roll', tags: ['idea 01', 'take 1'] },
      { name: 'take_02.mp4', type: 'a-roll', tags: ['idea 01', 'take 2'] },
      { name: 'take_03.mp4', type: 'a-roll', tags: ['idea 02'] },
      { name: 'take_04.mp4', type: 'a-roll', tags: ['idea 03'] },
    ],
    moreCount: 14,
    outLabel: '6 videos · best takes',
    claim: 'Clik keeps the best delivery of every line and drops the rest. One sitting becomes a week of posts.',
    promptPreview: 'Group 18 takes by idea, keep the best delivery, build 2 hooks each.',
    prompt:
      "Here's a yap batch, 18 takes recorded in one sitting, several attempts per idea.\n\nGroup the takes by idea and keep the best delivery of each line. Drop the flubs and the restarts.\n\nBuild one vertical video per idea with 2 hook variants each, using my saved caption style and hook rules. Cut every pause.",
    outputs: [
      { label: 'idea01_hookA', dur: '0:38', accent: ROYCE },
      { label: 'idea01_hookB', dur: '0:35', accent: ROYCE },
      { label: 'idea02_hookA', dur: '0:42', accent: SALMON },
      { label: 'idea02_hookB', dur: '0:40', accent: SALMON },
      { label: 'idea03_hookA', dur: '0:51', accent: SAGE },
      { label: 'idea03_hookB', dur: '0:47', accent: SAGE },
    ],
    raw: null,
  },
];

const STEPS = [
  'Copy the prompt above.',
  'Create a free Clik account.',
  'Start a project and upload your footage.',
  'Paste the prompt into the chat and send it.',
];

// ── Prompt modal ──────────────────────────────────────────────
function PromptModal({ variant, onClose }: { variant: Variant; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(variant.prompt);
    } catch {
      /* clipboard blocked — the prompt stays selectable above */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6"
      style={{ background: 'rgba(4, 8, 20, 0.72)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Prompt for ${variant.tab}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-[620px] overflow-y-auto rounded-t-2xl border p-6 sm:rounded-2xl md:p-8"
        style={{ borderColor: C(0.12), background: PANEL }}
      >
        <div className="mb-1 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono uppercase" style={{ fontSize: 10, letterSpacing: '0.14em', color: ROYCE }}>
              {variant.tab}
            </p>
            <h3
              className="mt-2 font-display font-medium text-clik-cream"
              style={{ fontSize: 26, letterSpacing: '-0.01em', lineHeight: 1.15 }}
            >
              Run this on your own footage<span style={{ color: ROYCE }}>.</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors"
            style={{ color: C(0.5) }}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mt-5 rounded-xl border p-4" style={{ borderColor: C(0.1), background: INSET }}>
          <pre
            className="whitespace-pre-wrap font-ui"
            style={{ fontSize: 13.5, lineHeight: 1.6, color: C(0.85), margin: 0 }}
          >
            {variant.prompt}
          </pre>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button onClick={copy} className="clik-btn clik-btn-primary">
            {copied ? 'Copied ✓' : 'Copy prompt'}
          </button>
          <a href={SIGNUP} className="clik-btn clik-btn-secondary">
            Start for free <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="mt-7 border-t pt-6" style={{ borderColor: C(0.1) }}>
          <p className="font-mono uppercase" style={{ fontSize: 9, letterSpacing: '0.14em', color: C(0.45) }}>
            How to use it
          </p>
          <ol className="mt-3 space-y-2.5">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-start gap-3">
                <span
                  className="mt-px flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full font-mono"
                  style={{
                    fontSize: 9,
                    color: ROYCE,
                    background: `${ROYCE}15`,
                    border: `1px solid ${ROYCE}40`,
                  }}
                >
                  {i + 1}
                </span>
                <span className="font-ui" style={{ fontSize: 14, lineHeight: 1.5, color: C(0.75) }}>
                  {s}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Output tile ───────────────────────────────────────────────
function OutputTile({ o, i, shown }: { o: Output; i: number; shown: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={shown ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 10 }}
      transition={{ delay: i * 0.06, type: 'spring', stiffness: 240, damping: 22 }}
      className="relative overflow-hidden rounded-lg"
      style={{
        aspectRatio: '9 / 16',
        background: `${o.accent}12`,
        border: `1px solid ${o.accent}40`,
      }}
    >
      {o.src ? (
        <video
          src={o.src}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        <>
          <span
            className="absolute left-1/2 top-[20%] block -translate-x-1/2 rounded-full"
            style={{ width: '36%', aspectRatio: '1', background: `${o.accent}30` }}
          />
          <span
            className="absolute left-1/2 top-[44%] block -translate-x-1/2 rounded-t-lg"
            style={{ width: '56%', height: '24%', background: `${o.accent}22` }}
          />
          <span
            className="absolute left-1/2 block -translate-x-1/2 rounded-sm"
            style={{ bottom: '22%', width: '62%', height: 4, background: o.accent }}
          />
        </>
      )}
      <div
        className="absolute inset-x-0 bottom-0 flex items-center justify-between px-1.5 py-1"
        style={{ background: 'rgba(7, 12, 27, 0.78)' }}
      >
        <span className="truncate font-mono" style={{ fontSize: 7, color: C(0.85) }}>
          {o.label}
        </span>
        <span className="font-mono" style={{ fontSize: 7, color: C(0.45) }}>
          {o.dur}
        </span>
      </div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function HeroShowcase() {
  const [active, setActive] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  // auto-advance stops for good once the reader picks a tab themselves
  const [autoplay, setAutoplay] = useState(true);
  const v = VARIANTS[active];

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const onScreen = useInView(ref, { once: false, amount: 0.3 });

  // portals need a DOM target, so wait for hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // cycle the four workflows; pause off-screen, while the modal is open,
  // and for anyone who asked for reduced motion
  useEffect(() => {
    if (!autoplay || !onScreen || modalOpen) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setTimeout(() => setActive((i) => (i + 1) % VARIANTS.length), CYCLE_MS);
    return () => clearTimeout(id);
  }, [active, autoplay, onScreen, modalOpen]);

  const pick = (i: number) => {
    setActive(i);
    setAutoplay(false);
  };

  return (
    <div ref={ref}>
      {/* The thesis, then the proof directly under it */}
      <p
        className="mb-4 font-display font-medium text-clik-cream"
        style={{ fontSize: 'clamp(19px, 2.1vw, 24px)', lineHeight: 1.3, letterSpacing: '-0.01em', maxWidth: '38ch' }}
      >
        Imagine a clipping tool that worked on raw footage{' '}
        <span style={{ color: C(0.45) }}>
          (and on podcasts)<span style={{ color: ROYCE }}>.</span>
        </span>
      </p>

      {/* variant tabs */}
      <div role="tablist" aria-label="Workflow examples" className="mb-3 flex flex-wrap gap-1.5">
        {VARIANTS.map((variant, i) => {
          const on = i === active;
          return (
            <button
              key={variant.id}
              role="tab"
              aria-selected={on}
              onClick={() => pick(i)}
              className="relative overflow-hidden rounded-lg border px-3 py-1.5 font-mono uppercase transition-colors"
              style={{
                fontSize: 10,
                letterSpacing: '0.1em',
                color: on ? '#F9F7F1' : C(0.5),
                borderColor: on ? `${ROYCE}70` : C(0.1),
                background: on ? `${ROYCE}1A` : 'transparent',
              }}
            >
              {/* fill shows how long until the next workflow */}
              {on && autoplay && (
                <motion.span
                  key={active}
                  className="absolute inset-y-0 left-0 block"
                  style={{ background: `${ROYCE}33` }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: CYCLE_MS / 1000, ease: 'linear' }}
                />
              )}
              <span className="relative">{variant.tab}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border p-4 md:p-5" style={{ borderColor: C(0.1), background: PANEL }}>
        {/* claim + the prompt that produced this run, above the run itself */}
        <div className="mb-4">
          <motion.p
            key={`claim-${v.id}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="font-ui"
            style={{ fontSize: 15, lineHeight: 1.5, color: C(0.82), maxWidth: '72ch' }}
          >
            {v.claim}
          </motion.p>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch">
            {/* reads like the Clik chat input this would be pasted into */}
            <div
              className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg border px-3 py-2"
              style={{ borderColor: C(0.12), background: INSET }}
            >
              <span style={{ color: SALMON, fontSize: 12 }}>✦</span>
              <motion.span
                key={`prev-${v.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="min-w-0 flex-1 truncate font-ui"
                style={{ fontSize: 13, color: C(0.7) }}
              >
                {v.promptPreview}
              </motion.span>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-lg border px-3.5 py-2 font-mono uppercase transition-colors"
              style={{
                fontSize: 10,
                letterSpacing: '0.1em',
                color: ROYCE,
                borderColor: `${ROYCE}55`,
                background: `${ROYCE}12`,
              }}
            >
              Copy prompt
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="4.5" y="4.5" width="8" height="8" rx="1.6" stroke="currentColor" strokeWidth="1.3" />
                <path d="M9.5 2.5h-7a1 1 0 0 0-1 1v7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
          {/* ── RAW ── */}
          <div className="rounded-xl border p-3" style={{ borderColor: C(0.09), background: INSET }}>
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <span className="font-mono uppercase" style={{ fontSize: 8, letterSpacing: '0.12em', color: C(0.45) }}>
                Raw
              </span>
              <span className="font-mono" style={{ fontSize: 8, color: C(0.35) }}>
                {v.inputSummary}
              </span>
            </div>

            {v.raw ? (
              <video
                src={v.raw}
                className="mb-2 w-full rounded-lg"
                style={{ aspectRatio: '16 / 9', objectFit: 'cover' }}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            ) : null}

            {/* one row per file: the footage, what it is, what's in it */}
            <motion.div
              key={`in-${v.id}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-1.5"
            >
              {v.inputFiles.map((f, i) => {
                const typeColor = TYPE_COLOR[f.type];
                return (
                  <motion.div
                    key={f.name}
                    initial={{ opacity: 0, x: -6 }}
                    animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    className="flex items-center gap-2 rounded-lg p-1.5"
                    style={{ background: C(0.04), border: `1px solid ${C(0.08)}` }}
                  >
                    {/* the clip itself, when we have it */}
                    {f.src ? (
                      <div
                        className="relative flex-shrink-0 overflow-hidden rounded"
                        style={{ width: 52, aspectRatio: '16 / 9', border: `1px solid ${C(0.1)}` }}
                      >
                        <video
                          src={f.src}
                          className="absolute inset-0 h-full w-full object-cover"
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                        />
                      </div>
                    ) : (
                      <span
                        className="block flex-shrink-0 rounded"
                        style={{ width: 52, aspectRatio: '16 / 9', background: C(0.06), border: `1px solid ${C(0.08)}` }}
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate" style={{ fontSize: 10.5, color: C(0.75) }}>
                        {f.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        {/* what kind of footage */}
                        <span
                          className="inline-flex flex-shrink-0 items-center rounded px-1.5 py-px font-mono uppercase"
                          style={{
                            fontSize: 7,
                            letterSpacing: '0.08em',
                            color: typeColor,
                            background: `${typeColor}1A`,
                            border: `1px solid ${typeColor}45`,
                          }}
                        >
                          {f.type}
                        </span>
                        {/* what's in it */}
                        {f.tags.map((t) => (
                          <span
                            key={t}
                            className="inline-flex flex-shrink-0 items-center rounded px-1.5 py-px font-mono"
                            style={{
                              fontSize: 7,
                              letterSpacing: '0.06em',
                              color: C(0.5),
                              background: C(0.05),
                              border: `1px solid ${C(0.1)}`,
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
                style={{ border: `1px dashed ${C(0.1)}` }}
              >
                <span className="block h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: C(0.15) }} />
                <span className="font-mono" style={{ fontSize: 9.5, color: C(0.4) }}>
                  +{v.moreCount} more
                </span>
              </div>
            </motion.div>
          </div>

          {/* ── OUT ── */}
          <div className="rounded-xl border p-3" style={{ borderColor: `${ROYCE}30`, background: `${ROYCE}0A` }}>
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <span className="font-mono uppercase" style={{ fontSize: 8, letterSpacing: '0.12em', color: C(0.45) }}>
                Clik output
              </span>
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 font-mono uppercase"
                style={{
                  fontSize: 8,
                  letterSpacing: '0.1em',
                  background: `${SAGE}18`,
                  color: `${SAGE}EE`,
                  border: `1px solid ${SAGE}45`,
                }}
              >
                {v.outLabel}
              </span>
            </div>

            <motion.div
              key={`out-${v.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className={`grid gap-2 ${
                v.outputs.length + (v.moreOutputs ? 1 : 0) <= 3
                  ? 'grid-cols-3 sm:grid-cols-4'
                  : v.outputs.length === 5
                    ? 'grid-cols-3 sm:grid-cols-5'
                    : 'grid-cols-3 sm:grid-cols-6'
              }`}
            >
              {v.outputs.map((o, i) => (
                <OutputTile key={o.label} o={o} i={i} shown={inView} />
              ))}
              {v.moreOutputs ? (
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{ aspectRatio: '9 / 16', border: `1px dashed ${C(0.14)}`, background: C(0.02) }}
                >
                  <span className="font-mono" style={{ fontSize: 9, color: C(0.45) }}>
                    +{v.moreOutputs}
                  </span>
                </div>
              ) : null}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Portalled to <body>: inside the hero the modal sits under a stacking
          context created by the section and never surfaces. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {modalOpen && <PromptModal variant={v} onClose={() => setModalOpen(false)} />}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
