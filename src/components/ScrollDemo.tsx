import { useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

const CLIPS = [
  { id: 0,  kept: true,  bg: '#180D2A', accent: '#DC1DD9', duration: 8,  tlWidth: 160 },
  { id: 1,  kept: false, bg: '#0D1B3E', accent: '#5481E8', duration: 12, tlWidth: 0   },
  { id: 2,  kept: true,  bg: '#2A0D18', accent: '#F9838E', duration: 6,  tlWidth: 120 },
  { id: 3,  kept: false, bg: '#0D2A0D', accent: '#5481E8', duration: 15, tlWidth: 0   },
  { id: 4,  kept: true,  bg: '#1A1808', accent: '#5481E8', duration: 4,  tlWidth: 80  },
  { id: 5,  kept: true,  bg: '#08082A', accent: '#F9838E', duration: 9,  tlWidth: 180 },
  { id: 6,  kept: false, bg: '#2A0808', accent: '#DC1DD9', duration: 11, tlWidth: 0   },
  { id: 7,  kept: true,  bg: '#081E1E', accent: '#DC1DD9', duration: 7,  tlWidth: 140 },
  { id: 8,  kept: false, bg: '#1A1A1A', accent: '#F9838E', duration: 5,  tlWidth: 0   },
  { id: 9,  kept: true,  bg: '#18082A', accent: '#5481E8', duration: 3,  tlWidth: 60  },
  { id: 10, kept: false, bg: '#08182A', accent: '#DC1DD9', duration: 8,  tlWidth: 0   },
  { id: 11, kept: true,  bg: '#2A0818', accent: '#F9838E', duration: 6,  tlWidth: 120 },
  { id: 12, kept: false, bg: '#082A08', accent: '#5481E8', duration: 10, tlWidth: 0   },
];

// Sub-phases:
//  0 → inputs:       user prompt + full grid
//  1 → detecting:    AI msg 1 + clips dim + trim handles
//  2 → constructing: AI msg 2 + cut clips collapse out → kept clips consolidate into a row
//  3 → done:         grid fades → proper proportional timeline assembles

export default function ScrollDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sp, setSp] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', v => {
    setSp(v < 0.25 ? 0 : v < 0.46 ? 1 : v < 0.67 ? 2 : 3);
  });

  const isProcessing   = sp === 1 || sp === 2;
  const isConstructing = sp === 2;
  const isDone         = sp === 3;

  const aiMsg =
    sp === 1 ? 'Sure thing, detecting your recipe now...' :
    sp === 2 ? 'I can construct the timeline now.' :
    null;

  return (
    <section ref={containerRef} className="relative h-[320vh]">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center gap-6 px-6 overflow-hidden">

        {/* Static header */}
        <div className="text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: '#F9838E55' }}>
            How it works
          </p>
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: '#F9F7F1' }}>
            From raw footage to draft in seconds.
          </h2>
        </div>

        {/* Chat thread */}
        <motion.div
          animate={{ opacity: isDone ? 0 : 1, y: isDone ? -10 : 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="flex flex-col gap-2 w-full max-w-md"
          style={{ pointerEvents: 'none' }}
        >
          {/* User bubble */}
          <div
            className="self-end rounded-2xl rounded-br-sm px-4 py-2.5 text-sm"
            style={{
              background: '#ffffff0C',
              border: '1px solid #ffffff14',
              color: '#F9F7F1BB',
              maxWidth: '88%',
            }}
          >
            "Make me a cooking video with the final plating as the hook."
          </div>

          {/* AI response — one at a time */}
          <AnimatePresence mode="wait">
            {aiMsg && (
              <motion.div
                key={aiMsg}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.28, ease: 'easeInOut' }}
                className="self-start flex items-center gap-2.5 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm"
                style={{
                  border: '1px solid #DC1DD930',
                  background: 'linear-gradient(135deg, #DC1DD90E, #5481E80A)',
                  color: '#F9F7F1BB',
                  maxWidth: '88%',
                }}
              >
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                  style={{ color: '#DC1DD9', fontSize: 13, flexShrink: 0 }}
                >
                  ✦
                </motion.span>
                {aiMsg}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Grid view (sp 0 → 1 → 2) ── */}
        <AnimatePresence>
          {!isDone && (
            <motion.div
              key="grid"
              exit={{ opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } }}
              className="w-full max-w-4xl"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: isConstructing ? '2px' : '8px',
                transition: 'gap 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {CLIPS.map((clip, i) => {
                const isCut      = !clip.kept;
                const collapsing = isConstructing && isCut;
                const dimmed     = sp === 1 && isCut;

                return (
                  <motion.div
                    key={clip.id}
                    initial={{ opacity: 0, scale: 0.82 }}
                    animate={{
                      opacity: collapsing ? 0 : dimmed ? 0.10 : 1,
                      scale: 1,
                      filter: dimmed ? 'grayscale(1)' : 'grayscale(0)',
                    }}
                    transition={{
                      opacity: { duration: collapsing ? 0.35 : 0.45 },
                      filter:  { duration: 0.45 },
                      scale:   { type: 'spring', stiffness: 160, damping: 28 },
                      delay: sp === 0 ? i * 0.022 : 0,
                    }}
                    className="relative flex-shrink-0 overflow-hidden rounded-lg"
                    style={{
                      backgroundColor: clip.bg,
                      width:  collapsing ? 0 : 96,
                      height: isConstructing && !isCut ? 52 : 62,
                      transition: [
                        'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      ].join(', '),
                    }}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/8 to-transparent" />

                    {/* Trim handles — kept clips while processing (sp 1 & 2) */}
                    {isProcessing && clip.kept && (
                      <>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '14%' }}
                          transition={{ type: 'spring', stiffness: 100, damping: 26, delay: 0.1 }}
                          className="absolute bottom-0 left-0 top-0 bg-black/55"
                        />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '14%' }}
                          transition={{ type: 'spring', stiffness: 100, damping: 26, delay: 0.1 }}
                          className="absolute bottom-0 right-0 top-0 bg-black/55"
                        />
                        <motion.div
                          initial={{ left: 0 }}
                          animate={{ left: '14%' }}
                          transition={{ type: 'spring', stiffness: 100, damping: 26, delay: 0.1 }}
                          className="absolute bottom-0 top-0 w-[2px]"
                          style={{ backgroundColor: clip.accent }}
                        />
                        <motion.div
                          initial={{ right: 0 }}
                          animate={{ right: '14%' }}
                          transition={{ type: 'spring', stiffness: 100, damping: 26, delay: 0.1 }}
                          className="absolute bottom-0 top-0 w-[2px]"
                          style={{ backgroundColor: clip.accent }}
                        />
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4 }}
                          className="pointer-events-none absolute inset-0 rounded-lg"
                          style={{ boxShadow: `inset 0 0 0 1.5px ${clip.accent}40` }}
                        />
                      </>
                    )}

                    <div
                      className="absolute bottom-1 left-1.5 rounded px-1 py-0.5 font-mono text-[10px]"
                      style={{ color: clip.accent, backgroundColor: clip.accent + '20' }}
                    >
                      {clip.duration}s
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Timeline view (sp 3) ── */}
        <AnimatePresence>
          {isDone && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.1 } }}
              className="w-full max-w-4xl flex flex-col gap-3"
            >
              {/* Rail label */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: '#ffffff10' }} />
                <span className="text-xs font-mono" style={{ color: '#ffffff30' }}>timeline · 43s</span>
                <div className="h-px flex-1" style={{ background: '#ffffff10' }} />
              </div>

              {/* Clips grow in staggered from left */}
              <div className="flex gap-0.5">
                {CLIPS.filter(c => c.kept).map((clip, i) => (
                  <motion.div
                    key={clip.id}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: clip.tlWidth, opacity: 1 }}
                    transition={{
                      width:   { type: 'spring', stiffness: 90, damping: 22, delay: i * 0.06 },
                      opacity: { duration: 0.2, delay: i * 0.06 },
                    }}
                    className="relative flex-shrink-0 overflow-hidden rounded-md"
                    style={{ height: 52, backgroundColor: clip.bg }}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/8 to-transparent" />
                    <div
                      className="absolute bottom-1 left-1.5 rounded px-1 py-0.5 font-mono text-[10px]"
                      style={{ color: clip.accent, backgroundColor: clip.accent + '20' }}
                    >
                      {clip.duration}s
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Done badge */}
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.6 }}
                className="self-start flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
                style={{ borderColor: '#5481E830', background: '#5481E80A', color: '#5481E8BB' }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#5481E8', boxShadow: '0 0 5px #5481E8' }} />
                7 clips · ready to publish
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll hint */}
        <AnimatePresence>
          {sp === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.18, 0.42, 0.18] }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2.8 }}
              className="absolute bottom-10 text-xs tracking-wide"
              style={{ color: '#ffffff28' }}
            >
              scroll to watch it work ↓
            </motion.p>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
