/**
 * 测试 Markdown 生成器
 * Requirements: 4.1, 4.6
 */

const MarkdownGenerator = require('../services/markdown-generator.js');

describe('MarkdownGenerator - Frontmatter 生成', () => {
  let generator;
  
  beforeEach(() => {
    generator = new MarkdownGenerator();
  });

  test('应该生成有效的 YAML frontmatter (Requirement 4.1)', () => {
    const content = {
      title: 'Test Article',
      url: 'https://example.com/article',
      author: 'John Doe'
    };
    
    const frontmatter = generator.generateFrontmatter(content);
    
    // 验证 frontmatter 格式
    expect(frontmatter).toContain('---');
    expect(frontmatter).toContain('title: Test Article');
    expect(frontmatter).toContain('url: https://example.com/article');
    expect(frontmatter).toContain('author: John Doe');
    expect(frontmatter).toMatch(/tags: \[.*read-later.*\]/);
    expect(frontmatter).toMatch(/saved: \d{4}-\d{2}-\d{2}T/);
  });

  test('应该正确转义 YAML 特殊字符', () => {
    const content = {
      title: 'Article: A Guide [2024]',
      url: 'https://example.com',
      author: 'Author "Name"'
    };
    
    const frontmatter = generator.generateFrontmatter(content);
    
    // 包含特殊字符的字段应该被引号包裹
    expect(frontmatter).toContain('title: "Article: A Guide [2024]"');
    expect(frontmatter).toContain('author: "Author \\"Name\\""');
  });

  test('应该处理缺失的作者信息', () => {
    const content = {
      title: 'Test Article',
      url: 'https://example.com',
      author: ''
    };
    
    const frontmatter = generator.generateFrontmatter(content);
    
    expect(frontmatter).toContain('author: 未知');
  });

  test('应该包含提取的标签 (Requirement 4.2)', () => {
    const content = {
      title: 'Test Article',
      url: 'https://example.com',
      author: 'John Doe'
    };
    const tags = ['技术', '编程', '人工智能'];
    
    const frontmatter = generator.generateFrontmatter(content, tags);
    
    expect(frontmatter).toMatch(/tags: \[.*read-later.*技术.*编程.*人工智能.*\]/);
  });

  test('应该在没有提取标签时只包含默认标签', () => {
    const content = {
      title: 'Test Article',
      url: 'https://example.com',
      author: 'John Doe'
    };
    
    const frontmatter = generator.generateFrontmatter(content, null);
    
    expect(frontmatter).toMatch(/tags: \[.*read-later.*\]/);
  });

  test('应该去重标签', () => {
    const content = {
      title: 'Test Article',
      url: 'https://example.com',
      author: 'John Doe'
    };
    const tags = ['技术', 'read-later', '编程']; // 包含重复的 read-later
    
    const frontmatter = generator.generateFrontmatter(content, tags);
    
    // 应该只出现一次 read-later
    const tagMatches = frontmatter.match(/read-later/g);
    expect(tagMatches).toHaveLength(1);
  });

  test('应该转义标签中的特殊字符', () => {
    const content = {
      title: 'Test Article',
      url: 'https://example.com',
      author: 'John Doe'
    };
    const tags = ['C++', 'Node.js', 'AI/ML'];
    
    const frontmatter = generator.generateFrontmatter(content, tags);
    
    // 包含特殊字符的标签应该被正确转义
    expect(frontmatter).toMatch(/tags: \[.*read-later/);
    expect(frontmatter).toContain('C++');
  });
});

describe('MarkdownGenerator - Body 生成', () => {
  let generator;
  
  beforeEach(() => {
    generator = new MarkdownGenerator();
  });

  test('应该生成包含所有必要部分的文档主体', () => {
    const content = {
      title: 'Test Article',
      url: 'https://example.com/article',
      author: 'John Doe',
      publishDate: '2024-01-01',
      html: '<p>Article content</p>',
      images: []
    };
    const summary = 'This is a test summary.';
    
    const body = generator.generateBody(content, summary);
    
    // 验证包含所有必要部分
    expect(body).toContain('# Test Article');
    expect(body).toContain('原文链接: [https://example.com/article]');
    expect(body).toContain('作者: John Doe');
    expect(body).toContain('发布时间: 2024-01-01');
    expect(body).toContain('## AI 摘要');
    expect(body).toContain('This is a test summary.');
    expect(body).toContain('## 原文内容');
    expect(body).toContain('<p>Article content</p>');
  });

  test('应该正确生成图片部分', () => {
    const images = [
      { src: 'https://example.com/img1.jpg', alt: 'Image 1' },
      { src: 'https://example.com/img2.jpg', alt: '' }
    ];
    
    const imageSection = generator.generateImageSection(images);
    
    expect(imageSection).toContain('## 相关图片');
    expect(imageSection).toContain('![Image 1](https://example.com/img1.jpg)');
    expect(imageSection).toContain('![图片 2](https://example.com/img2.jpg)');
  });

  test('应该使用本地路径当提供图片映射时 (Requirement 2.1)', () => {
    const images = [
      { src: 'https://example.com/img1.jpg', alt: 'Image 1' },
      { src: 'https://example.com/img2.jpg', alt: 'Image 2' }
    ];
    
    const imageMapping = {
      'https://example.com/img1.jpg': '../attachments/test-article/image-1.jpg',
      'https://example.com/img2.jpg': '../attachments/test-article/image-2.jpg'
    };
    
    const imageSection = generator.generateImageSection(images, imageMapping);
    
    expect(imageSection).toContain('## 相关图片');
    expect(imageSection).toContain('![Image 1](../attachments/test-article/image-1.jpg)');
    expect(imageSection).toContain('![Image 2](../attachments/test-article/image-2.jpg)');
  });

  test('应该对未映射的图片使用原始 URL', () => {
    const images = [
      { src: 'https://example.com/img1.jpg', alt: 'Image 1' },
      { src: 'https://example.com/img2.jpg', alt: 'Image 2' }
    ];
    
    const imageMapping = {
      'https://example.com/img1.jpg': '../attachments/test-article/image-1.jpg'
      // img2 没有映射
    };
    
    const imageSection = generator.generateImageSection(images, imageMapping);
    
    expect(imageSection).toContain('![Image 1](../attachments/test-article/image-1.jpg)');
    expect(imageSection).toContain('![Image 2](https://example.com/img2.jpg)');
  });

  test('应该在没有图片时返回空字符串', () => {
    const images = null;
    const imageSection = generator.generateImageSection(images);
    
    expect(imageSection).toBe('');
  });
});

describe('MarkdownGenerator - 文件名生成', () => {
  let generator;
  
  beforeEach(() => {
    generator = new MarkdownGenerator();
  });

  test('应该生成安全的文件名 (Requirement 4.6)', () => {
    const title = 'Test Article: A Guide';
    
    const filename = generator.generateSafeFilename(title);
    
    // 验证文件名格式
    expect(filename).toMatch(/^Test-Article-A-Guide-\d+\.md$/);
    expect(filename).not.toContain(':');
  });

  test('应该移除特殊字符', () => {
    const title = 'Article/with\\special?chars*|"<>';
    
    const filename = generator.generateSafeFilename(title);
    
    // 特殊字符应该被替换为连字符
    expect(filename).not.toContain('/');
    expect(filename).not.toContain('\\');
    expect(filename).not.toContain('?');
    expect(filename).not.toContain('*');
    expect(filename).not.toContain('|');
    expect(filename).not.toContain('"');
    expect(filename).not.toContain('<');
    expect(filename).not.toContain('>');
  });

  test('应该限制文件名长度为 100 字符', () => {
    const longTitle = 'A'.repeat(150);
    
    const filename = generator.generateSafeFilename(longTitle);
    
    // 移除时间戳和扩展名后，文件名应该不超过 100 字符
    const nameWithoutTimestamp = filename.replace(/-\d+\.md$/, '');
    expect(nameWithoutTimestamp.length).toBeLessThanOrEqual(100);
  });

  test('应该添加时间戳避免重名', async () => {
    const title = 'Test Article';
    
    const filename1 = generator.generateSafeFilename(title);
    
    // 等待 1 毫秒确保时间戳不同
    await new Promise(resolve => setTimeout(resolve, 1));
    
    const filename2 = generator.generateSafeFilename(title);
    
    // 两次生成的文件名应该不同（因为时间戳不同）
    expect(filename1).not.toBe(filename2);
  });

  test('应该移除首尾的连字符', () => {
    const title = '-Test Article-';
    
    const filename = generator.generateSafeFilename(title);
    
    expect(filename).toMatch(/^Test-Article-\d+\.md$/);
  });
});

describe('MarkdownGenerator - 完整文档生成', () => {
  let generator;
  
  beforeEach(() => {
    generator = new MarkdownGenerator();
  });

  test('应该生成完整的 Markdown 文档', () => {
    const content = {
      title: 'Test Article',
      url: 'https://example.com',
      author: 'John Doe',
      html: '<p>Content</p>',
      images: []
    };
    const summary = 'Test summary';
    
    const markdown = generator.generate(content, summary);
    
    // 验证包含 frontmatter 和 body
    expect(markdown).toContain('---');
    expect(markdown).toContain('title: Test Article');
    expect(markdown).toContain('# Test Article');
    expect(markdown).toContain('## AI 摘要');
    expect(markdown).toContain('Test summary');
  });

  test('应该生成包含本地化图片的完整文档 (Requirement 2.1, 4.5)', () => {
    const content = {
      title: 'Test Article',
      url: 'https://example.com',
      author: 'John Doe',
      html: '<p>Content</p>',
      images: [
        { src: 'https://example.com/img1.jpg', alt: 'Image 1' }
      ]
    };
    const summary = 'Test summary';
    const imageMapping = {
      'https://example.com/img1.jpg': '../attachments/test-article/image-1.jpg'
    };
    
    const markdown = generator.generate(content, summary, imageMapping);
    
    // 验证使用本地路径
    expect(markdown).toContain('![Image 1](../attachments/test-article/image-1.jpg)');
    expect(markdown).not.toContain('https://example.com/img1.jpg');
  });

  test('应该生成包含提取标签的完整文档 (Requirement 4.2)', () => {
    const content = {
      title: 'Test Article',
      url: 'https://example.com',
      author: 'John Doe',
      html: '<p>Content</p>',
      images: []
    };
    const summary = 'Test summary';
    const tags = ['技术', '编程', '人工智能'];
    
    const markdown = generator.generate(content, summary, null, tags);
    
    // 验证包含提取的标签
    expect(markdown).toMatch(/tags: \[.*read-later.*技术.*编程.*人工智能.*\]/);
  });
});
