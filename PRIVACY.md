# 隐私政策 / Privacy Policy

**最后更新日期 / Last Updated**: 2024-11-14  
**版本 / Version**: 1.0.0

## 简体中文

### 概述

Obsidian Read Later 是一个浏览器插件，旨在帮助用户保存网页内容到本地 Obsidian 笔记库。我们非常重视您的隐私，本文档详细说明了插件如何处理您的数据。

### 核心隐私承诺

**我们不收集、不存储、不传输任何用户数据到我们的服务器。**

本插件完全在您的本地设备上运行，所有数据处理都在您的浏览器和本地文件系统中完成。

### 数据收集和使用

#### 我们不收集的数据

- ❌ 个人身份信息
- ❌ 浏览历史
- ❌ 保存的网页内容
- ❌ 使用统计数据
- ❌ 分析数据
- ❌ Cookie 或追踪信息
- ❌ 设备信息
- ❌ IP 地址

#### 本地存储的数据

插件仅在您的浏览器本地存储以下配置信息：

1. **Obsidian Vault 路径**: 您的笔记库保存位置
2. **保存文件夹**: 文件保存的目标文件夹名称
3. **API 配置**: 
   - API 提供商选择（OpenAI、Claude 或自定义）
   - API Key（如果您选择使用云端 LLM 服务）
   - 自定义 API 端点 URL（如果使用本地 LLM）
   - 模型名称
4. **用户偏好设置**: 
   - 是否启用预览模式

这些数据通过 Chrome Storage API 存储在您的浏览器中，仅供插件功能使用。

### 第三方服务

#### LLM API 调用

当您使用本插件生成内容摘要时，插件会根据您的配置调用 LLM API：

1. **OpenAI API** (api.openai.com)
   - 如果您选择 OpenAI 作为提供商
   - 发送：网页内容（标题和正文摘录）
   - 接收：AI 生成的摘要
   - 数据处理：遵循 OpenAI 隐私政策

2. **Anthropic Claude API** (api.anthropic.com)
   - 如果您选择 Claude 作为提供商
   - 发送：网页内容（标题和正文摘录）
   - 接收：AI 生成的摘要
   - 数据处理：遵循 Anthropic 隐私政策

3. **自定义/本地 LLM**
   - 如果您使用本地 LLM（如 Ollama、LM Studio）
   - 数据完全在您的本地网络中处理
   - 不会发送到互联网

**重要说明**：
- 我们不控制第三方 API 提供商的数据处理方式
- 发送到 LLM API 的内容仅限于您选择保存的网页内容
- 建议查阅相应 API 提供商的隐私政策
- 使用本地 LLM 可以完全避免数据离开您的设备

### 浏览器权限说明

本插件请求以下浏览器权限，每个权限的用途如下：

#### 1. `activeTab` - 活动标签页访问
**用途**: 读取当前打开的网页内容  
**数据访问**: 仅在您点击"保存当前页面"时访问当前标签页  
**数据处理**: 提取网页标题、正文和图片，不会发送到我们的服务器

#### 2. `storage` - 本地存储
**用途**: 保存您的配置设置  
**数据存储**: 
- Vault 路径
- API 配置
- 用户偏好设置
**存储位置**: 浏览器本地存储，可通过 Chrome 同步功能同步到您的其他设备

#### 3. `scripting` - 脚本注入
**用途**: 在网页中注入内容提取脚本  
**执行时机**: 仅在您主动保存页面时执行  
**脚本功能**: 使用 Readability 算法提取网页正文内容

#### 4. `sidePanel` - 侧边栏面板
**用途**: 显示内容预览和编辑界面  
**数据处理**: 在侧边栏中显示生成的 Markdown 内容供您审阅  
**最低版本**: Chrome 114+

#### 5. `downloads` - 文件下载
**用途**: 将生成的 Markdown 文件保存到您的 Obsidian Vault  
**保存位置**: 您在配置中指定的本地文件夹  
**文件内容**: 网页内容和 AI 生成的摘要

#### 6. `<all_urls>` - 所有网站访问
**用途**: 允许在任何网页上使用保存功能  
**访问时机**: 仅在您主动点击保存按钮时  
**数据范围**: 仅访问当前标签页的可见内容

### API Key 安全性

#### 存储方式
- API Key 通过 Chrome Storage API 存储
- 使用浏览器的加密存储机制
- 仅存储在您的本地设备上
- 不会发送到我们的服务器

