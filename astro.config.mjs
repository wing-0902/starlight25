import { defineConfig, passthroughImageService } from 'astro/config';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeExternalLinks from 'rehype-external-links';
import remarkGfm from 'remark-gfm'
import remarkFigureCaption from '@microflash/remark-figure-caption'

import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import vue from '@astrojs/vue';
import mdx from '@astrojs/mdx';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://starlight25.pages.dev',
  trailingSlash: 'always',
  compressHTML: true,

  build: {
    format: 'directory',
  },

  image: {
    service: passthroughImageService(),
  },

  integrations: [svelte(), sitemap(), react(), vue(), mdx()],

  markdown: {
    remarkPlugins: [
      remarkMath,
      remarkGfm,
      remarkFigureCaption,
    ],
    rehypePlugins: [
      rehypeKatex,
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['noopener', 'noreferrer'],
          site: 'https://starlight25.pages.dev'
        }
      ],
    ],
  },

  adapter: cloudflare({
    imageService: 'compile',
    platformProxy: {
      enabled: true,
      configPath: 'wrangler.jsonc',
    },
    routes: {
      extend: {
        exclude: [
          {pattern: '/content/*'},
          {pattern: '/_astro/*'},
          {pattern: '/pagefind/*'},
        ],
        include: [
          {pattern: '/api/*'},
        ],
      }
    },
  }),
});