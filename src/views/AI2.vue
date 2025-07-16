<template>
  <div class="ai-container">
    <!-- 左侧菜单栏 -->
    <el-menu
      :collapse="isCollapse"
      class="menu"
      @select="chooseHistory"
      :default-active="activeMenu"
    > 
      <div class="title">
        <span  v-if="!isCollapse" style="margin-right: 2vw;">ManimAI</span>
        <el-button
          icon="DArrowLeft"
          link
          size="large"
          @click="fold"
          :style="{ transform: isCollapse ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }"
        ></el-button>
      </div>
      
      <div v-if="!isCollapse">
        <div style="margin: 1vw;">
          <el-button size="large" @click="isNewChat = true;messages = [];activeMenu=''" type="primary" class="new-chat-button" plain>
            <el-icon size="23"><ChatSquare /></el-icon>&ensp;开启新对话
          </el-button>
        </div>
        <div style="color: rgb(85, 85, 85);font-weight: bold;font-size: 13px;margin: 1vw;">历史记录</div>
        <el-scrollbar height="75vh">
          <el-menu-item v-for="(item, index) in conversations" :index="index.toString()" :key="item.conversation_id">
              <template #title>
              </template>
              <span v-if="item.title.length <= 10">{{ item.title }}</span>
              <span v-else>{{ item.title.slice(0,10) }}……</span>
              <el-popover
                  placement="right"
                  trigger="click"
              >
                  <template #reference>
                      <el-button type="info" class="more"><el-icon size="15"><MoreFilled /></el-icon></el-button>
                  </template>
                  <div>
                      <el-button type="info" class="func" @click.prevent="open(item.conversation_id)"><el-icon size="40"><Edit />&ensp;</el-icon>重命名</el-button>
                  </div>
                  <div>
                      <el-button type="info" class="func" @click.prevent="deleteDialog(item.conversation_id)"><el-icon size="20" style="color: rgb(196, 86.4, 86.4);"><Delete /></el-icon>&ensp;删除对话</el-button>
                  </div>
              </el-popover>
          </el-menu-item>
        </el-scrollbar>
      </div>
      
      <div v-else style="margin: 1vw;">
        <el-tooltip effect="dark" content="开启新对话" placement="right">
          <el-button size="large" link @click="isNewChat = true;messages = [];activeMenu=''">
            <el-icon size="large"><EditPen /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </el-menu>

    <!-- 右侧输入框和内容 -->
    <div class="content" v-if="isNewChat">
      <div class="title" style="margin-bottom: 2%;font-size: 50px;">ManimAI</div>
      <div style="margin: 2%;margin-top: 0%;color: rgb(71, 85, 105);">我可以帮你生成Manim流图，请把你的任务交给我吧~</div>
      <div class="dialog-box">
        <el-input
          v-model.lazy="description"
          :autosize="{ minRows: 2, maxRows: 2 }"
          type="textarea"
          placeholder="请输入你的需求"
          :resize="'none'"
          class="ai-textarea"
        />
        <div class="buttons">
          <el-button
            round
            type="primary"
            plain
            :style="use_latex ? enabledStyle : disabledStyle"
            @click="use_latex = !use_latex"
          >
            <el-icon><DataLine /></el-icon>&ensp;使用 latex
          </el-button>
          <el-button
            round
            type="primary"
            plain
            :style="json_fix ? enabledStyle : disabledStyle"
            @click="json_fix = !json_fix"
          >
            <el-icon><SetUp /></el-icon>&ensp;简化 json
          </el-button>
          <el-button class="submit-button" @click="createNewDialog()" circle>
            <el-icon size="20"><Top /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <div class="historyChat" v-else-if="newChatId != ''">
        <el-scrollbar style="height: 60vh;">
            <div v-for="(item,index) in messages" :key="index">
                <el-row style="margin: 1%;" v-if="messages[index].role=='user'">
                    <el-col :span="1"></el-col>
                    <el-col :span="23">
                        <el-card class="dialog">
                        {{ messages[index].content }}
                        </el-card>
                    </el-col>
                </el-row>
                <el-row style="margin: 1%;" v-else>
                    <el-col :span="1">
                        <el-avatar :size="35"
                        src="https://cdn.dribbble.com/userupload/7419926/file/original-80fd73e15f97df080b0bae65408949f0.png?resize=1504x1128&vertical=center"
                        />
                    </el-col>
                    <el-col :span="23">
                        <el-card class="robot" >
                        <div>
                            <div class="markdown-body" v-html="renderMarkdown(extract(messages[index].content))"></div>
                            <el-button style="margin-top: 3%;" v-if="messages[index].has_json" @click="extractJsonFromResponse(messages[index].content)">加载到画布</el-button>
                        </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
            <div v-if="isSend">
                <el-row style="margin: 1%;">
                    <el-col :span="1">
                        <el-avatar :size="35"
                        src="https://cdn.dribbble.com/userupload/7419926/file/original-80fd73e15f97df080b0bae65408949f0.png?resize=1504x1128&vertical=center"
                        />
                    </el-col>
                    <el-col :span="23">
                        <el-card class="robot" >
                        <div class="loading" v-if="isLoading"></div>
                        <div v-else>
                            <div class="markdown-body" v-html="renderedMarkdown"></div>
                            <div class="loading" style="margin-top: 2%;" v-if="isJsonLoading"></div>
                            <el-button style="margin-top: 3%;" v-if="isComplete" @click="extractJsonFromResponse(completeContent)">加载到画布</el-button>
                        </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
        </el-scrollbar>
        <el-divider/>
        <div>
            <div style="width: 100%;">
                <el-input
                v-model.lazy="description"
                :autosize="{ minRows: 3, maxRows: 3 }"
                type="textarea"
                placeholder="请输入你的需求"
                :resize="'none'"
                class="ai-textarea"
                />
                <div class="buttons">
                <el-button
                    round
                    type="primary"
                    plain
                    :style="use_latex ? enabledStyle : disabledStyle"
                    @click="use_latex = !use_latex"
                >
                    <el-icon><DataLine /></el-icon>&ensp;使用latex
                </el-button>
                <el-button
                    round
                    type="primary"
                    plain
                    :style="json_fix ? enabledStyle : disabledStyle"
                    @click="json_fix = !json_fix"
                >
                    <el-icon><SetUp /></el-icon>&ensp;简化json
                </el-button>
                <el-button class="submit-button" @click="createNewDialog()" round>
                  <el-icon size="20"><Top /></el-icon>
                </el-button>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { CreateNewChat, DeleteDialog, EditTitle, GetHistory, HistoryList, SendDescription } from "@/api/ai_copy";
