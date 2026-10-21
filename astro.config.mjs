import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

const PROVISIONAL_ORIGIN = 'https://oribos.ai';
const configured = process.env.SITE_ORIGIN || PROVISIONAL_ORIGIN;

export const SITE_ORIGIN = new URL(configured).origin;

export default defineConfig({
  site: SITE_ORIGIN,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    starlight({
      title: 'Oribos',
      description:
        'An open-source agent framework of composable pieces — agents, workflows, memory, and a harness.',
      customCss: ['./src/styles/global.css'],
      disable404Route: true,
      components: {
        ThemeSelect: './src/components/chrome/ThemeToggle.astro',
      },
      head: [
        {
          tag: 'script',
          content:
            "(() => { try { const stored = localStorage.getItem('oribos-theme'); const theme = stored === 'light' || stored === 'dark' ? stored : matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'; localStorage.setItem('starlight-theme', theme); } catch {} })();",
        },
        {
          tag: 'meta',
          attrs: { name: 'theme-color', 'data-theme-color': '' },
        },
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
