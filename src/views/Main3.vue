<template>
  <div v-loading.fullscreen.lock="fullscreenLoading" element-loading-text="生成中，请稍候..." style="display: flex; flex-direction: column; height: 100vh; background-color:#F5F7FA;">
    <!-- 1. Top Operation Bar -->
    <div class="header">
      <el-button size="large" class="button" @click="openPrefabsDialog">
        <el-icon size="large"><Files /></el-icon>&ensp;预制动画
      </el-button>
      <el-button size="large" class="button" @click="sendGraphDataToBackendForPreview">
        <el-icon size="large"><VideoPlay /></el-icon>&ensp;预览
      </el-button>
      <el-button size="large" class="button" @click="openDownloadDialog">
        <el-icon size="large"><Download /></el-icon>&ensp;下载视频
      </el-button>
      <el-button size="large" class="button" @click="saveDialog = true">
        <el-icon size="large"><DocumentAdd /></el-icon>&ensp;保存项目
      </el-button>
      <el-button size="large" class="button" @click="loadProjectDialog">
        <el-icon size="large"><FolderOpened /></el-icon>&ensp;加载项目
      </el-button>
      <el-button size="large" class="button" @click="openDeleteProjectDialog">
        <el-icon size="large"><Delete /></el-icon>&ensp;删除项目
      </el-button>
      <el-button size="large" class="button" @click="openAiDialog">
        <el-icon size="large"><ChatDotRound /></el-icon>&ensp;AI生成
      </el-button>
    </div>

    <div class="main-content-area">
      <!-- 2. Left Panel (Asset/Animation Library) -->
      <div class="left-asset-panel">
        <h4>元素模块 (Generate)</h4>
        <div v-for="genType in draggableGenerateTypes" :key="genType.type" class="draggable-block" draggable="true" @dragstart="handleDragStartNewBlock('generate', genType.type)">{{ genType.label }}</div>
        <el-divider />
        <h4>动画模块 (Animation)</h4>
        <div v-for="animType in draggableAnimationTypes" :key="animType.type" class="draggable-block" draggable="true" @dragstart="handleDragStartNewBlock('animation', animType.type)">{{ animType.label }}</div>
        <el-divider />
        <h4>功能模块 (Function)</h4>
        <div v-for="funcType in draggableFunctionTypes" :key="funcType.type" class="draggable-block" draggable="true" @dragstart="handleDragStartNewBlock('function', funcType.type)">{{ funcType.label }}</div>
      </div>

      <!-- 3. Main Editor Area (Swimlane Timeline) -->
      <div class="timeline-editor-container" ref="timelineContainerRef" @dragover.prevent @drop="handleDropOnTimelineContainer">
        <Timeline
          :groups="timelineGroups"
          :items="timelineItems"
          :viewport.sync="timelineViewport"
          :group-id-key="'id'"
          :group-title-key="'title'"
          :item-id-key="'id'"
          :item-group-id-key="'group'"
          :item-title-key="'title'"
          :item-start-date-key="'start'"
          :item-end-date-key="'end'"
          :is-draggable="true"
          :is-resizable="true"
          :snap-to-grid="true"
          :grid-size-ms="100"
          @item-dragged="handleTimelineItemDragged"
          @item-resized="handleTimelineItemResized"
          @item-selected="handleTimelineItemSelected"
          @group-selected="handleTimelineGroupSelected"
          style="width: 100%; height: 100%;"
        >
          <template #group-label="{ group }">
            <div class="custom-group-label" @click="selectTimelineElement(group, 'group')" @dragover.prevent @drop.stop="handleDropOnGroup(group, $event)">
              <el-icon><PriceTag /></el-icon> <strong>{{ group.title }}</strong> ({{ group.data?.params?.type || 'Generate' }})
              <el-button link type="danger" size="small" @click.stop="removeTimelineGroup(group.id)" style="margin-left: auto;"><el-icon><CloseBold /></el-icon></el-button>
            </div>
          </template>
          <template #item-content="{ item }">
            <div :class="['custom-item-content', item.data?.params?.type === 'Transform' ? 'transform-item' : '']" @click="selectTimelineElement(item, 'item')">
              {{ item.title }} ({{ item.data?.params?.type }})
              <el-button link type="danger" size="small" @click.stop="removeTimelineItem(item.id)" style="position: absolute; right: 2px; top: 0px;"><el-icon><Close /></el-icon></el-button>
            </div>
          </template>
        </Timeline>
      </div>

      <!-- 4. Right Parameter Panel -->
      <div class="right-parameter-panel">
        <div v-if="selectedTimelineElement">
          <h3>{{ selectedTimelineElement.title }} 属性</h3>
          <el-divider />
          <el-form label-position="top" label-width="100px">
            <el-form-item label="ID (唯一标识)">
              <el-input :model-value="selectedTimelineElement.id" disabled />
            </el-form-item>

            <!-- Parameters for Generate Block (Group) -->
            <div v-if="selectedTimelineElement.elementType === 'group'">
              <el-form-item label="泳道名称 (Name)">
                <el-input v-model="selectedTimelineElement.title" @change="val => updateGroupData(selectedTimelineElement, 'title', val)" :disabled="selectedTimelineElement.data.params.type === 'Axes'"/>
              </el-form-item>
              <el-form-item label="元素类型 (Type)">
                <el-select v-model="selectedTimelineElement.data.params.type" placeholder="选择元素类型" @change="handleGenerateTypeChange" style="width:100%">
                  <el-option-group v-for="group in generateTypeOptions" :key="group.value" :label="group.label">
                    <el-option v-for="child in group.children" :key="child.value" :label="child.label" :value="child.value" />
                  </el-option-group>
                </el-select>
              </el-form-item>

              <!-- Common Generate Params -->
              <el-form-item label="颜色 (Color)" v-if="selectedTimelineElement.data.params.hasOwnProperty('color')">
                <el-select v-model="selectedTimelineElement.data.params.color" placeholder="选择颜色" style="width:100%">
                    <el-option v-for="item in colorType" :key="item.value" :label="item.label" :value="item.value"/>
                </el-select>
              </el-form-item>
              <el-form-item label="填充颜色 (Fill Color)" v-if="selectedTimelineElement.data.params.hasOwnProperty('fill_color')">
                 <el-select v-model="selectedTimelineElement.data.params.fill_color" placeholder="选择颜色" style="width:100%">
                    <el-option v-for="item in colorType" :key="item.value" :label="item.label" :value="item.value"/>
                </el-select>
              </el-form-item>
              <el-form-item label="填充不透明度 (Fill Opacity)" v-if="selectedTimelineElement.data.params.hasOwnProperty('fill_opacity')">
                <el-slider v-model="selectedTimelineElement.data.params.fill_opacity" :min="0" :max="1" :step="0.01" show-input size="small"/>
              </el-form-item>
               <el-form-item label="描边宽度 (Stroke Width)" v-if="selectedTimelineElement.data.params.hasOwnProperty('stroke_width')">
                <el-input-number v-model="selectedTimelineElement.data.params.stroke_width" :min="0" :step="1" size="small"/>
              </el-form-item>

              <!-- Specific params based on selectedTimelineElement.data.params.type -->
              <div v-if="selectedTimelineElement.data.params.type === 'Point'">
                <el-form-item label="位置 (Position) [x, y, z]">
                  <el-input v-model.number="selectedTimelineElement.data.params.position[0]" style="width:30%" type="number" step="0.1"/>
                  <el-input v-model.number="selectedTimelineElement.data.params.position[1]" style="width:30%; margin: 0 5px;" type="number" step="0.1"/>
                  <el-input v-model.number="selectedTimelineElement.data.params.position[2]" style="width:30%" type="number" step="0.1"/>
                </el-form-item>
                <el-form-item label="大小 (Size)">
                  <el-input-number v-model="selectedTimelineElement.data.params.size" :min="0.01" :step="0.01" size="small"/>
                </el-form-item>
              </div>
              <div v-if="selectedTimelineElement.data.params.type === 'Line'">
                <el-form-item label="起点 (Start) [x, y, z]">
                  <el-input v-model.number="selectedTimelineElement.data.params.start[0]" style="width:30%" type="number" step="0.1"/>
                  <el-input v-model.number="selectedTimelineElement.data.params.start[1]" style="width:30%; margin: 0 5px;" type="number" step="0.1"/>
                  <el-input v-model.number="selectedTimelineElement.data.params.start[2]" style="width:30%" type="number" step="0.1"/>
                </el-form-item>
                <el-form-item label="终点 (End) [x, y, z]">
                  <el-input v-model.number="selectedTimelineElement.data.params.end[0]" style="width:30%" type="number" step="0.1"/>
                  <el-input v-model.number="selectedTimelineElement.data.params.end[1]" style="width:30%; margin: 0 5px;" type="number" step="0.1"/>
                  <el-input v-model.number="selectedTimelineElement.data.params.end[2]" style="width:30%" type="number" step="0.1"/>
                </el-form-item>
              </div>
              <div v-if="selectedTimelineElement.data.params.type === 'Circle' || selectedTimelineElement.data.params.type === 'Annulus'">
                <el-form-item label="半径 (Radius)" v-if="selectedTimelineElement.data.params.hasOwnProperty('radius')">
                  <el-input-number v-model="selectedTimelineElement.data.params.radius" :min="0.01" :step="0.01" size="small"/>
                </el-form-item>
                 <el-form-item label="内半径 (Inner Radius)" v-if="selectedTimelineElement.data.params.type === 'Annulus'">
                  <el-input-number v-model="selectedTimelineElement.data.params.inner_radius" :min="0.01" :step="0.01" size="small"/>
                </el-form-item>
                 <el-form-item label="外半径 (Outer Radius)" v-if="selectedTimelineElement.data.params.type === 'Annulus'">
                  <el-input-number v-model="selectedTimelineElement.data.params.outer_radius" :min="0.01" :step="0.01" size="small"/>
                </el-form-item>
              </div>
              <div v-if="selectedTimelineElement.data.params.type === 'Rectangle' || selectedTimelineElement.data.params.type === 'Square'">
                <el-form-item label="宽度 (Width)" v-if="selectedTimelineElement.data.params.hasOwnProperty('width')">
                  <el-input-number v-model="selectedTimelineElement.data.params.width" :min="0.01" :step="0.01" size="small"/>
                </el-form-item>
                <el-form-item label="高度 (Height)" v-if="selectedTimelineElement.data.params.hasOwnProperty('height')">
                  <el-input-number v-model="selectedTimelineElement.data.params.height" :min="0.01" :step="0.01" size="small"/>
                </el-form-item>
                 <el-form-item label="边长 (Side Length)" v-if="selectedTimelineElement.data.params.type === 'Square'">
                  <el-input-number v-model="selectedTimelineElement.data.params.side_length" :min="0.01" :step="0.01" size="small"/>
                </el-form-item>
              </div>
              <div v-if="selectedTimelineElement.data.params.type === 'Text' || selectedTimelineElement.data.params.type === 'Tex' || selectedTimelineElement.data.params.type === 'MathTex'">
                <el-form-item label="文本内容 (Text Content)">
                  <el-input type="textarea" :rows="3" v-model="selectedTimelineElement.data.params.text" />
                </el-form-item>
                <el-form-item label="字体大小 (Font Size)" v-if="selectedTimelineElement.data.params.hasOwnProperty('font_size')">
                  <el-input-number v-model="selectedTimelineElement.data.params.font_size" :min="1" size="small"/>
                </el-form-item>
              </div>
              <div v-if="selectedTimelineElement.data.params.type === 'Axes' || selectedTimelineElement.data.params.type === 'NumberPlane'">
                <el-form-item label="X轴范围 (X Range) [min, max, step]">
                  <el-input v-model.number="selectedTimelineElement.data.params.x_range[0]" style="width:30%" type="number" step="0.1"/>
                  <el-input v-model.number="selectedTimelineElement.data.params.x_range[1]" style="width:30%; margin: 0 5px;" type="number" step="0.1"/>
                  <el-input v-model.number="selectedTimelineElement.data.params.x_range[2]" style="width:30%" type="number" step="0.1"/>
                </el-form-item>
                <el-form-item label="Y轴范围 (Y Range) [min, max, step]">
                  <el-input v-model.number="selectedTimelineElement.data.params.y_range[0]" style="width:30%" type="number" step="0.1"/>
                  <el-input v-model.number="selectedTimelineElement.data.params.y_range[1]" style="width:30%; margin: 0 5px;" type="number" step="0.1"/>
                  <el-input v-model.number="selectedTimelineElement.data.params.y_range[2]" style="width:30%" type="number" step="0.1"/>
                </el-form-item>
                <!-- Add more Axes/NumberPlane specific params like axis_config, background_line_style -->
              </div>
              <div v-if="selectedTimelineElement.data.params.type === 'Graph'">
                <el-form-item label="函数表达式 (Function Str)">
                  <el-input v-model="selectedTimelineElement.data.params.function_str" placeholder="e.g., x**2 or np.sin(x)"/>
                </el-form-item>
                <el-form-item label="X轴变量 (X Variable)">
                  <el-input v-model="selectedTimelineElement.data.params.x_var" placeholder="e.g., x"/>
                </el-form-item>
                <el-form-item label="绘图范围 (X Plot Range) [min, max, step]">
                  <el-input v-model.number="selectedTimelineElement.data.params.x_plot_range[0]" style="width:30%" type="number" step="0.1"/>
                  <el-input v-model.number="selectedTimelineElement.data.params.x_plot_range[1]" style="width:30%; margin: 0 5px;" type="number" step="0.1"/>
                  <el-input v-model.number="selectedTimelineElement.data.params.x_plot_range[2]" style="width:30%" type="number" step="0.01"/>
                </el-form-item>
                <el-form-item label="依附坐标系ID (Use Axes ID)">
                  <el-select v-model="selectedTimelineElement.data.params.use_axes_id" placeholder="选择依附的坐标系泳道" style="width:100%">
                    <el-option v-for="group in timelineGroups.filter(g => g.data.params.type === 'Axes' || g.data.params.type === 'NumberPlane')" :key="group.id" :label="`${group.title} (${group.id})`" :value="group.id"/>
                  </el-select>
                </el-form-item>
              </div>
              <!-- ... Add more v-if blocks for other generate types ... -->
            </div>

            <!-- Parameters for Animation/Function Block (Item) -->
            <div v-if="selectedTimelineElement.elementType === 'item'">
             <el-form-item label="模块类型 (Type)">
                <el-select v-model="selectedTimelineElement.data.params.type" placeholder="选择模块类型" @change="handleAnimationTypeChange" style="width:100%">
                    <el-option v-for="item in selectedTimelineElement.data.blockType === 'animation' ? animationTypeOptions : functionTypeOptions" :key="item.value" :label="item.label" :value="item.value"/>
                </el-select>
            </el-form-item>
            <el-form-item label="开始时间 (Start Time) (秒)">
              <el-input-number :model-value="selectedTimelineElement.data.params.start_time" @change="val => updateTimelineItemTime(selectedTimelineElement, 'start_time', val)" :precision="2" :step="0.1" :min="0"/>
            </el-form-item>
            <el-form-item label="运行时长 (Run Time) (秒)" v-if="selectedTimelineElement.data.params.hasOwnProperty('run_time')">
              <el-input-number :model-value="selectedTimelineElement.data.params.run_time" @change="val => updateTimelineItemTime(selectedTimelineElement, 'run_time', val)" :precision="2" :step="0.1" :min="0.01"/>
            </el-form-item>
            <el-form-item label="等待时长 (Duration) (秒)" v-if="selectedTimelineElement.data.params.type === 'Wait'">
              <el-input-number :model-value="selectedTimelineElement.data.params.duration" @change="val => updateTimelineItemTime(selectedTimelineElement, 'duration', val)" :precision="2" :step="0.1" :min="0.01"/>
            </el-form-item>

            <!-- Common Animation Params -->
            <el-form-item label="缓动函数 (Rate Func)" v-if="selectedTimelineElement.data.blockType === 'animation' && selectedTimelineElement.data.params.hasOwnProperty('rate_func')">
                <el-select v-model="selectedTimelineElement.data.params.rate_func" style="width:100%">
                    <el-option v-for="item in rateFuncType" :key="item.value" :label="item.label" :value="item.value"/>
                </el-select>
            </el-form-item>

            <!-- Specific params based on selectedTimelineElement.data.params.type -->
            <div v-if="selectedTimelineElement.data.params.type === 'MoveTo'">
                <el-form-item label="目标位置 (Target) [x, y, z]">
                    <el-input v-model.number="selectedTimelineElement.data.params.target[0]" style="width:30%" type="number" step="0.1"/>
                    <el-input v-model.number="selectedTimelineElement.data.params.target[1]" style="width:30%; margin: 0 5px;" type="number" step="0.1"/>
                    <el-input v-model.number="selectedTimelineElement.data.params.target[2]" style="width:30%" type="number" step="0.1"/>
                </el-form-item>
            </div>
            <div v-if="selectedTimelineElement.data.params.type === 'Rotate'">
                <el-form-item label="旋转角度 (Angle) (弧度)">
                    <el-input-number v-model="selectedTimelineElement.data.params.angle" :step="0.1" :precision="2"/>
                     <el-tooltip content="e.g., Math.PI / 2 for 90 degrees" placement="top">
                        <el-icon style="margin-left: 5px; cursor: help;"><QuestionFilled /></el-icon>
                    </el-tooltip>
                </el-form-item>
                <el-form-item label="旋转轴 (Axis) [x, y, z]">
                    <el-input v-model.number="selectedTimelineElement.data.params.axis[0]" style="width:30%" type="number" step="0.1" placeholder="0"/>
                    <el-input v-model.number="selectedTimelineElement.data.params.axis[1]" style="width:30%; margin: 0 5px;" type="number" step="0.1" placeholder="0"/>
                    <el-input v-model.number="selectedTimelineElement.data.params.axis[2]" style="width:30%" type="number" step="0.1" placeholder="1"/>
                </el-form-item>
            </div>
            <div v-if="selectedTimelineElement.data.params.type === 'Transform' || selectedTimelineElement.data.params.type === 'ReplacementTransform'">
                <el-form-item label="目标对象泳道 (Target Object Swimlane)">
                    <el-select v-model="selectedTimelineElement.data.params.target_object_id" placeholder="选择目标元素所在的泳道" style="width:100%">
                        <el-option v-for="group in timelineGroups" :key="group.id" :label="`${group.title} (${group.id})`" :value="group.id" :disabled="group.id === selectedTimelineElement.group"/>
                    </el-select>
                </el-form-item>
            </div>
            <!-- ... Add more v-if blocks for other animation/function types ... -->
          </div>
          </el-form>
        </div>
        <div v-else>
          <p>在时间轴中选中一个元素泳道或动画片段来编辑其属性。</p>
          <p>从左侧素材库拖拽元素到主编辑区创建新的元素泳道，或拖拽动画到已有的泳道中。</p>
        </div>
      </div>
    </div>

    <!-- Dialogs -->
    <el-dialog v-model="saveDialog" title="保存项目" width="500px" align-center>
        <el-form-item label="项目名称">
            <el-input v-model="currentProjectName" placeholder="请输入项目名称"/>
        </el-form-item>
        <template #footer>
            <el-button @click="saveDialog = false">取消</el-button>
            <el-button type="primary" @click="handleSaveProject">保存</el-button>
        </template>
    </el-dialog>

    <el-dialog v-model="loadProjectListDialog" title="加载项目" width="600px" align-center>
        <el-table :data="availableProjects" style="width: 100%" @row-click="confirmLoadProject" max-height="400px">
            <el-table-column prop="projectName" label="项目名称" />
            <el-table-column prop="updateTime" label="更新时间" width="180"/>
        </el-table>
         <template #footer>
            <el-button @click="loadProjectListDialog = false">取消</el-button>
        </template>
    </el-dialog>

    <el-dialog v-model="deleteProjectDialog" title="删除项目" width="600px" align-center>
        <p style="margin-bottom:10px;">请选择要删除的项目:</p>
        <el-table :data="availableProjects" style="width: 100%" @row-click="confirmDeleteProject" max-height="400px">
            <el-table-column prop="projectName" label="项目名称" />
             <el-table-column prop="updateTime" label="更新时间" width="180"/>
        </el-table>
         <template #footer>
            <el-button @click="deleteProjectDialog = false">取消</el-button>
        </template>
    </el-dialog>

    <el-dialog v-model="prefabsDialog" title="预制动画" width="700px" align-center>
        <!-- Placeholder for prefabs list and selection -->
        <el-table :data="availablePrefabs" style="width: 100%" @row-click="handleLoadPrefab" max-height="400px">
            <el-table-column prop="name" label="预制动画名称" />
            <el-table-column prop="description" label="描述" />
        </el-table>
        <template #footer>
            <el-button @click="prefabsDialog = false">关闭</el-button>
        </template>
    </el-dialog>

    <el-dialog v-model="downloadVideoDialog" title="下载视频参数" width="500px" align-center>
        <el-form label-position="top">
            <el-form-item label="视频质量">
                <el-select v-model="downloadParams.quality" placeholder="选择质量" style="width:100%">
                    <el-option label="低 (480p)" value="low"/>
                    <el-option label="中 (720p)" value="medium"/>
                    <el-option label="高 (1080p)" value="high"/>
                    <el-option label="超高 (4K)" value="ultra_high"/>
                </el-select>
            </el-form-item>
            <el-form-item label="帧率 (FPS)">
                 <el-select v-model="downloadParams.frame_rate" placeholder="选择帧率" style="width:100%">
                    <el-option label="15 FPS" :value="15"/>
                    <el-option label="30 FPS" :value="30"/>
                    <el-option label="60 FPS" :value="60"/>
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="downloadVideoDialog = false">取消</el-button>
            <el-button type="primary" @click="handleDownloadVideo">开始下载</el-button>
        </template>
    </el-dialog>

    <el-dialog v-model="aiGenerateDialog" title="AI 动画生成" width="70%" @close="closeAiDialog" custom-class="ai-dialog">
        <div class="ai-dialog-content">
            <div class="ai-chat-area">
                <div v-for="(message, index) in aiChatHistory" :key="index" :class="['ai-message', message.sender]">
                    <el-avatar :style="{ backgroundColor: message.sender === 'user' ? '#409EFF' : '#67C23A' }">
                        {{ message.sender === 'user' ? '我' : 'AI' }}
                    </el-avatar>
                    <div class="ai-message-text" v-html="renderMarkdown(message.text)"></div>
                </div>
                <div v-if="aiIsLoading" class="ai-message ai">
                     <el-avatar style="background-color: #67C23A;">AI</el-avatar>
                     <div class="ai-message-text">思考中... <el-icon class="is-loading"><Loading /></el-icon></div>
                </div>
            </div>
            <div class="ai-input-area">
                <el-input
                    type="textarea"
                    :rows="4"
                    placeholder="请输入您的动画需求描述..."
                    v-model="aiPrompt"
                    @keyup.enter="sendAiPrompt"
                    :disabled="aiIsLoading"
                />
                <div style="margin-top: 10px; display:flex; justify-content: space-between; align-items: center;">
                    <div>
                        <el-checkbox v-model="aiUseLatex" label="使用LaTeX优化公式" :disabled="aiIsLoading"/>
                        <el-checkbox v-model="aiJsonFix" label="启用JSON修复" :disabled="aiIsLoading"/>
                    </div>
                    <el-button type="primary" @click="sendAiPrompt" :loading="aiIsLoading">发送</el-button>
                </div>
            </div>
        </div>
         <template #footer>
            <el-button @click="closeAiDialog" :disabled="aiIsLoading">关闭</el-button>
            <el-button type="success" @click="applyAiResult" :disabled="!aiGeneratedJson || aiIsLoading">应用到时间轴</el-button>
        </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue';
