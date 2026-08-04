import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import HeroFlow from './HeroFlow';
import HeroScrub, { type ScrubClip, type ScrubSource } from './HeroScrub';

// Hero showcase — four workflows. Each runs its own four-step sequence
// (analyze → concepts → B-roll → build) and hands off to the next tab when it
// finishes. Clicking a tab takes manual control and stops the hand-off.
//
// ── DROPPING IN REAL FOOTAGE ────────────────────────────────────────────
//   raw clips : inputFiles[].src   (vertical, 9:16)
//   the batch : mosaic[]           (one tiny poster frame per file)
//   finals    : outputs[].src      (vertical, 9:16)
// Anything left undefined falls back to abstract tiles.
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

// step timings, ms — long enough to read, short enough to sit through
const STEP_MS = [3000, 2600, 2600, 3400];
const TOTAL_MS = STEP_MS.reduce((a, b) => a + b, 0);
const HOLD_MS = 1400; // beat on the finished state before handing off

const CONTENT_DAY_MOSAIC = Array.from(
  { length: 36 },
  (_, i) => `/images/showcase/content-day/${String(i + 1).padStart(2, '0')}.jpg`,
);

// eight frames off the card, enough to read as a batch without competing
// with the finished cuts for attention
const strip = (dir: string) =>
  Array.from({ length: 8 }, (_, i) => `/images/showcase/${dir}/${String(i + 1).padStart(2, '0')}.jpg`);
const CONTENT_DAY_RAW = strip('content-day-raw');
const YAP_BATCH_RAW = strip('yap-batch-raw');

interface Output {
  label: string;
  dur: string;
  accent: string;
  src?: string;
}

interface InputFile {
  name: string;
  type: keyof typeof TYPE_COLOR;
  tags: string[];
  src?: string;
}

interface Variant {
  id: string;
  tab: string;
  inputSummary: string;
  fileCount: number;
  inputFiles: InputFile[];
  mosaic?: string[];
  concepts: string[];
  steps: string[];
  outLabel: string;
  claim: string;
  promptPreview: string;
  prompt: string;
  outputs: Output[];
  moreOutputs?: number;
  // when present, this tab renders the before/after scrub instead of the flow
  scrub?: {
    steps: string[];
    source: ScrubSource;
    clips: ScrubClip[];
    stackLabel: string;
    stackSub?: string;
  };
}

