import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const presets = [
  { id: "planning", emoji: "🧠", label: "How does the planning assistant work?", color: "border-violet-500/20 bg-violet-500/[0.06] hover:border-violet-400/30 hover:bg-violet-500/10" },
  { id: "cooking", emoji: "🍳", label: "Can you edit a cooking video?", color: "border-orange-500/20 bg-orange-500/[0.06] hover:border-orange-400/30 hover:bg-orange-500/10" },
  { id: "formats", emoji: "🎬", label: "What formats do you support?", color: "border-blue-500/20 bg-blue-500/[0.06] hover:border-blue-400/30 hover:bg-blue-500/10" },
  { id: "loved", emoji: "💬", label: "What do users love most about Clik?", color: "border-emerald-500/20 bg-emerald-500/[0.06] hover:border-emerald-400/30 hover:bg-emerald-500/10" },
  { id: "creativity", emoji: "🎨", label: "AI? Doesn't that kill creativity?", color: "border-rose-500/20 bg-rose-500/[0.06] hover:border-rose-400/30 hover:bg-rose-500/10" },
];

type Message = { role: "user" | "assistant"; content: string };
type Phase = "idle" | "thinking" | "responding" | "done";

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
              <span className="text-zinc-600 mr-2">–</span>{formatBold(line.slice(2))}
            </p>
          );
        return <p key={i} className="text-zinc-300">{formatBold(line)}</p>;
      })}
      {partialLine !== null && (
        <span className="text-zinc-300">
          {formatBold(partialLine)}
          <span className="inline-block w-0.5 h-3.5 bg-zinc-400 ml-0.5 align-middle animate-pulse" />
        </span>
      )}
    </div>
  );
}

function formatBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function ConceptChat() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [streamedText, setStreamedText] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [usedPresets, setUsedPresets] = useState<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamedText, phase, messages, usedPresets]);

  const sendMessage = useCallback(async (message: string) => {
    if (phase === "thinking" || phase === "responding" || !message.trim()) return;

    const userMsg: Message = { role: "user", content: message.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue("");
    setPhase("thinking");
    setStreamedText("");

    // Abort any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error("API error");
      }

      setPhase("responding");
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              fullText += parsed.text;
              setStreamedText(fullText);
            }
          } catch {
            // skip malformed chunks
          }
        }
      }

      const assistantMsg: Message = { role: "assistant", content: fullText };
      setMessages((prev) => [...prev, assistantMsg]);
      setExchangeCount((c) => c + 1);
      setPhase("done");
    } catch (err: any) {
      if (err.name === "AbortError") return;
      // Fallback: show error in chat
      setStreamedText("Sorry, I couldn't connect right now. Try again in a moment.");
      setPhase("done");
    }
  }, [phase, messages]);

  const handlePreset = (preset: (typeof presets)[0]) => {
    setUsedPresets((prev) => new Set(prev).add(preset.id));
    sendMessage(preset.label);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  const reset = () => {
    abortRef.current?.abort();
    setPhase("idle");
    setMessages([]);
    setStreamedText("");
    setEmail("");
    setSubmitted(false);
    setExchangeCount(0);
    setUsedPresets(new Set());
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const isInputDisabled = phase === "thinking" || phase === "responding";
  const remainingPresets = presets.filter((p) => !usedPresets.has(p.id));
  const showPresets = (phase === "idle" || phase === "done") && remainingPresets.length > 0;
  const showCapture = exchangeCount >= 2 && phase === "done";
  const isActive = messages.length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Chat window — expands when user engages */}
      <div className={`rounded-2xl border border-white/15 bg-white/[0.025] overflow-hidden flex flex-col transition-all duration-500 ${isActive ? 'max-h-[85vh]' : ''}`}>

        {/* Messages */}
        <div ref={scrollRef} className={`px-5 py-6 space-y-3 overflow-y-auto flex-1 ${isActive ? 'min-h-[200px]' : 'min-h-[180px] max-h-[400px]'}`}>

          {/* Clik greeting bubble */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex justify-start"
          >
            <div className="bg-zinc-800/70 text-zinc-200 text-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
              Ask me anything about Clik — what it does, how it works, or what we're building next.
            </div>
          </motion.div>

          {/* Conversation history */}
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={
                  msg.role === "user"
                    ? "bg-white/10 text-zinc-100 text-sm rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]"
                    : "bg-zinc-800/70 text-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]"
                }
              >
                {msg.role === "user" ? (
                  msg.content
                ) : (
                  <ResponseText text={msg.content} streaming={false} />
                )}
              </div>
            </motion.div>
          ))}

          <AnimatePresence>
            {/* Thinking dots */}
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

            {/* Streaming response (current, not yet in messages array) */}
            {phase === "responding" && streamedText && (
              <motion.div
                key="streaming"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-zinc-800/70 text-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                  <ResponseText text={streamedText} streaming={true} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Preset chips — inside chat area, after messages */}
          <AnimatePresence>
            {showPresets && (
              <motion.div
                key="chips"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-wrap justify-end gap-1.5 pt-2"
              >
                {remainingPresets.map((p, i) => (
                  <motion.button
                    key={p.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.06 }}
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
        </div>

        {/* Input area */}
        <div className="px-4 py-4 border-t border-white/5">
          <form onSubmit={handleTextSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isInputDisabled}
              placeholder={isInputDisabled ? "" : messages.length > 0 ? "Ask a follow-up..." : "Ask anything about Clik..."}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isInputDisabled || !inputValue.trim()}
              className="px-4 py-2.5 rounded-xl bg-white border border-white/20 text-zinc-900 text-sm hover:bg-white/90 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 8H14M14 8L9 3M14 8L9 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Email capture card — shown after 2+ exchanges */}
      <AnimatePresence>
        {showCapture && (
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
                  <p className="text-emerald-400 font-semibold mb-1.5">You're in</p>
                  <p className="text-zinc-400 text-sm">We'll be in touch soon.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset link — shown when conversation is active */}
      <AnimatePresence>
        {phase === "done" && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-4"
          >
            <button
              onClick={reset}
              className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors cursor-pointer"
            >
              Start over
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
