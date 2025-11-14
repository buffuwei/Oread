/**
 * 图片下载服务
 * 负责下载图片到 Obsidian 附件文件夹并生成相对路径
 */

class ImageDownloader {
  /**
   * 下载图片并返回本地路径映射
   * @param {Array} images - 图片数组 [{src, alt, width, height}]
   * @param {string} savePath - 保存路径（包含 Vault 路径和文件夹）
   * @param {string} attachmentFolder - 附件文件夹名称
   * @param {string} articleTitle - 文章标题（用于创建子文件夹）
   * @returns {Promise<Object>} { success: Array, failed: Array }
   */
  async downloadImages(images, savePath, attachmentFolder = 'attachments', articleTitle = '') {
    if (!images || images.length === 0) {
      return { success: [], failed: [] };
    }

    const results = {
      success: [], // { originalSrc, localPath, alt }
      failed: []   // { originalSrc, error, alt }
    };

    // 生成安全的文件夹名称
    const safeFolderName = this.generateSafeFolderName(articleTitle);
    const imageFolder = safeFolderName ? `${attachmentFolder}/${safeFolderName}` : attachmentFolder;

    // 并发下载所有图片
    const downloadPromises = images.map((img, index) => 
      this.downloadSingleImage(img, imageFolder, index)
    );

    const downloadResults = await Promise.allSettled(downloadPromises);

    // 处理结果
    downloadResults.forEach((result, index) => {
      const img = images[index];
      
      if (result.status === 'fulfilled' && result.value.success) {
        results.success.push({
          originalSrc: img.src,
          localPath: result.value.localPath,
          alt: img.alt || `图片 ${index + 1}`
        });
      } else {
        const error = result.status === 'rejected' 
          ? result.reason.message 
          : result.value.error;
        
        results.failed.push({
          originalSrc: img.src,
          error: error,
          alt: img.alt || `图片 ${index + 1}`
        });
      }
    });

    return results;
  }

  /**
   * 下载单张图片
   * @param {Object} img - 图片对象
   * @param {string} folder - 保存文件夹
   * @param {number} index - 图片索引
   * @returns {Promise<Object>} { success: boolean, localPath?: string, error?: string }
   */
  async downloadSingleImage(img, folder, index) {
    try {
      // 验证 URL
      if (!this.isValidImageUrl(img.src)) {
        throw new Error('无效的图片 URL');
      }

      // 获取图片扩展名
      const extension = this.getImageExtension(img.src);
      
      // 生成文件名
      const filename = `image-${index + 1}-${Date.now()}${extension}`;
      const savePath = `${folder}/${filename}`;

      // 下载图片
      const downloadId = await chrome.downloads.download({
        url: img.src,
        filename: savePath,
        saveAs: false,
        conflictAction: 'uniquify'
      });

      // 等待下载完成
      await this.waitForDownload(downloadId);

      // 返回相对路径（相对于 Markdown 文件）
      const relativePath = `../${savePath}`;

      return {
        success: true,
        localPath: relativePath
      };
    } catch (error) {
      console.error(`下载图片失败 [${img.src}]:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 验证图片 URL 是否有效
   * @param {string} url - 图片 URL
   * @returns {boolean}
   */
  isValidImageUrl(url) {
    if (!url || typeof url !== 'string') {
      return false;
    }

    // 排除 data URI
    if (url.startsWith('data:')) {
      return false;
    }

    // 必须是 http 或 https
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false;
    }

    return true;
  }

  /**
   * 获取图片扩展名
   * @param {string} url - 图片 URL
   * @returns {string} 扩展名（包含点号）
   */
  getImageExtension(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const match = pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i);
      
      if (match) {
        return match[0].toLowerCase();
      }
      
      // 默认使用 .jpg
      return '.jpg';
    } catch (error) {
      return '.jpg';
    }
  }

  /**
   * 生成安全的文件夹名称
   * @param {string} title - 文章标题
   * @returns {string} 安全的文件夹名称
   */
  generateSafeFolderName(title) {
    if (!title) {
      return '';
    }

    // 移除特殊字符
    let folderName = title.replace(/[/\\?%*:|"<>]/g, '-');
    
    // 移除多余的空格和连字符
    folderName = folderName.replace(/\s+/g, '-').replace(/-+/g, '-');
    
    // 限制长度为 50 字符
    if (folderName.length > 50) {
      folderName = folderName.slice(0, 50);
    }
    
    // 移除首尾的连字符
    folderName = folderName.replace(/^-+|-+$/g, '');
    
    return folderName;
  }

  /**
   * 等待下载完成
   * @param {number} downloadId - 下载 ID
   * @returns {Promise<void>}
   */
  async waitForDownload(downloadId) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('下载超时'));
      }, 30000); // 30 秒超时

      const checkDownload = () => {
        chrome.downloads.search({ id: downloadId }, (results) => {
          if (results.length === 0) {
            clearTimeout(timeout);
            reject(new Error('下载未找到'));
            return;
          }
          
          const download = results[0];
          
          if (download.state === 'complete') {
            clearTimeout(timeout);
            resolve();
          } else if (download.state === 'interrupted') {
            clearTimeout(timeout);
            reject(new Error(`下载被中断: ${download.error || '未知错误'}`));
          } else {
            // 继续等待
            setTimeout(checkDownload, 200);
          }
        });
      };
      
      checkDownload();
    });
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageDownloader;
}
