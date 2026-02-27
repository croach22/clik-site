import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const presets = [
  { id: "cooking", emoji: "🍳", label: "Edit a cooking video for me", color: "border-orange-500/20 bg-orange-500/[0.06] hover:border-orange-400/30 hover:bg-orange-500/10" },
  { id: "startup", emoji: "🚀", label: "Build a content plan for my startup", color: "border-blue-500/20 bg-blue-500/[0.06] hover:border-blue-400/30 hover:bg-blue-500/10" },
  { id: "shotlist", emoji: "🎬", label: "Help me build a shot list", color: "border-red-500/20 bg-red-500/[0.06] hover:border-red-400/30 hover:bg-red-500/10" },
  { id: "vlog", emoji: "📱", label: "Brainstorm what to capture for my daily vlog", color: "border-violet-500/20 bg-violet-500/[0.06] hover:border-violet-400/30 hover:bg-violet-500/10" },
];

const responses: Record<string, string> = {
  cooking: `Got it. Here's how I'd approach your cooking video:

**Hook (0–5s)**
Open on your most satisfying moment — the sizzle, the pour, the final plating. Don't save it for the end.

**Cut the dead air**
Any silence over 2 seconds between steps gets trimmed. Viewers drop off fast.

**Keep the personality**
Your reactions, jokes, off-hand commentary — those stay. That's what builds an audience.

**Pacing**
Faster cuts during prep, slower during key techniques so viewers can actually follow along.

Upload your footage and I'll handle the rest.`,

  startup: `Here's a solid framework to start from:

**Weekly cadence**
- 2× educational posts (teach something your audience needs)
- 1× behind-the-scenes (builds trust and familiarity)
- 1× founder perspective (your honest take on the industry)

**Formats that work for startups**
- Short-form video: problem → solution in under 60 seconds
- Carousels: step-by-step breakdowns
- Text posts: specific, honest takes on building

What's your industry and who are you trying to reach? I can make this a lot more targeted.`,

  shotlist: `Here's a universal shot list to build from:

**Establishing shots**
- Wide shot of your main setting
- Detail close-ups — hands, textures, environment

**Action shots**
- The process in motion (whatever you're making or doing)
- Reaction shots of you or your subject

**B-roll**
- 3–5 ambient clips for atmosphere and movement
- Your subject from multiple angles

Tell me more about the video and I'll trim this down to exactly what you need.`,

  vlog: `Daily vlogs live or die by variety. Here's a capture checklist:

**Morning**
- Your actual routine — keep it real, not polished
- One thing you're working toward or thinking about today

**Throughout the day**
- Any unexpected moment (those are gold)
- A conversation, a decision, a small win or setback

**Evening**
- A reflection: what happened, what you learned, what's next
- One honest moment — vulnerability is what makes people subscribe

The more you capture, the more you have to work with.`,

  generic: `Good question. Here's where I'd start:

**Understand your goal first**
Are you trying to grow an audience, promote something, or just document? Each calls for a different approach.

**Content that consistently works**
- Show the process, not just the result
- Be specific — broad advice gets ignored, specific details get saved
- One strong idea per video beats five okay ones

**On the editing side**
Hook in the first 3 seconds, cut anything that doesn't move the story forward, and end before they're ready for you to.

Sign in and tell me more — I can get a lot more specific once I know what you're working on.`,
};

function getResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("cook") || lower.includes("food") || lower.includes("recipe")) return responses.cooking;
  if (lower.includes("startup") || lower.includes("content plan") || lower.includes("brand") || lower.includes("business")) return responses.startup;
  if (lower.includes("shot list") || lower.includes("shot") || lower.includes("shots")) return responses.shotlist;
  if (lower.includes("vlog") || lower.includes("daily") || lower.includes("capture") || lower.includes("film")) return responses.vlog;
  return responses.generic;
}

type Phase = "idle" | "thinking" | "responding" | "done" | "capture";

function ResponseText({ text, streaming }: { text: string; streaming: boolean }) {
  const lines = text.split("\n");
  const linesToFormat = streaming ? lines.slice(0, -1) : lines;
  const partialLine = streaming ? lines[lines.length - 1] : null;

  return (
    <div className="text-sm leading-relaxed text-left">
      {linesToFormat.map((line, i) => {
        if (line === "") return <div key={i} className="h-1.5" />;
        if (line.startsWith("**") && line.endsWith("**"))
          return <p key={i} className="font-semibold text-white mt-2 mb-0.5">{line.slice(2, -2)}</p>;
        if (line.startsWith("- "))
          return (
            <p key={i} className="text-zinc-300 pl-3">
              <span className="text-zinc-600 mr-2">–</span>{line.slice(2)}
            </p>
          );
        return <p key={i} className="text-zinc-300">{line}</p>;
      })}
      {partialLine !== null && (
        <span className="text-zinc-300">
          {partialLine}
          <span className="inline-block w-0.5 h-3.5 bg-zinc-400 ml-0.5 align-middle animate-pulse" />
        </span>
      )}
    </div>
  );
}