#### 安全建议
1. **使用专用 API Key**: 为本插件创建单独的 API Key
2. **定期轮换**: 定期更换 API Key
3. **限制权限**: 在 API 提供商处设置适当的使用限制
4. **本地 LLM**: 考虑使用本地 LLM 以避免 API Key 风险

#### 如果 API Key 泄露
1. 立即在 API 提供商处撤销该 Key
2. 在插件设置中更新为新的 API Key
3. 检查 API 使用记录是否有异常

### 数据传输

#### 网络请求
本插件仅发起以下网络请求：

1. **LLM API 调用**
   - 目标：您配置的 API 端点
   - 内容：网页内容摘录
   - 加密：使用 HTTPS 加密传输
   - 频率：仅在您保存页面时

2. **本地 LLM 调用**（如果使用）
   - 目标：localhost 或本地网络地址
   - 内容：网页内容摘录
   - 传输：不离开本地网络

#### 不会发起的请求
- ❌ 分析和追踪请求
- ❌ 广告网络请求
- ❌ 数据收集请求
- ❌ 自动更新检查（由浏览器商店管理）

### 数据保留

- **配置数据**: 保留在浏览器本地存储中，直到您卸载插件或清除浏览器数据
- **网页内容**: 不保留，仅在处理过程中临时使用
- **生成的文件**: 保存在您的本地 Obsidian Vault 中，由您完全控制

### 用户权利

您拥有以下权利：

1. **访问权**: 通过插件设置查看所有存储的配置
2. **修改权**: 随时修改或删除配置信息
3. **删除权**: 卸载插件将删除所有本地存储的数据
4. **导出权**: 配置数据可通过浏览器工具导出

### 儿童隐私

本插件不针对 13 岁以下儿童，也不会故意收集儿童的个人信息。

### 隐私政策变更

如果我们更新隐私政策，将：
1. 更新本文档的"最后更新日期"
2. 在插件更新说明中注明重大变更
3. 在 Chrome Web Store 的插件页面上发布通知

### 开源透明

本插件是开源项目，您可以：
- 查看完整源代码
- 审计数据处理逻辑
- 提交问题和改进建议
- 自行构建和使用

**源代码仓库**: https://github.com/fuwei/obsidian-read-later

### 联系我们

如果您对隐私政策有任何疑问或担忧，请通过以下方式联系：

- **GitHub Issues**: https://github.com/fuwei/obsidian-read-later/issues
- **Email**: buffuwei@gmail.com

---

## English

### Overview

Obsidian Read Later is a browser extension designed to help users save web content to their local Obsidian vault. We take your privacy seriously, and this document explains how the extension handles your data.

### Core Privacy Commitment

**We do not collect, store, or transmit any user data to our servers.**

This extension runs entirely on your local device. All data processing occurs within your browser and local file system.

### Data Collection and Usage

#### Data We Do NOT Collect

- ❌ Personal identification information
- ❌ Browsing history
- ❌ Saved web content
- ❌ Usage statistics
- ❌ Analytics data
- ❌ Cookies or tracking information
- ❌ Device information
- ❌ IP addresses

#### Data Stored Locally

The extension only stores the following configuration information locally in your browser:

1. **Obsidian Vault Path**: Location of your notes vault
2. **Save Folder**: Target folder name for saved files
3. **API Configuration**:
   - API provider selection (OpenAI, Claude, or Custom)
   - API Key (if using cloud LLM services)
   - Custom API endpoint URL (if using local LLM)
   - Model name
4. **User Preferences**:
   - Preview mode enabled/disabled

This data is stored via Chrome Storage API in your browser and is used solely for extension functionality.

### Third-Party Services

#### LLM API Calls

When you use this extension to generate content summaries, it calls LLM APIs based on your configuration:

1. **OpenAI API** (api.openai.com)
   - If you select OpenAI as provider
   - Sends: Web content (title and text excerpt)
   - Receives: AI-generated summary
   - Data processing: Subject to OpenAI's privacy policy

2. **Anthropic Claude API** (api.anthropic.com)
   - If you select Claude as provider
   - Sends: Web content (title and text excerpt)
   - Receives: AI-generated summary
   - Data processing: Subject to Anthropic's privacy policy

3. **Custom/Local LLM**
   - If you use local LLM (e.g., Ollama, LM Studio)
   - Data processed entirely within your local network
   - No data sent to the internet

