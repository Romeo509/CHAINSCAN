import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // WePump's feed, chart and KOL roster are vendored under src/vendor/wepump
      // instead of being reached across sibling directories: a deploy host clones
      // THIS repo alone, so ../wepump does not exist there and the build dies on
      // the first import. See src/vendor/wepump/README.md for the sync command.
      '@wepump': path.resolve(__dirname, 'src/vendor/wepump'),
    },
    // Guards against a transitive dependency pulling a second React copy, which
    // would crash the feed on its first useState call.
    dedupe: ['react', 'react-dom', 'motion', 'lucide-react'],
  },
  server: {
    port: 5174,
  },
});