import { ElMessage } from "element-plus";
import { onMounted, onUnmounted, ref, toRefs, reactive, nextTick } from "vue";
import { GetCompleteJson } from "@/api/main";
import { marked } from 'marked';
import { serveAddress } from "@/api/api";
import { ElMessageBox } from 'element-plus'

const isCollapse = ref(false)
const conversations =  ref([])
const description = ref("")
const use_latex = ref(true)
const json_fix = ref(false)
const isLoading = ref(false)
const isNewChat = ref(false)
const isSend = ref(false)
const typewriterContent = ref(""); // 用于显示逐字内容
const requirements = ref('') // 已经发送的东西
let eventSource = null
const isComplete = ref(false)
const messages = ref([])
const newChatId = ref("")
const isJsonLoading = ref(false)
const activeMenu = ref('')

// 渲染
const enabledStyle = {
  backgroundColor: "rgb(219, 234, 254)",
  border: "1px solid rgb(159.5, 206.5, 255)",
  color: "rgb(77, 107, 254)",
};

const disabledStyle = {
  backgroundColor: "white",
  border: "1px solid #D4D7DE",
  color: "#606266",
};

function fold(){
    isCollapse.value = !isCollapse.value
}

function chooseHistory(index){
  isNewChat.value = false
  let indexNum = Number(index)
  newChatId.value = conversations.value[indexNum].conversation_id
  let promise = GetHistory(newChatId.value)
  activeMenu.value = index
  promise.then((result) => {
      if(result.success){
        console.log(result.data)
        messages.value = result.data.messages
      }
      else{
          ElMessage.error("获取历史记录失败！请稍后重试")
      }
  })
}

const state = reactive({
    renderedMarkdown: ''
});
const { renderedMarkdown } = toRefs(state);
 
