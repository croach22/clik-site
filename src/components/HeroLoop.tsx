import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// Hero loop — a compressed run of the whole engine, so the hero previews the
// feature section rather than just showing files turning into clips.
// A live reasoning line drives three columns: what came in, the brand rules
// being applied, and the videos coming out. Same skeleton-UI language as
// FeatureVisuals, at hero scale.

const ROYCE = '#5481E8';
const SALMON = '#F9838E';
const SAGE = '#7CA088';
const LAVENDER = '#9785B8';
const OCHRE = '#C5A578';

const C = (a: number) => `rgba(249, 247, 241, ${a})`;
const INSET = 'rgba(249, 247, 241, 0.04)';
const NODE_BG = '#101B3E';

// Each beat: the line the engine is "thinking", which column it lights up,
// and how long it holds.
type Zone = 'in' | 'brand' | 'out';
interface Beat {
  line: string;
  zone: Zone;
  stage: number; // 0 sort · 1 plan · 2 build · 3 review
  hold: number;
}

const BEATS: Beat[] = [
  { line: 'Ingesting a shoot day, a podcast, and a folder of clips', zone: 'in', stage: 0, hold: 2000 },
  { line: 'Reading dialogue and visuals across 128 clips', zone: 'in', stage: 0, hold: 2000 },
  { line: 'Classifying footage: interview, B-roll, everything else', zone: 'in', stage: 0, hold: 2100 },
  { line: 'Checking every idea against your brand guidelines', zone: 'brand', stage: 1, hold: 2200 },
  { line: 'Planning 12 videos across four concepts', zone: 'out', stage: 1, hold: 2000 },
  { line: 'Cutting dead air, matching B-roll by meaning', zone: 'out', stage: 2, hold: 2100 },
  { line: 'Captions, title cards, hooks in your saved style', zone: 'out', stage: 2, hold: 2000 },
  { line: '12 videos ready for review', zone: 'out', stage: 3, hold: 2600 },
];

const STAGES = ['Sort', 'Plan', 'Build', 'Review'];

const INPUTS = [
  { name: 'shoot_day_01.mp4', meta: '2.4 GB', accent: ROYCE, kind: 'interview' },
  { name: 'podcast_ep42.mp4', meta: '1:02:14', accent: SALMON, kind: 'interview' },
  { name: 'broll_kitchen.mov', meta: '1.4 GB', accent: SAGE, kind: 'b-roll' },
  { name: 'broll_street.mov', meta: '980 MB', accent: OCHRE, kind: 'b-roll' },
];

const BRAND_RULES = [
  { label: 'Caption style', accent: ROYCE },
  { label: 'Title card', accent: SALMON },
  { label: 'Hook', accent: OCHRE },
  { label: 'Skills', accent: SAGE },
  { label: 'Brand assets', accent: LAVENDER },
];

const OUTPUTS = [
  { label: 'Hook A', dur: '0:34', accent: ROYCE },
  { label: 'Recap', dur: '0:48', accent: SALMON },
  { label: 'Tutorial', dur: '0:58', accent: SAGE },
  { label: 'Story', dur: '0:41', accent: LAVENDER },
  { label: 'Listicle', dur: '0:39', accent: OCHRE },
  { label: 'BTS', dur: '0:52', accent: ROYCE },
];

const FADE_OUT = 700;
const LOOP_PAUSE = 900;

function Zone({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border p-3 transition-colors duration-500"
      style={{
        borderColor: active ? `${ROYCE}45` : C(0.09),
        background: active ? `${ROYCE}0A` : INSET,
      }}
    >
      {children}
    </div>
  );
}

function ZoneLabel({ text, right }: { text: string; right?: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <span className="font-mono uppercase" style={{ fontSize: 8, letterSpacing: '0.12em', color: C(0.45) }}>
        {text}
      </span>
      {right}
    </div>
  );
}