import { Timeline as VueTimelineChart } from "vue-timeline-chart"; // Changed this line
import { ElMessage, ElMessageBox } from 'element-plus';
import { Timeline } from 'vue-timeline-chart';
import 'vue-timeline-chart/style.css';
import { Files, VideoPlay, Download, DocumentAdd, FolderOpened, Delete, ChatDotRound, PriceTag, CloseBold, Close, QuestionFilled, Loading } from '@element-plus/icons-vue';
import { marked } from 'marked'; // For rendering AI markdown response

// Import API functions
import { DeleteProject as apiDeleteProject, DownloadVideo as apiDownloadVideo, GetCompleteJson as apiGetCompleteJson, GetProject as apiGetProject, PostProject as apiPostProject, PostVideo as apiPostVideo, /* SendDescription as apiSendDescription - replaced by SSE */ } from "@/api/main";
import { serveAddress } from "@/api/api"; // For SSE

// --- Constants ---
const SEC_TO_MS = 1000;
const MS_TO_SEC = 0.001;
const DEFAULT_ANIMATION_RUNTIME_SEC = 1;
const UTC_BASE_YEAR = 2000; // For consistent Date object base

// --- Reactive State for Timeline ---
const timelineGroups = ref([]);
const timelineItems = ref([]);
const timelineViewport = ref({
  start: new Date(Date.UTC(UTC_BASE_YEAR, 0, 1, 0, 0, 0)),
  end: new Date(Date.UTC(UTC_BASE_YEAR, 0, 1, 0, 10, 0)) // Initial 10 seconds view
});
const selectedTimelineElement = ref(null);

