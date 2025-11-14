# Obsidian Read Later

一个强大的浏览器插件，使用 AI 智能提取网页内容、生成摘要，并保存为格式化的 Markdown 文档到 Obsidian 笔记库。支持多种 LLM 提供商，包括本地运行的模型。

## ✨ 功能特性

- 📖 **智能内容提取** - 使用 Mozilla Readability 算法精准提取网页正文，自动过滤广告和无关内容
- 🤖 **AI 摘要生成** - 支持 OpenAI GPT、Anthropic Claude 和本地 LLM（Ollama、LM Studio 等）
- 🖼️ **智能图片筛选** - 自动识别并保存重要图片，过滤装饰性图片和广告
- 👁️ **预览与编辑** - 保存前在侧边栏预览和编辑生成的内容
- 📝 **Obsidian 格式** - 生成包含 frontmatter 元数据的标准 Markdown 文档
- 🔒 **隐私保护** - 支持本地 LLM，数据不离开你的设备
- ⚡ **快速操作** - 一键保存，自动处理，无需手动复制粘贴

## 📦 安装步骤

### 方式一：从源码安装（推荐开发者）

1. **克隆或下载项目**
   ```bash
   git clone https://github.com/fuwei/obsidian-read-later.git
   cd obsidian-read-later
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **生成图标（可选）**
   
   如果需要自定义图标，可以运行：
   ```bash
   node generate-icons.js
   ```
   或者使用 Python 版本：
   ```bash
   python generate-icons.py
   ```

4. **在 Chrome 中加载插件**
   - 打开 Chrome 浏览器
   - 访问 `chrome://extensions/`
   - 在右上角启用"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目根目录
   - 插件图标会出现在浏览器工具栏

### 方式二：从 Chrome Web Store 安装（即将推出）

插件正在准备发布到 Chrome Web Store，届时可以直接安装。

## ⚙️ 配置说明

首次使用前，点击插件图标打开配置界面：

### 基础配置

1. **Obsidian Vault 路径** (必需)
   - 你的 Obsidian 笔记库的完整路径
   - 示例：
     - macOS: `/Users/username/Documents/MyVault`
     - Windows: `C:\Users\username\Documents\MyVault`
     - Linux: `/home/username/Documents/MyVault`

2. **保存文件夹** (可选)
   - 文章保存的目标文件夹，相对于 vault 根目录
   - 默认值：`ReadLater`
   - 示例：`Articles/ReadLater` 或 `Inbox`

### LLM 配置

选择以下三种 API 提供商之一：

#### 选项 1: OpenAI

