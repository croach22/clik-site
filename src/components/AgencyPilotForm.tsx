import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackMetaEvent } from '../lib/analytics';

// Shared Formspark destination with AgencyQualificationForm — both forms feed the
// same agency-leads inbox so we don't manage two pipelines.
// TODO: Replace with the real Formspark ID and update AgencyQualificationForm.tsx
// to match.
const FORMSPARK_ID = 's8uWZetgM';

const OUTPUT_OPTIONS = ['Under 20', '20 to 50', '50 to 100', '100 to 500', '500+'];

type FormState = {
  name: string;
  email: string;
  website: string;
  monthlyOutput: string;
};

const INITIAL: FormState = {
  name: '',
  email: '',
  website: '',
  monthlyOutput: '',
};

type Variant = 'default' | 'accent';

export default function AgencyPilotForm({ variant = 'default' }: { variant?: Variant } = {}) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) return setError('Please enter your name');
    if (!form.email.trim() || !form.email.includes('@')) return setError('Please enter a valid work email');
    if (!form.website.trim()) return setError('Please enter your website');
    if (!form.monthlyOutput) return setError('Please select your monthly video output');

    setError('');
    setSubmitting(true);

    try {
      await fetch(`https://submit-form.com/${FORMSPARK_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...form,
          source: variant === 'accent' ? 'agency-demo-bottom' : 'agency-demo-hero',
        }),
      });
    } catch {
      // Continue gracefully — Formspark also emails on failure
    }

    // Meta standard Lead + custom AgencyLead (both via Pixel + Stape CAPI, dedup'd by event_id).
    // Email gets SHA-256 hashed before going to the server for Meta match-rate improvement.
    trackMetaEvent('Lead', { content_name: 'agency-demo', audience: 'agency' }, { email: form.email });
    trackMetaEvent(
      'AgencyLead',
      {
        audience: 'agency',
        surface: variant === 'accent' ? 'agency-page' : 'agency-page',
        content_name: 'agency-demo',
        monthly_output: form.monthlyOutput,
      },
      { email: form.email },
    );

    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('agency_demo_requested', {
        monthly_output: form.monthlyOutput,
        placement: variant === 'accent' ? 'bottom' : 'hero',
      });
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  const isAccent = variant === 'accent';

  // Style tokens — branch by variant
  const s = isAccent
    ? {
        card: 'relative rounded-[12px] on-midnight overflow-hidden border border-clik-cream/10 bg-[#13204A] p-8 md:p-12 lg:p-16',
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
        card: 'rounded-2xl border border-clik-cream/10 bg-clik-cream/[0.03] p-6 md:p-7',
        headlineColor: 'text-clik-cream',
        headlineSize: '24px',
        subColor: 'text-clik-cream/70',
        label: 'block font-mono text-[11px] uppercase tracking-[0.14em] text-clik-cream/70 mb-2',
        input:
          'w-full rounded-xl border border-clik-cream/15 bg-clik-cream/[0.04] px-4 py-3 text-base text-clik-cream placeholder:text-clik-cream/30 outline-none transition-colors focus:border-clik-royce/70',
        selectArrow: '%23F9F7F180',
        button: 'clik-btn clik-btn-primary w-full justify-center disabled:opacity-60',
        errorColor: 'text-clik-salmon',
        successCard: 'mt-6 rounded-xl border border-clik-royce/25 bg-clik-royce/10 p-6',
        successText: 'text-clik-cream',
        successAttr: 'text-clik-cream/55',
      };

  const selectBg = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${s.selectArrow}' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
  };

  const copyBlock = (
    <>
      {isAccent && (
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-clik-royce mb-5">
          REQUEST A DEMO
        </p>
      )}
      <h3 className={`font-display font-medium ${s.headlineColor}`} style={{ fontSize: s.headlineSize, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
        Too busy for a demo? We'll run a batch for you<span className="clik-period">.</span>
      </h3>
      <p className={`mt-4 max-w-[44ch] font-ui ${s.subColor}`} style={{ fontSize: isAccent ? '18px' : '15px', lineHeight: 1.55 }}>
        Send us a brief and a Google Drive link. We'll run a real Clik workflow and share the results. No call required.
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
            <label className={s.label}>Work email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="you@agency.com"
              className={s.input}
            />
          </div>

          <div>
            <label className={s.label}>Website</label>
            <input
              type="text"
              value={form.website}
              onChange={(e) => update('website', e.target.value)}
              placeholder="https://youragency.com"
              className={s.input}
            />
          </div>

          <div>
            <label className={s.label}>Monthly video output</label>
            <select
              value={form.monthlyOutput}
              onChange={(e) => update('monthlyOutput', e.target.value)}
              className={`${s.input} appearance-none`}
              style={selectBg}
            >
              <option value="" disabled>Select one</option>
              {OUTPUT_OPTIONS.map((opt) => (
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
            {submitting ? 'Submitting…' : <>Skip the demo <span aria-hidden="true">→</span></>}
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
            Thanks. Our team will reach out within 24 hours to set up a demo on your footage.
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
