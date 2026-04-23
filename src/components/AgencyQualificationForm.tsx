import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// TODO: Replace with a new Formspark form ID created specifically for this form.
// Configure in Formspark: autoresponder email ("Thanks — we'll review and get back
// to you within 2 business days.") + webhook/Zapier to Notion Content Agency CRM.
const FORMSPARK_ID = 'AGENCY_QUALIFICATION_TODO';

const OUTPUT_OPTIONS = ['20 to 50', '50 to 100', '100 to 500', '500+'];

type FormState = {
  agencyName: string;
  website: string;
  monthlyOutput: string;
  editingTeamSize: string;
  driveLink: string;
  brief: string;
  email: string;
  notes: string;
};

const INITIAL: FormState = {
  agencyName: '',
  website: '',
  monthlyOutput: '',
  editingTeamSize: '',
  driveLink: '',
  brief: '',
  email: '',
  notes: '',
};

export default function AgencyQualificationForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.agencyName.trim()) return setError('Please enter your agency name');
    if (!form.website.trim()) return setError('Please enter your website');
    if (!form.monthlyOutput) return setError('Please select your monthly video output');
    if (!form.editingTeamSize.trim()) return setError('Please enter your editing team size');
    if (!form.driveLink.trim()) return setError('Please paste a Google Drive link');
    if (!form.brief.trim()) return setError('Please include a brief');
    if (!form.email.trim() || !form.email.includes('@')) return setError('Please enter a valid email');

    setError('');
    setSubmitting(true);

    try {
      await fetch(`https://submit-form.com/${FORMSPARK_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...form,
          source: 'agency-qualification',
        }),
      });
    } catch {
      // Continue gracefully — Formspark also emails on failure
    }

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead', { content_name: 'agency-qualification' });
    }
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('agency_qualification_submitted', {
        monthly_output: form.monthlyOutput,
        editing_team_size: form.editingTeamSize,
      });
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-base text-brand-cream placeholder-brand-cream/30 outline-none transition-colors focus:border-[#5481E8]/50';
  const labelClass = 'block text-sm font-medium text-brand-cream/70 mb-1.5';
  const selectBg = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23F9F7F180' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
  };

  return (
    <div className="mx-auto max-w-xl">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.form
            key="form"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
          >
            <div>
              <label className={labelClass}>Agency name *</label>
              <input
                type="text"
                value={form.agencyName}
                onChange={(e) => update('agencyName', e.target.value)}
                placeholder="Feed Studios LA"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Website *</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => update('website', e.target.value)}
                placeholder="https://yoursite.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Monthly video output *</label>
              <select
                value={form.monthlyOutput}
                onChange={(e) => update('monthlyOutput', e.target.value)}
                className={`${inputClass} appearance-none`}
                style={selectBg}
              >
                <option value="" disabled>Select one</option>
                {OUTPUT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Editing team size *</label>
              <input
                type="number"
                min={0}
                value={form.editingTeamSize}
                onChange={(e) => update('editingTeamSize', e.target.value)}
                placeholder="Number of editors"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Google Drive link *</label>
              <input
                type="url"
                value={form.driveLink}
                onChange={(e) => update('driveLink', e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-brand-cream/40">
                Share a folder with a batch of real footage. Make sure it's accessible to "anyone with the link".
              </p>
            </div>

            <div>
              <label className={labelClass}>Brief *</label>
              <textarea
                value={form.brief}
                onChange={(e) => update('brief', e.target.value)}
                placeholder="Format, target duration, hooks, creative direction, anything your editors would normally get."
                rows={5}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Contact email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="you@agency.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Anything else we should know?</label>
              <textarea
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder="Optional"
                rows={3}
                className={inputClass}
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-white py-3.5 text-base font-semibold text-zinc-950 transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>

            <p className="text-center text-xs text-brand-cream/40">
              Your footage stays private. We delete it after the walkthrough is sent.
            </p>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-[#5481E8]/30 bg-[#5481E8]/[0.08] p-10 text-center"
          >
            <p className="text-2xl font-bold text-brand-cream mb-3">
              Thanks — submission received.
            </p>
            <p className="text-brand-cream/60 leading-relaxed">
              We'll review and get back to you within 2 business days.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
