import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// vitest 内嵌了一份 vite 副本，与根 node_modules/vite 的 Plugin 类型不兼容，
// 这里对 plugins 做类型断言以绕过双 vite 副本的类型冲突。
export default defineConfig({
  plugins: [react(), tsconfigPaths()] as never,
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['api/**/*.ts', 'src/**/*.{ts,tsx}'],
      exclude: ['**/*.test.*', '**/*.d.ts', '**/node_modules/**'],
    },
  },
});
