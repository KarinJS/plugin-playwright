# 安装指南

## 快速开始

### 1. 安装插件

```bash
pnpm add @karinjs/plugin-playwright
```

### 2. 安装浏览器

Playwright 会在首次运行时自动下载浏览器。你也可以手动安装：

```bash
# 安装所有浏览器
npx playwright install

# 只安装 Chromium
npx playwright install chromium

# 只安装 Firefox
npx playwright install firefox

# 只安装 WebKit
npx playwright install webkit
```

### 3. 安装浏览器依赖（Linux）

在 Linux 上，可能需要安装额外的系统依赖：

```bash
# Ubuntu/Debian
npx playwright install-deps

# 或手动安装
sudo apt-get install -y \
  libnss3 \
  libnspr4 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libasound2
```

## 环境配置

### Node.js 版本

确保安装了 Node.js 18 或更高版本：

```bash
node --version
# 应该显示 v18.x.x 或更高
```

### pnpm 版本

确保安装了 pnpm 9 或更高版本：

```bash
pnpm --version
# 应该显示 9.x.x 或更高
```

如果没有安装 pnpm：

```bash
npm install -g pnpm@9
```

## 使用已安装的浏览器

如果你已经安装了 Chrome/Chromium，可以配置插件使用现有的浏览器：

### 1. 找到浏览器路径

```bash
# Linux
which chromium-browser
which google-chrome

# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome

# Windows
C:\Program Files\Google\Chrome\Application\chrome.exe
```

### 2. 配置路径

在 Karin 配置文件中设置 `executablePath`：

```json
{
  "executablePath": "/usr/bin/chromium-browser",
  "headless": true
}
```

或通过环境变量：

```bash
export PLAYWRIGHT_BROWSERS_PATH=/path/to/browsers
```

## Docker 环境

### Dockerfile 示例

```dockerfile
FROM node:18-slim

# 安装 Playwright 依赖
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# 安装 pnpm
RUN npm install -g pnpm@9

# 复制应用
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# 安装 Playwright 浏览器
RUN npx playwright install chromium

COPY . .

CMD ["node", "dist/index.js"]
```

### docker-compose.yml 示例

```yaml
version: '3.8'
services:
  karin:
    build: .
    environment:
      - NODE_ENV=production
      - PLAYWRIGHT_BROWSERS_PATH=/app/.cache/ms-playwright
    volumes:
      - playwright-cache:/app/.cache/ms-playwright
    shm_size: 2gb  # 增加共享内存，避免浏览器崩溃

volumes:
  playwright-cache:
```

## 开发环境配置

### 1. 克隆仓库

```bash
git clone https://github.com/KarinJS/plugin-playwright.git
cd plugin-playwright
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 构建

```bash
pnpm build
```

### 4. 开发模式

```bash
pnpm dev
```

## 生产环境优化

### 1. 减少浏览器下载时间

预先下载浏览器到镜像中：

```bash
npx playwright install chromium
```

### 2. 配置缓存目录

```bash
export PLAYWRIGHT_BROWSERS_PATH=/data/playwright-browsers
```

### 3. 使用 headless shell（Linux）

Chromium headless shell 更小更快：

```json
{
  "downloadBrowser": "chromium",
  "headless": true
}
```

### 4. 资源限制

```json
{
  "maxPages": 10,
  "args": [
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--no-sandbox"
  ]
}
```

## 故障排除

### 浏览器下载失败

1. 检查网络连接
2. 使用镜像源（中国用户）：

```bash
export PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright/
```

### 权限问题

在 Linux 上运行时可能需要：

```bash
# 添加 --no-sandbox 参数
{
  "args": ["--no-sandbox", "--disable-setuid-sandbox"]
}
```

### 内存不足

```bash
# 增加 Docker 容器的共享内存
docker run --shm-size=2g ...

# 或在 docker-compose.yml 中
shm_size: 2gb
```

### 字体问题（中文乱码）

```bash
# Ubuntu/Debian
sudo apt-get install -y fonts-wqy-zenhei fonts-wqy-microhei

# CentOS/RHEL
sudo yum install -y wqy-zenhei-fonts wqy-microhei-fonts
```

## 性能监控

### 1. 启用日志

```typescript
const browser = await launch({
  logger: (level, ...args) => {
    console.log(`[${level}]`, ...args)
  },
})
```

### 2. 监控内存使用

```bash
# 使用 htop 或 top 监控
htop

# 或使用 Node.js 内置工具
node --trace-gc app.js
```

### 3. 调整并发数

根据服务器资源调整 `maxPages`：

- 2GB RAM: maxPages = 3-5
- 4GB RAM: maxPages = 8-10
- 8GB RAM: maxPages = 15-20

## 更新

### 更新插件

```bash
pnpm update @karinjs/plugin-playwright
```

### 更新浏览器

```bash
npx playwright install chromium
```

## 卸载

```bash
# 卸载插件
pnpm remove @karinjs/plugin-playwright

# 清理浏览器缓存
rm -rf ~/.cache/ms-playwright
```
