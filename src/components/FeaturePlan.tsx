import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// ── Chat script ──
type MessageType = 'user' | 'ai-text' | 'ai-card' | 'ai-tip';

interface ChatMessage {
  type: MessageType;
  text?: string;
  cardTitle?: string;
  cardItems?: string[];
  delay: number; // ms after previous message
}

const SCRIPT: ChatMessage[] = [
  {
    type: 'user',
    text: "I really want to start making cooking content but have no idea where to start. What tips do you have?",
    delay: 0,
  },
  {
    type: 'ai-text',
    text: "It depends on your style. Do you want to talk to the camera while you cook, or add a voiceover later? Honestly, I think voiceover is easier — it makes filming simpler.",
    delay: 1800,
  },
  {
    type: 'user',
    text: "Yeah, let's start with a visuals-focused video.",
    delay: 2500,
  },
  {
    type: 'ai-text',
    text: "Great, let's do it. What are you cooking?",
    delay: 1400,
  },
  {
    type: 'user',
    text: "Bolognese.",
    delay: 1800,
  },
  {
    type: 'ai-text',
    text: "Here's a rough idea of shots you should capture based on the recipe. Don't worry about the storyline yet — just focus on capturing these actions:",
    delay: 1800,
  },
  {
    type: 'ai-card',
    cardTitle: 'Shot List',
    cardItems: [
      'Cutting an onion — top down, halfway through',
      'Move camera to a front-on shot',
      'Grating carrots — start to finish',
    ],
    delay: 600,
  },
  {
    type: 'ai-tip',
    text: "I'll pull a few clips for you later. Don't worry about recording too much.",
    delay: 1000,
  },
];

const LOOP_PAUSE = 3000; // ms pause before restarting
const FADE_OUT_DURATION = 800; // ms for fade out

// ── Capability pills ──
const CAPABILITIES = [
  { label: 'Brainstorm ideas', icon: '✦' },
  { label: 'Write scripts', icon: '✦' },
  { label: 'Build shot lists', icon: '✦' },
];

// ── Typing indicator ──
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
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

// ── Message components ──
function UserBubble({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex justify-end"
    >
      <div
        className="rounded-2xl rounded-br-sm px-4 py-2.5 text-sm max-w-[85%]"
        style={{
          background: 'rgba(14, 24, 52, 0.05)',
          border: '1px solid rgba(14, 24, 52, 0.14)',
          color: 'rgba(14, 24, 52, 0.85)',
        }}
      >
        {text}
      </div>
    </motion.div>
  );
}

function AITextBubble({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex justify-start"
    >
      <div
        className="flex items-start gap-2.5 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm max-w-[85%]"
        style={{
          border: '1px solid rgba(84, 129, 232, 0.25)',
          background: 'rgba(84, 129, 232, 0.06)',
          color: 'rgba(14, 24, 52, 0.85)',
        }}
      >
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="mt-0.5 flex-shrink-0 text-xs"
          style={{ color: '#5481E8' }}
        >
          ✦
        </motion.span>
        <span>{text}</span>
      </div>
    </motion.div>
  );
}

function AICardBubble({ title, items }: { title: string; items: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex justify-start pl-2"
    >
      <div
        className="rounded-xl px-4 py-3 text-sm max-w-[85%] w-full"
        style={{
          background: 'rgba(14, 24, 52, 0.05)',
          border: '1px solid #5481E820',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span style={{ color: '#5481E8' }} className="text-xs">&#9776;</span>
          <span className="text-xs font-semibold tracking-wide" style={{ color: '#5481E8CC' }}>
            {title}
          </span>
        </div>
        <div className="space-y-1.5">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.25 }}
              className="flex items-start gap-2 text-xs"
              style={{ color: 'rgba(14, 24, 52, 0.7)' }}
            >
              <span className="mt-0.5 flex-shrink-0" style={{ color: '#5481E860' }}>{i + 1}.</span>
              <span>{item}</span>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: items.length * 0.1 + 0.3, duration: 0.3 }}
          className="mt-2 pt-2 border-t flex items-center justify-between"
          style={{ borderColor: '#5481E815' }}
        >
          <span className="text-[10px]" style={{ color: '#5481E870' }}>
            + 9 more shots
          </span>
          <span className="text-[10px]" style={{ color: '#5481E850' }}>
            View full list →
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}

function AITipBubble({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex justify-start pl-2"
    >
      <div
        className="flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-xs max-w-[85%]"
        style={{
          background: 'rgba(249, 131, 142, 0.06)',
          border: '1px solid rgba(249, 131, 142, 0.25)',
          color: '#F9838E',
        }}
      >
        <span className="mt-0.5 flex-shrink-0">&#9888;</span>
        <span>{text}</span>
      </div>
    </motion.div>
  );
}

