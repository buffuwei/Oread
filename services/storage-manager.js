/**
 * 配置存储管理器
 * 负责配置的读取、保存和验证
 */
class StorageManager {
  /**
   * 默认配置
   */
  static DEFAULT_CONFIG = {
    savePath: '',
    llms: [], // LLM 配置列表
    activeLlmId: null, // 当前激活的 LLM ID
    enablePreview: false,
    localizeImages: false,
    attachmentFolder: 'attachments',
    enableTagExtraction: false,
    maxTags: 5,
    // 兼容旧版本配置
    apiProvider: 'openai',
    apiKey: '',
    customEndpoint: '',
    modelName: ''
  };

  /**
   * 必填配置项（根据 API 提供商不同而变化）
   */
  static REQUIRED_FIELDS = {
    common: ['savePath'],
    openai: ['apiKey'],
    azure: ['apiKey', 'azureEndpoint', 'azureDeployment'],
    claude: ['apiKey'],
    custom: ['customEndpoint', 'modelName']
  };

  /**
   * 获取配置
   * @returns {Promise<Object>} 配置对象
   */
  static async getConfig() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(this.DEFAULT_CONFIG, (result) => {
        resolve(result);
      });
    });
  }

  /**
   * 保存配置
   * @param {Object} config - 配置对象
   * @returns {Promise<void>}
   */
  static async saveConfig(config) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set(config, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 验证配置
   * @param {Object} config - 配置对象
   * @returns {Object} { valid: boolean, missing: string[] }
   */
  static validateConfig(config) {
    const missing = [];

    // 检查通用必填项
    for (const field of this.REQUIRED_FIELDS.common) {
      if (!config[field] || config[field].trim() === '') {
        missing.push(this.getFieldLabel(field));
      }
    }

    // 检查是否配置了 LLM
    if (!config.llms || config.llms.length === 0) {
      // 兼容旧版本：检查旧的 API 配置
      const provider = config.apiProvider || 'openai';
      const providerFields = this.REQUIRED_FIELDS[provider] || [];
      
      for (const field of providerFields) {
        if (provider === 'custom' && field === 'apiKey') {
          continue;
        }
        
        if (!config[field] || config[field].trim() === '') {
          missing.push(this.getFieldLabel(field));
        }
      }
    } else {
      // 新版本：检查是否选择了激活的 LLM
      if (!config.activeLlmId) {
        missing.push('请选择要使用的 LLM');
      }
    }

    return {
      valid: missing.length === 0,
      missing: missing
    };
  }
  
  /**
   * 获取当前激活的 LLM 配置
   * @param {Object} config - 完整配置对象
   * @returns {Object|null} LLM 配置对象或 null
   */
  static getActiveLlm(config) {
    // 如果有新版本的 LLM 配置
    if (config.llms && config.llms.length > 0 && config.activeLlmId) {
      const llm = config.llms.find(l => l.id === config.activeLlmId);
      if (llm) {
        return {
          provider: llm.provider,
          apiKey: llm.apiKey,
          azureEndpoint: llm.azureEndpoint,
          azureDeployment: llm.azureDeployment,
          customEndpoint: llm.customEndpoint,
          modelName: llm.modelName
        };
      }
    }
    
    // 兼容旧版本配置
    if (config.apiProvider) {
      return {
        provider: config.apiProvider,
        apiKey: config.apiKey,
        azureEndpoint: config.azureEndpoint,
        azureDeployment: config.azureDeployment,
        customEndpoint: config.customEndpoint,
        modelName: config.modelName
      };
    }
    
    return null;
  }

  /**
   * 获取字段的中文标签
   * @param {string} field - 字段名
   * @returns {string} 中文标签
   */
  static getFieldLabel(field) {
    const labels = {
      savePath: '保存路径',
      apiProvider: 'API 提供商',
      apiKey: 'API Key',
      customEndpoint: '自定义 API 端点',
      modelName: '模型名称',
      enablePreview: '启用预览',
      localizeImages: '本地化图片',
      attachmentFolder: '附件文件夹',
      enableTagExtraction: '启用标签提取',
      maxTags: '最大标签数量'
    };
    return labels[field] || field;
  }

  /**
   * 获取配置的某个字段
   * @param {string} key - 字段名
   * @returns {Promise<any>} 字段值
   */
  static async get(key) {
    const config = await this.getConfig();
    return config[key];
  }

  /**
   * 设置配置的某个字段
   * @param {string} key - 字段名
   * @param {any} value - 字段值
   * @returns {Promise<void>}
   */
  static async set(key, value) {
    return this.saveConfig({ [key]: value });
  }

  /**
   * 清除所有配置（重置为默认值）
   * @returns {Promise<void>}
   */
  static async clear() {
    return new Promise((resolve) => {
      chrome.storage.sync.clear(() => {
        resolve();
      });
    });
  }
}

// 导出（用于 Service Worker 和其他脚本）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}