1. 选择 **OpenAI** 作为 API 提供商
2. 输入你的 OpenAI API Key（从 [platform.openai.com](https://platform.openai.com/api-keys) 获取）
3. （可选）自定义模型名称，默认使用 `gpt-3.5-turbo`

#### 选项 2: Anthropic Claude

1. 选择 **Claude** 作为 API 提供商
2. 输入你的 Anthropic API Key（从 [console.anthropic.com](https://console.anthropic.com/) 获取）
3. （可选）自定义模型名称，默认使用 `claude-3-haiku-20240307`

#### 选项 3: 本地 LLM 或兼容服务

支持任何兼容 OpenAI API 格式的服务，包括：

**Ollama 配置示例**

1. 安装并启动 Ollama（访问 [ollama.ai](https://ollama.ai)）
2. 下载模型：
   ```bash
   ollama pull llama3.2
   # 或其他中文友好的模型
   ollama pull qwen2.5
   ```
3. 在插件中配置：
   - API 提供商：选择 **OpenAI Compatible**
   - 自定义 API 端点：`http://localhost:11434/v1/chat/completions`
   - 模型名称：`llama3.2` 或 `qwen2.5`
   - API Key：留空（Ollama 不需要）

**LM Studio 配置示例**

1. 下载并启动 LM Studio（访问 [lmstudio.ai](https://lmstudio.ai)）
2. 加载一个模型并启动本地服务器
3. 在插件中配置：
   - API 提供商：选择 **OpenAI Compatible**
   - 自定义 API 端点：`http://localhost:1234/v1/chat/completions`
   - 模型名称：根据 LM Studio 中加载的模型填写
   - API Key：留空

**其他兼容服务**

支持 vLLM、LocalAI、text-generation-webui 等任何提供 OpenAI 兼容接口的服务。

### 预览设置

- **启用预览** - 勾选后，保存前会在侧边栏显示预览界面，允许你编辑内容
- 不勾选则直接保存，适合快速批量保存

## 🚀 使用方法

### 基本使用流程

1. **浏览网页** - 打开你想保存的文章或网页
2. **点击插件图标** - 在浏览器工具栏点击 Obsidian Read Later 图标
3. **保存页面** - 点击"保存当前页面"按钮
4. **等待处理** - 插件会显示处理进度：
   - 正在提取内容...
   - 正在生成摘要...
   - 保存成功！
5. **查看文件** - 文件会自动下载到配置的 Obsidian vault 文件夹

### 使用预览模式

如果启用了预览功能：

1. 点击"保存当前页面"后，侧边栏会自动打开
2. 在预览界面中：
   - 查看生成的 Markdown 内容
   - 切换"渲染视图"和"源码编辑"模式
   - 直接编辑内容（修改标题、摘要、正文等）
   - 查看字符统计
3. 确认无误后点击"保存到 Obsidian"
4. 或点击"取消"放弃保存

### 最佳实践

- **配置浏览器下载设置** - 将 Chrome 下载位置设置为你的 Obsidian vault 路径，避免手动移动文件
- **使用本地 LLM** - 如果经常使用，推荐配置 Ollama 等本地模型，节省 API 费用且响应更快
- **启用预览** - 首次使用时建议启用预览，确认生成质量后可关闭以提高效率
- **整理文件夹** - 在 Obsidian 中创建专门的文件夹（如 `ReadLater`、`Articles`）来组织保存的内容
- **定期清理** - 及时阅读和整理保存的文章，避免积压

## 📁 项目结构

```
obsidian-read-later/
├── manifest.json              # Chrome 插件配置文件（Manifest V3）
├── background.js              # 后台 Service Worker，处理核心逻辑
├── content.js                 # 内容脚本，注入网页提取内容
├── popup/                     # 弹出界面（配置和快速操作）
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── sidepanel/                 # 侧边栏界面（预览和编辑）
│   ├── sidepanel.html
│   ├── sidepanel.css
│   └── sidepanel.js
├── services/                  # 核心服务模块
│   ├── llm-service.js        # LLM API 调用服务
│   ├── markdown-generator.js # Markdown 文档生成器
│   ├── storage-manager.js    # 配置存储管理
│   └── error-handler.js      # 错误处理
├── libs/                      # 第三方库
│   ├── Readability.js        # Mozilla 内容提取库
│   └── marked.min.js         # Markdown 渲染库
├── icons/                     # 插件图标
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── __tests__/                 # 测试文件
│   ├── content-extractor.test.js
│   ├── llm-service.test.js
│   ├── markdown-generator.test.js
│   └── e2e.test.js
└── package.json               # 项目配置和依赖
```

## 🎯 生成的 Markdown 格式

插件会生成包含完整元数据的 Markdown 文档：

```markdown
---
title: 文章标题
url: https://example.com/article
author: 作者名称
saved: 2024-01-15T10:30:00.000Z
tags: [read-later]
---

# 文章标题

> 原文链接: [https://example.com/article](https://example.com/article)
> 保存时间: 2024-01-15 10:30:00

## AI 摘要

这里是 AI 生成的文章摘要，包含主要观点、关键信息和重要结论...

## 原文内容

文章的完整正文内容...

## 相关图片

![图片描述](https://example.com/image1.jpg)

![图片描述](https://example.com/image2.jpg)
```

## ❓ 常见问题解答（FAQ）

### 安装和配置

**Q: 插件需要什么浏览器版本？**

A: 需要 Chrome 114 或更高版本，或基于 Chromium 的浏览器（如 Edge、Brave）。插件使用 Manifest V3 和 Side Panel API。

**Q: 为什么文件没有直接保存到 Obsidian vault？**

A: 由于浏览器安全限制，插件无法直接写入文件系统。文件会通过浏览器下载 API 保存。建议将浏览器下载位置设置为你的 vault 路径。

**Q: 如何设置浏览器自动下载到 Obsidian vault？**

A: 在 Chrome 设置中：
1. 访问 `chrome://settings/downloads`
2. 设置下载位置为你的 Obsidian vault 路径（如 `/Users/username/Documents/MyVault/ReadLater`）
3. 关闭"下载前询问每个文件的保存位置"

### LLM 配置

**Q: 我没有 OpenAI 或 Claude API Key，可以使用吗？**

A: 可以！插件支持本地 LLM。推荐使用 Ollama（免费、开源、易用）：
1. 安装 Ollama
2. 运行 `ollama pull qwen2.5`（推荐中文模型）
3. 在插件中配置本地端点

**Q: 使用本地 LLM 的优势是什么？**

A: 
- 完全免费，无 API 调用费用
- 隐私保护，数据不离开本地
- 无网络依赖，离线可用
- 响应速度快（取决于硬件）

**Q: 推荐哪些本地模型？**

A: 对于中文内容：
- `qwen2.5:7b` - 阿里通义千问，中文效果好
- `llama3.2:3b` - Meta Llama，速度快
- `gemma2:9b` - Google Gemma，质量高

**Q: 本地 LLM 需要什么硬件配置？**

A: 
- 最低：8GB RAM，可运行 3B 参数模型
- 推荐：16GB RAM，可运行 7B 参数模型
- 理想：32GB RAM + GPU，可运行更大模型

### 使用问题

**Q: 为什么有些网页无法提取内容？**

A: 可能的原因：
- 网页使用动态加载（JavaScript 渲染）
- 网页结构特殊，Readability 无法识别
- 网页有反爬虫机制

建议：等待页面完全加载后再保存，或尝试阅读模式。

**Q: AI 摘要质量不好怎么办？**

A: 
- 启用预览模式，保存前手动编辑
- 尝试更换模型（如从 GPT-3.5 升级到 GPT-4）
- 使用更大参数的本地模型
- 未来版本将支持自定义 prompt

**Q: 图片为什么是链接而不是本地文件？**

A: 当前版本保存图片 URL。图片本地化功能在开发计划中（任务 10）。

**Q: 可以批量保存多个标签页吗？**

A: 当前版本不支持，但批量保存功能在开发计划中（任务 12）。

**Q: 生成的文件名太长或包含特殊字符？**

A: 插件会自动处理：
- 移除特殊字符（`/\:*?"<>|`）
- 限制文件名长度为 100 字符
- 使用时间戳避免重名

### 错误处理

**Q: 显示"无法连接到本地 LLM 服务"？**

A: 检查：
1. Ollama/LM Studio 是否正在运行
2. 端点 URL 是否正确（注意端口号）
3. 防火墙是否阻止了本地连接

**Q: 显示"API 调用失败"？**

A: 检查：
1. API Key 是否正确
2. 账户是否有余额（OpenAI/Claude）
3. 网络连接是否正常
4. 是否超过了 API 速率限制

**Q: 显示"请先配置 XXX"？**

A: 确保已配置所有必需项：
- Obsidian Vault 路径
- API 提供商和相关配置（API Key 或自定义端点）

## 🔧 开发和测试

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test -- content-extractor.test.js

# 运行端到端测试
npm test -- e2e.test.js
```

### 代码检查

```bash
npm run lint
```

### 调试技巧

1. **查看控制台日志**
   - 右键点击插件图标 → 检查弹出窗口
   - 在 `chrome://extensions/` 中点击"Service Worker"查看后台日志

2. **调试 Content Script**
   - 在网页上按 F12 打开开发者工具
   - 在 Console 中可以看到 content.js 的日志

3. **测试 LLM 连接**
   - 使用项目中的测试脚本：
     ```bash
     node test-ollama.js
     ```

## 🛣️ 开发路线图

### 已完成 ✅
- 核心功能：内容提取、LLM 摘要、Markdown 生成
- 多 LLM 支持：OpenAI、Claude、本地模型
- 预览和编辑功能
- 完整的测试覆盖

### 进行中 🚧
- 性能优化（Side Panel 渲染、响应时间）
- 文档完善（配置指南、故障排除）
- Chrome Web Store 发布准备

### 计划中 📋
- 图片本地化存储（下载到 Obsidian 附件文件夹）
- 标签自动提取（使用 LLM 提取关键词）
- 批量保存功能（保存多个标签页）
- 自定义 Prompt 模板
- Obsidian Local REST API 集成
- Firefox 和 Safari 版本

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔒 隐私政策

本插件非常重视用户隐私。我们不收集、不存储、不传输任何用户数据到我们的服务器。所有数据处理都在您的本地设备上完成。

详细信息请查看 [隐私政策文档](PRIVACY.md)。

## 🙏 致谢

- [Mozilla Readability](https://github.com/mozilla/readability) - 内容提取算法
- [Marked](https://marked.js.org/) - Markdown 渲染
- [Ollama](https://ollama.ai) - 本地 LLM 运行时

## 📞 支持

如果遇到问题：
1. 查看本文档的 FAQ 部分
2. 查看 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)（即将推出）
3. 提交 Issue 到 GitHub

---

**享受智能的网页保存体验！** 📚✨