// --- IDs and Drag State ---
let nextGroupId = 0;
let nextItemId = 0;
const draggedNewBlockInfo = ref(null);
const timelineContainerRef = ref(null);

// --- Dialogs and Project Management State ---
const fullscreenLoading = ref(false);
const saveDialog = ref(false);
const currentProjectName = ref('');
const loadProjectListDialog = ref(false);
const availableProjects = ref([]);
const deleteProjectDialog = ref(false);
const prefabsDialog = ref(false);
const availablePrefabs = ref([ /* {name: 'Prefab1', description: 'Desc1', data: {nodes:[], edges:[]}} */ ]); // Populate this
const downloadVideoDialog = ref(false);
const downloadParams = reactive({ quality: 'high', frame_rate: 30 });
const aiGenerateDialog = ref(false);
const aiPrompt = ref('');
const aiChatHistory = ref([]);
const aiIsLoading = ref(false);
const aiUseLatex = ref(true);
const aiJsonFix = ref(false);
let aiEventSource = null;
const aiGeneratedJson = ref(null);


// --- Parameter Options (Copied and adapted from Main.vue) ---
const draggableGenerateTypes = ref([
    { label: "点", type: "Point"}, { label: "线", type: "Line"}, { label: "圆", type: "Circle"}, { label: "矩形", type: "Rectangle"},
    { label: "正方形", type: "Square"}, { label: "多边形", type: "Polygon"}, { label: "星形", type: "Star"},
    { label: "文本", type: "Text"}, { label: "LaTeX公式", type: "Tex"}, { label: "数学公式", type: "MathTex"},
    { label: "坐标系", type: "Axes"}, { label: "函数图像", type: "Graph"},
]);
const draggableAnimationTypes = ref([
    { label: "移动", type: "MoveTo"}, { label: "创建", type: "Create"}, { label: "消失", type: "Uncreate"}, { label: "书写", type: "Write"},
    { label: "闪过", type: "ShowPassingFlash"}, { label: "淡入", type: "FadeIn"}, { label: "淡出", type: "FadeOut"},
    { label: "缩放", type: "ScaleInPlace"}, { label: "旋转", type: "Rotate"}, { label: "变换", type: "Transform"},
    { label: "替换变换", type: "ReplacementTransform"},
]);
const draggableFunctionTypes = ref([
    { label: "等待", type: "Wait"}, { label: "成组", type: "Group"}, /* Add more if needed */
]);

