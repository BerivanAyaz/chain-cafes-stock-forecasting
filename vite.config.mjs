import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // --- YENİ EKLENEN KISIM BURASI ---
  // Derleme (build) ayarları
  build: {
    rollupOptions: {
      // 'external' dizisi, derleyicinin hangi paketleri
      // kodun içine dahil etmeye ÇALIŞMAMASI gerektiğini söyler.
      external: ['pandas']
    }
  }
});
