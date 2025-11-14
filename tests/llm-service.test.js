/**
 * 测试 LLM Provider 选择逻辑
 * Requirements: 3.1, 3.2, 3.3
 */

const { LLMService, OpenAIProvider, ClaudeProvider, CustomProvider } = require('../services/llm-service.js');

describe('LLMService - Provider 选择逻辑', () => {
  test('应该正确选择 OpenAI Provider', () => {
    const config = {
      apiProvider: 'openai',
      apiKey: 'test-key'
    };
    
    const service = new LLMService(config);
    const provider = service.getProvider();
    
    expect(provider).toBeInstanceOf(OpenAIProvider);
  });

  test('应该正确选择 Claude Provider', () => {
    const config = {
      apiProvider: 'claude',
      apiKey: 'test-key'
    };
    
    const service = new LLMService(config);
    const provider = service.getProvider();
    
    expect(provider).toBeInstanceOf(ClaudeProvider);
  });

  test('应该正确选择 Custom Provider', () => {
    const config = {
      apiProvider: 'custom',
      customEndpoint: 'http://localhost:11434/v1/chat/completions',
      modelName: 'llama3.2'
    };
    
    const service = new LLMService(config);
    const provider = service.getProvider();
    
    expect(provider).toBeInstanceOf(CustomProvider);
  });

  test('应该在不支持的提供商时抛出错误', () => {
    const config = {
      apiProvider: 'unknown',
      apiKey: 'test-key'
    };
    
    const service = new LLMService(config);
    
    expect(() => service.getProvider()).toThrow('不支持的 API 提供商');
  });
});

describe('LLMService - 配置验证', () => {
  test('应该验证 OpenAI 配置需要 API Key', () => {
    const config = {
      apiProvider: 'openai',
      apiKey: ''
    };
    
    const service = new LLMService(config);
    
    expect(() => service.validateConfig()).toThrow('请配置 OpenAI API Key');
  });

  test('应该验证 Claude 配置需要 API Key', () => {
    const config = {
      apiProvider: 'claude',
      apiKey: ''
    };
    
    const service = new LLMService(config);
    
    expect(() => service.validateConfig()).toThrow('请配置 Claude API Key');
  });

  test('应该验证 Custom 配置需要端点', () => {
    const config = {
      apiProvider: 'custom',
      customEndpoint: '',
      modelName: 'llama3.2'
    };
    
    const service = new LLMService(config);
    
    expect(() => service.validateConfig()).toThrow('请配置自定义 API 端点');
  });

  test('应该验证 Custom 配置需要模型名称', () => {
    const config = {
      apiProvider: 'custom',
      customEndpoint: 'http://localhost:11434/v1/chat/completions',
      modelName: ''
    };
    
    const service = new LLMService(config);
    
    expect(() => service.validateConfig()).toThrow('请配置模型名称');
  });

  test('应该通过有效的 OpenAI 配置验证', () => {
    const config = {
      apiProvider: 'openai',
      apiKey: 'test-key'
    };
    
    const service = new LLMService(config);
    
    expect(() => service.validateConfig()).not.toThrow();
  });

  test('应该通过有效的 Custom 配置验证', () => {
    const config = {
      apiProvider: 'custom',
      customEndpoint: 'http://localhost:11434/v1/chat/completions',
      modelName: 'llama3.2',
      apiKey: '' // Custom provider 的 API Key 是可选的
    };
    
    const service = new LLMService(config);
    
    expect(() => service.validateConfig()).not.toThrow();
  });
});

describe('BaseProvider - 内容准备', () => {
  test('应该限制内容长度为 8000 字符', () => {
    const provider = new OpenAIProvider('test-key');
    const longContent = 'A'.repeat(10000);
    
    const content = {
      content: longContent
    };
    
    const prepared = provider.prepareContent(content);
    
    expect(prepared.length).toBe(8000);
  });

  test('应该使用 content 字段', () => {
    const provider = new OpenAIProvider('test-key');
    const content = {
      content: 'Test content',
      html: 'Test html'
    };
    
    const prepared = provider.prepareContent(content);
    
    expect(prepared).toBe('Test content');
  });

  test('应该在 content 为空时使用 html 字段', () => {
    const provider = new OpenAIProvider('test-key');
    const content = {
      content: '',
      html: 'Test html'
    };
    
    const prepared = provider.prepareContent(content);
    
    expect(prepared).toBe('Test html');
  });
});

describe('CustomProvider - API Key 可选', () => {
  test('应该支持无 API Key 的配置（本地 LLM）', () => {
    const provider = new CustomProvider(
      'http://localhost:11434/v1/chat/completions',
      '', // 空 API Key
      'llama3.2'
    );
    
    expect(provider.apiKey).toBe('');
    expect(provider.endpoint).toBe('http://localhost:11434/v1/chat/completions');
    expect(provider.model).toBe('llama3.2');
  });

  test('应该支持有 API Key 的配置', () => {
    const provider = new CustomProvider(
      'https://api.example.com/v1/chat/completions',
      'test-key',
      'custom-model'
    );
    
    expect(provider.apiKey).toBe('test-key');
  });
});

describe('BaseProvider - 标签解析', () => {
  test('应该正确解析逗号分隔的标签', () => {
    const provider = new OpenAIProvider('test-key');
    const tagsText = '技术,编程,人工智能';
    
    const tags = provider.parseTags(tagsText, 5);
    
    expect(tags).toEqual(['技术', '编程', '人工智能']);
  });

  test('应该正确解析中文逗号分隔的标签', () => {
    const provider = new OpenAIProvider('test-key');
    const tagsText = '技术，编程，人工智能';
    
    const tags = provider.parseTags(tagsText, 5);
    
    expect(tags).toEqual(['技术', '编程', '人工智能']);
  });

  test('应该正确解析换行分隔的标签', () => {
    const provider = new OpenAIProvider('test-key');
    const tagsText = '技术\n编程\n人工智能';
    
    const tags = provider.parseTags(tagsText, 5);
    
    expect(tags).toEqual(['技术', '编程', '人工智能']);
  });

  test('应该过滤空标签', () => {
    const provider = new OpenAIProvider('test-key');
    const tagsText = '技术,,编程,  ,人工智能';
    
    const tags = provider.parseTags(tagsText, 5);
    
    expect(tags).toEqual(['技术', '编程', '人工智能']);
  });

  test('应该限制标签数量', () => {
    const provider = new OpenAIProvider('test-key');
    const tagsText = '标签1,标签2,标签3,标签4,标签5,标签6,标签7';
    
    const tags = provider.parseTags(tagsText, 3);
    
    expect(tags).toHaveLength(3);
    expect(tags).toEqual(['标签1', '标签2', '标签3']);
  });

  test('应该过滤过长的标签', () => {
    const provider = new OpenAIProvider('test-key');
    const longTag = 'A'.repeat(50);
    const tagsText = `技术,${longTag},编程`;
    
    const tags = provider.parseTags(tagsText, 5);
    
    expect(tags).toEqual(['技术', '编程']);
  });

  test('应该去除标签前后的空格', () => {
    const provider = new OpenAIProvider('test-key');
    const tagsText = '  技术  ,  编程  ,  人工智能  ';
    
    const tags = provider.parseTags(tagsText, 5);
    
    expect(tags).toEqual(['技术', '编程', '人工智能']);
  });
});
