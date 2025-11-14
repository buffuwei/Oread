/**
 * Popup 交互逻辑
 */

// DOM 元素
const elements = {
  openSettings: document.getElementById('openSettings'),
  saveArticle: document.getElementById('saveArticle'),
  status: document.getElementById('status')
};

/**
 * 打开设置页面
 */
function openSettings() {
  chrome.runtime.openOptionsPage();
}

/**
 * 显示状态消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型：success, error, loading, warning
 * @param {number} duration - 自动隐藏时间（毫秒），0 表示不自动隐藏
 */
function showStatus(message, type = 'loading', duration = 0) {
  elements.status.textContent = message;
  elements.status.className = `status ${type}`;
  elements.status.style.display = 'block';
  
  // 自动隐藏
  if (duration > 0) {
    setTimeout(() => {
      elements.status.style.display = 'none';
    }, duration);
  }
}

/**
 * 隐藏状态消息
 */
function hideStatus() {
  elements.status.style.display = 'none';
}

/**
 * 保存当前页面
 */
async function handleSaveArticle() {
  try {
    // 获取配置
    const config = await StorageManager.getConfig();
    
    // 验证配置
    const validation = StorageManager.validateConfig(config);
    if (!validation.valid) {
      showStatus(`请先配置：${validation.missing.join('、')}`, 'warning', 5000);
      return;
    }
    
    // 禁用按钮
    elements.saveArticle.disabled = true;
    
    // 显示处理状态
    showStatus('正在提取内容...', 'loading');
    
    // 获取当前标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // 发送消息到 Background
    chrome.runtime.sendMessage({
      action: 'saveArticle',
      tabId: tab.id
    });
    
  } catch (error) {
    showStatus('保存失败: ' + error.message, 'error', 5000);
    elements.saveArticle.disabled = false;
  }
}

/**
 * 监听来自 Background 的状态更新
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'statusUpdate') {
    const { status, message: statusMessage } = message;
    
    switch (status) {
      case 'extracting':
        showStatus(statusMessage || '正在提取内容...', 'loading');
        break;
      case 'summarizing':
        showStatus(statusMessage || '正在生成摘要...', 'loading');
        break;
      case 'success':
        showStatus(statusMessage || '保存成功！', 'success', 3000);
        elements.saveArticle.disabled = false;
        break;
      case 'error':
        showStatus(statusMessage || '保存失败', 'error', 5000);
        elements.saveArticle.disabled = false;
        break;
    }
  }
});

// 事件监听器
elements.openSettings.addEventListener('click', openSettings);
elements.saveArticle.addEventListener('click', handleSaveArticle);
