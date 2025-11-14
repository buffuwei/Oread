/**
 * Options 页面交互逻辑 - 支持多 LLM 配置
 */

// DOM 元素
const elements = {
  savePath: document.getElementById('savePath'),
  activeLlmId: document.getElementById('activeLlmId'),
  llmList: document.getElementById('llmList'),
  addLlm: document.getElementById('addLlm'),
  enablePreview: document.getElementById('enablePreview'),
  localizeImages: document.getElementById('localizeImages'),
  attachmentFolder: document.getElementById('attachmentFolder'),
  enableTagExtraction: document.getElementById('enableTagExtraction'),
  maxTags: document.getElementById('maxTags'),
  saveSettings: document.getElementById('saveSettings'),
  status: document.getElementById('status'),
  attachmentFolderGroup: document.getElementById('attachmentFolderGroup'),
  maxTagsGroup: document.getElementById('maxTagsGroup'),
  
  // 模态框元素
  llmModal: document.getElementById('llmModal'),
  modalTitle: document.getElementById('modalTitle'),
  llmName: document.getElementById('llmName'),
  llmProvider: document.getElementById('llmProvider'),
  llmApiKey: document.getElementById('llmApiKey'),
  llmAzureEndpoint: document.getElementById('llmAzureEndpoint'),
  llmAzureDeployment: document.getElementById('llmAzureDeployment'),
  llmCustomEndpoint: document.getElementById('llmCustomEndpoint'),
  llmModelName: document.getElementById('llmModelName'),
  llmAzureEndpointGroup: document.getElementById('llmAzureEndpointGroup'),
  llmAzureDeploymentGroup: document.getElementById('llmAzureDeploymentGroup'),
  llmCustomEndpointGroup: document.getElementById('llmCustomEndpointGroup'),
  llmModelNameGroup: document.getElementById('llmModelNameGroup'),
  saveLlm: document.getElementById('saveLlm'),
  cancelLlm: document.getElementById('cancelLlm'),
  closeModal: document.getElementById('closeModal')
};

// 当前编辑的 LLM ID（null 表示新增）
let editingLlmId = null;

/**
 * 初始化：加载已保存的配置
 */
async function init() {
  try {
    const config = await StorageManager.getConfig();
    
    // 填充基本设置
    let savePath = config.savePath || '';
    if (!savePath && config.vaultPath) {
      const folder = config.saveFolder || 'ReadLater';
      savePath = `${config.vaultPath}/${folder}`;
    }
    elements.savePath.value = savePath;
    elements.enablePreview.checked = config.enablePreview || false;
    elements.localizeImages.checked = config.localizeImages || false;
    elements.attachmentFolder.value = config.attachmentFolder || 'attachments';
    elements.enableTagExtraction.checked = config.enableTagExtraction || false;
    elements.maxTags.value = config.maxTags || 5;
    
    // 加载 LLM 配置列表
    await loadLlmList();
    
    // 设置当前激活的 LLM
    if (config.activeLlmId) {
      elements.activeLlmId.value = config.activeLlmId;
    }
    
    // 根据选项显示/隐藏字段
    toggleAttachmentFolder(config.localizeImages);
    toggleMaxTags(config.enableTagExtraction);
  } catch (error) {
    showStatus('加载配置失败: ' + error.message, 'error');
  }
}

/**
 * 加载 LLM 配置列表
 */
