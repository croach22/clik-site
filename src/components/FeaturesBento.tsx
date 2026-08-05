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
  step: string;
  title: string;
  desc: string;
  Visual: () => JSX.Element;
}

// Chronological, because that's the only order that explains itself: you teach
// it once, then every project runs plan → build → track.
const CARDS: Card[] = [
  {
    step: '01',
    title: 'Save your brand rules',
    desc: 'Caption style, title cards, hooks, skills, brand assets. Saved once, applied to every project, so you stop briefing someone every time.',
    Visual: BrandMemoryVisual,
  },
  {
    step: '02',
    title: 'The agent plans the batch',
    desc: 'It reads concepts, dialogue, and visuals, classifies every clip, then drafts a slate of videos against your rules. You approve, it builds.',
    Visual: PlanningVisual,
  },
  {
    step: '03',
    title: 'The build agent cuts it',
    desc: 'It cuts the dead air out of your dialogue, then pulls B-roll from your own library by what the moment actually means, not by filename.',
    Visual: EditAgentVisual,
  },
  {
    step: '04',
    title: 'Track every project',
    desc: "Status across the whole slate. What's planned, what's building, what's ready to review, in one view the team can see.",
    Visual: DashboardVisual,
  },
];

function BentoCard({ card }: { card: Card }) {
  const { Visual } = card;
  return (
    <div
      className="bento-card flex flex-col gap-6 border p-6 md:p-7"
      style={{ borderColor: CREAM('0.10'), background: CREAM('0.03') }}
    >
      <span
        className="font-mono uppercase"
        style={{ fontSize: 11, letterSpacing: '0.14em', color: ROYCE }}
      >
        {card.step}
      </span>

      <div className="flex flex-1 flex-col justify-center">
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
        <p className="mt-2 font-ui" style={{ fontSize: 15, lineHeight: 1.55, color: CREAM('0.65') }}>
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
          <span className="label">HOW IT WORKS</span>
        </div>

        <h2
          className="font-display font-medium text-clik-cream"
          style={{ fontSize: 'clamp(36px, 4.5vw, 46px)', lineHeight: 1.1, letterSpacing: '-0.02em' }}
        >
          Set it up once. It runs every project<span style={{ color: ROYCE }}>.</span>
        </h2>
        <p className="mt-5 font-ui" style={{ fontSize: 17, lineHeight: 1.55, color: CREAM('0.7'), maxWidth: '92ch' }}>
          Teach it your brand once. After that every project runs the same way, whatever you point it at: the agent
          plans the batch, the build agent cuts it, and you watch the whole slate move.
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {CARDS.map((card) => (
            <BentoCard key={card.title} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
