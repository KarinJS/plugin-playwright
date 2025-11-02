import fs from 'node:fs'
import path from 'node:path'
import { karin } from 'node-karin'
import { basePath } from 'node-karin/root'
import type { LaunchOptions } from '../types'

/**
 * 热更新key
 */
export const HMR_KEY = 'karin-plugin-playwright-hmr'

/**
 * 插件名称
 */
export const pluginName = '@karinjs/plugin-playwright'

/**
 * 插件版本
 */
export const pluginVersion = '1.0.0'

/**
 * 默认配置
 */
const defaultConfig: LaunchOptions = {
  downloadBrowser: 'chromium',
  headless: true,
  debug: false,
  maxPages: 10,
  idleTime: 500,
  hmr: false,
  args: [
    '--disable-gpu', // 禁用 GPU 硬件加速
    '--no-sandbox', // 关闭沙盒模式
    '--disable-setuid-sandbox', // 进一步禁用 setuid 沙盒机制
    '--disable-dev-shm-usage', // 禁用 /dev/shm 使用磁盘存储
    '--disable-extensions', // 禁用扩展
    '--disable-background-networking', // 禁用后台网络请求
    '--disable-sync', // 禁用同步功能
    '--disable-translate', // 禁用翻译
    '--disable-notifications', // 禁用通知
    '--disable-default-apps', // 禁用默认应用
    '--no-first-run', // 跳过首次运行体验
    '--no-default-browser-check', // 跳过默认浏览器检查
  ],
}

/**
 * 配置文件路径
 */
export const configPath = path.resolve(basePath, pluginName.replace(/\//g, '-'), 'config', 'config.json')

/**
 * 初始化配置
 */
const init = () => {
  /** 判断文件是否存在 不存在则创建 */
  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(path.dirname(configPath), { recursive: true })
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2))
  }
}

/**
 * 获取配置
 * @returns 配置对象
 */
export const getConfig = (): LaunchOptions => {
  try {
    const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    return { ...defaultConfig, ...data }
  } catch (error) {
    return defaultConfig
  }
}

/**
 * 保存配置
 * @param config - 配置对象
 */
export const saveConfig = (config: LaunchOptions) => {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
  karin.emit(HMR_KEY, config)
}

init()
