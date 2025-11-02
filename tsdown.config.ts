import { defineConfig } from 'tsdown'

/**
 * @description tsdown配置选项
 */
export default defineConfig({
  entry: ['src/index.ts', 'src/web.config.ts'],
  format: 'esm',
  dts: true,
  clean: true,
  external: ['node-karin', 'playwright'],
  outDir: 'dist',
})
