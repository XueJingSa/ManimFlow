<template>
<div class="ai-container" :class="{ 'chat-mode-active': chatMode === 'chat' }">
    <!-- 左侧菜单栏 (V3.6 最终修复版) -->
    <div class="sidebar-container" :class="{ 'is-collapsed': isCollapse }">
      <!-- 折叠后，只显示这个展开按钮 -->
      <div v-if="isCollapse" class="collapsed-sidebar">
        <el-button @click="fold" class="expand-btn" text>
          <el-icon><DArrowRight /></el-icon>
        </el-button>
      </div>

      <!-- 展开时，显示完整内容 -->
      <el-menu v-else class="menu" @select="selectConversation" :default-active="activeMenu"> 
        <div class="sidebar-header">
          <div class="title">
            <span>EduVerseAI</span>
            <!-- 按钮回归到标题栏右侧 -->
            <el-button @click="fold" class="collapse-btn-inner" text>
              <el-icon><DArrowLeft /></el-icon>
            </el-button>
          </div>
          <div class="sidebar-top-controls">
            <el-button size="large" @click="handleNewConversation" type="primary" class="new-chat-button" plain>
              <el-icon size="17" style="margin-right: 4px;"><Plus /></el-icon>{{ chatMode === 'generation' ? '新动画创作' : '创建新对话' }}
            </el-button>
          </div>
          <div class="history-title">历史记录</div>
        </div>
        
        <el-scrollbar height="calc(100vh - 180px)">
          <el-menu-item v-for="conv in conversations" :index="conv.id" :key="conv.id">
            <el-icon><ChatLineSquare /></el-icon>
            <div class="menu-item-content">
              <span class="conv-title" :title="conv.title">{{ conv.title.slice(0, 15) }}</span>
              <el-dropdown trigger="click" @command="handleCommand" class="more-dropdown">
                <el-button class="more-button" text @click.stop>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="{ action: 'rename', conv: conv }" :icon="Edit">
                      重命名
                    </el-dropdown-item>
                    <el-dropdown-item :command="{ action: 'delete', conv: conv }" :icon="Delete" class="delete-item">
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </el-menu-item>
        </el-scrollbar>
      </el-menu>
    </div>

    <!-- 中间主内容区 -->
    <div class="main-content">
      <div class="chat-page">
        <div class="mode-switcher">
          <div class="glider" :class="{ 'glider-right': chatMode === 'chat' }"></div>
          <button @click="chatMode = 'generation'" :class="{ active: chatMode === 'generation' }">生成动画</button>
          <button @click="chatMode = 'chat'" :class="{ active: chatMode === 'chat' }">自然聊天</button>
        </div>

       <el-scrollbar class="chat-display-area" v-if="activeMenu" ref="scrollbarRef">
          <!-- V3.13 新增：判断是否有消息 -->
          <div v-if="parsedMessages && parsedMessages.length > 0">
            <!-- 使用新的 parsedMessages 计算属性进行渲染 -->
            <div v-for="message in parsedMessages" :key="message.id" :id="'message-' + message.id" class="message-wrapper">
              <div class="user-message" v-if="message.role === 'user'">
                <!-- 1. 先放卡片 -->
                <el-card class="dialog">{{ message.content }}</el-card>
                <!-- 2. 再放头像，这样 flex-direction: row-reverse 才能正确作用 -->
                <!-- <el-avatar :size="40" shape="circle" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"/> -->
              </div>
              <div class="ai-message" v-else>
                <el-avatar style="border: 1px solid #000" :size="40" shape="circle" src="https://cdn.dribbble.com/userupload/7419926/file/original-80fd73e15f97df080b0bae65408949f0.png?resize=1504x1128&vertical=center"/>
                <el-card class="robot">
                  <!-- V3.46 最终修复版：彻底修正流式渲染逻辑 -->
                  <!-- 只有在加载中、且是临时消息、且内容为空时，才显示加载动画 -->
                  <div v-if="isLoading && message.id.startsWith('temp-assistant-') && !message.content" class="loading-dots">
                    <span></span><span></span><span></span>
                  </div>
                  <!-- 否则，直接渲染内容（无论内容是空的、部分的还是完整的） -->
                  <div v-else class="markdown-body" v-html="renderMarkdown(message.content)"></div>
                </el-card>
              </div>
            </div>
          </div>
          <!-- V3.13 新增：当会话为空时的占位符 -->
          <div v-else class="empty-chat-placeholder">
            <div class="placeholder-content">
              
              <h2 class="placeholder-title">开启您的创作之旅</h2>
              <p class="placeholder-subtitle">这里还空空如也，尝试在下方的输入框向 EduVerseAI 发出您的第一条指令吧！</p>
            </div>
          </div>
        </el-scrollbar>
        <!-- 更新此处的 v-else 模块 -->
        <div v-else class="welcome-page">
          
          <h1 class="welcome-title">EduVerseAI</h1>
          <p class="welcome-subtitle">请从左侧选择或创建一个新会话开始您的创作之旅</p>
          <div class="suggestion-cards">
            <div class="suggestion-card">
              <el-icon><EditPen /></el-icon>
              <span><strong>开始创作</strong><br/>描述一个场景，生成动画蓝图</span>
            </div>
            <div class="suggestion-card">
              <el-icon><ChatDotRound /></el-icon>
              <span><strong>自由对话</strong><br/>切换到聊天模式，与我畅所欲言</span>
            </div>
            <div class="suggestion-card">
              <el-icon><Files /></el-icon>
              <span><strong>查看历史</strong><br/>从左侧列表加载您之前的杰作</span>
            </div>
          </div>
        </div>
        <div class="input-container" v-if="activeMenu">
            <div class="input-box" :class="{'has-content': description.trim() !== ''}">
                <el-input v-model="description" :autosize="{ minRows: 1, maxRows: 5 }" type="textarea" placeholder="请输入你的需求..." @keydown.enter.prevent="handleSend" class="ai-textarea" />
                <el-button class="submit-button" @click="handleSend" :disabled="isLoading" circle>
                    <el-icon v-if="!isLoading" size="20"><Top /></el-icon>
                    <div v-else class="loading-spinner"></div>
                </el-button>
            </div>
        </div>
      </div>
    </div>

    <!-- 右侧卡片栏 -->
    <div class="cards-panel" :class="{ 'is-collapsed': isCardsPanelCollapsed }" v-if="chatMode === 'generation' && activeMenu">
        <div class="cards-panel-header">
            <span v-if="!isCardsPanelCollapsed">生成结果</span>
            <el-button @click="isCardsPanelCollapsed = !isCardsPanelCollapsed" link class="collapse-btn">
                <el-icon><component :is="isCardsPanelCollapsed ? 'DArrowLeft' : 'DArrowRight'" /></el-icon>
            </el-button>
        </div>
        <div v-if="isCardsPanelCollapsed" class="vertical-title">生成结果</div>
        <el-scrollbar v-if="!isCardsPanelCollapsed">
            <div v-if="!generatedCards || generatedCards.length === 0" class="empty-cards">
                <el-icon><Files /></el-icon>
                <p>暂无结果</p>
            </div>
            <!-- 卡片功能升级 -->
            <el-card v-for="card in generatedCards" :key="card.id" class="generated-card">
            <template #header>
                <div class="card-header">
                    <span>{{ card.user_prompt.slice(0, 29) }}...</span>
                    <el-tag style="margin-left: 3px;" size="small" :type="card.status === 'completed' ? 'success' : 'info'">{{ card.status }}</el-tag>
                </div>
            </template>
            <div class="card-body">
                <el-button type="primary" link :icon="Rank" @click="loadCardToCanvas(card)">加载到画布</el-button>
                <el-button type="info" link :icon="View" @click="showJsonModal(card)">查看JSON</el-button>
                <el-button type="success" link :icon="Position" @click="scrollToMessage(card)">定位消息</el-button>
              </div>
        </el-card>
        </el-scrollbar>
    </div>

    <!-- JSON 查看器模态框 -->
    <!-- <el-dialog v-model="isJsonViewerVisible" title="JSON 内容查看器" width="60%" center>
      <div class="json-viewer">
        <pre>{{ selectedJsonContent }}</pre>
      </div>
      <template #footer>
        <el-button type="primary" @click="isJsonViewerVisible = false">关闭</el-button>
      </template>
    </el-dialog> -->
    <!-- V3.25 JSON 查看器升级：支持编辑和加载 -->
    <el-dialog v-model="isJsonViewerVisible" title="JSON 内容查看与编辑" width="60%" center>
      <div class="json-viewer-container">
        <el-input
          v-model="selectedJsonContent"
          type="textarea"
          placeholder="JSON content"
          class="json-editor-textarea"
        />
      </div>
      <template #footer>
        <el-button @click="isJsonViewerVisible = false">取消</el-button>
        <el-button type="primary" @click="handleLoadEditedJson">加载已编辑内容</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { marked } from 'marked';
