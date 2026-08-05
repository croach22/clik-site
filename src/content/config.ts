import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    date: z.coerce.date(),
    coverImage: z.string(),
  }),
});

// Prompts live here rather than inside HeroShowcase so the hero modal and a
// future /workflows page read the same source. Two surfaces, one file each.
const workflows = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    tab: z.string(),
    blurb: z.string(),
    order: z.number(),
  }),
});

export const collections = { blog, workflows };
