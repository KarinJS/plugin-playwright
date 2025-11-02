import type { Page } from 'playwright'
import type { PlaywrightContext } from './browser'
import type { ScreenshotOptions, Encoding, MultiPage, ScreenshotResult } from '../types'
import { withPage, debugLog } from './browser'
import { existsSync } from 'fs'
import { readFile } from 'fs/promises'

/**
 * 判断是否为URL
 * @param str - 字符串
 * @returns 是否为URL
 */
const isUrl = (str: string): boolean => {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

/**
 * 判断是否为HTML文件路径
 * @param str - 字符串
 * @returns 是否为HTML文件路径
 */
const isHtmlFile = (str: string): boolean => {
  return existsSync(str) && str.endsWith('.html')
}

/**
 * 准备页面内容
 * @param page - 页面实例
 * @param options - 截图选项
 */
const preparePage = async (page: Page, options: ScreenshotOptions) => {
  const { file, file_type = 'auto', headers, timeout = 30000 } = options

  // 设置额外的HTTP头
  if (headers) {
    await page.setExtraHTTPHeaders(headers)
  }

  // 设置超时
  page.setDefaultTimeout(timeout)

  // 根据file_type处理不同的输入
  if (file_type === 'htmlString') {
    // HTML字符串
    await page.setContent(file, { waitUntil: 'networkidle', timeout })
  } else if (file_type === 'auto') {
    if (isUrl(file)) {
      // URL
      await page.goto(file, { waitUntil: 'networkidle', timeout })
    } else if (isHtmlFile(file)) {
      // HTML文件路径
      const content = await readFile(file, 'utf-8')
      await page.setContent(content, { waitUntil: 'networkidle', timeout })
    } else {
      // 默认作为HTML字符串处理
      await page.setContent(file, { waitUntil: 'networkidle', timeout })
    }
  } else if (file_type === 'vue3' || file_type === 'vueString') {
    // Vue3暂不支持，作为HTML处理
    debugLog('Vue3暂不支持，作为HTML字符串处理')
    await page.setContent(file, { waitUntil: 'networkidle', timeout })
  } else if (file_type === 'react') {
    // React暂不支持
    throw new Error('React渲染暂不支持')
  }

  // 设置视窗
  if (options.setViewport) {
    await page.setViewportSize({
      width: options.setViewport.width || 800,
      height: options.setViewport.height || 600,
    })
  }

  // 等待选择器
  if (options.waitForSelector) {
    const selectors = Array.isArray(options.waitForSelector)
      ? options.waitForSelector
      : [options.waitForSelector]
    
    for (const selector of selectors) {
      await page.waitForSelector(selector, { timeout })
    }
  }

  // 等待函数
  if (options.waitForFunction) {
    const functions = Array.isArray(options.waitForFunction)
      ? options.waitForFunction
      : [options.waitForFunction]
    
    for (const fn of functions) {
      await page.waitForFunction(fn, { timeout })
    }
  }

  // 等待网络空闲
  const idleTime = options.timeout || 500
  if (idleTime > 0) {
    await page.waitForTimeout(idleTime)
  }
}

/**
 * 执行截图
 * @param page - 页面实例
 * @param options - 截图选项
 * @returns 截图结果
 */
const takeScreenshot = async (
  page: Page,
  options: ScreenshotOptions
): Promise<Buffer> => {
  const {
    selector = 'body',
    fullPage = false,
    type = 'png',
    quality = 90,
    omitBackground = false,
    path,
  } = options

  let screenshotOptions: any = {
    type,
    omitBackground,
    path,
  }

  // 只有jpeg支持quality参数
  if (type === 'jpeg') {
    screenshotOptions.quality = quality
  }

  // 如果指定了选择器且不是全页截图，截取元素
  if (selector && !fullPage) {
    try {
      const element = await page.$(selector)
      if (element) {
        return await element.screenshot(screenshotOptions)
      }
    } catch (error) {
      debugLog('截取元素失败，使用全页截图:', error)
    }
  }

  // 全页截图或元素截图失败时使用页面截图
  screenshotOptions.fullPage = fullPage
  return await page.screenshot(screenshotOptions)
}

/**
 * 分页截图
 * @param page - 页面实例
 * @param options - 截图选项
 * @param pageHeight - 每页高度
 * @returns 截图结果数组
 */
const multiPageScreenshot = async (
  page: Page,
  options: ScreenshotOptions,
  pageHeight: number
): Promise<Buffer[]> => {
  const screenshots: Buffer[] = []
  
  // 获取页面总高度
  const totalHeight = await page.evaluate(`
    Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    )
  `) as number

  const pages = Math.ceil(totalHeight / pageHeight)

  for (let i = 0; i < pages; i++) {
    // 滚动到指定位置
    await page.evaluate(`window.scrollTo(0, ${i * pageHeight})`)

    // 等待渲染完成
    await page.waitForTimeout(100)

    // 截图
    const screenshot = await takeScreenshot(page, {
      ...options,
      fullPage: false,
    })
    screenshots.push(screenshot)
  }

  return screenshots
}

/**
 * 截图
 * @param ctx - Playwright上下文
 * @param options - 截图选项
 * @returns 截图结果
 */
export const screenshot = async <T extends Encoding = 'binary', M extends MultiPage = false>(
  ctx: PlaywrightContext,
  options: ScreenshotOptions & { encoding?: T; multiPage?: M }
): Promise<{
  status: boolean
  data: ScreenshotResult<T, M> | { message: string }
}> => {
  const retry = options.retry || 1

  for (let i = 0; i < retry; i++) {
    try {
      const result = await withPage(ctx, async (page) => {
        // 准备页面
        await preparePage(page, options)

        let screenshots: Buffer | Buffer[]

        // 判断是否分页截图
        if (options.multiPage) {
          const pageHeight = typeof options.multiPage === 'number'
            ? options.multiPage
            : (options.setViewport?.height || 800)
          screenshots = await multiPageScreenshot(page, options, pageHeight)
        } else {
          screenshots = await takeScreenshot(page, options)
        }

        // 处理编码
        const encoding = options.encoding || 'binary'
        if (encoding === 'base64') {
          if (Array.isArray(screenshots)) {
            return screenshots.map(s => s.toString('base64')) as any
          } else {
            return screenshots.toString('base64') as any
          }
        } else {
          return screenshots as any
        }
      })

      return {
        status: true,
        data: result,
      }
    } catch (error) {
      debugLog(`截图失败 (尝试 ${i + 1}/${retry}):`, error)
      
      if (i === retry - 1) {
        return {
          status: false,
          data: {
            message: error instanceof Error ? error.message : '截图失败',
          },
        }
      }
    }
  }

  return {
    status: false,
    data: {
      message: '截图失败',
    },
  }
}
