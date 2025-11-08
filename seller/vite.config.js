// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 🔑 CRITICAL: Explicitly set the base URL to the root
  base: '/', 
});