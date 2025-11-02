import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * 安装浏览器
 * @param browserType - 浏览器类型
 * @param silent - 是否静默安装
 */
export const installBrowser = async (browserType: 'chromium' | 'firefox' | 'webkit', silent: boolean = false): Promise<void> => {
  try {
    console.log(`正在安装 ${browserType} 浏览器...`)
    
    const command = `npx playwright install ${browserType}`
    
    if (silent) {
      await execAsync(command)
    } else {
      // 使用 spawn 来实时显示输出
      const { spawn } = require('child_process')
      return new Promise((resolve, reject) => {
        const child = spawn('npx', ['playwright', 'install', browserType], {
          stdio: 'inherit',
          shell: true
        })
        
        child.on('close', (code: number) => {
          if (code === 0) {
            console.log(`${browserType} 浏览器安装完成`)
            resolve()
          } else {
            reject(new Error(`浏览器安装失败，退出码: ${code}`))
          }
        })
        
        child.on('error', (error: Error) => {
          reject(new Error(`浏览器安装失败: ${error.message}`))
        })
      })
    }
  } catch (error) {
    throw new Error(`浏览器安装失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * 确保浏览器已安装
 * @param browserType - 浏览器类型
 * @param autoInstall - 是否自动安装
 * @param silent - 是否静默安装
 */
export const ensureBrowserInstalled = async (
  browserType: 'chromium' | 'firefox' | 'webkit',
  autoInstall: boolean = true,
  silent: boolean = false
): Promise<void> => {
  if (!autoInstall) {
    return
  }

  // 直接尝试安装，Playwright 会自动检查是否需要安装
  // 如果已安装，安装命令会快速完成
  try {
    await installBrowser(browserType, silent)
  } catch (error) {
    console.error(`浏览器安装检查失败: ${error instanceof Error ? error.message : String(error)}`)
    console.error(`请手动运行: npx playwright install ${browserType}`)
  }
}

