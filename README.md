# @karinjs/plugin-playwright

基于 Playwright 的 Karin 截图、渲染插件

## 简介

`@karinjs/plugin-playwright` 是为 [Karin](https://github.com/KarinJS/Karin) 开发的截图渲染插件，使用 [Playwright](https://playwright.dev/) 作为底层浏览器自动化框架。相比于 Puppeteer，Playwright 提供了更好的跨浏览器支持（Chromium、Firefox、WebKit）和更现代化的 API。

## 特性

- ✨ 支持多种浏览器引擎（Chromium、Firefox、WebKit）
- 🚀 高性能页面池管理，支持并发截图
- 🎯 灵活的截图选项（全页、元素、分页）
- 🔧 完善的配置管理和热更新支持
- 📝 完整的 TypeScript 类型定义
- 🎨 Web UI 配置界面
- 📦 使用 tsdown 打包，零配置构建

## 环境要求

- Node.js >= 18.0.0
- pnpm >= 9.0.0
- ESM 模块支持

## 安装

```bash
pnpm add @karinjs/plugin-playwright
```

## 使用方法

### 基本使用

插件会自动注册到 Karin 的渲染系统中：

```typescript
import { launch } from '@karinjs/plugin-playwright'

// 启动浏览器实例
const browser = await launch({
  downloadBrowser: 'chromium',
  headless: true,
  maxPages: 10,
  idleTime: 500,
})

// 截图
const result = await browser.screenshot({
  file: 'https://example.com',
  encoding: 'base64',
  fullPage: true,
})

if (result.status) {
  console.log('截图成功:', result.data)
}
```

### 配置选项

#### LaunchOptions（浏览器启动选项）

```typescript
interface LaunchOptions {
  /** 浏览器类型 - chromium | firefox | webkit */
  downloadBrowser?: 'chromium' | 'firefox' | 'webkit'
  
  /** 是否无头模式 */
  headless?: boolean
  
  /** debug模式（仅Windows下有效） */
  debug?: boolean
  
  /** 最大并发页面数 */
  maxPages?: number
  
  /** 网络请求空闲时间（毫秒） */
  idleTime?: number
  
  /** 是否支持热更新 */
  hmr?: boolean
  
  /** 浏览器可执行路径 */
  executablePath?: string
  
  /** 启动参数 */
  args?: string[]
  
  /** 日志回调函数 */
  logger?: (level: 'debug' | 'info' | 'warn' | 'error', ...args: any[]) => void
}
```

#### ScreenshotOptions（截图选项）

```typescript
interface ScreenshotOptions {
  /** 要截图的文件（URL、本地路径或HTML字符串） */
  file: string
  
  /** 文件类型 - auto | htmlString | vue3 | vueString | react */
  file_type?: 'auto' | 'htmlString' | 'vue3' | 'vueString' | 'react'
  
  /** 选择器（用于元素截图） */
  selector?: string
  
  /** 截图类型 */
  type?: 'png' | 'jpeg'
  
  /** 图片质量（仅jpeg有效） */
  quality?: number
  
  /** 是否全页截图 */
  fullPage?: boolean
  
  /** 编码类型 */
  encoding?: 'base64' | 'binary'
  
  /** 视窗设置 */
  setViewport?: {
    width?: number
    height?: number
    deviceScaleFactor?: number
  }
  
  /** 分页截图 */
  multiPage?: boolean | number
  
  /** 额外的HTTP头 */
  headers?: Record<string, string>
  
  /** 等待的选择器 */
  waitForSelector?: string | string[]
  
  /** 等待的函数 */
  waitForFunction?: string | string[]
  
  /** 超时时间（毫秒） */
  timeout?: number
  
  /** 重试次数 */
  retry?: number
}
```

## 配置文件

插件会在 Karin 的配置目录下创建 `@karinjs-plugin-playwright/config/config.json` 文件：

```json
{
  "downloadBrowser": "chromium",
  "headless": true,
  "debug": false,
  "maxPages": 10,
  "idleTime": 500,
  "hmr": false,
  "args": [
    "--disable-gpu",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-extensions",
    "--disable-background-networking",
    "--disable-sync",
    "--disable-translate",
    "--disable-notifications"
  ]
}
```

## Web UI 配置

插件提供了 Web UI 配置界面，可以通过 Karin 的管理后台进行可视化配置：

- 浏览器类型选择
- 无头模式开关
- Debug模式开关
- 热更新开关
- 最大标签页数量
- 网络空闲时间
- 浏览器可执行路径
- 启动参数配置

## 环境变量

- `PLAYWRIGHT_BROWSERS_PATH` - Playwright 浏览器缓存目录
- `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` - 是否跳过浏览器下载

## 开发

### 构建

```bash
pnpm build
```

### 开发模式

```bash
pnpm dev
```

### 测试构建产物

```bash
pnpm dev:test
```

## API 文档

### launch(options: LaunchOptions)

启动浏览器实例

返回值：
```typescript
{
  ctx: PlaywrightContext           // 浏览器上下文
  browser: Browser                 // 浏览器实例
  context: BrowserContext          // 浏览器上下文
  config: LaunchOptions            // 当前配置
  screenshot: (options) => Promise // 截图方法
  close: () => Promise<void>       // 关闭浏览器
  hmrConfig: (options) => Promise  // 更新配置
}
```

### screenshot(options: ScreenshotOptions)

执行截图操作

返回值：
```typescript
{
  status: boolean                  // 是否成功
  data: Buffer | string | Array    // 截图数据
}
```

## 与 Puppeteer 版本的差异

1. **浏览器引擎**：支持 Chromium、Firefox、WebKit，而不仅仅是 Chrome
2. **API 现代化**：使用 Playwright 的现代化 API，更加简洁和强大
3. **性能优化**：更好的页面池管理和并发控制
4. **类型安全**：完整的 TypeScript 类型定义

## 常见问题

### 1. 浏览器下载失败

可以设置 `PLAYWRIGHT_BROWSERS_PATH` 环境变量指定浏览器缓存目录，或使用 `executablePath` 配置项指定已安装的浏览器路径。

### 2. Linux 下权限问题

建议使用 `--no-sandbox` 和 `--disable-setuid-sandbox` 参数（默认已包含）。

### 3. 内存占用高

可以通过调整 `maxPages` 参数控制最大并发页面数，减少内存占用。

## 许可证

MIT

## 相关链接

- [Playwright 官方文档](https://playwright.dev/)
- [Karin 框架](https://github.com/KarinJS/Karin)
- [参考实现（Puppeteer版本）](https://github.com/KarinJS/puppeteer)