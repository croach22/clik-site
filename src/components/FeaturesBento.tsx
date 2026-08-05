import {
  BrandMemoryVisual,
  PlanningVisual,
  EditAgentVisual,
  DashboardVisual,
} from './FeatureVisuals';

// The four-part flow as a bento grid. Card anatomy: abstract product-UI mockup
// floating directly on the card (no inner window chrome — the card is already
// the frame), then title + description. Visuals live in FeatureVisuals.tsx so a
// real product screenshot can replace any one of them independently.

const ROYCE = '#5481E8';
const CREAM = (a: string) => `rgba(249, 247, 241, ${a})`;

interface Card {
  title: string;
  desc: string;
  wide: boolean;
  Visual: () => JSX.Element;
}

const CARDS: Card[] = [
  {
    title: 'A full batch in. Every video planned',
    desc: 'The agent reads concepts, dialogue, and visuals. It classifies every clip: interview, B-roll, everything else. Then it drafts a slate of videos against your brand rules. You approve, it builds.',
    wide: true,
    Visual: PlanningVisual,
  },
  {
    title: 'Teach it once',
    desc: 'Caption style, title cards, hooks, skills, brand assets. Saved once, applied to every project, so you stop briefing someone every time.',
    wide: false,
    Visual: BrandMemoryVisual,
  },
  {
    title: 'See where everything stands',
    desc: "Status across every project. What's planned, what's building, what's ready to review. The whole engine in one view.",
    wide: false,
    Visual: DashboardVisual,
  },
  {
    title: 'Approved plan in. Built videos out',
    desc: 'The build agent cuts the dead air out of your dialogue, then pulls B-roll from your own library by what the moment actually means, not by filename.',
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
      <div className="flex-1 flex flex-col justify-center">
        <Visual />
      </div>
      {/* Wide cards split the footer into two columns so the copy uses the full
          card width without pushing line length past a readable measure. */}
      <div className={card.wide ? 'grid gap-x-10 gap-y-2 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-baseline' : ''}>
        <h3
          className="font-display font-medium text-clik-cream"
          style={{ fontSize: 21, letterSpacing: '-0.01em', lineHeight: 1.2 }}
        >
          {card.title}
          <span style={{ color: ROYCE }}>.</span>
        </h3>
        <p
          className={card.wide ? 'font-ui' : 'mt-2 font-ui'}
          style={{ fontSize: 15, lineHeight: 1.55, color: CREAM('0.65') }}
        >
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
          <span className="idx">[ 02 ]</span>
          <span className="rule"></span>
          <span className="label">THE SYSTEM</span>
        </div>

        <h2
          className="font-display font-medium text-clik-cream"
          style={{ fontSize: 'clamp(36px, 4.5vw, 46px)', lineHeight: 1.1, letterSpacing: '-0.02em' }}
        >
          One engine. Four parts<span style={{ color: ROYCE }}>.</span>
        </h2>
        <p className="mt-5 font-ui" style={{ fontSize: 17, lineHeight: 1.55, color: CREAM('0.7'), maxWidth: '92ch' }}>
          The same flow regardless of format. Brand memory upstream, an agent planning at the batch level, a build
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
