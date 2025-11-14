/**
 * 测试配置验证逻辑
 * Requirements: 5.2, 5.3
 */

const StorageManager = require('../services/storage-manager.js');

describe('StorageManager - 配置验证逻辑', () => {
  test('应该验证通用必填项 - vaultPath', () => {
    const config = {
      vaultPath: '',
      apiProvider: 'openai',
      apiKey: 'test-key'
    };
    
    const result = StorageManager.validateConfig(config);
    
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('Obsidian Vault 路径');
  });

  test('应该验证 OpenAI 提供商需要 API Key', () => {
    const config = {
      vaultPath: '/path/to/vault',
      apiProvider: 'openai',
      apiKey: ''
    };
    
    const result = StorageManager.validateConfig(config);
    
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('API Key');
  });

  test('应该验证 Claude 提供商需要 API Key', () => {
    const config = {
      vaultPath: '/path/to/vault',
      apiProvider: 'claude',
      apiKey: ''
    };
    
    const result = StorageManager.validateConfig(config);
    
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('API Key');
  });

  test('应该验证 Custom 提供商需要端点', () => {
    const config = {
      vaultPath: '/path/to/vault',
      apiProvider: 'custom',
      customEndpoint: '',
      modelName: 'llama3.2'
    };
    
    const result = StorageManager.validateConfig(config);
    
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('自定义 API 端点');
  });

  test('应该验证 Custom 提供商需要模型名称', () => {
    const config = {
      vaultPath: '/path/to/vault',
      apiProvider: 'custom',
      customEndpoint: 'http://localhost:11434/v1/chat/completions',
      modelName: ''
    };
    
    const result = StorageManager.validateConfig(config);
    
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('模型名称');
  });

  test('应该通过有效的 OpenAI 配置验证', () => {
    const config = {
      vaultPath: '/path/to/vault',
      apiProvider: 'openai',
      apiKey: 'test-key'
    };
    
    const result = StorageManager.validateConfig(config);
    
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  test('应该通过有效的 Claude 配置验证', () => {
    const config = {
      vaultPath: '/path/to/vault',
      apiProvider: 'claude',
      apiKey: 'test-key'
    };
    
    const result = StorageManager.validateConfig(config);
    
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  test('应该通过有效的 Custom 配置验证（无 API Key）', () => {
    const config = {
      vaultPath: '/path/to/vault',
      apiProvider: 'custom',
      customEndpoint: 'http://localhost:11434/v1/chat/completions',
      modelName: 'llama3.2',
      apiKey: '' // Custom provider 的 API Key 是可选的
    };
    
    const result = StorageManager.validateConfig(config);
    
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  test('应该检测多个缺失的配置项', () => {
    const config = {
      vaultPath: '',
      apiProvider: 'openai',
      apiKey: ''
    };
    
    const result = StorageManager.validateConfig(config);
    
    expect(result.valid).toBe(false);
    expect(result.missing).toHaveLength(2);
    expect(result.missing).toContain('Obsidian Vault 路径');
    expect(result.missing).toContain('API Key');
  });

  test('应该处理空格填充的配置项', () => {
    const config = {
      vaultPath: '   ',
      apiProvider: 'openai',
      apiKey: '   '
    };
    
    const result = StorageManager.validateConfig(config);
    
    expect(result.valid).toBe(false);
    expect(result.missing.length).toBeGreaterThan(0);
  });
});

describe('StorageManager - 默认配置', () => {
  test('应该提供正确的默认配置', () => {
    expect(StorageManager.DEFAULT_CONFIG).toEqual({
      vaultPath: '',
      saveFolder: 'ReadLater',
      apiProvider: 'openai',
      apiKey: '',
      customEndpoint: '',
      modelName: '',
      enablePreview: false,
      localizeImages: false,
      attachmentFolder: 'attachments',
      enableTagExtraction: false,
      maxTags: 5
    });
  });
});

describe('StorageManager - 字段标签', () => {
  test('应该返回正确的中文字段标签', () => {
    expect(StorageManager.getFieldLabel('vaultPath')).toBe('Obsidian Vault 路径');
    expect(StorageManager.getFieldLabel('apiKey')).toBe('API Key');
    expect(StorageManager.getFieldLabel('customEndpoint')).toBe('自定义 API 端点');
    expect(StorageManager.getFieldLabel('modelName')).toBe('模型名称');
    expect(StorageManager.getFieldLabel('localizeImages')).toBe('本地化图片');
    expect(StorageManager.getFieldLabel('attachmentFolder')).toBe('附件文件夹');
  });

  test('应该返回未知字段的原始名称', () => {
    expect(StorageManager.getFieldLabel('unknownField')).toBe('unknownField');
  });
});

describe('StorageManager - Chrome Storage API 集成', () => {
  beforeEach(() => {
    // 重置 mock
    chrome.storage.sync.get.mockClear();
    chrome.storage.sync.set.mockClear();
    chrome.storage.sync.clear.mockClear();
    chrome.runtime.lastError = null;
  });

  test('应该调用 chrome.storage.sync.get 获取配置', async () => {
    const mockConfig = { vaultPath: '/test/path' };
    chrome.storage.sync.get.mockImplementation((defaults, callback) => {
      callback(mockConfig);
    });
    
    const config = await StorageManager.getConfig();
    
    expect(chrome.storage.sync.get).toHaveBeenCalledWith(
      StorageManager.DEFAULT_CONFIG,
      expect.any(Function)
    );
    expect(config).toEqual(mockConfig);
  });

  test('应该调用 chrome.storage.sync.set 保存配置', async () => {
    chrome.storage.sync.set.mockImplementation((config, callback) => {
      callback();
    });
    
    const config = { vaultPath: '/test/path' };
    await StorageManager.saveConfig(config);
    
    expect(chrome.storage.sync.set).toHaveBeenCalledWith(
      config,
      expect.any(Function)
    );
  });

  test('应该处理保存配置时的错误', async () => {
    chrome.runtime.lastError = { message: 'Storage error' };
    chrome.storage.sync.set.mockImplementation((config, callback) => {
      callback();
    });
    
    await expect(StorageManager.saveConfig({})).rejects.toThrow('Storage error');
  });

  test('应该调用 chrome.storage.sync.clear 清除配置', async () => {
    chrome.storage.sync.clear.mockImplementation((callback) => {
      callback();
    });
    
    await StorageManager.clear();
    
    expect(chrome.storage.sync.clear).toHaveBeenCalled();
  });
});
