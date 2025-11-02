# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-11-02

### Added
- Initial release of @karinjs/plugin-playwright
- Playwright browser integration (Chromium, Firefox, WebKit support)
- Screenshot functionality with multiple options
- Page pool management for concurrent screenshots
- Configuration management with hot-reload support
- Web UI configuration interface
- TypeScript type definitions with TSDoc comments in Chinese
- Support for various input types (URL, HTML file, HTML string)
- Element selector screenshot support
- Full page screenshot support
- Multi-page (paginated) screenshot support
- Viewport customization
- Network idle waiting
- Selector and function waiting
- Custom HTTP headers support
- Base64 and binary encoding support
- Retry mechanism for failed screenshots
- Comprehensive documentation and examples

### Features
- ✨ Multi-browser engine support (Chromium, Firefox, WebKit)
- 🚀 High-performance page pool with concurrent screenshot support
- 🎯 Flexible screenshot options (full page, element, paginated)
- 🔧 Complete configuration management with hot-reload
- 📝 Full TypeScript type definitions
- 🎨 Web UI configuration interface
- 📦 Built with tsdown for zero-config bundling

### Technical Details
- Node.js >= 18.0.0 required
- pnpm >= 9.0.0 required
- ESM module support
- Built with TypeScript
- Packaged with tsdown
- Based on Playwright API
