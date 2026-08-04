import { motion } from 'framer-motion';

// The transformation itself: footage leaves the batch on the left, passes
// through the engine in the middle where it gets classified, and lands as
// finished vertical videos on the right. Clips are always in motion, so the
// flow is shown rather than described.

const ROYCE = '#5481E8';
const SALMON = '#F9838E';
const SAGE = '#7CA088';
const OCHRE = '#C5A578';

const C = (a: number) => `rgba(249, 247, 241, ${a})`;

export interface FlowFile {
  name: string;
  type: 'a-roll' | 'b-roll' | 'graphics';
  tags: string[];
  src?: string;
}

export interface FlowOutput {
  label: string;
  dur: string;
  accent: string;
  src?: string;
}

interface Props {
  step: number; // 0..3
  stepLabels: string[];
  fileCount: number;
  analyzed: number;
  files: FlowFile[];
  mosaic?: string[];
  concepts: string[];
  outputs: FlowOutput[];
  moreOutputs?: number;
  outLabel: string;
  reduced: boolean;
}

const TYPE_COLOR = { 'a-roll': ROYCE, 'b-roll': SAGE, graphics: SALMON } as const;
const CONCEPT_COLORS = [ROYCE, SALMON, SAGE, OCHRE];

// travelers: one per lane, staggered so the belt never looks empty
const LANES = [8, 26, 44, 62, 80];
const TRAVEL_MS = 2600;

