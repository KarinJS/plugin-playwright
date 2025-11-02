import path from 'node:path'
import { launch, type LaunchOptions } from './playwright'
import { logger, registerRender, renderTpl, karin, type Snapka } from 'node-karin'
import { pluginName, pluginVersion, getConfig, HMR_KEY } from './config'

/**
 * 格式化字节大小
 * @param bytes - 字节数
 * @returns 格式化后的字符串
 */
const formatBytes = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  if (!bytes || bytes < 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / Math.pow(1024, i)
  return `${i === 0 ? Math.round(value) : value.toFixed(2)} ${units[i]}`
}

/**
 * 获取截图字节大小
 * @param payload - 截图数据
 * @param encoding - 编码类型
 * @returns 字节大小
 */
const getScreenshotByteSize = (payload: unknown, encoding?: string): number | undefined => {
  try {
    if (payload == null) return undefined
    const enc = (encoding || '').toLowerCase()

    if (Array.isArray(payload)) {
      let total = 0
      for (const item of payload) {
        const size = getScreenshotByteSize(item, enc)
        if (typeof size === 'number') total += size
      }
      return total
    }

    if (typeof payload === 'string') {
      return enc === 'base64' ? Buffer.from(payload, 'base64').length : Buffer.byteLength(payload)
    }
    if (Buffer.isBuffer(payload)) return payload.length
    if (payload instanceof Uint8Array) return payload.byteLength
    if (payload instanceof ArrayBuffer) return payload.byteLength

    const anyPayload = payload as any
    if (typeof anyPayload.data === 'string') {
      return enc === 'base64' ? Buffer.from(anyPayload.data, 'base64').length : Buffer.byteLength(anyPayload.data)
    }
    if (Buffer.isBuffer(anyPayload.buffer)) return anyPayload.buffer.length
    if (anyPayload.buffer instanceof ArrayBuffer) return anyPayload.buffer.byteLength
    if (typeof anyPayload.byteLength === 'number') return anyPayload.byteLength
    if (typeof anyPayload.length === 'number') return anyPayload.length

    return undefined
  } catch {
    return undefined
  }
}

/**
 * 主函数 - 初始化插件
 */
const main = async () => {
  const config = getConfig()
  
  // 设置日志回调
  config.logger = (level, ...args) => {
    switch (level) {
      case 'debug':
        logger.debug(`[${pluginName}]`, ...args)
        break
      case 'info':
        logger.info(`[${pluginName}]`, ...args)
        break
      case 'warn':
        logger.warn(`[${pluginName}]`, ...args)
        break
      case 'error':
        logger.error(`[${pluginName}]`, ...args)
        break
    }
  }

  const browser = await launch(config)
  
  // 监听热更新事件
  karin.on(HMR_KEY, (cfg: LaunchOptions) => browser.hmrConfig(cfg))

  const name = pluginName

  /**
   * 注册渲染器
   */
  registerRender(name, async (options: Snapka) => {
    options.encoding = 'base64'
    const data = renderTpl(options)
    data.encoding = options.encoding

    // 确保type兼容
    if (data.type === 'webp') {
      data.type = 'png' // Playwright不支持webp，转换为png
    }

    const time = Date.now()
    const result = await browser.screenshot(data as any)

    const fileName = typeof data?.file === 'string' ? path.basename(data.file) : 'unknown'

    if (!result.status) {
      logger.info(
        `[${name}][${fileName}] 截图失败 耗时: ${logger.green(Date.now() - time + '')} ms`
      )
      const errorData = result.data as { message?: string }
      throw new Error(errorData.message || '截图失败', { cause: result.data })
    }

    const sizeBytes = getScreenshotByteSize(result.data, options.encoding)
    const sizeStr = sizeBytes != null ? `大小: ${logger.green(formatBytes(sizeBytes))} ` : ''

    logger.info(
      `[${name}][${fileName}] 截图完成 ${sizeStr}耗时: ${logger.green(Date.now() - time + '')} ms`
    )

    return result.data as any
  })

  logger.info(`${logger.violet(`[插件:${pluginVersion}]`)} ${logger.green(pluginName)} 初始化完成~`)
}

main()

// 导出类型和函数
export * from './types'
export * from './playwright'
export { pluginName, pluginVersion, getConfig, saveConfig } from './config'
