/**
 * 测试图片筛选逻辑
 * Requirements: 2.2, 2.3, 2.4, 2.6
 */

// 加载 ContentExtractor 类
const ContentExtractor = require('../content.js');

describe('ContentExtractor - 图片筛选逻辑', () => {
  let extractor;
  
  beforeEach(() => {
    extractor = new ContentExtractor();
    
    // 设置基本的 DOM 环境
    document.body.innerHTML = '';
  });

  test('应该过滤小于 200x200 像素的图片 (Requirement 2.2)', () => {
    // 创建测试图片
    document.body.innerHTML = `
      <img src="https://example.com/small.jpg" width="100" height="100" />
      <img src="https://example.com/large.jpg" width="300" height="300" />
    `;
    
    const images = extractor.extractImportantImages();
    
    // 应该只包含大图片
    expect(images).toHaveLength(1);
    expect(images[0].src).toBe('https://example.com/large.jpg');
  });

  test('应该过滤包含 "ad"、"icon"、"logo" 类名的图片 (Requirement 2.3)', () => {
    document.body.innerHTML = `
      <img src="https://example.com/ad.jpg" class="advertisement" width="300" height="300" />
      <img src="https://example.com/icon.jpg" class="site-icon" width="300" height="300" />
      <img src="https://example.com/logo.jpg" class="company-logo" width="300" height="300" />
      <img src="https://example.com/content.jpg" class="article-image" width="300" height="300" />
    `;
    
    const images = extractor.extractImportantImages();
    
    // 应该只包含内容图片
    expect(images).toHaveLength(1);
    expect(images[0].src).toBe('https://example.com/content.jpg');
  });

  test('应该过滤 data URI 格式的内联图片 (Requirement 2.4)', () => {
    document.body.innerHTML = `
      <img src="data:image/png;base64,iVBORw0KGgoAAAANS" width="300" height="300" />
      <img src="https://example.com/normal.jpg" width="300" height="300" />
    `;
    
    const images = extractor.extractImportantImages();
    
    // 应该只包含正常 URL 的图片
    expect(images).toHaveLength(1);
    expect(images[0].src).toBe('https://example.com/normal.jpg');
  });

  test('应该限制保存的图片数量不超过 10 张 (Requirement 2.6)', () => {
    // 创建 15 张符合条件的图片
    let html = '';
    for (let i = 0; i < 15; i++) {
      html += `<img src="https://example.com/image${i}.jpg" width="300" height="300" />`;
    }
    document.body.innerHTML = html;
    
    const images = extractor.extractImportantImages();
    
    // 应该只返回前 10 张
    expect(images).toHaveLength(10);
  });

  test('应该提取图片的完整信息', () => {
    document.body.innerHTML = `
      <img src="https://example.com/test.jpg" alt="Test Image" width="400" height="300" />
    `;
    
    const images = extractor.extractImportantImages();
    
    expect(images).toHaveLength(1);
    expect(images[0]).toEqual({
      src: 'https://example.com/test.jpg',
      alt: 'Test Image',
      width: 400,
      height: 300
    });
  });

  test('应该处理 data-src 属性的图片', () => {
    document.body.innerHTML = `
      <img data-src="https://example.com/lazy.jpg" width="300" height="300" />
    `;
    
    const images = extractor.extractImportantImages();
    
    expect(images).toHaveLength(1);
    expect(images[0].src).toBe('https://example.com/lazy.jpg');
  });
});