export default function HeroLoop() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.25 });

  const [beat, setBeat] = useState(-1);
  const [fading, setFading] = useState(false);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAll = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  }, []);

  const run = useCallback(() => {
    clearAll();
    setBeat(-1);
    setFading(false);
    let elapsed = 300;
    BEATS.forEach((b, i) => {
      timeouts.current.push(setTimeout(() => setBeat(i), elapsed));
      elapsed += b.hold;
    });
    timeouts.current.push(setTimeout(() => setFading(true), elapsed));
    timeouts.current.push(setTimeout(run, elapsed + FADE_OUT + LOOP_PAUSE));
  }, [clearAll]);

  useEffect(() => {
    if (isInView) run();
    else {
      clearAll();
      setBeat(-1);
      setFading(false);
    }
    return clearAll;
  }, [isInView, run, clearAll]);

  const current = beat >= 0 ? BEATS[beat] : null;
  const stage = current?.stage ?? -1;
  const zone = current?.zone;

  // progressive reveal thresholds
  const inputsIn = beat >= 0;
  const classified = beat >= 2;
  const brandLit = beat >= 3;
  const outputCount = beat < 4 ? 0 : beat === 4 ? 3 : OUTPUTS.length;
  const polished = beat >= 6;
  const done = beat >= 7;

  return (
    <div ref={sectionRef}>
      <motion.div
        animate={{ opacity: fading ? 0 : 1 }}
        transition={{ duration: fading ? FADE_OUT / 1000 : 0.4 }}
        className="rounded-2xl border p-4 md:p-6"
        style={{ borderColor: C(0.1), background: '#13204A' }}
        role="img"
        aria-label="Clik ingesting a shoot, a podcast and B-roll, checking them against saved brand rules, and producing twelve finished videos"
      >
        {/* ── Reasoning line + stage rail ── */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-h-[22px] items-center gap-2.5">
            <motion.span
              animate={done ? { opacity: 1 } : { opacity: [0.45, 1, 0.45] }}
              transition={done ? {} : { duration: 1.6, repeat: Infinity }}
              style={{ color: done ? SAGE : SALMON, fontSize: 13 }}
            >
              ✦
            </motion.span>
            <AnimatePresence mode="wait">
              <motion.span
                key={beat}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28 }}
                className="font-ui"
                style={{ fontSize: 14, color: C(0.88) }}
              >
                {current?.line ?? 'Ready'}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1.5">
            {STAGES.map((s, i) => {
              const on = stage >= i;
              return (
                <span key={s} className="flex items-center gap-1.5">
                  <span
                    className="font-mono uppercase transition-colors duration-500"
                    style={{
                      fontSize: 8,
                      letterSpacing: '0.12em',
                      color: on ? ROYCE : C(0.3),
                    }}
                  >
                    {s}
                  </span>
                  {i < STAGES.length - 1 && (
                    <span
                      className="block h-px transition-colors duration-500"
                      style={{ width: 18, background: stage > i ? `${ROYCE}90` : C(0.12) }}
                    />
                  )}
                </span>
              );
            })}
          </div>
        </div>

        {/* ── Three zones ── */}
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)_minmax(0,1.3fr)]">
          {/* IN */}
          <Zone active={zone === 'in'}>
            <ZoneLabel text="Any input" />
            <div className="space-y-1.5">
              {INPUTS.map((f, i) => (
                <motion.div
                  key={f.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={inputsIn ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                  transition={{ delay: i * 0.1, duration: 0.35 }}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2"
                  style={{ background: C(0.04), border: `1px solid ${C(0.08)}` }}
                >
                  <span
                    className="block h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors duration-500"
                    style={{ background: classified ? f.accent : C(0.25) }}
                  />
                  <span className="flex-1 truncate" style={{ fontSize: 11, color: C(0.72) }}>
                    {f.name}
                  </span>
                  <AnimatePresence mode="wait">
                    {classified ? (
                      <motion.span
                        key="kind"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-mono uppercase"
                        style={{ fontSize: 7, letterSpacing: '0.1em', color: `${f.accent}DD` }}
                      >
                        {f.kind}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="meta"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-mono"
                        style={{ fontSize: 8, color: C(0.35) }}
                      >
                        {f.meta}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </Zone>

          {/* BRAND */}
          <Zone active={zone === 'brand'}>
            <ZoneLabel text="Your brand rules" />
            <div className="space-y-1.5">
              {BRAND_RULES.map((r, i) => (
                <motion.div
                  key={r.label}
                  animate={
                    brandLit
                      ? { opacity: 1, borderColor: `${r.accent}45`, backgroundColor: `${r.accent}12` }
                      : { opacity: 0.5, borderColor: C(0.08), backgroundColor: C(0.03) }
                  }
                  transition={{ delay: brandLit ? i * 0.09 : 0, duration: 0.4 }}
                  className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5"
                >
                  <span className="block h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: r.accent }} />
                  <span className="truncate" style={{ fontSize: 10.5, color: C(0.75) }}>
                    {r.label}
                  </span>
                  <AnimatePresence>
                    {brandLit && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.09 + 0.15 }}
                        className="ml-auto"
                        style={{ fontSize: 9, color: r.accent }}
                      >
                        ✓
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </Zone>

          {/* OUT */}
          <Zone active={zone === 'out'}>
            <ZoneLabel
              text="Publish-ready"
              right={
                <AnimatePresence>
                  {done && (
                    <motion.span
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center rounded-full px-2 py-0.5 font-mono uppercase"
                      style={{
                        fontSize: 8,
                        letterSpacing: '0.1em',
                        background: `${SAGE}18`,
                        color: `${SAGE}EE`,
                        border: `1px solid ${SAGE}45`,
                      }}
                    >
                      12 videos · on brand
                    </motion.span>
                  )}
                </AnimatePresence>
              }
            />
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 md:grid-cols-3 lg:grid-cols-6">
              {OUTPUTS.map((o, i) => {
                const shown = i < outputCount;
                return (
                  <div key={o.label} className="relative" style={{ aspectRatio: '9 / 16' }}>
                    {/* ghost slot — keeps the zone from reading empty pre-build */}
                    <motion.span
                      animate={{ opacity: shown ? 0 : 1 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 rounded-lg"
                      style={{ border: `1px dashed ${C(0.1)}`, background: C(0.02) }}
                    />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.75, y: 10 }}
                    animate={shown ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.75, y: 10 }}
                    transition={{ delay: shown ? (i % 3) * 0.09 : 0, type: 'spring', stiffness: 220, damping: 20 }}
                    className="absolute inset-0 overflow-hidden rounded-lg"
                    style={{
                      background: `${o.accent}12`,
                      border: `1px solid ${o.accent}40`,
                    }}
                  >
                    {/* subject + frame furniture */}
                    <span
                      className="absolute left-1/2 top-[20%] block -translate-x-1/2 rounded-full"
                      style={{ width: '36%', aspectRatio: '1', background: `${o.accent}30` }}
                    />
                    <span
                      className="absolute left-1/2 top-[44%] block -translate-x-1/2 rounded-t-lg"
                      style={{ width: '56%', height: '24%', background: `${o.accent}22` }}
                    />
                    {/* caption bar appears once styling is applied */}
                    <motion.span
                      animate={{ opacity: polished ? 1 : 0 }}
                      transition={{ delay: polished ? (i % 3) * 0.08 : 0, duration: 0.3 }}
                      className="absolute left-1/2 block -translate-x-1/2 rounded-sm"
                      style={{ bottom: '22%', width: '62%', height: 4, background: o.accent }}
                    />
                    <div
                      className="absolute inset-x-0 bottom-0 flex items-center justify-between px-1.5 py-1"
                      style={{ background: 'rgba(7, 12, 27, 0.75)' }}
                    >
                      <span className="truncate font-mono" style={{ fontSize: 7, color: C(0.85) }}>
                        {o.label}
                      </span>
                      <span className="font-mono" style={{ fontSize: 7, color: C(0.45) }}>
                        {o.dur}
                      </span>
                    </div>
                  </motion.div>
                  </div>
                );
              })}
            </div>
          </Zone>
        </div>
      </motion.div>
    </div>
  );
}