/**
 * 使用 marked 解析 Markdown
 * @param markdown 解析的文本
 */
const renderMarkdown = (markdown) => {
    const renderer = new marked.Renderer();
    return marked(markdown, { renderer });
};

function createNewDialog(){
  if(isNewChat.value){
    isNewChat.value = false
    const promise = CreateNewChat()
    promise.then((result) => {
        if(result.success){
            newChatId.value = result.data.conversation_id
            conversations.value.unshift({conversation_id:newChatId.value,title:result.data.title})
            nextTick(() => {
                activeMenu.value = '0'
            })
            sendDescription()
        }
        else{
            ElMessage.error("创建对话失败，请重试")
        }
    })
  }
  else{
    sendDescription()
  }
}

const completeContent = ref("")

// 打开 SSE 连接并处理消息
function sendDescription() {
  if (!description.value.trim()) {
    ElMessage.warning("请不要发送空内容");
    return;
  }

  // 如果已有 SSE 连接，先关闭
  if (eventSource) {
    eventSource.close();
    isJsonLoading.value = false
    eventSource = null;
  }

  isSend.value = true;
  typewriterContent.value = ""; // 清空内容
  renderedMarkdown.value = ""; // 清空渲染内容
  completeContent.value = ""
  isLoading.value = true;

  requirements.value = description.value;
  messages.value.push({role:"user",content:description.value,has_json:false})
  const sendData = { message: description.value, use_latex: use_latex.value, json_fix: json_fix.value };
  description.value = "";

  const promise = SendDescription(newChatId.value,sendData);
  promise.then((result) => {
    if (!result.success) {
      ElMessage.warning("服务器繁忙，请稍后再试");
      return;
    }

    const sseUrl = serveAddress + result.data.sse_url;
    console.log("开始SSE连接:", sseUrl);
    
    eventSource = new EventSource(sseUrl);

    // 监听 SSE 消息
    eventSource.onmessage = (event) => {
      try {
        
        const rawData = event.data;
        const data = JSON.parse(rawData);

        if (!data) {
          console.warn("接收到空数据");
          return;
        }

        switch (data.type) {
          case "connected":
            console.log("SSE 连接成功，Session ID:", data.session_id);
            break;
          
          case 'heartbeat':
            console.log("收到心跳");
            break;
            
          case "status":
            console.log("状态更新：", data.data);
            break;
          
          case "usage":
            console.log("收到API使用统计信息：",data.data)
          
          case "reasoning":
            isLoading.value = false;
            console.log("生成内容：", data.data);
            typewriterContent.value += data.data;
            completeContent.value += data.data
            renderedMarkdown.value = renderMarkdown(typewriterContent.value);
            break;
            
          case "start_answer":
            console.log("开始回答");
            isLoading.value = false;
            break;
          
          case "latex_complete":
            console.log("latex生成完毕");
            typewriterContent.value += '\n';
            completeContent.value += '\n'
            renderedMarkdown.value = renderMarkdown(typewriterContent.value);
            isLoading.value = false;
            break;
            
          case "completed":
            console.log("生成完成");
            setTimeout(() => {
              if(eventSource) {
                eventSource.close();
                eventSource = null;
              }
              isJsonLoading.value = false;
              isSend.value = false;
              messages.value.push({role:"ai",content:completeContent.value,has_json:true});
            }, 3000); // 延迟1秒关闭，确保所有数据接收完成
            break;
            
          case 'table_start':
            console.log("表格开始", data.content);
            completeContent.value += data.content
            break;
            
          case 'table_content':
            console.log("表格内容：", data.content, "字符");
            typewriterContent.value += data.content || "";
            completeContent.value += data.content
            renderedMarkdown.value = renderMarkdown(typewriterContent.value);
            break;
            
          case 'table_end':
            console.log("表格结束", data.content);
            completeContent.value += data.content
            break;
            
          case 'json_start':
            console.log("JSON开始", data.content);
            completeContent.value += data.content
            isJsonLoading.value = true
            isComplete.value = true;
            break;
            
          case 'json_content':
            console.log("JSON内容：", data.content, "字符");
            completeContent.value += data.content
            break;
            
            case 'json_end':
              console.log("JSON结束", data.content);
              completeContent.value += data.content;
              isJsonLoading.value = false;
              
              // 在这里添加验证JSON完整性的代码
              const jsonContent = extractJsonContent(completeContent.value);
              try {
                JSON.parse(jsonContent); // 验证JSON完整性
                console.log("JSON完整性验证通过");
              } catch (e) {
                console.error("JSON不完整:", e);
              }
              break;
            
          case 'error':
            console.error("服务器错误:", data.message || data.data);
            ElMessage.error(data.message || data.data || "发生错误");
            break;
            
          default:
            console.warn("未知消息类型：", data.type, data);
        }
      } catch (error) {
        console.error("解析 SSE 消息失败：", error, "原始数据:", event.data);
      }
    };

    // 监听 SSE 错误
    eventSource.onerror = (event) => {
      console.error("SSE 连接出错：", event);

      // 显示错误信息给用户
      ElMessage.error("SSE 连接出错，请稍后重试");

      // 关闭 EventSource
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
    
  });
}

function extract(content){
  const jsonStart = "------------JSON_START------------";
  const jsonEnd = "------------JSON_END------------";
  let result = content;
  
  const jsonStartIndex = result.indexOf(jsonStart);
  const jsonEndIndex = result.indexOf(jsonEnd);
  if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
    result = result.slice(0, jsonStartIndex) + 
             result.slice(jsonEndIndex + jsonEnd.length);
  }
  
  const tableStart = "------------TABLE_START------------";
  const tableEnd = "------------TABLE_END------------";
  
  result = result.replace(tableStart, "");  // 移除表格开始标记
  result = result.replace(tableEnd, "");    // 移除表格结束标记

  return result;
}

