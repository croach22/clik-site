import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Before/after scrub. One stage: the raw input sits under the bar on the
// right, the finished vertical videos land behind it on the left. The bar
// sweeps on its own and hands control to the pointer on hover, so the whole
// input → output transformation is one gesture instead of four panels.
//
// Geometry is expressed in fractions of the stage width so the reveal
// thresholds line up exactly with each slot's right edge — a finished video
// only lands once the bar has fully cleared the raw footage beneath it.
//
// Two inputs, two substrates:
//   podcast → one landscape frame, read off a waveform
//   batch   → a strip of what came off the card
//   take    → one interview, with its restarts and retakes logged

const ROYCE = '#5481E8';
const SALMON = '#F9838E';
const SAGE = '#7CA088';

const C = (a: number) => `rgba(249, 247, 241, ${a})`;

const CLIP_W = 0.28; // fraction of stage width
const CLIP_X = [0.02, 0.32, 0.62]; // left edges
const EDGE_STACK_X = 0.92;

const SWEEP_MS = 6400;
const HOLD_MS = 1600;

// where the interesting moments sit on the podcast timeline, as fractions
const MOMENTS = [
  { at: 0.16, t: '0:14:22' },
  { at: 0.46, t: '0:38:05' },
  { at: 0.76, t: '1:02:47' },
];

// deterministic so server and client agree
const rand = (i: number) => Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
const BARS = Array.from({ length: 96 }, (_, i) => 0.22 + rand(i) * 0.78);

export interface ScrubClip {
  title: string;
  dur: string;
  label: string;
  accent: string;
  caption?: string; // abstract tiles only — real footage carries its own
  src?: string;
}

export type ScrubSource =
  | { kind: 'landscape'; src?: string; name: string; dur: string }
  | { kind: 'batch'; stills: string[]; count: number; more: number; note: string }
  | { kind: 'take'; src?: string; name: string; dur: string; note: string; takes: { n: string; cut: boolean }[] };

interface Props {
  steps: string[];
  source: ScrubSource;
  clips: ScrubClip[];
  stackLabel: string;
  stackSub?: string;
  outLabel: string;
  reduced: boolean;
  onScrub?: () => void;
  onStep?: (i: number) => void;
}

