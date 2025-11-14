/**
 * LLM 服务抽象层
 * 提供统一的 LLM API 调用接口，支持多种提供商
 */

/**
 * LLM 服务主类
 */
class LLMService {
  constructor(config) {
    // 支持直接传入 LLM 配置对象或完整配置对象
    if (config.provider) {
      // 直接传入的 LLM 配置
      this.provider = config.provider;
      this.apiKey = config.apiKey || '';
      this.azureEndpoint = config.azureEndpoint || '';
      this.azureDeployment = config.azureDeployment || '';
      this.customEndpoint = config.customEndpoint || '';
      this.modelName = config.modelName || '';
    } else {
      // 兼容旧版本配置
      this.provider = config.apiProvider || 'openai';
      this.apiKey = config.apiKey || '';
      this.azureEndpoint = config.azureEndpoint || '';
      this.azureDeployment = config.azureDeployment || '';
      this.customEndpoint = config.customEndpoint || '';
      this.modelName = config.modelName || '';
    }
  }
  
  /**
   * 从完整配置创建 LLMService 实例
   * @param {Object} fullConfig - 完整配置对象
   * @returns {LLMService} LLMService 实例
   */
  static fromConfig(fullConfig) {
    const llmConfig = StorageManager.getActiveLlm(fullConfig);
    if (!llmConfig) {
      throw new Error('未找到可用的 LLM 配置');
    }
    return new LLMService(llmConfig);
  }

  /**
   * 生成摘要
   * @param {Object} content - 页面内容
   * @returns {Promise<string>} 摘要文本
   */
  async generateSummary(content) {
    // 验证配置
    this.validateConfig();
    
    // 获取对应的 Provider
    const provider = this.getProvider();
    
    // 调用 Provider 生成摘要
    return await provider.generateSummary(content);
  }

  /**
   * 提取标签
   * @param {Object} content - 页面内容
   * @param {number} maxTags - 最大标签数量
   * @returns {Promise<string[]>} 标签数组
   */
  async extractTags(content, maxTags = 5) {
    // 验证配置
    this.validateConfig();
    
    // 获取对应的 Provider
    const provider = this.getProvider();
    
    // 调用 Provider 提取标签
    return await provider.extractTags(content, maxTags);
  }

  /**
   * 验证配置
   */
  validateConfig() {
    if (this.provider === 'openai' && !this.apiKey) {
      throw new Error('请配置 OpenAI API Key');
    }
    
    if (this.provider === 'azure') {
      if (!this.apiKey) {
        throw new Error('请配置 Azure OpenAI API Key');
      }
      if (!this.azureEndpoint) {
        throw new Error('请配置 Azure 端点');
      }
      if (!this.azureDeployment) {
        throw new Error('请配置部署名称');
      }
    }
    
    if (this.provider === 'claude' && !this.apiKey) {
      throw new Error('请配置 Claude API Key');
    }
    
    if (this.provider === 'custom') {
      if (!this.customEndpoint) {
        throw new Error('请配置自定义 API 端点');
      }
      if (!this.modelName) {
        throw new Error('请配置模型名称');
      }
    }
  }

  /**
   * 获取对应的 Provider
   * @returns {BaseProvider} Provider 实例
   */
  getProvider() {
    switch (this.provider) {
      case 'openai':
        return new OpenAIProvider(this.apiKey);
      case 'azure':
        return new AzureOpenAIProvider(this.apiKey, this.azureEndpoint, this.azureDeployment);
      case 'claude':
        return new ClaudeProvider(this.apiKey);
      case 'custom':
        return new CustomProvider(this.customEndpoint, this.apiKey, this.modelName);
      default:
        throw new Error('不支持的 API 提供商: ' + this.provider);
    }
  }
}

/**
 * Provider 基类
 */
class BaseProvider {
  /**
   * 生成摘要（子类需要实现）
   * @param {Object} content - 页面内容
   * @returns {Promise<string>} 摘要文本
   */
  async generateSummary(content) {
    throw new Error('子类必须实现 generateSummary 方法');
  }

  /**
   * 提取标签（子类需要实现）
   * @param {Object} content - 页面内容
   * @param {number} maxTags - 最大标签数量
   * @returns {Promise<string[]>} 标签数组
   */
  async extractTags(content, maxTags = 5) {
    throw new Error('子类必须实现 extractTags 方法');
  }

  /**
   * 准备内容（限制长度）
   * @param {Object} content - 页面内容
   * @returns {string} 处理后的内容
   */
  prepareContent(content) {
    const text = content.content || content.html || '';
    // 限制为 8000 字符
    return text.slice(0, 8000);
  }