export default function HeroFlow({
  step,
  stepLabels,
  fileCount,
  analyzed,
  files,
  mosaic,
  concepts,
  outputs,
  moreOutputs,
  outLabel,
  reduced,
}: Props) {
  const built = step >= 3;
  const conceptsIn = step >= 1;
  const brollIn = step >= 2;

  return (
    <div className="relative" style={{ minHeight: 268 }}>
      {/* ── the lane the footage rides ── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-full md:block" aria-hidden="true">
        <div
          className="absolute left-[22%] right-[30%] top-1/2 h-px -translate-y-1/2"
          style={{ background: `linear-gradient(90deg, ${C(0.02)}, ${ROYCE}40 40%, ${ROYCE}40 60%, ${C(0.02)})` }}
        />
        {!reduced &&
          LANES.map((topPct, i) => {
            const src = mosaic?.[i * 5];
            const type = i % 3 === 0 ? 'a-roll' : 'b-roll';
            const color = TYPE_COLOR[type];
            return (
              <motion.div
                key={i}
                className="absolute"
                style={{ top: `${topPct}%`, left: '22%' }}
                initial={{ x: 0, opacity: 0 }}
                animate={{
                  x: ['0%', '260%', '520%'],
                  opacity: [0, 1, 1, 0],
                  scale: [0.85, 1, 0.7],
                }}
                transition={{
                  duration: TRAVEL_MS / 1000,
                  repeat: Infinity,
                  delay: i * (TRAVEL_MS / 1000 / LANES.length),
                  ease: 'easeInOut',
                  times: [0, 0.5, 1],
                  opacity: { times: [0, 0.12, 0.8, 1], duration: TRAVEL_MS / 1000, repeat: Infinity, delay: i * (TRAVEL_MS / 1000 / LANES.length) },
                }}
              >
                <div className="relative">
                  <div
                    className="overflow-hidden rounded-[3px]"
                    style={{ width: 22, aspectRatio: '9 / 16', border: `1px solid ${color}55`, background: C(0.06) }}
                  >
                    {src ? (
                      <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <span className="block h-full w-full" style={{ background: `${color}25` }} />
                    )}
                  </div>
                  {/* the tag it picks up on the way through */}
                  <motion.span
                    className="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 rounded px-1 font-mono uppercase"
                    style={{ fontSize: 5.5, letterSpacing: '0.06em', color: '#0B1330', background: color, whiteSpace: 'nowrap' }}
                    animate={{ opacity: [0, 0, 1, 1] }}
                    transition={{
                      duration: TRAVEL_MS / 1000,
                      repeat: Infinity,
                      delay: i * (TRAVEL_MS / 1000 / LANES.length),
                      times: [0, 0.52, 0.62, 1],
                    }}
                  >
                    {type}
                  </motion.span>
                </div>
              </motion.div>
            );
          })}
      </div>

      <div className="relative grid grid-cols-1 items-center gap-5 md:grid-cols-[minmax(0,0.62fr)_minmax(0,0.5fr)_minmax(0,1fr)]">
        {/* ── 1 · the batch ── */}
        <div>
          <div className="mb-2 flex items-baseline gap-1.5">
            <span className="font-display font-medium text-clik-cream" style={{ fontSize: 22, lineHeight: 1 }}>
              {reduced ? fileCount : analyzed}
            </span>
            <span className="font-mono uppercase" style={{ fontSize: 8, letterSpacing: '0.12em', color: C(0.45) }}>
              of {fileCount} clips
            </span>
          </div>

          {/* the named clips, fanned like a pile you'd actually be handed */}
          <div className="flex gap-1.5" style={{ height: 150 }}>
            {files.map((f, i) => (
              <motion.div
                key={f.name}
                className="min-w-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <div className="relative h-[126px] overflow-hidden rounded-md" style={{ aspectRatio: '9 / 16', background: C(0.05) }}>
                  {f.src ? (
                    <video src={f.src} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" />
                  ) : (
                    <span className="absolute inset-0" style={{ background: `${TYPE_COLOR[f.type]}18` }} />
                  )}
                  <span
                    className="pointer-events-none absolute inset-0 z-[2] rounded-md"
                    style={{
                      border: `1px solid ${brollIn && f.type === 'b-roll' ? `${SAGE}DD` : `${TYPE_COLOR[f.type]}55`}`,
                      boxShadow: brollIn && f.type === 'b-roll' ? `0 0 0 2px ${SAGE}33` : 'none',
                      transition: 'border-color .45s, box-shadow .45s',
                    }}
                  />
                  <span
                    className="absolute left-1 top-1 z-[3] rounded px-1 font-mono uppercase"
                    style={{ fontSize: 6, letterSpacing: '0.06em', color: '#0B1330', background: TYPE_COLOR[f.type] }}
                  >
                    {f.type}
                  </span>
                </div>
                <p className="mt-1 truncate font-mono" style={{ fontSize: 7, color: C(0.45) }}>
                  {f.tags[0]}
                </p>
              </motion.div>
            ))}
          </div>

          {/* the rest of the pile, feeding the lane */}
          <div className="mt-1.5 grid grid-cols-10 gap-[2px]">
            {(mosaic ?? Array.from({ length: 20 })).slice(0, 20).map((src, i) => {
              const lit = i < Math.round((analyzed / fileCount) * 20);
              return (
                <motion.div
                  key={i}
                  className="overflow-hidden rounded-[2px]"
                  style={{ aspectRatio: '9 / 16', background: C(0.06) }}
                  animate={{ opacity: lit ? 0.9 : 0.28 }}
                  transition={{ duration: 0.25 }}
                >
                  {typeof src === 'string' ? (
                    <img
                      src={src}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                      style={{ filter: lit ? 'none' : 'grayscale(1)', transition: 'filter .3s' }}
                    />
                  ) : null}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── 2 · the engine ── */}
        <div className="flex flex-col items-center justify-center">
          <motion.div
            className="relative flex items-center justify-center rounded-2xl"
            style={{ width: 62, height: 62, background: `${ROYCE}12`, border: `1px solid ${ROYCE}55` }}
            animate={reduced ? {} : { boxShadow: [`0 0 0 0px ${ROYCE}30`, `0 0 0 12px ${ROYCE}00`] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            <motion.span
              style={{ color: ROYCE, fontSize: 20 }}
              animate={reduced ? {} : { rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            >
              ✦
            </motion.span>
          </motion.div>

          <div className="mt-2.5 h-8 text-center">
            <motion.p
              key={step}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="font-mono uppercase"
              style={{ fontSize: 8.5, letterSpacing: '0.1em', color: C(0.85), lineHeight: 1.4 }}
            >
              {stepLabels[step]}
            </motion.p>
            <div className="mt-1.5 flex items-center justify-center gap-1">
              {stepLabels.map((_, i) => (
                <span
                  key={i}
                  className="block rounded-full transition-all"
                  style={{
                    width: i === step ? 10 : 4,
                    height: 4,
                    background: i <= step ? ROYCE : C(0.16),
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── 3 · what comes out ── */}
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {concepts.map((c, i) => (
                <motion.span
                  key={c}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={conceptsIn ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                  transition={{ delay: conceptsIn ? i * 0.1 : 0, duration: 0.3 }}
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-ui"
                  style={{
                    fontSize: 9,
                    color: C(0.78),
                    background: `${CONCEPT_COLORS[i % 4]}14`,
                    border: `1px solid ${CONCEPT_COLORS[i % 4]}40`,
                  }}
                >
                  <span className="block h-1 w-1 rounded-full" style={{ background: CONCEPT_COLORS[i % 4] }} />
                  {c}
                </motion.span>
              ))}
            </div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: built ? 1 : 0 }}
              className="flex-shrink-0 rounded-full px-2 py-0.5 font-mono uppercase"
              style={{ fontSize: 8, letterSpacing: '0.1em', background: `${SAGE}18`, color: `${SAGE}EE`, border: `1px solid ${SAGE}45` }}
            >
              {outLabel}
            </motion.span>
          </div>

          <div className="flex items-end gap-2" style={{ height: 188 }}>
            {outputs.map((o, i) => (
              <motion.div
                key={o.label}
                className="relative h-full overflow-hidden rounded-lg"
                style={{ aspectRatio: '9 / 16', background: `${o.accent}12`, border: `1px solid ${o.accent}45` }}
                initial={{ opacity: 0, x: -18, scale: 0.9 }}
                animate={built ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -18, scale: 0.9 }}
                transition={{ delay: built ? i * 0.16 : 0, type: 'spring', stiffness: 200, damping: 20 }}
              >
                {o.src ? (
                  <video src={o.src} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" />
                ) : (
                  <>
                    <span className="absolute left-1/2 top-[20%] block -translate-x-1/2 rounded-full" style={{ width: '36%', aspectRatio: '1', background: `${o.accent}30` }} />
                    <span className="absolute left-1/2 top-[46%] block -translate-x-1/2 rounded-t-lg" style={{ width: '56%', height: '24%', background: `${o.accent}22` }} />
                    <span className="absolute left-1/2 block -translate-x-1/2 rounded-sm" style={{ bottom: '22%', width: '60%', height: 3, background: o.accent }} />
                  </>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-1 py-0.5" style={{ background: 'rgba(7,12,27,0.78)' }}>
                  <span className="truncate font-mono" style={{ fontSize: 6.5, color: C(0.85) }}>
                    {o.label}
                  </span>
                  <span className="font-mono" style={{ fontSize: 6.5, color: C(0.45) }}>
                    {o.dur}
                  </span>
                </div>
              </motion.div>
            ))}
            {moreOutputs ? (
              <motion.div
                className="flex h-full items-center justify-center rounded-lg"
                style={{ aspectRatio: '9 / 16', border: `1px dashed ${C(0.14)}`, background: C(0.02) }}
                initial={{ opacity: 0 }}
                animate={{ opacity: built ? 1 : 0 }}
                transition={{ delay: built ? outputs.length * 0.16 : 0 }}
              >
                <span className="font-mono" style={{ fontSize: 9, color: C(0.45) }}>
                  +{moreOutputs}
                </span>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
