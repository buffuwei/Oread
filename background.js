/**
 * Background Service Worker
 * 负责消息路由、内容提取协调、LLM 调用和文件保存
 */

// 导入服务（注意：Service Worker 中需要使用 importScripts）
importScripts('services/storage-manager.js');
importScripts('services/llm-service.js');
importScripts('services/markdown-generator.js');
importScripts('services/error-handler.js');
importScripts('services/image-downloader.js');

/**
 * Background Controller
 */
class BackgroundController {
  constructor() {
    this.currentTabId = null;
    this.currentContent = null;
    this.currentMarkdown = null;
    this.imageMapping = null;
  }

  /**
   * 处理保存文章请求
   * @param {number} tabId - 标签页 ID
   */
  async handleSaveArticle(tabId) {
    try {
      console.log('[Background] 开始处理保存文章请求, tabId:', tabId);
      this.currentTabId = tabId;
      
      // 1. 提取内容
      console.log('[Background] 步骤1: 开始提取内容');
      this.sendStatusUpdate('extracting', '正在提取内容...');
      const content = await this.extractContent(tabId);
      console.log('[Background] 步骤1: 内容提取成功', { title: content.title, contentLength: content.content?.length });
      this.currentContent = content;
      
      // 获取配置
      console.log('[Background] 获取配置');
      const config = await StorageManager.getConfig();
      console.log('[Background] 配置获取成功', { activeLlmId: config.activeLlmId, enablePreview: config.enablePreview });
      
      // 2. 生成摘要
      console.log('[Background] 步骤2: 开始生成摘要');
      this.sendStatusUpdate('summarizing', '正在生成摘要...');
      const summary = await this.generateSummary(content);
      console.log('[Background] 步骤2: 摘要生成成功', { summaryLength: summary?.length });
      
      // 3. 提取标签（如果启用）
      let tags = null;
      if (config.enableTagExtraction) {
        console.log('[Background] 步骤3: 开始提取标签');
        this.sendStatusUpdate('summarizing', '正在提取标签...');
        tags = await this.extractTags(content, config.maxTags || 5);
        console.log('[Background] 步骤3: 标签提取完成', { tags });
      } else {
        console.log('[Background] 步骤3: 跳过标签提取（未启用）');
      }
      
      // 4. 检查是否需要下载图片
      let imageMapping = null;
      
      if (config.localizeImages && content.images && content.images.length > 0) {
        console.log('[Background] 步骤4: 开始下载图片', { imageCount: content.images.length });
        this.sendStatusUpdate('summarizing', '正在下载图片...');
        imageMapping = await this.downloadImages(content, config);
        console.log('[Background] 步骤4: 图片下载完成', { mappingCount: imageMapping ? Object.keys(imageMapping).length : 0 });
        this.imageMapping = imageMapping;
      } else {
        console.log('[Background] 步骤4: 跳过图片下载', { localizeImages: config.localizeImages, imageCount: content.images?.length });
      }
      
      // 5. 生成 Markdown
      console.log('[Background] 步骤5: 开始生成 Markdown');
      const markdown = await this.generateMarkdown(content, summary, imageMapping, tags);
      console.log('[Background] 步骤5: Markdown 生成成功', { markdownLength: markdown?.length });
      this.currentMarkdown = markdown;
      
      // 6. 检查预览设置
      if (config.enablePreview) {
        console.log('[Background] 步骤6: 打开预览模式');
        // 打开 Side Panel 显示预览
        await this.showPreview(markdown, content);
      } else {
        console.log('[Background] 步骤6: 直接保存文件');
        // 直接保存
        await this.saveFile(markdown, content.title);
        this.sendStatusUpdate('success', '保存成功！');
        console.log('[Background] 文章保存完成');
      }
    } catch (error) {
      console.error('[Background] 处理保存文章时发生错误:', error);
      console.error('[Background] 错误堆栈:', error.stack);
      const errorInfo = ErrorHandler.handle(error, 'handleSaveArticle');
      this.sendStatusUpdate('error', errorInfo.message);
    }
  }