function extractJsonFromResponse(content) {
  if(isJsonLoading.value){
    ElMessage.info("正在生成JSON中，请耐心等待")
    return
  }

  const jsonStart = "------------JSON_START------------";
  const jsonEnd = "------------JSON_END------------";

  const startIndex = content.indexOf(jsonStart) + jsonStart.length;
  const endIndex =content.indexOf(jsonEnd);

  if (startIndex !== -1 && endIndex !== -1) {
    let jsonString = content.slice(startIndex, endIndex).trim();

    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.slice(7).trim();
    }
    if (jsonString.endsWith("```")) {
      jsonString = jsonString.slice(0, -3).trim();
    }

    try {
      let promise = GetCompleteJson({ basic_json: jsonString });
      promise.then((result) => {
        if (result.success) {
          const nodes = result.data.complete_json.nodes;
          const edges = result.data.complete_json.edges;

          localStorage.setItem('vueflow-nodes', JSON.stringify(nodes));
          localStorage.setItem('vueflow-edges', JSON.stringify(edges));
          window.open(`${window.location.origin}/main2`, '_blank');

          console.log("更新后的 nodes:", nodes);
          console.log("更新后的 edges:", edges);
        }
      });
    } catch (error) {
      console.error("JSON 解析失败：", error);
      return null;
    }
  }
  else{
    console.log(completeContent.value)
    console.error("未找到json")
  }
}

onMounted(() => {
    getHistoryList()
})

function getHistoryList(){
    const promise = HistoryList()
    promise.then((result) => {
        console.log(result)
        if(result.success){
            conversations.value = result.data.conversations
        }
        else{
            ElMessage.error("获取历史会话列表出错！请刷新重试")
        }
    })
}

onUnmounted(() => {
  if (eventSource) {
    eventSource.close();
  }
})

function editTitle(conversation_id,title){
    let promise = EditTitle(conversation_id,{title:title})
    promise.then((result) =>{
        if(result.success){
            ElMessage.success("修改成功！")
            getHistoryList()
        }
        else{
            ElMessage.error("修改失败！请稍后重试")
        }
    })
}

function deleteDialog(conversation_id){
    let promise = DeleteDialog(conversation_id)
    promise.then((result) =>{
        if(result.success){
            activeMenu.value = ''
            ElMessage.success("删除成功！")
            isNewChat.value = true;
            messages.value = [];
            getHistoryList()
        }
        else{
            ElMessage.error("删除失败！请稍后重试")
        }
    })
}

const open = (conversation_id) => {
  ElMessageBox.prompt('', '请输入新名称', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    })
    .then(({ value }) => {
      editTitle(conversation_id,value)
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '输入取消',
      })
    })
}

