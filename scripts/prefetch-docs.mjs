#!/usr/bin/env node
/**
 * Pre-downloads all Notion docs images into public/images/docs/ BEFORE
 * `astro build` runs.
 *
 * Why this exists: Astro copies the public/ directory into the build output at
 * the START of the build, before any page renders. The docs pages download
 * their images during render (src/lib/notion.ts), so on a fresh checkout —
 * public/images/docs/ is gitignored, so it starts empty on Vercel — the images
 * land in public/ too late and never get deployed (they 404 in production).
 *
 * Running this first means the files exist in public/images/docs/ when Astro
 * copies it, so they ship. The render pass then sees them already on disk
 * (downloadImage() short-circuits) and just rewrites the markdown URLs.
 *
 * Filename logic is shared with notion.ts via src/lib/docs-images.mjs so the
 * names match exactly.
 *
 * Run automatically by `npm run build`; can also be run standalone:
 *   node scripts/prefetch-docs.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pkg from '@notionhq/client';
import mdPkg from 'notion-to-md';
import { slugify, downloadImage } from '../src/lib/docs-images.mjs';

const { Client } = pkg;
const { NotionToMarkdown } = mdPkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Load .env into process.env for local runs (Vercel injects env vars directly).
function loadDotEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadDotEnv();

const NOTION_TOKEN = process.env.NOTION_TOKEN;
if (!NOTION_TOKEN) {
  // Don't hard-fail the build — let the render pass surface it. Just warn.
  console.warn('[prefetch-docs] No NOTION_TOKEN set; skipping docs image prefetch.');
  process.exit(0);
}

const notion = new Client({ auth: NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

// Mirrors getAllDocs() in src/lib/notion.ts (title is what slugify() consumes).
async function getAllDocs() {
  const search = await notion.search({ page_size: 50 });
  return search.results
    .filter((r) => r.object === 'page')
    .map((p) => {
      const props = p.properties;
      const titleProp = Object.values(props).find((v) => v.type === 'title');
      const title = titleProp?.title?.[0]?.plain_text || 'Untitled';
      return { id: p.id, slug: slugify(title), title };
    });
}

const IMG_REGEX = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;

async function main() {
  const docs = await getAllDocs();
  console.log(`[prefetch-docs] ${docs.length} docs found`);

  let downloaded = 0;
  let failed = 0;

  for (const doc of docs) {
    const mdBlocks = await n2m.pageToMarkdown(doc.id);
    const md = n2m.toMarkdownString(mdBlocks).parent || '';
    const urls = [...md.matchAll(IMG_REGEX)].map((m) => m[2]);

    for (const url of urls) {
      try {
        await downloadImage(url, doc.slug);
        downloaded++;
      } catch (err) {
        console.warn(`[prefetch-docs] failed ${doc.slug}: ${err.message}`);
        failed++;
      }
    }
  }

  console.log(`[prefetch-docs] done: ${downloaded} image refs processed, ${failed} failed`);
}

main().catch((err) => {
  console.error('[prefetch-docs] error:', err);
  // Soft-fail: a docs fetch hiccup shouldn't block the whole site deploy.
  process.exit(0);
});
