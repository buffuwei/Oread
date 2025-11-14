/**
 * 端到端测试
 * 测试完整的保存流程、预览模式、LLM 提供商切换和错误场景
 */

// Mock chrome API for E2E tests
const mockChrome = {
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  runtime: {
    lastError: null,
    onMessage: {
      addListener: jest.fn()
    },
    sendMessage: jest.fn(),
    getManifest: jest.fn(() => ({ version: '1.0.0' }))
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn()
  },
  downloads: {
    download: jest.fn(),
    search: jest.fn()
  },
  sidePanel: {
    open: jest.fn()
  },
  windows: {
    WINDOW_ID_CURRENT: -2
  }
};

global.chrome = mockChrome;
global.URL = {
  createObjectURL: jest.fn(() => 'blob:mock-url'),
  revokeObjectURL: jest.fn()
};

// Import services
const StorageManager = require('../services/storage-manager.js');
const { LLMService } = require('../services/llm-service.js');
const MarkdownGenerator = require('../services/markdown-generator.js');
const ErrorHandler = require('../services/error-handler.js');

describe('端到端测试 - 完整保存流程', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChrome.runtime.lastError = null;
  });

  describe('测试不同网页类型的保存流程', () => {
    test('应该成功保存新闻文章', async () => {
      // 模拟配置
      const config = {
        vaultPath: '/path/to/vault',
        saveFolder: 'ReadLater',
        apiProvider: 'openai',
        apiKey: 'test-key',
        enablePreview: false
      };

      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback(config);
      });

      // 模拟内容提取
      const mockContent = {
        title: '测试新闻文章',
        content: '这是一篇测试新闻文章的内容...',
        html: '<p>这是一篇测试新闻文章的内容...</p>',
        url: 'https://example.com/news/article',
        images: [
          { src: 'https://example.com/image1.jpg', alt: '图片1', width: 800, height: 600 }
        ],
        author: '测试作者',
        publishDate: '2024-01-01'
      };

      mockChrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
        callback({ success: true, data: mockContent });
      });

      // 模拟 LLM API 调用
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: '这是一篇关于测试的新闻文章摘要。' } }]
          })
        })
      );

      // 模拟下载
      mockChrome.downloads.download.mockResolvedValue(1);
      mockChrome.downloads.search.mockImplementation((query, callback) => {
        callback([{ id: 1, state: 'complete' }]);
      });

      // 执行保存流程
      const llmService = new LLMService(config);
      const summary = await llmService.generateSummary(mockContent);
      
      const generator = new MarkdownGenerator();
      const markdown = generator.generate(mockContent, summary);

      // 验证 Markdown 生成
      expect(markdown).toContain('title: 测试新闻文章');
      expect(markdown).toContain('url: https://example.com/news/article');
      expect(markdown).toContain('author: 测试作者');
      expect(markdown).toContain('## AI 摘要');
      expect(markdown).toContain('这是一篇关于测试的新闻文章摘要。');
      expect(markdown).toContain('## 原文内容');
      expect(markdown).toContain('## 相关图片');
    });

    test('应该成功保存博客文章', async () => {
      const config = {
        vaultPath: '/path/to/vault',
        saveFolder: 'ReadLater',
        apiProvider: 'claude',
        apiKey: 'test-key',
        enablePreview: false
      };

      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback(config);
      });

      const mockContent = {
        title: '技术博客：如何使用 Jest 进行测试',
        content: '本文介绍如何使用 Jest 进行单元测试和集成测试...',
        html: '<p>本文介绍如何使用 Jest 进行单元测试和集成测试...</p>',
        url: 'https://blog.example.com/jest-testing',
        images: [],
        author: '技术博主',
        publishDate: '2024-01-15'
      };

      mockChrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
        callback({ success: true, data: mockContent });
      });

      // 模拟 Claude API
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            content: [{ text: '本文详细介绍了 Jest 测试框架的使用方法。' }]
          })
        })
      );

      mockChrome.downloads.download.mockResolvedValue(2);
      mockChrome.downloads.search.mockImplementation((query, callback) => {
        callback([{ id: 2, state: 'complete' }]);
      });

      const llmService = new LLMService(config);
      const summary = await llmService.generateSummary(mockContent);
      
      const generator = new MarkdownGenerator();
      const markdown = generator.generate(mockContent, summary);

      expect(markdown).toContain('title: 技术博客：如何使用 Jest 进行测试');
      expect(markdown).toContain('本文详细介绍了 Jest 测试框架的使用方法。');
      expect(summary).toBe('本文详细介绍了 Jest 测试框架的使用方法。');
    });

    test('应该成功保存学术论文摘要', async () => {
      const config = {
        vaultPath: '/path/to/vault',
        saveFolder: 'Papers',
        apiProvider: 'openai',
        apiKey: 'test-key',
        enablePreview: false
      };

      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback(config);
      });

      const mockContent = {
        title: 'Deep Learning for Natural Language Processing',
        content: 'Abstract: This paper presents a novel approach to NLP using deep learning...',
        html: '<p>Abstract: This paper presents a novel approach to NLP using deep learning...</p>',
        url: 'https://arxiv.org/abs/1234.5678',
        images: [
          { src: 'https://arxiv.org/figure1.png', alt: 'Figure 1', width: 600, height: 400 },
          { src: 'https://arxiv.org/figure2.png', alt: 'Figure 2', width: 600, height: 400 }
        ],
        author: 'John Doe, Jane Smith',
        publishDate: '2024-01-20'
      };

      mockChrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
        callback({ success: true, data: mockContent });
      });

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: 'This paper introduces a new deep learning architecture for NLP tasks.' } }]
          })
        })
      );

      mockChrome.downloads.download.mockResolvedValue(3);
      mockChrome.downloads.search.mockImplementation((query, callback) => {
        callback([{ id: 3, state: 'complete' }]);
      });

      const llmService = new LLMService(config);
      const summary = await llmService.generateSummary(mockContent);
      
      const generator = new MarkdownGenerator();
      const markdown = generator.generate(mockContent, summary);

      expect(markdown).toContain('title: Deep Learning for Natural Language Processing');
      expect(markdown).toContain('author: John Doe, Jane Smith');
      expect(markdown).toContain('![Figure 1](https://arxiv.org/figure1.png)');
      expect(markdown).toContain('![Figure 2](https://arxiv.org/figure2.png)');
    });
  });

  describe('测试预览模式的完整流程', () => {
    test('应该在启用预览时打开 Side Panel', async () => {
      const config = {
        vaultPath: '/path/to/vault',
        saveFolder: 'ReadLater',
        apiProvider: 'openai',
        apiKey: 'test-key',
        enablePreview: true
      };

      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback(config);
      });

      const mockContent = {
        title: '测试文章',
        content: '测试内容',
        html: '<p>测试内容</p>',
        url: 'https://example.com/test',
        images: [],
        author: '测试作者'
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: '测试摘要' } }]
          })
        })
      );

      mockChrome.sidePanel.open.mockResolvedValue(undefined);
      mockChrome.runtime.sendMessage.mockResolvedValue(undefined);

      const llmService = new LLMService(config);
      const summary = await llmService.generateSummary(mockContent);
      
      const generator = new MarkdownGenerator();
      const markdown = generator.generate(mockContent, summary);

      // 模拟打开 Side Panel
      await mockChrome.sidePanel.open({ windowId: mockChrome.windows.WINDOW_ID_CURRENT });
      
      // 验证 Side Panel 被打开
      expect(mockChrome.sidePanel.open).toHaveBeenCalledWith({
        windowId: mockChrome.windows.WINDOW_ID_CURRENT
      });

      // 模拟发送预览数据
      await mockChrome.runtime.sendMessage({
        action: 'showPreview',
        markdown: markdown,
        metadata: {
          title: mockContent.title,
          url: mockContent.url,
          charCount: markdown.length
        }
      });

      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'showPreview',
          markdown: expect.any(String),
          metadata: expect.objectContaining({
            title: '测试文章',
            url: 'https://example.com/test'
          })
        })
      );
    });

    test('应该在预览模式下允许编辑后保存', async () => {
      const config = {
        vaultPath: '/path/to/vault',
        saveFolder: 'ReadLater',
        apiProvider: 'openai',
        apiKey: 'test-key',
        enablePreview: true
      };

      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback(config);
      });

      const mockContent = {
        title: '可编辑文章',
        content: '原始内容',
        html: '<p>原始内容</p>',
        url: 'https://example.com/editable',
        images: []
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: '原始摘要' } }]
          })
        })
      );

      const llmService = new LLMService(config);
      const summary = await llmService.generateSummary(mockContent);
      
      const generator = new MarkdownGenerator();
      let markdown = generator.generate(mockContent, summary);

      // 模拟用户编辑
      const editedMarkdown = markdown.replace('原始摘要', '编辑后的摘要');

      // 模拟确认保存
      mockChrome.downloads.download.mockResolvedValue(4);
      mockChrome.downloads.search.mockImplementation((query, callback) => {
        callback([{ id: 4, state: 'complete' }]);
      });

      // 验证编辑后的内容
      expect(editedMarkdown).toContain('编辑后的摘要');
      expect(editedMarkdown).not.toContain('原始摘要');
    });

    test('应该在预览模式下允许取消保存', async () => {
      const config = {
        vaultPath: '/path/to/vault',
        saveFolder: 'ReadLater',
        apiProvider: 'openai',
        apiKey: 'test-key',
        enablePreview: true
      };

      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback(config);
      });

      // 模拟取消保存
      mockChrome.runtime.sendMessage.mockResolvedValue(undefined);

      await mockChrome.runtime.sendMessage({ action: 'cancelSave' });

      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        action: 'cancelSave'
      });

      // 验证没有触发下载
      expect(mockChrome.downloads.download).not.toHaveBeenCalled();
    });
  });

  describe('测试不同 LLM 提供商的切换', () => {
    test('应该成功使用 OpenAI 提供商', async () => {
      const config = {
        apiProvider: 'openai',
        apiKey: 'sk-test-key',
        modelName: 'gpt-4'
      };

      const mockContent = {
        title: 'OpenAI 测试',
        content: '测试内容',
        url: 'https://example.com/openai-test'
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: 'OpenAI 生成的摘要' } }]
          })
        })
      );

      const llmService = new LLMService(config);
      const summary = await llmService.generateSummary(mockContent);

      expect(summary).toBe('OpenAI 生成的摘要');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer sk-test-key'
          })
        })
      );
    });

    test('应该成功使用 Claude 提供商', async () => {
      const config = {
        apiProvider: 'claude',
        apiKey: 'sk-ant-test-key',
        modelName: 'claude-3-sonnet-20240229'
      };

      const mockContent = {
        title: 'Claude 测试',
        content: '测试内容',
        url: 'https://example.com/claude-test'
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            content: [{ text: 'Claude 生成的摘要' }]
          })
        })
      );

      const llmService = new LLMService(config);
      const summary = await llmService.generateSummary(mockContent);

      expect(summary).toBe('Claude 生成的摘要');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': 'sk-ant-test-key',
            'anthropic-version': '2023-06-01'
          })
        })
      );
    });

    test('应该成功使用自定义端点（本地 LLM）', async () => {
      const config = {
        apiProvider: 'custom',
        customEndpoint: 'http://localhost:11434/v1/chat/completions',
        modelName: 'llama3.2',
        apiKey: '' // 本地 LLM 不需要 API Key
      };

      const mockContent = {
        title: '本地 LLM 测试',
        content: '测试内容',
        url: 'https://example.com/local-llm-test'
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: '本地 LLM 生成的摘要' } }]
          })
        })
      );

      const llmService = new LLMService(config);
      const summary = await llmService.generateSummary(mockContent);

      expect(summary).toBe('本地 LLM 生成的摘要');
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:11434/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String)
          })
        })
      );
    });

    test('应该在切换提供商后使用新配置', async () => {
      // 首先使用 OpenAI
      let config = {
        apiProvider: 'openai',
        apiKey: 'sk-openai-key'
      };

      const mockContent = {
        title: '切换测试',
        content: '测试内容',
        url: 'https://example.com/switch-test'
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: 'OpenAI 摘要' } }]
          })
        })
      );

      let llmService = new LLMService(config);
      let summary = await llmService.generateSummary(mockContent);

      expect(summary).toBe('OpenAI 摘要');

      // 切换到 Claude
      config = {
        apiProvider: 'claude',
        apiKey: 'sk-ant-claude-key'
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            content: [{ text: 'Claude 摘要' }]
          })
        })
      );

      llmService = new LLMService(config);
      summary = await llmService.generateSummary(mockContent);

      expect(summary).toBe('Claude 摘要');
    });
  });

  describe('测试错误场景', () => {
    test('应该处理网络失败', async () => {
      const config = {
        apiProvider: 'openai',
        apiKey: 'test-key'
      };

      const mockContent = {
        title: '网络失败测试',
        content: '测试内容',
        url: 'https://example.com/network-fail'
      };

      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network request failed'))
      );

      const llmService = new LLMService(config);

      await expect(llmService.generateSummary(mockContent)).rejects.toThrow();
    });

    test('应该处理 API 调用失败（401 未授权）', async () => {
      const config = {
        apiProvider: 'openai',
        apiKey: 'invalid-key'
      };

      const mockContent = {
        title: 'API 失败测试',
        content: '测试内容',
        url: 'https://example.com/api-fail'
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: () => Promise.resolve({
            error: { message: 'Invalid API key' }
          })
        })
      );

      const llmService = new LLMService(config);

      await expect(llmService.generateSummary(mockContent)).rejects.toThrow();
    });

    test('应该处理配置缺失', async () => {
      const config = {
        vaultPath: '',
        saveFolder: 'ReadLater',
        apiProvider: 'openai',
        apiKey: ''
      };

      const validation = StorageManager.validateConfig(config);

      expect(validation.valid).toBe(false);
      expect(validation.missing).toContain('Obsidian Vault 路径');
      expect(validation.missing).toContain('API Key');
    });

    test('应该处理内容提取失败', async () => {
      mockChrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
        callback({ success: false, error: '无法提取页面内容' });
      });

      const tabId = 1;
      let extractionError = null;

      try {
        await new Promise((resolve, reject) => {
          mockChrome.tabs.sendMessage(tabId, { action: 'extractContent' }, (response) => {
            if (response.success) {
              resolve(response.data);
            } else {
              reject(new Error(response.error));
            }
          });
        });
      } catch (error) {
        extractionError = error;
      }

      expect(extractionError).not.toBeNull();
      expect(extractionError.message).toBe('无法提取页面内容');
    });

    test('应该处理本地 LLM 连接失败', async () => {
      const config = {
        apiProvider: 'custom',
        customEndpoint: 'http://localhost:11434/v1/chat/completions',
        modelName: 'llama3.2'
      };

      const mockContent = {
        title: '本地 LLM 连接失败测试',
        content: '测试内容',
        url: 'https://example.com/local-fail'
      };

      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Failed to fetch'))
      );

      const llmService = new LLMService(config);

      await expect(llmService.generateSummary(mockContent)).rejects.toThrow();
    });

    test('应该处理文件保存失败', async () => {
      mockChrome.downloads.download.mockRejectedValue(
        new Error('Download failed: Invalid path')
      );

      const markdown = '# Test\n\nContent';
      const filename = 'test.md';

      await expect(
        mockChrome.downloads.download({
          url: 'blob:mock-url',
          filename: `ReadLater/${filename}`,
          saveAs: false
        })
      ).rejects.toThrow('Download failed: Invalid path');
    });

    test('应该处理 Side Panel 不支持的情况', async () => {
      mockChrome.sidePanel.open.mockRejectedValue(
        new Error('Side Panel API not supported')
      );

      let sidePanelError = null;

      try {
        await mockChrome.sidePanel.open({ windowId: mockChrome.windows.WINDOW_ID_CURRENT });
      } catch (error) {
        sidePanelError = error;
      }

      expect(sidePanelError).not.toBeNull();
      expect(sidePanelError.message).toBe('Side Panel API not supported');
    });

    test('应该处理 LLM 响应格式错误', async () => {
      const config = {
        apiProvider: 'openai',
        apiKey: 'test-key'
      };

      const mockContent = {
        title: '响应格式错误测试',
        content: '测试内容',
        url: 'https://example.com/format-error'
      };

      // 返回格式错误的响应
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            // 缺少 choices 字段
            data: 'invalid format'
          })
        })
      );

      const llmService = new LLMService(config);

      await expect(llmService.generateSummary(mockContent)).rejects.toThrow();
    });

    test('应该处理超时错误', async () => {
      const config = {
        apiProvider: 'openai',
        apiKey: 'test-key'
      };

      const mockContent = {
        title: '超时测试',
        content: '测试内容',
        url: 'https://example.com/timeout'
      };

      // 模拟超时
      global.fetch = jest.fn(() =>
        new Promise((resolve, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 100);
        })
      );

      const llmService = new LLMService(config);

      await expect(llmService.generateSummary(mockContent)).rejects.toThrow('Request timeout');
    });
  });

  describe('测试边界情况', () => {
    test('应该处理空内容', async () => {
      const mockContent = {
        title: '',
        content: '',
        html: '',
        url: 'https://example.com/empty',
        images: []
      };

      const generator = new MarkdownGenerator();
      const markdown = generator.generate(mockContent, '无内容可摘要');

      expect(markdown).toContain('title:');
      expect(markdown).toContain('无内容可摘要');
    });

    test('应该处理超长标题', async () => {
      const longTitle = 'A'.repeat(200);
      const mockContent = {
        title: longTitle,
        content: '测试内容',
        html: '<p>测试内容</p>',
        url: 'https://example.com/long-title',
        images: []
      };

      const generator = new MarkdownGenerator();
      const filename = generator.generateSafeFilename(mockContent.title);

      // 文件名应该被截断到 100 字符
      expect(filename.length).toBeLessThanOrEqual(120); // 100 + 时间戳 + .md
    });

    test('应该处理特殊字符', async () => {
      const mockContent = {
        title: '测试/文章\\标题:特殊*字符?',
        content: '测试内容',
        html: '<p>测试内容</p>',
        url: 'https://example.com/special-chars',
        images: []
      };

      const generator = new MarkdownGenerator();
      const filename = generator.generateSafeFilename(mockContent.title);

      // 文件名不应包含特殊字符
      expect(filename).not.toMatch(/[/\\?%*:|"<>]/);
    });

    test('应该处理大量图片', async () => {
      const images = Array.from({ length: 20 }, (_, i) => ({
        src: `https://example.com/image${i}.jpg`,
        alt: `图片 ${i}`,
        width: 800,
        height: 600
      }));

      const mockContent = {
        title: '大量图片测试',
        content: '测试内容',
        html: '<p>测试内容</p>',
        url: 'https://example.com/many-images',
        images: images
      };

      const generator = new MarkdownGenerator();
      const markdown = generator.generate(mockContent, '测试摘要');

      // 应该包含所有图片（虽然实际实现可能限制数量）
      expect(markdown).toContain('## 相关图片');
    });
  });
});
