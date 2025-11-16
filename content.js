/**
 * Content Script - 网页内容提取器
 * 使用 Readability.js 提取网页正文内容
 */

class ContentExtractor {
  /**
   * 提取页面内容
   * @returns {Object} 提取的内容对象
   */
  extractPageContent() {
    try {
      console.log('[Content] extractPageContent: 开始提取页面内容');
      
      // 使用 Readability 解析页面
      console.log('[Content] extractPageContent: 调用 Readability 解析');
      const article = this.parseWithReadability();
      
      if (!article) {
        console.error('[Content] extractPageContent: Readability 解析返回 null');
        throw new Error('无法提取页面内容');
      }
      
      console.log('[Content] extractPageContent: Readability 解析成功', { 
        title: article.title, 
        contentLength: article.textContent?.length 
      });
      
      // 提取图片
      console.log('[Content] extractPageContent: 开始提取图片');
      const images = this.extractImportantImages();
      console.log('[Content] extractPageContent: 图片提取完成', { imageCount: images.length });
      
      // 提取元数据
      console.log('[Content] extractPageContent: 开始提取元数据');
      const metadata = this.extractMetadata();
      console.log('[Content] extractPageContent: 元数据提取完成', metadata);
      
      const result = {
        title: article.title || document.title,
        content: article.textContent || '',
        html: article.content || '',
        url: window.location.href,
        images: images,
        author: metadata.author || '',
        publishDate: metadata.publishDate || '',
        excerpt: article.excerpt || ''
      };
      
      console.log('[Content] extractPageContent: 内容提取完成', {
        title: result.title,
        contentLength: result.content.length,
        imageCount: result.images.length
      });
      
      return result;
    } catch (error) {
      console.error('[Content] extractPageContent: 提取失败', error);
      console.error('[Content] extractPageContent: 错误堆栈', error.stack);
      // 注意：content.js 中无法使用 importScripts，所以直接处理错误
      throw new Error('内容提取失败: ' + error.message);
    }
  }
  
  /**
   * 使用 Readability 解析页面
   * @returns {Object|null} Readability 解析结果
   */
  parseWithReadability() {
    try {
      // 克隆文档以避免修改原始 DOM
      const documentClone = document.cloneNode(true);
      
      // 使用 Readability 解析
      const reader = new Readability(documentClone, {
        charThreshold: 500,
        classesToPreserve: ['highlight', 'code', 'pre']
      });
      
      return reader.parse();
    } catch (error) {
      console.error('Readability 解析失败:', error);
      return null;
    }
  }
  
  /**
   * 提取重要图片
   * @returns {Array} 图片数组
   */
  extractImportantImages() {
    const images = [];
    const imgElements = document.querySelectorAll('img');
    
    imgElements.forEach(img => {
      try {
        // 获取图片尺寸
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        
        // 过滤小图片（小于 200x200）
        if (width < 200 || height < 200) {
          return;
        }
        
        // 过滤广告、图标、logo
        const classList = img.className.toLowerCase();
        if (classList.includes('ad') || 
            classList.includes('icon') || 
            classList.includes('logo')) {
          return;
        }
        
        // 获取图片 URL
        const src = img.src || img.dataset.src || img.getAttribute('data-src');
        
        // 过滤 data URI 和空 URL
        if (!src || src.startsWith('data:image')) {
          return;
        }
        
        // 添加到结果
        images.push({
          src: src,
          alt: img.alt || '',
          width: width,
          height: height
        });
      } catch (error) {
        console.error('图片提取失败:', error);
      }
    });
    
    // 限制数量不超过 10 张
    return images.slice(0, 10);
  }
  
  /**
   * 提取元数据
   * @returns {Object} 元数据对象
   */
  extractMetadata() {
    return {
      author: this.extractAuthor(),
      publishDate: this.extractPublishDate()
    };
  }
  
  /**
   * 提取作者信息
   * @returns {string} 作者名称
   */
  extractAuthor() {
    // 尝试多种选择器
    const selectors = [
      'meta[name="author"]',
      'meta[property="article:author"]',
      'meta[property="og:article:author"]',
      '[rel="author"]',
      '.author',
      '.author-name',
      '.byline'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        // meta 标签使用 content 属性
        if (element.tagName === 'META') {
          return element.getAttribute('content') || '';
        }
        // 其他元素使用文本内容
        return element.textContent.trim() || '';
      }
    }
    
    return '';
  }
  
  /**
   * 提取发布时间
   * @returns {string} 发布时间
   */
  extractPublishDate() {
    // 尝试多种选择器
    const selectors = [
      'meta[property="article:published_time"]',
      'meta[property="og:article:published_time"]',
      'meta[name="publish-date"]',
      'meta[name="date"]',
      'time[datetime]',
      '.publish-date',
      '.post-date',
      '.entry-date'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        // meta 标签使用 content 属性
        if (element.tagName === 'META') {
          return element.getAttribute('content') || '';
        }
        // time 标签使用 datetime 属性
        if (element.tagName === 'TIME') {
          return element.getAttribute('datetime') || element.textContent.trim() || '';
        }
        // 其他元素使用文本内容
        return element.textContent.trim() || '';
      }
    }
    
    return '';
  }
}

// 导出（用于测试）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContentExtractor;
}

/**
 * 监听来自 Background 的消息
 */
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[Content] 收到消息:', request);
    
    if (request.action === 'extractContent') {
      try {
        console.log('[Content] 开始提取内容');
        const extractor = new ContentExtractor();
        const content = extractor.extractPageContent();
        
        console.log('[Content] 内容提取成功，发送响应');
        sendResponse({
          success: true,
          data: content
        });
      } catch (error) {
        console.error('[Content] 内容提取失败:', error);
        console.error('[Content] 错误堆栈:', error.stack);
        sendResponse({
          success: false,
          error: error.message
        });
      }
    }
    
    // 返回 true 表示异步响应
    return true;
  });
  
  console.log('[Content] Content script 已加载并监听消息');
}