const VARIANTS: Variant[] = [
  {
    id: 'podcast-clipping',
    tab: 'Podcast clipping',
    inputSummary: 'episode + your B-roll',
    fileCount: 16,
    inputFiles: [
      { name: 'ep42_full.mp4', type: 'a-roll', tags: ['episode'] },
      { name: 'broll_studio.mp4', type: 'b-roll', tags: ['studio'] },
      { name: 'lower_thirds.mp4', type: 'graphics', tags: ['lower thirds'] },
    ],
    concepts: ['The cold open', 'Best argument', 'Guest origin', 'Closing line'],
    steps: ['Scanning the episode', 'Finding the strongest moments', 'Matching your B-roll', 'Building the clips'],
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
    scrub: {
      steps: [
        'Analyzing the episode',
        'Finding the key moments',
        'Writing hooks from your rules',
        'Reframing to vertical',
      ],
      source: { kind: 'landscape', name: 'ep42_full.mp4', dur: '1:12:40' },
      clips: [
        { title: 'The cold open', caption: "That's the part", dur: '0:41', label: 'ep42_clip01', accent: ROYCE },
        { title: 'Best argument', caption: 'Nobody says this', dur: '0:37', label: 'ep42_clip02', accent: SALMON },
        { title: 'Guest origin', caption: 'I had no plan', dur: '0:55', label: 'ep42_clip03', accent: SAGE },
      ],
      stackLabel: '+5',
    },
  },
  {
    id: 'content-day',
    tab: 'Content day',
    inputSummary: 'one shoot day',
    fileCount: 79,
    inputFiles: [
      { name: 'IMG_3237.mov', type: 'a-roll', tags: ['interview'], src: '/videos/showcase/content-day/raw-a.mp4' },
      { name: 'DJI_0003.mp4', type: 'b-roll', tags: ['drone', 'exterior'], src: '/videos/showcase/content-day/raw-b.mp4' },
      { name: 'IMG_3299.mov', type: 'b-roll', tags: ['firepole', 'station'], src: '/videos/showcase/content-day/raw-c.mp4' },
    ],
    mosaic: CONTENT_DAY_MOSAIC,
    // TODO(conner): swap for the concepts Clik actually landed on
    concepts: ['The hardest calls', 'Looks like chaos', 'Life at the station', 'Why they serve'],
    steps: ['Analyzing footage', 'Identifying narrative concepts', 'Finding relevant B-roll', 'Building the videos'],
    outLabel: '10 videos · 4 concepts',
    claim: 'Clik reads the whole batch and splits it by concept. You never sort a file.',
    promptPreview: 'Sort 79 clips, plan 4 concepts, build 2 hooks each.',
    prompt:
      "Here's a full content day, 79 clips, unsorted.\n\nSort the footage into A-roll, B-roll, and graphics. Read the dialogue and visuals, then plan 4 concepts you can actually make from what's here.\n\nBuild every concept vertical, with 2 hook variants each. Use my saved caption style, title cards, and hook rules. Cut the dead air, and pull B-roll from my own footage where it fits the meaning.\n\nTell me anything the brief called for that I didn't shoot.",
    outputs: [
      { label: 'vidA_hookA', dur: '0:57', accent: ROYCE, src: '/videos/showcase/content-day/out-a.mp4' },
      { label: 'vidB_hookA', dur: '0:47', accent: SALMON, src: '/videos/showcase/content-day/out-b.mp4' },
    ],
    moreOutputs: 8,
    scrub: {
      steps: [
        'Analyzing 79 clips',
        'Sorting A-roll from B-roll',
        'Planning the concepts',
        'Building the videos',
      ],
      source: {
        kind: 'batch',
        count: 79,
        note: '79 clips · one shoot day',
        more: 71,
        stills: CONTENT_DAY_RAW,
      },
      clips: [
        { title: 'The hardest calls', dur: '0:57', label: 'vidA_hookA', accent: ROYCE, src: '/videos/showcase/content-day/out-a.mp4' },
        { title: 'Looks like chaos', dur: '0:47', label: 'vidB_hookA', accent: SALMON, src: '/videos/showcase/content-day/out-b.mp4' },
      ],
      stackLabel: '+8',
      stackSub: 'videos · 4 concepts',
    },
  },
  {
    id: 'street-interviews',
    tab: 'Street interviews',
    inputSummary: 'no master file',
    fileCount: 60,
    inputFiles: [
      { name: 'IMG_2210.mp4', type: 'a-roll', tags: ['guest 01'] },
      { name: 'IMG_2214.mp4', type: 'a-roll', tags: ['guest 02'] },
      { name: 'IMG_2247.mp4', type: 'b-roll', tags: ['street'] },
    ],
    concepts: ['Guest 01 recap', 'Guest 02 recap', 'Guest 03 recap', 'Best of the day'],
    steps: ['Watching every clip', 'Grouping answers by guest', 'Picking the best moments', 'Building the recaps'],
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
  },
  {
    id: 'yap-batch',
    tab: 'Yap batch',
    inputSummary: 'one sitting',
    fileCount: 26,
    inputFiles: [
      { name: 'take_01.mp4', type: 'a-roll', tags: ['idea 01', 'take 1'] },
      { name: 'take_02.mp4', type: 'a-roll', tags: ['idea 01', 'take 2'] },
      { name: 'take_04.mp4', type: 'a-roll', tags: ['idea 03'] },
    ],
    concepts: ['Idea 01', 'Idea 02', 'Idea 03', 'Bonus rant'],
    steps: ['Listening to every take', 'Grouping takes by idea', 'Keeping the best delivery', 'Building the videos'],
    outLabel: '6 videos · best takes',
    claim: 'Clik keeps the best delivery of every line and drops the rest. One sitting becomes a week of posts.',
    promptPreview: 'Group 26 takes by idea, keep the best delivery, build 2 hooks each.',
    prompt:
      "Here's a yap batch, 26 takes recorded in one sitting, several attempts per idea.\n\nGroup the takes by idea and keep the best delivery of each line. Drop the flubs and the restarts.\n\nBuild one vertical video per idea with 2 hook variants each, using my saved caption style and hook rules. Cut every pause.",
    outputs: [
      { label: 'idea01_hookA', dur: '0:38', accent: ROYCE },
      { label: 'idea01_hookB', dur: '0:35', accent: ROYCE },
      { label: 'idea02_hookA', dur: '0:42', accent: SALMON },
      { label: 'idea02_hookB', dur: '0:40', accent: SALMON },
      { label: 'idea03_hookA', dur: '0:51', accent: SAGE },
      { label: 'idea03_hookB', dur: '0:47', accent: SAGE },
    ],
    scrub: {
      steps: [
        'Analyzing footage for concept boundaries',
        'Comparing concepts to the brief',
        'Finding the best takes',
        'Adding on-brand captions and title cards',
      ],
      source: {
        kind: 'batch',
        count: 26,
        more: 18,
        note: '26 takes · one sitting',
        stills: YAP_BATCH_RAW,
      },
      clips: [
        { title: "Don't start a podcast", dur: '0:44', label: 'idea01_hookA', accent: ROYCE, src: '/videos/showcase/yap-batch/out-a.mp4' },
        { title: '8 tips for shooting', dur: '1:06', label: 'idea02_hookA', accent: SALMON, src: '/videos/showcase/yap-batch/out-b.mp4' },
        { title: '4 trial reels', dur: '0:47', label: 'idea03_hookA', accent: SAGE, src: '/videos/showcase/yap-batch/out-c.mp4' },
      ],
      stackLabel: '+3',
    },
  },
];

