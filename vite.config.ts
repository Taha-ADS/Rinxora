import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Share previews need absolute URLs: set VITE_SITE_URL (e.g. https://rinxora.com) for production builds
  const site = (loadEnv(mode, process.cwd(), '').VITE_SITE_URL || '').replace(/\/$/, '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      { name: 'site-url', transformIndexHtml: (html: string) => html.replaceAll('%SITE_URL%', site) },
    ],
    server: {
      port: 3000,
      open: false,
    },
    build: {
      rolldownOptions: {
        // The landing page plus the legal pages, each a real URL
        input: {
          main: 'index.html',
          privacy: 'privacy.html',
          terms: 'terms.html',
        },
      },
    },
  };
});
