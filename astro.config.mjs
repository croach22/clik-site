import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import { visit } from 'unist-util-visit';

// Replaces placeholder:image-name.jpg src values with a branded SVG
// so articles render cleanly until real images are added
const rehypePlaceholderImages = () => (tree) => {
  visit(tree, 'element', (node) => {
    if (
      node.tagName === 'img' &&
      typeof node.properties?.src === 'string' &&
      node.properties.src.startsWith('placeholder:')
    ) {
      node.properties.src = '/images/articles/placeholder.svg';
      node.properties.class = (node.properties.class || '') + ' placeholder-img';
    }
  });
};

export default defineConfig({
  output: 'hybrid',
  integrations: [tailwind(), react()],
  markdown: {
    rehypePlugins: [rehypePlaceholderImages],
  },
  server: { host: '0.0.0.0' },
});
