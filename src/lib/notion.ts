import pkg from '@notionhq/client';
import mdPkg from 'notion-to-md';
// slugify + downloadImage live in a shared, env-free module so the build-time
// prefetch (scripts/prefetch-docs.mjs) produces byte-identical filenames.
import { slugify, downloadImage } from './docs-images.mjs';

const { Client } = pkg;
const { NotionToMarkdown } = mdPkg;

const notion = new Client({ auth: import.meta.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

export { slugify };

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
// Workflows sits above Editing: you plan and build a set of videos before you
// open any one of them in the editor, so the docs run in the order the product does.
export const GROUP_ORDER = ['Getting Started', 'Project Workflows', 'Editing', 'Captioning and Exports'];
