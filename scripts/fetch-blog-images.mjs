#!/usr/bin/env node
/**
 * Fetches blog images from Unsplash based on placeholder references and cover images.
 * Usage: UNSPLASH_ACCESS_KEY=your_key node scripts/fetch-blog-images.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');
const OUTPUT_DIR = path.join(ROOT, 'public/images/articles');
const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!ACCESS_KEY) {
  console.error('Missing UNSPLASH_ACCESS_KEY env var');
  process.exit(1);
}

// Extract search query from filename like "cooking-hero-shot.jpg" → "cooking hero shot"
function filenameToQuery(filename) {
  return filename
    .replace(/\.(jpg|png|webp)$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/cover$/, '')
    .trim();
}

// Search Unsplash and return the first result's download URL
async function searchUnsplash(query) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Unsplash API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (!data.results?.length) return null;

  // Use regular quality (1080px wide) — good enough for blog
  return data.results[0].urls.regular;
}

// Download image to disk
async function downloadImage(imageUrl, destPath) {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
}

// Parse all blog posts and extract image references
function extractImageRefs() {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
  const images = new Map(); // filename → search query

  for (const file of files) {
    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');

    // Cover images from frontmatter: coverImage: "/images/articles/foo.jpg"
    const coverMatch = content.match(/coverImage:\s*"\/images\/articles\/(.+?)"/);
    if (coverMatch) {
      images.set(coverMatch[1], filenameToQuery(coverMatch[1]));
    }

    // Inline placeholders: ![alt](placeholder:filename.jpg)
    const placeholderRe = /!\[([^\]]*)\]\(placeholder:([^)]+)\)/g;
    let match;
    while ((match = placeholderRe.exec(content)) !== null) {
      const alt = match[1];
      const filename = match[2];
      // Prefer alt text as query (more descriptive), fall back to filename
      images.set(filename, alt || filenameToQuery(filename));
    }
  }

  return images;
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const images = extractImageRefs();
  console.log(`Found ${images.size} images to fetch\n`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const [filename, query] of images) {
    const destPath = path.join(OUTPUT_DIR, filename);

    // Skip if already downloaded
    if (fs.existsSync(destPath)) {
      console.log(`  SKIP  ${filename} (exists)`);
      skipped++;
      continue;
    }

    try {
      // Truncate query to first ~8 words for better search results
      const shortQuery = query.split(/\s+/).slice(0, 8).join(' ');
      console.log(`  FETCH ${filename}`);
      console.log(`        query: "${shortQuery}"`);

      const imageUrl = await searchUnsplash(shortQuery);
      if (!imageUrl) {
        console.log(`        ⚠ No results, trying filename...`);
        const fallbackUrl = await searchUnsplash(filenameToQuery(filename));
        if (!fallbackUrl) {
          console.log(`        ✗ No results at all, skipping`);
          failed++;
          continue;
        }
        await downloadImage(fallbackUrl, destPath);
      } else {
        await downloadImage(imageUrl, destPath);
      }

      downloaded++;
      console.log(`        ✓ saved`);

      // Small delay to respect rate limits (50/hr = ~1.2s between requests)
      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      console.log(`        ✗ ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone: ${downloaded} downloaded, ${skipped} skipped, ${failed} failed`);
}

main();