import { serveAddress } from "@/api/api";
import { 
  createConversation, 
  getConversationDetails, 
  getCreationStatus, 
  startGeneration, 
  getConversationList,
  sendChatMessage,
  updateConversationTitle, // 新增导入
  deleteConversation,     // 新增导入
} from "@/api/ai";
import { fetchEventSource } from '@microsoft/fetch-event-source';
// --- 核心状态 ---
const isCollapse = ref(false);
const chatMode = ref('generation');
const conversations = ref([]);
const activeMenu = ref('');
const currentConversation = ref(null);
const description = ref("");
const isLoading = ref(false);
const scrollbarRef = ref(null);
const isCardsPanelCollapsed = ref(false);
const editingConvId = ref(null); // 新增：正在编辑的会话ID
const editingTitleText = ref(''); // 新增：正在编辑的标题文本

// --- JSON 查看器状态 ---
const isJsonViewerVisible = ref(false);
const selectedJsonContent = ref('');

// --- 生成模式专用状态 ---
const creationStatus = ref({});
let pollingInterval = null;

// --- 聊天模式专用状态 ---
let eventSource = null;

// --- 计算属性 ---
const messages = computed(() => currentConversation.value?.messages || []);
const generatedCards = computed(() => currentConversation.value?.creations || []);