  /**
   * 提取内容
   * @param {number} tabId - 标签页 ID
   * @returns {Promise<Object>} 提取的内容
   */
  async extractContent(tabId) {
    console.log('[Background] extractContent: 发送消息到 content script, tabId:', tabId);
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, { action: 'extractContent' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[Background] extractContent: chrome.runtime.lastError:', chrome.runtime.lastError);
          reject(new Error('无法连接到页面，请刷新后重试'));
          return;
        }
        
        console.log('[Background] extractContent: 收到响应', response);
        
        if (response && response.success) {
          console.log('[Background] extractContent: 内容提取成功');
          resolve(response.data);
        } else {
          console.error('[Background] extractContent: 内容提取失败', response);
          reject(new Error(response?.error || '内容提取失败'));
        }
      });
    });
  }

  /**
   * 生成摘要
   * @param {Object} content - 页面内容
   * @returns {Promise<string>} 摘要文本
   */
  async generateSummary(content) {
    try {
      console.log('[Background] generateSummary: 开始生成摘要');
      
      // 获取配置
      const config = await StorageManager.getConfig();
      console.log('[Background] generateSummary: 配置获取成功', { activeLlmId: config.activeLlmId });
      
      // 创建 LLM 服务实例（使用新的 fromConfig 方法）
      console.log('[Background] generateSummary: 创建 LLM 服务实例');
      const llmService = LLMService.fromConfig(config);
      console.log('[Background] generateSummary: LLM 服务实例创建成功');
      
      // 生成摘要
      console.log('[Background] generateSummary: 调用 LLM 生成摘要');
      const summary = await llmService.generateSummary(content);
      console.log('[Background] generateSummary: 摘要生成成功', { summaryLength: summary?.length });
      
      return summary;
    } catch (error) {
      console.error('[Background] generateSummary: 生成摘要时发生错误:', error);
      console.error('[Background] generateSummary: 错误堆栈:', error.stack);
      const errorInfo = ErrorHandler.handle(error, 'generateSummary');
      throw new Error(errorInfo.message);
    }
  }

  /**
   * 提取标签
   * @param {Object} content - 页面内容
   * @param {number} maxTags - 最大标签数量
   * @returns {Promise<string[]>} 标签数组
   */
  async extractTags(content, maxTags = 5) {
    try {
      // 获取配置
      const config = await StorageManager.getConfig();
      
      // 创建 LLM 服务实例（使用新的 fromConfig 方法）
      const llmService = LLMService.fromConfig(config);
      
      // 提取标签
      const tags = await llmService.extractTags(content, maxTags);
      
      return tags;
    } catch (error) {
      console.error('标签提取失败:', error);
      // 标签提取失败不应该阻止整个流程，返回空数组
      return [];
    }
  }

  /**
   * 下载图片
   * @param {Object} content - 页面内容
   * @param {Object} config - 配置
   * @returns {Promise<Object>} 图片路径映射 { originalSrc: localPath }
   */
  async downloadImages(content, config) {
    try {
      const downloader = new ImageDownloader();
      const results = await downloader.downloadImages(
        content.images,
        config.savePath,
        config.attachmentFolder || 'attachments',
        content.title
      );
      
      // 构建映射对象
      const mapping = {};
      results.success.forEach(item => {
        mapping[item.originalSrc] = item.localPath;
      });
      
      // 如果有失败的图片，记录日志
      if (results.failed.length > 0) {
        console.warn('部分图片下载失败:', results.failed);
        
        // 可选：通知用户
        const failedCount = results.failed.length;
        const totalCount = content.images.length;
        if (failedCount === totalCount) {
          throw new Error('所有图片下载失败');
        } else if (failedCount > 0) {
          console.log(`${failedCount}/${totalCount} 张图片下载失败，将使用原始 URL`);
        }
      }
      
      return mapping;
    } catch (error) {
      console.error('图片下载失败:', error);
      // 下载失败时返回 null，使用原始 URL
      return null;
    }
  }

  /**
   * 生成 Markdown
   * @param {Object} content - 页面内容
   * @param {string} summary - 摘要
   * @param {Object} imageMapping - 图片路径映射
   * @param {string[]} tags - 提取的标签数组
   * @returns {Promise<string>} Markdown 文本
   */
  async generateMarkdown(content, summary, imageMapping = null, tags = null) {
    try {
      console.log('[Background] generateMarkdown: 开始生成 Markdown');
      const generator = new MarkdownGenerator();
      const markdown = await generator.generate(content, summary, imageMapping, tags);
      console.log('[Background] generateMarkdown: Markdown 生成成功');
      return markdown;
    } catch (error) {
      console.error('[Background] generateMarkdown: 生成 Markdown 时发生错误:', error);
      console.error('[Background] generateMarkdown: 错误堆栈:', error.stack);
      throw error;
    }
  }

  /**
   * 显示预览
   * @param {string} markdown - Markdown 内容
   * @param {Object} content - 页面内容
   */
  async showPreview(markdown, content) {
    try {
      // 打开 Side Panel
      await chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
      
      // 等待一小段时间确保 Side Panel 已加载
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 发送预览数据到 Side Panel
      chrome.runtime.sendMessage({
        action: 'showPreview',
        markdown: markdown,
        metadata: {
          title: content.title,
          url: content.url,
          charCount: markdown.length
        }
      }).catch((error) => {
        console.error('发送预览数据失败:', error);
      });
    } catch (error) {
      console.error('打开 Side Panel 失败:', error);
      
      // 降级处理：直接保存
      this.sendStatusUpdate('error', 'Side Panel 不支持，直接保存');
      await this.saveFile(markdown, content.title);
      this.sendStatusUpdate('success', '保存成功！');
    }
  }

  /**
   * 保存文件
   * @param {string} markdown - Markdown 内容
   * @param {string} title - 文件标题
   */
  async saveFile(markdown, title) {
    try {
      console.log('[Background] saveFile: 开始保存文件', { title, markdownLength: markdown?.length });
      
      // 获取配置
      const config = await StorageManager.getConfig();
      console.log('[Background] saveFile: 配置获取成功', { savePath: config.savePath });
      
      // 验证配置
      if (!config.savePath) {
        throw new Error('请先配置保存路径');
      }
      
      // 生成文件名
      console.log('[Background] saveFile: 生成文件名');
      const generator = new MarkdownGenerator();
      const filename = generator.generateSafeFilename(title);
      console.log('[Background] saveFile: 文件名生成成功', { filename });
      
      // 从 savePath 中提取文件夹名称（用于下载路径）
      // savePath 格式：/Users/xxx/Documents/Obsidian/MyVault/ReadLater
      const pathParts = config.savePath.split('/');
      const saveFolder = pathParts[pathParts.length - 1] || 'ReadLater';
      const savePath = `${saveFolder}/${filename}`;
      console.log('[Background] saveFile: 保存路径', { savePath });
      
      // 创建 Blob
      console.log('[Background] saveFile: 创建 Blob');
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      console.log('[Background] saveFile: Blob URL 创建成功');
      
      // 使用 Chrome Downloads API 下载
      console.log('[Background] saveFile: 开始下载');
      const downloadId = await chrome.downloads.download({
        url: url,
        filename: savePath,
        saveAs: false,
        conflictAction: 'uniquify'
      });
      console.log('[Background] saveFile: 下载已启动', { downloadId });
      
      // 等待下载完成
      console.log('[Background] saveFile: 等待下载完成');
      await this.waitForDownload(downloadId);
      console.log('[Background] saveFile: 下载完成');
      
      // 清理 Blob URL
      URL.revokeObjectURL(url);
      
      console.log('[Background] saveFile: 文件保存成功', { savePath });
    } catch (error) {
      console.error('[Background] saveFile: 保存文件时发生错误:', error);
      console.error('[Background] saveFile: 错误堆栈:', error.stack);
      const errorInfo = ErrorHandler.handle(error, 'saveFile');
      throw new Error(errorInfo.message);
    }
  }

  /**
   * 等待下载完成
   * @param {number} downloadId - 下载 ID
   * @returns {Promise<void>}
   */
  async waitForDownload(downloadId) {
    return new Promise((resolve, reject) => {
      const checkDownload = () => {
        chrome.downloads.search({ id: downloadId }, (results) => {
          if (results.length === 0) {
            reject(new Error('下载未找到'));
            return;
          }
          
          const download = results[0];
          
          if (download.state === 'complete') {
            resolve();
          } else if (download.state === 'interrupted') {
            reject(new Error('下载被中断'));
          } else {
            // 继续等待
            setTimeout(checkDownload, 100);
          }
        });
      };
      
      checkDownload();
    });
  }

  /**
   * 发送状态更新到 Popup
   * @param {string} status - 状态类型
   * @param {string} message - 状态消息
   */
  sendStatusUpdate(status, message) {
    chrome.runtime.sendMessage({
      action: 'statusUpdate',
      status: status,
      message: message
    }).catch(() => {
      // Popup 可能已关闭，忽略错误
    });
  }

  /**
   * 处理确认保存（来自 Side Panel）
   * @param {string} markdown - 编辑后的 Markdown
   */
  async handleConfirmSave(markdown) {
    try {
      if (!this.currentContent) {
        throw new Error('没有待保存的内容');
      }
      
      await this.saveFile(markdown, this.currentContent.title);
      this.sendStatusUpdate('success', '保存成功！');
      
      // 清理状态
      this.currentContent = null;
      this.currentMarkdown = null;
      this.imageMapping = null;
    } catch (error) {
      const errorInfo = ErrorHandler.handle(error, 'handleConfirmSave');
      this.sendStatusUpdate('error', errorInfo.message);
    }
  }

  /**
   * 处理取消保存（来自 Side Panel）
   */
  handleCancelSave() {
    // 清理状态
    this.currentContent = null;
    this.currentMarkdown = null;
    this.imageMapping = null;
    
    this.sendStatusUpdate('error', '已取消保存');
  }
}

// 创建控制器实例
const controller = new BackgroundController();

/**
 * 监听消息
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'saveArticle':
      controller.handleSaveArticle(request.tabId);
      sendResponse({ received: true });
      break;
      
    case 'confirmSave':
      controller.handleConfirmSave(request.markdown);
      sendResponse({ received: true });
      break;
      
    case 'cancelSave':
      controller.handleCancelSave();
      sendResponse({ received: true });
      break;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
  
  return true; // 保持消息通道开启
});

/**
 * 插件安装或更新时的处理
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Obsidian Read Later 已安装');
  } else if (details.reason === 'update') {
    console.log('Obsidian Read Later 已更新到版本', chrome.runtime.getManifest().version);
  }
});
