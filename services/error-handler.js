/**
 * 统一的错误处理器
 * 负责错误分类、用户友好的错误消息生成和错误日志记录
 */

class ErrorHandler {
  /**
   * 错误类型
   */
  static ERROR_TYPES = {
    EXTRACTION: 'extraction',
    LLM: 'llm',
    CONNECTION: 'connection',
    CONFIG: 'config',
    SAVE: 'save',
    UNKNOWN: 'unknown'
  };

  /**
   * 错误严重级别
   */
  static SEVERITY = {
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical'
  };

  /**
   * 处理错误
   * @param {Error} error - 错误对象
   * @param {string} context - 错误上下文
   * @returns {Object} 错误信息对象
   */
  static handle(error, context = '') {
    const errorInfo = this.classify(error);
    
    // 记录错误
    this.logError(error, context, errorInfo);
    
    // 生成用户友好的错误消息
    const userMessage = this.getUserMessage(errorInfo, error);
    
    return {
      type: errorInfo.type,
      severity: errorInfo.severity,
      message: userMessage,
      originalError: error
    };
  }

  /**
   * 分类错误
   * @param {Error} error - 错误对象
   * @returns {Object} 错误信息
   */
  static classify(error) {
    const message = error.message || '';
    
    // 内容提取错误
    if (message.includes('Readability') || 
        message.includes('提取') || 
        message.includes('无法连接到页面')) {
      return {
        type: this.ERROR_TYPES.EXTRACTION,
        severity: this.SEVERITY.WARNING,
        recoverable: true
      };
    }
    
    // LLM API 错误
    if (message.includes('API') || 
        message.includes('摘要') ||
        message.includes('OpenAI') ||
        message.includes('Claude')) {
      return {
        type: this.ERROR_TYPES.LLM,
        severity: this.SEVERITY.ERROR,
        recoverable: true
      };
    }
    
    // 连接错误
    if (message.includes('连接') || 
        message.includes('网络') ||
        message.includes('fetch') ||
        message.includes('本地 LLM')) {
      return {
        type: this.ERROR_TYPES.CONNECTION,
        severity: this.SEVERITY.ERROR,
        recoverable: true
      };
    }
    
    // 配置错误
    if (message.includes('配置') || 
        message.includes('请先') ||
        message.includes('API Key') ||
        message.includes('端点')) {
      return {
        type: this.ERROR_TYPES.CONFIG,
        severity: this.SEVERITY.WARNING,
        recoverable: true
      };
    }
    
    // 保存错误
    if (message.includes('保存') || 
        message.includes('下载') ||
        message.includes('文件')) {
      return {
        type: this.ERROR_TYPES.SAVE,
        severity: this.SEVERITY.ERROR,
        recoverable: true
      };
    }
    
    // 未知错误
    return {
      type: this.ERROR_TYPES.UNKNOWN,
      severity: this.SEVERITY.CRITICAL,
      recoverable: false
    };
  }

  /**
   * 获取用户友好的错误消息
   * @param {Object} errorInfo - 错误信息
   * @param {Error} error - 原始错误对象
   * @returns {string} 用户友好的错误消息
   */
  static getUserMessage(errorInfo, error) {
    // 如果错误消息已经是用户友好的，直接返回
    const originalMessage = error.message || '';
    
    // 检查是否已经是中文错误消息
    if (/[\u4e00-\u9fa5]/.test(originalMessage)) {
      return originalMessage;
    }
    
    // 根据错误类型返回默认消息
    const defaultMessages = {
      [this.ERROR_TYPES.EXTRACTION]: '无法提取页面内容，请确认页面已完全加载或尝试刷新页面',
      [this.ERROR_TYPES.LLM]: 'AI 摘要生成失败，请检查 API 配置和网络连接',
      [this.ERROR_TYPES.CONNECTION]: '网络连接失败，请检查网络状态或本地服务是否运行',
      [this.ERROR_TYPES.CONFIG]: '配置不完整，请先完成必要的设置',
      [this.ERROR_TYPES.SAVE]: '文件保存失败，请检查路径配置和磁盘空间',
      [this.ERROR_TYPES.UNKNOWN]: '发生未知错误，请重试或联系支持'
    };
    
    return defaultMessages[errorInfo.type] || originalMessage;
  }

  /**
   * 记录错误
   * @param {Error} error - 错误对象
   * @param {string} context - 错误上下文
   * @param {Object} errorInfo - 错误信息
   */
  static logError(error, context, errorInfo) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${context}] [${errorInfo.type}] [${errorInfo.severity}]`;
        
    // 如果是严重错误，可以考虑发送错误报告
    if (errorInfo.severity === this.SEVERITY.CRITICAL) {
      this.reportError(error, context, errorInfo);
    }
  }

  /**
   * 报告错误（占位符，可以实现发送到错误追踪服务）
   * @param {Error} error - 错误对象
   * @param {string} context - 错误上下文
   * @param {Object} errorInfo - 错误信息
   */
  static reportError(error, context, errorInfo) {
    // TODO: 实现错误报告功能
    // 例如：发送到 Sentry、LogRocket 等错误追踪服务
    console.warn('严重错误需要报告:', {
      error: error.message,
      context,
      errorInfo
    });
  }

  /**
   * 创建错误对象
   * @param {string} type - 错误类型
   * @param {string} message - 错误消息
   * @returns {Error} 错误对象
   */
  static createError(type, message) {
    const error = new Error(message);
    error.type = type;
    return error;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorHandler;
}
