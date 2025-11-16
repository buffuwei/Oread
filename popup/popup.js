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
    console.log('[Popup] handleSaveArticle: 开始保存文章');
    
    // 获取配置
    console.log('[Popup] handleSaveArticle: 获取配置');
    const config = await StorageManager.getConfig();
    console.log('[Popup] handleSaveArticle: 配置获取成功', { activeLlmId: config.activeLlmId });
    
    // 验证配置
    console.log('[Popup] handleSaveArticle: 验证配置');
    const validation = StorageManager.validateConfig(config);
    console.log('[Popup] handleSaveArticle: 配置验证结果', validation);
    
    if (!validation.valid) {
      showStatus(`请先配置：${validation.missing.join('、')}`, 'warning', 5000);
      return;
    }
    
    // 禁用按钮
    elements.saveArticle.disabled = true;
    
    // 显示处理状态
    showStatus('正在提取内容...', 'loading');
    
    // 获取当前标签页
    console.log('[Popup] handleSaveArticle: 获取当前标签页');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('[Popup] handleSaveArticle: 标签页信息', { id: tab?.id, url: tab?.url });
    
    if (!tab || !tab.id) {
      throw new Error('无法获取当前标签页');
    }
    
    // 发送消息到 Background
    console.log('[Popup] handleSaveArticle: 发送消息到 Background', { tabId: tab.id });
    chrome.runtime.sendMessage({
      action: 'saveArticle',
      tabId: tab.id
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[Popup] handleSaveArticle: chrome.runtime.lastError:', chrome.runtime.lastError);
        showStatus('无法连接到后台服务，请刷新页面后重试', 'error', 5000);
        elements.saveArticle.disabled = false;
      } else {
        console.log('[Popup] handleSaveArticle: 消息发送成功', response);
      }
    });
    
  } catch (error) {
    console.error('[Popup] handleSaveArticle: 保存文章失败:', error);
    console.error('[Popup] handleSaveArticle: 错误堆栈:', error.stack);
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

/**
 * 初始化popup
 */
async function initPopup() {
  try {
    console.log('[Popup] initPopup: 开始初始化');
    
    // 检查配置
    console.log('[Popup] initPopup: 获取配置');
    const config = await StorageManager.getConfig();
    console.log('[Popup] initPopup: 配置获取成功', config);
    
    const validation = StorageManager.validateConfig(config);
    console.log('[Popup] initPopup: 配置验证结果', validation);
    
    if (!validation.valid) {
      showStatus(`请先配置：${validation.missing.join('、')}`, 'warning');
      if (elements.saveArticle) {
        elements.saveArticle.disabled = true;
      }
    }
    
    console.log('[Popup] initPopup: 初始化完成');
  } catch (error) {
    console.error('[Popup] initPopup: 初始化失败:', error);
    console.error('[Popup] initPopup: 错误堆栈:', error.stack);
    showStatus('初始化失败，请刷新后重试', 'error');
  }
}

// 事件监听器
if (elements.openSettings) {
  elements.openSettings.addEventListener('click', openSettings);
}

if (elements.saveArticle) {
  elements.saveArticle.addEventListener('click', handleSaveArticle);
}

// 初始化
initPopup();
