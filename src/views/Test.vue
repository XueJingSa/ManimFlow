<template>
  <div style="background-color:#F5F7FA" v-loading.fullscreen.lock="fullscreenLoading" element-loading-text="Loading...">
    <div class="header">
      <el-button size="large" class="button" @click="preDialog = true">
        <el-icon size="large"><MessageBox /></el-icon>&ensp;Animation
      </el-button>
      <el-button size="large" class="button" @click="sendGraphDataToBackend">
        <el-icon size="large"><View /></el-icon>&ensp;Preview
      </el-button>
      <el-button size="large" class="button" @click="downloadDialog = true">
        <el-icon size="large"><Download /></el-icon>&ensp;Download
      </el-button>
      <el-button size="large" class="button" @click="saveDialog = true">
        <el-icon size="large"><DocumentAdd /></el-icon>&ensp;Save Project
      </el-button>
      <el-button size="large" class="button" @click="loadProject()">
        <el-icon size="large"><FolderOpened /></el-icon>&ensp;Load Project
      </el-button>
      <el-button size="large" class="button" @click="openDeleteDialog()">
        <el-icon size="large"><Delete /></el-icon>&ensp;Delete Project
      </el-button>
      <el-button size="large" class="button" @click="openAI()">
        <el-icon size="large"><Service /></el-icon>&ensp;AI
      </el-button>
    </div>
    <div class="main">
      <el-row>
        <el-col :span="programSpan" class="program-area">
          <!-- Main Editing Area: Swimlane Timeline -->
          <div class="swimlane-timeline-editor" ref="swimlaneEditorRef" @dragover="onDragOverTimeline" @drop="onDropTimeline">
            <div class="timeline-panel">
                <el-tooltip placement="right" effect="light">
                  <template #content>
                    <div>
                      <el-button
                        link
                        size="large"
                        class="button"
                        :draggable="true"
                        @dragstart="onDragBlockStart($event, 'generate')"
                      >元素块 (泳道)</el-button>
                    </div>
                    <div>
                      <el-button
                        link
                        size="large"
                        class="button"
                        :draggable="true"
                        @dragstart="onDragBlockStart($event, 'animation')"
                      >动画块 (片段)</el-button>
                    </div>
                  </template>
                  <el-button style="border: white;text-align: center;">
                      <el-icon size="20" ><Plus /></el-icon>
                    </el-button>
                </el-tooltip>
                 <!-- Add other controls like zoom, pan toggle here if needed -->
            </div>

            <div class="timeline-header">
              <div class="track-headers-region">
                <!-- Placeholder for track headers column -->
                 <div v-for="track in tracks" :key="track.id" class="track-header-item" @click="selectTrack(track.id)">
                    <el-icon><Menu /></el-icon>
                    <span class="track-name" :title="track.name || track.id">
                      {{ track.name || track.id }}
                    </span>
                    <span class="track-type-icon" :title="track.generateBlockParams.type">
                      [{{ track.generateBlockParams.type.slice(0,1) }}]
                    </span>
                     <el-button icon="Delete" size="small" circle plain @click.stop="deleteTrack(track.id)"></el-button>
                  </div>
              </div>
              <div class="time-ruler-region">
                <TimeRuler :duration="totalDuration" :scale="timelineScale" :offset="timelineOffset" />
              </div>
            </div>
            <div class="timeline-body">
              <div class="track-list-region">
                 <!-- This area is for track controls that are fixed on the left -->
              </div>
              <div class="tracks-content-region" ref="tracksContentRef">
                <div v-if="tracks.length === 0" class="empty-timeline-message">
                  Drag '元素块' here to create a new track.
                </div>
                <SwimlaneTrackComponent
                  v-for="track in tracks"
                  :key="track.id"
                  :track-data="track"
                  :timeline-scale="timelineScale"
                  :timeline-offset="timelineOffset"
                  :total-duration="totalDuration"
                  @select-clip="selectAnimationClip"
                  @update-clip-time="updateAnimationClipTime"
                  @add-new-clip-to-track="addNewAnimationClipToTrack"
                  @delete-clip="deleteAnimationClip"
                  :class="{ 'selected-track-highlight': selectedItem && selectedItem.itemType === 'track' && selectedItem.id === track.id }"
                />
              </div>
            </div>
          </div>
        </el-col>

        <!-- Right Panel: Parameter Editing -->
        <el-col :span="animationSpan" class="animation-panel">
          <el-button
            icon="DArrowRight"
            link
            size="large"
            @click="fold"
            :style="{transform: isFold ? 'rotate(180deg)' : 'rotate(0deg)',transition: 'transform 0.2s ease'}"
          ></el-button>
          
          <div class="node-info" v-if="!isFold">
            <h3>{{ selectedItemDescription }}</h3>
            <div v-if="selectedItem && selectedItem.data">
              <!-- Generate Block (Track) Parameters -->
              <div v-if="selectedItem.itemType === 'track'">
                <el-divider>元素块 (泳道) 参数</el-divider>
                <el-form label-position="top" label-width="100px">
                  <el-form-item label="泳道名称 (ID)">
                    <el-input v-model="selectedItem.name" @change="updateTrackName"></el-input>
                  </el-form-item>
                  <el-form-item>
                    <template #label><span>类别</span><span style="color: red;">*</span></template>
                    <el-cascader
                      v-model="selectedItem.data.params.chooseType"
                      :options="generateType"
                      @change="changeSelectedItemType"
                      filterable
                    />
                  </el-form-item>
                  <!-- Dynamically shown forms based on selectedItem.data.params.type -->
                  <!-- Point -->
                  <div v-if="selectedItem.data.params.type == 'Point'">
                    <el-form-item><template #label><span>坐标</span><span style="color: red;">*</span></template>
                      <el-input v-model="selectedItem.data.params.position" @change="selectedItem.data.params.position = JSON.parse('[' + selectedItem.data.params.position + ']');"></el-input>
                    </el-form-item>
                    <el-form-item label="颜色"><el-cascader v-model="selectedItem.data.params.color" :options="colorType" @change="changeColor" filterable /></el-form-item>
                    <el-form-item label="大小"><el-input v-model="selectedItem.data.params.size"></el-input></el-form-item>
                    <el-form-item label="是否依附于自定义坐标系"><el-checkbox v-model="selectedItem.data.params.use_axes"></el-checkbox></el-form-item>
                  </div>
                  <!-- Line -->
                   <div v-if="selectedItem.data.params.type =='Line'">
                    <el-form-item><template #label><span>起点坐标</span><span style="color: red;">*</span></template><el-input v-model="selectedItem.data.params.start" @change="selectedItem.data.params.start = JSON.parse('[' + selectedItem.data.params.start + ']');"></el-input></el-form-item>
                    <el-form-item><template #label><span>终点坐标</span><span style="color: red;">*</span></template><el-input v-model="selectedItem.data.params.end" @change="selectedItem.data.params.end = JSON.parse('[' + selectedItem.data.params.end + ']');"></el-input></el-form-item>
                    <el-form-item label="颜色"><el-cascader v-model="selectedItem.data.params.color" :options="colorType" @change="changeColor" filterable /></el-form-item>
                    <el-form-item label="线宽"><el-input v-model="selectedItem.data.params.stroke_width"></el-input></el-form-item>
                    <el-form-item label="是否依附于自定义坐标系"><el-checkbox v-model="selectedItem.data.params.use_axes"></el-checkbox></el-form-item>
                  </div>
                  <!-- ... other generate forms from Main.vue, adapted similarly ... -->
                   <!-- Axes -->
                  <div v-if="selectedItem.data.params.type == 'Axes'">
                    <el-form-item><template #label><span>x 轴范围</span><span style="color: red;">*</span></template><el-input v-model="selectedItem.data.params.x_range" @change="selectedItem.data.params.x_range = JSON.parse('[' + selectedItem.data.params.x_range + ']');"></el-input></el-form-item>
                    <el-form-item><template #label><span>y 轴范围</span><span style="color: red;">*</span></template><el-input v-model="selectedItem.data.params.y_range" @change="selectedItem.data.params.y_range = JSON.parse('[' + selectedItem.data.params.y_range + ']');"></el-input></el-form-item>
                    <el-form-item label="z 轴范围"><el-input v-model="selectedItem.data.params.z_range" @change="selectedItem.data.params.z_range = JSON.parse('[' + selectedItem.data.params.z_range + ']');"></el-input></el-form-item>
                    <el-form-item label="显示刻度数字"><el-checkbox v-model="selectedItem.data.params.axis_config.include_numbers"></el-checkbox></el-form-item>
                    <el-form-item label="字体大小"><el-input v-model="selectedItem.data.params.axis_config.font_size"></el-input></el-form-item>
                    <el-form-item label="颜色"><el-cascader v-model="selectedItem.data.params.axis_config.color" :options="colorType" @change="changeColor" filterable /></el-form-item>
                  </div>
                  <!-- Graph -->
                  <div v-if="selectedItem.data.params.type == 'Graph'">
                    <el-form-item><template #label><span>函数表达式</span><span style="color: red;">*</span></template><el-input v-model="selectedItem.data.params.function"></el-input></el-form-item>
                    <el-form-item><template #label><span>定义域范围</span><span style="color: red;">*</span></template><el-input v-model="selectedItem.data.params.x_range" @change="selectedItem.data.params.x_range = JSON.parse('[' + selectedItem.data.params.x_range + ']');"></el-input></el-form-item>
                    <el-form-item label="曲线颜色"><el-cascader v-model="selectedItem.data.params.color" :options="colorType" @change="changeColor" filterable /></el-form-item>
                    <el-form-item label="曲线宽度"><el-input v-model="selectedItem.data.params.stroke_width"></el-input></el-form-item>
                    <el-form-item label="是否依附于自定义坐标系"><el-checkbox v-model="selectedItem.data.params.use_axes"></el-checkbox></el-form-item>
                  </div>
                  <!-- Area -->
                  <div v-if="selectedItem.data.params.type == 'Area'">
                    <el-form-item><template #label><span>被填充的曲线 (Graph ID)</span><span style="color: red;">*</span></template>
                        <el-select v-model="selectedItem.data.params.curve" placeholder="Select Graph Track">
                            <el-option v-for="track_opt in graphTracks" :key="track_opt.id" :label="track_opt.name || track_opt.id" :value="track_opt.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item><template #label><span>填充范围</span><span style="color: red;">*</span></template><el-input v-model="selectedItem.data.params.x_range" @change="selectedItem.data.params.x_range = JSON.parse('[' + selectedItem.data.params.x_range + ']');"></el-input>
                    </el-form-item>
                    <el-form-item label="填充颜色"><el-cascader v-model="selectedItem.data.params.color" :options="colorType" @change="changeColor" filterable /></el-form-item>
                    <el-form-item label="填充透明度"><el-input v-model="selectedItem.data.params.opacity"></el-input></el-form-item>
                    <el-form-item label="是否依附于自定义坐标系"><el-checkbox v-model="selectedItem.data.params.use_axes" disabled></el-checkbox></el-form-item>
                  </div>
                   <!-- Riemann -->
                  <div v-if="selectedItem.data.params.type ==='Riemann'">
                    <el-form-item><template #label><span>被填充的曲线 (Graph ID)</span><span style="color: red;">*</span></template>
                        <el-select v-model="selectedItem.data.params.curve" placeholder="Select Graph Track">
                            <el-option v-for="track_opt in graphTracks" :key="track_opt.id" :label="track_opt.name || track_opt.id" :value="track_opt.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item><template #label><span>填充范围</span><span style="color: red;">*</span></template><el-input v-model="selectedItem.data.params.x_range" @change="selectedItem.data.params.x_range = JSON.parse('[' + selectedItem.data.params.x_range + ']');"></el-input>
                    </el-form-item>
                    <el-form-item><template #label><span>矩形宽度</span><span style="color: red;">*</span></template><el-input v-model="selectedItem.data.params.width"></el-input></el-form-item>
                  </div>
                </el-form>
              </div>

              <!-- Animation Clip Parameters -->
              <div v-if="selectedItem.itemType === 'clip'">
                <el-divider>动画片段参数</el-divider>
                <el-form label-position="top" label-width="100px">
                  <el-form-item label="片段 ID (只读)">
                    <el-input v-model="selectedItem.id" readonly></el-input>
                  </el-form-item>
                  <el-form-item>
                    <template #label><span>类型</span><span style="color: red;">*</span></template>
                    <el-cascader
                      v-model="selectedItem.data.params.chooseType"
                      :options="animationType"
                      @change="changeSelectedItemType"
                      filterable
                    />
                  </el-form-item>
                  <el-form-item label="开始时间 (s)">
                    <el-input-number v-model="selectedItem.startTime" :min="0" @change="val => updateClipTimes(val, selectedItem.duration)" />
                  </el-form-item>
                  <el-form-item label="持续时间 (s)">
                     <el-input-number v-model="selectedItem.duration" :min="0.1" @change="val => updateClipTimes(selectedItem.startTime, val)" />
                  </el-form-item>

                  <!-- Dynamically shown forms based on selectedItem.data.params.type -->
                  <!-- MoveTo -->
                  <div v-if="selectedItem.data.params.type == 'MoveTo'">
                    <el-form-item><template #label><span>目标位置</span><span style="color: red;">*</span></template><el-input v-model="selectedItem.data.params.target" @change="selectedItem.data.params.target = JSON.parse('[' + selectedItem.data.params.target + ']');"></el-input></el-form-item>
                    <el-form-item><template #label><span>缓动函数</span><span style="color: red;">*</span></template><el-cascader v-model="selectedItem.data.params.rate_func" :options="rateFuncType" @change="changeRateFunc" filterable /></el-form-item>
                    <el-form-item label="是否依附于自定义坐标系"><el-checkbox v-model="selectedItem.data.params.use_axes"></el-checkbox></el-form-item>
                  </div>
                  <!-- Transform -->
                  <div v-if="selectedItem.data.params.type == 'Transform' || selectedItem.data.params.type == 'ReplacementTransform'">
                    <el-form-item><template #label><span>目标元素 (泳道 ID)</span><span style="color: red;">*</span></template>
                        <el-select v-model="selectedItem.data.params.target_object" placeholder="Select Target Track">
                            <el-option v-for="track_opt in tracks" :key="track_opt.id" :label="track_opt.name || track_opt.id" :value="track_opt.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item><template #label><span>缓动函数</span><span style="color: red;">*</span></template><el-cascader v-model="selectedItem.data.params.rate_func" :options="rateFuncType" @change="changeRateFunc" filterable /></el-form-item>
                  </div>
                  <!-- FollowPath -->
                  <div v-if="selectedItem.data.params.type == 'FollowPath'">
                    <el-form-item><template #label><span>路径类型</span><span style="color: red;">*</span></template>
                        <el-cascader v-model="selectedItem.data.params.path_type" :options="pathType" @change="changePath" filterable />
                    </el-form-item>
                    <el-form-item v-if="selectedItem.data.params.path_type === 'graph'"><template #label><span>曲线对象 (Graph ID)</span><span style="color: red;">*</span></template>
                        <el-select v-model="selectedItem.data.params.curve" placeholder="Select Graph Track">
                            <el-option v-for="track_opt in graphTracks" :key="track_opt.id" :label="track_opt.name || track_opt.id" :value="track_opt.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item v-else-if="selectedItem.data.params.path_type === 'custom'"><template #label><span>点对象</span><span style="color: red;">*</span></template>
                      <div v-for="(item,index) in selectedItem.data.params.path" :key="item.id">
                        <el-input v-model="selectedItem.data.params.path[index]" @change="selectedItem.data.params.path[index] = JSON.parse('[' + selectedItem.data.params.path[index] + ']');" style="width: 15vw;"></el-input>
                        &ensp;
                        <el-button @click="addPoint(index)" text circle><el-icon><Plus /></el-icon></el-button>
                        <el-button @click="deletePoint(index)" text circle :disabled="selectedItem.data.params.path.length == 1"><el-icon><Minus /></el-icon></el-button>
                      </div>
                    </el-form-item>
                    <el-form-item><template #label><span>函数曲线上的 t 值范围</span><span style="color: red;">*</span></template><el-input v-model="selectedItem.data.params.t_range" @change="selectedItem.data.params.t_range = JSON.parse('[' + selectedItem.data.params.t_range + ']');"></el-input></el-form-item>
                    <el-form-item><template #label><span>缓动函数</span><span style="color: red;">*</span></template><el-cascader v-model="selectedItem.data.params.rate_func" :options="rateFuncType" @change="changeRateFunc" filterable /></el-form-item>
                  </div>
                  <!-- ... other animation forms from Main.vue, adapted similarly ... -->
                </el-form>
              </div>
               <!-- Function Block (Track with Wait) Parameters -->
              <div v-if="selectedItem.itemType === 'function_track'">
                <el-divider>功能块 (泳道) 参数</el-divider>
                 <el-form label-position="top" label-width="100px">
                    <el-form-item label="泳道名称 (ID)">
                        <el-input v-model="selectedItem.name" @change="updateTrackName"></el-input>
                    </el-form-item>
                    <el-form-item> <template #label><span>类型</span><span style="color: red;">*</span></template>
                        <el-cascader v-model="selectedItem.data.params.chooseType" :options="functionType" @change="changeSelectedItemType" filterable />
                    </el-form-item>
                    <!-- Wait -->
                    <div v-if="selectedItem.data.params.type == 'Wait'">
                        <el-form-item label="开始时间 (s)">
                            <el-input-number v-model="selectedItem.data.params.start_time" :min="0" @change="updateFunctionTrackTimes" />
                        </el-form-item>
                        <el-form-item><template #label><span>等待时间 (s)</span><span style="color: red;">*</span></template>
                            <el-input-number v-model="selectedItem.data.params.duration" :min="0.1" @change="updateFunctionTrackTimes" />
                        </el-form-item>
                    </div>
                    <!-- Group, Ungroup, SetZIndex would need different handling, perhaps not as timeline tracks -->
                 </el-form>
              </div>

            </div>
            <p v-else>未选中任何元素或片段</p>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Dialogs from Main.vue (Save, Load, Delete, Pre, AI, Download) -->
    <el-dialog v-model="saveDialog" title="暂存项目" width="500" align-center>
        <div style="text-align: start;"><span>请输入项目名称：</span><el-input v-model="projectName" style="padding-bottom: 2%;padding-top: 2%;"></el-input></div>
        <div style="text-align: end;"><el-button @click="saveProject()" type="primary">确认</el-button></div>
    </el-dialog>
    <el-dialog v-model="loadDialog" title="加载项目" width="500" align-center>
        <el-table :data="projectList" style="width: 100%"><el-table-column prop="projectName" label="项目名称" width="200" /><el-table-column fixed="right" min-width="20"><template #default="scope"><el-button @click.prevent="loadSavedProject(scope.$index)" type="primary" link>选择</el-button></template></el-table-column></el-table>
    </el-dialog>
    <el-dialog v-model="deleteDialog" title="删除项目" width="500" align-center>
        <el-table :data="projectList" style="width: 100%"><el-table-column prop="projectName" label="项目名称" width="200" /><el-table-column fixed="right" min-width="20"><template #default="scope"><el-button @click.prevent="deleteProject(scope.$index)" type="primary" link>删除</el-button></template></el-table-column></el-table>
    </el-dialog>
    <el-dialog v-model="preDialog" title="预制动画" width="900" align-center>
        <el-tabs tab-position="left">
            <el-tab-pane label="极限"><el-scrollbar max-height="600px"><el-card v-for="item in preLimits" :key="item.videoSource" class="preBlock" @click="choosePredefinedAnimation(item)"><video ref="myVideo" autoplay muted loop :src="item.videoSource" style="width: 100%;"></video><template #footer>{{ item.name }}</template></el-card></el-scrollbar></el-tab-pane>
            <el-tab-pane label="积分"><el-scrollbar max-height="600px"><el-card v-for="item in prePoints" :key="item.videoSource" class="preBlock" @click="choosePredefinedAnimation(item)"><video ref="myVideo" autoplay muted loop :src="item.videoSource" style="width: 100%;"></video><template #footer>{{ item.name }}</template></el-card></el-scrollbar></el-tab-pane>
        </el-tabs>
    </el-dialog>
    <el-dialog v-model="downloadDialog" title="导出动画" width="500" style="height:35vh" align-center>
        <el-divider style="margin-top: 1%;"></el-divider>
        <div style="margin: 2%;margin-bottom: 5vh;font-size: 15px;">视频质量：<el-cascader v-model="quality" :options="videoType" /></div>
        <div style="margin: 2%;margin-bottom: 5vh;font-size: 15px;">视频帧率：<el-cascader v-model="frame_rate" :options="fpsType" /></div>
        <template #footer><div><el-button @click="downloadDialog = false">取消</el-button><el-button type="primary" @click="downloadAnim()">导出</el-button></div></template>
    </el-dialog>
    <!-- AI Dialog (simplified for brevity, assume it's the same as Main.vue) -->
    <!-- <el-dialog v-model="aiDialog" ... > ... </el-dialog> -->

  </div>
</template>

<script setup>
// 在这里从 'vue' 导入 defineAsyncComponent
import { ref, watch, onMounted, onUnmounted, reactive, toRefs, computed, nextTick, defineAsyncComponent } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
// 从 @/api/main 移除 SendDescription
import { DeleteProject, DownloadVideo, GetCompleteJson, GetProject, PostProject, PostVideo } from "@/api/main";
// 如果需要，从 @/api/ai 导入 SendDescription (以及其他需要的 ai 函数)
// import { SendDescription, CreateNewChat, HistoryList /* ... other functions from ai.js */ } from "@/api/ai";
import { serveAddress } from "@/api/api";
// import { useStore } from "vuex"; // If using Vuex
import { Menu, Delete, Plus, Pointer, Link, Search, MessageBox, View, Download, DocumentAdd, FolderOpened, Service, DArrowRight } from '@element-plus/icons-vue';


// Import local components for timeline (simplified stubs for now)
const TimeRuler = defineAsyncComponent(() => import('../components/TimeRuler.vue')); // Create this
const SwimlaneTrackComponent = defineAsyncComponent(() => import('../components/SwimlaneTrackComponent.vue')); // Create this

// const store = useStore(); // If using Vuex

// --- Core Data Model for Swimlane Timeline ---
const tracks = ref([]); // Array of Track objects
// interface AnimationClip { id: string; name: string; type: string; params: any; startTime: number; duration: number; chooseType: any; lastType: any; necessary: string[]; }
// interface Track { id: string; name: string; generateBlockType: string; generateBlockParams: any; animationClips: AnimationClip[]; }

let trackIdCounter = 0;
let clipIdCounter = 0;

const selectedItem = ref(null); // { itemType: 'track' | 'clip' | 'function_track', id: string, data: any, name?: string, startTime?: number, duration?: number, trackId?: string }

// --- Timeline Display ---
const totalDuration = ref(30); // Default total duration in seconds
const timelineScale = ref(20); // Pixels per second
const timelineOffset = ref(0); // Horizontal scroll offset in pixels
const swimlaneEditorRef = ref(null);
const tracksContentRef = ref(null);


// --- Right Panel & Folding ---
const programSpan = ref(18);
const animationSpan = ref(6);
const isFold = ref(false);

function fold() {
  isFold.value = !isFold.value;
  programSpan.value = isFold.value ? 23 : 18;
  animationSpan.value = isFold.value ? 1 : 6;
  // nextTick(() => { /* resize timeline if needed */ });
}

const selectedItemDescription = computed(() => {
  if (!selectedItem.value) return "未选中";
  if (selectedItem.value.itemType === 'track') return `元素泳道: ${selectedItem.value.name || selectedItem.value.id}`;
  if (selectedItem.value.itemType === 'clip') return `动画片段: ${selectedItem.value.data?.params?.type || selectedItem.value.id}`;
  if (selectedItem.value.itemType === 'function_track') return `功能泳道: ${selectedItem.value.name || selectedItem.value.id}`;
  return "选中项";
});


// --- Drag and Drop for Adding Blocks ---
const dragType = ref(null); // 'generate', 'animation'
const isDragOverTimeline = ref(false);

function onDragBlockStart(event, type) {
  if (event.dataTransfer) {
    event.dataTransfer.setData("application/manimflow-block", type);
    event.dataTransfer.effectAllowed = "move";
  }
  dragType.value = type;
  isDragOverTimeline.value = true; // Visual feedback for the timeline area
}

function onDragOverTimeline(event) {
  event.preventDefault();
  if (dragType.value === 'generate') {
    event.dataTransfer.dropEffect = "copy";
    isDragOverTimeline.value = true;
  } else {
    // For 'animation', drop is handled by individual tracks
    event.dataTransfer.dropEffect = "none";
    isDragOverTimeline.value = false;
  }
}

function onDropTimeline(event) {
  event.preventDefault();
  const type = event.dataTransfer.getData("application/manimflow-block");
  if (type === 'generate') {
    const newTrackId = `track_${trackIdCounter++}`;
    // Default generate block (e.g., Point)
    const defaultGenerateParams = {
      type: "Point",
      chooseType: ["basic", "Point"],
      lastType: ["basic", "Point"],
      position: [0, 0, 0],
      color: "WHITE",
      size: 0.1,
      use_axes: true,
      necessary: ["position", "use_axes"],
    };
    tracks.value.push({
      id: newTrackId,
      name: `元素 ${newTrackId}`,
      generateBlockType: defaultGenerateParams.type, // Store the main type for quick access
      generateBlockParams: defaultGenerateParams,
      animationClips: [],
    });
    selectTrack(newTrackId);
  }
  dragType.value = null;
  isDragOverTimeline.value = false;
}

// --- Selection Logic ---
function selectTrack(trackId) {
  const track = tracks.value.find(t => t.id === trackId);
  if (track) {
    if (track.generateBlockParams.type === 'Wait') { // Special handling for Wait as a "function track"
        selectedItem.value = {
            itemType: 'function_track',
            id: track.id,
            name: track.name,
            data: track.generateBlockParams, // Contains type, chooseType, params (start_time, duration)
        };
    } else {
        selectedItem.value = {
            itemType: 'track',
            id: track.id,
            name: track.name,
            data: track.generateBlockParams,
        };
    }
  } else {
    selectedItem.value = null;
  }
}

function selectAnimationClip(trackId, clipId) {
  const track = tracks.value.find(t => t.id === trackId);
  if (track) {
    const clip = track.animationClips.find(c => c.id === clipId);
    if (clip) {
      selectedItem.value = {
        itemType: 'clip',
        id: clip.id,
        trackId: track.id,
        data: clip, // The whole clip object, params are inside clip.params
        // For right panel compatibility, we might need to structure it like:
        // data: { params: clip.params },
        // but let's try direct first. We need startTime and duration at this level too.
        startTime: clip.startTime,
        duration: clip.duration,
      };
    }
  }
}

function updateTrackName() {
    if (selectedItem.value && selectedItem.value.itemType === 'track') {
        const track = tracks.value.find(t => t.id === selectedItem.value.id);
        if (track) {
            if (track.generateBlockParams.type === 'Axes' && selectedItem.value.name !== 'axis') {
                ElMessage.warning("坐标轴 (Axis) 泳道的名称固定为 'axis'，不可修改。");
                selectedItem.value.name = 'axis'; // Revert
                return;
            }
            track.name = selectedItem.value.name;
        }
    } else if (selectedItem.value && selectedItem.value.itemType === 'function_track') {
        const track = tracks.value.find(t => t.id === selectedItem.value.id);
        if (track) {
            track.name = selectedItem.value.name;
        }
    }
}


// --- Parameter Editing (Right Panel) ---
// generateType, animationType, functionType, rateFuncType, colorType, pathType are same as Main.vue
const generateType = [ { value: "basic", label: "基础几何图形", children: [ { value: "Point", label: "点", }, { value: "Line", label: "直线", }, { value: "DashedLine", label: "虚线", }, { value: "Circle", label: "圆", }, { value: "Rectangle", label: "矩形", }, { value: "Polygon", label: "多边形", }, { value: "Arrow", label: "箭头", }, { value: "Brace", label: "括号", }, { value: "Riemann", label: "黎曼矩形", } ], }, { value: "text", label: "文本与公式", children: [ { value: "Text", label: "文本", }, { value: "MathTex", label: "数学公式", }, ], }, { value: "axis", label: "坐标系", children: [ { value: "Axes", label: "坐标轴", }, { value: "Graph", label: "函数图像", }, { value: "ContourPlot", label: "等高线", }, ], }, { value: "area", label: "动态区域", children: [ { value: "Area", label: "填充区域", }, { value: "Grid", label: "网格", }, ], }, ];
const animationType = [ { value: "MoveTo", label: "平移动画" }, { value: "Rotate", label: "旋转动画" }, { value: "Scale", label: "缩放动画" }, { value: "FadeIn", label: "淡入动画" }, { value: "FadeOut", label: "淡出动画" }, { value: "SetColor", label: "改变颜色动画" }, { value: "FollowPath", label: "路径动画" }, { value: "Transform", label: "变换动画" }, { value: "ReplacementTransform", label: "替换变换" }, { value: "Create", label: "创建动画" }, { value: "ApplyMatrix", label: "旋转变换" }, { value: "Show", label: "显示动画" }, ];
const functionType = [ /*{ value: "Group", label: "成组" }, { value: "Ungroup", label: "解组" }, { value: "SetZIndex", label: "动态图层调整" },*/ { value: "Wait", label: "场景等待" }, ]; // Simplified for timeline
const rateFuncType = [ { value: "linear", label: "linear"}, { value: "smooth", label: "smooth"}, { value: "rush_into", label: "rush_into"}, { value: "rush_from", label: "rush_from"}, { value: "wiggle", label: "wiggle"}, { value: "running_start", label: "running_start"}, ];
const colorType = [ { value: "RED", label: "RED"}, { value: "YELLOW", label: "YELLOW"}, { value: "BLUE", label: "BLUE"}, { value: "WHITE", label: "WHITE"}, { value: "ORANGE", label: "ORANGE"}, { value: "GREEN", label: "GREEN"}, { value: "PURPLE", label: "PURPLE"}, ];
const pathType = [ { value: "custom",label: "custom(点列表)"}, { value: "graph",label: "graph(函数曲线)"}, ];

const graphTracks = computed(() => tracks.value.filter(t => t.generateBlockParams.type === 'Graph'));


function changeSelectedItemType() {
  if (!selectedItem.value) return;

  let tempType;
  if (Array.isArray(selectedItem.value.data.params.chooseType)) {
    tempType = selectedItem.value.data.params.chooseType[selectedItem.value.data.params.chooseType.length - 1];
  } else {
    tempType = selectedItem.value.data.params.chooseType;
  }
  
  // Preserve essential info
  const originalChooseType = selectedItem.value.data.params.chooseType;
  const originalLastType = selectedItem.value.data.params.lastType;

  let newParams = {};
  let newNecessary = [];

  if (selectedItem.value.itemType === 'track') {
    const track = tracks.value.find(t => t.id === selectedItem.value.id);
    if (!track) return;

    // Default params logic from Main.vue's change() function for generate blocks
    switch (tempType) {
        case "Point": newParams = { position: [0,0,0], color: "WHITE", size: 0.1, use_axes: true}; newNecessary = ["position", "use_axes"]; break;
        case "Line": newParams = { start: [0,0,0], end: [1,1,0], color: "WHITE", stroke_width: 2, use_axes: true}; newNecessary = ["start", "end", "use_axes"]; break;
        case "Axes":
            if (isAxesExist(track.id)) {
                ElMessage.error("已有坐标轴！一个场景中只能有一个坐标轴。");
                selectedItem.value.data.params.chooseType = originalLastType; // Revert
                return;
            }
            newParams = { x_range: [-4,4,1], y_range: [-4,4,1], z_range: [], axis_config: { include_numbers: true, font_size: 24, color: "WHITE" }};
            newNecessary = ["x_range", "y_range"];
            track.name = 'axis'; // Enforce name for Axes
            if(selectedItem.value) selectedItem.value.name = 'axis';
            break;
        case "Graph": newParams = { function: "", x_range: [-3,3], color: "WHITE", stroke_width: 2, use_axes: true}; newNecessary = ["function", "x_range", "use_axes"]; break;
        case "Area": newParams = { curve: null, x_range: [], color: "BLUE", opacity: 0.5, use_axes: true}; newNecessary = ["curve", "x_range", "use_axes"]; break;
        case "Riemann": newParams = { curve: null, x_range: [0.5,1.5], width: 0.1, use_axes: true}; newNecessary = ["curve","x_range","width"]; break;
        // ... add all other generate types from Main.vue
        default: newParams = {}; newNecessary = [];
    }
    track.generateBlockParams = { type: tempType, ...newParams, chooseType: originalChooseType, lastType: originalChooseType, necessary: newNecessary };
    track.generateBlockType = tempType; // Update quick access type
    // Reselect to refresh panel
    selectTrack(track.id);


  } else if (selectedItem.value.itemType === 'clip') {
    const track = tracks.value.find(t => t.id === selectedItem.value.trackId);
    if (!track) return;
    const clip = track.animationClips.find(c => c.id === selectedItem.value.id);
    if (!clip) return;

    // Default params logic from Main.vue's change() function for animation blocks
    // IMPORTANT: Keep existing startTime and duration for clips
    const existingStartTime = clip.startTime;
    const existingDuration = clip.duration;

    switch (tempType) {
        case "MoveTo": newParams = { target: [1,1,0], rate_func: "linear", use_axes: true}; newNecessary = ["target", "use_axes"]; break;
        case "Transform": newParams = { target_object: null, rate_func: "linear"}; newNecessary = ["target_object"]; break;
        case "ReplacementTransform": newParams = { target_object: null, rate_func: "linear"}; newNecessary = ["target_object"]; break;
        case "FollowPath": newParams = { curve: null, path_type:"custom", path: [[0,0,0],[1,1,0]], t_range:[0,1], rate_func: "linear"}; newNecessary = ["path_type","t_range"]; if(newParams.path_type === 'custom') newNecessary.push("path"); else newNecessary.push("curve"); break;
        // ... add all other animation types from Main.vue
        default: newParams = { rate_func: "linear" }; newNecessary = []; // Most animations have rate_func
    }
    clip.params = { type: tempType, ...newParams, chooseType: originalChooseType, lastType: originalChooseType, necessary: newNecessary };
    clip.type = tempType; // Update quick access type
    // Reselect to refresh panel
    selectAnimationClip(track.id, clip.id);
  } else if (selectedItem.value.itemType === 'function_track') {
      const track = tracks.value.find(t => t.id === selectedItem.value.id);
      if (!track) return;
      if (tempType === 'Wait') {
          newParams = { duration: 1, start_time: track.generateBlockParams.params.start_time || 0 }; // Keep start_time
          newNecessary = ["duration", "start_time"];
          track.generateBlockParams = {
              type: tempType,
              chooseType: originalChooseType,
              lastType: originalChooseType,
              params: newParams, // Params are nested for function_track
              necessary: newNecessary
          };
          track.generateBlockType = tempType;
          selectTrack(track.id); // Reselect
      } else {
          ElMessage.warning("功能泳道当前仅支持 'Wait' 类型。");
          selectedItem.value.data.params.chooseType = originalLastType; // Revert
      }
  }

  if (selectedItem.value) { // Update lastType for the current selection in panel
    selectedItem.value.data.params.lastType = originalChooseType;
  }
}


function changeColor() {
  if (selectedItem.value && selectedItem.value.data?.params?.color && Array.isArray(selectedItem.value.data.params.color)) {
    selectedItem.value.data.params.color = selectedItem.value.data.params.color[0];
  }
   if (selectedItem.value && selectedItem.value.data?.params?.axis_config?.color && Array.isArray(selectedItem.value.data.params.axis_config.color)) {
    selectedItem.value.data.params.axis_config.color = selectedItem.value.data.params.axis_config.color[0];
  }
}
function changeRateFunc() {
  if (selectedItem.value && selectedItem.value.data?.params?.rate_func && Array.isArray(selectedItem.value.data.params.rate_func)) {
    selectedItem.value.data.params.rate_func = selectedItem.value.data.params.rate_func[0];
  }
}
function changePath() {
  if (selectedItem.value && selectedItem.value.data?.params?.path_type && Array.isArray(selectedItem.value.data.params.path_type)) {
    selectedItem.value.data.params.path_type = selectedItem.value.data.params.path_type[0];
  }
   if(selectedItem.value && selectedItem.value.data?.params?.path_type === 'custom'){
    selectedItem.value.data.params.necessary = ["path","path_type","t_range"]
  }
  else if (selectedItem.value){
    selectedItem.value.data.params.necessary = ["curve","path_type","t_range"]
  }
}
function addPoint(index) {
  if (selectedItem.value && selectedItem.value.itemType === 'clip' && selectedItem.value.data.params.path) {
    selectedItem.value.data.params.path.splice(index + 1, 0, []);
  }
}
function deletePoint(index) {
  if (selectedItem.value && selectedItem.value.itemType === 'clip' && selectedItem.value.data.params.path && selectedItem.value.data.params.path.length > 1) {
    selectedItem.value.data.params.path.splice(index, 1);
  }
}

function isAxesExist(excludeTrackId = null) {
  return tracks.value.some(t => t.id !== excludeTrackId && t.generateBlockParams.type === 'Axes');
}

// --- Clip and Track Management ---
function addNewAnimationClipToTrack({ trackId, dropTime }) {
  const track = tracks.value.find(t => t.id === trackId);
  if (track) {
    // Check if adding a Transform clip is allowed
    const lastClip = track.animationClips.length > 0 ? track.animationClips[track.animationClips.length - 1] : null;
    if (lastClip && (lastClip.type === 'Transform' || lastClip.type === 'ReplacementTransform')) {
        ElMessage.error(`不能在 ${lastClip.type} 动画片段之后添加新的动画片段。`);
        return;
    }

    const newClipId = `clip_${clipIdCounter++}`;
    const defaultAnimParams = {
      type: "MoveTo",
      chooseType: "MoveTo",
      lastType: "MoveTo",
      target: [1, 1, 0],
      rate_func: "linear",
      use_axes: true,
      necessary: ["target", "use_axes"],
    };
    const newClip = {
      id: newClipId,
      type: defaultAnimParams.type, // For quick access
      params: defaultAnimParams,
      startTime: dropTime || (lastClip ? lastClip.startTime + lastClip.duration : 0),
      duration: 1, // Default duration
    };
    track.animationClips.push(newClip);
    track.animationClips.sort((a, b) => a.startTime - b.startTime); // Keep sorted
    selectAnimationClip(trackId, newClipId);
    updateTotalDuration();
  }
}

function updateAnimationClipTime({ trackId, clipId, startTime, duration }) {
  const track = tracks.value.find(t => t.id === trackId);
  if (track) {
    const clip = track.animationClips.find(c => c.id === clipId);
    if (clip) {
      clip.startTime = Math.max(0, startTime);
      clip.duration = Math.max(0.1, duration);
      track.animationClips.sort((a, b) => a.startTime - b.startTime);
      if (selectedItem.value && selectedItem.value.id === clipId) {
        selectedItem.value.startTime = clip.startTime;
        selectedItem.value.duration = clip.duration;
      }
      updateTotalDuration();
    }
  }
}
// Wrapper for right panel inputs for clips
function updateClipTimes(newStartTime, newDuration) {
    if (selectedItem.value && selectedItem.value.itemType === 'clip') {
        updateAnimationClipTime({
            trackId: selectedItem.value.trackId,
            clipId: selectedItem.value.id,
            startTime: newStartTime,
            duration: newDuration
        });
    }
}
// For function tracks (Wait)
function updateFunctionTrackTimes() {
    if (selectedItem.value && selectedItem.value.itemType === 'function_track') {
        const track = tracks.value.find(t => t.id === selectedItem.value.id);
        if (track && track.generateBlockParams.type === 'Wait') {
            // start_time and duration are directly in track.generateBlockParams.params for Wait
            // No need to call a separate update function, v-model handles it.
            // Just ensure total duration is updated.
            updateTotalDuration();
        }
    }
}


function deleteTrack(trackId) {
  tracks.value = tracks.value.filter(t => t.id !== trackId);
  if (selectedItem.value && selectedItem.value.id === trackId) {
    selectedItem.value = null;
  }
  updateTotalDuration();
}

function deleteAnimationClip(trackId, clipId) {
    const track = tracks.value.find(t => t.id === trackId);
    if (track) {
        track.animationClips = track.animationClips.filter(c => c.id !== clipId);
        if (selectedItem.value && selectedItem.value.id === clipId) {
            selectedItem.value = null;
        }
        updateTotalDuration();
    }
}

function updateTotalDuration() {
    let maxTime = 10; // Minimum duration
    tracks.value.forEach(track => {
        if (track.generateBlockParams.type === 'Wait') {
            const endTime = (track.generateBlockParams.params.start_time || 0) + (track.generateBlockParams.params.duration || 0);
            if (endTime > maxTime) maxTime = endTime;
        } else {
            track.animationClips.forEach(clip => {
                const endTime = clip.startTime + clip.duration;
                if (endTime > maxTime) maxTime = endTime;
            });
        }
    });
    totalDuration.value = Math.ceil(maxTime + 5); // Add some buffer
}


// --- Data Transformation for Backend ---
function collectGraphData() {
  const manimNodes = [];
  const manimEdges = [];

  tracks.value.forEach(track => {
    // 1. Create generateBlock node
    const generateNode = {
      id: track.id,
      blockType: track.generateBlockParams.type === 'Wait' ? 'function' : 'generate', // 'generate' or 'function' for Wait
      data: {
        // Ensure params is always present, even if empty initially
        params: { ...track.generateBlockParams } // Clone, includes type, chooseType, necessary, and actual params
      },
    };
    // Remove helper fields from params if they exist at the top level of 'params' object
    delete generateNode.data.params.chooseType;
    delete generateNode.data.params.lastType;
    delete generateNode.data.params.necessary;
    
    // For 'Wait' type, the actual parameters (start_time, duration) are nested
    if (track.generateBlockParams.type === 'Wait' && track.generateBlockParams.params) {
        generateNode.data.params = { // Overwrite params for Wait
            type: 'Wait',
            start_time: track.generateBlockParams.params.start_time,
            duration: track.generateBlockParams.params.duration,
        };
    }


    if (generateNode.data.params.type === "Axes" && !generateNode.data.params.z_range) {
        delete generateNode.data.params.z_range;
    }
    manimNodes.push(generateNode);

    // 2. Create animationBlock nodes and edges
    let lastClipId = null;
    track.animationClips.forEach((clip, index) => {
      const animationNode = {
        id: clip.id,
        blockType: 'animation',
        data: {
          params: { // Clone params
            ...clip.params,
            run_time: clip.duration,
            start_time: clip.startTime,
          }
        },
      };
      delete animationNode.data.params.chooseType; // Remove helper field
      delete animationNode.data.params.lastType;   // Remove helper field
      delete animationNode.data.params.necessary; // Remove helper field
      manimNodes.push(animationNode);

      // Create edges
      if (index === 0) { // First clip connects to the track's generateBlock
        manimEdges.push({ source: track.id, target: clip.id });
      } else if (lastClipId) { // Subsequent clips connect to the previous clip
        manimEdges.push({ source: lastClipId, target: clip.id });
      }
      lastClipId = clip.id;

      // Special handling for Transform target_object (already part of clip.params)
      // The backend expects target_object to be the ID of a generateBlock.
      // This is already handled if the select dropdown for Transform saves the track.id.
    });
  });
  
  const finalGraphData = { nodes: manimNodes, edges: manimEdges };
  console.log("Transformed data for backend:", JSON.parse(JSON.stringify(finalGraphData)));
  return finalGraphData;
}


// --- Backend Interaction (largely same as Main.vue, uses collectGraphData) ---
const fullscreenLoading = ref(false);
const videoSource = ref(""); // For preview, if used

function sendGraphDataToBackend() {
  const validationError = checkNecessary();
  if (validationError) { ElMessage.error(validationError); return; }
  
  fullscreenLoading.value = true;
  const graphData = collectGraphData();
  PostVideo(graphData)
    .then(result => { videoSource.value = result.video_url; ElMessage.success("预览视频已生成 (若有)"); })
    .catch(err => ElMessage.error(`预览失败: ${err.message || err}`))
    .finally(() => { fullscreenLoading.value = false; });
}

const downloadDialog = ref(false);
const quality = ref("4k");
const frame_rate = ref(60);
const videoType = [ { value: "480p", label: "480p" }, { value: "1080p", label: "1080p" }, { value: "4k", label: "4k" }, ];
const fpsType = [ { value: 30, label: "30" }, { value: 60, label: "60" }, ];

function downloadAnim() {
  const validationError = checkNecessary();
  if (validationError) { ElMessage.error(validationError); return; }

  downloadDialog.value = false;
  fullscreenLoading.value = true;
  const graphData = collectGraphData();
  DownloadVideo({ quality: quality.value, frame_rate: frame_rate.value, nodes: graphData.nodes, edges: graphData.edges })
    .then(result => ElMessage.success(`导出成功！视频位于 ${result.video_path}`))
    .catch(err => ElMessage.error(`导出失败: ${err.message || err}`))
    .finally(() => { fullscreenLoading.value = false; });
}

// --- Project Save/Load ---
const saveDialog = ref(false);
const projectName = ref("");
const loadDialog = ref(false);
const projectList = ref([]); // Renamed from project to avoid conflict

function saveProject() {
  if (!projectName.value.trim()) { ElMessage.error("项目名称不可为空！"); return; }
  const projectData = {
    projectName: projectName.value,
    data: { // Store the new tracks structure
      tracks: tracks.value,
      totalDuration: totalDuration.value,
      timelineScale: timelineScale.value,
      timelineOffset: timelineOffset.value,
    }
  };
  PostProject(projectData)
    .then(() => { ElMessage.success("项目暂存成功！"); saveDialog.value = false; projectName.value = ""; })
    .catch(err => ElMessage.error(`暂存失败: ${err.response?.data?.error || err.message || '未知错误'}`));
}

function loadProject() {
  GetProject()
    .then(result => { projectList.value = result; loadDialog.value = true; })
    .catch(err => ElMessage.error(`加载项目列表失败: ${err.message || err}`));
}

function loadSavedProject(index) {
  const projectToLoad = projectList.value[index];
  if (projectToLoad && projectToLoad.data && projectToLoad.data.tracks) {
    tracks.value = projectToLoad.data.tracks;
    totalDuration.value = projectToLoad.data.totalDuration || 30;
    timelineScale.value = projectToLoad.data.timelineScale || 20;
    timelineOffset.value = projectToLoad.data.timelineOffset || 0;
    selectedItem.value = null; // Clear selection
    ElMessage.success(`项目 "${projectToLoad.projectName}" 加载成功!`);
  } else {
     ElMessage.error("项目数据格式不正确，无法加载。可能需要转换为旧格式或手动重建。");
     // Fallback for old format (nodes/edges) - This part is tricky and might need a dedicated converter
     // For now, we assume new format. If old format is encountered, it won't load correctly.
     // If projectToLoad.nodes and projectToLoad.edges exist, it's an old project.
     // A conversion function `convertOldProjectToTracks(nodes, edges)` would be needed.
  }
  loadDialog.value = false;
}


const deleteDialog = ref(false);
function openDeleteDialog() {
  GetProject()
    .then(result => { projectList.value = result; deleteDialog.value = true; })
    .catch(err => ElMessage.error(`加载项目列表失败: ${err.message || err}`));
}
function deleteProject(index) {
  const projectNameToDelete = projectList.value[index].projectName;
  DeleteProject({ projectName: projectNameToDelete })
    .then(() => { ElMessage.success(`项目 "${projectNameToDelete}" 删除成功!`); openDeleteDialog(); /* Refresh list */ })
    .catch(err => ElMessage.error(`删除失败: ${err.message || err}`));
}

// --- Predefined Animations ---
const preDialog = ref(false);
const preLimits = ref([]);
const prePoints = ref([]);

async function loadPredefinedAnimations() {
  try {
    const responseLimit = await fetch('/static/json/limit/fileList.json');
    const filesLimit = await responseLimit.json();
    for (const file of filesLimit) {
      const fileResponse = await fetch(`/static/json/limit/${file}`);
      preLimits.value.push(await fileResponse.json());
    }
    const responsePoint = await fetch('/static/json/point/fileList.json');
    const filesPoint = await responsePoint.json();
    for (const file of filesPoint) {
      const fileResponse = await fetch(`/static/json/point/${file}`);
      prePoints.value.push(await fileResponse.json());
    }
  } catch (error) { console.error('加载预制动画 JSON 失败：', error); }
}

function choosePredefinedAnimation(item) {
  // This needs a converter from old nodes/edges format to new tracks format
  // For now, this will likely break or load incorrectly.
  // convertOldProjectToTracks(item.nodes, item.edges);
  ElMessage.info("加载预制动画到新轨道模式的功能待实现。");
  // tracks.value = convertedTracks;
  // updateTotalDuration();
  preDialog.value = false;
}

// --- AI Chat (assuming same as Main.vue) ---
function openAI(){ window.open(`${window.location.origin}/ai`, '_blank'); }
// ... other AI related functions from Main.vue would go here ...

// --- Validation ---
function checkNecessary() {
  for (const track of tracks.value) {
    const trackParams = track.generateBlockParams;
    if (trackParams.necessary) {
      for (const prop of trackParams.necessary) {
        if (trackParams[prop] === undefined || trackParams[prop] === null || (Array.isArray(trackParams[prop]) && trackParams[prop].length === 0) || String(trackParams[prop]).trim() === "") {
          selectTrack(track.id);
          return `泳道 "${track.name || track.id}" 的参数 "${prop}" 未填写！`;
        }
      }
    }
    if (track.generateBlockParams.type === 'Wait' && track.generateBlockParams.params) {
        if (track.generateBlockParams.params.duration === undefined || track.generateBlockParams.params.duration === null) {
            selectTrack(track.id);
            return `功能泳道 "${track.name || track.id}" 的 "等待时间" 未填写！`;
        }
         if (track.generateBlockParams.params.start_time === undefined || track.generateBlockParams.params.start_time === null) {
            selectTrack(track.id);
            return `功能泳道 "${track.name || track.id}" 的 "开始时间" 未填写！`;
        }
    }


    for (const clip of track.animationClips) {
      const clipP = clip.params; // Actual parameters are in clip.params
      if (clipP.necessary) {
        for (const prop of clipP.necessary) {
          if (clipP[prop] === undefined || clipP[prop] === null || (Array.isArray(clipP[prop]) && clipP[prop].length === 0) || String(clipP[prop]).trim() === "") {
            selectAnimationClip(track.id, clip.id);
            return `泳道 "${track.name || track.id}" 中片段 "${clip.id}" (${clip.type}) 的参数 "${prop}" 未填写！`;
          }
          if (prop === 'path' && Array.isArray(clipP.path)) {
            if (clipP.path.some(p => !Array.isArray(p) || p.length === 0)) {
                 selectAnimationClip(track.id, clip.id);
                 return `泳道 "${track.name || track.id}" 中片段 "${clip.id}" (${clip.type}) 的路径点对象未完整填写！`;
            }
          }
        }
      }
    }
  }
  return null; // No error
}


// --- Lifecycle Hooks ---
onMounted(() => {
  loadPredefinedAnimations();
  updateTotalDuration();
  // Load last saved project from localStorage if desired, or default state
  // For now, starts fresh.
});

// Undo/Redo would need significant rework for the `tracks` structure.
// This is a placeholder and likely won't work correctly without full implementation.
/*
let operaList = [];
let undoList = [];
const handleKeyDown = (event) => {
  if (event.ctrlKey && event.key === 'z') { event.preventDefault(); console.log("Undo (not implemented for tracks)"); }
  if (event.ctrlKey && event.key === 'y') { event.preventDefault(); console.log("Redo (not implemented for tracks)"); }
};
onMounted(() => { window.addEventListener('keydown', handleKeyDown); });
onUnmounted(() => { window.removeEventListener('keydown', handleKeyDown); });
*/

</script>

<style scoped>
/* Styles from Main.vue, plus new styles for timeline */
.header { align-items: center; justify-content: flex-end; display: flex; height: 10vh; }
.header .button { display: flex; align-items: center; justify-content: center; margin: 1%; color: #909399; background-color: #F5F7FA; border: white; font-size: 15px; font-weight: 500; font-family: 'Microsoft YaHei',arial,tahoma,\5b8b\4f53,sans-serif; }
.header .button :hover { color: black; outline: none; }

.main { height: 90vh; display: flex; flex-direction: column; } /* Ensure main takes up space */
.el-row { flex-grow: 1; display: flex; } /* Make el-row fill height */
.program-area { display: flex; flex-direction: column; height: 100%; } /* program-area to fill its col */
.animation-panel { background-color: white; border-left: 1px solid #c2c3c5; padding: 10px; overflow-y: auto; height: 100%; }
.node-info h3 { margin-top: 0; }

.swimlane-timeline-editor {
  flex-grow: 1; /* Takes up available space in program-area */
  display: flex;
  flex-direction: column;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  overflow: hidden; /* Important for internal scrolling */
  position: relative; /* For timeline panel positioning */
}

.timeline-panel {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  background-color: rgba(255,255,255,0.8);
  padding: 5px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.timeline-panel .button { /* For buttons inside panel */
    font-size: 13px;
    color: #333;
}
.timeline-panel .button:hover {
    color: #409EFF;
}


.timeline-header {
  display: flex;
  border-bottom: 1px solid #ccc;
  background-color: #e9ecef;
}
.track-headers-region {
  width: 200px; /* Fixed width for track headers */
  padding: 5px;
  border-right: 1px solid #ccc;
  overflow-y: auto; /* If many tracks */
  max-height: calc(100vh - 10vh - 40px - 40px); /* Adjust based on header/footer */
}
.track-header-item {
  padding: 8px 5px;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
}
.track-header-item:hover {
  background-color: #f8f9fa;
}
.track-header-item .track-name {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.track-header-item .track-type-icon {
  font-size: 10px;
  color: #6c757d;
}


.time-ruler-region {
  flex-grow: 1;
  height: 40px; /* Height of the time ruler */
  overflow: hidden; /* Ruler will handle its own scrolling/scaling display */
}

.timeline-body {
  display: flex;
  flex-grow: 1;
  overflow: hidden; /* Key for independent scrolling */
}
.track-list-region { /* Corresponds to track-headers-region width */
  width: 200px;
  border-right: 1px solid #ccc;
  /* This area might be empty or show track controls aligned with headers */
   background-color: #f8f9fa; /* Match header region bg */
}
.tracks-content-region {
  flex-grow: 1;
  overflow: auto; /* This is where tracks with clips will scroll */
  background-image: linear-gradient(to bottom, #fdfdfd 50%, #f7f7f7 50%);
  background-size: 100% 40px; /* Grid line for tracks */
}
.empty-timeline-message {
  text-align: center;
  color: #aaa;
  padding: 50px;
  font-size: 1.2em;
}
.selected-track-highlight { /* Applied to SwimlaneTrackComponent */
  /* background-color: #e6f7ff; */ /* Example highlight */
  outline: 2px solid #409EFF;
  outline-offset: -2px;
}


.preBlock { margin: 1%; text-align: center; width: 45%; display: inline-block; }
.preBlock:hover { background-color: rgb(235.9, 245.3, 255); cursor: pointer; }

/* Ensure el-form-item labels are visible */
.el-form-item__label {
  color: #606266;
}
</style>