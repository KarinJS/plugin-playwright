# 使用示例

本文档提供了 `@karinjs/plugin-playwright` 的详细使用示例。

## 基本使用示例

### 1. 简单截图

```typescript
import { launch } from '@karinjs/plugin-playwright'

const browser = await launch({
  headless: true,
  downloadBrowser: 'chromium',
})

// 截取网页
const result = await browser.screenshot({
  file: 'https://example.com',
  encoding: 'base64',
})

if (result.status) {
  console.log('截图成功')
  // result.data 为 base64 编码的图片
}

await browser.close()
```

### 2. 截取元素

```typescript
const result = await browser.screenshot({
  file: 'https://example.com',
  selector: '#main-content',  // CSS选择器
  encoding: 'binary',
})
```

### 3. 全页截图

```typescript
const result = await browser.screenshot({
  file: 'https://example.com',
  fullPage: true,  // 截取整个页面
  type: 'png',
})
```

### 4. 截取HTML字符串

```typescript
const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial; padding: 20px; }
    h1 { color: #2e7d32; }
  </style>
</head>
<body>
  <h1>Hello Playwright!</h1>
  <p>这是一个测试页面</p>
</body>
</html>
`

const result = await browser.screenshot({
  file: html,
  file_type: 'htmlString',
  encoding: 'base64',
})
```

### 5. 自定义视窗大小

```typescript
const result = await browser.screenshot({
  file: 'https://example.com',
  setViewport: {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 2,  // 2倍像素密度
  },
})
```

### 6. 分页截图

```typescript
// 自动计算分页
const result = await browser.screenshot({
  file: 'https://example.com',
  multiPage: true,
  encoding: 'binary',
})

// result.data 是一个数组，包含多个截图

// 或者指定每页高度
const result2 = await browser.screenshot({
  file: 'https://example.com',
  multiPage: 800,  // 每页800px高度
})
```

### 7. 等待元素加载

```typescript
const result = await browser.screenshot({
  file: 'https://example.com',
  waitForSelector: '#content',  // 等待元素出现
  timeout: 10000,  // 10秒超时
})

// 等待多个元素
const result2 = await browser.screenshot({
  file: 'https://example.com',
  waitForSelector: ['#header', '#content', '#footer'],
})
```

### 8. 自定义HTTP头

```typescript
const result = await browser.screenshot({
  file: 'https://api.example.com/render',
  headers: {
    'Authorization': 'Bearer token123',
    'User-Agent': 'CustomBot/1.0',
  },
})
```

### 9. 截图重试

```typescript
const result = await browser.screenshot({
  file: 'https://example.com',
  retry: 3,  // 失败时重试3次
})
```

### 10. 保存到文件

```typescript
const result = await browser.screenshot({
  file: 'https://example.com',
  path: './output/screenshot.png',  // 保存路径
})
```

## 高级配置示例

### 1. 使用不同的浏览器引擎

```typescript
// Chromium
const browserChrome = await launch({
  downloadBrowser: 'chromium',
})

// Firefox
const browserFF = await launch({
  downloadBrowser: 'firefox',
})

// WebKit (Safari)
const browserWK = await launch({
  downloadBrowser: 'webkit',
})
```

### 2. 配置浏览器参数

```typescript
const browser = await launch({
  headless: true,
  args: [
    '--disable-gpu',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
  ],
  maxPages: 20,  // 最多20个并发页面
  idleTime: 1000,  // 网络空闲1秒后继续
})
```

### 3. 使用已安装的浏览器

```typescript
const browser = await launch({
  executablePath: '/usr/bin/chromium-browser',
  headless: true,
})
```

### 4. Debug模式（Windows）

```typescript
const browser = await launch({
  debug: true,  // 浏览器窗口会保持打开
  headless: false,
})
```

### 5. 自定义日志

```typescript
const browser = await launch({
  logger: (level, ...args) => {
    console.log(`[${level.toUpperCase()}]`, ...args)
  },
})
```

### 6. 热更新配置

```typescript
const browser = await launch({
  hmr: true,  // 允许热更新
})

// 稍后更新配置
await browser.hmrConfig({
  maxPages: 30,
  idleTime: 2000,
})
```

## 在Karin中使用

插件会自动注册到Karin的渲染系统中，你可以直接使用Karin的render API：

```typescript
import { render } from 'node-karin'

// 使用Karin的render函数
const image = await render.render({
  file: 'https://example.com',
  type: 'png',
  encoding: 'base64',
})
```

## 性能优化建议

### 1. 页面池管理

```typescript
const browser = await launch({
  maxPages: 15,  // 根据服务器资源调整
})
```

### 2. 减少网络等待时间

```typescript
const result = await browser.screenshot({
  file: 'https://example.com',
  idleTime: 200,  // 减少空闲等待时间
})
```

### 3. 使用合适的截图格式

```typescript
// JPEG 更小，适合照片
const result = await browser.screenshot({
  file: 'https://example.com',
  type: 'jpeg',
  quality: 85,  // 降低质量减少大小
})

// PNG 无损，适合图表
const result2 = await browser.screenshot({
  file: 'https://example.com',
  type: 'png',
})
```

## 错误处理

```typescript
const browser = await launch({ headless: true })

try {
  const result = await browser.screenshot({
    file: 'https://example.com',
    retry: 3,
  })

  if (result.status) {
    console.log('截图成功')
  } else {
    console.error('截图失败:', result.data)
  }
} catch (error) {
  console.error('发生错误:', error)
} finally {
  await browser.close()
}
```

## 常见问题

### 1. 内存占用过高

减少 `maxPages` 参数：

```typescript
const browser = await launch({
  maxPages: 5,  // 减少并发数
})
```

### 2. 截图超时

增加 `timeout` 参数：

```typescript
const result = await browser.screenshot({
  file: 'https://slow-site.com',
  timeout: 60000,  // 60秒
})
```

### 3. 元素未加载

使用 `waitForSelector`：

```typescript
const result = await browser.screenshot({
  file: 'https://example.com',
  waitForSelector: '#dynamic-content',
})
```
