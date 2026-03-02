import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileEmailDrawer() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<'form' | 'confirmed' | 'founding'>('form');
  const [error, setError] = useState('');

  // Listen for clicks on sign-up links (mobile only)
  if (typeof window !== 'undefined') {
    window.__openEmailDrawer = () => setOpen(true);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    setError('');

    try {
      await fetch('https://submit-form.com/GLCzgE2Hc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, source: 'mobile-drawer' }),
      });
    } catch {
      // Continue gracefully even if submission fails
    }

    setPhase('confirmed');
    setTimeout(() => setPhase('founding'), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] overflow-hidden rounded-t-2xl"
          >
            {/* Animated background — transitions to gold */}
            <motion.div
              className="absolute inset-0"
              animate={{
                backgroundColor: phase === 'founding' ? '#D4A853' : '#0a080d',
                borderColor: phase === 'founding' ? '#D4A85340' : '#ffffff1a',
              }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              style={{ borderTop: '1px solid' }}
            />

            <div className="relative px-6 pb-16 pt-6">
              {/* Drag handle */}
              <motion.div
                className="mx-auto mb-10 h-1 w-10 rounded-full"
                animate={{
                  backgroundColor: phase === 'founding' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                }}
                transition={{ duration: 0.6 }}
              />

              <div className="min-h-[320px] flex items-center">
              <AnimatePresence mode="wait">
                {phase === 'form' && (
                  <motion.div
                    key="form"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mx-auto w-full max-w-sm text-center"
                  >
                    <h3 className="mb-2 text-2xl font-bold text-brand-cream">
                      Built for the desktop, where creators do their best work.
                    </h3>
                    <p className="mb-6 text-sm text-brand-cream/50">
                      We designed this alongside top creators who edit on their computer. We'll send you a link to start your free trial when you're back at yours.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@email.com"
                        autoFocus
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-base text-brand-cream placeholder-brand-cream/30 outline-none transition-colors focus:border-white/20"
                      />
                      {error && (
                        <p className="text-xs text-red-400">{error}</p>
                      )}
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-brand-cream py-3.5 text-base font-semibold text-zinc-950 transition-opacity hover:opacity-90"
                      >
                        Send me the link
                      </button>
                    </form>

                    <p className="mt-3 text-xs text-brand-cream/50">
                      (check spam for email)
                    </p>
                  </motion.div>
                )}

                {phase === 'confirmed' && (
                  <motion.div
                    key="confirmed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mx-auto w-full max-w-sm text-center"
                  >
                    <p className="text-lg font-semibold text-brand-cream">
                      You're in! Check your inbox.
                    </p>
                    <p className="mt-2 text-sm text-brand-cream/50">
                      We sent a link to try Clik on your desktop.
                    </p>
                  </motion.div>
                )}

                {phase === 'founding' && (
                  <motion.div
                    key="founding"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="mx-auto w-full max-w-sm text-center"
                  >
                    <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-black/40">
                      While you're here
                    </p>
                    <h3 className="mb-2 text-2xl font-bold text-zinc-950">
                      Founding Creator Program
                    </h3>
                    <p className="mb-6 text-sm text-zinc-950/60">
                      Free access to Clik + 30% lifetime commission on every creator you refer. Limited spots.
                    </p>
                    <a
                      href="/founding-creators"
                      className="inline-block w-full rounded-xl bg-zinc-950 py-3.5 text-base font-semibold text-brand-gold transition-opacity hover:opacity-90"
                    >
                      Learn More →
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Type declaration for the global function
declare global {
  interface Window {
    __openEmailDrawer?: () => void;
  }
}
