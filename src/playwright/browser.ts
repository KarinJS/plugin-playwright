import { chromium, firefox, webkit, type Browser, type BrowserContext, type Page } from 'playwright'
import type { LaunchOptions, ScreenshotOptions } from '../types'

/**
 * Playwright浏览器上下文
 */
export interface PlaywrightContext {
  /** 浏览器实例 */
  browser: Browser
  /** 浏览器上下文 */
  context: BrowserContext
  /** 配置 */
  config: LaunchOptions
  /** 关闭浏览器 */
  close: () => Promise<void>
  /** 更新配置 */
  hmrConfig: (newOptions: LaunchOptions) => Promise<PlaywrightContext>
  /** 页面池 */
  pagePool: Page[]
  /** 当前活跃页面数 */
  activePages: number
}

/**
 * 日志输出函数
 */
let logFn: LaunchOptions['logger'] = undefined

/**
 * 设置日志函数
 * @param logger - 日志函数
 */
export const setLogger = (logger?: LaunchOptions['logger']) => {
  logFn = logger
}

/**
 * 调试日志
 * @param args - 日志参数
 */
export const debug = (...args: any[]) => {
  if (logFn) {
    logFn('debug', ...args)
  }
}

/**
 * 创建Playwright上下文
 * @param browser - 浏览器实例
 * @param context - 浏览器上下文
 * @param config - 配置
 * @param close - 关闭函数
 * @param hmrConfig - 更新配置函数
 * @returns Playwright上下文
 */
export const createContext = (
  browser: Browser,
  context: BrowserContext,
  config: LaunchOptions,
  close: () => Promise<void>,
  hmrConfig: (newOptions: LaunchOptions) => Promise<PlaywrightContext>
): PlaywrightContext => {
  return {
    browser,
    context,
    config,
    close,
    hmrConfig,
    pagePool: [],
    activePages: 0,
  }
}

/**
 * 设置浏览器监控
 * @param ctx - Playwright上下文
 */
export const setupBrowserMonitoring = (ctx: PlaywrightContext) => {
  ctx.browser.on('disconnected', () => {
    debug('浏览器连接断开')
  })
}

/**
 * 初始化浏览器
 * @param options - 启动选项
 * @returns 浏览器实例和上下文
 */
export const initBrowser = async (options: LaunchOptions = {}) => {
  if (options.logger) {
    setLogger(options.logger)
  }

  const browserType = options.downloadBrowser || 'chromium'
  let browser: Browser

  // 选择浏览器类型
  switch (browserType) {
    case 'firefox':
      browser = await firefox.launch(options)
      break
    case 'webkit':
      browser = await webkit.launch(options)
      break
    case 'chromium':
    default:
      browser = await chromium.launch(options)
      break
  }

  // 创建浏览器上下文
  const context = await browser.newContext({
    viewport: null,
    deviceScaleFactor: 1,
  })

  /**
   * 关闭浏览器
   */
  const close = async () => {
    try {
      await context.close()
      await browser.close()
      debug('浏览器已关闭')
    } catch (error) {
      debug('关闭浏览器失败:', error)
    }
  }

  /**
   * 更新配置
   * @param newOptions - 新的配置选项
   * @returns 更新后的上下文
   */
  const hmrConfig = async (newOptions: LaunchOptions): Promise<PlaywrightContext> => {
    const newConfig = { ...options, ...newOptions }
    ctx.config = newConfig

    if (newConfig.hmr === true) {
      debug('检测到hmr为true，正在重载浏览器...')
      try {
        await close()
        const { ctx: newCtx } = await initBrowser(newConfig)
        return newCtx
      } catch (error) {
        debug('重载浏览器失败:', error)
        throw error
      }
    } else {
      debug('更新配置，不重载浏览器')
    }
    return ctx
  }

  const ctx = createContext(browser, context, options, close, hmrConfig)
  setupBrowserMonitoring(ctx)

  return { browser, context, ctx }
}

/**
 * 获取或创建页面
 * @param ctx - Playwright上下文
 * @returns 页面实例
 */
export const getPage = async (ctx: PlaywrightContext): Promise<Page> => {
  const maxPages = ctx.config.maxPages || 10

  // 如果有空闲页面，重用它
  if (ctx.pagePool.length > 0) {
    const page = ctx.pagePool.shift()!
    ctx.activePages++
    return page
  }

  // 如果当前活跃页面数已达上限，等待
  while (ctx.activePages >= maxPages) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // 创建新页面
  const page = await ctx.context.newPage()
  ctx.activePages++
  return page
}

/**
 * 释放页面
 * @param ctx - Playwright上下文
 * @param page - 页面实例
 */
export const releasePage = async (ctx: PlaywrightContext, page: Page) => {
  ctx.activePages--
  
  if (ctx.config.debug) {
    // debug模式下不关闭页面
    return
  }

  try {
    // 清理页面状态
    await page.goto('about:blank')
    
    // 将页面放回池中
    if (ctx.pagePool.length < (ctx.config.maxPages || 10)) {
      ctx.pagePool.push(page)
    } else {
      await page.close()
    }
  } catch (error) {
    debug('释放页面失败:', error)
    try {
      await page.close()
    } catch {}
  }
}

/**
 * 在页面上执行操作并确保正确释放
 * @param ctx - Playwright上下文
 * @param fn - 回调函数
 * @returns 回调函数返回值
 */
export const withPage = async <T>(
  ctx: PlaywrightContext,
  fn: (page: Page) => Promise<T>
): Promise<T> => {
  const page = await getPage(ctx)
  try {
    return await fn(page)
  } finally {
    await releasePage(ctx, page)
  }
}
