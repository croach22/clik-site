import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
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
  headline: string;
  claim: string;
  prompts: { label: string; blurb: string; body: string }[];
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
    headline: 'One episode. Eight clips.',
    claim: 'Build on-brand clipping flows based on your target audience, hook structures, and more.',
    prompts: [{ label: 'Clip an episode', blurb: 'For one episode plus your own B-roll library.', body: "Here's episode 42, plus my B-roll library and my graphics.\n\nPull the 8 strongest moments from the episode and build them as vertical clips.\n\nWhen a moment needs a cutaway, use my own B-roll, matched to what's actually being said. Never stock.\n\nOUTPUT\nVertical 9:16. My saved caption style. Title card on every clip, using my saved title card rules. Cut the dead air out of the dialogue." }],
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
      source: {
        kind: 'landscape',
        src: '/videos/showcase/podcast/raw.mp4',
        name: 'full_signal_ep.mp4',
        dur: '42:46',
      },
      clips: [
        { title: 'Want the crash', dur: '1:09', label: 'clip_01', accent: ROYCE, src: '/videos/showcase/podcast/out-a.mp4' },
        { title: 'The AI bubble', dur: '1:01', label: 'clip_02', accent: SALMON, src: '/videos/showcase/podcast/out-b.mp4' },
      ],
      stackLabel: '+6',
      stackSub: 'clips · your B-roll',
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
    headline: 'One shoot day. A month of posts.',
    claim: 'Clik reads the whole batch, splits it by concept, and plans what you can actually make from what you shot.',
    prompts: [{ label: 'Plan a batch before you build', blurb: 'For an unsorted shoot day, when you want the plan before the cut.', body: "Here's a full content day, 79 clips, unsorted.\n\nFind the 3 to 5 strongest short-form concepts, 45 to 60 seconds each. Every one needs a real arc: an opening, a middle, and an end, plus an insight or a story that is actually entertaining or worth learning. Build each one chronologically. Don't scramble the order to make it work.\n\nOpen every clip on its strongest line, then a title card. Build 2 hook variants of each.\n\nCut to my own B-roll for about 40% of the runtime, a new visual roughly every three seconds, matched to what is being said. If someone names a thing, show the thing. Hold on their face for the payoff line.\n\nDon't build anything yet. Give me the report first: the hook, the arc, why it works, and the B-roll you would cut to.\n\nIf there are more than five concepts in there, tell me and we will build the rest after.\n\nOUTPUT\nVertical 9:16. My saved caption style. Two-second title card on every clip, using my saved title card rules." }],
    outputs: [
      { label: 'vidA_hookA', dur: '0:57', accent: ROYCE, src: '/videos/showcase/content-day/out-a.mp4' },
      { label: 'vidB_hookA', dur: '0:47', accent: SALMON, src: '/videos/showcase/content-day/out-b.mp4' },
    ],
    moreOutputs: 8,
    scrub: {
      steps: [
        'Watching 79 raw clips',
        'Tagging A-roll and B-roll',
        'Pulling out actions and scenes',
        'Planning narrative concepts and building the videos',
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
    outLabel: '5 variants',
    headline: 'One interview. Five hooks to test.',
    claim:
      'Create multiple interview variations instantly to increase reach on trial reels and find winning formats faster.',
    prompts: [
      { label: 'Single interview variations', blurb: 'For one person, when you want five versions to test against each other.', body: "You are editing a raw street interview into a matchmaker format: I stop one single person on the street, run a fixed set of dating questions, and pitch them to the audience. One interview, one video. Let the narrative decide the duration.\n\nFORMAT\nA repeatable dating-matchmaker Q&A. Same question script every time. The edit tightens it into a fast, warm, funny clip that opens on \"Are you single?\" and closes by pitching the person to the audience. Their personality plus my playful reframes carry it. Use my saved caption style.\n\nINPUT\nOne street interview. Me off camera asking, one person answering while walking or standing. Handheld, mostly one continuous take. Keep it vertical. No B-roll.\n\nTHE QUESTION ARC\n1. Open: \"Are you single?\"\n2. \"I want to help you find a very cool boyfriend / girlfriend.\"\n3. \"Why are you single?\"\n4. \"What's your type?\" then my playful reframe\n5. \"What's your ideal first date?\"\n6. \"What do you bring into a relationship?\"\n7. Optional: do they need to be local, or open to long distance\n8. Close: \"If you're a cool guy / girl who wants to date this person, slide into their DMs.\"\n\nThis is an example arc from a high performing creator. The actual interview may run differently, so follow what is in the footage.\n\nVARIANTS, five in total\nA, one version. Cold open on the opening question and their reaction. The signature.\nB, three versions. Find their best funny, surprising or spicy lines and build three separate versions, each cold-opening on a different one for 3 to 7 seconds, then cutting back to \"Are you single?\" and running the arc. Pick the three most distinct so the versions feel genuinely different.\nC, one version. Start from a middle question, run through to the DM line, then cut back to the open.\n\nPACING\nNarrative-driven. Keep the full arc. Length is emergent, roughly 45 to 80 seconds, never a target, never cut for time. Trim only genuine dead air over about three seconds, filler, false starts, repeated takes, and energy dips. Keep the banter, the natural pauses, and the funny beats. Cut any production talk.\n\nCUT\nFiller, false starts, dead air, repeated takes, off-topic tangents, anyone else or behind-camera chatter, long walking with no talking.\n\nDO NOT\nChange the question order after the chosen opener. Cut the open or the matchmaker close. Add B-roll or music. Lose my playful reframes, they are the charm.\n\nOUTPUT\nFive versions, vertical 9:16, with one line each on which beat it opens on. My saved caption style, and my saved title card rules on the cold open. If the interview genuinely lacks three distinct funny moments, say so and give me the best available rather than forcing weak hooks." },
      { label: 'Compilation flow', blurb: 'For a full day of interviews, cut into three compilations.', body: "Here's a full day of street interviews. Every answer is its own file, no master.\n\nWatch all of it and build me three compilations, 60 to 90 seconds each, each on a different spine:\n\n1. One question, everyone. Pick the question that got the widest range of answers and cut the best responses back to back, ordered so it builds.\n2. Best of the day. The funniest and most surprising moments across every interview, regardless of question.\n3. One theme. Find a thread that runs through several interviews on its own and cut only what serves it.\n\nOpen each one on the strongest line in that compilation, not on my question. Keep every answer in the order it was said within its own interview. Never stitch one person's sentence onto another's.\n\nVertical 9:16, my saved caption style, and a title card on each one using my saved title card rules. Cut dead air, filler, false starts, and production talk. No B-roll, no music.\n\nDon't build anything yet. Give me the report first: which spine, which interviews it pulls from, the opening line, and roughly how long it runs." },
    ],
    outputs: [
      { label: 'recap_guest01', dur: '0:48', accent: ROYCE },
      { label: 'recap_guest02', dur: '0:52', accent: SALMON },
      { label: 'recap_guest03', dur: '0:44', accent: SAGE },
      { label: 'compilation_best', dur: '1:24', accent: LAVENDER },
      { label: 'teaser_hookA', dur: '0:22', accent: OCHRE },
    ],
    scrub: {
      steps: [
        'Watching the whole interview',
        'Cutting the restarts and retakes',
        'Writing opens against your hook rules',
        'Building every version to test',
      ],
      source: {
        kind: 'take',
        src: '/videos/showcase/street-interviews/raw.mp4',
        name: 'IMG_1826.MOV',
        dur: '2:39',
        note: 'one interview · mostly restarts',
        takes: [
          { n: '01', cut: true },
          { n: '02', cut: false },
          { n: '03', cut: true },
          { n: '04', cut: true },
          { n: '05', cut: false },
          { n: '06', cut: true },
        ],
      },
      clips: [
        { title: 'Standard open', dur: '1:13', label: 'variant_a', accent: ROYCE, src: '/videos/showcase/street-interviews/out-a.mp4' },
        { title: "\u2018I don\u2019t know you\u2019", dur: '1:10', label: 'variant_b1', accent: SALMON, src: '/videos/showcase/street-interviews/out-b.mp4' },
        { title: 'Mid-question flip', dur: '0:57', label: 'variant_c', accent: SAGE, src: '/videos/showcase/street-interviews/out-c.mp4' },
      ],
      stackLabel: '+2',
    },
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
    headline: 'One yap session. A week of posts.',
    claim: 'Clik detects concept boundaries, alternate spoken hooks, and builds polished talking head videos.',
    prompts: [{ label: 'One sitting of takes', blurb: 'For a batch film day, one polished video per concept.', body: "This is a batch film day. For each unique concept in here, build me one polished video.\n\nIf I've pasted a brief or the scripts below, use them to set the concept boundaries and tell me which takes map to which script.\n\nIf I haven't, work the boundaries out from the footage itself: where one idea ends and the next begins, which takes are attempts at the same thing, and which delivery is the strongest.\n\nDrop the flubs, the restarts, and every pause.\n\nOUTPUT\nVertical 9:16. My saved caption style. Title card on every video, using my saved title card rules. My saved hook rules.\n\nTell me what you found before you build: the concepts, how many takes each, and which one you're keeping." }],
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
  const [copied, setCopied] = useState<number | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const copy = async (body: string, i: number) => {
    try {
      await navigator.clipboard.writeText(body);
    } catch {
      /* clipboard blocked — the prompt stays selectable above */
    }
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
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
        /* Wide rather than tall, and the only thing that scrolls is the prompt
           itself, so the actions never leave the screen. */
        className="flex max-h-[92vh] w-full max-w-[1200px] flex-col overflow-hidden rounded-t-2xl border p-6 sm:max-h-[86vh] sm:rounded-2xl md:p-8"
        style={{ borderColor: C(0.12), background: PANEL }}
      >
        {/* Header — actions live here so they are always visible */}
        <div className="flex flex-shrink-0 flex-wrap items-start justify-between gap-4">
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

          <div className="flex items-center gap-3">
            <a href={SIGNUP} className="clik-btn clik-btn-primary">
              Start for free <span aria-hidden="true">→</span>
            </a>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ color: C(0.5) }}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* One prompt at a time, chosen from a toggle, so the active one gets
            the full width and the actions stay put. */}
        {variant.prompts.length > 1 && (
          <div role="tablist" aria-label="Prompts" className="mt-6 flex flex-shrink-0 flex-wrap gap-2">
            {variant.prompts.map((pr, i) => {
              const on = i === active;
              return (
                <button
                  key={pr.label}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(i)}
                  className="rounded-lg border px-3.5 py-2 font-mono uppercase transition-colors"
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    color: on ? '#F9F7F1' : C(0.55),
                    borderColor: on ? `${ROYCE}70` : C(0.12),
                    background: on ? `${ROYCE}1A` : 'transparent',
                  }}
                >
                  {pr.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-5 flex min-h-0 flex-1 flex-col">
          <div className="mb-3 flex flex-shrink-0 flex-wrap items-center justify-between gap-3">
            <p className="font-ui" style={{ fontSize: 14, color: C(0.6) }}>
              {variant.prompts[active].blurb}
            </p>
            <button
              onClick={() => copy(variant.prompts[active].body, active)}
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 font-mono uppercase"
              style={{
                fontSize: 10,
                letterSpacing: '0.1em',
                color: ROYCE,
                borderColor: `${ROYCE}55`,
                background: `${ROYCE}12`,
              }}
            >
              {copied === active ? 'Copied ✓' : 'Copy prompt'}
            </button>
          </div>

          <div
            className="min-h-0 flex-1 overflow-y-auto rounded-xl border p-5"
            style={{ borderColor: C(0.1), background: INSET }}
          >
            <pre
              className="whitespace-pre-wrap font-ui"
              style={{ fontSize: 13.5, lineHeight: 1.6, color: C(0.85), margin: 0 }}
            >
              {variant.prompts[active].body}
            </pre>
          </div>
        </div>

        {/* How to use it — one compact row, never scrolls away */}
        <div className="mt-6 flex-shrink-0 border-t pt-5" style={{ borderColor: C(0.1) }}>
          <ol className="flex flex-wrap gap-x-6 gap-y-2">
            {STEPS_HOWTO.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full font-mono"
                  style={{ fontSize: 9, color: ROYCE, background: `${ROYCE}15`, border: `1px solid ${ROYCE}40` }}
                >
                  {i + 1}
                </span>
                <span className="font-ui" style={{ fontSize: 13, color: C(0.6) }}>
                  {step}
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
      {/* No display headline here — it sat directly under the h1 and the two
          competed. This reads as the hero continuing, and echoes "any video
          input" so the tabs are obviously the thing to touch. */}
      <p className="mb-3 font-mono uppercase" style={{ fontSize: 11, letterSpacing: '0.14em', color: C(0.45) }}>
        Pick your input
      </p>

      <div role="tablist" aria-label="Workflow examples" className="mb-4 flex flex-wrap gap-2">
        {VARIANTS.map((variant, i) => {
          const on = i === active;
          return (
            <button
              key={variant.id}
              role="tab"
              aria-selected={on}
              onClick={() => pick(i)}
              className="relative overflow-hidden rounded-lg border px-4 py-2.5 font-mono uppercase transition-colors"
              style={{
                fontSize: 12,
                letterSpacing: '0.1em',
                color: on ? '#F9F7F1' : C(0.62),
                borderColor: on ? `${ROYCE}70` : C(0.16),
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
       <div className="grid gap-6 md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] md:items-center">
        {/* claim + prompt */}
        <div>
          <motion.h3
            key={`head-${v.id}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="font-display font-medium text-clik-cream"
            style={{ fontSize: 'clamp(22px, 2.4vw, 28px)', lineHeight: 1.15, letterSpacing: '-0.01em' }}
          >
            {v.headline}
          </motion.h3>

          <motion.p
            key={`claim-${v.id}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="mt-3 font-ui"
            style={{ fontSize: 15, lineHeight: 1.55, color: C(0.62), maxWidth: '48ch' }}
          >
            {v.claim}
          </motion.p>

          {/* The truncated preview said less than the headline already does
              and stole the button's weight. One button instead. */}
          <button
            onClick={() => setModalOpen(true)}
            className="mt-5 inline-flex items-center gap-2.5 rounded-xl border px-5 py-3 font-ui transition-colors"
            style={{ fontSize: 14, color: '#F9F7F1', borderColor: `${ROYCE}70`, background: `${ROYCE}20` }}
          >
            <span aria-hidden="true" style={{ color: SALMON, fontSize: 13 }}>✦</span>
            Run this workflow
            <span aria-hidden="true" style={{ color: C(0.5) }}>→</span>
          </button>

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