  /**
   * 获取系统 Prompt
   * @returns {string} 系统 Prompt
   */
  getSystemPrompt() {
    return '你是一个专业的内容总结助手。请用中文总结文章的核心内容，包括：1) 主要观点 2) 关键信息 3) 重要结论。保持简洁但全面，字数控制在 300-500 字。';
  }

  /**
   * 获取标签提取的系统 Prompt
   * @returns {string} 系统 Prompt
   */
  getTagExtractionPrompt() {
    return '你是一个专业的内容分析助手。请从文章中提取最相关的关键词作为标签。标签应该简洁、准确，能够代表文章的主题和核心概念。只返回标签列表，每个标签用逗号分隔，不要包含其他解释。';
  }

  /**
   * 构造标签提取的用户消息
   * @param {Object} content - 页面内容
   * @param {number} maxTags - 最大标签数量
   * @returns {string} 用户消息
   */
  getTagExtractionMessage(content, maxTags) {
    const preparedContent = this.prepareContent(content);
    return `请从以下文章中提取 ${maxTags} 个最相关的关键词标签：\n\n标题：${content.title}\n\n内容：${preparedContent}\n\n请只返回标签，用逗号分隔，例如：技术,编程,人工智能`;
  }

  /**
   * 构造用户消息
   * @param {Object} content - 页面内容
   * @returns {string} 用户消息
   */
  getUserMessage(content) {
    const preparedContent = this.prepareContent(content);
    return `请总结以下文章：\n\n标题：${content.title}\n\n内容：${preparedContent}`;
  }
}

/**
 * OpenAI Provider
 */
class OpenAIProvider extends BaseProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    this.endpoint = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-4o-mini';
  }

  async generateSummary(content) {
    const requestBody = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: this.getSystemPrompt()
        },
        {
          role: 'user',
          content: this.getUserMessage(content)
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API 调用失败: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      if (error.message.includes('fetch')) {
        throw new Error('网络错误，请检查网络连接');
      }
      throw error;
    }
  }

  async extractTags(content, maxTags = 5) {
    const requestBody = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: this.getTagExtractionPrompt()
        },
        {
          role: 'user',
          content: this.getTagExtractionMessage(content, maxTags)
        }
      ],
      temperature: 0.3,
      max_tokens: 100
    };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API 调用失败: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const tagsText = data.choices[0].message.content;
      
      // 解析标签
      return this.parseTags(tagsText, maxTags);
    } catch (error) {
      if (error.message.includes('fetch')) {
        throw new Error('网络错误，请检查网络连接');
      }
      throw error;
    }
  }

  /**
   * 解析标签文本
   * @param {string} tagsText - LLM 返回的标签文本
   * @param {number} maxTags - 最大标签数量
   * @returns {string[]} 标签数组
   */
  parseTags(tagsText, maxTags) {
    // 分割标签（支持逗号、分号、换行等分隔符）
    const tags = tagsText
      .split(/[,，;；\n]/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && tag.length <= 30) // 过滤空标签和过长标签
      .slice(0, maxTags); // 限制数量
    
    return tags;
  }
}

/**
 * Azure OpenAI Provider
 */
class AzureOpenAIProvider extends BaseProvider {
  constructor(apiKey, azureEndpoint, azureDeployment) {
    super();
    this.apiKey = apiKey;
    this.azureEndpoint = azureEndpoint;
    this.azureDeployment = azureDeployment;
    // Azure OpenAI API 版本
    this.apiVersion = '2024-02-15-preview';
  }

  /**
   * 构建 Azure OpenAI 端点 URL
   */
  getEndpoint() {
    // 移除末尾的斜杠
    const baseUrl = this.azureEndpoint.replace(/\/$/, '');
    return `${baseUrl}/openai/deployments/${this.azureDeployment}/chat/completions?api-version=${this.apiVersion}`;
  }