const generateTypeOptions = ref([
    {value: "basic", label: "基础几何图形", children: [
        { value: "Point", label: "点 (Point)" }, { value: "Line", label: "直线 (Line)" }, { value: "Circle", label: "圆 (Circle)" },
        { value: "Rectangle", label: "矩形 (Rectangle)" }, { value: "Square", label: "正方形 (Square)" },
        { value: "Polygon", label: "多边形 (Polygon)" }, { value: "Star", label: "星形 (Star)" },
        { value: "RegularPolygon", label: "正多边形 (RegularPolygon)"}, { value: "Arc", label: "弧 (Arc)"},
        { value: "Sector", label: "扇形 (Sector)"}, { value: "Annulus", label: "圆环 (Annulus)"}, { value: "Ellipse", label: "椭圆 (Ellipse)"}
    ]},
    {value: "text", label: "文本与公式", children: [
        { value: "Text", label: "文本 (Text)" }, { value: "Tex", label: "LaTeX公式 (Tex)" }, { value: "MathTex", label: "数学公式 (MathTex)"}
    ]},
    {value: "axis", label: "坐标与图表", children: [
        { value: "Axes", label: "坐标轴 (Axes)" }, { value: "NumberPlane", label: "数字平面 (NumberPlane)" },
        { value: "Graph", label: "函数图像 (Graph)" },
        // { value: "BarChart", label: "柱状图 (BarChart)" }, { value: "PieChart", label: "饼图 (PieChart)" } // Backend support needed
    ]},
    // {value: "vector_field", label: "向量场", children: [{ value: "VectorField", label: "向量場 (VectorField)" }]},
]);
const animationTypeOptions = ref([
    { value: "MoveTo", label: "平移动画 (MoveTo)" }, { value: "Create", label: "创建动画 (Create)" },
    { value: "Uncreate", label: "消失动画 (Uncreate)" }, { value: "Write", label: "书写动画 (Write)" },
    { value: "DrawBorderThenFill", label: "描边后填充 (DrawBorderThenFill)"}, { value: "ShowPassingFlash", label: "闪过动画 (ShowPassingFlash)"},
    { value: "FadeIn", label: "淡入动画 (FadeIn)" }, { value: "FadeOut", label: "淡出动画 (FadeOut)" },
    { value: "FadeToColor", label: "渐变颜色 (FadeToColor)"}, { value: "ScaleInPlace", label: "原地缩放 (ScaleInPlace)"},
    { value: "Rotate", label: "旋转动画 (Rotate)"}, { value: "Transform", label: "变换动画 (Transform)"},
    { value: "ReplacementTransform", label: "替换变换 (ReplacementTransform)"},
    // { value: "TransformMatchingShapes", label: "匹配形状变换 (TransformMatchingShapes)"}, // Complex
    // { value: "ApplyMethod", label: "应用方法 (ApplyMethod)"}, { value: "ApplyFunction", label: "应用函数 (ApplyFunction)"}
]);
const functionTypeOptions = ref([
    { value: "Wait", label: "场景等待 (Wait)" },
    // { value: "Group", label: "成组 (Group)" }, { value: "Ungroup", label: "解组 (Ungroup)" },
    // { value: "AddToGroup", label: "添加到组 (AddToGroup)" }, { value: "RemoveFromGroup", label: "从组移除 (RemoveFromGroup)" },
    // { value: "SetZIndex", label: "设置层级 (SetZIndex)" }, { value: "Clear", label: "清空场景 (Clear)" }
]);
const colorType = ref([
    { value: "RED", label: "红色 (RED)"}, { value: "YELLOW", label: "黄色 (YELLOW)"}, { value: "BLUE", label: "蓝色 (BLUE)"},
    { value: "GREEN", label: "绿色 (GREEN)"}, { value: "ORANGE", label: "橙色 (ORANGE)"}, { value: "PURPLE", label: "紫色 (PURPLE)"},
    { value: "PINK", label: "粉色 (PINK)"}, { value: "WHITE", label: "白色 (WHITE)"}, { value: "BLACK", label: "黑色 (BLACK)"},
    { value: "GRAY", label: "灰色 (GRAY)"}, { value: "LIGHT_GRAY", label: "浅灰 (LIGHT_GRAY)"},
]);
const rateFuncType = ref([
    {value: "linear", label: "线性 (linear)"}, {value: "smooth", label: "平滑 (smooth)"}, {value: "rush_into", label: "快速进入 (rush_into)"},
    {value: "rush_from", label: "快速离开 (rush_from)"}, {value: "slow_into", label: "慢速进入 (slow_into)"},
    {value: "double_smooth", label: "双重平滑 (double_smooth)"}, {value: "there_and_back", label: "往返 (there_and_back)"},
    {value: "there_and_back_with_pause", label: "带停顿往返 (there_and_back_with_pause)"},
    {value: "running_start", label: "加速启动 (running_start)"}, {value: "wiggle", label: "摆动 (wiggle)"},
    {value: "squish", label: "挤压 (squish)"}, {value: "lingering", label: "逗留 (lingering)"},
    {value: "exponential_decay", label: "指数衰减 (exponential_decay)"}
]);

// --- Core Timeline Interaction Functions ---
function getBaseTime() {
  return timelineViewport.value.start.getTime();
}

function handleDragStartNewBlock(blockType, specificType) {
  const defaultParams = getDefaultParamsForBlock(blockType, specificType, calculateNewAnimationDefaultStartTimeSec());
  draggedNewBlockInfo.value = { blockType, type: specificType, defaultParams };
}

function handleDropOnTimelineContainer(event) {
  if (!draggedNewBlockInfo.value) return;
  const { blockType, type, defaultParams } = draggedNewBlockInfo.value;

  if (blockType === 'generate') {
    const newGroupId = `generate_${nextGroupId++}`;
    const newGroup = {
      id: newGroupId,
      title: type === 'Axes' ? 'axis' : `${type}_${nextGroupId-1}`, // Axes name is fixed
      data: { blockType: 'generate', params: { ...defaultParams, type } }
    };
    timelineGroups.value.push(newGroup);
    selectTimelineElement(newGroup, 'group');
  } else {
     ElMessage.info("请将动画或功能模块拖拽到具体的元素泳道上。");
  }
  draggedNewBlockInfo.value = null;
}

function handleDropOnGroup(targetGroup, event) {
  if (!draggedNewBlockInfo.value || draggedNewBlockInfo.value.blockType === 'generate') {
    draggedNewBlockInfo.value = null;
    return;
  }
  const { blockType, type, defaultParams } = draggedNewBlockInfo.value;

  const itemsInGroup = timelineItems.value.filter(item => item.group === targetGroup.id);
  const lastItemInGroup = itemsInGroup.sort((a,b) => a.end.getTime() - b.end.getTime()).pop();
  if (lastItemInGroup && lastItemInGroup.data.params.type === 'Transform') {
      ElMessage.warning(`不能在“变换 (Transform)”动画块之后添加新的动画块到同一个泳道。`);
      draggedNewBlockInfo.value = null;
      return;
  }

  const newItemId = `${blockType}_${nextItemId++}`;
  const startTimeSec = defaultParams.start_time !== undefined ? defaultParams.start_time : calculateNewAnimationDefaultStartTimeSec(targetGroup.id);
  let runTimeSec = DEFAULT_ANIMATION_RUNTIME_SEC;
  if (defaultParams.run_time !== undefined) runTimeSec = defaultParams.run_time;
  else if (type === 'Wait' && defaultParams.duration !== undefined) runTimeSec = defaultParams.duration;


  const newItem = {
    id: newItemId,
    group: targetGroup.id,
    title: `${type}_${nextItemId-1}`,
    start: new Date(getBaseTime() + startTimeSec * SEC_TO_MS),
    end: new Date(getBaseTime() + (startTimeSec + runTimeSec) * SEC_TO_MS),
    data: { blockType, params: { ...defaultParams, type, start_time: startTimeSec, run_time: runTimeSec } },
    isDraggable: true, isResizable: true,
  };
  timelineItems.value.push(newItem);
  selectTimelineElement(newItem, 'item');
  updateTimelineViewportAuto();
  draggedNewBlockInfo.value = null;
}

