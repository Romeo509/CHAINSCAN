import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // The live feed is imported from WePump's own source, not copied. Two apps
      // cannot disagree about the socket protocol when they run the same component.
      '@wepump': path.resolve(__dirname, '../wepump/src'),
    },
    // WePump has its own react/motion/lucide installed. Without dedupe the
    // imported component would load a second copy of React (19.2.8 beside our
    // 19.3.1) and crash on the first useState call.
    dedupe: ['react', 'react-dom', 'motion', 'lucide-react'],
  },
  server: {
    port: 5174,
    // Required because we serve modules out of the sibling wepump/ directory.
    fs: { allow: [path.resolve(__dirname, '..')] },
  },
});
