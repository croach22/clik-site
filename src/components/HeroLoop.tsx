import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// Hero loop — the flagship workflow as a seamless ~9s loop:
// talking head + B-roll in → central engine → fan-out of vertical clips out.
// Structure borrowed from Overlap/Opus: inputs → hub → fan-out.
// Timer state machine + framer-motion, same mechanics as the feature sections.

const ROYCE = '#5481E8';
const SALMON = '#F9838E';
const SAGE = '#7CA088';
const LAVENDER = '#9785B8';
const OCHRE = '#C5A578';

const INPUTS = [
  { name: 'talking_head.mp4', size: '2.1 GB', accent: ROYCE },
  { name: 'broll_kitchen.mov', size: '1.4 GB', accent: SALMON },
  { name: 'broll_street.mov', size: '980 MB', accent: SAGE },
  { name: 'brand_guide', size: 'saved', accent: LAVENDER },
];

const OUTPUTS = [
  { label: 'Hook A', duration: '0:34', accent: ROYCE },
  { label: 'Hook B', duration: '0:41', accent: SALMON },
  { label: 'Tutorial', duration: '0:58', accent: SAGE },
  { label: 'Story', duration: '0:47', accent: LAVENDER },
  { label: 'Listicle', duration: '0:39', accent: OCHRE },
  { label: 'BTS', duration: '0:52', accent: ROYCE },
];

// step: 0 inputs in · 1 converge on hub · 2 processing · 3 clips fan out · 4 badge
const STEP_DELAYS = [400, 1600, 900, 1700, 2200];
const LOOP_PAUSE = 2600;
const FADE_OUT = 800;

function ProcessingLabel({ active }: { active: boolean }) {
  const words = ['sorting', 'planning', 'building'];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setI((v) => (v + 1) % words.length), 900);
    return () => clearInterval(id);
  }, [active]);
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: 'rgba(14, 24, 52, 0.5)' }}>
      {active ? words[i] : 'ready'}
    </span>
  );
}

