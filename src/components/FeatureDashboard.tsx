import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// Project dashboard — the team-visibility layer of the four-part flow.
// Visual is a RESERVED SLOT: static status board in the established
// bone/chrome frame with the cheap stagger-reveal pattern. A richer visual
// can land in the animation phase without changing the slot's dimensions.

const CAPABILITIES = [
  { label: 'Project status', icon: '✦' },
  { label: 'Team collaboration', icon: '✦' },
  { label: 'Review queue', icon: '✦' },
];

const ACCENT = '#5481E8';

// Muted product-viz accents (royce + salmon primary; sage/lavender/ochre differentiate data)
const PROJECTS = [
  { name: 'Podcast EP 42 — clips', videos: '8 videos', status: 'Ready for review', accent: '#5481E8' },
  { name: 'Batch day 06.12 — concepts', videos: '5 videos', status: 'Building', accent: '#F9838E' },
  { name: 'Street interviews — recaps', videos: '4 videos', status: 'Building', accent: '#C5A578' },
  { name: 'Community account — week 31', videos: '12 videos', status: 'Planned', accent: '#9785B8' },
];

function DashboardVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

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
            projects
          </span>
        </div>

        {/* ANIMATION SLOT — static status board until the animation phase */}
        <div className="px-4 py-5 space-y-1.5">
          {PROJECTS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 8 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5"
              style={{ background: 'rgba(14, 24, 52, 0.04)', border: '1px solid rgba(14, 24, 52, 0.08)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.accent }} />
              <span className="text-xs flex-1 truncate" style={{ color: 'rgba(14, 24, 52, 0.78)' }}>{p.name}</span>
              <span className="text-[10px] hidden sm:block" style={{ color: 'rgba(14, 24, 52, 0.45)' }}>{p.videos}</span>
              <span
                className="text-[10px] font-mono rounded-full px-2 py-0.5 flex-shrink-0"
                style={{ background: `${p.accent}15`, color: `${p.accent}CC`, border: `1px solid ${p.accent}30` }}
              >
                {p.status}
              </span>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="flex items-center gap-2 pt-2.5 pl-1"
          >
            <span className="text-xs" style={{ color: ACCENT }}>{'✦'}</span>
            <span className="text-[11px]" style={{ color: 'rgba(14, 24, 52, 0.5)' }}>
              29 videos in flight this week
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function FeatureDashboard() {
  return (
    <section id="dashboard" className="relative py-24 md:py-32 px-6 overflow-hidden">
      <div className="mx-auto max-w-6xl flex flex-col lg:flex-row-reverse items-start gap-12 lg:gap-20">
        {/* Right: copy (alternating layout — opposite of Build Agent) */}
        <div className="flex-1 lg:max-w-md lg:sticky lg:top-32">
          <div className="clik-section-header">
            <span className="idx">[ 06 ]</span>
            <span className="rule"></span>
            <span className="label">DASHBOARD</span>
          </div>
          <h2
            className="font-display font-medium leading-[1.05] mb-5 text-clik-midnight"
            style={{ fontSize: 'clamp(28px, 4vw, 46px)', letterSpacing: '-0.02em' }}
          >
            See where everything stands<span style={{ color: '#5481E8' }}>.</span>
          </h2>
          <p className="text-base md:text-lg leading-relaxed mb-8" style={{ color: 'rgba(14, 24, 52, 0.7)' }}>
            Track status across every project, collaborate with teammates, and see what's planned, building,
            and ready to review — the whole engine in one view.
          </p>

          {/* Capability pills */}
          <div className="flex flex-wrap gap-2.5">
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
        </div>

        {/* Left: dashboard visual */}
        <div className="flex-1 w-full lg:max-w-xl">
          <DashboardVisual />
        </div>
      </div>
    </section>
  );
}
