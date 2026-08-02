import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const CAPABILITIES = [
  { label: 'Batch day \u2192 multiple projects', icon: '\u2726' },
  { label: 'Podcast + B-roll \u2192 clip plan', icon: '\u2726' },
  { label: 'Replaces per-video setup', icon: '\u2726' },
];

const ACCENT = '#5481E8';

// Product screenshot override — set to swap the animation for a real screenshot
// (drop the file in public/images/features/).
const SCREENSHOT_SRC: string | null = null; // e.g. '/images/features/workflows.png'

function BatchVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  const inputFiles = [
    { name: 'shoot_day_01.mp4', size: '2.4 GB' },
    { name: 'shoot_day_02.mp4', size: '1.8 GB' },
    { name: 'shoot_day_03.mp4', size: '3.1 GB' },
    { name: 'brief.pdf', size: '420 KB' },
  ];

  const outputs = [
    { label: 'Full Episode Rough Cut',       duration: '12:34', accent: '#5481E8' }, // royce
    { label: 'Short 1 \u2014 Script 1 Hook A', duration: '0:42',  accent: '#F9838E' }, // salmon
    { label: 'Short 2 \u2014 Script 1 Hook B', duration: '0:38',  accent: '#9785B8' }, // lavender
    { label: 'Short 3 \u2014 Script 2',        duration: '0:58',  accent: '#C5A578' }, // ochre
  ];

  return (
    <div ref={ref}>
      <motion.div
        animate={{ opacity: isInView ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: 'rgba(14, 24, 52, 0.10)', background: '#F1EEE5' }}
      >
        {/* Window chrome */}
        <div
          className="flex items-center gap-1.5 px-4 py-3 border-b"
          style={{ borderColor: 'rgba(14, 24, 52, 0.08)' }}
        >
          <div className="w-2 h-2 rounded-full bg-clik-midnight/15" />
          <div className="w-2 h-2 rounded-full bg-clik-midnight/15" />
          <div className="w-2 h-2 rounded-full bg-clik-midnight/15" />
          <span className="ml-3 text-[10px] font-mono" style={{ color: 'rgba(14, 24, 52, 0.4)' }}>
            workflow agent
          </span>
        </div>

        {SCREENSHOT_SRC ? (
          <img src={SCREENSHOT_SRC} alt="Clik workflow agent" className="block w-full" loading="lazy" />
        ) : (
        <div className="px-4 py-5 space-y-4">
          {/* Input files */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(14, 24, 52, 0.5)' }}>
                Input
              </span>
              <div className="flex-1 h-px" style={{ background: 'rgba(14, 24, 52, 0.08)' }} />
            </div>
            <div className="space-y-1.5">
              {inputFiles.map((f, i) => (
                <motion.div
                  key={f.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2"
                  style={{ background: 'rgba(14, 24, 52, 0.04)', border: '1px solid rgba(14, 24, 52, 0.08)' }}
                >
                  <span className="text-xs" style={{ color: f.name.endsWith('.pdf') ? '#5481E8' : '#5481E8' }}>
                    {f.name.endsWith('.pdf') ? '\u{1F4CB}' : '\u{1F3AC}'}
                  </span>
                  <span className="text-xs flex-1" style={{ color: 'rgba(14, 24, 52, 0.7)' }}>{f.name}</span>
                  <span className="text-[10px]" style={{ color: 'rgba(14, 24, 52, 0.45)' }}>{f.size}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Processing indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="flex items-center justify-center gap-2 py-2"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1 h-1 rounded-full block"
                  style={{ background: ACCENT }}
                  animate={isInView ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.3 }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
            <span className="text-[10px]" style={{ color: 'rgba(14, 24, 52, 0.45)' }}>
              Processing batch footage against brief...
            </span>
          </motion.div>

          {/* Output drafts */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(14, 24, 52, 0.5)' }}>
                Output
              </span>
              <div className="flex-1 h-px" style={{ background: 'rgba(14, 24, 52, 0.08)' }} />
            </div>
            <div className="space-y-1.5">
              {outputs.map((o, i) => (
                <motion.div
                  key={o.label}
                  initial={{ opacity: 0, x: 8 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 8 }}
                  transition={{ delay: 0.7 + i * 0.12, duration: 0.3 }}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2"
                  style={{ background: `${o.accent}08`, border: `1px solid ${o.accent}18` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: o.accent }} />
                  <span className="text-xs flex-1" style={{ color: 'rgba(14, 24, 52, 0.78)' }}>{o.label}</span>
                  <span className="text-[10px] font-mono" style={{ color: `${o.accent}80` }}>{o.duration}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        )}
      </motion.div>
    </div>
  );
}

export default function FeatureWorkflows() {
  return (
    <section id="workflows" className="relative py-24 md:py-32 px-6 overflow-hidden">
      <div className="mx-auto max-w-6xl flex flex-col lg:flex-row-reverse items-start gap-12 lg:gap-20">
        {/* Right: copy (alternating layout — opposite of Brand Memory) */}
        <div className="flex-1 lg:max-w-md lg:sticky lg:top-32">
          <div className="clik-section-header">
            <span className="idx">[ 04 ]</span>
            <span className="rule"></span>
            <span className="label">WORKFLOWS</span>
          </div>
          <h2
            className="font-display font-medium leading-[1.05] mb-5 text-clik-midnight"
            style={{ fontSize: 'clamp(28px, 4vw, 46px)', letterSpacing: '-0.02em' }}
          >
            A full batch in. Every video planned<span style={{ color: '#5481E8' }}>.</span>
          </h2>
          <p className="text-base md:text-lg leading-relaxed mb-6" style={{ color: 'rgba(14, 24, 52, 0.7)' }}>
            The agent takes a complete set of inputs — a batch day, a podcast plus your B-roll — and plans every
            video output from it. Each concept gets its own project, configured and ready to build. No more
            per-video setup.
          </p>

          {/* Capability pills */}
          <div className="flex flex-wrap gap-2.5 mb-8">
            {CAPABILITIES.map((cap) => (
              <span
                key={cap.label}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm"
                style={{
                  border: '1px solid #5481E820',
                  background: '#5481E808',
                  color: 'rgba(14, 24, 52, 0.7)',
                }}
              >
                <span style={{ color: ACCENT, fontSize: 10 }}>{cap.icon}</span>
                {cap.label}
              </span>
            ))}
          </div>

          {/* Proof line */}
          <div
            className="rounded-xl px-4 py-3 text-sm mb-8"
            style={{
              background: '#5481E808',
              border: '1px solid #5481E815',
              color: '#5481E8CC',
            }}
          >
            Feed Studios LA estimates Clik cuts ~90% of the work out of their editing flow.
          </div>

          {/* CTA */}
          <a
            href="https://calendly.com/clikphotos/clik-agency-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="clik-btn clik-btn-primary"
          >
            Book a Demo
          </a>
        </div>

        {/* Left: batch visual */}
        <div className="flex-1 w-full lg:max-w-xl">
          <BatchVisual />
        </div>
      </div>
    </section>
  );
}