**Important Notes**:
- We do not control how third-party API providers process data
- Content sent to LLM APIs is limited to web pages you choose to save
- We recommend reviewing the privacy policies of your chosen API provider
- Using local LLM keeps all data on your device

### Browser Permissions Explained

This extension requests the following browser permissions:

#### 1. `activeTab` - Active Tab Access
**Purpose**: Read content from the currently open web page  
**Data Access**: Only accesses current tab when you click "Save Current Page"  
**Data Processing**: Extracts page title, content, and images; not sent to our servers

#### 2. `storage` - Local Storage
**Purpose**: Save your configuration settings  
**Data Stored**:
- Vault path
- API configuration
- User preferences
**Storage Location**: Browser local storage, can sync to your other devices via Chrome Sync

#### 3. `scripting` - Script Injection
**Purpose**: Inject content extraction scripts into web pages  
**Execution Timing**: Only when you actively save a page  
**Script Function**: Uses Readability algorithm to extract main content

#### 4. `sidePanel` - Side Panel
**Purpose**: Display content preview and editing interface  
**Data Processing**: Shows generated Markdown content in side panel for review  
**Minimum Version**: Chrome 114+

#### 5. `downloads` - File Downloads
**Purpose**: Save generated Markdown files to your Obsidian Vault  
**Save Location**: Local folder specified in your configuration  
**File Content**: Web content and AI-generated summary

#### 6. `<all_urls>` - All Websites Access
**Purpose**: Allow save functionality on any web page  
**Access Timing**: Only when you actively click the save button  
**Data Scope**: Only accesses visible content of current tab

### API Key Security

#### Storage Method
- API Keys stored via Chrome Storage API
- Uses browser's encrypted storage mechanism
- Stored only on your local device
- Never sent to our servers

#### Security Recommendations
1. **Use Dedicated API Key**: Create a separate API Key for this extension
2. **Regular Rotation**: Periodically rotate your API Keys
3. **Limit Permissions**: Set appropriate usage limits with your API provider
4. **Local LLM**: Consider using local LLM to avoid API Key risks

#### If API Key is Compromised
1. Immediately revoke the key with your API provider
2. Update to a new API Key in extension settings
3. Check API usage logs for anomalies

### Data Transmission

#### Network Requests
This extension only makes the following network requests:

1. **LLM API Calls**
   - Target: Your configured API endpoint
   - Content: Web content excerpt
   - Encryption: HTTPS encrypted transmission
   - Frequency: Only when you save a page

2. **Local LLM Calls** (if used)
   - Target: localhost or local network address
   - Content: Web content excerpt
   - Transmission: Does not leave local network

#### Requests NOT Made
- ❌ Analytics and tracking requests
- ❌ Ad network requests
- ❌ Data collection requests
- ❌ Automatic update checks (managed by browser store)

### Data Retention

- **Configuration Data**: Retained in browser local storage until you uninstall the extension or clear browser data
- **Web Content**: Not retained; only used temporarily during processing
- **Generated Files**: Saved in your local Obsidian Vault, fully under your control

### User Rights

You have the following rights:

1. **Access**: View all stored configuration through extension settings
2. **Modification**: Modify or delete configuration information at any time
3. **Deletion**: Uninstalling the extension removes all locally stored data
4. **Export**: Configuration data can be exported via browser tools

### Children's Privacy

This extension is not directed at children under 13 and does not knowingly collect personal information from children.

### Privacy Policy Changes

If we update this privacy policy, we will:
1. Update the "Last Updated" date in this document
2. Note significant changes in extension update notes
3. Post notice on the Chrome Web Store extension page

### Open Source Transparency

This extension is an open-source project. You can:
- View complete source code
- Audit data processing logic
- Submit issues and improvement suggestions
- Build and use it yourself

**Source Code Repository**: https://github.com/fuwei/obsidian-read-later

### Contact Us

If you have any questions or concerns about this privacy policy, please contact us:

- **GitHub Issues**: https://github.com/fuwei/obsidian-read-later/issues
- **Email**: buffuwei@gmail.com

---

## 合规声明 / Compliance Statement

本插件遵守以下隐私法规：
- GDPR (General Data Protection Regulation)
- CCPA (California Consumer Privacy Act)
- Chrome Web Store 开发者政策

This extension complies with:
- GDPR (General Data Protection Regulation)
- CCPA (California Consumer Privacy Act)
- Chrome Web Store Developer Policies
