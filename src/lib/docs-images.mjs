// Shared, env-free helpers for Notion docs images.
//
// Imported by BOTH src/lib/notion.ts (render time) and
// scripts/prefetch-docs.mjs (build time, before astro build).
//
// The image filenames MUST be identical between the two callers: the
// prefetch step downloads images into public/images/docs/ before the build,
// and the render pass relies on fs.existsSync() here to skip re-downloading
// and reuse the same URL. Keep all filename logic in this file only.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Matches a Notion image URL's path (ignoring the signed query string, which
// changes on every fetch) so the same image resolves to a stable filename.
export function docImagePath(url, slug) {
  const hash = crypto.createHash('md5').update(url.split('?')[0]).digest('hex').slice(0, 10);
  const ext = url.match(/\.(png|jpg|jpeg|gif|webp|svg)/i)?.[1] || 'png';
  return `/images/docs/${slug}-${hash}.${ext}`;
}

// Downloads url into public/images/docs/ (no-op if it already exists) and
// returns the public path to reference in markup.
export async function downloadImage(url, slug) {
  const localPath = docImagePath(url, slug);
  const dir = path.join(process.cwd(), 'public', 'images', 'docs');
  const filepath = path.join(dir, path.basename(localPath));

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filepath)) {
    const res = await fetch(url);
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(filepath, buffer);
    }
  }

  return localPath;
}