function handleTimelineItemDragged(itemProxy, newGroupProxy, newStart, newEnd) {
  const item = timelineItems.value.find(i => i.id === itemProxy.id);
  const newGroup = timelineGroups.value.find(g => g.id === newGroupProxy.id);
  if (!item || !newGroup) return;

  // Transform constraint when moving
  const itemsInNewGroup = timelineItems.value.filter(i => i.group === newGroup.id && i.id !== item.id);
  const lastItemInNewGroup = itemsInNewGroup.sort((a,b) => a.end.getTime() - b.end.getTime()).pop();
  if (lastItemInNewGroup && lastItemInNewGroup.data.params.type === 'Transform' && newStart.getTime() >= lastItemInNewGroup.end.getTime()) {
      ElMessage.warning(`不能将动画块移动到“变换 (Transform)”动画块之后的目标泳道。`);
      // vue-timeline-chart should ideally revert if we don't update the state.
      // Forcing a re-render or state reset might be needed if it doesn't.
      return;
  }
  // If the item being dragged IS a Transform, ensure no items are after it in the new group
  if (item.data.params.type === 'Transform') {
      const itemsAfterInNewGroup = itemsInNewGroup.filter(i => i.start.getTime() >= newEnd.getTime());
      if (itemsAfterInNewGroup.length > 0) {
          ElMessage.warning(`“变换 (Transform)”动画块之后不能有其他动画块。`);
          return;
      }
  }


  item.group = newGroup.id;
  item.start = newStart;
  item.end = newEnd;
  item.data.params.start_time = parseFloat(((newStart.getTime() - getBaseTime()) * MS_TO_SEC).toFixed(3));
  item.data.params.run_time = parseFloat(((newEnd.getTime() - newStart.getTime()) * MS_TO_SEC).toFixed(3));

  if (selectedTimelineElement.value?.id === item.id) {
    selectedTimelineElement.value = { ...item, elementType: 'item' };
  }
  updateTimelineViewportAuto();
}

function handleTimelineItemResized(itemProxy, newStart, newEnd) {
  const item = timelineItems.value.find(i => i.id === itemProxy.id);
  if (!item) return;

  // Transform constraint when resizing
  if (item.data.params.type === 'Transform') {
      const itemsAfterInGroup = timelineItems.value.filter(i => i.group === item.group && i.id !== item.id && i.start.getTime() >= newEnd.getTime());
      if (itemsAfterInGroup.length > 0) {
          ElMessage.warning(`调整大小后的“变换 (Transform)”动画块之后不能有其他动画块。`);
          // Revert visual change - vue-timeline-chart might need help here
          // For now, we prevent the state update.
          return;
      }
  }

  item.start = newStart;
  item.end = newEnd;
  item.data.params.start_time = parseFloat(((newStart.getTime() - getBaseTime()) * MS_TO_SEC).toFixed(3));
  item.data.params.run_time = parseFloat(((newEnd.getTime() - newStart.getTime()) * MS_TO_SEC).toFixed(3));

  if (item.data.params.run_time <= 0) {
      ElMessage.warning("动画时长必须大于0。");
      // Attempt to revert (this is tricky without direct control over the component's internal revert)
      // A simple way is to re-fetch or re-assign the old values if stored, or force a re-render.
      // For now, the invalid state might persist visually until next valid interaction.
      return;
  }

  if (selectedTimelineElement.value?.id === item.id) {
    selectedTimelineElement.value = { ...item, elementType: 'item' };
  }
  updateTimelineViewportAuto();
}

function selectTimelineElement(element, type) {
  if (type === 'group') {
    const originalGroup = timelineGroups.value.find(g => g.id === element.id);
    if (originalGroup) selectedTimelineElement.value = { ...originalGroup, elementType: 'group' };
  } else if (type === 'item') {
    const originalItem = timelineItems.value.find(i => i.id === element.id);
    if (originalItem) selectedTimelineElement.value = { ...originalItem, elementType: 'item' };
  }
}
function handleTimelineItemSelected(itemProxy){ selectTimelineElement(itemProxy, 'item');}
function handleTimelineGroupSelected(groupProxy){ selectTimelineElement(groupProxy, 'group');}

function removeTimelineGroup(groupId) {
    const groupToRemove = timelineGroups.value.find(g => g.id === groupId);
    if (!groupToRemove) return;
    ElMessageBox.confirm(`确定要删除元素泳道 "${groupToRemove.title}"及其所有动画块吗?`, '警告', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
    }).then(() => {
        timelineGroups.value = timelineGroups.value.filter(g => g.id !== groupId);
        timelineItems.value = timelineItems.value.filter(i => i.group !== groupId);
        if (selectedTimelineElement.value?.id === groupId) selectedTimelineElement.value = null;
        ElMessage.success('元素泳道已删除。');
    }).catch(() => {});
}

function removeTimelineItem(itemId) {
    const itemToRemove = timelineItems.value.find(i => i.id === itemId);
    if (!itemToRemove) return;
    timelineItems.value = timelineItems.value.filter(i => i.id !== itemId);
    if (selectedTimelineElement.value?.id === itemId) selectedTimelineElement.value = null;
    ElMessage.success(`动画块 "${itemToRemove.title}" 已删除。`);
}

// --- Right Panel Update Logic ---
function updateTimelineItemTime(item, paramKey, valueInSeconds) {
  const targetItem = timelineItems.value.find(i => i.id === item.id);
  if (!targetItem) return;

  let newStartTimeSec, newRunTimeSec;

  if (paramKey === 'start_time') {
    newStartTimeSec = Math.max(0, valueInSeconds); // Ensure non-negative
    newRunTimeSec = targetItem.data.params.run_time || DEFAULT_ANIMATION_RUNTIME_SEC;
    targetItem.data.params.start_time = newStartTimeSec;
  } else if (paramKey === 'run_time' || paramKey === 'duration') { // duration for Wait
    newRunTimeSec = Math.max(0.01, valueInSeconds); // Ensure positive
    newStartTimeSec = targetItem.data.params.start_time || 0;
    targetItem.data.params.run_time = newRunTimeSec;
    if (paramKey === 'duration') targetItem.data.params.duration = newRunTimeSec;
  } else {
    return;
  }

  targetItem.start = new Date(getBaseTime() + newStartTimeSec * SEC_TO_MS);
  targetItem.end = new Date(targetItem.start.getTime() + newRunTimeSec * SEC_TO_MS);

  if(selectedTimelineElement.value && selectedTimelineElement.value.id === targetItem.id) {
     selectedTimelineElement.value = {...targetItem, elementType: 'item'};
  }
  updateTimelineViewportAuto();
}

function updateGroupData(group, paramKey, value) {
    const targetGroup = timelineGroups.value.find(g => g.id === group.id);
    if(targetGroup) {
        if(paramKey === 'title' && targetGroup.data.params.type !== 'Axes') targetGroup.title = value;
        // For other params: targetGroup.data.params[paramKey] = value;
        if(selectedTimelineElement.value && selectedTimelineElement.value.id === targetGroup.id) {
            selectedTimelineElement.value = {...targetGroup, elementType: 'group'};
        }
    }
}
function handleGenerateTypeChange() {
    if (!selectedTimelineElement.value || selectedTimelineElement.value.elementType !== 'group') return;
    const group = selectedTimelineElement.value;
    const newType = group.data.params.type;
    const defaultParams = getDefaultParamsForBlock('generate', newType);

    // Preserve name if not Axes, otherwise set to 'axis'
    const preservedTitle = (newType === 'Axes') ? 'axis' : group.title;
    if (newType === 'Axes' && group.title !== 'axis') ElMessage.info("坐标轴泳道的名称固定为 'axis'");


    group.data.params = { ...defaultParams, type: newType };
    group.title = preservedTitle;


    const groupIndex = timelineGroups.value.findIndex(g => g.id === group.id);
    if (groupIndex !== -1) {
        timelineGroups.value[groupIndex].data.params = group.data.params;
        timelineGroups.value[groupIndex].title = group.title;
    }
    // Re-select to refresh panel with new defaults
    selectedTimelineElement.value = {...timelineGroups.value[groupIndex], elementType: 'group'};
}
function handleAnimationTypeChange() {
    if (!selectedTimelineElement.value || selectedTimelineElement.value.elementType !== 'item') return;
    const item = selectedTimelineElement.value;
    const newType = item.data.params.type;
    const blockType = item.data.blockType;
    const defaultParams = getDefaultParamsForBlock(blockType, newType, item.data.params.start_time);

    const preservedParams = {
        start_time: item.data.params.start_time,
        run_time: item.data.params.run_time || (newType === 'Wait' ? defaultParams.duration : DEFAULT_ANIMATION_RUNTIME_SEC),
    };
    if (newType === 'Wait') preservedParams.duration = preservedParams.run_time;


    item.data.params = { ...defaultParams, ...preservedParams, type: newType };
    item.title = `${newType}_${item.id.split('_').pop()}`; // Update title

    const itemIndex = timelineItems.value.findIndex(i => i.id === item.id);
    if (itemIndex !== -1) {
        timelineItems.value[itemIndex].data.params = item.data.params;
        timelineItems.value[itemIndex].title = item.title;
        selectedTimelineElement.value = {...timelineItems.value[itemIndex], elementType: 'item'};
    }
}