export default function HeroLoop() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });

  const [step, setStep] = useState(-1);
  const [fading, setFading] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const runSequence = useCallback(() => {
    clearAll();
    setStep(-1);
    setFading(false);
    let elapsed = 0;
    STEP_DELAYS.forEach((d, i) => {
      elapsed += d;
      const id = setTimeout(() => setStep(i), elapsed);
      timeoutsRef.current.push(id);
    });
    const total = elapsed + LOOP_PAUSE;
    timeoutsRef.current.push(setTimeout(() => setFading(true), total));
    timeoutsRef.current.push(setTimeout(() => runSequence(), total + FADE_OUT + 200));
  }, [clearAll]);

  useEffect(() => {
    if (isInView) runSequence();
    else {
      clearAll();
      setStep(-1);
      setFading(false);
    }
    return clearAll;
  }, [isInView, runSequence, clearAll]);

  const showInputs = step >= 0;
  const converged = step >= 1;
  const processing = step >= 2 && step < 3;
  const showOutputs = step >= 3;
  const showBadge = step >= 4;

  return (
    <div ref={sectionRef}>
      <motion.div
        animate={{ opacity: fading ? 0 : 1 }}
        transition={{ duration: fading ? FADE_OUT / 1000 : 0.3 }}
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: 'rgba(14, 24, 52, 0.10)', background: '#F1EEE5' }}
        role="img"
        aria-label="A shoot's talking head and B-roll flow into Clik and fan out as six finished vertical clips"
      >
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: 'rgba(14, 24, 52, 0.08)' }}>
          <div className="w-2 h-2 rounded-full bg-clik-midnight/15" />
          <div className="w-2 h-2 rounded-full bg-clik-midnight/15" />
          <div className="w-2 h-2 rounded-full bg-clik-midnight/15" />
          <span className="ml-3 text-[10px] font-mono" style={{ color: 'rgba(14, 24, 52, 0.4)' }}>
            clik · content engine
          </span>
        </div>

        <div className="px-5 py-6 md:px-8 md:py-8">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">

            {/* ── Inputs ── */}
            <div className="w-full md:w-[240px] md:shrink-0 space-y-1.5">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(14, 24, 52, 0.5)' }}>
                  Any input
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(14, 24, 52, 0.08)' }} />
              </div>
              {INPUTS.map((f, i) => (
                <motion.div
                  key={f.name}
                  initial={{ opacity: 0, x: -12 }}
                  animate={
                    showInputs
                      ? converged
                        ? { opacity: 0.45, x: 6, scale: 0.97 }
                        : { opacity: 1, x: 0, scale: 1 }
                      : { opacity: 0, x: -12, scale: 1 }
                  }
                  transition={{ delay: converged ? i * 0.08 : i * 0.12, duration: 0.35 }}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2"
                  style={{ background: `${f.accent}08`, border: `1px solid ${f.accent}20` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: f.accent }} />
                  <span className="text-xs flex-1 truncate" style={{ color: 'rgba(14, 24, 52, 0.75)' }}>{f.name}</span>
                  <span className="text-[10px] font-mono" style={{ color: 'rgba(14, 24, 52, 0.4)' }}>{f.size}</span>
                </motion.div>
              ))}
            </div>

            {/* ── Hub ── */}
            <div className="flex md:flex-col items-center gap-3 md:shrink-0">
              <motion.div
                animate={
                  processing
                    ? { boxShadow: [`0 0 0 0px ${ROYCE}30`, `0 0 0 14px ${ROYCE}00`] }
                    : { boxShadow: `0 0 0 0px ${ROYCE}00` }
                }
                transition={processing ? { duration: 1.1, repeat: Infinity } : {}}
                className="flex items-center justify-center rounded-2xl"
                style={{
                  width: 64,
                  height: 64,
                  background: converged ? `${ROYCE}12` : 'rgba(14, 24, 52, 0.05)',
                  border: `1px solid ${converged ? `${ROYCE}40` : 'rgba(14, 24, 52, 0.10)'}`,
                  transition: 'background 0.4s, border-color 0.4s',
                }}
              >
                <motion.span
                  animate={processing ? { rotate: 360 } : { rotate: 0 }}
                  transition={processing ? { duration: 2.4, repeat: Infinity, ease: 'linear' } : {}}
                  className="text-xl"
                  style={{ color: converged ? ROYCE : 'rgba(14, 24, 52, 0.35)' }}
                >
                  ✦
                </motion.span>
              </motion.div>
              <ProcessingLabel active={processing} />
            </div>

            {/* ── Outputs ── */}
            <div className="w-full flex-1">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(14, 24, 52, 0.5)' }}>
                  Publish-ready
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(14, 24, 52, 0.08)' }} />
                <AnimatePresence>
                  {showBadge && (
                    <motion.span
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="font-mono text-[9px] uppercase tracking-[0.14em] rounded-full px-2 py-0.5"
                      style={{ background: `${ROYCE}15`, color: ROYCE, border: `1px solid ${ROYCE}30` }}
                    >
                      6 clips · on-brand
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {OUTPUTS.map((o, i) => (
                  <motion.div
                    key={o.label}
                    initial={{ opacity: 0, scale: 0.7, y: 14 }}
                    animate={showOutputs ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.7, y: 14 }}
                    transition={{ delay: i * 0.12, type: 'spring', stiffness: 220, damping: 20 }}
                    className="relative rounded-lg overflow-hidden"
                    style={{
                      aspectRatio: '9 / 16',
                      background: `${o.accent}12`,
                      border: `1px solid ${o.accent}40`,
                    }}
                  >
                    {/* fake video frame: subject block + caption bars */}
                    <div
                      className="absolute left-1/2 top-[22%] -translate-x-1/2 rounded-full"
                      style={{ width: '38%', aspectRatio: '1', background: `${o.accent}30` }}
                    />
                    <div
                      className="absolute left-1/2 top-[46%] -translate-x-1/2 rounded-t-xl"
                      style={{ width: '58%', height: '26%', background: `${o.accent}25` }}
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={showOutputs ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ delay: 0.5 + i * 0.12 }}
                      className="absolute left-1/2 -translate-x-1/2 bottom-[18%] rounded-sm"
                      style={{ width: '64%', height: 5, background: `${o.accent}CC` }}
                    />
                    <div
                      className="absolute inset-x-0 bottom-0 flex items-center justify-between px-1.5 py-1"
                      style={{ background: 'rgba(14, 24, 52, 0.75)' }}
                    >
                      <span className="text-[7px] font-mono truncate" style={{ color: '#F9F7F1' }}>{o.label}</span>
                      <span className="text-[7px] font-mono" style={{ color: `#F9F7F1AA` }}>{o.duration}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