// V3.0 新增：智能解析消息内容
const parsedMessages = computed(() => {
  if (!currentConversation.value || !currentConversation.value.messages) {
    return [];
  }
  return currentConversation.value.messages.map(msg => {
    if (msg.role === 'assistant' && msg.content.includes('------------TABLE_START------------')) {
      const tableStart = msg.content.indexOf('------------TABLE_START------------') + '------------TABLE_START------------'.length;
      const tableEnd = msg.content.indexOf('------------TABLE_END------------');
      if (tableEnd > tableStart) {
        return { ...msg, content: msg.content.substring(tableStart, tableEnd).trim() };
      }
    }
    return msg; // 如果不是AI消息或没有标记，则原样返回
  });
});

// --- 辅助函数 ---
const renderMarkdown = (markdown) => marked(markdown || '', { renderer: new marked.Renderer() });
const fold = () => { isCollapse.value = !isCollapse.value; };
const scrollToBottom = () => {
  nextTick(() => {
    scrollbarRef.value?.wrapRef.scrollTo({ top: scrollbarRef.value.wrapRef.scrollHeight, behavior: 'smooth' });
  });
};

// --- 卡片与JSON查看器功能 ---
function showJsonModal(card) {
  if (card && card.json_data) {
    selectedJsonContent.value = JSON.stringify(card.json_data, null, 2); // 格式化JSON
    isJsonViewerVisible.value = true;
  } else {
    ElMessage.info("此卡片没有可供查看的JSON数据。");
  }
}

function loadCardToCanvas(creation) {
  if (!creation || !creation.json_data) {
    ElMessage.error("此卡片没有有效的JSON数据。");
    return;
  }
  const { nodes, edges } = creation.json_data;
  localStorage.setItem('vueflow-nodes', JSON.stringify(nodes));
  localStorage.setItem('vueflow-edges', JSON.stringify(edges));
  window.open(`${window.location.origin}/main`, '_blank');
}

// V3.25 新增：加载编辑后的JSON到画布
function handleLoadEditedJson() {
  try {
    const jsonData = JSON.parse(selectedJsonContent.value);
    // 基础校验，确保JSON有效且包含所需字段
    if (!jsonData || !Array.isArray(jsonData.nodes) || !Array.isArray(jsonData.edges)) {
      ElMessage.error("JSON格式无效或缺少 'nodes'/'edges' 数组。");
      return;
    }
    
    const { nodes, edges } = jsonData;
    localStorage.setItem('vueflow-nodes', JSON.stringify(nodes));
    localStorage.setItem('vueflow-edges', JSON.stringify(edges));
    window.open(`${window.location.origin}/main`, '_blank');
    
    isJsonViewerVisible.value = false; // 成功后关闭模态框
  } catch (e) {
    console.error("JSON parsing error:", e);
    ElMessage.error("JSON 格式错误，无法解析。请检查您的修改。");
  }
}

