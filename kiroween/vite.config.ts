import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Optional bundle analyzer - install rollup-plugin-visualizer to use
// Run with ANALYZE=true npm run build to generate bundle analysis
let visualizer: ((options: any) => any) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  visualizer = require('rollup-plugin-visualizer').visualizer;
} catch {
  // Plugin not installed, skip
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html in dist folder
    // Install: npm install -D rollup-plugin-visualizer
    // Run with: ANALYZE=true npm run build
    process.env.ANALYZE === 'true' && visualizer && visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  build: {
    outDir: 'dist',
    // Enable source maps in production for error tracking (hidden from users)
    // Source maps are not served by default, only available for error reporting services
    sourcemap: 'hidden',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'git-vendor': ['isomorphic-git'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'markdown-vendor': ['react-markdown', 'remark-gfm', 'rehype-highlight', 'rehype-raw'],
        },
        // Optimize chunk file names for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning limit (some vendors are large)
    chunkSizeWarningLimit: 1000,
    // Enable compression
    reportCompressedSize: true,
    // Target modern browsers for smaller bundle size
    target: 'esnext',
  },
  base: './',
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
