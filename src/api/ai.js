import { post, get, del, patch } from "./api"

/**
 * 1. 创建新会话
 * @param {{ title?: string, mode: 'chat' | 'generation' }} data 
 * @returns Promise
 */
export function createConversation(data) {
  return post("/ai/conversations/", data);
}

/**
 * 2. 获取单个会话详情
 * @param {string} conv_id 会话ID
 * @returns Promise
 */
export function getConversationDetails(conv_id) {
  return get(`/ai/conversations/${conv_id}/`);
}

/**
 * 3. 获取创作状态 (用于生成模式轮询)
 * @param {string} creation_id 创作ID
 * @returns Promise
 */
export function getCreationStatus(creation_id) {
  return get(`/ai/creations/${creation_id}/`);
}

/**
 * 4. 发起动画生成任务
 * @param {string} conv_id 会话ID
 * @param {{ prompt: string }} data
 * @returns Promise
 */
export function startGeneration(conv_id, data) {
  return post(`/ai/conversations/${conv_id}/generate/`, data);
}

/**
 * 5. 获取会话列表
 * @param {'chat' | 'generation'} mode 模式
 * @returns Promise
 */
export function getConversationList(mode) {
  return get("/ai/conversations/", { mode: mode });
}

/**
 * 6. 发送聊天消息 (用于自然聊天模式)
 * @param {string} conv_id 会话ID
 * @param {{ prompt: string }} data
 * @returns Promise
 */
export function sendChatMessage(conv_id, data) {
    // 注意：这个接口返回的是SSE流，axios的常规post不直接适用
    // 我们将在Vue组件中直接使用EventSource处理
    // 但为了统一，这里仍然定义一个函数，它将用于初始化SSE
    return post(`/ai/conversations/${conv_id}/chat/`, data);
}

// V3.18 新增：更新会話標題
export const updateConversationTitle = (convId, newTitle) => {
  // 使用已导入的 patch 函数
  return patch(`/ai/conversations/${convId}/`, { title: newTitle });
};

export const deleteConversation = (convId) => {
  // 使用已导入的 del 函数
  return del(`/ai/conversations/${convId}/`);
};
// --- 以下是旧接口，可以保留或删除，但新逻辑不会使用它们 ---

export function EditTitle(conversation_id,data){
    return patch(`/ai/chat/${conversation_id}/`,data)
}

export function DeleteDialog(conversation_id){
    return del(`/ai/chat/${conversation_id}/`)
}