// --- API 调用逻辑 (保持不变) ---
function fetchConversations() {
  getConversationList(chatMode.value).then(data => { conversations.value = data; });
}
function handleNewConversation() {
  ElMessageBox.prompt('请输入会话标题', '创建新会话', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputPlaceholder: '标题',
    // V3.2 新增：输入校验
    inputValidator: (value) => {
      if (!value || value.trim() === '') {
        return '会话标题不能为空';
      }
      return true;
    },
  }).then(({ value }) => {
    // 移除旧的默认标题逻辑，因为校验已确保 value 有效
    createConversation({ title: value.trim(), mode: chatMode.value }).then(newConv => {
      if (newConv && newConv.id) {
        fetchConversations();
        selectConversation(newConv.id);
      }
    });
  }).catch(() => {
    // 用户取消输入
    ElMessage.info('已取消创建');
  });
}
function selectConversation(convId) {
  if (!convId) return;
  activeMenu.value = convId;
  isLoading.value = true; // 立即进入加载状态
  stopPolling(); // 切换会话时，停止任何旧的轮询

  getConversationDetails(convId).then(data => {
    currentConversation.value = data;
    scrollToBottom();

    // 核心修正：检查并恢复未完成的任务
    if (chatMode.value === 'generation' && data.creations) {
      const pendingCreation = data.creations.find(c => c.status === 'processing' || c.status === 'pending');
      if (pendingCreation) {
        console.log(`恢复对未完成任务 ${pendingCreation.id} 的轮询。`);
        
        // 核心修正2：如果最后一条消息是用户的，则手动添加AI加载占位符
        const lastMessage = data.messages[data.messages.length - 1];
        if (lastMessage && lastMessage.role === 'user') {
          currentConversation.value.messages.push({
            id: `temp-assistant-restored-${Date.now()}`,
            role: 'assistant',
            content: '',
            created_at: new Date().toISOString()
          });
        }
        
        startPolling(pendingCreation.id);
        scrollToBottom();
        return; // 保持 isLoading.value = true 并提前返回
      }
    }
    // 如果没有未完成的任务，则正常结束加载
    isLoading.value = false;

  }).catch(error => {
    console.error("获取会话详情失败:", error);
    isLoading.value = false; // 出错时也要结束加载
  });
}
function handleSend() {
  if (!description.value.trim() || !activeMenu.value) return;
  const prompt = description.value;
  description.value = "";
  currentConversation.value.messages.push({
    id: `temp-user-${Date.now()}`, role: 'user', content: prompt, created_at: new Date().toISOString()
  });
  scrollToBottom();
  if (chatMode.value === 'generation') { handleStartGeneration(prompt); } else { handleStartChat(prompt); }
}
// function handleStartGeneration(prompt) {
//   isLoading.value = true;
//   startGeneration(activeMenu.value, { prompt }).then(creation => {
//     if (creation && creation.id) { startPolling(creation.id); } else { isLoading.value = false; }
//   });
// }
// V3.27 最终修复版：为生成模式添加即时反馈
function handleStartGeneration(prompt) {
  isLoading.value = true;

  // 1. 立即添加一个“正在生成中”的占位消息，以显示加载动画
  const assistantMessage = {
    id: `temp-assistant-${Date.now()}`,
    role: 'assistant',
    content: '',
    created_at: new Date().toISOString()
  };
  currentConversation.value.messages.push(assistantMessage);
  scrollToBottom();

  // 2. 调用API开始生成
  startGeneration(activeMenu.value, { prompt }).then(creation => {
    if (creation && creation.id) {
      // 3. 立即将返回的、处于 "processing" 状态的卡片添加到列表中
      if (currentConversation.value && currentConversation.value.creations) {
        currentConversation.value.creations.push(creation); 
      }
      // 4. 开始轮询以更新最终状态
      startPolling(creation.id);
    } else {
      // 如果API调用失败，则更新占位消息为错误提示
      assistantMessage.content = "抱歉，开始生成时发生错误。";
      isLoading.value = false;
    }
  }).catch(error => {
    console.error("Start generation failed:", error);
    assistantMessage.content = "抱歉，与服务器通信失败。";
    isLoading.value = false;
  });
}
function startPolling(creationId) {
  stopPolling(); // 确保只有一个轮询在运行

  // 核心修正：立即执行一次状态检查，而不是等待3秒

  const checkStatus = () => {
    getCreationStatus(creationId).then(status => {
      // 更新UI中的卡片状态（如果需要一个专门的状态变量）
      // creationStatus.value = status; 

      if (status.status === 'completed' || status.status === 'failed') {
        stopPolling();
        isLoading.value = false;
        // 任务结束后，刷新整个会话以获取最完整的数据
        selectConversation(activeMenu.value);
      }
    });
  };

  // 核心修正：延迟1秒再开始第一次检查，给后端缓冲时间
  setTimeout(() => {
    checkStatus();
    // 然后设置定时器进行后续轮询
    pollingInterval = setInterval(checkStatus, 2000);
  }, 500); // 延迟1000毫秒
  
}
function stopPolling() {
  if (pollingInterval) { clearInterval(pollingInterval); pollingInterval = null; }
}