export default function ConceptChat() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [userMessage, setUserMessage] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [streamedText, setStreamedText] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamedText, phase]);

  const startConversation = (message: string) => {
    if (phase !== "idle" || !message.trim()) return;
    setUserMessage(message.trim());
    setInputValue("");
    setPhase("thinking");

    setTimeout(() => {
      setPhase("responding");
      const full = getResponse(message);
      let i = 0;
      setStreamedText("");

      streamRef.current = setInterval(() => {
        i = Math.min(i + 3, full.length);
        setStreamedText(full.slice(0, i));
        if (i >= full.length) {
          clearInterval(streamRef.current!);
          setPhase("done");
          setTimeout(() => setPhase("capture"), 700);
        }
      }, 18);
    }, 1000);
  };

  const handlePreset = (preset: (typeof presets)[0]) => startConversation(preset.label);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startConversation(inputValue);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  const reset = () => {
    if (streamRef.current) clearInterval(streamRef.current);
    setPhase("idle");
    setUserMessage("");
    setStreamedText("");
    setEmail("");
    setSubmitted(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const isActive = phase !== "idle";

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Chat window */}
      <div className="rounded-2xl border border-white/15 bg-white/[0.025] overflow-hidden">

        {/* Messages */}
        <div ref={scrollRef} className="px-5 py-6 space-y-3 min-h-[180px] max-h-[400px] overflow-y-auto">

          {/* Clik greeting bubble */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex justify-start"
          >
            <div className="bg-zinc-800/70 text-zinc-200 text-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
              What can I help you with today?
            </div>
          </motion.div>

          <AnimatePresence>
            {/* User message bubble */}
            {userMessage && (
              <motion.div
                key="user"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
              >
                <div className="bg-white/10 text-zinc-100 text-sm rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                  {userMessage}
                </div>
              </motion.div>
            )}

            {/* Thinking dots bubble */}
            {phase === "thinking" && (
              <motion.div
                key="thinking"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="bg-zinc-800/70 rounded-2xl rounded-tl-sm px-4 py-3">
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
                </div>
              </motion.div>
            )}

            {/* AI response bubble */}
            {(phase === "responding" || phase === "done" || phase === "capture") && streamedText && (
              <motion.div
                key="response"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-zinc-800/70 text-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                  <ResponseText text={streamedText} streaming={phase === "responding"} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input area */}
        <div className="px-4 py-4">
          {/* Preset chips — only shown when idle */}
          <AnimatePresence>
            {!isActive && (
              <motion.div
                key="chips"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-wrap justify-end gap-1.5 mb-3"
              >
                {presets.map((p, i) => (
                  <motion.button
                    key={p.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    onClick={() => handlePreset(p)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-zinc-400 text-xs hover:text-white transition-all duration-200 cursor-pointer ${p.color}`}
                  >
                    <span>{p.emoji}</span>
                    <span>{p.label}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Text input */}
          <form onSubmit={handleTextSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isActive}
              placeholder={isActive ? "" : "Or ask anything..."}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isActive || !inputValue.trim()}
              className="px-4 py-2.5 rounded-xl bg-white border border-white/20 text-zinc-900 text-sm hover:bg-white/90 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 8H14M14 8L9 3M14 8L9 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Email capture card */}
      <AnimatePresence>
        {phase === "capture" && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="font-display text-xs tracking-widest text-zinc-600 uppercase mb-3">
                    This is just a preview
                  </p>
                  <h3 className="text-white font-semibold text-lg leading-snug mb-1.5">
                    I'm already learning your style.
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-5">
                    Sign in to save this and keep going — the more we work together, the better I get at helping you create.
                  </p>
                  <form onSubmit={handleEmailSubmit} className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#F9F7F1] text-[#0a080d] text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
                    >
                      Continue →
                    </button>
                  </form>
                  <p className="text-zinc-600 text-xs mt-3">Free to start. No credit card required.</p>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-2"
                >
                  <p className="text-emerald-400 font-semibold mb-1.5">You're in ✓</p>
                  <p className="text-zinc-400 text-sm">We'll be in touch soon.</p>
                  <button
                    onClick={reset}
                    className="mt-3 text-zinc-500 text-xs underline underline-offset-2 hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    ← Try another question
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset link */}
      <AnimatePresence>
        {phase === "capture" && !submitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-4"
          >
            <button
              onClick={reset}
              className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors cursor-pointer"
            >
              ← Try a different question
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
