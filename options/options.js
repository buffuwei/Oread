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
  modalStatus: document.getElementById('modalStatus'),
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
  testLlm: document.getElementById('testLlm'),
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
    
    if (elements.savePath) elements.savePath.value = savePath;
    if (elements.enablePreview) elements.enablePreview.checked = config.enablePreview || false;
    if (elements.localizeImages) elements.localizeImages.checked = config.localizeImages || false;
    if (elements.attachmentFolder) elements.attachmentFolder.value = config.attachmentFolder || 'attachments';
    if (elements.enableTagExtraction) elements.enableTagExtraction.checked = config.enableTagExtraction || false;
    if (elements.maxTags) elements.maxTags.value = config.maxTags || 5;
    
    // 加载 LLM 配置列表
    await loadLlmList();
    
    // 设置当前激活的 LLM
    if (config.activeLlmId && elements.activeLlmId) {
      elements.activeLlmId.value = config.activeLlmId;
    }
    
    // 根据选项显示/隐藏字段
    toggleAttachmentFolder(config.localizeImages);
    toggleMaxTags(config.enableTagExtraction);
  } catch (error) {
    console.error('初始化失败:', error);
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
    if (elements.activeLlmId) {
      elements.activeLlmId.innerHTML = llms.length === 0 
        ? '<option value="">请先添加 LLM 配置</option>'
        : llms.map(llm => `<option value="${llm.id}">${llm.name}</option>`).join('');
    }
    
    // 更新 LLM 列表
    if (elements.llmList) {
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
          const editBtn = document.getElementById(`edit-${llm.id}`);
          const deleteBtn = document.getElementById(`delete-${llm.id}`);
          if (editBtn) editBtn.addEventListener('click', () => editLlm(llm.id));
          if (deleteBtn) deleteBtn.addEventListener('click', () => deleteLlm(llm.id));
        });
      }
    }
  } catch (error) {
    console.error('加载LLM列表失败:', error);
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
  if (!elements.llmModal) return;
  
  editingLlmId = null;
  if (elements.modalTitle) elements.modalTitle.textContent = '添加 LLM';
  if (elements.llmName) elements.llmName.value = '';
  if (elements.llmProvider) elements.llmProvider.value = 'openai';
  if (elements.llmApiKey) elements.llmApiKey.value = '';
  if (elements.llmAzureEndpoint) elements.llmAzureEndpoint.value = '';
  if (elements.llmAzureDeployment) elements.llmAzureDeployment.value = '';
  if (elements.llmCustomEndpoint) elements.llmCustomEndpoint.value = '';
  if (elements.llmModelName) elements.llmModelName.value = '';
  toggleLlmCustomFields('openai');
  hideModalStatus();
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
    if (elements.modalTitle) elements.modalTitle.textContent = '编辑 LLM';
    if (elements.llmName) elements.llmName.value = llm.name;
    if (elements.llmProvider) elements.llmProvider.value = llm.provider;
    if (elements.llmApiKey) elements.llmApiKey.value = llm.apiKey || '';
    if (elements.llmAzureEndpoint) elements.llmAzureEndpoint.value = llm.azureEndpoint || '';
    if (elements.llmAzureDeployment) elements.llmAzureDeployment.value = llm.azureDeployment || '';
    if (elements.llmCustomEndpoint) elements.llmCustomEndpoint.value = llm.customEndpoint || '';
    if (elements.llmModelName) elements.llmModelName.value = llm.modelName || '';
    toggleLlmCustomFields(llm.provider);
    hideModalStatus();
    if (elements.llmModal) elements.llmModal.style.display = 'flex';
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
    const name = elements.llmName ? elements.llmName.value.trim() : '';
    const provider = elements.llmProvider ? elements.llmProvider.value : 'openai';
    const apiKey = elements.llmApiKey ? elements.llmApiKey.value.trim() : '';
    const azureEndpoint = elements.llmAzureEndpoint ? elements.llmAzureEndpoint.value.trim() : '';
    const azureDeployment = elements.llmAzureDeployment ? elements.llmAzureDeployment.value.trim() : '';
    const customEndpoint = elements.llmCustomEndpoint ? elements.llmCustomEndpoint.value.trim() : '';
    const modelName = elements.llmModelName ? elements.llmModelName.value.trim() : '';
    
    // 验证
    if (!name) {
      showModalStatus('请输入配置名称', 'warning', 3000);
      return;
    }
    
    if (provider === 'azure' && !azureEndpoint) {
      showModalStatus('请输入 Azure 端点', 'warning', 3000);
      return;
    }
    
    if (provider === 'azure' && !azureDeployment) {
      showModalStatus('请输入部署名称', 'warning', 3000);
      return;
    }
    
    if (provider === 'custom' && !customEndpoint) {
      showModalStatus('请输入自定义 API 端点', 'warning', 3000);
      return;
    }
    
    if (provider === 'custom' && !modelName) {
      showModalStatus('请输入模型名称', 'warning', 3000);
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
  if (elements.llmModal) {
    elements.llmModal.style.display = 'none';
  }
  hideModalStatus();
  editingLlmId = null;
}

/**
 * 切换 LLM 自定义字段的显示/隐藏
 */
function toggleLlmCustomFields(provider) {
  // 隐藏所有特定字段
  if (elements.llmAzureEndpointGroup) elements.llmAzureEndpointGroup.style.display = 'none';
  if (elements.llmAzureDeploymentGroup) elements.llmAzureDeploymentGroup.style.display = 'none';
  if (elements.llmCustomEndpointGroup) elements.llmCustomEndpointGroup.style.display = 'none';
  if (elements.llmModelNameGroup) elements.llmModelNameGroup.style.display = 'none';
  
  // 根据提供商显示对应字段
  if (provider === 'azure') {
    if (elements.llmAzureEndpointGroup) elements.llmAzureEndpointGroup.style.display = 'block';
    if (elements.llmAzureDeploymentGroup) elements.llmAzureDeploymentGroup.style.display = 'block';
  } else if (provider === 'custom') {
    if (elements.llmCustomEndpointGroup) elements.llmCustomEndpointGroup.style.display = 'block';
    if (elements.llmModelNameGroup) elements.llmModelNameGroup.style.display = 'block';
  }
}

/**
 * 切换附件文件夹字段的显示/隐藏
 */
function toggleAttachmentFolder(localizeImages) {
  if (!elements.attachmentFolderGroup) return;
  
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
  if (!elements.maxTagsGroup) return;
  
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
  if (!elements.status) return;
  
  elements.status.textContent = message;
  elements.status.className = `status ${type}`;
  elements.status.style.display = 'block';
  
  if (duration > 0) {
    setTimeout(() => {
      if (elements.status) {
        elements.status.style.display = 'none';
      }
    }, duration);
  }
}

/**
 * 显示模态框内的状态消息
 */
function showModalStatus(message, type = 'loading', duration = 0) {
  if (!elements.modalStatus) return;
  
  elements.modalStatus.textContent = message;
  elements.modalStatus.className = `status ${type}`;
  elements.modalStatus.style.display = 'block';
  
  if (duration > 0) {
    setTimeout(() => {
      if (elements.modalStatus) {
        elements.modalStatus.style.display = 'none';
      }
    }, duration);
  }
}

/**
 * 隐藏模态框内的状态消息
 */
function hideModalStatus() {
  if (!elements.modalStatus) return;
  elements.modalStatus.style.display = 'none';
}

/**
 * 获取表单数据
 */
function getFormData() {
  return {
    savePath: elements.savePath ? elements.savePath.value.trim() : '',
    activeLlmId: elements.activeLlmId ? elements.activeLlmId.value : null,
    enablePreview: elements.enablePreview ? elements.enablePreview.checked : false,
    localizeImages: elements.localizeImages ? elements.localizeImages.checked : false,
    attachmentFolder: elements.attachmentFolder ? (elements.attachmentFolder.value.trim() || 'attachments') : 'attachments',
    enableTagExtraction: elements.enableTagExtraction ? elements.enableTagExtraction.checked : false,
    maxTags: elements.maxTags ? (parseInt(elements.maxTags.value) || 5) : 5
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

/**
 * 测试 LLM 配置
 */
async function testLlmConfig() {
  try {
    const provider = elements.llmProvider ? elements.llmProvider.value : 'openai';
    const apiKey = elements.llmApiKey ? elements.llmApiKey.value.trim() : '';
    const azureEndpoint = elements.llmAzureEndpoint ? elements.llmAzureEndpoint.value.trim() : '';
    const azureDeployment = elements.llmAzureDeployment ? elements.llmAzureDeployment.value.trim() : '';
    const customEndpoint = elements.llmCustomEndpoint ? elements.llmCustomEndpoint.value.trim() : '';
    const modelName = elements.llmModelName ? elements.llmModelName.value.trim() : '';
    
    // 基本验证
    if (provider === 'azure' && !azureEndpoint) {
      showModalStatus('请输入 Azure 端点', 'warning', 3000);
      return;
    }
    
    if (provider === 'azure' && !azureDeployment) {
      showModalStatus('请输入部署名称', 'warning', 3000);
      return;
    }
    
    if (provider === 'custom' && !customEndpoint) {
      showModalStatus('请输入自定义 API 端点', 'warning', 3000);
      return;
    }
    
    if (provider === 'custom' && !modelName) {
      showModalStatus('请输入模型名称', 'warning', 3000);
      return;
    }
    
    // 禁用测试按钮
    if (elements.testLlm) {
      elements.testLlm.disabled = true;
      elements.testLlm.textContent = '⏳ 测试中...';
    }
    
    showModalStatus('正在测试 LLM 连接...', 'loading');
    
    // 构造测试配置
    const testConfig = {
      provider,
      apiKey,
      azureEndpoint,
      azureDeployment,
      customEndpoint,
      modelName
    };
    
    // 创建 LLM 服务实例
    const llmService = new LLMService(testConfig);
    
    // 使用简单的测试内容
    const testContent = {
      title: '测试文章',
      content: '这是一篇用于测试 LLM 配置的简短文章。人工智能技术正在快速发展。'
    };
    
    // 调用 LLM 生成摘要
    const summary = await llmService.generateSummary(testContent);
    
    if (summary && summary.length > 0) {
      showModalStatus('✅ 测试成功！LLM 配置正确，可以正常使用。', 'success', 5000);
    } else {
      showModalStatus('⚠️ 测试返回了空结果，请检查配置', 'warning', 5000);
    }
  } catch (error) {
    console.error('LLM 测试失败:', error);
    showModalStatus(`❌ 测试失败: ${error.message}`, 'error', 5000);
  } finally {
    // 恢复测试按钮
    if (elements.testLlm) {
      elements.testLlm.disabled = false;
      elements.testLlm.textContent = '🧪 测试连接';
    }
  }
}

// 事件监听器
if (elements.addLlm) elements.addLlm.addEventListener('click', openAddLlmModal);
if (elements.testLlm) elements.testLlm.addEventListener('click', testLlmConfig);
if (elements.saveLlm) elements.saveLlm.addEventListener('click', saveLlmConfig);
if (elements.cancelLlm) elements.cancelLlm.addEventListener('click', closeLlmModal);
if (elements.closeModal) elements.closeModal.addEventListener('click', closeLlmModal);

if (elements.llmProvider) {
  elements.llmProvider.addEventListener('change', (e) => {
    toggleLlmCustomFields(e.target.value);
  });
}

if (elements.localizeImages) {
  elements.localizeImages.addEventListener('change', (e) => {
    toggleAttachmentFolder(e.target.checked);
  });
}

if (elements.enableTagExtraction) {
  elements.enableTagExtraction.addEventListener('change', (e) => {
    toggleMaxTags(e.target.checked);
  });
}

if (elements.saveSettings) elements.saveSettings.addEventListener('click', handleSaveSettings);

// 点击模态框背景关闭
if (elements.llmModal) {
  elements.llmModal.addEventListener('click', (e) => {
    if (e.target === elements.llmModal) {
      closeLlmModal();
    }
  });
}

// 初始化
init();