  async generateSummary(content) {
    const requestBody = {
      messages: [
        {
          role: 'system',
          content: this.getSystemPrompt()
        },
        {
          role: 'user',
          content: this.getUserMessage(content)
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };

    try {
      const response = await fetch(this.getEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`Azure OpenAI API 调用失败: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      if (error.message.includes('fetch')) {
        throw new Error('网络错误，请检查网络连接');
      }
      throw error;
    }
  }

  async extractTags(content, maxTags = 5) {
    const requestBody = {
      messages: [
        {
          role: 'system',
          content: this.getTagExtractionPrompt()
        },
        {
          role: 'user',
          content: this.getTagExtractionMessage(content, maxTags)
        }
      ],
      temperature: 0.3,
      max_tokens: 100
    };

    try {
      const response = await fetch(this.getEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`Azure OpenAI API 调用失败: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const tagsText = data.choices[0].message.content;
      
      // 解析标签
      return this.parseTags(tagsText, maxTags);
    } catch (error) {
      if (error.message.includes('fetch')) {
        throw new Error('网络错误，请检查网络连接');
      }
      throw error;
    }
  }

  /**
   * 解析标签文本
   * @param {string} tagsText - LLM 返回的标签文本
   * @param {number} maxTags - 最大标签数量
   * @returns {string[]} 标签数组
   */
  parseTags(tagsText, maxTags) {
    // 分割标签（支持逗号、分号、换行等分隔符）
    const tags = tagsText
      .split(/[,，;；\n]/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && tag.length <= 30) // 过滤空标签和过长标签
      .slice(0, maxTags); // 限制数量
    
    return tags;
  }
}

/**
 * Claude Provider
 */
class ClaudeProvider extends BaseProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    this.endpoint = 'https://api.anthropic.com/v1/messages';
    this.model = 'claude-3-haiku-20240307';
  }

  async generateSummary(content) {
    const requestBody = {
      model: this.model,
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `${this.getSystemPrompt()}\n\n${this.getUserMessage(content)}`
        }
      ]
    };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`Claude API 调用失败: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      if (error.message.includes('fetch')) {
        throw new Error('网络错误，请检查网络连接');
      }
      throw error;
    }
  }

  async extractTags(content, maxTags = 5) {
    const requestBody = {
      model: this.model,
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `${this.getTagExtractionPrompt()}\n\n${this.getTagExtractionMessage(content, maxTags)}`
        }
      ]
    };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`Claude API 调用失败: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const tagsText = data.content[0].text;
      
      // 解析标签
      return this.parseTags(tagsText, maxTags);
    } catch (error) {
      if (error.message.includes('fetch')) {
        throw new Error('网络错误，请检查网络连接');
      }
      throw error;
    }
  }

  /**
   * 解析标签文本
   * @param {string} tagsText - LLM 返回的标签文本
   * @param {number} maxTags - 最大标签数量
   * @returns {string[]} 标签数组
   */
  parseTags(tagsText, maxTags) {
    // 分割标签（支持逗号、分号、换行等分隔符）
    const tags = tagsText
      .split(/[,，;；\n]/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && tag.length <= 30) // 过滤空标签和过长标签
      .slice(0, maxTags); // 限制数量
    
    return tags;
  }
}

/**
 * Custom Provider（OpenAI 兼容）
 */
class CustomProvider extends BaseProvider {
  constructor(endpoint, apiKey, modelName) {
    super();
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.model = modelName;
  }

  async generateSummary(content) {
    const requestBody = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: this.getSystemPrompt()
        },
        {
          role: 'user',
          content: this.getUserMessage(content)
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };

    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      // 如果提供了 API Key，添加 Authorization 头
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`自定义 API 调用失败: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      // 尝试解析 OpenAI 兼容格式
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      }
      
      // 尝试其他可能的响应格式
      if (data.response) {
        return data.response;
      }
      
      if (data.text) {
        return data.text;
      }
      
      throw new Error('无法解析 API 响应格式');
    } catch (error) {
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        throw new Error('无法连接到本地 LLM 服务，请检查服务是否运行');
      }
      throw error;
    }
  }

  async extractTags(content, maxTags = 5) {
    const requestBody = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: this.getTagExtractionPrompt()
        },
        {
          role: 'user',
          content: this.getTagExtractionMessage(content, maxTags)
        }
      ],
      temperature: 0.3,
      max_tokens: 100
    };

    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      // 如果提供了 API Key，添加 Authorization 头
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`自定义 API 调用失败: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      // 尝试解析 OpenAI 兼容格式
      let tagsText = '';
      if (data.choices && data.choices[0] && data.choices[0].message) {
        tagsText = data.choices[0].message.content;
      } else if (data.response) {
        tagsText = data.response;
      } else if (data.text) {
        tagsText = data.text;
      } else {
        throw new Error('无法解析 API 响应格式');
      }
      
      // 解析标签
      return this.parseTags(tagsText, maxTags);
    } catch (error) {
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        throw new Error('无法连接到本地 LLM 服务，请检查服务是否运行');
      }
      throw error;
    }
  }

  /**
   * 解析标签文本
   * @param {string} tagsText - LLM 返回的标签文本
   * @param {number} maxTags - 最大标签数量
   * @returns {string[]} 标签数组
   */
  parseTags(tagsText, maxTags) {
    // 分割标签（支持逗号、分号、换行等分隔符）
    const tags = tagsText
      .split(/[,，;；\n]/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && tag.length <= 30) // 过滤空标签和过长标签
      .slice(0, maxTags); // 限制数量
    
    return tags;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LLMService, OpenAIProvider, AzureOpenAIProvider, ClaudeProvider, CustomProvider };
}