</script>

<style scoped>
.ai-container {
  display: flex;
  height: 100vh;
}

.menu {
  max-width: 15vw;
  height: 100vh;
  background-color: rgb(249, 251, 255);
  border-radius: 5px;
  font-family: Helvetica, 'Hiragino Sans GB', 'Microsoft Yahei', '微软雅黑', Arial, sans-serif;
  font-weight: 500;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 
              0 3px 10px rgba(0, 0, 0, 0.05);
}

.title {
  font-family:  'Trebuchet MS', Arial, Helvetica, sans-serif;
  font-size: 30px;
  font-weight: bolder;
  color: rgb(44, 44, 54);
  margin-top: 3vh;
  margin-left: 1.5vw;
  margin-bottom: 3vh;
  width: 15vw;
}

.el-menu-item {
  border-radius: 15px;
  margin-left: 5%;
  margin-right: 5%;
  padding: 0px;
  height: 5vh;
  color: #606266;
}

:deep(.new-chat-button.el-button:hover)  {
  background-color: rgb(198, 220, 248) !important;
}

.more {
  width: 2%;
  text-align: center;  
  color: #606266;
  background-color: #FAFCFF;
  border: #FAFCFF;
  margin-left: 5%;
  opacity: 0;
  transition: all 0.3s ease;
}

.el-menu-item:hover .more {
  opacity: 1;
  background-color: rgb(239, 246, 255);
  border: rgb(239, 246, 255);
}

.el-menu-item.is-active .more {
  opacity: 1;
  background-color: rgb(219, 234, 254);
  border: rgb(219, 234, 254);
}

:deep(.el-menu-item:hover) {
  background-color: rgb(239, 246, 255);
  border: rgb(239, 246, 255);
}

:deep(.el-menu-item.is-active) {
  background-color: rgb(219, 234, 254);
  border: rgb(219, 234, 254);
}

.func {
  text-align: center;  
  color: #606266;
  background-color: #FAFCFF;
  border: #FAFCFF; 
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2vw;
  margin: 15vw;
  margin-top: 40vh;
  align-items: center;
  justify-content: center;
}

.dialog-box {
  border: 1px solid #e5e7eb;
  border-radius: 30px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  background-color: #F2F3F5;
  transition: all 0.3s ease;
  width: 40vw;
}

:deep(.el-textarea__inner) {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  border-radius: 30px;
  border: none;
  padding: 12px 20px;
  width: 100%;
  resize: none;
  box-shadow: none;
  background-color: #F2F3F5;
}

.ai-textarea {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: #E4E7ED;
  border-radius: 30px;
  border: none;
  width: 100%;
  resize: none;
  box-shadow: none;
  background-color: #F2F3F5;
}

.new-chat-button {
  border: none;
  background-color: rgb(219, 234, 254);
  border-radius: 10px;
  font-size: 15px;
  padding: 8%;
  color: rgb(77, 107, 254);
  margin-bottom: 3vh;
}

.new-chat-button :deep(.el-button:hover) {
  background-color: rgb(198, 220, 248);
}

.buttons {
  margin: 2%;
}

.submit-button {
  margin-left: 2vw;
  right: 1vw;
  bottom: 1vw;
  background: rgb(77, 107, 254);
  color: white;
  border: none;
  padding: 8px;
}

.submit-button:hover {
  background: rgb(37, 99, 235);
}

.historyChat {
  flex: 1;
  padding: 5vw;
  align-items: center;
  justify-content: center;
}

.dialog {
  margin-top: 2%;
  margin-right: 2%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  font-size: 15px;
  color: #333;
  line-height: 1.5;
  background-color: rgb(216.8, 235.6, 255);
}

.robot {
  margin-top: 2%;
  margin-right: 2%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  font-size: 15px;
  color: #333;
  line-height: 1.5;
  background-color: white;
}

.loading {
  width: 20px;
  height: 20px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #4285f4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

::v-deep(.markdown-body table) {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
  margin: 10px 0;
}

::v-deep(.markdown-body th),
::v-deep(.markdown-body td) {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

::v-deep(.markdown-body th) {
  background-color: #f4f4f4;
  font-weight: bold;
}
</style>
