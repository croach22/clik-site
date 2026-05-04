import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// ── Animation steps ──
type StepType =
  | 'upload'
  | 'select-options'
  | 'ai-message'
  | 'timeline-build'
  | 'timeline-rearrange';

interface Step {
  type: StepType;
  text?: string;
  delay: number; // ms after previous step
}

const SCRIPT: Step[] = [
  { type: 'upload', delay: 0 },
  { type: 'select-options', delay: 2000 },
  { type: 'ai-message', text: 'Analyzing your footage...', delay: 1400 },
  { type: 'ai-message', text: 'I see you cooked Bolognese. Focusing on visual actions.', delay: 2200 },
  { type: 'timeline-build', delay: 1800 },
  { type: 'ai-message', text: 'Curating a timeline based on your cooking steps...', delay: 1600 },
  { type: 'timeline-rearrange', delay: 2000 },
  { type: 'ai-message', text: 'Moving final plating to the front as your hook.', delay: 1800 },
];

const LOOP_PAUSE = 3000;
const FADE_OUT_DURATION = 800;

// ── Muted accent palette for product viz (desaturated, cream-friendly) ──
// Royce blue + salmon stay as primary brand. Sage / lavender / ochre add subtle
// differentiation across clips and uploads without violating the page chrome rules.
const ROYCE    = '#5481E8';
const SALMON   = '#F9838E';
const SAGE     = '#7CA088';
const LAVENDER = '#9785B8';
const OCHRE    = '#C5A578';

// ── Timeline clips (initial order) ──
const CLIPS = [
  { id: 'vo',      label: '"Let\'s make Bolognese"', color: LAVENDER, width: 90, isVoiceover: true },
  { id: 'onion',   label: 'Cutting onion',           color: SALMON,   width: 70 },
  { id: 'carrots', label: 'Grating carrots',         color: OCHRE,    width: 65 },
  { id: 'celery',  label: 'Cutting celery',          color: SAGE,     width: 60 },
  { id: 'meat',    label: 'Adding meat',             color: ROYCE,    width: 70 },
  { id: 'plating', label: 'Final Plating',           color: SALMON,   width: 75 },
];

// After rearrange: plating moves to front as the hook
const CLIPS_REARRANGED = [
  { id: 'plating', label: 'Final Plating',           color: SALMON,   width: 75, isHook: true },
  { id: 'vo',      label: '"Let\'s make Bolognese"', color: LAVENDER, width: 90, isVoiceover: true },
  { id: 'onion',   label: 'Cutting onion',           color: SALMON,   width: 70 },
  { id: 'carrots', label: 'Grating carrots',         color: OCHRE,    width: 65 },
  { id: 'celery',  label: 'Cutting celery',          color: SAGE,     width: 60 },
  { id: 'meat',    label: 'Adding meat',             color: ROYCE,    width: 70 },
];

// ── Fake upload thumbnails — rotate through 5 muted accents ──
const UPLOAD_ACCENTS = [SALMON, SAGE, ROYCE, LAVENDER, OCHRE];
const UPLOADS = Array.from({ length: 14 }, (_, i) => {
  const accent = UPLOAD_ACCENTS[i % UPLOAD_ACCENTS.length];
  return {
    id: i + 1,
    name: `IMG_${7947 + i}.MOV`,
    color: `${accent}15`,
    accent,
  };
});

// ── Capability pills ──
const CAPABILITIES = [
  { label: 'Instant rough cut', icon: '✦' },
  { label: 'AI Search', icon: '✦' },
  { label: 'Viral captions', icon: '✦' },
];