export default function HeroScrub({
  steps,
  source,
  clips,
  stackLabel,
  stackSub,
  outLabel,
  reduced,
  onScrub,
  onStep,
}: Props) {
  const [p, setP] = useState(reduced ? 1 : 0);
  const [auto, setAuto] = useState(!reduced);
  const stage = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  // latched once the sweep has run, so nothing can restart it behind our back
  const parked = useRef(false);

  const stepAt = useCallback(
    (v: number) => Math.min(steps.length - 1, Math.floor(v * steps.length)),
    [steps.length],
  );
  const commit = useCallback(
    (v: number) => {
      setP(v);
      onStep?.(stepAt(v));
    },
    [onStep, stepAt],
  );

  // autoplay sweep — runs off rAF so a manual grab can interrupt mid-frame
  useEffect(() => {
    if (!auto || reduced || parked.current) return;
    let raf = 0;
    let start = 0;
    const from = p;
    const span = SWEEP_MS * (1 - from);

    const tick = (now: number) => {
      if (!start) start = now;
      const elapsed = now - start;
      if (elapsed < span) {
        commit(from + (elapsed / span) * (1 - from));
        raf = requestAnimationFrame(tick);
      } else {
        // rest at the finished state — the bar stays grabbable from there
        parked.current = true;
        commit(1);
        setAuto(false);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // p is read once at the start of a sweep, not tracked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, reduced, commit]);

  const setFromPointer = useCallback(
    (clientX: number) => {
      const el = stage.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      commit(Math.min(1, Math.max(0, (clientX - r.left) / r.width)));
    },
    [commit],
  );

  const grab = (clientX: number) => {
    if (reduced) return;
    parked.current = false;
    dragging.current = true;
    setAuto(false);
    onScrub?.();
    setFromPointer(clientX);
  };

  useEffect(() => {
    const move = (e: PointerEvent) => dragging.current && setFromPointer(e.clientX);
    const up = () => (dragging.current = false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [setFromPointer]);

  const stepIdx = stepAt(p);
  const done = p >= 0.995;

  const shownClips = clips.slice(0, 3);
  // the "and the rest" card takes the next free slot when there is one,
  // otherwise it rides the right edge as a thin stack
  const inSlot = shownClips.length < 3;
  const stackX = inSlot ? CLIP_X[shownClips.length] : EDGE_STACK_X;
  const stackW = inSlot ? 98 - stackX * 100 : 6;
  const stackReveal = stackX + stackW / 100;

  return (
    <div>
      <div
        ref={stage}
        role="slider"
        aria-label="Scrub from raw footage to finished videos"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(p * 100)}
        aria-valuetext={steps[stepIdx]}
        tabIndex={0}
        onPointerDown={(e) => grab(e.clientX)}
        onPointerEnter={() => !reduced && (setAuto(false), onScrub?.())}
        onPointerMove={(e) => !dragging.current && !reduced && setFromPointer(e.clientX)}
        onPointerLeave={() => {
          dragging.current = false;
          if (!reduced) setAuto(true);
        }}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
          e.preventDefault();
          parked.current = false;
          setAuto(false);
          commit(Math.min(1, Math.max(0, p + (e.key === 'ArrowRight' ? 0.05 : -0.05))));
        }}
        className="relative w-full cursor-ew-resize touch-none select-none overflow-hidden rounded-xl border outline-none"
        style={{ aspectRatio: '16 / 9', borderColor: C(0.12), background: '#08102A' }}
      >
        {/* ── what the footage is being read off of ── */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            opacity: done ? 0.35 : 1,
            transition: 'opacity .4s',
            clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
          }}
        >
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(120% 90% at 20% 40%, ${ROYCE}14, transparent 70%), #08102A` }}
          />
          {source.kind === 'landscape' && <Waveform p={p} />}
          {source.kind === 'batch' && <ReadField p={p} count={source.count} unit="analyzed" />}
          {source.kind === 'take' && (
            <ReadField p={p} count={source.takes.filter((t) => t.cut).length} unit="retakes cut" />
          )}
        </div>

        {/* ── the finished videos, landing behind the bar ── */}
        {shownClips.map((c, i) => (
          <motion.div
            key={c.label}
            className="absolute top-1/2 overflow-hidden rounded-lg"
            style={{
              left: `${CLIP_X[i] * 100}%`,
              width: `${CLIP_W * 100}%`,
              aspectRatio: '9 / 16',
              y: '-50%',
              background: `linear-gradient(170deg, ${c.accent}30, rgba(11, 21, 51, 0.9) 62%), #0B1533`,
              border: `1px solid ${c.accent}66`,
              boxShadow: '0 14px 34px rgba(4, 8, 22, 0.5)',
            }}
            initial={false}
            animate={p >= CLIP_X[i] + CLIP_W ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.9, x: -14 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            aria-hidden="true"
          >
            {c.src ? (
              <video
                src={c.src}
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            ) : (
              <>
                <span
                  className="absolute left-1/2 block -translate-x-1/2 rounded-full"
                  style={{ top: '26%', width: '30%', aspectRatio: '1', background: `${c.accent}55` }}
                />
                <span
                  className="absolute left-1/2 block -translate-x-1/2 rounded-t-[999px]"
                  style={{ top: '48%', width: '58%', height: '30%', background: `${c.accent}38` }}
                />
                {c.caption && (
                  <span
                    className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-1.5 py-[3px] font-display font-medium uppercase"
                    style={{ bottom: '24%', fontSize: 9, letterSpacing: '0.02em', color: '#0B1330', background: C(0.92) }}
                  >
                    {c.caption}
                  </span>
                )}
              </>
            )}

            {/* the concept it came out of */}
            <span
              className="absolute left-1.5 top-1.5 max-w-[92%] truncate rounded px-1.5 py-[3px] font-ui"
              style={{
                fontSize: 9.5,
                color: C(0.95),
                background: c.src ? 'rgba(6, 11, 26, 0.72)' : 'transparent',
                border: c.src ? `1px solid ${c.accent}55` : 'none',
              }}
            >
              {c.title}
            </span>

            <div
              className="absolute inset-x-0 bottom-0 flex items-center justify-between px-1.5 py-1"
              style={{ background: 'rgba(6, 11, 26, 0.82)' }}
            >
              <span className="truncate font-mono" style={{ fontSize: 7, color: C(0.8) }}>
                {c.label}
              </span>
              <span className="font-mono" style={{ fontSize: 7, color: C(0.45) }}>
                {c.dur}
              </span>
            </div>
          </motion.div>
        ))}

        {/* ── and the rest of what it built ── */}
        <motion.div
          className="absolute top-1/2 flex flex-col items-center justify-center gap-1 rounded-lg"
          style={{
            left: `${stackX * 100}%`,
            width: `${stackW}%`,
            height: inSlot ? '88%' : '58%',
            y: '-50%',
            border: `1px dashed ${C(0.22)}`,
            background: 'rgba(9, 16, 40, 0.94)',
          }}
          initial={false}
          animate={p >= stackReveal ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
          transition={{ duration: 0.3 }}
          aria-hidden="true"
        >
          <span className="font-display font-medium" style={{ fontSize: inSlot ? 22 : 9, color: C(0.72) }}>
            {stackLabel}
          </span>
          {inSlot && stackSub && (
            <span className="font-mono uppercase" style={{ fontSize: 8.5, letterSpacing: '0.1em', color: C(0.42) }}>
              {stackSub}
            </span>
          )}
        </motion.div>

        {/* ── the raw input, receding to the right ── */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${p * 100}%)` }} aria-hidden="true">
          {source.kind === 'landscape' && <RawEpisode src={source.src} name={source.name} dur={source.dur} />}
          {source.kind === 'batch' && <RawBatch stills={source.stills} more={source.more} note={source.note} />}
          {source.kind === 'take' && (
            <RawTake src={source.src} name={source.name} dur={source.dur} note={source.note} takes={source.takes} />
          )}
        </div>

        {/* ── the bar ── */}
        {!reduced && (
          <div
            className="pointer-events-none absolute inset-y-0"
            style={{ left: `${p * 100}%` }}
            aria-hidden="true"
          >
            <span
              className="absolute inset-y-0 right-0 block w-[90px]"
              style={{ background: `linear-gradient(90deg, transparent, ${ROYCE}30)` }}
            />
            <span
              className="absolute inset-y-0 left-0 block w-px"
              style={{ background: C(0.9), boxShadow: `0 0 16px ${ROYCE}, 0 0 3px ${C(0.8)}` }}
            />
            <span
              className="absolute left-0 top-2 whitespace-nowrap rounded px-2 py-1 font-mono uppercase"
              style={{
                fontSize: 8.5,
                letterSpacing: '0.1em',
                color: '#0B1330',
                background: C(0.92),
                transform: p > 0.62 ? 'translateX(calc(-100% - 6px))' : 'translateX(6px)',
                opacity: done ? 0 : 1,
                transition: 'opacity .3s',
              }}
            >
              {steps[stepIdx]}
            </span>
            <span
              className="absolute top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
              style={{
                background: C(0.94),
                boxShadow: `0 0 0 4px ${ROYCE}33, 0 6px 18px rgba(4,8,22,.6)`,
                marginLeft: Math.min(0, (0.975 - p) * 640),
              }}
            >
              <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                <path
                  d="M4 1L1 4.5 4 8M8 1l3 3.5L8 8"
                  stroke="#0B1330"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        )}

      </div>

      <div className="mt-2.5 flex items-center justify-between gap-3">
        <span className="font-mono uppercase" style={{ fontSize: 9, letterSpacing: '0.12em', color: C(0.4) }}>
          {reduced ? outLabel : 'Drag to scrub'}
        </span>
        <span className="font-mono uppercase" style={{ fontSize: 9, letterSpacing: '0.12em', color: C(0.4) }}>
          Raw <span style={{ color: C(0.22) }}>——→</span> Finished
        </span>
      </div>
    </div>
  );
}

// ── substrates ────────────────────────────────────────────────

// Podcast: one long track being read for its best moments.
function Waveform({ p }: { p: number }) {
  return (
    <>
      <div className="absolute inset-x-0 top-0 flex h-6 items-end gap-[3px] px-1 opacity-50">
        {Array.from({ length: 80 }).map((_, i) => (
          <span
            key={i}
            className="block flex-1 rounded-full"
            style={{ height: i % 10 === 0 ? 9 : 4, background: C(i % 10 === 0 ? 0.22 : 0.1) }}
          />
        ))}
      </div>

      <div className="absolute inset-x-0 top-1/2 flex h-[46%] -translate-y-1/2 items-center gap-[2px] px-2">
        {BARS.map((h, i) => {
          const x = i / BARS.length;
          const read = x < p;
          const hot = MOMENTS.some((m) => Math.abs(m.at - x) < 0.045);
          return (
            <span
              key={i}
              className="block flex-1 rounded-full"
              style={{
                height: `${(hot ? h : h * 0.55) * 100}%`,
                background: read ? (hot ? SALMON : `${ROYCE}CC`) : C(0.08),
                transition: 'background .25s',
              }}
            />
          );
        })}
      </div>

      {MOMENTS.map((m) => (
        <div key={m.t} className="absolute bottom-3" style={{ left: `${m.at * 100}%`, transform: 'translateX(-50%)' }}>
          <motion.span
            className="block whitespace-nowrap rounded px-1.5 py-[2px] font-mono"
            style={{ fontSize: 8, color: '#0B1330', background: SALMON }}
            initial={false}
            animate={{ opacity: p > m.at && p < m.at + 0.15 ? 1 : 0, y: p > m.at ? 0 : 6 }}
            transition={{ duration: 0.25 }}
          >
            {m.t}
          </motion.span>
        </div>
      ))}
    </>
  );
}

// Nothing to show but the read itself, running behind the bar.
function ReadField({ p, count, unit }: { p: number; count: number; unit: string }) {
  const analyzed = Math.round(Math.min(1, p / 0.9) * count);

  return (
    <>
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(90% 120% at 30% 50%, ${ROYCE}1A, transparent 70%)` }}
      />
      <div
        className="absolute bottom-2"
        style={{ left: `${Math.min(p, 0.92) * 100}%`, transform: 'translateX(-100%)', paddingRight: 8 }}
      >
        <span
          className="block whitespace-nowrap rounded px-1.5 py-[3px] font-mono"
          style={{ fontSize: 8.5, color: C(0.85), background: 'rgba(6,11,26,.82)', border: `1px solid ${C(0.14)}` }}
        >
          {analyzed} / {count} {unit}
        </span>
      </div>
    </>
  );
}

// ── raw inputs ────────────────────────────────────────────────

// The wide two-camera podcast frame. Drawn rather than shot so it reads as
// footage without shipping a video for a placeholder.
function RawEpisode({ src, name, dur }: { src?: string; name: string; dur: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {src ? (
        <video
          src={src}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        <DrawnStudio />
      )}
      <span
        className="absolute inset-0 block"
        style={{ background: 'radial-gradient(85% 75% at 50% 45%, transparent 45%, rgba(4,8,22,.5))' }}
      />

      <span
        className="absolute left-3 top-3 rounded px-1.5 py-1 font-mono"
        style={{ fontSize: 8.5, color: C(0.8), background: 'rgba(6,11,26,.7)', border: `1px solid ${C(0.12)}` }}
      >
        {name}
      </span>
      <span
        className="absolute bottom-3 left-3 rounded px-1.5 py-1 font-mono uppercase"
        style={{ fontSize: 8.5, letterSpacing: '0.1em', color: C(0.55), background: 'rgba(6,11,26,.7)' }}
      >
        Raw · landscape · {dur}
      </span>
    </div>
  );
}

// One interview, shot in a single sitting: the take log is the story here,
// because most of what was recorded is a restart.
function RawTake({
  src,
  name,
  dur,
  note,
  takes,
}: {
  src?: string;
  name: string;
  dur: string;
  note: string;
  takes: { n: string; cut: boolean }[];
}) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: '#0B1430' }}>
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(110% 90% at 30% 45%, rgba(84,129,232,.10), transparent 72%)' }}
      />

      {/* the interview, drawn */}
      <div
        className="absolute top-1/2 overflow-hidden rounded-lg"
        style={{
          left: `${CLIP_X[0] * 100}%`,
          width: `${CLIP_W * 100}%`,
          aspectRatio: '9 / 16',
          transform: 'translateY(-50%)',
          border: `1px solid ${C(0.16)}`,
          boxShadow: '0 14px 34px rgba(4, 8, 22, 0.55)',
          background: C(0.05),
        }}
      >
        {src && (
          <video
            src={src}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        )}
        <span
          className="absolute left-1.5 top-1.5 rounded px-1.5 py-[3px] font-mono"
          style={{ fontSize: 7.5, color: C(0.85), background: 'rgba(6,11,26,.75)' }}
        >
          {name}
        </span>
        <span
          className="absolute bottom-1.5 left-1.5 rounded px-1.5 py-[3px] font-mono uppercase"
          style={{ fontSize: 7, letterSpacing: '0.08em', color: C(0.5), background: 'rgba(6,11,26,.75)' }}
        >
          Raw · {dur}
        </span>
      </div>

      {/* what's actually on the card */}
      <div
        className="absolute top-1/2 -translate-y-1/2 space-y-[5px]"
        style={{ left: `${(CLIP_X[0] + CLIP_W + 0.04) * 100}%`, right: '4%' }}
      >
        {takes.map((t) => (
          <div
            key={t.n}
            className="flex items-center gap-2 rounded px-2 py-[5px]"
            style={{
              background: t.cut ? 'transparent' : C(0.05),
              border: `1px solid ${t.cut ? C(0.07) : C(0.13)}`,
            }}
          >
            <span className="font-mono" style={{ fontSize: 8, color: C(t.cut ? 0.3 : 0.7) }}>
              {t.n}
            </span>
            <span
              className="flex-1 font-ui"
              style={{ fontSize: 9.5, color: C(t.cut ? 0.32 : 0.8), textDecoration: t.cut ? 'line-through' : 'none' }}
            >
              {t.cut ? 'restart' : 'usable'}
            </span>
            <span className="block h-[3px] rounded-full" style={{ width: t.cut ? 14 : 34, background: t.cut ? C(0.14) : `${ROYCE}AA` }} />
          </div>
        ))}
      </div>

      <span
        className="absolute right-3 top-3 rounded px-2 py-1 font-mono uppercase"
        style={{
          fontSize: 8.5,
          letterSpacing: '0.1em',
          color: C(0.7),
          background: 'rgba(6,11,26,.75)',
          border: `1px solid ${C(0.12)}`,
        }}
      >
        {note}
      </span>
    </div>
  );
}

