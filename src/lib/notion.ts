import pkg from '@notionhq/client';
import mdPkg from 'notion-to-md';

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

export async function getDocContent(pageId: string): Promise<string> {
  const mdBlocks = await n2m.pageToMarkdown(pageId);
  const md = n2m.toMarkdownString(mdBlocks);
  return md.parent || '';
}

// Groups in display order
export const GROUP_ORDER = ['Getting Started', 'Editing', 'Captioning and Exports'];
