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

// ── Timeline clips (initial order) ──
const CLIPS = [
  { id: 'vo', label: '"Let\'s make Bolognese"', color: '#DC1DD9', width: 90, isVoiceover: true },
  { id: 'onion', label: 'Cutting onion', color: '#F9838E', width: 70 },
  { id: 'carrots', label: 'Grating carrots', color: '#5481E8', width: 65 },
  { id: 'celery', label: 'Cutting celery', color: '#5481E8', width: 60 },
  { id: 'meat', label: 'Adding meat', color: '#D4A853', width: 70 },
  { id: 'plating', label: 'Final Plating', color: '#D4A853', width: 75 },
];

// After rearrange: plating moves to front as the hook
const CLIPS_REARRANGED = [
  { id: 'plating', label: 'Final Plating', color: '#D4A853', width: 75, isHook: true },
  { id: 'vo', label: '"Let\'s make Bolognese"', color: '#DC1DD9', width: 90, isVoiceover: true },
  { id: 'onion', label: 'Cutting onion', color: '#F9838E', width: 70 },
  { id: 'carrots', label: 'Grating carrots', color: '#5481E8', width: 65 },
  { id: 'celery', label: 'Cutting celery', color: '#5481E8', width: 60 },
  { id: 'meat', label: 'Adding meat', color: '#D4A853', width: 70 },
];

// ── Fake upload thumbnails (iPhone naming) ──
const UPLOADS = [
  { id: 1, name: 'IMG_7947.MOV', color: '#F9838E15', accent: '#F9838E' },
  { id: 2, name: 'IMG_7948.MOV', color: '#DC1DD915', accent: '#DC1DD9' },
  { id: 3, name: 'IMG_7949.MOV', color: '#5481E815', accent: '#5481E8' },
  { id: 4, name: 'IMG_7950.MOV', color: '#5481E815', accent: '#5481E8' },
  { id: 5, name: 'IMG_7951.MOV', color: '#D4A85315', accent: '#D4A853' },
  { id: 6, name: 'IMG_7952.MOV', color: '#F9838E15', accent: '#F9838E' },
  { id: 7, name: 'IMG_7953.MOV', color: '#DC1DD915', accent: '#DC1DD9' },
  { id: 8, name: 'IMG_7954.MOV', color: '#5481E815', accent: '#5481E8' },
  { id: 9, name: 'IMG_7955.MOV', color: '#D4A85315', accent: '#D4A853' },
  { id: 10, name: 'IMG_7956.MOV', color: '#F9838E15', accent: '#F9838E' },
  { id: 11, name: 'IMG_7957.MOV', color: '#DC1DD915', accent: '#DC1DD9' },
  { id: 12, name: 'IMG_7958.MOV', color: '#5481E815', accent: '#5481E8' },
  { id: 13, name: 'IMG_7959.MOV', color: '#D4A85315', accent: '#D4A853' },
  { id: 14, name: 'IMG_7960.MOV', color: '#F9838E15', accent: '#F9838E' },
];

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
          className="w-1.5 h-1.5 rounded-full bg-zinc-500 block"
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
        style={{ borderColor: '#ffffff15', background: '#ffffff04' }}
      >
        <p className="text-xs mb-2" style={{ color: '#ffffff40' }}>Drop your footage</p>
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
        <span className="text-[10px] font-mono" style={{ color: '#ffffff30' }}>Story driver</span>
        <div className="flex gap-1">
          <motion.div
            initial={{ borderColor: '#ffffff10' }}
            animate={{ borderColor: '#5481E860', background: '#5481E815' }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="flex-1 rounded-lg border px-2.5 py-2 text-xs text-center"
            style={{ background: '#ffffff06' }}
          >
            <span style={{ color: '#5481E8' }}>Visual</span>
          </motion.div>
          <div
            className="flex-1 rounded-lg border px-2.5 py-2 text-xs text-center"
            style={{ borderColor: '#ffffff10', background: '#ffffff04', color: '#ffffff30' }}
          >
            Dialogue
          </div>
        </div>
      </div>
      {/* Hook selector */}
      <div className="flex-1 space-y-1.5">
        <span className="text-[10px] font-mono" style={{ color: '#ffffff30' }}>Hook</span>
        <motion.div
          initial={{ borderColor: '#ffffff10' }}
          animate={{ borderColor: '#D4A85360' }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="rounded-lg border px-3 py-2 text-xs flex items-center justify-between"
          style={{ background: '#ffffff06' }}
        >
          <span style={{ color: '#F9F7F1CC' }}>Final plating</span>
          <span style={{ color: '#ffffff30' }}>▾</span>
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
        style={{ color: '#DC1DD9' }}
      >
        ✦
      </motion.span>
      <span className="text-sm" style={{ color: isLatest ? '#F9F7F1CC' : '#F9F7F180' }}>
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
          <div className="h-px flex-1" style={{ background: '#ffffff10' }} />
          <span className="text-[10px] font-mono" style={{ color: '#ffffff25' }}>{label}</span>
          <div className="h-px flex-1" style={{ background: '#ffffff10' }} />
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
    <section ref={sectionRef} className="relative py-24 md:py-32 px-6 overflow-hidden">
      <div className="mx-auto max-w-6xl flex flex-col lg:flex-row-reverse items-start gap-12 lg:gap-20">

        {/* ── Right: copy (reversed layout from Plan) ── */}
        <div className="flex-1 lg:max-w-md lg:sticky lg:top-32">
          <p
            className="mb-4 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: '#5481E8' }}
          >
            Edit
          </p>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] mb-5"
            style={{ color: '#F9F7F1' }}
          >
            Raw footage in. Rough draft out.
          </h2>
          <p className="text-base md:text-lg leading-relaxed mb-8" style={{ color: '#ffffff70' }}>
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
                  color: '#F9F7F1AA',
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
              borderColor: '#ffffff10',
              background: '#ffffff03',
            }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: '#ffffff08' }}>
              <div className="w-2 h-2 rounded-full bg-zinc-700" />
              <div className="w-2 h-2 rounded-full bg-zinc-700" />
              <div className="w-2 h-2 rounded-full bg-zinc-700" />
              <span className="ml-3 text-[10px] font-mono" style={{ color: '#ffffff20' }}>
                clik editor
              </span>
            </div>

            {/* Animation area */}
            <div ref={animRef} className="px-4 py-5 space-y-4 h-[380px] md:h-[420px] overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>

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
                      border: '1px solid #DC1DD915',
                      background: 'linear-gradient(135deg, #DC1DD906, #5481E804)',
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
