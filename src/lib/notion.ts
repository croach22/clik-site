import pkg from '@notionhq/client';
import mdPkg from 'notion-to-md';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const { Client } = pkg;
const { NotionToMarkdown } = mdPkg;

const notion = new Client({ auth: import.meta.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface DocPage {
  id: string;
  title: string;
  slug: string;
  group: string;
  order: number;
  featured: boolean;
}

export async function getAllDocs(): Promise<DocPage[]> {
  const search = await notion.search({ page_size: 50 });
  const pages = search.results.filter((r: any) => r.object === 'page');

  return pages
    .map((p: any) => {
      const props = p.properties;
      const titleProp = Object.values(props).find((v: any) => v.type === 'title') as any;
      const title = titleProp?.title?.[0]?.plain_text || 'Untitled';
      const group = props['Doc Group']?.select?.name || 'General';
      const order = props['Order']?.number ?? 99;
      const featured = props['Featured Toggle']?.checkbox || false;

      return {
        id: p.id,
        title,
        slug: slugify(title),
        group,
        order,
        featured,
      };
    })
    .sort((a, b) => a.order - b.order);
}

async function downloadImage(url: string, slug: string): Promise<string> {
  const hash = crypto.createHash('md5').update(url.split('?')[0]).digest('hex').slice(0, 10);
  const ext = url.match(/\.(png|jpg|jpeg|gif|webp|svg)/i)?.[1] || 'png';
  const filename = `${slug}-${hash}.${ext}`;
  const dir = path.join(process.cwd(), 'public', 'images', 'docs');
  const filepath = path.join(dir, filename);

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filepath)) {
    const res = await fetch(url);
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(filepath, buffer);
    }
  }

  return `/images/docs/${filename}`;
}

export async function getDocContent(pageId: string, slug: string = 'doc'): Promise<string> {
  const mdBlocks = await n2m.pageToMarkdown(pageId);
  let md = n2m.toMarkdownString(mdBlocks).parent || '';

  // Download all images and rewrite URLs
  const imgRegex = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
  const matches = [...md.matchAll(imgRegex)];
  for (const match of matches) {
    const [full, alt, url] = match;
    const localPath = await downloadImage(url, slug);
    md = md.replace(full, `![${alt}](${localPath})`);
  }

  return md;
}

// Groups in display order
export const GROUP_ORDER = ['Getting Started', 'Editing', 'Workflows', 'Captioning and Exports'];
