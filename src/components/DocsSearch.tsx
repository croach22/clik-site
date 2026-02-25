import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Doc {
  id: string;
  title: string;
  slug: string;
  group: string;
}

export default function DocsSearch({ docs }: { docs: Doc[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results =
    query.trim().length > 0
      ? docs
          .filter(
            d =>
              d.title.toLowerCase().includes(query.toLowerCase()) ||
              d.group.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 9)
      : docs.slice(0, 9);

  useEffect(() => { setActiveIndex(0); }, [query]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      const target = results[activeIndex];
      if (target) {
        window.location.href = `/docs/${target.slug}`;
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const modal = (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '14vh', padding: '14vh 16px 0', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div style={{ width: '100%', maxWidth: 560, borderRadius: 16, overflow: 'hidden', background: '#fff', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <svg style={{ width: 20, height: 20, flexShrink: 0, color: '#9ca3af' }} viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search documentation..."
            style={{ flex: 1, fontSize: 15, color: '#111', background: 'transparent', border: 'none', outline: 'none' }}
          />
          {query ? (
            <button onMouseDown={e => { e.preventDefault(); setQuery(''); inputRef.current?.focus(); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: '#e5e7eb', border: 'none', cursor: 'pointer', color: '#6b7280', flexShrink: 0 }}>
              <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          ) : (
            <kbd style={{ display: 'inline-flex', alignItems: 'center', fontSize: 11, color: '#9ca3af', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 5, padding: '2px 6px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Esc</kbd>
          )}
        </div>
        <div style={{ maxHeight: 340, overflowY: 'auto', padding: '8px 0' }}>
          {results.length > 0 ? results.map((doc, i) => (
            <a key={doc.id} href={`/docs/${doc.slug}`} onMouseDown={() => setOpen(false)} onMouseEnter={() => setActiveIndex(i)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 20px', background: i === activeIndex ? '#f5f5f5' : 'transparent', textDecoration: 'none', transition: 'background 0.1s' }}>
              <svg style={{ marginTop: 2, flexShrink: 0, color: '#9ca3af' }} width="16" height="16" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
                <path d="M3.5 5h7M3.5 7.5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0 }}>{doc.title}</p>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>/{doc.slug}</p>
              </div>
            </a>
          )) : (
            <div style={{ padding: '24px 20px', textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>No results for "{query}"</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 16, padding: '10px 20px', borderTop: '1px solid #f0f0f0', fontSize: 11, color: '#9ca3af' }}>
          <span>↑↓ navigate</span><span>↵ open</span><span>esc close</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setOpen(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', marginBottom: 24 }}>
        <svg style={{ width: 14, height: 14, flexShrink: 0, color: '#71717a' }} viewBox="0 0 16 16" fill="none">
          <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span style={{ flex: 1, fontSize: 12, color: '#52525b' }}>Search...</span>
        <kbd style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, color: '#52525b', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '2px 5px', fontFamily: 'inherit' }}>⌘K</kbd>
      </button>
      {open && typeof document !== 'undefined' ? createPortal(modal, document.body) : null}
    </>
  );
}
