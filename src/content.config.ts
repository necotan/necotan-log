import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    // 一覧とOGPに出す要約は英語で統一する
    description: z.string().regex(/^[ -~]+$/, 'description は英語 (ASCII) で書く'),
    pubDate: z.date(),
    category: z.enum(['photo', 'life', 'essay']),
    tags: z.array(z.string()).optional(),
    heroImage: z.string().optional(),
    showHeroImage: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
