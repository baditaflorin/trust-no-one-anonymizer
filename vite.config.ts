import { defineConfig } from 'vite';

export default defineConfig({
  base: '/trust-no-one-anonymizer/',
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.1.0'),
    __APP_COMMIT__: JSON.stringify(process.env.VITE_APP_COMMIT ?? '2fa1d41'),
    __REPO_URL__: JSON.stringify('https://github.com/baditaflorin/trust-no-one-anonymizer'),
    __PAYPAL_URL__: JSON.stringify('https://www.paypal.com/paypalme/florinbadita'),
  },
  build: {
    outDir: 'docs',
    emptyOutDir: false,
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@mediapipe')) return 'mediapipe';
          if (id.includes('@tensorflow') || id.includes('upscaler')) return 'enhancement';
          if (id.includes('@jitsi')) return 'rnnoise';
          if (id.includes('lucide')) return 'icons';
          return undefined;
        },
      },
    },
  },
});
