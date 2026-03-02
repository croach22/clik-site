import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CONTENT_TYPES = [
  'Cooking / Food',
  'Travel / Vlogs',
  'Fitness / Wellness',
  'Beauty / GRWM',
  'DIY / How-To',
  'Education',
  'Lifestyle',
  'Other',
];

// TODO: Replace with your Formspark form ID
const FORMSPARK_ID = 'dBXNH5NI2';

export default function FoundingCreatorForm() {
  const [form, setForm] = useState({
    email: '',
    instagram: '',
    contentType: '',
    followers: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    if (!form.instagram) {
      setError('Please enter your Instagram handle');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      await fetch(`https://submit-form.com/${FORMSPARK_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...form,
          source: 'founding-creator-application',
        }),
      });
    } catch {
      // Continue gracefully
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  const inputClass =
    'w-full rounded-xl border border-brand-gold/20 bg-brand-gold/[0.04] px-4 py-3.5 text-base text-brand-cream placeholder-brand-cream/30 outline-none transition-colors focus:border-brand-gold/40';
  const labelClass = 'block text-sm font-medium text-brand-cream/70 mb-1.5';

  return (
    <div className="mx-auto max-w-lg">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.form
            key="form"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className={labelClass}>Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="you@email.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Instagram handle *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-cream/30">@</span>
                <input
                  type="text"
                  value={form.instagram}
                  onChange={(e) => update('instagram', e.target.value.replace('@', ''))}
                  placeholder="yourhandle"
                  className={`${inputClass} pl-8`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>What kind of content do you create?</label>
              <select
                value={form.contentType}
                onChange={(e) => update('contentType', e.target.value)}
                className={`${inputClass} appearance-none`}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23F9F7F180' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
              >
                <option value="" disabled>Select one</option>
                {CONTENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Roughly how many followers?</label>
              <select
                value={form.followers}
                onChange={(e) => update('followers', e.target.value)}
                className={`${inputClass} appearance-none`}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23F9F7F180' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
              >
                <option value="" disabled>Select one</option>
                <option value="1K–10K">1K – 10K</option>
                <option value="10K–50K">10K – 50K</option>
                <option value="50K–250K">50K – 250K</option>
                <option value="250K+">250K+</option>
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl py-3.5 text-base font-semibold text-zinc-950 transition-all hover:scale-[1.02] disabled:opacity-60"
              style={{ backgroundColor: '#D4A853' }}
            >
              {submitting ? 'Submitting...' : 'Apply Now'}
            </button>

            <p className="text-center text-xs text-brand-cream/30">
              Limited spots. We review every application personally.
            </p>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-brand-gold/20 bg-brand-gold/[0.04] p-10 text-center"
          >
            <p className="text-2xl font-bold text-brand-cream mb-2">
              You're on the list.
            </p>
            <p className="text-brand-cream/50">
              We'll review your application and reach out soon. Keep creating in the meantime.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