// V3.40 最终修复版：通过兼容 Accept 头和响应类型，彻底解决 406 错误
async function handleStartChat(prompt) {
    isLoading.value = true;
    
    const tempId = `temp-assistant-${Date.now()}`;
    currentConversation.value.messages.push({ 
        id: tempId, 
        role: 'assistant', 
        content: '', 
        created_at: new Date().toISOString() 
    });
    
    const targetMessage = currentConversation.value.messages.find(m => m.id === tempId);
    const url = `http://127.0.0.1:8000/ai/conversations/${activeMenu.value}/chat/`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 核心修正: 修正 Accept 头，使其更具兼容性
                // 优先请求事件流，但如果服务器不支持，也接受普通的 JSON 响应
                'Accept': 'text/event-stream, application/json',
            },
            body: JSON.stringify({ prompt: prompt })
        });

        if (!response.ok) {
            let errorBody = '服务器返回错误。';
            try {
                const errorData = await response.json();
                errorBody = errorData.detail || JSON.stringify(errorData);
            } catch (e) { /* 忽略解析错误 */ }
            throw new Error(`HTTP error! status: ${response.status}. ${errorBody}`);
        }

        const contentType = response.headers.get("content-type");

        // 智能判断响应类型
        if (contentType && contentType.includes("text/event-stream")) {
            // --- 情况1：服务器支持并返回了流式数据 ---
            console.log("服务器支持流式响应，开始处理...");
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n\n');

                for (const line of lines) {
                    if (line.trim().startsWith('data:')) {
                        const jsonData = line.substring('data:'.length).trim();
                        try {
                            const data = JSON.parse(jsonData);
                            if (data.content && targetMessage) {
                                //console.log("流式响应数据:", data.content);
                                targetMessage.content += data.content;
                                scrollToBottom();
                                
                            }
                        } catch (e) { /* 忽略解析错误 */ }
                    } else if (line.trim() === 'event: end') {
                        reader.cancel();
                        break;
                    }
                }
            }
        } else {
            // --- 情况2：服务器返回了普通的 JSON 数据 ---
            console.log("服务器返回了非流式JSON，一次性处理...");
            const data = await response.json();
            if (data && data.content && targetMessage) {
                targetMessage.content = data.content;
            }
        }

    } catch (error) {
        console.error("聊天失败:", error);
        if (targetMessage) {
            targetMessage.content = `抱歉，通信失败: ${error.message}`;
        }
    } finally {
        isLoading.value = false;
        // 流结束后，无论成功失败，都重新获取一次会话以同步最终状态
        selectConversation(activeMenu.value);
    }
}

function handleCommand(command) {
  const { action, conv } = command;
  if (action === 'rename') {
    handleRename(conv);
  } else if (action === 'delete') {
    handleDelete(conv);
  }
}

function handleRename(conv) {
  ElMessageBox.prompt('请输入新的会话标题', '重命名', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputValue: conv.title,
    inputValidator: (value) => {
      if (!value || value.trim() === '') return '标题不能为空';
      return true;
    },
  }).then(({ value }) => {
    // V3.21 修复：正确返回 Promise
    return updateConversationTitle(conv.id, value.trim());
  }).then(() => {
    // 在新的 .then() 块中处理成功后的逻辑
    ElMessage.success("标题更新成功");
    fetchConversations();
  }).catch((error) => {
    console.error("更新标题失败:", error);
    // .catch() 现在只会捕获真正的取消操作或API错误
    ElMessage.info('已取消重命名');
  });
}

function handleDelete(conv) {
  ElMessageBox.confirm(
    `确定要永久删除会话 "${conv.title}" 吗？此操作不可逆。`,
    '警告',
    {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // V3.21 修复：正确返回 Promise
    return deleteConversation(conv.id);
  }).then(() => {
    // 在新的 .then() 块中处理成功后的逻辑
    ElMessage.success('会话已删除');
    if (activeMenu.value === conv.id) {
      activeMenu.value = '';
      currentConversation.value = null;
    }
    fetchConversations();
  }).catch(() => {
    // .catch() 现在只会捕获真正的取消操作或API错误
    ElMessage.info('已取消删除');
  });
}
// --- 生命周期和监听器 ---
onMounted(() => { fetchConversations(); });
onUnmounted(() => { stopPolling(); if (eventSource) eventSource.close(); });
watch(messages, () => {
  // 增加一个微小的延迟，确保DOM完全渲染完毕
  setTimeout(() => {
    scrollToBottom();
  }, 100); 
}, { deep: true }); // 使用 deep watch 监听数组内部变化

watch(chatMode, () => {
  currentConversation.value = null;
  activeMenu.value = '';
  fetchConversations();
});

// --- 卡片与JSON查看器功能 ---