// --- Data Conversion for Backend ---
function collectGraphDataForBackend() {
  const nodes = [];
  const edges = [];
  const baseTimeMs = getBaseTime();

  // Validate Transform target_object_id
  for (const item of timelineItems.value) {
      if (item.data.params.type === 'Transform' || item.data.params.type === 'ReplacementTransform') {
          if (!item.data.params.target_object_id || !timelineGroups.value.some(g => g.id === item.data.params.target_object_id)) {
              ElMessage.error(`变换动画 "${item.title}" 未指定有效的目标对象泳道。请在右侧面板中选择。`);
              return null; // Indicate failure
          }
      }
  }

  timelineGroups.value.forEach(group => {
    nodes.push({
      id: group.id,
      blockType: 'generate',
      type: group.data.params.type,
      position: group.data.params.position || [0,0,0], // For compatibility
      data: { label: group.title, params: { ...group.data.params } }
    });

    const itemsInGroup = timelineItems.value
      .filter(item => item.group === group.id)
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    let previousBlockId = group.id;

    itemsInGroup.forEach(item => {
      const startTimeSec = parseFloat(((item.start.getTime() - baseTimeMs) * MS_TO_SEC).toFixed(3));
      let runTimeSec = parseFloat(((item.end.getTime() - item.start.getTime()) * MS_TO_SEC).toFixed(3));

      if (item.data.params.type === 'Wait' && item.data.params.duration) {
          runTimeSec = parseFloat(item.data.params.duration.toFixed(3));
      }

      if (runTimeSec <= 0) {
          ElMessage.error(`动画块 "${item.title}" 的时长为零或负数，将被跳过。`);
          return;
      }

      const nodeDataParams = { ...item.data.params, start_time: startTimeSec, run_time: runTimeSec };
      if (item.data.params.type === 'Wait') nodeDataParams.duration = runTimeSec; // Ensure duration is consistent for Wait

      nodes.push({
        id: item.id,
        blockType: item.data.blockType,
        type: item.data.params.type,
        position: [0,0,0],
        data: { label: item.title, params: nodeDataParams }
      });

      edges.push({
        id: `edge_${previousBlockId}_to_${item.id}`,
        source: previousBlockId,
        target: item.id,
        animated: true, markerEnd: { type: 'arrowclosed' }, style: { strokeWidth: 2 }
      });
      previousBlockId = item.id;
    });
  });
  return { nodes, edges };
}

// --- Load Project Logic ---
function populateTimelineFromLoadedData(loadedNodes, loadedEdges) {
  const newGroups = [];
  const newItems = [];
  nextGroupId = 0;
  nextItemId = 0;
  const baseTimeMs = getBaseTime();

  const nodeMap = new Map(loadedNodes.map(n => [n.id, n]));

  loadedNodes.filter(n => n.blockType === 'generate').forEach(n => {
    newGroups.push({
      id: n.id,
      title: n.data.label || `${n.type || 'Gen'}_${nextGroupId}`,
      data: { blockType: 'generate', params: { ...(n.data.params || {type: n.type}) } } // Ensure params exists
    });
    const idNum = parseInt(n.id.split('_').pop());
    if (!isNaN(idNum) && idNum >= nextGroupId) nextGroupId = idNum + 1;
  });

  const getGroupIdForAnimation = (animNodeId) => {
    let currentId = animNodeId;
    const visited = new Set();
    while(currentId && !visited.has(currentId)) {
        visited.add(currentId);
        const edge = loadedEdges.find(e => e.target === currentId);
        if (!edge) return null;
        const sourceNode = nodeMap.get(edge.source);
        if (!sourceNode) return null;
        if (sourceNode.blockType === 'generate') return sourceNode.id;
        currentId = sourceNode.id;
    }
    return null;
  };


  loadedNodes.filter(n => n.blockType === 'animation' || n.blockType === 'function').forEach(n => {
    const groupId = getGroupIdForAnimation(n.id);
    if (groupId && newGroups.some(g => g.id === groupId)) {
      const params = n.data.params || {type: n.type};
      const startTimeSec = params.start_time || 0;
      let runTimeSec = params.run_time || DEFAULT_ANIMATION_RUNTIME_SEC;
      if (params.type === 'Wait' && params.duration) runTimeSec = params.duration;


      newItems.push({
        id: n.id,
        group: groupId,
        title: n.data.label || `${params.type || 'Item'}_${nextItemId}`,
        start: new Date(baseTimeMs + startTimeSec * SEC_TO_MS),
        end: new Date(baseTimeMs + (startTimeSec + runTimeSec) * SEC_TO_MS),
        data: { blockType: n.blockType, params: { ...params } },
        isDraggable: true, isResizable: true,
      });
      const idNum = parseInt(n.id.split('_').pop());
      if (!isNaN(idNum) && idNum >= nextItemId) nextItemId = idNum + 1;
    } else {
        console.warn(`模块 ${n.id} (类型: ${n.type}) 无法映射到有效的元素泳道，可能已丢失其父级元素。`);
    }
  });

  timelineGroups.value = newGroups;
  timelineItems.value = newItems;
  selectedTimelineElement.value = null;
  updateTimelineViewportAuto();
  ElMessage.success("项目数据已加载到时间轴。");
}

// --- Utility Functions ---
function calculateNewAnimationDefaultStartTimeSec(groupId = null) {
  let relevantItems = timelineItems.value;
  if (groupId) {
    relevantItems = timelineItems.value.filter(item => item.group === groupId);
  }
  if (relevantItems.length === 0) return 0; // Start at 0 if group is empty
  const maxEndTimeMs = Math.max(0, ...relevantItems.map(item => item.end.getTime()));
  // Add a small gap, e.g., 0.1s, or snap to grid
  const lastEndTimeSec = (maxEndTimeMs - getBaseTime()) * MS_TO_SEC;
  return parseFloat(lastEndTimeSec.toFixed(3)); // Snapping might be better handled by vue-timeline-chart config
}

function updateTimelineViewportAuto() {
  nextTick(() => {
    if (timelineItems.value.length === 0 && timelineGroups.value.length === 0) {
      timelineViewport.value = {
        start: new Date(Date.UTC(UTC_BASE_YEAR, 0, 1, 0, 0, 0)),
        end: new Date(Date.UTC(UTC_BASE_YEAR, 0, 1, 0, 10, 0))
      };
      return;
    }
    let minOverallStartTimeMs = timelineViewport.value.start.getTime();
    let maxOverallEndTimeMs = timelineViewport.value.end.getTime();

    if (timelineItems.value.length > 0) {
        minOverallStartTimeMs = Math.min(...timelineItems.value.map(item => item.start.getTime()));
        maxOverallEndTimeMs = Math.max(...timelineItems.value.map(item => item.end.getTime()));
    } else if (timelineGroups.value.length > 0) { // Only groups, keep viewport or default
        minOverallStartTimeMs = getBaseTime(); // Keep current start
        maxOverallEndTimeMs = getBaseTime() + 10 * SEC_TO_MS; // Show 10s from start
    }

    const minDurationMs = 5 * SEC_TO_MS; // Min viewport duration 5s
    if (maxOverallEndTimeMs - minOverallStartTimeMs < minDurationMs) {
      maxOverallEndTimeMs = minOverallStartTimeMs + minDurationMs;
    }
    const paddingMs = 1 * SEC_TO_MS; // 1s padding
    timelineViewport.value = {
      start: new Date(minOverallStartTimeMs - paddingMs),
      end: new Date(maxOverallEndTimeMs + paddingMs)
    };
  });
}