async function loadLlmList() {
  try {
    const config = await StorageManager.getConfig();
    const llms = config.llms || [];
    
    // 更新下拉选择框
    elements.activeLlmId.innerHTML = llms.length === 0 
      ? '<option value="">请先添加 LLM 配置</option>'
      : llms.map(llm => `<option value="${llm.id}">${llm.name}</option>`).join('');
    
    // 更新 LLM 列表
    if (llms.length === 0) {
      elements.llmList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🤖</div>
          <div class="empty-state-text">还没有配置 LLM，点击下方按钮添加</div>
        </div>
      `;
    } else {
      elements.llmList.innerHTML = llms.map(llm => createLlmItem(llm)).join('');
      
      // 绑定编辑和删除事件
      llms.forEach(llm => {
        document.getElementById(`edit-${llm.id}`).addEventListener('click', () => editLlm(llm.id));
        document.getElementById(`delete-${llm.id}`).addEventListener('click', () => deleteLlm(llm.id));
      });
    }
  } catch (error) {
    showStatus('加载 LLM 列表失败: ' + error.message, 'error');
  }
}

/**
 * 创建 LLM 列表项 HTML
 */
function createLlmItem(llm) {
  const providerNames = {
    openai: 'OpenAI',
    azure: 'Azure OpenAI',
    claude: 'Claude',
    custom: '自定义'
  };
  
  const details = [];
  details.push(providerNames[llm.provider] || llm.provider);
  if (llm.azureDeployment) details.push(llm.azureDeployment);
  if (llm.modelName) details.push(llm.modelName);
  if (llm.azureEndpoint) details.push(llm.azureEndpoint);
  if (llm.customEndpoint) details.push(llm.customEndpoint);
  
  return `
    <div class="llm-item">
      <div class="llm-info">
        <div class="llm-name">${llm.name}</div>
        <div class="llm-details">${details.join(' • ')}</div>
      </div>
      <div class="llm-actions">
        <button type="button" id="edit-${llm.id}" class="btn-icon">✏️ 编辑</button>
        <button type="button" id="delete-${llm.id}" class="btn-icon delete">🗑️ 删除</button>
      </div>
    </div>
  `;
}

/**
 * 打开添加 LLM 模态框
 */
function openAddLlmModal() {
  editingLlmId = null;
  elements.modalTitle.textContent = '添加 LLM';
  elements.llmName.value = '';
  elements.llmProvider.value = 'openai';
  elements.llmApiKey.value = '';
  elements.llmAzureEndpoint.value = '';
  elements.llmAzureDeployment.value = '';
  elements.llmCustomEndpoint.value = '';
  elements.llmModelName.value = '';
  toggleLlmCustomFields('openai');
  elements.llmModal.style.display = 'flex';
}

/**
 * 编辑 LLM
 */
async function editLlm(llmId) {
  try {
    const config = await StorageManager.getConfig();
    const llm = (config.llms || []).find(l => l.id === llmId);
    
    if (!llm) {
      showStatus('找不到该 LLM 配置', 'error', 3000);
      return;
    }
    
    editingLlmId = llmId;
    elements.modalTitle.textContent = '编辑 LLM';
    elements.llmName.value = llm.name;
    elements.llmProvider.value = llm.provider;
    elements.llmApiKey.value = llm.apiKey || '';
    elements.llmAzureEndpoint.value = llm.azureEndpoint || '';
    elements.llmAzureDeployment.value = llm.azureDeployment || '';
    elements.llmCustomEndpoint.value = llm.customEndpoint || '';
    elements.llmModelName.value = llm.modelName || '';
    toggleLlmCustomFields(llm.provider);
    elements.llmModal.style.display = 'flex';
  } catch (error) {
    showStatus('加载 LLM 配置失败: ' + error.message, 'error');
  }
}

/**
 * 删除 LLM
 */
async function deleteLlm(llmId) {
  if (!confirm('确定要删除这个 LLM 配置吗？')) {
    return;
  }
  
  try {
    const config = await StorageManager.getConfig();
    config.llms = (config.llms || []).filter(l => l.id !== llmId);
    
    // 如果删除的是当前激活的 LLM，清除激活状态
    if (config.activeLlmId === llmId) {
      config.activeLlmId = config.llms.length > 0 ? config.llms[0].id : null;
    }
    
    await StorageManager.saveConfig(config);
    await loadLlmList();
    
    // 更新激活的 LLM 选择
    if (config.activeLlmId) {
      elements.activeLlmId.value = config.activeLlmId;
    }
    
    showStatus('LLM 配置已删除', 'success', 3000);
  } catch (error) {
    showStatus('删除失败: ' + error.message, 'error');
  }
}

/**
 * 保存 LLM 配置
 */
async function saveLlmConfig() {
  try {
    const name = elements.llmName.value.trim();
    const provider = elements.llmProvider.value;
    const apiKey = elements.llmApiKey.value.trim();
    const azureEndpoint = elements.llmAzureEndpoint.value.trim();
    const azureDeployment = elements.llmAzureDeployment.value.trim();
    const customEndpoint = elements.llmCustomEndpoint.value.trim();
    const modelName = elements.llmModelName.value.trim();
    
    // 验证
    if (!name) {
      showStatus('请输入配置名称', 'warning', 3000);
      return;
    }
    
    if (provider === 'azure' && !azureEndpoint) {
      showStatus('请输入 Azure 端点', 'warning', 3000);
      return;
    }
    
    if (provider === 'azure' && !azureDeployment) {
      showStatus('请输入部署名称', 'warning', 3000);
      return;
    }
    
    if (provider === 'custom' && !customEndpoint) {
      showStatus('请输入自定义 API 端点', 'warning', 3000);
      return;
    }
    
    if (provider === 'custom' && !modelName) {
      showStatus('请输入模型名称', 'warning', 3000);
      return;
    }
    
    const config = await StorageManager.getConfig();
    const llms = config.llms || [];
    
    const llmConfig = {
      id: editingLlmId || `llm_${Date.now()}`,
      name,
      provider,
      apiKey,
      azureEndpoint,
      azureDeployment,
      customEndpoint,
      modelName
    };
    
    if (editingLlmId) {
      // 更新现有配置
      const index = llms.findIndex(l => l.id === editingLlmId);
      if (index !== -1) {
        llms[index] = llmConfig;
      }
    } else {
      // 添加新配置
      llms.push(llmConfig);
      
      // 如果是第一个 LLM，自动设为激活
      if (llms.length === 1) {
        config.activeLlmId = llmConfig.id;
      }
    }
    
    config.llms = llms;
    await StorageManager.saveConfig(config);
    
    closeLlmModal();
    await loadLlmList();
    
    // 更新激活的 LLM 选择
    if (config.activeLlmId) {
      elements.activeLlmId.value = config.activeLlmId;
    }
    
    showStatus('LLM 配置已保存', 'success', 3000);
  } catch (error) {
    showStatus('保存失败: ' + error.message, 'error');
  }
}

/**
 * 关闭模态框
 */
function closeLlmModal() {
  elements.llmModal.style.display = 'none';
  editingLlmId = null;
}

/**
 * 切换 LLM 自定义字段的显示/隐藏
 */
function toggleLlmCustomFields(provider) {
  // 隐藏所有特定字段
  elements.llmAzureEndpointGroup.style.display = 'none';
  elements.llmAzureDeploymentGroup.style.display = 'none';
  elements.llmCustomEndpointGroup.style.display = 'none';
  elements.llmModelNameGroup.style.display = 'none';
  
  // 根据提供商显示对应字段
  if (provider === 'azure') {
    elements.llmAzureEndpointGroup.style.display = 'block';
    elements.llmAzureDeploymentGroup.style.display = 'block';
  } else if (provider === 'custom') {
    elements.llmCustomEndpointGroup.style.display = 'block';
    elements.llmModelNameGroup.style.display = 'block';
  }
}

/**
 * 切换附件文件夹字段的显示/隐藏
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
 */
function showStatus(message, type = 'loading', duration = 0) {
  elements.status.textContent = message;
  elements.status.className = `status ${type}`;
  elements.status.style.display = 'block';
  
  if (duration > 0) {
    setTimeout(() => {
      elements.status.style.display = 'none';
    }, duration);
  }
}

/**
 * 获取表单数据
 */
function getFormData() {
  return {
    savePath: elements.savePath.value.trim(),
    activeLlmId: elements.activeLlmId.value,
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
    const formData = getFormData();
    
    // 验证
    if (!formData.savePath) {
      showStatus('请输入保存路径', 'warning', 3000);
      return;
    }
    
    if (!formData.activeLlmId) {
      showStatus('请先添加并选择一个 LLM', 'warning', 3000);
      return;
    }
    
    // 获取完整配置并更新
    const config = await StorageManager.getConfig();
    Object.assign(config, formData);
    
    await StorageManager.saveConfig(config);
    showStatus('设置已保存', 'success', 3000);
  } catch (error) {
    showStatus('保存失败: ' + error.message, 'error', 5000);
  }
}

// 事件监听器
elements.addLlm.addEventListener('click', openAddLlmModal);
elements.saveLlm.addEventListener('click', saveLlmConfig);
elements.cancelLlm.addEventListener('click', closeLlmModal);
elements.closeModal.addEventListener('click', closeLlmModal);

elements.llmProvider.addEventListener('change', (e) => {
  toggleLlmCustomFields(e.target.value);
});

elements.localizeImages.addEventListener('change', (e) => {
  toggleAttachmentFolder(e.target.checked);
});

elements.enableTagExtraction.addEventListener('change', (e) => {
  toggleMaxTags(e.target.checked);
});

elements.saveSettings.addEventListener('click', handleSaveSettings);

// 点击模态框背景关闭
elements.llmModal.addEventListener('click', (e) => {
  if (e.target === elements.llmModal) {
    closeLlmModal();
  }
});

// 初始化
init();
