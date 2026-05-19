import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Formspark destination for creator trial-run requests.
// TODO: Replace with real Formspark ID.
const FORMSPARK_ID = 'CREATOR_PILOT_TODO';

const CADENCE_OPTIONS = ['Every day', '3x week', 'Weekly', 'Monthly'];

type FormState = {
  name: string;
  handle: string;
  niche: string;
  cadence: string;
};

const INITIAL: FormState = {
  name: '',
  handle: '',
  niche: '',
  cadence: '',
};

type Variant = 'default' | 'accent';

export default function CreatorPilotForm({ variant = 'default' }: { variant?: Variant } = {}) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) return setError('Please enter your name');
    if (!form.handle.trim()) return setError('Please enter your handle');
    if (!form.niche.trim()) return setError('Please tell us your niche');
    if (!form.cadence) return setError('Please select your upload cadence');

    setError('');
    setSubmitting(true);

    try {
      await fetch(`https://submit-form.com/${FORMSPARK_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...form,
          source: variant === 'accent' ? 'creator-pilot-bottom' : 'creator-pilot-hero',
        }),
      });
    } catch {
      // Continue gracefully — Formspark also emails on failure
    }

    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead', { content_name: 'creator-pilot' });
    }
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('creator_pilot_requested', {
        cadence: form.cadence,
        placement: variant === 'accent' ? 'bottom' : 'hero',
      });
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  const isAccent = variant === 'accent';

  const s = isAccent
    ? {
        card: 'relative rounded-[12px] bg-clik-midnight on-midnight overflow-hidden p-8 md:p-12 lg:p-16',
        headlineColor: 'text-clik-cream',
        headlineSize: 'clamp(36px, 4.5vw, 56px)',
        subColor: 'text-clik-cream/70',
        label: 'block font-mono text-[11px] uppercase tracking-[0.14em] text-clik-cream/70 mb-2',
        input:
          'w-full rounded-xl border border-clik-cream/15 bg-clik-cream/[0.04] px-4 py-3 text-base text-clik-cream placeholder:text-clik-cream/30 outline-none transition-colors focus:border-clik-royce/70',
        selectArrow: '%23F9F7F180',
        button: 'clik-btn clik-btn-light w-full justify-center disabled:opacity-60',
        errorColor: 'text-clik-salmon',
        successCard: 'mt-6 rounded-xl border border-clik-cream/15 bg-clik-cream/[0.05] p-6',
        successText: 'text-clik-cream',
        successAttr: 'text-clik-cream/55',
      }
    : {
        card: 'rounded-2xl border border-clik-midnight/12 bg-clik-bone/50 p-6 md:p-7',
        headlineColor: 'text-clik-midnight',
        headlineSize: '24px',
        subColor: 'text-clik-midnight/70',
        label: 'block font-mono text-[11px] uppercase tracking-[0.14em] text-clik-midnight/70 mb-2',
        input:
          'w-full rounded-xl border border-clik-midnight/15 bg-clik-cream px-4 py-3 text-base text-clik-midnight placeholder:text-clik-midnight/35 outline-none transition-colors focus:border-clik-royce/60',
        selectArrow: '%230E183480',
        button: 'clik-btn clik-btn-primary w-full justify-center disabled:opacity-60',
        errorColor: 'text-clik-tally',
        successCard: 'mt-6 rounded-xl border border-clik-royce/25 bg-clik-royce/5 p-6',
        successText: 'text-clik-midnight',
        successAttr: 'text-clik-midnight/55',
      };

  const selectBg = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${s.selectArrow}' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
  };

  const copyBlock = (
    <>
      <h3 className={`font-display font-medium ${s.headlineColor}`} style={{ fontSize: s.headlineSize, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
        Want to see Clik on your footage<span className="clik-period">?</span>
      </h3>
      <p className={`mt-4 max-w-[44ch] font-ui ${s.subColor}`} style={{ fontSize: isAccent ? '18px' : '15px', lineHeight: 1.55 }}>
        Send us a Drive link with a recent shoot. We'll run a real Clik workflow and send back the rough cuts. No call required.
      </p>
    </>
  );

  const formBlock = (
    <AnimatePresence mode="wait">
      {!submitted ? (
        <motion.form
          key="form"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onSubmit={handleSubmit}
          className="space-y-4 relative"
          noValidate
        >
          <div>
            <label className={s.label}>Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Your name"
              className={s.input}
            />
          </div>

          <div>
            <label className={s.label}>Instagram handle (or TikTok / YouTube)</label>
            <input
              type="text"
              value={form.handle}
              onChange={(e) => update('handle', e.target.value)}
              placeholder="@yourhandle"
              className={s.input}
            />
          </div>

          <div>
            <label className={s.label}>Content niche</label>
            <input
              type="text"
              value={form.niche}
              onChange={(e) => update('niche', e.target.value)}
              placeholder="e.g. cooking, fitness, finance"
              className={s.input}
            />
          </div>

          <div>
            <label className={s.label}>Upload cadence</label>
            <select
              value={form.cadence}
              onChange={(e) => update('cadence', e.target.value)}
              className={`${s.input} appearance-none`}
              style={selectBg}
            >
              <option value="" disabled>Select one</option>
              {CADENCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {error && <p className={`text-sm ${s.errorColor}`}>{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className={s.button}
          >
            {submitting ? 'Submitting…' : <>Send my footage <span aria-hidden="true">→</span></>}
          </button>
        </motion.form>
      ) : (
        <motion.div
          key="success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={`${s.successCard} relative`}
        >
          <p className={`font-ui ${s.successText}`} style={{ fontSize: '16px', lineHeight: 1.55 }}>
            Thanks. Send your Drive link to <a href="mailto:conner@clik.photos" className="underline">conner@clik.photos</a> and we'll run a workflow and reply within 24 hours.
          </p>
          <p className={`mt-3 font-mono text-[11px] uppercase tracking-[0.14em] ${s.successAttr}`}>
            — Conner, founder
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={s.card}>
      {isAccent && (
        <>
          {/* Viewfinder L-brackets */}
          <span className="vf vf-tl"></span>
          <span className="vf vf-tr"></span>
          <span className="vf vf-bl"></span>
          <span className="vf vf-br"></span>
        </>
      )}

      {isAccent ? (
        <div className="grid gap-10 md:grid-cols-2 md:gap-16 items-start">
          <div>{copyBlock}</div>
          <div className="w-full md:max-w-[440px] md:ml-auto">{formBlock}</div>
        </div>
      ) : (
        <>
          {copyBlock}
          <div className="mt-6">{formBlock}</div>
        </>
      )}
    </div>
  );
}
