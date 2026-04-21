import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const CAPABILITIES = [
  { label: 'Batch footage \u2192 multi-draft output', icon: '\u2726' },
  { label: 'Creative director brief drives every cut', icon: '\u2726' },
  { label: 'Long-form rough cut + curated shorts', icon: '\u2726' },
];

const ACCENT = '#5481E8';

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
    { label: 'Full Episode Rough Cut', duration: '12:34', accent: '#5481E8' },
    { label: 'Short 1 \u2014 Script 1 Hook A', duration: '0:42', accent: '#F9838E' },
    { label: 'Short 2 \u2014 Script 1 Hook B', duration: '0:38', accent: '#DC1DD9' },
    { label: 'Short 3 \u2014 Script 2', duration: '0:58', accent: '#D4A853' },
  ];

  return (
    <div ref={ref}>
      <motion.div
        animate={{ opacity: isInView ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: '#ffffff10', background: '#ffffff03' }}
      >
        {/* Window chrome */}
        <div
          className="flex items-center gap-1.5 px-4 py-3 border-b"
          style={{ borderColor: '#ffffff08' }}
        >
          <div className="w-2 h-2 rounded-full bg-zinc-700" />
          <div className="w-2 h-2 rounded-full bg-zinc-700" />
          <div className="w-2 h-2 rounded-full bg-zinc-700" />
          <span className="ml-3 text-[10px] font-mono" style={{ color: '#ffffff20' }}>
            workflow agent
          </span>
        </div>

        <div className="px-4 py-5 space-y-4">
          {/* Input files */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#ffffff40' }}>
                Input
              </span>
              <div className="flex-1 h-px" style={{ background: '#ffffff08' }} />
            </div>
            <div className="space-y-1.5">
              {inputFiles.map((f, i) => (
                <motion.div
                  key={f.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2"
                  style={{ background: '#ffffff05', border: '1px solid #ffffff08' }}
                >
                  <span className="text-xs" style={{ color: f.name.endsWith('.pdf') ? '#D4A853' : '#5481E8' }}>
                    {f.name.endsWith('.pdf') ? '\u{1F4CB}' : '\u{1F3AC}'}
                  </span>
                  <span className="text-xs flex-1" style={{ color: '#F9F7F1AA' }}>{f.name}</span>
                  <span className="text-[10px]" style={{ color: '#ffffff30' }}>{f.size}</span>
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
            <span className="text-[10px]" style={{ color: '#ffffff30' }}>
              Processing batch footage against brief...
            </span>
          </motion.div>

          {/* Output drafts */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#ffffff40' }}>
                Output
              </span>
              <div className="flex-1 h-px" style={{ background: '#ffffff08' }} />
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
                  <span className="text-xs flex-1" style={{ color: '#F9F7F1BB' }}>{o.label}</span>
                  <span className="text-[10px] font-mono" style={{ color: `${o.accent}80` }}>{o.duration}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function FeatureWorkflowAgent() {
  return (
    <section className="relative py-24 md:py-32 px-6 overflow-hidden">
      <div className="mx-auto max-w-6xl flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
        {/* Left: copy */}
        <div className="flex-1 lg:max-w-md lg:sticky lg:top-32">
          <p
            className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: ACCENT }}
          >
            Workflow Agent
            <span
              className="rounded-full text-xs normal-case tracking-normal"
              style={{
                color: '#5481E8',
                fontSize: 10,
                border: '1px solid #5481E840',
                padding: '2px 8px',
                background: '#5481E810',
              }}
            >
              New
            </span>
          </p>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] mb-5"
            style={{ color: '#F9F7F1' }}
          >
            Shoot day in. Multiple drafts out.
          </h2>
          <p className="text-base md:text-lg leading-relaxed mb-6" style={{ color: '#ffffff70' }}>
            Feed the agent batch footage from a shoot day plus a brief from your creative director — topics, angles,
            direction for clips. It spits out a long-form rough cut and a curated set of shorts, all configured to the
            brief. Editors just make the finishing touches.
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
                  color: '#F9F7F1AA',
                }}
              >
                <span style={{ color: ACCENT, fontSize: 10 }}>{cap.icon}</span>
                {cap.label}
              </span>
            ))}
          </div>

          {/* Comparison line */}
          <p className="text-sm mb-4" style={{ color: '#ffffff50' }}>
            Like Opus Clips, but with creative control.
          </p>

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
            className="inline-block rounded-full px-8 py-3.5 text-base font-semibold text-white transition-all hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}, #DC1DD9)`,
            }}
          >
            Book a Demo
          </a>
        </div>

        {/* Right: batch visual */}
        <div className="flex-1 w-full lg:max-w-xl">
          <BatchVisual />
        </div>
      </div>
    </section>
  );
}
