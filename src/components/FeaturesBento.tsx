import {
  BrandMemoryVisual,
  PlanningVisual,
  EditAgentVisual,
  DashboardVisual,
} from './FeatureVisuals';

// The four-part flow as a bento grid — card anatomy borrowed from the
// Mintlify-style inspo: glyph tile top-left, abstract product-UI mockup in the
// middle, title + description at the bottom. Visuals live in FeatureVisuals.tsx
// so a real product screenshot can replace any one of them independently.

const ROYCE = '#5481E8';
const SALMON = '#F9838E';
const SAGE = '#7CA088';
const LAVENDER = '#9785B8';
const CREAM = (a: string) => `rgba(249, 247, 241, ${a})`;

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
    desc: 'The agent reads concepts, dialogue, and visuals, classifies every clip — interview, B-roll, everything else — and drafts a slate of videos against your brand rules. You approve, it builds.',
    wide: true,
    Visual: PlanningVisual,
  },
  {
    glyph: '◆',
    glyphColor: SALMON,
    title: 'Teach it once',
    desc: 'Caption style, title cards, hooks, skills, brand assets — saved once and applied to every project, instead of briefing someone every time.',
    wide: false,
    Visual: BrandMemoryVisual,
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
    desc: 'The build agent cuts the dead air out of your dialogue and pulls B-roll from your own library by what the moment actually means — not by filename.',
    wide: true,
    Visual: EditAgentVisual,
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
          The same flow regardless of format — brand memory upstream, an agent planning at the batch level, a build
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
