import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// Brand & org memory — the upstream layer of the four-part flow.
// Visual is a RESERVED SLOT: static brand-guide card in the established
// bone/chrome frame. The looping animation lands in the animation phase
// (spec from Conner) without changing the slot's dimensions.

const CAPABILITIES = [
  { label: 'Caption styles', icon: '✦' },
  { label: 'Title card formats', icon: '✦' },
  { label: 'Logos & reusable assets', icon: '✦' },
  { label: 'Format rules', icon: '✦' },
];

const ACCENT = '#5481E8';

// Muted product-viz accents (royce + salmon primary; sage/lavender/ochre differentiate data)
const GUIDE_ITEMS = [
  { label: 'Caption style', value: 'Bold pop · word-by-word', accent: '#5481E8' },
  { label: 'Title cards', value: 'Serif intro · lower third', accent: '#F9838E' },
  { label: 'Logo & assets', value: '4 files saved', accent: '#9785B8' },
  { label: 'Format rules', value: 'Hook first · cut to B-roll', accent: '#C5A578' },
  { label: 'Voice', value: 'Direct, no corporate speak', accent: '#7CA088' },
];

function BrandGuideVisual() {
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
            brand guide
          </span>
        </div>

        {/* ANIMATION SLOT — static placeholder rows until the animation phase */}
        <div className="px-4 py-5 space-y-1.5">
          {GUIDE_ITEMS.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -8 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5"
              style={{ background: `${item.accent}08`, border: `1px solid ${item.accent}18` }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.accent }} />
              <span className="text-xs" style={{ color: 'rgba(14, 24, 52, 0.5)' }}>{item.label}</span>
              <span className="text-xs flex-1 text-right" style={{ color: 'rgba(14, 24, 52, 0.78)' }}>{item.value}</span>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.7, duration: 0.3 }}
            className="flex items-center gap-2 pt-2.5 pl-1"
          >
            <span className="text-xs" style={{ color: ACCENT }}>{'✦'}</span>
            <span className="text-[11px]" style={{ color: 'rgba(14, 24, 52, 0.5)' }}>
              Referenced automatically on every project
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function FeatureBrandMemory() {
  return (
    <section id="brand-memory" className="relative py-24 md:py-32 px-6 overflow-hidden">
      <div className="mx-auto max-w-6xl flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
        {/* Left: copy */}
        <div className="flex-1 lg:max-w-md lg:sticky lg:top-32">
          <div className="clik-section-header">
            <span className="idx">[ 03 ]</span>
            <span className="rule"></span>
            <span className="label">BRAND MEMORY</span>
          </div>
          <h2
            className="font-display font-medium leading-[1.05] mb-5 text-clik-midnight"
            style={{ fontSize: 'clamp(28px, 4vw, 46px)', letterSpacing: '-0.02em' }}
          >
            Teach it once<span style={{ color: '#5481E8' }}>.</span>
          </h2>
          <p className="text-base md:text-lg leading-relaxed mb-8" style={{ color: 'rgba(14, 24, 52, 0.7)' }}>
            Saved caption styles, title card formats, reusable assets, logos, format rules — Clik holds your
            brand's memory upstream of every project, instead of you briefing someone every time.
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

        {/* Right: brand guide visual */}
        <div className="flex-1 w-full lg:max-w-xl">
          <BrandGuideVisual />
        </div>
      </div>
    </section>
  );
}