// ── Main component ──
export default function FeaturePlan() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });

  const [visibleCount, setVisibleCount] = useState(0);
  const [showTyping, setShowTyping] = useState(false);
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
    setVisibleCount(0);
    setShowTyping(false);
    setFading(false);

    let elapsed = 0;

    SCRIPT.forEach((msg, i) => {
      elapsed += msg.delay;

      // Show typing indicator before AI messages
      if (msg.type !== 'user' && i > 0 && SCRIPT[i - 1].type === 'user') {
        addTimeout(() => setShowTyping(true), elapsed - 800);
      }

      const showAt = elapsed;
      addTimeout(() => {
        setShowTyping(false);
        setVisibleCount(i + 1);
      }, showAt);
    });

    // After all messages, pause then fade and restart
    const totalDuration = elapsed + LOOP_PAUSE;
    addTimeout(() => setFading(true), totalDuration);
    addTimeout(() => runSequence(), totalDuration + FADE_OUT_DURATION + 200);
  }, [clearAllTimeouts, addTimeout]);

  useEffect(() => {
    if (isInView) {
      runSequence();
    } else {
      clearAllTimeouts();
      setVisibleCount(0);
      setShowTyping(false);
      setFading(false);
    }
    return clearAllTimeouts;
  }, [isInView, runSequence, clearAllTimeouts]);

  // Auto-scroll chat to bottom when new messages appear
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [visibleCount, showTyping]);

  const visibleMessages = SCRIPT.slice(0, visibleCount);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 px-6 overflow-hidden">
      <div className="mx-auto max-w-6xl flex flex-col lg:flex-row items-start gap-12 lg:gap-20">

        {/* ── Left: copy ── */}
        <div className="flex-1 lg:max-w-md lg:sticky lg:top-32">
          <div className="clik-section-header">
            <span className="idx">[ 05 ]</span>
            <span className="rule"></span>
            <span className="label">BRAINSTORM AGENT</span>
          </div>
          <h2
            className="font-display font-medium leading-[1.05] mb-5 text-clik-midnight"
            style={{ fontSize: 'clamp(28px, 4vw, 46px)', letterSpacing: '-0.02em' }}
          >
            Like having a creative team behind you<span style={{ color: '#5481E8' }}>.</span>
          </h2>
          <p className="text-base md:text-lg leading-relaxed mb-8" style={{ color: 'rgba(14, 24, 52, 0.7)' }}>
            Your AI creative strategist helps you brainstorm ideas, write scripts,
            and build shot lists — so when you hit record, you know exactly what to shoot.
          </p>

          {/* Capability pills */}
          <div className="flex flex-wrap gap-2.5">
            {CAPABILITIES.map((cap) => (
              <span
                key={cap.label}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm"
                style={{
                  border: '1px solid rgba(84, 129, 232, 0.25)',
                  background: 'rgba(84, 129, 232, 0.06)',
                  color: 'rgba(14, 24, 52, 0.7)',
                }}
              >
                <span style={{ color: '#5481E8', fontSize: 10 }}>{cap.icon}</span>
                {cap.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Right: chat animation ── */}
        <div className="flex-1 w-full lg:max-w-xl">
          <motion.div
            animate={{ opacity: fading ? 0 : 1 }}
            transition={{ duration: fading ? FADE_OUT_DURATION / 1000 : 0.3 }}
            className="rounded-2xl border overflow-hidden"
            style={{
              borderColor: 'rgba(14, 24, 52, 0.10)',
              background: '#F1EEE5',
            }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: 'rgba(14, 24, 52, 0.08)' }}>
              <div className="w-2 h-2 rounded-full bg-clik-midnight/15" />
              <div className="w-2 h-2 rounded-full bg-clik-midnight/15" />
              <div className="w-2 h-2 rounded-full bg-clik-midnight/15" />
              <span className="ml-3 text-[10px] font-mono" style={{ color: 'rgba(14, 24, 52, 0.4)' }}>
                clik assistant
              </span>
            </div>

            {/* Chat area */}
            <div ref={chatRef} className="no-scrollbar px-4 py-5 space-y-3 h-[380px] md:h-[420px] overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>
              <AnimatePresence mode="sync">
                {visibleMessages.map((msg, i) => {
                  const key = `${msg.type}-${i}`;
                  switch (msg.type) {
                    case 'user':
                      return <UserBubble key={key} text={msg.text!} />;
                    case 'ai-text':
                      return <AITextBubble key={key} text={msg.text!} />;
                    case 'ai-card':
                      return <AICardBubble key={key} title={msg.cardTitle!} items={msg.cardItems!} />;
                    case 'ai-tip':
                      return <AITipBubble key={key} text={msg.text!} />;
                  }
                })}
                {showTyping && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-start"
                  >
                    <div
                      className="rounded-2xl rounded-bl-sm"
                      style={{
                        border: '1px solid rgba(84, 129, 232, 0.25)',
                        background: 'rgba(84, 129, 232, 0.06)',
                      }}
                    >
                      <TypingDots />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Fake input bar */}
            <div className="px-4 pb-4">
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                style={{
                  background: 'rgba(14, 24, 52, 0.04)',
                  border: '1px solid rgba(14, 24, 52, 0.10)',
                }}
              >
                <span className="text-sm" style={{ color: 'rgba(14, 24, 52, 0.4)' }}>
                  Ask anything about your content...
                </span>
                <div className="ml-auto">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 8H14M14 8L9 3M14 8L9 13" stroke="rgba(14, 24, 52, 0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
