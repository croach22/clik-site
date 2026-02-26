import { useRef, useEffect } from 'react';
import ConceptChat from './ConceptChat';

export default function HeroAnimated() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  const target = useRef({ x: 50, y: 50 });
  const current = useRef({ x: 50, y: 50 });
  const raf = useRef<number>();

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  useEffect(() => {
    // Global mouse tracking — works for nav CTA, hero CTA, anywhere on the page
    const handleMouseMove = (e: MouseEvent) => {
      const rect = headingRef.current?.getBoundingClientRect();
      if (!rect) return;
      target.current = {
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      };
    };

    document.addEventListener('mousemove', handleMouseMove);

    const tick = () => {
      current.current.x = lerp(current.current.x, target.current.x, 0.07);
      current.current.y = lerp(current.current.y, target.current.y, 0.07);

      if (headingRef.current) {
        const { x, y } = current.current;
        headingRef.current.style.backgroundImage = `radial-gradient(circle 200px at ${x}% ${y}%, #F9838E 0%, #DC1DD9 40%, #5481E8 70%, #F9F7F1 90%)`;
      }

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-24 text-center">
      {/* Subtle static bg glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/8 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        {/* Headline — gradient spotlight clips to text, tracks cursor globally */}
        <h1
          ref={headingRef}
          className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl"
          style={{
            backgroundImage:
              'radial-gradient(circle 200px at 50% 50%, #F9838E 0%, #DC1DD9 40%, #5481E8 70%, #F9F7F1 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          The AI Creative
          <br />
          Assistant for
          <br />
          Video Creators
        </h1>

        {/* Subhead */}
        <p className="mx-auto mb-10 max-w-xl text-lg text-zinc-400 md:text-xl">
          Plan content, shape your story, and{' '}
          <span
            style={{
              backgroundImage: 'linear-gradient(135deg, #F9838E, #DC1DD9, #5481E8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            className="font-semibold"
          >
            edit real footage 10x faster
          </span>
          {' '}— without losing creative control.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="https://app.clik.vision/sign-up"
            className="group relative overflow-hidden rounded-full bg-white px-8 py-3.5 text-base font-semibold text-zinc-950 transition-all hover:scale-105 hover:text-white"
          >
            <span className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'linear-gradient(135deg, #F9838E, #DC1DD9, #5481E8)' }} />
            <span className="relative">Start for Free</span>
          </a>
          <a
            href="#how-it-works"
            className="rounded-full border border-white/10 px-8 py-3.5 text-base font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
          >
            See how it works
          </a>
        </div>
      </div>

      {/* Concept Chat */}
      <div className="relative mx-auto mt-16 w-full max-w-2xl">
        <ConceptChat />
      </div>

      {/* Product screenshot */}
      <div className="relative mx-auto mt-16 w-full max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/50">
          <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-zinc-700" />
            <div className="h-3 w-3 rounded-full bg-zinc-700" />
            <div className="h-3 w-3 rounded-full bg-zinc-700" />
          </div>
          <img
            src="/images/product-screenshot.png"
            alt="Clik video editor interface showing media search, timeline, and AI assistant"
            className="w-full"
          />
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a080d] to-transparent" />
      </div>
    </section>
  );
}
