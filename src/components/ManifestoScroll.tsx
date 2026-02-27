import { useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

const PEEK = 22;

const PANELS = [
  {
    label: 'Creators',
    preLabel: 'For',
    postLabel: 'who want to direct,',
    faded: 'not edit.',
    body: 'You have the footage and can describe the story you want to tell. Now you get to do that, without scrubbing timelines all day.',
    accent: '#DC1DD9',
  },
  {
    label: 'Founders',
    preLabel: 'For',
    postLabel: 'who want to build in public,',
    faded: 'not in silence.',
    body: 'You can build a business around anything you love \u2014 if you share it. You don\u2019t need a content team. You need help putting your story out there.',
    accent: '#5481E8',
  },
  {
    label: 'Marketers',
    preLabel: 'For',
    postLabel: 'who want to move fast,',
    faded: 'not wait on post.',
    body: 'You already describe edit revisions conversationally, now you get to make edits through conversation instantly.',
    accent: '#F9838E',
  },
  {
    label: 'Everyone',
    preLabel: 'For',
    postLabel: 'with something',
    faded: 'worth sharing.',
    body: 'You shouldn\u2019t have to be an expert video editor or content strategist to share what you love with the world. Just be yourself, we help you share it.',
    accent: '#D4A853',
  },
];

export default function ManifestoScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePanel, setActivePanel] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', v => {
    setActivePanel(v < 0.25 ? 0 : v < 0.5 ? 1 : v < 0.75 ? 2 : 3);
  });

  return (
    <section ref={containerRef} className="relative h-[400vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center px-6">

        {/* Section label */}
        <p
          className="mb-10 text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: '#a78bfa88' }}
        >
          Our belief
        </p>

        {/* Card stack */}
        <div className="relative w-full max-w-2xl" style={{ minHeight: 380 }}>
          {PANELS.map((panel, i) => {
            const isRevealed = i <= activePanel;
            const isActive = i === activePanel;
            const isLast = i === 3;

            return (
              <motion.div
                key={i}
                className="absolute inset-x-0 rounded-2xl"
                style={{
                  zIndex: 10 + i,
                  border: `1px solid ${panel.accent}${isActive ? '30' : '18'}`,
                  background: isLast && isActive ? '#1a1a20' : '#141417',
                }}
                initial={false}
                animate={{
                  y: isRevealed ? i * PEEK : 280,
                  opacity: isRevealed ? 1 : 0,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 220,
                  damping: 28,
                }}
              >
                {/* Card content */}
                <div className="px-8 pb-8 pt-7">
                  {/* Headline with inline pill */}
                  <h2
                    className="mb-5 text-2xl font-bold leading-snug md:text-4xl"
                    style={{ color: '#F9F7F1' }}
                  >
                    {panel.preLabel}{' '}
                    <span
                      className="relative -top-[3px] mr-1 inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 align-middle text-[0.5em] font-semibold"
                      style={{
                        borderColor: panel.accent + '35',
                        background: panel.accent + '10',
                        color: panel.accent,
                      }}
                    >
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{
                          background: panel.accent,
                          boxShadow: `0 0 6px ${panel.accent}60`,
                        }}
                      />
                      {panel.label}
                    </span>{' '}
                    {panel.postLabel}{' '}
                    <span style={{ color: isLast ? '#D4A853' : '#ffffff70' }}>
                      {panel.faded}
                    </span>
                  </h2>

                  {/* Body */}
                  <p
                    className="max-w-lg text-base leading-relaxed"
                    style={{ color: isLast ? '#ffffffAA' : '#ffffff80' }}
                  >
                    {panel.body}
                  </p>

                  {/* Manifesto closer — People panel only */}
                  {'manifesto' in panel && panel.manifesto && (
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="mt-6 text-base font-semibold md:text-lg"
                      style={{ color: '#F9F7F1' }}
                    >
                      {panel.manifesto}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress dots */}
        <div className="mt-12 flex items-center justify-center gap-2">
          {PANELS.map((p, i) => (
            <div
              key={i}
              className="h-1 rounded-full transition-all duration-500 ease-out"
              style={{
                width: i === activePanel ? 28 : 6,
                background: i === activePanel ? p.accent : '#ffffff12',
              }}
            />
          ))}
        </div>

        {/* Scroll hint */}
        <AnimatePresence>
          {activePanel === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.15, 0.35, 0.15] }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2.8 }}
              className="absolute bottom-10 text-xs tracking-wide"
              style={{ color: '#ffffff25' }}
            >
              scroll ↓
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
