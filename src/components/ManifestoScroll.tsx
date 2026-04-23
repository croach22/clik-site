const PANELS = [
  {
    label: 'Creators',
    headline: 'who want to direct,',
    faded: 'not edit.',
    body: 'You have the footage and you can describe the story you want to tell. Now you get to do that, without scrubbing timelines all day.',
    accent: '#DC1DD9',
    link: null as { href: string; text: string } | null,
  },
  {
    label: 'Video Pros',
    headline: 'who want to scale output,',
    faded: 'not headcount.',
    body: 'Feed the agent a shoot day and a brief. It returns long-form rough cuts and curated shorts. Your editors finish the work, they don\u2019t start from scratch.',
    accent: '#5481E8',
    link: { href: '/use-cases/agencies', text: 'See how agencies run Clik' },
  },
];

export default function ManifestoScroll() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        {/* Section headline */}
        <h2
          className="mb-14 text-center text-3xl font-bold md:text-5xl"
          style={{ color: '#F9F7F1' }}
        >
          Built for creators and video pros.
        </h2>

        {/* Two-column grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {PANELS.map((panel) => (
            <div
              key={panel.label}
              className="rounded-2xl px-8 pb-8 pt-7"
              style={{
                border: `1px solid ${panel.accent}25`,
                background: '#141417',
              }}
            >
              <h2
                className="mb-5 text-2xl font-bold leading-snug md:text-3xl"
                style={{ color: '#F9F7F1' }}
              >
                For{' '}
                <span
                  className="relative -top-[2px] mr-1 inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 align-middle text-[0.5em] font-semibold"
                  style={{
                    borderColor: panel.accent + '35',
                    background: panel.accent + '10',
                    color: panel.accent,
                  }}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{
                      background: panel.accent,
                      boxShadow: `0 0 6px ${panel.accent}60`,
                    }}
                  />
                  {panel.label}
                </span>{' '}
                {panel.headline}{' '}
                <span style={{ color: '#ffffff70' }}>
                  {panel.faded}
                </span>
              </h2>

              <p
                className="text-base leading-relaxed"
                style={{ color: '#ffffff80' }}
              >
                {panel.body}
              </p>

              {panel.link && (
                <a
                  href={panel.link.href}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
                  style={{ color: panel.accent }}
                >
                  {panel.link.text}
                  <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
