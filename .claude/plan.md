# Plan: Feature Animation Block — "Plan" (Creative Strategist)

## Goal
Build a self-playing, looping animation component that showcases the **AI creative strategist** feature. It sits between ValueSection and the Manifesto (new page order TBD), replacing the current ScrollDemo and HowItWorks sections.

## Page Order (proposed)
1. Hero
2. ValueSection (before/after)
3. **FeaturePlan** ← NEW (this component)
4. **FeatureEdit** ← NEW (next task)
5. ManifestoScroll (who is this for)
6. UseCasesGrid (formats)
7. SocialProof
8. CTA

ScrollDemo and HowItWorks get removed from the page.

## Component: `FeaturePlan.tsx`

### Layout
- Full-width section, dark background
- Left side: headline, short description, 2-3 capability pills/callouts
- Right side: stylized chat animation (auto-plays, loops)
- Responsive: stacks vertically on mobile (text on top, animation below)

### Left Side Content
- Subheading: "PLAN" (small, accent-colored)
- Headline: "Never start from scratch."
- Description: "Your AI creative strategist helps you brainstorm ideas, write scripts, and build shot lists — so when you hit record, you know exactly what to shoot."
- Capability callouts (small pills or icon+text): Script writing, Shot lists, Content ideas
- (Copy is placeholder — user will refine)

### Right Side: Chat Animation
A stylized chat interface that auto-plays through a scripted conversation on a loop.

**Sequence (timed, not scroll-driven):**

1. **(0s)** User message fades in: "I love cooking but honestly don't know where to start. How should I even go about recording a cooking video?"
2. **(2s)** AI typing indicator appears
3. **(3s)** AI response appears with structured content:
   - "Great question! Here's a simple approach:"
   - A shot list card appears inline:
     - "📋 Shot List"
     - "1. Ingredients laid out (overhead)"
     - "2. Prep work close-ups"
     - "3. Cooking action shots"
     - "4. Final plating (hero shot)"
   - Tip: "Focus on the visuals — we can add voiceover later."
4. **(7s)** User message: "What about for a talking head video? I tend to ramble..."
5. **(9s)** AI typing indicator
6. **(10s)** AI response:
   - "No worries, rambling is fine! Just hit record and talk."
   - Tip card: "💡 Pro tip: Don't worry about pauses or mistakes — Clik cuts those automatically."
7. **(14s)** Pause, then fade/reset and loop back to step 1

**Animation details:**
- Messages slide up + fade in (like a real chat)
- AI typing indicator: 3 pulsing dots
- Structured cards (shot list, tips) slide in with a slight spring
- Chat container has subtle border, dark bg, feels like the actual product chat
- Uses `useState` + `useEffect` with `setTimeout` chains or a step-based state machine
- Framer Motion `AnimatePresence` for enter/exit animations

### Styling
- Matches existing site: dark bg, cream text (#F9F7F1), accent colors
- Chat bubbles: user = right-aligned, subtle border; AI = left-aligned, gradient border similar to existing HeroAnimated chat
- Structured cards inside AI responses: darker bg, accent border, rounded

## Files to Create/Modify
1. **Create** `src/components/FeaturePlan.tsx` — the new component
2. **Modify** `src/pages/index.astro` — add FeaturePlan, reorder sections, remove ScrollDemo and HowItWorks

## Technical Approach
- Timer-based state machine (not scroll-driven)
- `useEffect` with interval/timeout to advance steps
- Framer Motion for all transitions (fade, slide, spring)
- `AnimatePresence` for message enter/exit
- Loop: after final step, fade out all messages, reset state, start over
- `useInView` to only play when visible (optional, nice-to-have)
