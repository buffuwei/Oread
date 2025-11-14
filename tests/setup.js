/**
 * Jest 测试环境设置
 */

// Mock chrome API
global.chrome = {
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      clear: jest.fn()
    }
  },
  runtime: {
    lastError: null,
    onMessage: {
      addListener: jest.fn()
    },
    sendMessage: jest.fn()
  }
};

// Mock Readability
global.Readability = class Readability {
  constructor(doc, options) {
    this.doc = doc;
    this.options = options;
  }
  
  parse() {
    return {
      title: 'Test Article',
      textContent: 'Test content',
      content: '<p>Test content</p>',
      excerpt: 'Test excerpt'
    };
  }
};