const CONCEPT_COLORS = [ROYCE, SALMON, SAGE, OCHRE];

const STEPS_HOWTO = [
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
            className="-mr-1 -mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
            style={{ color: C(0.5) }}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mt-5 rounded-xl border p-4" style={{ borderColor: C(0.1), background: INSET }}>
          <pre className="whitespace-pre-wrap font-ui" style={{ fontSize: 13.5, lineHeight: 1.6, color: C(0.85), margin: 0 }}>
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
            {STEPS_HOWTO.map((s, i) => (
              <li key={s} className="flex items-start gap-3">
                <span
                  className="mt-px flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full font-mono"
                  style={{ fontSize: 9, color: ROYCE, background: `${ROYCE}15`, border: `1px solid ${ROYCE}40` }}
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
      initial={{ opacity: 0, scale: 0.82, y: 10 }}
      animate={shown ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.82, y: 10 }}
      transition={{ delay: shown ? i * 0.12 : 0, type: 'spring', stiffness: 240, damping: 22 }}
      className="relative overflow-hidden rounded-lg"
      style={{ aspectRatio: '9 / 16', background: `${o.accent}12`, border: `1px solid ${o.accent}40` }}
    >
      {o.src ? (
        <video src={o.src} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" />
      ) : (
        <>
          <span className="absolute left-1/2 top-[20%] block -translate-x-1/2 rounded-full" style={{ width: '36%', aspectRatio: '1', background: `${o.accent}30` }} />
          <span className="absolute left-1/2 top-[44%] block -translate-x-1/2 rounded-t-lg" style={{ width: '56%', height: '24%', background: `${o.accent}22` }} />
          <span className="absolute left-1/2 block -translate-x-1/2 rounded-sm" style={{ bottom: '22%', width: '62%', height: 4, background: o.accent }} />
        </>
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-1.5 py-1" style={{ background: 'rgba(7, 12, 27, 0.78)' }}>
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
  const [step, setStep] = useState(0);
  const [analyzed, setAnalyzed] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [scrubStep, setScrubStep] = useState(0);
  const v = VARIANTS[active];

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.25 });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // run the four steps, then hand off to the next tab
  useEffect(() => {
    if (!inView || modalOpen) return;
    if (reduced) {
      setStep(3);
      setAnalyzed(v.fileCount);
      return;
    }
    setStep(0);
    setAnalyzed(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    let t = 0;
    STEP_MS.forEach((ms, i) => {
      t += ms;
      if (i < STEP_MS.length - 1) timers.push(setTimeout(() => setStep(i + 1), t));
    });
    if (autoplay) {
      timers.push(setTimeout(() => setActive((a) => (a + 1) % VARIANTS.length), t + HOLD_MS));
    }
    return () => timers.forEach(clearTimeout);
  }, [active, inView, modalOpen, autoplay, reduced, v.fileCount]);

  // tick the analyzed counter through step 1
  useEffect(() => {
    if (step !== 0 || reduced || !inView) return;
    const startedAt = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - startedAt) / (STEP_MS[0] * 0.85), 1);
      setAnalyzed(Math.round(v.fileCount * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step, v.fileCount, reduced, inView]);

  const pick = (i: number) => {
    setActive(i);
    setAutoplay(false);
  };

  const conceptsIn = step >= 1;
  const brollIn = step >= 2;
  const built = step >= 3;

  const mosaicCount = v.mosaic?.length ?? 36;
  const litCount = Math.round((analyzed / v.fileCount) * mosaicCount);

  return (
    <div ref={ref}>
      <p
        className="mb-4 font-display font-medium text-clik-cream"
        style={{ fontSize: 'clamp(19px, 2.1vw, 24px)', lineHeight: 1.3, letterSpacing: '-0.01em', maxWidth: '38ch' }}
      >
        Imagine a clipping tool that worked on raw footage{' '}
        <span style={{ color: C(0.45) }}>
          (and on podcasts)<span style={{ color: ROYCE }}>.</span>
        </span>
      </p>

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
              {on && autoplay && !reduced && (
                <motion.span
                  key={active}
                  className="absolute inset-y-0 left-0 block"
                  style={{ background: `${ROYCE}33` }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: (TOTAL_MS + HOLD_MS) / 1000, ease: 'linear' }}
                />
              )}
              <span className="relative">{variant.tab}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border p-4 md:p-5" style={{ borderColor: C(0.1), background: PANEL }}>
       <div className={v.scrub ? 'grid gap-6 md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] md:items-center' : ''}>
        {/* claim + prompt */}
        <div className={v.scrub ? '' : 'mb-4'}>
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
            <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg border px-3 py-2" style={{ borderColor: C(0.12), background: INSET }}>
              <span style={{ color: SALMON, fontSize: 12 }}>✦</span>
              <motion.span
                key={`prev-${v.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="min-w-0 flex-1 font-ui"
                style={{ fontSize: 13, lineHeight: 1.45, color: C(0.7) }}
              >
                {v.promptPreview}
              </motion.span>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-lg border px-3.5 py-2 font-mono uppercase"
              style={{ fontSize: 10, letterSpacing: '0.1em', color: ROYCE, borderColor: `${ROYCE}55`, background: `${ROYCE}12` }}
            >
              Copy prompt
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="4.5" y="4.5" width="8" height="8" rx="1.6" stroke="currentColor" strokeWidth="1.3" />
                <path d="M9.5 2.5h-7a1 1 0 0 0-1 1v7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* the steps live out here, next to the stage — not inside it */}
          {v.scrub && (
            <ol className="mt-5 space-y-2">
              {v.scrub.steps.map((s, i) => {
                const on = i === scrubStep;
                return (
                  <li key={s} className="flex items-center gap-2.5">
                    <span
                      className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full font-mono"
                      style={{
                        fontSize: 8.5,
                        color: on ? '#0B1330' : C(0.45),
                        background: on ? ROYCE : 'transparent',
                        border: `1px solid ${on ? ROYCE : C(0.16)}`,
                        transition: 'all .25s',
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="font-ui"
                      style={{ fontSize: 13.5, color: on ? C(0.92) : C(0.42), transition: 'color .25s' }}
                    >
                      {s}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {v.scrub ? (
          <HeroScrub
            key={v.id}
            steps={v.scrub.steps}
            source={v.scrub.source}
            clips={v.scrub.clips}
            stackLabel={v.scrub.stackLabel}
            stackSub={v.scrub.stackSub}
            outLabel={v.outLabel}
            reduced={reduced}
            onScrub={() => setAutoplay(false)}
            onStep={setScrubStep}
          />
        ) : (
          <HeroFlow
            step={step}
            stepLabels={v.steps}
            fileCount={v.fileCount}
            analyzed={reduced ? v.fileCount : analyzed}
            files={v.inputFiles}
            mosaic={v.mosaic}
            concepts={v.concepts}
            outputs={v.outputs}
            moreOutputs={v.moreOutputs}
            outLabel={v.outLabel}
            reduced={reduced}
          />
        )}
       </div>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>{modalOpen && <PromptModal variant={v} onClose={() => setModalOpen(false)} />}</AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
