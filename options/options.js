/**
 * Options 页面交互逻辑
 */

// DOM 元素
const elements = {
  savePath: document.getElementById('savePath'),
  apiProvider: document.getElementById('apiProvider'),
  apiKey: document.getElementById('apiKey'),
  customEndpoint: document.getElementById('customEndpoint'),
  modelName: document.getElementById('modelName'),
  enablePreview: document.getElementById('enablePreview'),
  localizeImages: document.getElementById('localizeImages'),
  attachmentFolder: document.getElementById('attachmentFolder'),
  enableTagExtraction: document.getElementById('enableTagExtraction'),
  maxTags: document.getElementById('maxTags'),
  saveSettings: document.getElementById('saveSettings'),
  status: document.getElementById('status'),
  customEndpointGroup: document.getElementById('customEndpointGroup'),
  modelNameGroup: document.getElementById('modelNameGroup'),
  attachmentFolderGroup: document.getElementById('attachmentFolderGroup'),
  maxTagsGroup: document.getElementById('maxTagsGroup')
};

/**
 * 初始化：加载已保存的配置
 */
async function init() {
  try {
    const config = await StorageManager.getConfig();
    
    // 填充表单
    // 兼容旧配置：如果有 vaultPath 和 saveFolder，合并它们
    let savePath = config.savePath || '';
    if (!savePath && config.vaultPath) {
      const folder = config.saveFolder || 'ReadLater';
      savePath = `${config.vaultPath}/${folder}`;
    }
    elements.savePath.value = savePath;
    elements.apiProvider.value = config.apiProvider || 'openai';
    elements.apiKey.value = config.apiKey || '';
    elements.customEndpoint.value = config.customEndpoint || '';
    elements.modelName.value = config.modelName || '';
    elements.enablePreview.checked = config.enablePreview || false;
    elements.localizeImages.checked = config.localizeImages || false;
    elements.attachmentFolder.value = config.attachmentFolder || 'attachments';
    elements.enableTagExtraction.checked = config.enableTagExtraction || false;
    elements.maxTags.value = config.maxTags || 5;
    
    // 根据 API 提供商显示/隐藏自定义字段
    toggleCustomFields(config.apiProvider);
    
    // 根据图片本地化选项显示/隐藏附件文件夹字段
    toggleAttachmentFolder(config.localizeImages);
    
    // 根据标签提取选项显示/隐藏最大标签数量字段
    toggleMaxTags(config.enableTagExtraction);
  } catch (error) {
    showStatus('加载配置失败: ' + error.message, 'error');
  }
}

/**
 * 切换自定义字段的显示/隐藏
 * @param {string} provider - API 提供商
 */
function toggleCustomFields(provider) {
  if (provider === 'custom') {
    elements.customEndpointGroup.style.display = 'block';
    elements.modelNameGroup.style.display = 'block';
  } else {
    elements.customEndpointGroup.style.display = 'none';
    elements.modelNameGroup.style.display = 'none';
  }
}

/**
 * 切换附件文件夹字段的显示/隐藏
 * @param {boolean} localizeImages - 是否本地化图片
 */
function toggleAttachmentFolder(localizeImages) {
  if (localizeImages) {
    elements.attachmentFolderGroup.style.display = 'block';
  } else {
    elements.attachmentFolderGroup.style.display = 'none';
  }
}

/**
 * 切换最大标签数量字段的显示/隐藏
 * @param {boolean} enableTagExtraction - 是否启用标签提取
 */
function toggleMaxTags(enableTagExtraction) {
  if (enableTagExtraction) {
    elements.maxTagsGroup.style.display = 'block';
  } else {
    elements.maxTagsGroup.style.display = 'none';
  }
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
 * 获取表单数据
 * @returns {Object} 配置对象
 */
function getFormData() {
  return {
    savePath: elements.savePath.value.trim(),
    apiProvider: elements.apiProvider.value,
    apiKey: elements.apiKey.value.trim(),
    customEndpoint: elements.customEndpoint.value.trim(),
    modelName: elements.modelName.value.trim(),
    enablePreview: elements.enablePreview.checked,
    localizeImages: elements.localizeImages.checked,
    attachmentFolder: elements.attachmentFolder.value.trim() || 'attachments',
    enableTagExtraction: elements.enableTagExtraction.checked,
    maxTags: parseInt(elements.maxTags.value) || 5
  };
}

/**
 * 保存设置
 */
async function handleSaveSettings() {
  try {
    const config = getFormData();
    
    // 验证配置
    const validation = StorageManager.validateConfig(config);
    if (!validation.valid) {
      showStatus(`请先配置：${validation.missing.join('、')}`, 'warning', 5000);
      return;
    }
    
    // 保存配置
    await StorageManager.saveConfig(config);
    showStatus('设置已保存', 'success', 3000);
  } catch (error) {
    showStatus('保存失败: ' + error.message, 'error', 5000);
  }
}

// 事件监听器
elements.apiProvider.addEventListener('change', (e) => {
  toggleCustomFields(e.target.value);
});

elements.localizeImages.addEventListener('change', (e) => {
  toggleAttachmentFolder(e.target.checked);
});

elements.enableTagExtraction.addEventListener('change', (e) => {
  toggleMaxTags(e.target.checked);
});

elements.saveSettings.addEventListener('click', handleSaveSettings);

// 初始化
init();