// 新增：滚动到指定消息的函数
// function scrollToMessage(card) {
//   if (!card || !card.user_prompt) return;

//   // 在比较前，先对 prompt 进行 trim() 操作，以消除潜在的空白字符
//   const promptToFind = card.user_prompt.trim();

//   // 在当前会话中，根据用户提示找到对应的原始消息
//   const targetMessage = currentConversation.value?.messages.find(
//     msg => msg.role === 'user' && msg.content.trim() === promptToFind
//   );

//   if (!targetMessage) {
//     ElMessage.warning("在当前会话中未找到对应的原始消息。");
//     return;
//   }

//   nextTick(() => {
//     const element = document.getElementById(`message-${targetMessage.id}`);
//     if (element) {
//       // 平滑滚动到元素位置，并使其居中显示
//       element.scrollIntoView({ behavior: 'smooth', block: 'center' });

//       // 添加一个临时的CSS类来实现高亮效果
//       element.classList.add('highlight');
//       setTimeout(() => {
//         element.classList.remove('highlight');
//       }, 2500); // 2.5秒后移除高亮
//     }
//   });
// }
// V3.38 最终修复版：不依赖后端修改，通过前端智能匹配实现精准定位
function scrollToMessage(card) {
  if (!card || !card.user_prompt) {
    ElMessage.error("卡片数据错误，缺少 'user_prompt'。");
    return;
  }

  const allCreations = currentConversation.value?.creations || [];
  const allMessages = currentConversation.value?.messages || [];

  // 1. 找出所有与当前卡片提示词相同的卡片，并确定当前卡片是其中的第几个
  const matchingCreations = allCreations.filter(c => c.user_prompt === card.user_prompt);
  const cardIndex = matchingCreations.findIndex(c => c.id === card.id);

  if (cardIndex === -1) {
    ElMessage.warning("在当前会话的生成结果中未找到此卡片。");
    return;
  }

  // 2. 找出所有与当前卡片提示词内容相同的用户消息
  const matchingMessages = allMessages.filter(
    msg => msg.role === 'user' && msg.content === card.user_prompt
  );

  // 3. 根据卡片的顺序，从匹配的消息中选择出正确的那一个
  if (matchingMessages.length > cardIndex) {
    const targetMessage = matchingMessages[cardIndex];
    
    // 4. 滚动和高亮逻辑保持不变
    nextTick(() => {
      const element = document.getElementById(`message-${targetMessage.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight');
        setTimeout(() => {
          element.classList.remove('highlight');
        }, 2500);
      } else {
        ElMessage.error("无法在DOM中找到对应的消息元素。");
      }
    });
  } else {
    ElMessage.warning("在当前会话中未找到对应的原始消息。");
  }
}
</script>

<style scoped>
/* --- 基础布局 --- */
.ai-container { display: flex; height: 100vh; overflow: hidden; }

/* --- 左侧边栏 (V3.0 精修) --- */
.sidebar-container {
  flex-shrink: 0;
  position: relative;
  width: 280px; /* 统一容器宽度 */
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* 使用贝塞尔曲线使动画更平滑 */
}
.sidebar-container.is-collapsed {
  width: 50px; /* el-menu 折叠后的标准宽度 */
}

.menu {
  height: 100vh;
  border-right: none;
  background-color: rgb(249, 251, 255);
 
  /* 移除 menu 自身的 transition，由父容器控制 */
  padding: 0 10px;
  box-sizing: border-box;
  overflow: hidden; /* 防止内容在折叠动画中溢出 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 
              0 3px 10px rgba(0, 0, 0, 0.05);
}
.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* 精确复用 AI2.vue 的字体 */
  font-family: 'Trebuchet MS', Arial, Helvetica, sans-serif;
  font-size: 28px; /* 稍微调整以匹配字体 */
  font-weight: bolder;
  padding: 20px 0 10px 0;
  margin-left: 11px;
}

.sidebar-top-controls { display: flex; align-items: center; padding: 10px 20px; }
.new-chat-button {
  width: 100%;
  border: none;
  background-color: rgb(219, 234, 254);
  border-radius: 10px;
  font-size: 15px;
  padding: 20px; /* 增加内边距使其更大方 */
  color: rgb(77, 107, 254);
  font-weight: 500;
}
.new-chat-button:hover {
  background-color: rgb(200, 220, 255) !important;
}

/* V3.7 新增：选中会话高亮样式 */
:deep(.el-menu-item.is-active) {
  background-color: #eef2ff; /* 深蓝色背景 */
  color: #000000; /* 白色文字 */
  font-weight: bolder;
  border-radius: 8px;
}
:deep(.el-menu-item.is-active .el-icon) {
  color: #000000;
}
:deep(.el-menu-item:hover) {
  background-color: #eef2ff; /* 悬浮时使用淡紫色 */
}
.collapse-toggle-btn {
  position: absolute;
  top: 20px;
  right: -15px; /* 悬浮在侧边栏边缘 */
  z-index: 10;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #e5e7eb;
}
.collapse-toggle-btn:hover {
  transform: scale(1.1);
  background-color: #f9fafb;
}
.collapse-toggle-btn .el-icon {
  transition: transform 0.3s ease;
}
/* 折叠后只显示一个展开按钮 */
.collapsed-sidebar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  z-index: 10;
}
.expand-btn {
  width: 24px;
  height: 100px;
  border-radius: 0 12px 12px 0;
  background-color: rgb(249, 251, 255);
  box-shadow: 2px 0 5px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
  border-left: none;
  font-size: 16px;
}

.history-title {
  color: #6b7280;
  font-weight: bold;
  font-size: 19px;
  margin-left: 10px;
  margin-bottom: 5px ;
  padding: 15px 0 5px 0;
}
/* --- 中间主内容区 --- */
.main-content { flex-grow: 1; display: flex; flex-direction: column; height: 100vh; background-color: #f9fafb; }
.ai-container.chat-mode-active .main-content { max-width: 100%; }
.chat-page { display: flex; flex-direction: column; height: 100%; padding: 20px; box-sizing: border-box; }

/* --- 模式选择器 --- */
.mode-switcher { position: relative; display: flex; align-items: center; justify-content: center; background-color: #f3f4f6; border-radius: 99px; padding: 4px; margin: 0 auto 20px auto; width: fit-content; }
.mode-switcher button { background: none; border: none; padding: 8px 24px; font-size: 14px; font-weight: 500; color: #6b7280; cursor: pointer; transition: color 0.3s ease; z-index: 1; }
.mode-switcher button.active { color: #374151; }
.glider { position: absolute; height: calc(100% - 8px); width: calc(50% - 4px); background-color: #ffffff; border-radius: 99px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); left: 4px; }
.glider.glider-right { transform: translateX(100%); }

/* --- 对话气泡 (V3.7 精修) --- */
.chat-display-area { flex-grow: 1; padding: 0 10px; }
.message-wrapper { display: flex; flex-direction: column; margin-bottom: 20px; }
.user-message, .ai-message { display: flex; gap: 12px; align-items: flex-start; max-width: 80%; }
.user-message { align-self: flex-end; flex-direction: row-reverse; }
.ai-message { align-self: flex-start; }
.dialog { background-color: #c7d2fe; border: none; border-radius: 18px; }
.robot { background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 18px; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }


/* V3.7 新增：Markdown 表格样式 */
:deep(.markdown-body table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  font-size: 14px;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #dfe2e5;
}
:deep(.markdown-body th),
:deep(.markdown-body td) {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #dfe2e5;
}
:deep(.markdown-body th) {
  background-color: #f6f8fa;
  font-weight: 600;
}
:deep(.markdown-body tr:last-child td) {
  border-bottom: none;
}
:deep(.markdown-body tr:nth-of-type(even)) {
  background-color: #f6f8fa;
}

/* --- 输入框 --- */
.input-container {
  padding: 10px 40px 20px 40px; /* 增加上下边距 */
  margin-top: auto;
  flex-shrink: 0;
}
.input-box {
  position: relative;
  background-color: #ffffff;
  border-radius: 18px;
  padding: 4px;
  transition: all 0.2s ease;
  /* 移除普通状态的边框，使用阴影来定义轮廓，更大气 */
  box-shadow: 0 1px 2px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.05);
}
.input-box:focus-within {
  /* 聚焦时使用主题色外发光，更明显 */
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2), 0 4px 12px rgba(0,0,0,0.1);
}
:deep(.ai-textarea .el-textarea__inner) {
  box-shadow: none !important;
  background-color: transparent;
  border: none;
  padding: 14px 52px 14px 20px; /* 增加内边距，使其更宽敞 */
  line-height: 1.6;
  font-size: 16px; /* 增大字体 */
  resize: none;
}
.submit-button {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 40px; /* 增大按钮 */
  height: 40px;
  background: #e5e7eb;
  color: #9ca3af;
  transition: all 0.2s ease;
}
.input-box.has-content .submit-button {
  background: #4f46e5;
  color: white;
  transform: scale(1.05); /* 激活时轻微放大 */
}
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
/* --- 右侧卡片栏 (V3.25 美化) --- */
/* --- 右侧卡片栏 (V3.36 修复滚动条遮挡) --- */
.cards-panel { 
  flex-shrink: 0; 
  width: 300px; 
  background-color: #f9fafb; 
  border-left: 1px solid #e5e7eb; 
  padding: 15px; 
  display: flex; 
  flex-direction: column; 
  transition: width 0.3s ease, padding 0.3s ease; 
  box-sizing: border-box; /* 确保 padding 不会增加总宽度 */
}
/* 核心修正：为滚动条容器增加右侧内边距，为滚动条留出空间 */
.cards-panel .el-scrollbar {
  padding-right: 5px;
  margin-right: -8px; /* 抵消内边距对布局的影响 */
}

.cards-panel.is-collapsed { width: 50px; padding: 15px 0; }
.cards-panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 0 15px 0 5px; }
.cards-panel.is-collapsed .cards-panel-header { justify-content: center; }
.cards-panel-header span { font-size: 18px; font-weight: 600; color: #1f2937; }
.collapse-btn { transition: transform 0.3s ease; }
.vertical-title { writing-mode: vertical-rl; text-orientation: mixed; margin: 20px auto; color: #6b7280; font-size: 14px; font-weight: 500; }
.empty-cards { text-align: center; color: #9ca3af; margin-top: 30px; font-size: 14px; }
.empty-cards .el-icon { font-size: 48px; margin-bottom: 10px; }

.generated-card {
  margin-bottom: 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background-color: #fff;
  transition: all 0.3s ease;
  overflow: hidden;
}
.generated-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}
:deep(.generated-card .el-card__header) {
  padding: 15px 19px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 15px;
}
.card-header span {
  color: #374151;
}
:deep(.generated-card .el-card__body) {
  padding: 12px 0;
}
.card-body {
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.card-body .el-button {
  font-size: 13px;
}

/* --- JSON 查看器 (V3.25 升级) --- */
.json-viewer-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}
:deep(.json-editor-textarea .el-textarea__inner) {
  background-color: #282c34;
  color: #abb2bf;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  border: none;
  box-shadow: none !important;
  height: 60vh;
  resize: none;
}
/* --- 动画和通用样式 --- */
@keyframes spin { to { transform: rotate(360deg); } }
.loading-dots span { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #9ca3af; margin: 0 2px; animation: blink 1.4s infinite both; }
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink { 0%, 80%, 100% { opacity: 0; } 40% { opacity: 1; } }


.welcome-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #333;
}
.welcome-logo img {
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
}
.welcome-title {
  font-family: 'Trebuchet MS', Arial, Helvetica, sans-serif;
  font-size: 48px;
  font-weight: bold;
  margin: 0;
}
.welcome-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin-top: 10px;
  margin-bottom: 40px;
}
.suggestion-cards {
  display: flex;
  gap: 20px;
}
.suggestion-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  width: 220px;
  text-align: left;
  transition: all 0.2s ease-in-out;
}
.suggestion-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.suggestion-card .el-icon {
  font-size: 24px;
  color: #4f46e5;
}
.suggestion-card span {
  line-height: 1.4;
  font-size: 14px;
  color: #6b7280;
}
.suggestion-card span strong {
  color: #1f2937;
  font-size: 16px;
}
.user-message .el-avatar, .ai-message .el-avatar {
  flex-shrink: 0; /* 防止头像在flex布局中被压缩 */
}
/* 新增：消息高亮效果 */
.message-wrapper.highlight .el-card {
  transition: all 0.3s ease-in-out;
  /* 使用 inset 将高亮效果绘制在卡片内部 */
  box-shadow: inset 0 0 0 3px rgba(103, 194, 58, 0.7);
}
/* V3.16 新增：空会话占位符样式 */
.empty-chat-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* 垂直居中 */
  flex: 1; /* 占满父容器剩余空间，保证上下居中 */
  padding: 20px;
  box-sizing: border-box;
  min-height: 300px; /* 防止内容太少时不居中 */
}
.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.placeholder-logo img {
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  opacity: 0.7;
  filter: grayscale(30%);
}
.placeholder-title {
  font-size: 24px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}
.placeholder-subtitle {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}
/* V3.20 最终修复版：会话列表项样式 */
.menu-item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.conv-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
}

.more-dropdown .more-button {
  opacity: 0; /* 默认隐藏 */
  transition: opacity 0.2s ease;
}

.el-menu-item:hover .more-button {
  opacity: 1; /* 悬浮时显示 */
}

/* 删除选项的红色字体 */
.delete-item {
  color: #f56c6c;
}
.delete-item:hover {
  background-color: #fef0f0;
  color: #f56c6c;
}

</style>