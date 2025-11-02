import type { LaunchOptions as PlaywrightLaunchOptions } from 'playwright'

/**
 * 浏览器初始化参数
 */
export interface LaunchOptions extends PlaywrightLaunchOptions {
  /**
   * 没有浏览器时下载的浏览器类型
   * @default 'chromium'
   * - `chromium` - Chromium浏览器
   * - `firefox` - Firefox浏览器
   * - `webkit` - WebKit浏览器
   */
  downloadBrowser?: 'chromium' | 'firefox' | 'webkit'
  
  /**
   * debug模式 仅在windows下有效
   * - 在该模式下，浏览器将前台运行，并且打开页面后不会关闭
   * @default false
   */
  debug?: boolean
  
  /**
   * 最大并发数
   * @default 10
   */
  maxPages?: number
  
  /**
   * 网络请求空闲时间（毫秒）
   * @default 500
   */
  idleTime?: number
  
  /**
   * 触发配置热更新是否重载浏览器
   * @description 需要注意，会强制关闭所有正在进行中的截图任务
   * @default false
   */
  hmr?: boolean
  
  /**
   * 日志回调函数
   */
  logger?: (level: 'debug' | 'info' | 'warn' | 'error', ...args: any[]) => void
}
