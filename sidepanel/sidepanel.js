/**
 * Side Panel 交互逻辑
 */

// DOM 元素
const elements = {
  toggleView: document.getElementById('toggleView'),
  viewModeText: document.getElementById('viewModeText'),
  charCount: document.getElementById('charCount'),
  status: document.getElementById('status'),
  renderView: document.getElementById('renderView'),
  editView: document.getElementById('editView'),
  renderedContent: document.getElementById('renderedContent'),
  markdownEditor: document.getElementById('markdownEditor'),
  cancelBtn: document.getElementById('cancelBtn'),
  saveBtn: document.getElementById('saveBtn')
};

// 状态
let currentMarkdown = '';
let currentViewMode = 'render'; // 'render' 或 'edit'

/**
 * 初始化
 */
function init() {
  // 监听来自 Background 的消息
  chrome.runtime.onMessage.addListener(handleMessage);
  
  // 绑定事件
  elements.toggleView.addEventListener('click', toggleViewMode);
  elements.markdownEditor.addEventListener('input', updateCharCount);
  elements.cancelBtn.addEventListener('click', handleCancel);
  elements.saveBtn.addEventListener('click', handleSave);
  
  // 显示提示
  showStatus('内容已生成，请审阅', 'info');
}

/**
 * 处理来自 Background 的消息
 * @param {Object} message - 消息对象
 */
function handleMessage(message) {
  if (message.action === 'showPreview') {
    currentMarkdown = message.markdown;
    displayPreview(message.markdown, message.metadata);
  }
}

/**
 * 显示预览
 * @param {string} markdown - Markdown 内容
 * @param {Object} metadata - 元数据
 */
function displayPreview(markdown, metadata) {
  // 更新编辑器内容
  elements.markdownEditor.value = markdown;
  
  // 渲染 Markdown
  renderMarkdown(markdown);
  
  // 更新字符计数
  updateCharCount();
  
  // 显示渲染视图
  currentViewMode = 'render';
  updateViewDisplay();
}

/**
 * 渲染 Markdown
 * @param {string} markdown - Markdown 内容
 */
function renderMarkdown(markdown) {
  try {
    // 使用 marked.js 渲染
    if (typeof marked !== 'undefined') {
      // 配置 marked
      marked.setOptions({
        breaks: true,
        gfm: true
      });
      
      const html = marked.parse(markdown);
      elements.renderedContent.innerHTML = html;
    } else {
      // 如果 marked.js 未加载，显示纯文本
      elements.renderedContent.textContent = markdown;
    }
  } catch (error) {
    console.error('Markdown 渲染失败:', error);
    elements.renderedContent.textContent = markdown;
  }
}

/**
 * 切换视图模式
 */
function toggleViewMode() {
  if (currentViewMode === 'render') {
    // 切换到编辑模式
    currentViewMode = 'edit';
    
    // 从编辑器获取最新内容
    const markdown = elements.markdownEditor.value;
    currentMarkdown = markdown;
  } else {
    // 切换到渲染模式
    currentViewMode = 'render';
    
    // 重新渲染
    const markdown = elements.markdownEditor.value;
    currentMarkdown = markdown;
    renderMarkdown(markdown);
  }
  
  updateViewDisplay();
}

/**
 * 更新视图显示
 */
function updateViewDisplay() {
  if (currentViewMode === 'render') {
    elements.renderView.style.display = 'block';
    elements.editView.style.display = 'none';
    elements.viewModeText.textContent = '源码编辑';
  } else {
    elements.renderView.style.display = 'none';
    elements.editView.style.display = 'block';
    elements.viewModeText.textContent = '渲染预览';
  }
}

/**
 * 更新字符计数
 */
function updateCharCount() {
  const text = elements.markdownEditor.value;
  const charCount = text.length;
  const fileSize = new Blob([text]).size;
  
  elements.charCount.textContent = `${charCount} 字符 (${formatFileSize(fileSize)})`;
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化的文件大小
 */
function formatFileSize(bytes) {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

/**
 * 显示状态消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型：success, error, info
 */
function showStatus(message, type = 'info') {
  elements.status.textContent = message;
  elements.status.className = `status ${type}`;
  elements.status.style.display = 'block';
}

/**
 * 隐藏状态消息
 */
function hideStatus() {
  elements.status.style.display = 'none';
}

/**
 * 处理取消
 */
function handleCancel() {
  if (confirm('确定要取消保存吗？')) {
    // 发送取消消息到 Background
    chrome.runtime.sendMessage({
      action: 'cancelSave'
    });
    
    // 关闭 Side Panel
    window.close();
  }
}

/**
 * 处理保存
 */
function handleSave() {
  // 获取编辑后的内容
  const markdown = elements.markdownEditor.value;
  
  if (!markdown.trim()) {
    showStatus('内容不能为空', 'error');
    return;
  }
  
  // 禁用按钮
  elements.saveBtn.disabled = true;
  elements.cancelBtn.disabled = true;
  
  // 显示保存状态
  showStatus('正在保存...', 'info');
  
  // 发送保存消息到 Background
  chrome.runtime.sendMessage({
    action: 'confirmSave',
    markdown: markdown
  });
  
  // 等待一会儿后关闭（给 Background 时间处理）
  setTimeout(() => {
    window.close();
  }, 1000);
}

// 初始化
init();