function getDefaultParamsForBlock(blockType, specificType, currentTotalDurationSeconds = 0) {
    let params = { type: specificType };
    const necessary = []; // You might want to repopulate this if validation is added

    if (blockType === "generate") {
        params.color = "WHITE";
        params.fill_opacity = 1.0;
        params.stroke_width = 4;
        // params.use_axes = true; // This concept changes with swimlanes; graph elements will need an axis_id

        switch (specificType) {
            case "Point":
                params.position = [0, 0, 0]; params.size = 0.1; break;
            case "Line":
                params.start = [-1, 0, 0]; params.end = [1, 0, 0]; break;
            case "Circle":
                params.radius = 1; break;
            case "Square":
                params.side_length = 2; break;
            case "Rectangle":
                params.width = 2; params.height = 1; break;
            case "Polygon":
                params.vertices = [[-1,-1,0], [1,-1,0], [0,1,0]]; break; // Example
            case "Star":
                params.n_points = 5; params.outer_radius = 1; params.inner_radius = 0.5; break;
            case "RegularPolygon":
                params.n_sides = 6; params.radius = 1; break;
            case "Arc":
                params.radius = 1; params.start_angle = 0; params.angle = Math.PI / 2; break;
            case "Sector":
                params.outer_radius = 1; params.inner_radius = 0; params.start_angle = 0; params.angle = Math.PI / 2; break;
            case "Annulus":
                params.inner_radius = 0.5; params.outer_radius = 1; break;
            case "Ellipse":
                params.width = 2; params.height = 1; break;
            case "Text":
            case "Tex":
            case "MathTex":
                params.text = specificType === "Tex" ? "$\\sum_{i=0}^n i^2$" : (specificType === "MathTex" ? "f(x) = x^2" : "Hello");
                params.font_size = 48;
                if (specificType === "Tex" || specificType === "MathTex") params.use_mathjax = false; // Or true, depending on backend
                break;
            case "Axes":
            case "NumberPlane":
                params.x_range = [-5, 5, 1]; params.y_range = [-3, 3, 1];
                params.x_length = 8; params.y_length = 6;
                params.axis_config = { include_numbers: true, font_size: 24, color: "WHITE" };
                if (specificType === "NumberPlane") params.background_line_style = { stroke_color: "GRAY", stroke_width: 1};
                break;
            case "Graph":
                params.function_str = "x**2"; params.x_var = "x"; params.x_plot_range = [-3, 3, 0.1];
                params.use_axes_id = null; // User must select an Axes swimlane
                break;
            // Add other generate types
        }
    } else if (blockType === "animation") {
        params.run_time = DEFAULT_ANIMATION_RUNTIME_SEC;
        params.start_time = parseFloat(currentTotalDurationSeconds.toFixed(3));
        params.rate_func = "smooth";

        switch (specificType) {
            case "MoveTo": params.target = [1, 1, 0]; break;
            case "Create": break; // No specific extra params usually
            case "Uncreate": break;
            case "Write": break;
            case "DrawBorderThenFill": params.stroke_width = 2; break;
            case "ShowPassingFlash": params.time_width = 0.5; break;
            case "FadeIn": break;
            case "FadeOut": break;
            case "FadeToColor": params.target_color = "RED"; break;
            case "ScaleInPlace": params.scale_factor = 2; break;
            case "Rotate": params.angle = Math.PI / 2; params.axis = [0,0,1]; break;
            case "Transform":
            case "ReplacementTransform":
                params.target_object_id = null; // User must select
                break;
            // Add other animation types
        }
    } else if (blockType === "function") {
        params.start_time = parseFloat(currentTotalDurationSeconds.toFixed(3)); // Functions also have a start time on timeline
        switch (specificType) {
            case "Wait":
                params.duration = 1;
                params.run_time = 1; // For consistency on timeline
                break;
            // Add other function types
        }
    }
    // params.chooseType = [blockType, specificType]; // Or a more complex mapping if needed for panel selects
    // params.lastType = [blockType, specificType];
    // params.necessary = necessary;
    return params;
}

// --- API Call Wrappers ---
async function handleSaveProject() {
  if (!currentProjectName.value || currentProjectName.value.trim() === '') {
    ElMessage.error("项目名称不能为空。"); return;
  }
  const graphData = collectGraphDataForBackend();
  if (!graphData) return; // Validation failed in collectGraphDataForBackend

  if (graphData.nodes.length === 0 && timelineGroups.value.length > 0) { /* Allow saving empty groups */ }
  else if (graphData.nodes.length === 0) { ElMessage.info("没有内容可保存。"); return; }

  fullscreenLoading.value = true;
  try {
    await apiPostProject({ projectName: currentProjectName.value, nodes: graphData.nodes, edges: graphData.edges });
    ElMessage.success("项目已保存。");
    saveDialog.value = false;
  } catch (error) { ElMessage.error("保存项目失败: " + error.message); console.error(error);
  } finally { fullscreenLoading.value = false; }
}

async function loadProjectDialog() {
  loadProjectListDialog.value = true;
  fullscreenLoading.value = true;
  try {
    const result = await apiGetProject(); // Expects array of {projectName, nodes, edges, updateTime}
    availableProjects.value = result.sort((a,b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime());
  } catch (error) { ElMessage.error("获取项目列表失败: " + error.message); console.error(error);
  } finally { fullscreenLoading.value = false; }
}

function confirmLoadProject(projectData) {
    ElMessageBox.confirm(`确定要加载项目 "${projectData.projectName}" 吗？当前未保存的更改将会丢失。`, '加载项目', {
        confirmButtonText: '加载', cancelButtonText: '取消', type: 'warning',
    }).then(() => {
        if (projectData && projectData.nodes && projectData.edges) {
            populateTimelineFromLoadedData(projectData.nodes, projectData.edges);
            currentProjectName.value = projectData.projectName;
        } else { ElMessage.error("项目数据无效。"); }
        loadProjectListDialog.value = false;
    }).catch(() => {});
}

async function sendGraphDataToBackendForPreview() {
  const graphData = collectGraphDataForBackend();
  if (!graphData) return;
  if (graphData.nodes.length === 0) { ElMessage.info("没有内容可预览。"); return; }

  fullscreenLoading.value = true;
  try {
    const result = await apiPostVideo({ nodes: graphData.nodes, edges: graphData.edges });
    ElMessage.success("预览视频已生成！");
    window.open(result.video_url, '_blank');
  } catch (error) { ElMessage.error("生成预览失败: " + error.message); console.error(error);
  } finally { fullscreenLoading.value = false; }
}

function openDeleteProjectDialog() {
    deleteProjectDialog.value = true;
    // Refresh project list for deletion
    fullscreenLoading.value = true;
    apiGetProject().then(result => {
        availableProjects.value = result.sort((a,b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime());
    }).catch(error => ElMessage.error("获取项目列表失败: " + error.message))
    .finally(() => fullscreenLoading.value = false);
}
function confirmDeleteProject(projectData) {
    ElMessageBox.confirm(`确定要永久删除项目 "${projectData.projectName}" 吗？此操作无法撤销。`, '删除项目', {
        confirmButtonText: '删除', cancelButtonText: '取消', type: 'error',
    }).then(async () => {
        fullscreenLoading.value = true;
        try {
            await apiDeleteProject({ projectName: projectData.projectName });
            ElMessage.success(`项目 "${projectData.projectName}" 已删除。`);
            // Refresh list or remove from current list
            availableProjects.value = availableProjects.value.filter(p => p.projectName !== projectData.projectName);
            if (availableProjects.value.length === 0) deleteProjectDialog.value = false;
        } catch (error) { ElMessage.error("删除项目失败: " + error.message); console.error(error);
        } finally { fullscreenLoading.value = false; }
    }).catch(() => {});
}

function openPrefabsDialog() {
    // TODO: Fetch prefabs list from backend or local JSON
    // availablePrefabs.value = [ {name: 'Sine Wave', description: 'Animates a sine wave', data: {nodes: [...], edges: [...]}} ];
    ElMessage.info("预制动画功能待实现。");
    // prefabsDialog.value = true;
}
function handleLoadPrefab(prefabData) {
    if (prefabData && prefabData.data && prefabData.data.nodes && prefabData.data.edges) {
        ElMessageBox.confirm(`确定要加载预制动画 "${prefabData.name}" 吗？当前内容将被替换。`, '加载预制动画', {
            confirmButtonText: '加载', cancelButtonText: '取消', type: 'info',
        }).then(() => {
            populateTimelineFromLoadedData(prefabData.data.nodes, prefabData.data.edges);
            currentProjectName.value = `Prefab_${prefabData.name}`; // Suggest a name
            prefabsDialog.value = false;
        }).catch(() => {});
    } else { ElMessage.error("预制动画数据无效。"); }
}

function openDownloadDialog() { downloadVideoDialog.value = true; }
async function handleDownloadVideo() {
    const graphData = collectGraphDataForBackend();
    if (!graphData) return;
    if (graphData.nodes.length === 0) { ElMessage.info("没有内容可下载。"); return; }

    fullscreenLoading.value = true;
    try {
        const result = await apiDownloadVideo({
            nodes: graphData.nodes,
            edges: graphData.edges,
            quality: downloadParams.quality,
            frame_rate: downloadParams.frame_rate
        });
        ElMessage.success("视频开始后台渲染，完成后将自动下载或提供链接。"); // Adjust based on backend behavior
        // If backend returns a direct download link or initiates download:
        // window.location.href = result.download_url;
        downloadVideoDialog.value = false;
    } catch (error) { ElMessage.error("下载视频失败: " + error.message); console.error(error);
    } finally { fullscreenLoading.value = false; }
}

function openAiDialog() {
    aiGenerateDialog.value = true;
    aiChatHistory.value = [{ sender: 'ai', text: '您好！请描述您想生成的数学动画场景。'}];
    aiPrompt.value = '';
    aiGeneratedJson.value = null;
}
function closeAiDialog() {
    if (aiEventSource) {
        aiEventSource.close();
        aiEventSource = null;
    }
    aiGenerateDialog.value = false;
    aiIsLoading.value = false;
}
function renderMarkdown(text) { return marked.parse(text || ""); }

function sendAiPrompt() {
    if (!aiPrompt.value.trim()) { ElMessage.warning("请输入您的需求描述。"); return; }
    if (aiIsLoading.value) return;

    aiIsLoading.value = true;
    aiGeneratedJson.value = null;
    aiChatHistory.value.push({ sender: 'user', text: aiPrompt.value });
    let currentAiResponse = "";
    aiChatHistory.value.push({ sender: 'ai', text: "" }); // Placeholder for AI streaming

    const queryParams = new URLSearchParams({
        content: aiPrompt.value,
        use_latex: aiUseLatex.value,
        json_fix: aiJsonFix.value,
    });

    aiEventSource = new EventSource(`${serveAddress}/api/sse_ai/?${queryParams.toString()}`);

    aiEventSource.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.type === 'status') {
            // console.log("AI Status:", data.message);
            // You could update a status message here if needed
        } else if (data.type === 'content') {
            currentAiResponse += data.message;
            aiChatHistory.value[aiChatHistory.value.length - 1].text = currentAiResponse;
        } else if (data.type === 'json_output' && data.message) {
            try {
                aiGeneratedJson.value = JSON.parse(data.message); // Store the raw JSON
                currentAiResponse += `\n\n---\n*AI已生成JSON数据，您可以点击“应用到时间轴”。*`;
                aiChatHistory.value[aiChatHistory.value.length - 1].text = currentAiResponse;
            } catch (e) {
                console.error("Failed to parse AI JSON output:", e);
                currentAiResponse += `\n\n---\n*AI返回的JSON数据解析失败。*`;
                aiChatHistory.value[aiChatHistory.value.length - 1].text = currentAiResponse;
            }
        } else if (data.type === 'error') {
            ElMessage.error("AI生成出错: " + data.message);
            currentAiResponse += `\n\n---\n*AI生成过程中发生错误: ${data.message}*`;
            aiChatHistory.value[aiChatHistory.value.length - 1].text = currentAiResponse;
            aiIsLoading.value = false;
            aiEventSource.close();
        }
    };
    aiEventSource.onerror = function(err) {
        ElMessage.error('与AI服务器连接失败或中断。');
        console.error("EventSource failed:", err);
        aiIsLoading.value = false;
        if (aiEventSource) aiEventSource.close();
    };
    aiEventSource.onopen = function() {
        // console.log("SSE connection opened.");
    };
    // Add a custom event for when the stream is truly finished by the backend
    aiEventSource.addEventListener('end_stream', function(event) {
        // console.log("SSE stream ended by server.");
        aiIsLoading.value = false;
        aiEventSource.close();
        if (!aiGeneratedJson.value && currentAiResponse.includes("抱歉") ) { // Simple check
             // No explicit JSON, but conversation ended.
        } else if (!aiGeneratedJson.value) {
            currentAiResponse += `\n\n---\n*AI对话结束，但未明确提取到JSON数据。如果需要，请尝试调整描述或使用JSON修复。*`;
            aiChatHistory.value[aiChatHistory.value.length - 1].text = currentAiResponse;
        }
    });

    aiPrompt.value = ''; // Clear input after sending
}