// ── Sub-components ──

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-clik-midnight/40 block"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function UploadArea({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="rounded-lg border border-dashed px-4 py-3 text-center"
        style={{ borderColor: 'rgba(14, 24, 52, 0.15)', background: 'rgba(14, 24, 52, 0.04)' }}
      >
        <p className="text-xs mb-2" style={{ color: 'rgba(14, 24, 52, 0.5)' }}>Drop your footage</p>
        <div className="flex gap-1 justify-center flex-wrap">
          {UPLOADS.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
              className="rounded flex flex-col items-center justify-center"
              style={{
                width: 44,
                height: 34,
                background: u.color,
                border: `1px solid ${u.accent}30`,
              }}
            >
              <div className="w-3 h-2 rounded-sm mb-0.5" style={{ background: `${u.accent}40` }} />
              <span className="text-[6px] font-mono" style={{ color: `${u.accent}99` }}>{u.name.replace('.MOV', '')}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function OptionsSelector({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex gap-3"
    >
      {/* Story driver toggle */}
      <div className="flex-1 space-y-1.5">
        <span className="text-[10px] font-mono" style={{ color: 'rgba(14, 24, 52, 0.45)' }}>Story driver</span>
        <div className="flex gap-1">
          <motion.div
            initial={{ borderColor: 'rgba(14, 24, 52, 0.10)' }}
            animate={{ borderColor: '#5481E860', background: '#5481E815' }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="flex-1 rounded-lg border px-2.5 py-2 text-xs text-center"
            style={{ background: 'rgba(14, 24, 52, 0.05)' }}
          >
            <span style={{ color: '#5481E8' }}>Visual</span>
          </motion.div>
          <div
            className="flex-1 rounded-lg border px-2.5 py-2 text-xs text-center"
            style={{ borderColor: 'rgba(14, 24, 52, 0.10)', background: 'rgba(14, 24, 52, 0.04)', color: 'rgba(14, 24, 52, 0.45)' }}
          >
            Dialogue
          </div>
        </div>
      </div>
      {/* Hook selector */}
      <div className="flex-1 space-y-1.5">
        <span className="text-[10px] font-mono" style={{ color: 'rgba(14, 24, 52, 0.45)' }}>Hook</span>
        <motion.div
          initial={{ borderColor: 'rgba(14, 24, 52, 0.10)' }}
          animate={{ borderColor: '#F9838E60' }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="rounded-lg border px-3 py-2 text-xs flex items-center justify-between"
          style={{ background: 'rgba(14, 24, 52, 0.05)' }}
        >
          <span style={{ color: 'rgba(14, 24, 52, 0.85)' }}>Final plating</span>
          <span style={{ color: 'rgba(14, 24, 52, 0.45)' }}>▾</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

function AIMessage({ text, isLatest }: { text: string; isLatest: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isLatest ? 1 : 0.4, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex items-start gap-2"
    >
      <motion.span
        animate={isLatest ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.3 }}
        transition={isLatest ? { repeat: Infinity, duration: 2 } : {}}
        className="mt-0.5 flex-shrink-0 text-xs"
        style={{ color: '#F9838E' }}
      >
        ✦
      </motion.span>
      <span className="text-sm" style={{ color: isLatest ? 'rgba(14, 24, 52, 0.85)' : 'rgba(14, 24, 52, 0.5)' }}>
        {text}
      </span>
    </motion.div>
  );
}

interface TimelineClip {
  id: string;
  label: string;
  color: string;
  width: number;
  isVoiceover?: boolean;
  isHook?: boolean;
}

function Timeline({ clips, label }: { clips: TimelineClip[]; label?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-2"
    >
      {label && (
        <div className="flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: 'rgba(14, 24, 52, 0.10)' }} />
          <span className="text-[10px] font-mono" style={{ color: 'rgba(14, 24, 52, 0.45)' }}>{label}</span>
          <div className="h-px flex-1" style={{ background: 'rgba(14, 24, 52, 0.10)' }} />
        </div>
      )}
      <div className="flex gap-1">
        {clips.map((clip, i) => (
          <motion.div
            key={clip.id}
            layout
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: clip.width, opacity: 1 }}
            transition={{
              width: { type: 'spring', stiffness: 100, damping: 20, delay: i * 0.08 },
              opacity: { duration: 0.25, delay: i * 0.08 },
              layout: { type: 'spring', stiffness: 120, damping: 22 },
            }}
            className="relative flex-shrink-0 rounded-md overflow-hidden"
            style={{
              height: 40,
              background: `${clip.color}15`,
              border: `1px solid ${clip.color}${clip.isHook ? '60' : '30'}`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center px-1">
              <span
                className="text-[8px] font-mono truncate"
                style={{
                  color: `${clip.color}CC`,
                  fontStyle: clip.isVoiceover ? 'italic' : 'normal',
                }}
              >
                {clip.isHook && (
                  <span className="text-[7px] mr-0.5" style={{ color: clip.color }}>▶ </span>
                )}
                {clip.label}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main component ──
export default function FeatureEdit() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });

  const [visibleStep, setVisibleStep] = useState(-1);
  const [fading, setFading] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const runSequence = useCallback(() => {
    clearAllTimeouts();
    setVisibleStep(-1);
    setFading(false);

    let elapsed = 0;

    SCRIPT.forEach((step, i) => {
      elapsed += step.delay;
      addTimeout(() => setVisibleStep(i), elapsed);
    });

    const totalDuration = elapsed + LOOP_PAUSE;
    addTimeout(() => setFading(true), totalDuration);
    addTimeout(() => runSequence(), totalDuration + FADE_OUT_DURATION + 200);
  }, [clearAllTimeouts, addTimeout]);

  useEffect(() => {
    if (isInView) {
      runSequence();
    } else {
      clearAllTimeouts();
      setVisibleStep(-1);
      setFading(false);
    }
    return clearAllTimeouts;
  }, [isInView, runSequence, clearAllTimeouts]);

  // Auto-scroll animation area when new steps appear
  useEffect(() => {
    if (animRef.current) {
      animRef.current.scrollTop = animRef.current.scrollHeight;
    }
  }, [visibleStep]);

  // Derive visible state from step index
  const showUpload = visibleStep >= 0;
  const showOptions = visibleStep >= 1;
  const aiMessages = SCRIPT.slice(0, visibleStep + 1)
    .filter((s): s is Step & { text: string } => s.type === 'ai-message' && !!s.text);
  const showTimeline = visibleStep >= 4; // timeline-build step
  const showRearranged = visibleStep >= 6; // timeline-rearrange step
  const latestAiIndex = aiMessages.length - 1;

  return (
    <section ref={sectionRef} id="how-it-works" className="relative py-24 md:py-32 px-6 overflow-hidden">
      <div className="mx-auto max-w-6xl flex flex-col lg:flex-row-reverse items-start gap-12 lg:gap-20">

        {/* ── Right: copy (reversed layout from Plan) ── */}
        <div className="flex-1 lg:max-w-md lg:sticky lg:top-32">
          <p
            className="mb-4 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: '#5481E8' }}
          >
            Edit Agent
          </p>
          <h2
            className="font-display font-medium leading-[1.05] mb-5 text-clik-midnight"
            style={{ fontSize: 'clamp(28px, 4vw, 46px)', letterSpacing: '-0.02em' }}
          >
            Raw footage in. Rough draft out<span style={{ color: '#5481E8' }}>.</span>
          </h2>
          <p className="text-base md:text-lg leading-relaxed mb-8" style={{ color: 'rgba(14, 24, 52, 0.7)' }}>
            Upload your clips, pick a format, and get a publish-ready edit in minutes.
            Find missing moments with AI Search. Add viral captions with one click.
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
                <span style={{ color: '#5481E8', fontSize: 10 }}>{cap.icon}</span>
                {cap.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Left: edit animation ── */}
        <div className="flex-1 w-full lg:max-w-xl">
          <motion.div
            animate={{ opacity: fading ? 0 : 1 }}
            transition={{ duration: fading ? FADE_OUT_DURATION / 1000 : 0.3 }}
            className="rounded-2xl border overflow-hidden"
            style={{
              borderColor: 'rgba(14, 24, 52, 0.10)',
              background: '#E8E5DC',
            }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: 'rgba(14, 24, 52, 0.08)' }}>
              <div className="w-2 h-2 rounded-full bg-clik-midnight/15" />
              <div className="w-2 h-2 rounded-full bg-clik-midnight/15" />
              <div className="w-2 h-2 rounded-full bg-clik-midnight/15" />
              <span className="ml-3 text-[10px] font-mono" style={{ color: 'rgba(14, 24, 52, 0.4)' }}>
                clik editor
              </span>
            </div>

            {/* Animation area */}
            <div ref={animRef} className="no-scrollbar px-4 py-5 space-y-4 h-[380px] md:h-[420px] overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>

              {/* Upload step */}
              <UploadArea visible={showUpload} />

              {/* Options selector (Visual/Dialogue + Hook) */}
              <OptionsSelector visible={showOptions} />

              {/* AI messages */}
              <AnimatePresence mode="sync">
                {aiMessages.length > 0 && (
                  <motion.div
                    key="ai-messages"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2 rounded-xl px-3.5 py-3"
                    style={{
                      border: '1px solid rgba(84, 129, 232, 0.15)',
                      background: 'rgba(84, 129, 232, 0.05)',
                    }}
                  >
                    {aiMessages.map((msg, i) => (
                      <AIMessage
                        key={`${msg.text}-${i}`}
                        text={msg.text}
                        isLatest={i === latestAiIndex}
                      />
                    ))}
                    {visibleStep < SCRIPT.length - 1 && visibleStep >= 2 && (
                      <div className="pl-5">
                        <TypingDots />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Timeline */}
              <AnimatePresence mode="wait">
                {showTimeline && !showRearranged && (
                  <Timeline key="initial" clips={CLIPS} label="rough draft · 6 clips" />
                )}
                {showRearranged && (
                  <Timeline key="rearranged" clips={CLIPS_REARRANGED} label="hook optimized · ready to publish" />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
