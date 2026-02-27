# Clik Site - Session Notes

## Tech stack
- Astro 4.15.0 + React 18.3.0 + Tailwind + Framer Motion
- Notion API integration (exists in deps)
- Port: 4321, dev server config name: `clik-site` in `.claude/launch.json`

## Design System
- Colors: coral #F9838E, magenta #DC1DD9, blue #5481E8, cream #F9F7F1, gold #D4A853
- Dark backgrounds, cream text (#F9F7F1)
- Chat bubbles: user = right-aligned subtle border; AI = left-aligned gradient border

## Session: Feb 26, 2026

### Components built/modified

**ManifestoScroll.tsx** (replaced Manifesto.astro)
- Scroll-driven card stack: Creators → Founders → Marketers → Everyone
- 22px PEEK offset, 1px accent borders all around, inline pill in headline
- Everyone panel: gold accent #D4A853, faded text also gold
- Body text: #ffffff80, faded text: #ffffff70

**UseCasesGrid.tsx** (replaced UseCasesSection.astro)
- 3+2 portrait card grid (9:14 aspect ratio) with video backgrounds
- Top: Cooking (coral), GRWM (magenta), Vlogs (blue)
- Bottom: Talking Head (gold), DIY (cream) — slides up on scroll
- Videos in `public/videos/use-cases/`: cooking.mp4, grwm.mp4, vlogs.mp4, talking-head.mp4, diy.mp4
- Emojis removed from cards. hover:z-50 so hovered card pops above others
- Header: "Every format has a structure. We learned yours."

### Current index.astro order
1. HeroAnimated
2. ManifestoScroll
3. ValueSection
4. UseCasesGrid
5. ScrollDemo
6. HowItWorks
7. SocialProof
8. CTASection

---

## Next Task: Two Feature Animation Blocks

### Overview
Replace ScrollDemo and HowItWorks with two auto-playing looping animation sections (NOT scroll-driven) that showcase the two core product capabilities.

### Proposed new page order
1. Hero
2. ValueSection (before/after)
3. **FeaturePlan** ← NEW
4. **FeatureEdit** ← NEW
5. ManifestoScroll (who is this for)
6. UseCasesGrid (formats)
7. SocialProof
8. CTA

### Block 1: FeaturePlan (Creative Strategist / Planning)
**Value**: Never start from scratch. Synthesize ideas into a plan.
**What it is**: Chat-based creative strategist (forward-looking, not fully built yet)
**Capabilities**: Brainstorm ideas, write scripts, build shot lists, make shooting approachable, gets to know you
**Animation**: Stylized auto-playing chat loop (~14s). User messages are relatable/vulnerable ("I love cooking but don't know where to start. How should I even go about recording a cooking video?"). AI responds with structured content (shot lists, tips like "focus on visuals, we'll handle voiceover"). Messages slide up + fade in, 3 pulsing dots typing indicator.
**Layout**: Left = headline + description + capability callouts. Right = animated chat. Stacks on mobile.
**Full spec**: See `.claude/plan.md`

### Block 2: FeatureEdit (Chat-Based Editing)
**Value**: Edit 10x faster. Raw footage to rough draft instantly.
**Capabilities**: Raw footage → rough draft (core), AI Search (find moments), viral caption templates (coming soon), conversational edits. NOT highlighting: music/sounds, storyboard (table stakes).
**Animation**: Stylized looping sequence of the edit flow. Upload → select format/hook → AI analyzes → draft appears. AI assistant narrates: "Analyzing your footage..." → "I see you cooked Bolognese" → "Curating a timeline..." → "Moving final plating to the front as your hook."
**Layout**: Similar to Plan block but with editor-style visuals.

### Technical approach (both blocks)
- Timer-based state machine: `useState` + `useEffect` with timeouts
- Framer Motion for transitions (AnimatePresence, fade, slide, spring)
- Auto-loop: fade out → reset → restart
- Optional: `useInView` to only play when visible
- Build one at a time (Plan first, then Edit)

### User preferences
- NO scroll-jacking — auto-playing video-like animations only
- Code-built stylized animations (not static images, not screen recordings)
- User wants to iterate together and make specific changes themselves