async function applyAiResult() {
    if (!aiGeneratedJson.value) { ElMessage.warning("没有可应用的AI生成结果。"); return; }
    fullscreenLoading.value = true;
    try {
        // The aiGeneratedJson might be partial, call GetCompleteJson for refinement
        const completeJsonResponse = await apiGetCompleteJson({ data: aiGeneratedJson.value });
        if (completeJsonResponse && completeJsonResponse.nodes && completeJsonResponse.edges) {
            populateTimelineFromLoadedData(completeJsonResponse.nodes, completeJsonResponse.edges);
            currentProjectName.value = "AI_Generated_Project";
            ElMessage.success("AI生成的内容已应用到时间轴。");
            aiGenerateDialog.value = false; // Close AI dialog on success
        } else {
            ElMessage.error("AI结果补全失败或返回数据格式不正确。");
        }
    } catch (error) {
        ElMessage.error("应用AI结果失败: " + error.message);
        console.error(error);
    } finally {
        fullscreenLoading.value = false;
    }
}


// --- Lifecycle Hooks ---
onMounted(() => {
  updateTimelineViewportAuto();
  // Add any initial project loading or setup here if needed
});

// Watch for selection changes to potentially clear other states or update UI
watch(selectedTimelineElement, (newSelection) => {
    // console.log("Selected:", newSelection);
});

</script>

<style scoped>
.header {
  display: flex; align-items: center; justify-content: flex-start; padding: 0 10px;
  height: 50px; background-color: #e9ecef; border-bottom: 1px solid #dee2e6; flex-shrink: 0;
}
.header .button { margin-right: 10px; }

.main-content-area { display: flex; flex-grow: 1; overflow: hidden; }

.left-asset-panel {
  width: 220px; padding: 10px; border-right: 1px solid #ccc; overflow-y: auto;
  background-color: #f8f9fa; flex-shrink: 0;
}
.left-asset-panel h4 { margin-top:10px; margin-bottom: 8px; font-size: 0.95em; color: #333;}
.draggable-block {
  padding: 8px 10px; margin-bottom: 8px; background-color: #fff; border: 1px solid #ddd;
  border-radius: 4px; cursor: grab; text-align: left; font-size: 0.9em;
  transition: background-color 0.2s;
}
.draggable-block:hover { background-color: #e9ecef; }

.timeline-editor-container {
  flex-grow: 1; padding: 0; /* vue-timeline-chart might add its own padding */
  background-color: #fff; overflow: hidden; /* Let the chart handle its scroll */
  position: relative;
}

.right-parameter-panel {
  width: 380px; padding: 15px; border-left: 1px solid #ccc; overflow-y: auto;
  background-color: #f8f9fa; flex-shrink: 0;
}
.right-parameter-panel h3 { margin-top: 0; margin-bottom: 15px; font-size: 1.1em;}
.el-form-item { margin-bottom: 16px; }
.el-form-item .el-input-number { width: 100%; }
.el-form-item .el-select { width: 100%; }


.custom-group-label {
  padding: 6px 8px; cursor: pointer; display: flex; align-items: center;
  font-size: 0.9em; border-bottom: 1px solid #eee;
}
.custom-group-label:hover { background-color: #f0f8ff; } /* AliceBlue */
.custom-group-label .el-icon { margin-right: 5px; }
.custom-group-label strong { margin-right: 5px;}

.custom-item-content {
  padding: 3px 6px; font-size: 0.85em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  background-color: #e0f0ff; border-radius: 3px; border: 1px solid #b3d9ff;
  cursor: pointer; position: relative; height: 100%; display: flex; align-items: center;
}
.custom-item-content:hover { background-color: #cce4ff; }
.custom-item-content.transform-item {
    background-color: #fff0b3; /* Light yellow for Transform */
    border-color: #ffe080;
}
.custom-item-content.transform-item:hover {
    background-color: #ffe599;
}


/* AI Dialog Specific Styles */
.ai-dialog .el-dialog__body { padding: 0; } /* Custom padding for layout */
.ai-dialog-content { display: flex; flex-direction: column; height: 60vh; /* Adjust as needed */ }
.ai-chat-area {
    flex-grow: 1; padding: 15px; overflow-y: auto; border-bottom: 1px solid #eee;
    background-color: #f9f9f9;
}
.ai-message { display: flex; margin-bottom: 12px; align-items: flex-start; }
.ai-message.user { flex-direction: row-reverse; }
.ai-message .el-avatar { flex-shrink: 0; margin: 0 8px; }
.ai-message.user .el-avatar { margin-left: 8px; margin-right: 0; }
.ai-message-text {
    padding: 8px 12px; border-radius: 8px; max-width: 80%;
    background-color: #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    word-wrap: break-word;
}
.ai-message.user .ai-message-text { background-color: #cce4ff; }
.ai-message-text :deep(p:last-child) { margin-bottom: 0; } /* Markdown render fix */
.ai-message-text :deep(p:first-child) { margin-top: 0; }
.ai-message-text :deep(pre) { background-color: #f0f0f0; padding: 8px; border-radius: 4px; overflow-x: auto;}

.ai-input-area { padding: 15px; background-color: #fdfdfd; }
</style>