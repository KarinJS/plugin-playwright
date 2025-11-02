import { components } from 'node-karin'
import { getConfig, pluginName, pluginVersion, saveConfig } from './config/index'
import type { LaunchOptions } from './types'
import type { ComponentConfig, GetConfigResponse } from 'node-karin'

/**
 * Web配置对象
 */
const webConfig: {
  info: GetConfigResponse['info']
  components: () => ComponentConfig[]
  save: (config: LaunchOptions) => {
    success: boolean
    message: string
  }
} = {
  info: {
    id: pluginName,
    name: 'Playwright渲染器插件',
    version: pluginVersion,
    description: 'karin的 playwright截图、渲染插件',
    author: [
      {
        name: 'KarinJS',
        home: 'https://github.com/KarinJS',
        avatar: 'https://avatars.githubusercontent.com/u/180506562',
      },
    ],
    icon: {
      name: 'camera',
      size: 24,
      color: '#2e7d32', // 绿色
    },
  },
  
  /** 动态渲染的组件 */
  components: () => {
    const config = getConfig()
    return [
      components.radio.group('downloadBrowser', {
        label: '浏览器类型',
        orientation: 'horizontal',
        description: '选择使用的浏览器引擎，建议使用chromium',
        defaultValue: config.downloadBrowser || 'chromium',
        radio: [
          components.radio.create('chromium', {
            label: 'Chromium',
            value: 'chromium',
            description: 'Chromium浏览器，兼容性最好'
          }),
          components.radio.create('firefox', {
            label: 'Firefox',
            value: 'firefox',
            description: 'Firefox浏览器'
          }),
          components.radio.create('webkit', {
            label: 'WebKit',
            value: 'webkit',
            description: 'WebKit浏览器'
          })
        ]
      }),
      components.divider.create('divider1'),
      components.radio.group('headless', {
        label: '无头模式',
        description: '是否无头模式，无头模式下浏览器将后台运行',
        defaultValue: String(config.headless ?? true),
        radio: [
          components.radio.create('headless:true', {
            label: 'true',
            value: 'true',
            description: '打开无头模式'
          }),
          components.radio.create('headless:false', {
            label: 'false',
            value: 'false',
            description: '关闭无头模式'
          })
        ]
      }),
      components.divider.create('divider2'),
      components.switch.create('debug', {
        label: 'debug模式',
        description: '是否开启debug模式，debug模式下浏览器将前台运行，并且打开页面后不会关闭',
        defaultSelected: config.debug ?? false,
        color: 'success',
      }),
      components.switch.create('hmr', {
        label: '热更新',
        description: '是否开启热更新，开启后前端点击保存后会强制关闭所有正在进行的截图任务并重载配置',
        defaultSelected: config.hmr ?? false,
        color: 'success',
      }),
      components.divider.create('divider3'),
      components.input.number('maxPages', {
        label: '最大标签页',
        description: '最多同时打开的标签页数量，超出后将会自动排队',
        defaultValue: String(config.maxPages || 10),
        className: 'inline-block p-2',
        rules: [
          {
            min: 1,
            max: 100,
            error: '最大标签页数量必须在1-100之间'
          }
        ]
      }),
      components.input.number('idleTime', {
        label: '网络请求空闲时间',
        description: '网络请求空闲时间，单位为毫秒',
        defaultValue: String(config.idleTime || 500),
        className: 'inline-block p-2',
        rules: [
          {
            min: 0,
            max: 999999,
            error: '网络请求空闲时间必须在0-999999之间'
          }
        ]
      }),
      components.input.string('executablePath', {
        label: '浏览器可执行路径',
        description: '浏览器可执行路径，如果为空将使用系统安装的浏览器',
        defaultValue: config.executablePath || '',
        isRequired: false,
        className: 'inline-block p-2',
      }),
      components.divider.create('divider4'),
      components.input.group('args', {
        label: '启动参数',
        description: '浏览器启动参数，不允许出现空值，无特殊需求不建议改动',
        template: components.input.string('args', {
          label: '启动参数',
        }),
        data: config.args || []
      }),
    ]
  },

  /** 前端点击保存之后调用的方法 */
  save: (config: LaunchOptions) => {
    // 转换数字类型
    config = {
      ...config,
      maxPages: Number(config.maxPages),
      idleTime: Number(config.idleTime),
      headless: config.headless === 'true' || config.headless === true,
    }

    saveConfig(config)
    return {
      success: true,
      message: '保存成功 φ(>ω<*)'
    }
  }
}

export default webConfig
