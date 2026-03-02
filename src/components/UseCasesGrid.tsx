import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const TOP_ROW = [
  {
    slug: 'cooking',
    emoji: '\u{1F373}',
    label: 'Cooking',
    description: 'Detects ingredients, steps, and plating \u2014 your recipe becomes a draft instantly.',
    accent: '#F9838E',
    bg: '#2A0D18',
  },
  {
    slug: 'grwm',
    emoji: '\u{1F484}',
    label: 'GRWM',
    description: 'Products, outfit changes, and look transitions \u2014 detected and paced to match your routine.',
    accent: '#DC1DD9',
    bg: '#180D2A',
  },
  {
    slug: 'vlogs',
    emoji: '\u{1F392}',
    label: 'Vlogs',
    description: 'A timeline full of moments that tell the story of your day \u2014 built instantly.',
    accent: '#5481E8',
    bg: '#0D1B3E',
  },
];

const BOTTOM_ROW = [
  {
    slug: 'talking-head',
    emoji: '\u{1F399}\uFE0F',
    label: 'Talking Head',
    description: 'Dead space and bad takes, cut instantly \u2014 whether you script or yap.',
    accent: '#D4A853',
    bg: '#1A1808',
  },
  {
    slug: 'diy',
    emoji: '\u{1F528}',
    label: 'DIY',
    description: 'Say goodbye to dead space. Hello to a timeline full of real actions.',
    accent: '#F9F7F1',
    bg: '#1A1A1A',
  },
];

function UseCard({ card }: { card: typeof TOP_ROW[number] }) {
  return (
    <div
      className="group relative z-0 flex flex-col justify-end overflow-hidden rounded-2xl border transition-all duration-300 hover:z-50 hover:scale-[1.02]"
      style={{
        borderColor: card.accent + '18',
        background: card.bg,
        aspectRatio: '9 / 14',
      }}
    >
      {/* Video background */}
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500"
        src={`/videos/use-cases/${card.slug}.mp4`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onCanPlayThrough={(e) => {
          (e.target as HTMLVideoElement).style.opacity = '1';
        }}
        onLoadedData={(e) => {
          (e.target as HTMLVideoElement).style.opacity = '1';
        }}
      />
      {/* Fallback gradient (shows until video loads) */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(ellipse at 50% 60%, ${card.accent}30 0%, transparent 70%)`,
        }}
      />
      {/* Darken overlay so text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Card info pinned to bottom */}
      <div className="relative mt-auto px-5 pb-5 pt-4">
        <h3
          className="mb-1.5 text-lg font-bold"
          style={{ color: '#F9F7F1' }}
        >
          {card.label}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: '#ffffff70' }}
        >
          {card.description}
        </p>
      </div>

      {/* Hover border glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 0 1px ${card.accent}30`,
        }}
      />
    </div>
  );
}

export default function UseCasesGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 80%', 'start 30%'],
  });

  const bottomY = useTransform(scrollYProgress, [0, 1], [80, -24]);
  const bottomOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  return (
    <section ref={sectionRef} id="use-cases" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-14 text-center">
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: '#a78bfa88' }}
          >
            Use Cases
          </p>
          <h2
            className="text-3xl font-bold md:text-5xl"
            style={{ color: '#F9F7F1' }}
          >
            Every format has a structure. We learned yours.
          </h2>
        </div>

        {/* All 5 cards — single column on mobile (80vw each), 3+2 on desktop */}
        <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-6 justify-items-center">
          {TOP_ROW.map((card) => (
            <div key={card.slug} className="w-[80vw] sm:w-auto sm:col-span-2">
              <UseCard card={card} />
            </div>
          ))}
        </div>

        {/* Bottom row — 2 cards, slides up to overlap */}
        <motion.div
          className="relative grid grid-cols-1 gap-4 sm:grid-cols-6 justify-items-center"
          style={{
            y: bottomY,
            opacity: bottomOpacity,
          }}
        >
          {BOTTOM_ROW.map((card, i) => (
            <div key={card.slug} className={`w-[80vw] sm:w-auto sm:col-span-2 ${i === 0 ? 'sm:col-start-2' : ''}`}>
              <UseCard card={card} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
