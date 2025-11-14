/**
 * Markdown 生成器
 * 生成符合 Obsidian 格式的 Markdown 文档
 */

class MarkdownGenerator {
  /**
   * 生成完整的 Markdown 文档
   * @param {Object} content - 页面内容
   * @param {string} summary - AI 摘要
   * @param {Object} imageMapping - 图片路径映射 { originalSrc: localPath }
   * @param {string[]} tags - 提取的标签数组
   * @returns {string} Markdown 文本
   */
  generate(content, summary, imageMapping = null, tags = null) {
    const frontmatter = this.generateFrontmatter(content, tags);
    const body = this.generateBody(content, summary, imageMapping);
    
    return `${frontmatter}\n\n${body}`;
  }

  /**
   * 生成 YAML frontmatter
   * @param {Object} content - 页面内容
   * @param {string[]} tags - 提取的标签数组
   * @returns {string} YAML frontmatter
   */
  generateFrontmatter(content, tags = null) {
    const now = new Date().toISOString();
    
    // 构建标签列表
    let tagsList = ['read-later'];
    if (tags && Array.isArray(tags) && tags.length > 0) {
      // 合并提取的标签，去重
      tagsList = [...new Set([...tagsList, ...tags])];
    }
    
    // 格式化标签为 YAML 数组
    const tagsYaml = tagsList.map(tag => this.escapeYaml(tag)).join(', ');
    
    return `---
title: ${this.escapeYaml(content.title)}
url: ${content.url}
author: ${this.escapeYaml(content.author || '未知')}
saved: ${now}
tags: [${tagsYaml}]
---`;
  }

  /**
   * 生成文档主体
   * @param {Object} content - 页面内容
   * @param {string} summary - AI 摘要
   * @param {Object} imageMapping - 图片路径映射 { originalSrc: localPath }
   * @returns {string} 文档主体
   */
  generateBody(content, summary, imageMapping = null) {
    const date = this.formatDate(new Date());
    
    let body = `# ${content.title}

> 原文链接: [${content.url}](${content.url})
> 保存时间: ${date}`;

    // 添加作者信息（如果有）
    if (content.author) {
      body += `\n> 作者: ${content.author}`;
    }

    // 添加发布时间（如果有）
    if (content.publishDate) {
      body += `\n> 发布时间: ${content.publishDate}`;
    }

    body += `\n\n## AI 摘要\n\n${summary}\n\n## 原文内容\n\n${content.html}`;

    // 添加图片部分
    if (content.images && content.images.length > 0) {
      body += '\n\n' + this.generateImageSection(content.images, imageMapping);
    }

    return body;
  }

  /**
   * 生成图片部分
   * @param {Array} images - 图片数组
   * @param {Object} imageMapping - 图片路径映射 { originalSrc: localPath }
   * @returns {string} 图片部分的 Markdown
   */
  generateImageSection(images, imageMapping = null) {
    if (!images || images.length === 0) {
      return '';
    }
    
    let section = '## 相关图片\n\n';
    
    images.forEach((img, index) => {
      const alt = img.alt || `图片 ${index + 1}`;
      
      // 如果有图片映射，使用本地路径；否则使用原始 URL
      let imageSrc = img.src;
      if (imageMapping && imageMapping[img.src]) {
        imageSrc = imageMapping[img.src];
      }
      
      section += `![${alt}](${imageSrc})\n\n`;
    });
    
    return section;
  }

  /**
   * 转义 YAML 特殊字符
   * @param {string} text - 原始文本
   * @returns {string} 转义后的文本
   */
  escapeYaml(text) {
    if (!text) return '';
    
    // 如果包含特殊字符，用引号包裹
    if (/[:\[\]{}&*#?|\-<>=!%@`]/.test(text) || text.includes('"') || text.includes("'")) {
      // 转义双引号
      const escaped = text.replace(/"/g, '\\"');
      return `"${escaped}"`;
    }
    
    return text;
  }

  /**
   * 格式化日期
   * @param {Date} date - 日期对象
   * @returns {string} 格式化的日期字符串
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  /**
   * 生成安全的文件名
   * @param {string} title - 文件标题
   * @returns {string} 安全的文件名
   */
  generateSafeFilename(title) {
    // 移除特殊字符
    let filename = title.replace(/[/\\?%*:|"<>]/g, '-');
    
    // 移除多余的空格和连字符
    filename = filename.replace(/\s+/g, '-').replace(/-+/g, '-');
    
    // 限制长度为 100 字符
    if (filename.length > 100) {
      filename = filename.slice(0, 100);
    }
    
    // 移除首尾的连字符
    filename = filename.replace(/^-+|-+$/g, '');
    
    // 添加时间戳避免重名
    const timestamp = Date.now();
    
    return `${filename}-${timestamp}.md`;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MarkdownGenerator;
}