// The batch itself: a strip of what came off the card. Stills rather than
// video — eight things moving at once fights the finished cuts for attention.
function RawBatch({ stills, more, note }: { stills: string[]; more: number; note: string }) {
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: '#0B1430' }}>
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(110% 90% at 40% 45%, rgba(84,129,232,.10), transparent 72%)' }}
      />

      <div className="relative flex flex-1 items-center gap-[6px] px-3 pt-7">
        {stills.map((src, i) => (
          <div
            key={src}
            className="relative min-w-0 flex-1 overflow-hidden rounded-md"
            style={{
              aspectRatio: '9 / 16',
              border: `1px solid ${C(0.14)}`,
              background: C(0.05),
              // a little scatter so it reads as a pile off the card, not a filmstrip
              transform: `translateY(${i % 2 ? 13 : -13}%)`,
            }}
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
          </div>
        ))}

        {/* the rest of the card, implied rather than rendered */}
        <div className="flex flex-shrink-0 items-center gap-[3px] self-stretch py-6 pl-1">
          <span className="block self-center rounded-sm" style={{ width: 5, height: 64, background: C(0.08), border: `1px solid ${C(0.13)}` }} />
          <span className="block self-center rounded-sm" style={{ width: 4, height: 48, background: C(0.06), border: `1px solid ${C(0.1)}` }} />
          <span className="ml-1 self-center font-mono uppercase leading-tight" style={{ fontSize: 8, letterSpacing: '0.08em', color: C(0.5) }}>
            +{more}
            <br />
            more
          </span>
        </div>
      </div>

      <div className="relative px-3 pb-2.5">
        <span
          className="rounded px-1.5 py-1 font-mono uppercase"
          style={{ fontSize: 8, letterSpacing: '0.1em', color: C(0.5), background: 'rgba(6,11,26,.7)' }}
        >
          Unsorted
        </span>
      </div>

      <span
        className="absolute right-3 top-3 rounded px-2 py-1 font-mono uppercase"
        style={{
          fontSize: 8.5,
          letterSpacing: '0.1em',
          color: C(0.7),
          background: 'rgba(6,11,26,.75)',
          border: `1px solid ${C(0.12)}`,
        }}
      >
        {note}
      </span>
    </div>
  );
}
