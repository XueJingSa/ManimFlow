<template>
  <div style="background-color:#F5F7FA" v-loading.fullscreen.lock="fullscreenLoading" element-loading-text="Loading...">
    <div class="header">
      <!-- 新增：将timeline-panel移到这里 -->
  <div class="header-panel">
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
          >动画块 (默认1秒)</el-button>
        </div>
      </template>
      <el-button size="large" class="button">
        <el-icon size="large" style="color: black"><Plus /></el-icon><span style="font-weight: bolder; color: black">&ensp;添加元素</span>
      </el-button>
    </el-tooltip>
  </div>
    <div class="hover-time-control">
  <el-icon size="large"><Timer /></el-icon>
  <span style="margin: 0 10px;">悬浮时间</span>
      <el-switch
        v-model="showHoverTime"
        @change="toggleHoverTimeDisplay"
        active-color="#409EFF"
        inactive-color="#DCDFE6"
      />
    </div>
    
    <div class="hover-time-control">
      <el-icon size="large"><SetUp /></el-icon>
      <span style="margin: 0 10px;">自动适配视图</span>
      <el-switch
        v-model="autoFitViewport"
        @change="toggleAutoFitViewport"
        active-color="#409EFF"
        inactive-color="#DCDFE6"
      />
    </div>
    <div class="hover-time-control">
      <el-icon size="large"><Operation /></el-icon>
      <span style="margin: 0 10px;">全局视图</span>
      <el-switch
        v-model="showTimelineMap"
        @change="toggleTimelineMap"
        active-color="#409EFF"
        inactive-color="#DCDFE6"
      />
    </div>
      <el-button size="large" class="button" @click="preDialog = true">
        <el-icon size="large"><MessageBox /></el-icon>&ensp;动画
      </el-button>
      <el-button size="large" class="button" @click="sendGraphDataToBackend">
        <el-icon size="large"><View /></el-icon>&ensp;预览
      </el-button>
      <el-button size="large" class="button" @click="handleDownloadClick">
        <el-icon size="large"><Download /></el-icon>&ensp;下载
      </el-button>
      <el-button size="large" class="button" @click="saveDialog = true">
        <el-icon size="large"><DocumentAdd /></el-icon>&ensp;保存项目
      </el-button>
      <el-button size="large" class="button" @click="loadProject()">
        <el-icon size="large"><FolderOpened /></el-icon>&ensp;加载项目
      </el-button>
      <el-button size="large" class="button" @click="openDeleteDialog()">
        <el-icon size="large"><Delete /></el-icon>&ensp;删除项目
      </el-button>
      <el-button size="large" class="button" @click="openAI()">
        <el-icon size="large"><Service /></el-icon>&ensp;AI助手
      </el-button>
    </div>
    <div class="main">
      <el-row>
        <el-col :span="programSpan" class="program-area transition-col">
          <!-- Main Editing Area: Swimlane Timeline -->
          <div class="swimlane-timeline-editor"  ref="swimlaneEditorRef" @dragover="onDragOverTimeline" @drop="onDropTimeline">
            

            <!-- 使用Timeline组件 -->
          <div class="timeline-container" >
            <!-- 添加简单的控制按钮 -->
          <div class="timeline-controls">
            <el-button-group>
              <el-button-group>
                  <el-button @click="moveLeft" size="small" type="text">
                    <el-icon><ArrowLeft /></el-icon>
                  </el-button>
                  <el-button @click="moveRight" size="small" type="text">
                    <el-icon><ArrowRight /></el-icon>
                  </el-button>
                  <el-button @click="zoomIn" size="small" type="text">
                    <el-icon><ZoomIn /></el-icon>
                  </el-button>
                  <el-button @click="zoomOut" size="small" type="text">
                    <el-icon><ZoomOut /></el-icon>
                  </el-button>
                  <el-button 
                    @click="pasteTrack" 
                    size="small" 
                    type="text" 
                    :disabled="!copiedTrack"
                    title="粘贴轨道"
                  >
                    <el-icon><Document /></el-icon>
                  </el-button>
                </el-button-group>
            </el-button-group>
          </div>
          <div class="main-timeline-wrapper" :class="{ 'paste-mode-active': isPasteMode }">
            <Timeline
            ref="timelineRef"
              :groups="timelineGroups"
              :items="timelineItems"
              :markers="timelineMarkers"
              :viewportMin="timelineViewport.min"
              :viewportMax="timelineViewport.max"
              :minViewportDuration="100" 
              :initialViewportStart="0"
              :initialViewportEnd="timelineViewport.max"
              :formatTime="formatTimelineTime"
              :renderTimestampLabel="renderTimeLabel"
              @click="handleTimelineInteraction"
              @pointerdown="handleTimelineInteraction"
              @pointermove="handleTimelineInteraction"
              @changeViewport="viewport => currentViewport = viewport"
              @mousemoveTimeline="onMousemoveTimeline"
              @mouseleaveTimeline="onMouseleaveTimeline"
              
              
            >
              <!-- 自定义项目内容 -->
              <!-- 自定义项目内容 -->
              <template #item="{ item }">
                <div class="timeline-item-content" 
                    :class="{ 'show-animation-item': isShowAnimation(item) }"
                    :title="getItemTitle(item)" 
                    data-action="resize-both">
                  {{ getItemLabel(item) }}
                  <div v-if="!isShowAnimation(item)" class="resize-handle left" data-action="resize-start"></div>
                  <div v-if="!isShowAnimation(item)" class="resize-handle right" data-action="resize-end"></div>
                </div>
              </template>
              
              <!-- 自定义组标签 -->
              <template #group-label="{ group }">
                <div class="group-label-content" @click="selectTrack(group.id)">
                  <el-icon class="track-icon"><Menu /></el-icon>
                  <span class="track-name" style="font-weight: bolder;">{{ getGroupLabel(group) }}</span>
                  <el-button
                  style="margin-left: 1px;"
                    icon="DocumentCopy"
                    size="small"
                    circle
                    plain
                    @click.stop="copyTrack(group.id)"
                    title="复制轨道"
                  ></el-button>
                  <el-button
                  style="margin-left: -3px;"
                    icon="Delete"
                    size="small"
                    circle
                    plain
                    @click.stop="confirmDeleteTrack(group.id)"
                    title="删除轨道"
                  ></el-button>
                </div>
              </template>
               <!-- 添加标记模板 -->
              <template #marker="{ item }">
                <div class="marker-content">
                  {{ formatTimelineTime(item.start) }}
                </div>
              </template>
            </Timeline>
            </div>
            <!-- 在主Timeline组件下方添加缩略时间线 -->
             <div class="left-side-timeline-map" v-if="showTimelineMap">
            <Timeline
              v-if="showTimelineMap"
              :items="[
                ...getSelectedTrackItems(),
                { id: 'selection', type: 'background', start: currentViewport.start, end: currentViewport.end }
              ]"
              :groups="[{id: selectedItem?.trackId || selectedItem?.id || '1'}]"
              :viewportMin="timelineViewport.min"
              :viewportMax="timelineViewport.max"
              :minViewportDuration="timelineViewport.max"
              class="timeline-map"
              :renderTimestampLabel="renderTimeLabel"
              @pointermove="handleMapViewportDrag"
              @pointerdown="handleMapViewportDrag"
              @wheel="onMapWheel"
            />
            </div>
          </div>
        </div>
      </el-col>

        <!-- Right Panel: Parameter Editing -->
        <el-col :span="animationSpan" class="animation-panel transition-col">
          <el-button
            icon="DArrowRight"
            link
            size="large"
            @click="fold"
            :style="{transform: isFold ? 'rotate(180deg)' : 'rotate(0deg)',transition: 'transform 0.2s ease'}"
          ></el-button>
          <transition name="fade-in-fast">
          <div class="node-info" v-if="!isFold">
            <h3>{{ selectedItemDescription }}</h3>
            <div v-if="selectedItem && selectedItem.data">
              <!-- Generate Block (Track) Parameters -->
              <div v-if="selectedItem.itemType === 'track'">
                <el-divider>元素块 (泳道) 参数</el-divider>
                <div class="track-order-controls">
                  <el-button 
                    type="primary" 
                    plain 
                    icon="ArrowUp" 
                    @click="moveTrackUp(selectedItem.id)"
                    :disabled="!canMoveTrackUp(selectedItem.id)"
                  >上移轨道</el-button>
                  <el-button 
                    type="primary" 
                    plain 
                    icon="ArrowDown" 
                    @click="moveTrackDown(selectedItem.id)"
                    :disabled="!canMoveTrackDown(selectedItem.id)"
                  >下移轨道</el-button>
                </div>
                <el-form label-position="top" label-width="100px">
                 <el-form-item>
                    <template #label><span>泳道ID</span><span style="color: red;">*</span></template>
                    <el-input v-model="selectedItem.id" @change="updateTrackId"></el-input>
                  </el-form-item>
                  <el-form-item>
                    <template #label><span>类别</span><span style="color: red;">*</span></template>
                    <el-cascader
                      v-model="selectedItem.data.params.chooseType"
                      :options="generateTypeOptions"
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
                    <el-form-item inline label="是否依附于自定义坐标系"><el-checkbox v-model="selectedItem.data.params.use_axes"></el-checkbox></el-form-item>
                  </div>
                  <!-- Line -->
                   <div v-if="selectedItem.data.params.type =='Line'">
                    <el-form-item><template #label><span>起点坐标</span><span style="color: red;">*</span></template><el-input v-model="selectedItem.data.params.start" @change="selectedItem.data.params.start = JSON.parse('[' + selectedItem.data.params.start + ']');"></el-input></el-form-item>
                    <el-form-item><template #label><span>终点坐标</span><span style="color: red;">*</span></template><el-input v-model="selectedItem.data.params.end" @change="selectedItem.data.params.end = JSON.parse('[' + selectedItem.data.params.end + ']');"></el-input></el-form-item>
                    <el-form-item label="颜色"><el-cascader v-model="selectedItem.data.params.color" :options="colorType" @change="changeColor" filterable /></el-form-item>
                    <el-form-item label="线宽"><el-input v-model="selectedItem.data.params.stroke_width"></el-input></el-form-item>
                    <el-form-item inline label="是否依附于自定义坐标系"><el-checkbox v-model="selectedItem.data.params.use_axes"></el-checkbox></el-form-item>
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
                    <el-form-item inline label="是否依附于自定义坐标系"><el-checkbox v-model="selectedItem.data.params.use_axes"></el-checkbox></el-form-item>
                  </div>
                  <!-- Area -->
                  <div v-if="selectedItem.data.params.type == 'Area'">
                    <!-- <el-form-item><template #label><span>被填充的曲线 (Graph ID)</span><span style="color: red;">*</span></template>
                        <el-select v-model="selectedItem.data.params.curve" placeholder="Select Graph Track">
                            <el-option v-for="track_opt in graphTracks" :key="track_opt.id" :label="track_opt.name || track_opt.id" :value="track_opt.id" />
                        </el-select>
                    </el-form-item> -->
                    <el-form-item><template #label><span>被填充的曲线 (轨道 ID)</span><span style="color: red;">*</span></template>
                      <el-select v-model="selectedItem.data.params.curve" placeholder="选择轨道">
                          <el-option v-for="track_opt in tracks.filter(t => t.id !== selectedItem.id)" :key="track_opt.id" :label="track_opt.id" :value="track_opt.id" />
                      </el-select>
                  </el-form-item>
                    <el-form-item><template #label><span>填充范围</span><span style="color: red;">*</span></template><el-input v-model="selectedItem.data.params.x_range" @change="selectedItem.data.params.x_range = JSON.parse('[' + selectedItem.data.params.x_range + ']');"></el-input>
                    </el-form-item>
                    <el-form-item label="填充颜色"><el-cascader v-model="selectedItem.data.params.color" :options="colorType" @change="changeColor" filterable /></el-form-item>
                    <el-form-item label="填充透明度"><el-input v-model="selectedItem.data.params.opacity"></el-input></el-form-item>
                    <el-form-item inline label="是否依附于自定义坐标系"><el-checkbox v-model="selectedItem.data.params.use_axes" disabled></el-checkbox></el-form-item>
                  </div>
                   <!-- Riemann -->
                  <div v-if="selectedItem.data.params.type ==='Riemann'">
                    <!-- <el-form-item><template #label><span>被填充的曲线 (Graph ID)</span><span style="color: red;">*</span></template>
                        <el-select v-model="selectedItem.data.params.curve" placeholder="Select Graph Track">
                            <el-option v-for="track_opt in graphTracks" :key="track_opt.id" :label="track_opt.name || track_opt.id" :value="track_opt.id" />
                        </el-select>
                    </el-form-item> -->
                    <el-form-item><template #label><span>被填充的曲线 (轨道 ID)</span><span style="color: red;">*</span></template>
                      <el-select v-model="selectedItem.data.params.curve" placeholder="选择轨道">
                          <el-option v-for="track_opt in tracks.filter(t => t.id !== selectedItem.id)" :key="track_opt.id" :label="track_opt.id" :value="track_opt.id" />
                      </el-select>
                  </el-form-item>
                    <el-form-item><template #label><span>填充范围</span><span style="color: red;">*</span></template><el-input v-model="selectedItem.data.params.x_range" @change="selectedItem.data.params.x_range = JSON.parse('[' + selectedItem.data.params.x_range + ']');"></el-input>
                    </el-form-item>
                    <el-form-item><template #label><span>矩形宽度</span><span style="color: red;">*</span></template><el-input v-model="selectedItem.data.params.width"></el-input></el-form-item>
                  </div>
                  <!-- DashedLine (虚线) -->
                  <div v-if="selectedItem.data.params.type =='DashedLine'">
                    <el-form-item><template #label><span>起点坐标</span><span style="color: red;">*</span></template>
                      <el-input v-model="selectedItem.data.params.start" @change="selectedItem.data.params.start = JSON.parse('[' + selectedItem.data.params.start + ']');"></el-input>
                    </el-form-item>
                    <el-form-item><template #label><span>终点坐标</span><span style="color: red;">*</span></template>
                      <el-input v-model="selectedItem.data.params.end" @change="selectedItem.data.params.end = JSON.parse('[' + selectedItem.data.params.end + ']');"></el-input>
                    </el-form-item>
                    <el-form-item label="颜色">
                      <el-cascader v-model="selectedItem.data.params.color" :options="colorType" @change="changeColor" filterable />
                    </el-form-item>
                    <el-form-item label="线宽">
                      <el-input v-model="selectedItem.data.params.stroke_width"></el-input>
                    </el-form-item>
                    <el-form-item inline label="是否依附于自定义坐标系">
                      <el-checkbox v-model="selectedItem.data.params.use_axes"></el-checkbox>
                    </el-form-item>
                  </div>

                  <!-- Circle (圆) -->
                  <div v-if="selectedItem.data.params.type == 'Circle'">
                    <el-form-item><template #label><span>圆心坐标</span><span style="color: red;">*</span></template>
                      <el-input v-model="selectedItem.data.params.center" @change="selectedItem.data.params.center = JSON.parse('[' + selectedItem.data.params.center + ']');"></el-input>
                    </el-form-item>
                    <el-form-item><template #label><span>半径</span><span style="color: red;">*</span></template>
                      <el-input v-model="selectedItem.data.params.radius"></el-input>
                    </el-form-item>
                    <el-form-item label="颜色">
                      <el-cascader v-model="selectedItem.data.params.color" :options="colorType" @change="changeColor" filterable />
                    </el-form-item>
                    <el-form-item label="填充透明度">
                      <el-input v-model="selectedItem.data.params.fill_opacity"></el-input>
                    </el-form-item>
                    <el-form-item inline label="是否依附于自定义坐标系">
                      <el-checkbox v-model="selectedItem.data.params.use_axes"></el-checkbox>
                    </el-form-item>
                  </div>

                  <!-- Rectangle (矩形) -->
                  <div v-if="selectedItem.data.params.type == 'Rectangle'">
                    <el-form-item><template #label><span>左下角坐标</span><span style="color: red;">*</span></template>
                      <el-input v-model="selectedItem.data.params.corner_position" @change="selectedItem.data.params.corner_position = JSON.parse('[' + selectedItem.data.params.corner_position + ']');"></el-input>
                    </el-form-item>
                    <el-form-item><template #label><span>宽度</span><span style="color: red;">*</span></template>
                      <el-input v-model="selectedItem.data.params.width"></el-input>
                    </el-form-item>
                    <el-form-item><template #label><span>高度</span><span style="color: red;">*</span></template>
                      <el-input v-model="selectedItem.data.params.height"></el-input>
                    </el-form-item>
                    <el-form-item label="边框颜色">
                      <el-cascader v-model="selectedItem.data.params.color" :options="colorType" @change="changeColor" filterable />
                    </el-form-item>
                    <el-form-item label="填充颜色">
                      <el-cascader v-model="selectedItem.data.params.fill_color" :options="colorType" @change="changeColor" filterable />
                    </el-form-item>
                    <el-form-item label="填充透明度">
                      <el-input v-model="selectedItem.data.params.fill_opacity"></el-input>
                    </el-form-item>
                    <el-form-item inline label="是否依附于自定义坐标系">
                      <el-checkbox v-model="selectedItem.data.params.use_axes"></el-checkbox>
                    </el-form-item>
                  </div>

                  <!-- Polygon (多边形) -->
                  <div v-if="selectedItem.data.params.type == 'Polygon'">
                    <el-form-item><template #label><span>顶点坐标</span><span style="color: red;">*</span></template>
                      <el-input v-model="selectedItem.data.params.vertices" @change="selectedItem.data.params.vertices = JSON.parse('[' + selectedItem.data.params.vertices + ']');"></el-input>
                    </el-form-item>
                    <el-form-item label="边框颜色">
                      <el-cascader v-model="selectedItem.data.params.color" :options="colorType" @change="changeColor" filterable />
                    </el-form-item>
                    <el-form-item label="边框宽度">
                      <el-input v-model="selectedItem.data.params.stroke_width"></el-input>
                    </el-form-item>
                    <el-form-item label="填充颜色">
                      <el-cascader v-model="selectedItem.data.params.fill_color" :options="colorType" @change="changeColor" filterable />
                    </el-form-item>
                    <el-form-item label="填充透明度">
                      <el-input v-model="selectedItem.data.params.fill_opacity"></el-input>
                    </el-form-item>
                    <el-form-item inline label="是否依附于自定义坐标系">
                      <el-checkbox v-model="selectedItem.data.params.use_axes"></el-checkbox>
                    </el-form-item>
                  </div>

                  <!-- Arrow (箭头) -->
                  <div v-if="selectedItem.data.params.type == 'Arrow'">
                    <el-form-item><template #label><span>起点坐标</span><span style="color: red;">*</span></template>
                      <el-input v-model="selectedItem.data.params.start" @change="selectedItem.data.params.start = JSON.parse('[' + selectedItem.data.params.start + ']');"></el-input>
                    </el-form-item>
                    <el-form-item><template #label><span>终点坐标</span><span style="color: red;">*</span></template>
                      <el-input v-model="selectedItem.data.params.end" @change="selectedItem.data.params.end = JSON.parse('[' + selectedItem.data.params.end + ']');"></el-input>
                    </el-form-item>
                    <el-form-item label="颜色">
                      <el-cascader v-model="selectedItem.data.params.color" :options="colorType" @change="changeColor" filterable />
                    </el-form-item>
                    <el-form-item label="线宽">
                      <el-input v-model="selectedItem.data.params.stroke_width"></el-input>
                    </el-form-item>
                    <el-form-item label="间距">
                      <el-input v-model="selectedItem.data.params.buff"></el-input>
                    </el-form-item>
                    <el-form-item inline label="是否依附于自定义坐标系">
                      <el-checkbox v-model="selectedItem.data.params.use_axes"></el-checkbox>
                    </el-form-item>
                  </div>

                  <!-- Brace (括号) -->
                  <div v-if="selectedItem.data.params.type === 'Brace'">
                    <el-form-item><template #label><span>左括号坐标</span><span style="color: red;">*</span></template>
                      <el-input v-model="selectedItem.data.params.left_bracket_position" @change="selectedItem.data.params.left_bracket_position = JSON.parse('[' + selectedItem.data.params.left_bracket_position + ']');"></el-input>
                    </el-form-item>
                    <el-form-item><template #label><span>右括号坐标</span><span style="color: red;">*</span></template>
                      <el-input v-model="selectedItem.data.params.right_bracket_position" @change="selectedItem.data.params.right_bracket_position = JSON.parse('[' + selectedItem.data.params.right_bracket_position + ']');"></el-input>
                    </el-form-item>
                    <el-form-item label="颜色">
                      <el-cascader v-model="selectedItem.data.params.color" :options="colorType" @change="changeColor" filterable />
                    </el-form-item>
                    <el-form-item label="线宽">
                      <el-input v-model="selectedItem.data.params.stroke_width"></el-input>
                    </el-form-item>
                    <el-form-item inline label="是否依附于自定义坐标系">
                      <el-checkbox v-model="selectedItem.data.params.use_axes"></el-checkbox>
                    </el-form-item>
                  </div>

                  <!-- Text (文本) -->
                  <div v-if="selectedItem.data.params.type == 'Text'">
                    <el-form-item><template #label><span>文字内容</span><span style="color: red;">*</span></template>
                      <el-input v-model="selectedItem.data.params.content"></el-input>
                    </el-form-item>
                    <el-form-item label="显示位置">
                      <el-input v-model="selectedItem.data.params.position" @change="selectedItem.data.params.position = JSON.parse('[' + selectedItem.data.params.position + ']');"></el-input>
                    </el-form-item>
                    <el-form-item label="字体大小">
                      <el-input v-model="selectedItem.data.params.font_size"></el-input>
                    </el-form-item>
                    <el-form-item label="文字颜色">
                      <el-cascader v-model="selectedItem.data.params.color" :options="colorType" @change="changeColor" filterable />
                    </el-form-item>
                    <el-form-item inline label="是否依附于自定义坐标系">
                      <el-checkbox v-model="selectedItem.data.params.use_axes"></el-checkbox>
                    </el-form-item>
                  </div>

                  <!-- MathTex (数学公式) -->
                  <div v-if="selectedItem.data.params.type == 'MathTex'">
                    <el-form-item><template #label><span>LaTeX 表达式</span><span style="color: red;">*</span></template>
                      <el-input v-model="selectedItem.data.params.formula"></el-input>
                    </el-form-item>
                    <el-form-item label="显示位置">
                      <el-input v-model="selectedItem.data.params.position" @change="selectedItem.data.params.position = JSON.parse('[' + selectedItem.data.params.position + ']');"></el-input>
                    </el-form-item>
                    <el-form-item label="字体大小">
                      <el-input v-model="selectedItem.data.params.font_size"></el-input>
                    </el-form-item>
                    <el-form-item label="公式颜色">
                      <el-cascader v-model="selectedItem.data.params.color" :options="colorType" @change="changeColor" filterable />
                    </el-form-item>
                    <el-form-item inline label="是否依附于自定义坐标系">
                      <el-checkbox v-model="selectedItem.data.params.use_axes"></el-checkbox>
                    </el-form-item>
                  </div>

                  <!-- ContourPlot (等高线) -->
                  <div v-if="selectedItem.data.params.type == 'ContourPlot'">
                    <el-form-item><template #label><span>函数表达式</span><span style="color: red;">*</span></template>
                      <el-input v-model="selectedItem.data.params.function"></el-input>
                    </el-form-item>
                    <el-form-item><template #label><span>x 轴范围</span><span style="color: red;">*</span></template>
                      <el-input v-model="selectedItem.data.params.x_range" @change="selectedItem.data.params.x_range = JSON.parse('[' + selectedItem.data.params.x_range + ']');"></el-input>
                    </el-form-item>
                    <el-form-item><template #label><span>y 轴范围</span><span style="color: red;">*</span></template>
                      <el-input v-model="selectedItem.data.params.y_range" @change="selectedItem.data.params.y_range = JSON.parse('[' + selectedItem.data.params.y_range + ']');"></el-input>
                    </el-form-item>
                    <el-form-item label="等高线层级数">
                      <el-input v-model="selectedItem.data.params.levels"></el-input>
                    </el-form-item>
                    <el-form-item inline label="是否依附于自定义坐标系">
                      <el-checkbox v-model="selectedItem.data.params.use_axes"></el-checkbox>
                    </el-form-item>
                  </div>

                  <!-- Grid (网格) -->
                  <div v-if="selectedItem.data.params.type == 'Grid'">
                    <el-form-item><template #label><span>宽度</span><span style="color: red;">*</span></template>
                      <el-input v-model="selectedItem.data.params.width"></el-input>
                    </el-form-item>
                    <el-form-item><template #label><span>高度</span><span style="color: red;">*</span></template>
                      <el-input v-model="selectedItem.data.params.height"></el-input>
                    </el-form-item>
                    <el-form-item label="网格线颜色">
                      <el-cascader v-model="selectedItem.data.params.line_color" :options="colorType" @change="changeColor" filterable />
                    </el-form-item>
                  </div>
                </el-form>
              </div>

              <!-- Animation Clip Parameters -->
              <div v-if="selectedItem.itemType === 'clip'">
                <el-divider>动画片段参数</el-divider>
                <el-form label-position="top" label-width="100px">
                  <el-form-item>
                    <template #label><span>片段ID</span><span style="color: red;">*</span></template>
                    <div style="display: flex; gap: 10px;">
                      <el-input v-model="selectedItem.id" @change="updateClipId" style="flex: 1;"></el-input>
                      <el-button 
                          type="primary" 
                          plain 
                          icon="DocumentCopy" 
                          @click="copyAnimationClip(selectedItem.trackId, selectedItem.id)"
                        >复制</el-button>
                      <el-button 
                        type="danger" 
                        plain 
                        icon="Delete" 
                        @click="confirmDeleteClip(selectedItem.trackId, selectedItem.id)"
                        style="margin-left: -3px"
                      >删除</el-button>
                    </div>
                  </el-form-item>
                 
                  <el-form-item>
                    <template #label><span>类型</span><span style="color: red;">*</span>
                    </template>
                    <el-cascader
                      v-model="selectedItem.data.params.chooseType"
                      :options="animationTypeOptions"
                      @change="changeSelectedItemType"
                      filterable
                    />
                  </el-form-item>
                  <el-form-item label="开始时间 (s)">
                    <el-input-number v-model="selectedItem.startTime" :min="0" :precision="1" :step="0.1"  @change="val => updateClipTimes(val, selectedItem.duration)" />
                  </el-form-item>
                  <el-form-item label="持续时间 (s)" v-if="selectedItem.data.params.type !== 'Show'">
                     <el-input-number v-model="selectedItem.duration" :min="0.1" :precision="1" :step="0.1" @change="val => updateClipTimes(selectedItem.startTime, val)" />
                  </el-form-item>

                  <!-- Dynamically shown forms based on selectedItem.data.params.type -->
                  <!-- MoveTo -->
                  <div v-if="selectedItem.data.params.type == 'MoveTo'">
                    <el-form-item><template #label><span>目标位置</span><span style="color: red;">*</span></template><el-input v-model="selectedItem.data.params.target" @change="selectedItem.data.params.target = JSON.parse('[' + selectedItem.data.params.target + ']');"></el-input></el-form-item>
                    <el-form-item><template #label><span>缓动函数</span><span style="color: red;">*</span></template><el-cascader v-model="selectedItem.data.params.rate_func" :options="rateFuncType" @change="changeRateFunc" filterable /></el-form-item>
                    <el-form-item inline label="是否依附于自定义坐标系"><el-checkbox v-model="selectedItem.data.params.use_axes"></el-checkbox></el-form-item>
                  </div>
                  <!-- Transform -->
                  <div v-if="selectedItem.data.params.type == 'Transform' || selectedItem.data.params.type == 'ReplacementTransform'">
                    <el-form-item><template #label><span>目标元素 (泳道 ID)</span><span style="color: red;">*</span></template>
                        <el-select v-model="selectedItem.data.params.target_object" placeholder="Select Target Track" @change="handleTransformTargetSelected">
                            <el-option 
                                v-for="track_opt in tracks.filter(t => t.id !== selectedItem.trackId)" 
                                :key="track_opt.id" 
                                :label="track_opt.id" 
                                :value="track_opt.id" 
                              />
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
                            <el-option v-for="track_opt in graphTracks" :key="track_opt.id" :label="track_opt.id" :value="track_opt.id" />
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
                   <!-- Rotate (旋转动画) -->
                      <div v-if="selectedItem.data.params.type == 'Rotate'">
                        <el-form-item><template #label><span>旋转角度（度数）</span><span style="color: red;">*</span></template>
                          <el-input v-model="selectedItem.data.params.angle"></el-input>
                        </el-form-item>
                        <el-form-item label="旋转中心点">
                          <el-input v-model="selectedItem.data.params.about_point" @change="selectedItem.data.params.about_point = JSON.parse('[' + selectedItem.data.params.about_point + ']');"></el-input>
                        </el-form-item>
                        <el-form-item><template #label><span>缓动函数</span><span style="color: red;">*</span></template>
                          <el-cascader v-model="selectedItem.data.params.rate_func" :options="rateFuncType" @change="changeRateFunc" filterable />
                        </el-form-item>
                        <el-form-item inline label="是否依附于自定义坐标系">
                          <el-checkbox v-model="selectedItem.data.params.use_axes"></el-checkbox>
                        </el-form-item>
                      </div>

                      <!-- Scale (缩放动画) -->
                      <div v-if="selectedItem.data.params.type == 'Scale'">
                        <el-form-item><template #label><span>缩放比例</span><span style="color: red;">*</span></template>
                          <el-input v-model="selectedItem.data.params.scale_factor"></el-input>
                        </el-form-item>
                        <el-form-item><template #label><span>缓动函数</span><span style="color: red;">*</span></template>
                          <el-cascader v-model="selectedItem.data.params.rate_func" :options="rateFuncType" @change="changeRateFunc" filterable />
                        </el-form-item>
                      </div>

                      <!-- FadeIn (淡入动画) -->
                      <div v-if="selectedItem.data.params.type == 'FadeIn'">
                        <el-form-item><template #label><span>缓动函数</span><span style="color: red;">*</span></template>
                          <el-cascader v-model="selectedItem.data.params.rate_func" :options="rateFuncType" @change="changeRateFunc" filterable />
                        </el-form-item>
                      </div>

                      <!-- FadeOut (淡出动画) -->
                      <div v-if="selectedItem.data.params.type == 'FadeOut'">
                        <el-form-item><template #label><span>缓动函数</span><span style="color: red;">*</span></template>
                          <el-cascader v-model="selectedItem.data.params.rate_func" :options="rateFuncType" @change="changeRateFunc" filterable />
                        </el-form-item>
                      </div>

                      <!-- SetColor (改变颜色动画) -->
                      <div v-if="selectedItem.data.params.type == 'SetColor'">
                        <el-form-item><template #label><span>目标颜色</span><span style="color: red;">*</span></template>
                          <el-input v-model="selectedItem.data.params.color"></el-input>
                        </el-form-item>
                        <el-form-item><template #label><span>缓动函数</span><span style="color: red;">*</span></template>
                          <el-cascader v-model="selectedItem.data.params.rate_func" :options="rateFuncType" @change="changeRateFunc" filterable />
                        </el-form-item>
                      </div>

                      <!-- Create (创建动画) -->
                      <div v-if="selectedItem.data.params.type == 'Create'">
                        <el-form-item><template #label><span>缓动函数</span><span style="color: red;">*</span></template>
                          <el-cascader v-model="selectedItem.data.params.rate_func" :options="rateFuncType" @change="changeRateFunc" filterable />
                        </el-form-item>
                      </div>

                      <!-- ApplyMatrix (旋转变换) -->
                      <div v-if="selectedItem.data.params.type == 'ApplyMatrix'">
                        <el-form-item><template #label><span>变换矩阵</span><span style="color: red;">*</span></template>
                          <el-input v-model="selectedItem.data.params.matrix"></el-input>
                        </el-form-item>
                        <el-form-item label="变换中心点">
                          <el-input v-model="selectedItem.data.params.about_point" @change="selectedItem.data.params.about_point = JSON.parse('[' + selectedItem.data.params.about_point + ']');"></el-input>
                        </el-form-item>
                        <el-form-item><template #label><span>缓动函数</span><span style="color: red;">*</span></template>
                          <el-cascader v-model="selectedItem.data.params.rate_func" :options="rateFuncType" @change="changeRateFunc" filterable />
                        </el-form-item>
                        <el-form-item inline label="是否依附于自定义坐标系">
                          <el-checkbox v-model="selectedItem.data.params.use_axes"></el-checkbox>
                        </el-form-item>
                      </div>

                      <!-- Show (显示动画) -->
                      <div v-if="selectedItem.data.params.type == 'Show'">
                        <!-- Show 动画只需要开始时间参数，已经在通用部分有 -->
                        </div>
                </el-form>
              </div>
               <!-- Function Block (Track with Wait) Parameters -->
              <div v-if="selectedItem.itemType === 'function_track'">
                <el-divider>功能块 (泳道) 参数</el-divider>
                 <el-form label-position="top" label-width="100px">
                    <el-form-item label="泳道名称 (ID)">
                        <el-input v-model="selectedItem.id" @change="updateTrackName"></el-input>
                    </el-form-item>
                    <el-form-item> <template #label><span>类型</span><span style="color: red;">*</span></template>
                        <el-cascader v-model="selectedItem.data.params.chooseType" :options="functionType" @change="changeSelectedItemType" filterable />
                    </el-form-item>
                    <!-- Wait -->
                    <div v-if="selectedItem.data.params.type == 'Wait'">
                        <el-form-item label="开始时间 (s)">
                            <el-input-number v-model="selectedItem.data.params.start_time" :min="0" :precision="1" 
    :step="0.1" @change="updateFunctionTrackTimes" />
                        </el-form-item>
                        <el-form-item><template #label><span>等待时间 (s)</span><span style="color: red;">*</span></template>
                            <el-input-number v-model="selectedItem.data.params.duration" :min="0.1" :precision="1" 
    :step="0.1" @change="updateFunctionTrackTimes" />
                        </el-form-item>
                    </div>
                    <!-- Group, Ungroup, SetZIndex would need different handling, perhaps not as timeline tracks -->
                      <!-- Group (成组) -->
                    <div v-if="selectedItem.data.params.type == 'Group'">
                      <el-form-item><template #label><span>目标对象列表</span><span style="color: red;">*</span></template>
                        <el-input
                          v-model="selectedItem.data.params.targets"
                          type="textarea"
                          :rows="4"
                          placeholder="请输入目标对象的 ID，多个 ID 用逗号分隔"
                        ></el-input>
                      </el-form-item>
                    </div>

                    <!-- Ungroup (解组) -->
                    <div v-if="selectedItem.data.params.type == 'Ungroup'">
                      <el-form-item><template #label><span>目标组列表</span><span style="color: red;">*</span></template>
                        <el-input
                          v-model="selectedItem.data.params.targets"
                          type="textarea"
                          :rows="4"
                          placeholder="请输入目标组的 ID，多个 ID 用逗号分隔"
                        ></el-input>
                      </el-form-item>
                    </div>

                    <!-- SetZIndex (动态图层调整) -->
                    <div v-if="selectedItem.data.params.type == 'SetZIndex'">
                      <el-form-item><template #label><span>目标对象列表</span><span style="color: red;">*</span></template>
                        <el-input
                          v-model="selectedItem.data.params.targets"
                          type="textarea"
                          :rows="4"
                          placeholder="请输入目标对象的 ID，多个 ID 用逗号分隔"
                        ></el-input>
                      </el-form-item>
                      <el-form-item><template #label><span>图层层次值</span><span style="color: red;">*</span></template>
                        <el-input
                          v-model="selectedItem.data.params.z_index"
                          placeholder="请输入图层层次值（数字）"
                        ></el-input>
                      </el-form-item>
                    </div>
                  </el-form>
              </div>

            </div>
            <p v-else>未选中任何元素或片段</p>
          </div>
          </transition>
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
    <!-- <el-dialog v-model="preDialog" title="预制动画" width="900" align-center>
        <el-scrollbar max-height="600px">
            <el-card v-for="item in preLimits" :key="item.videoSource" class="preBlock" @click="choosePredefinedAnimation(item)">
                <video ref="myVideo" autoplay muted loop :src="item.videoSource" style="width: 100%;"></video>
                <template #footer>{{ item.name }}</template>
            </el-card>
        </el-scrollbar>
    </el-dialog> -->
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
import { Timeline } from 'vue-timeline-chart';
import 'vue-timeline-chart/style.css';
import { ref, watch, onMounted, onUnmounted, reactive, toRefs, computed, nextTick, defineAsyncComponent } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

// 从 @/api/main 移除 SendDescription
import { DeleteProject, DownloadVideo, GetCompleteJson, GetProject, PostProject, PostVideo } from "@/api/main";
// 如果需要，从 @/api/ai 导入 SendDescription (以及其他需要的 ai 函数)
// import { SendDescription, CreateNewChat, HistoryList /* ... other functions from ai.js */ } from "@/api/ai";
import { serveAddress } from "@/api/api";
// import { useStore } from "vuex"; // If using Vuex
import { ArrowLeft, ArrowRight, 
  ZoomIn, ZoomOut,Timer, Menu, Delete, Plus, Pointer, Link, Search, MessageBox, View, Download, DocumentAdd, FolderOpened, Service, DArrowRight, CloseBold, Operation, Document, DocumentCopy, ArrowUp, ArrowDown } from '@element-plus/icons-vue';

const showHoverTime = ref(false);
// 添加到其他ref变量附近
const copiedClip = ref(null); // 存储复制的动画块
const isPasteMode = ref(false); // 是否处于粘贴模式
// 自动适配视图状态
const autoFitViewport = ref(true);
//组件：
// 将tracks转换为timeline的groups
const timelineGroups = computed(() => {
  return tracks.value.map(track => ({
    id: track.id,
    label: track.id,
    // 添加一些自定义样式
    cssVariables: {
      '--height': track.generateBlockParams.type === 'Wait' ? '2.5em' : '3.5em'
    }
  }));
});

// 切换悬浮时间显示状态
function toggleHoverTimeDisplay(value) {
  if (value) {
    ElMessage.success('已开启悬浮时间显示');
  } else {
    ElMessage.info('已关闭悬浮时间显示');
    mouseHoverPosition.value = null; // 关闭时清除当前悬浮位置
  }
}
// 将animationClips转换为timeline的items
const timelineItems = computed(() => {
  const items = [];
  
  tracks.value.forEach(track => {
    // 每个动画片段作为一个range item
    track.animationClips.forEach(clip => {
      items.push({
        id: clip.id,
        group: track.id,
        type: 'range',
        start: clip.startTime * 1000, // 转换为毫秒
        end: (clip.startTime + clip.duration) * 1000, // 转换为毫秒
        // 根据动画类型设置不同的背景色
        cssVariables: {
          '--item-background': getColorForAnimationType(clip.params.type),
        }
      });
    });
    
    // 对于Wait类型的功能块，显示其持续时间
    if (track.generateBlockParams.type === 'Wait') {
      const startTime = track.generateBlockParams.params?.start_time || 0;
      const duration = track.generateBlockParams.params?.duration || 1;
      
      items.push({
        id: `wait_${track.id}`,
        group: track.id,
        type: 'range',
        start: startTime * 1000,
        end: (startTime + duration) * 1000,
        cssVariables: {
          '--item-background': 'rgba(150, 150, 150, 0.3)',
        }
      });
    }
  });
  
  return items;
});

// 根据动画类型返回对应的颜色
function getColorForAnimationType(type) {
  const colorMap = {
    // 核心修正：将原先的蓝色替换为更多样的颜色
    'MoveTo': 'var(--el-color-primary-light-3)',        // 移动 -> 淡红色
    'Rotate': 'var(--el-color-success-light-3)',       // 旋转 -> 绿色 (保持)
    'Scale': 'var(--el-color-warning-light-3)',        // 缩放 -> 黄色 (保持)
    'FadeIn': 'var(--el-color-danger-light-3)',        // 淡入 -> 红色 (保持)
    'FadeOut': 'var(--el-color-info-light-3)',         // 淡出 -> 灰色 (保持)
    'Transform': 'var(--el-color-info-dark-2)',        // 变换 -> 深灰色
    'ReplacementTransform': 'var(--el-color-success-light-1)', // 替换变换 -> 深绿色 (保持)
    'FollowPath': 'var(--el-color-danger-light-5)',   // 路径 -> 深黄色 (保持)
    'Create': 'var(--el-color-warning-light-5)',       // 创建 -> 淡橙色
    'ApplyMatrix': 'var(--el-color-success-light-4)',  // 矩阵 -> 绿色变体 (保持)
    'SetColor': 'var(--el-color-warning-light-4)',     // 设色 -> 黄色变体 (保持)
    'Show': 'var(--el-color-black)',                   // 显示 -> 黑色 (保持)
  };
  
  return colorMap[type] || 'var(--el-color-primary-light-5)'; // 默认颜色
}


// 是否显示缩略时间线
const showTimelineMap = ref(false);

// 切换缩略时间线显示状态
function toggleTimelineMap(value) {
  if (value) {
    ElMessage.success('已开启缩略时间线');
  } else {
    ElMessage.info('已关闭缩略时间线');
  }
}

// 缩略时间线拖动相关变量
let isDraggingMapViewport = false;
let previousMapDragTimePos = 0;

// 处理缩略时间线拖动事件
function handleMapViewportDrag({ time, event, item }) {
  if (event.type === 'pointerdown') {
    if (item?.id !== 'selection') {
      return;
    }
    isDraggingMapViewport = true;
    previousMapDragTimePos = time;
  }
  else if (event.type === 'pointermove') {
    if (!isDraggingMapViewport) {
      return;
    }
    time = Math.max(0, time);
    const delta = time - previousMapDragTimePos;
    const length = currentViewport.value.end - currentViewport.value.start;
    
    if (delta < 0) {
      // 向左拖动
      const newStart = Math.max(currentViewport.value.start + delta, timelineViewport.value.min);
      const newEnd = newStart + length;
      timelineRef.value?.setViewport(newStart, newEnd);
    }
    else {
      // 向右拖动
      const newEnd = Math.min(currentViewport.value.end + delta, timelineViewport.value.max);
      const newStart = newEnd - length;
      timelineRef.value?.setViewport(newStart, newEnd);
    }
    
    previousMapDragTimePos = time;


  }
}

// 处理缩略时间线上的滚轮事件
function onMapWheel(event) {
  timelineRef.value?.onWheel(event);
}

// 添加存储复制的轨道数据的引用变量
const copiedTrack = ref(null);


// 设置时间轴范围
const timelineViewport = computed(() => {
  return {
    min: 0,
    max: totalDuration.value * 1000 // 转换为毫秒
  };
});

// 用于拖拽和调整大小的状态变量
let currentDragAction = null;
let currentDragItemId = null;
let previousDragTimePos = 0;

// 处理时间轴上的交互事件
function handleTimelineInteraction({ time, event, item }) {
  // 点击事件处理
  if (event.type === 'click') {
    if (isPasteMode.value && copiedClip.value) {
      //console.log("检测到粘贴模式点击", event.target);
      
      // 检查点击的是否是动画块
      const isOnItem = event.target.closest('.timeline-item');
      if (!isOnItem) {
        // 找到最近的group元素
        const groupElement = event.target.closest('.group');
        //console.log("找到的轨道元素:", groupElement);
        
        if (groupElement) {
          // 直接从Timeline组件的内部数据结构获取trackId
          // 找到点击位置的索引
          const groups = timelineGroups.value;
          const groupIndex = Array.from(document.querySelectorAll('.group')).indexOf(groupElement);
          
          if (groupIndex >= 0 && groupIndex < groups.length) {
            const trackId = groups[groupIndex].id;
            //console.log("获取到的轨道ID:", trackId);
            
            if (trackId) {
              pasteAnimationClip(trackId, time / 1000); // 转换为秒
              isPasteMode.value = false; // 退出粘贴模式
              //ElMessage.success("动画块粘贴成功");
              return; // 粘贴后不执行选中逻辑
            }
          }
        }
        
        // 尝试另一种方式：通过轨道标签获取ID
        const groupLabel = event.target.closest('.timeline-group-label');
        if (groupLabel) {
          // 查找标签中的轨道名称元素
          const nameEl = groupLabel.querySelector('.track-name');
          if (nameEl) {
            const fullName = nameEl.textContent;
            // 从"元素 track_0 [Point]"格式中提取出"track_0"
            const match = fullName.match(/(\w+_\d+)/);
            if (match && match[1]) {
              const trackId = match[1];
              //console.log("从轨道名称提取的ID:", trackId);
              pasteAnimationClip(trackId, time / 1000);
              isPasteMode.value = false;
              //ElMessage.success("动画块粘贴成功");
              return;
            }
          }
        }
        
        ElMessage.warning("无法识别轨道ID，请尝试点击轨道名称区域");
      }
    }
    if (item) {
      // 查找并选中对应的片段
      tracks.value.forEach(track => {
        if (track.id === item.group) {
          const clip = track.animationClips.find(c => c.id === item.id);
          if (clip) {
            selectAnimationClip(track.id, clip.id);
          } else if (item.id.startsWith('wait_')) {
            selectTrack(track.id); // 选中Wait功能轨道
          }
        }
      });
    }
  }
  // 拖拽事件处理
  else if (event.type === 'pointerdown') {
    if (event.target.dataset.action) {
      // 对于Show类型的动画块，只允许整体移动，不允许调整大小
      if (item && isShowAnimation(item) && 
          (event.target.dataset.action === 'resize-start' || 
           event.target.dataset.action === 'resize-end')) {
        return; // 阻止调整大小
      }
      currentDragAction = event.target.dataset.action;
      currentDragItemId = item.id;
      previousDragTimePos = time;
    }
  }
  else if (event.type === 'pointermove') {
    // console.log('Pointer move on timeline:', time, event.type, item);
    if (!currentDragAction || !currentDragItemId) return;
    
    const delta = (time - previousDragTimePos) / 1000; // 转换为秒
    
    // 查找并更新对应片段的时间
    tracks.value.forEach(track => {
      // 处理Wait功能轨道
      if (currentDragItemId.startsWith('wait_') && currentDragItemId === `wait_${track.id}`) {
        if (track.generateBlockParams.type === 'Wait') {
          if (currentDragAction === 'resize-start') {
            const newStartTime = Math.max(0, (track.generateBlockParams.params.start_time || 0) + delta);
            const newDuration = Math.max(0.1, (track.generateBlockParams.params.duration || 1) - delta);
            
            if (newDuration >= 0.1) {
              track.generateBlockParams.params.start_time = newStartTime;
              track.generateBlockParams.params.duration = newDuration;
            }
          }
          else if (currentDragAction === 'resize-end') {
            const newDuration = Math.max(0.1, (track.generateBlockParams.params.duration || 1) + delta);
            track.generateBlockParams.params.duration = newDuration;
          }
          else if (currentDragAction === 'resize-both') {
            const newStartTime = Math.max(0, (track.generateBlockParams.params.start_time || 0) + delta);
            track.generateBlockParams.params.start_time = newStartTime;
          }
          
          updateTotalDuration();
        }
        return;
      }
      
      // 处理普通动画片段
      const clipIndex = track.animationClips.findIndex(c => c.id === currentDragItemId);
      if (clipIndex >= 0) {
        const clip = track.animationClips[clipIndex];
        
        if (currentDragAction === 'resize-start') {
          // 调整开始时间
          const newStartTime = Math.max(0, clip.startTime + delta);
          const newDuration = Math.max(0.1, clip.duration - delta);
          
          if (newDuration >= 0.1) {
            updateAnimationClipTime({
              trackId: track.id,
              clipId: clip.id,
              startTime: newStartTime,
              duration: newDuration
            });
          }
        }
        else if (currentDragAction === 'resize-end') {
          // 调整持续时间
          const newDuration = Math.max(0.1, clip.duration + delta);
          
          updateAnimationClipTime({
            trackId: track.id,
            clipId: clip.id,
            startTime: clip.startTime,
            duration: newDuration
          });
        }
        else if (currentDragAction === 'resize-both') {
          // 移动整个片段
          const newStartTime = Math.max(0, clip.startTime + delta);
          
          updateAnimationClipTime({
            trackId: track.id,
            clipId: clip.id,
            startTime: newStartTime,
            duration: clip.duration
          });
        }
      }
    });
    
    previousDragTimePos = time;
  }
}

// 在鼠标松开时重置拖拽状态
function handleGlobalPointerUp() {
  if (currentDragAction || currentDragItemId) {
    if(showTimelineMap.value == true){
      showTimelineMap.value = false;
      nextTick(() => {
        showTimelineMap.value = true;
      });
    }
    
  }
  currentDragAction = null;
  currentDragItemId = null;
}
// 确认删除动画片段
function confirmDeleteClip(trackId, clipId) {
  ElMessageBox.confirm(
    '确定要删除这个动画片段吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    deleteAnimationClip(trackId, clipId);
    ElMessage({
      type: 'success',
      message: '删除成功'
    });
  }).catch(() => {
    // 用户取消删除
  });
}
// 处理在轨道上添加新动画片段
function handleTrackClick({ time, event, item }) {
  if (!item && dragType.value === 'animation') {
    // 获取点击位置所在的轨道
    const groupElement = event.target.closest('.group');
    if (groupElement) {
      const trackId = groupElement.dataset.id;
      if (trackId) {
        addNewAnimationClipToTrack({
          trackId,
          dropTime: time / 1000 // 转换回秒
        });
      }
    }
  }
}

// 在组件挂载时添加全局事件监听
onMounted(() => {
  window.addEventListener('pointerup', handleGlobalPointerUp, { capture: true });
  window.addEventListener('keydown', handleKeyDown);
  // 添加处理缩略时间线拖动结束的逻辑
  window.addEventListener('pointerup', () => {
    isDraggingMapViewport = false;
  }, { capture: true });
});

// 在组件卸载时移除全局事件监听
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('pointerup', handleGlobalPointerUp, { capture: true });
  window.removeEventListener('pointerup', () => {
    isDraggingMapViewport = false;
  }, { capture: true });
});


// 获取项目标签
function getItemLabel(item) {
  // 处理Wait功能轨道
  if (item.id.startsWith('wait_')) {
    return 'Wait';
  }
  
  // 处理动画片段
  const track = tracks.value.find(t => t.id === item.group);
  if (track) {
    const clip = track.animationClips.find(c => c.id === item.id);
    if (clip) {
      return clip.params.type;
    }
  }
  return item.id;
}

// 自定义时间轴标签渲染函数，实现从 00:00:00 开始显示
function renderTimeLabel(timestamp, scale) {
  // 将时间戳转换为从0开始的秒数
  const totalSeconds = Math.floor(timestamp / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  // 根据缩放级别决定显示的精度
  if (scale.unit === 'hour' || hours > 0) {
    // 显示时:分:秒
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else if (scale.unit === 'minute' || minutes > 0) {
    // 显示分:秒
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    // 只显示秒
    return `${seconds}s`;
  }
}

// 获取项目标题（鼠标悬停时显示）
function getItemTitle(item) {
  // 处理Wait功能轨道
  if (item.id.startsWith('wait_')) {
    const track = tracks.value.find(t => t.id === item.group);
    if (track && track.generateBlockParams.type === 'Wait') {
      const startTime = track.generateBlockParams.params?.start_time || 0;
      const duration = track.generateBlockParams.params?.duration || 1;
      return `Wait: ${startTime.toFixed(1)}s - ${(startTime + duration).toFixed(1)}s`;
    }
    return 'Wait';
  }
  
  // 处理动画片段
  const track = tracks.value.find(t => t.id === item.group);
  if (track) {
    const clip = track.animationClips.find(c => c.id === item.id);
    if (clip) {
      return `${clip.params.type}: ${clip.startTime.toFixed(1)}s - ${(clip.startTime + clip.duration).toFixed(1)}s`;
    }
  }
  return item.id;
}
// 处理 Transform 目标选择后的提示
function handleTransformTargetSelected(targetTrackId) {
  if (!selectedItem.value || !targetTrackId) return;
  
  // 获取当前 Transform 动画结束时间
  const transformEndTime = selectedItem.value.startTime + selectedItem.value.duration;
  
  // 获取目标泳道名称
  const targetTrack = tracks.value.find(t => t.id === targetTrackId);
  if (!targetTrack) return;
  
  const targetTrackName = targetTrack.id;
  const transformType = selectedItem.value.data.params.type;
  
  // 显示提示消息
  ElMessage({
    message: `您已选择在 ${transformEndTime.toFixed(1)} s时间变换成泳道"${targetTrackName}"对应的元素,请在泳道"${targetTrackName}"的 ${transformEndTime.toFixed(1)}s 时间点后添加动画块,否则无效`,
    type: 'success',
    duration: 8000,  // 显示时间更长，让用户有足够时间看到
    showClose: true
  });
}
// 获取组标签
// 修改getGroupLabel函数
function getGroupLabel(group) {
  const track = tracks.value.find(t => t.id === group.id);
  if (track) {
    // 直接使用ID作为主要标识符，后面跟类型
    let label = track.id;
    if (track.generateBlockParams.type) {
      label += ` [${track.generateBlockParams.type}]`;
    }
    return label;
  }
  return group.id;
}
// 新增：更新轨道ID的函数
function updateTrackId() {
  if (!selectedItem.value || 
      (selectedItem.value.itemType !== 'track' && 
       selectedItem.value.itemType !== 'function_track')) {
    return;
  }
  
  // 最关键的改动：通过索引而不是ID来找轨道
  const trackIndex = tracks.value.findIndex(t => t.id === selectedItem.value.oldId);
  
  // 如果没有oldId记录，说明是第一次修改，用当前ID查找
  const currentIndex = trackIndex >= 0 ? trackIndex : 
                      tracks.value.findIndex(t => t.id === selectedItem.value.id);
  
  if (currentIndex === -1) {
    ElMessage.error("无法找到对应轨道，请重新选择后再试");
    return;
  }
  
  const track = tracks.value[currentIndex];
  const oldId = track.id;
  const newId = selectedItem.value.id;
  
  // 坐标轴类型特殊处理
  if (track.generateBlockParams.type === 'Axes' && newId !== 'axis') {
    ElMessage.warning("坐标轴泳道ID必须为'axis'");
    selectedItem.value.id = 'axis';
    return;
  }
  
    // 检查新ID是否已存在（包括动画块ID）
  if (isIdExists(newId)) {
    ElMessage.error(`ID "${newId}" 已存在于轨道或动画块中，请使用唯一ID`);
    selectedItem.value.id = oldId; // 恢复原ID
    return;
  }
  
  // 保存旧ID用于更新引用
  selectedItem.value.oldId = oldId;
  
  // 更新轨道ID
  track.id = newId;
  
  // 更新所有引用
  tracks.value.forEach(t => {
    t.animationClips.forEach(clip => {
      if (clip.params.target_object === oldId) {
        clip.params.target_object = newId;
      }
    });
  });
  
  // 强制更新视图
  tracks.value = [...tracks.value];
  
  ElMessage.success(`轨道ID已从 "${oldId}" 更新为 "${newId}"`);
  
}

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
  
  let typeName = "";
  if (selectedItem.value.itemType === 'track') {
    typeName = selectedItem.value.data?.params?.type || "元素";
    return `元素泳道: ${selectedItem.value.id} [${typeName}]`;
  }
  if (selectedItem.value.itemType === 'clip') {
    typeName = selectedItem.value.data?.params?.type || "动画";
    return `动画片段: ${selectedItem.value.id} [${typeName}]`;
  }
  if (selectedItem.value.itemType === 'function_track') {
    typeName = selectedItem.value.data?.params?.type || "功能";
    return `功能泳道: ${selectedItem.value.id} [${typeName}]`;
  }
  return "选中项";
});

// 在计算属性部分添加
const animationTypeOptions = computed(() => {
  if (!selectedItem.value || selectedItem.value.itemType !== 'clip') {
    return animationType;
  }
  
  // 判断是否为轨道上的第一个/最后一个动画块
  const track = tracks.value.find(t => t.id === selectedItem.value.trackId);
  if (!track || !track.animationClips.length) return animationType;
  
  // 获取所有动画块并按开始时间排序
  const sortedClips = [...track.animationClips].sort((a, b) => a.startTime - b.startTime);
  
  // 判断选中动画块的位置
  const isFirstClip = sortedClips[0].id === selectedItem.value.id;
  const isLastClip = sortedClips[sortedClips.length - 1].id === selectedItem.value.id;
  
  // 根据动画块位置过滤选项
  if (!isFirstClip && !isLastClip) {
    // 中间动画块：不能是Show/FadeIn/FadeOut/Transform/ReplacementTransform
    return animationType.filter(type => 
      !['Show', 'FadeIn', 'FadeOut', 'Transform', 'ReplacementTransform'].includes(type.value)
    );
  } else if (isFirstClip && !isLastClip) {
    // 第一个但不是最后一个：只能是Show/FadeIn或普通动画
    return animationType.filter(type => 
      !['FadeOut', 'Transform', 'ReplacementTransform'].includes(type.value)
    );
  } else if (!isFirstClip && isLastClip) {
    // 最后一个但不是第一个：只能是FadeOut/Transform/ReplacementTransform或普通动画
    return animationType.filter(type => 
      !['Show', 'FadeIn'].includes(type.value)
    );
  } else {
    // 既是第一个又是最后一个（轨道只有一个动画块）：可以是任何类型
    return animationType;
  }
});

// --- Drag and Drop for Adding Blocks ---
const dragType = ref(null); // 'generate', 'animation'
const isDragOverTimeline = ref(false);

function onDragBlockStart(event, type) {
  if (event.dataTransfer) {
    event.dataTransfer.setData("application/manimflow-block", type);
    event.dataTransfer.effectAllowed = "copy";
  }
  dragType.value = type;
  isDragOverTimeline.value = true; // Visual feedback for the timeline area
}

function onDragOverTimeline(event) {
  event.preventDefault();
  
  // 获取拖拽类型
  const type = event.dataTransfer.getData("application/manimflow-block") || dragType.value;
  
  if (type === 'generate') {
    // 元素块允许放置在整个时间轴区域
    event.dataTransfer.dropEffect = "copy";
    isDragOverTimeline.value = true;
  } else if (type === 'animation') {
    // 对于动画块，不设置dropEffect为"none"
    // 而是允许事件冒泡到SwimlaneTrackComponent处理
    // 只在没有泳道的情况下显示禁止标志
    if (tracks.value.length === 0) {
      event.dataTransfer.dropEffect = "none";
    } else {
      // 允许放置，具体处理由各个泳道组件完成
      event.dataTransfer.dropEffect = "copy";
    }
    isDragOverTimeline.value = false;
  }
}

const mouseHoverPosition = ref(null);

// 计算标记位置
const timelineMarkers = computed(() => {
  if (!showHoverTime.value) return [];
  
  return [mouseHoverPosition.value ? {
    start: mouseHoverPosition.value,
    type: 'marker',
    id: 'mousehover',
  } : null].filter(Boolean);
});

// 鼠标移动处理函数
function onMousemoveTimeline({ time }) {
  if (showHoverTime.value) {
    mouseHoverPosition.value = time;
  }
}

// 鼠标离开处理函数
function onMouseleaveTimeline() {
  mouseHoverPosition.value = null;
}

function onDropTimeline(event) {
  event.preventDefault();
  const type = event.dataTransfer.getData("application/manimflow-block") || dragType.value;
  
  if (type === 'generate') {
    // 已有的元素块创建逻辑保持不变
    const newTrackId = generateUniqueTrackId();
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
      generateBlockType: defaultGenerateParams.type,
      generateBlockParams: defaultGenerateParams,
      animationClips: [],
    });
    selectTrack(newTrackId);
  } 
  else if (type === 'animation') {
    // 获取拖放位置所在的元素
    // 获取拖放位置所在的元素
  const element = document.elementFromPoint(event.clientX, event.clientY);
  
  // 找到包含轨道的group元素
  const groupElement = element.closest('.group');
  console.log("找到的轨道元素:", groupElement);
  
  if (groupElement) {
    let trackId = null;
    
    // 方法1：直接从组件内部数据结构获取ID（添加这部分）
    const groups = timelineGroups.value;
    const groupIndex = Array.from(document.querySelectorAll('.group')).indexOf(groupElement);
    
    if (groupIndex >= 0 && groupIndex < groups.length) {
      trackId = groups[groupIndex].id;
      console.log("通过索引获取到的轨道ID:", trackId);
    }
    
    // 如果方法1失败，尝试方法2（保留原来的逻辑作为后备）
    if (!trackId) {
      const nameEl = groupElement.querySelector('.track-name');
      if (nameEl) {
        const fullName = nameEl.textContent;
        const match = fullName.match(/(\w+_\d+)/);
        if (match && match[1]) {
          trackId = match[1];
        }
      }
    }
    
    if (trackId) {
      // 计算时间点和添加动画块的逻辑不变...
      const timelineRect = event.currentTarget.getBoundingClientRect();
      const timelineX = event.clientX - timelineRect.left;
      const viewportWidth = event.currentTarget.clientWidth;
      const viewportDuration = currentViewport.value.end - currentViewport.value.start;
      const dropTimeMs = (timelineX / viewportWidth) * viewportDuration + currentViewport.value.start;
      
      addNewAnimationClipToTrack({
        trackId,
        dropTime: dropTimeMs / 1000 // 转换为秒
      });
    } else {
      ElMessage.warning("无法识别轨道ID，请尝试重新选择");
    }
  } else {
    ElMessage.warning("请将动画块拖放到泳道上");
  }
  }
  
  dragType.value = null;
  isDragOverTimeline.value = false;
}

function formatTimelineTime(ms) {
 ms = Math.max(0, ms);

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  const sec = seconds % 60;
  const min = minutes % 60;
  const tenthOfSec = Math.floor((ms % 1000) / 100); // 获取十分之一秒
  
  return `${hours.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${tenthOfSec}`;
}

function canMoveTrackUp(trackId) {
  const index = tracks.value.findIndex(t => t.id === trackId);
  return index > 0;
}

// 检查轨道是否可以下移
function canMoveTrackDown(trackId) {
  const index = tracks.value.findIndex(t => t.id === trackId);
  return index >= 0 && index < tracks.value.length - 1;
}

// 上移轨道
function moveTrackUp(trackId) {
  const index = tracks.value.findIndex(t => t.id === trackId);
  if (index > 0) {
    // 交换当前轨道与上一个轨道的位置
    const temp = tracks.value[index];
    tracks.value[index] = tracks.value[index - 1];
    tracks.value[index - 1] = temp;
    
    // 通知Vue更新视图
    tracks.value = [...tracks.value];
    
    // ElMessage.success(`轨道 "${tracks.value[index - 1].name || tracks.value[index - 1].id}" 已上移`);
    
    // 重新选中轨道，确保右侧编辑区域状态正确
    selectTrack(trackId);
    
    // 如果显示缩略图，刷新缩略图
    if(showTimelineMap.value) {
      showTimelineMap.value = false;
      nextTick(() => {
        showTimelineMap.value = true;
      });
    }
  }
}

// 下移轨道
function moveTrackDown(trackId) {
  const index = tracks.value.findIndex(t => t.id === trackId);
  if (index >= 0 && index < tracks.value.length - 1) {
    // 交换当前轨道与下一个轨道的位置
    const temp = tracks.value[index];
    tracks.value[index] = tracks.value[index + 1];
    tracks.value[index + 1] = temp;
    
    // 通知Vue更新视图
    tracks.value = [...tracks.value];
    
    ElMessage.success(`轨道 "${tracks.value[index + 1].id}" 已下移`);
    
    // 重新选中轨道，确保右侧编辑区域状态正确
    selectTrack(trackId);
    
    // 如果显示缩略图，刷新缩略图
    if(showTimelineMap.value) {
      showTimelineMap.value = false;
      nextTick(() => {
        showTimelineMap.value = true;
      });
    }
  }
}

// --- Selection Logic ---
function selectTrack(trackId) {
  const track = tracks.value.find(t => t.id === trackId);
  if (track) {
    if (track.generateBlockParams.type === 'Wait') {
      selectedItem.value = {
        itemType: 'function_track',
        id: track.id,
        name: track.name,
        oldId: track.id, // 添加oldId字段用于跟踪ID变更
        data: {
          params: track.generateBlockParams
        }
      };
    } else {
      selectedItem.value = {
        itemType: 'track',
        id: track.id,
        name: track.name,
        oldId:track.id, // 添加oldId字段用于跟踪ID变更
        data: {
          params: track.generateBlockParams
        }
      };
      //console.log(selectedItem.value.data.params);
    }
  } else {
    selectedItem.value = null;
  }
}


// 在计算属性部分添加
const generateTypeOptions = computed(() => {
  // 检查是否已经存在坐标轴
  const hasAxisTrack = tracks.value.some(t => t.generateBlockParams.type === 'Axes');
  
  // 如果已存在坐标轴且当前选中的不是坐标轴轨道，过滤掉Axes选项
  if (hasAxisTrack && 
      (!selectedItem.value || 
       selectedItem.value.itemType !== 'track' || 
       !selectedItem.value.data.params || 
       selectedItem.value.data.params.type !== 'Axes')) {
    
    // 创建一个深拷贝，避免修改原始数据
    const filteredTypes = JSON.parse(JSON.stringify(generateType));
    
    // 找到"坐标系"分类，移除"坐标轴"选项
    const axisCategory = filteredTypes.find(category => category.value === 'axis');
    if (axisCategory && axisCategory.children) {
      axisCategory.children = axisCategory.children.filter(item => item.value !== 'Axes');
      
      // 如果移除后没有子项，可以考虑完全移除该分类
      if (axisCategory.children.length === 0) {
        return filteredTypes.filter(category => category.value !== 'axis');
      }
    }
    
    return filteredTypes;
  }
  
  // 没有坐标轴或当前选中的就是坐标轴，返回完整选项
  return generateType;
});

function selectAnimationClip(trackId, clipId) {
  //点击动画块
  //console.log("选择片段:", trackId, clipId);
  const track = tracks.value.find(t => t.id === trackId);
  if (track) {
    const clip = track.animationClips.find(c => c.id === clipId);
    if (clip) {

      selectedItem.value = {
        itemType: 'clip',
        id: clip.id,
        oldId: clip.id, // 添加oldId属性
        trackId: track.id,
        data: {
          params: clip.params // 包装在params中
        }, // The whole clip object, params are inside clip.params
        // For right panel compatibility, we might need to structure it like:
        // data: { params: clip.params },
        // but let's try direct first. We need startTime and duration at this level too.
        startTime: clip.startTime,
        duration: clip.duration,
      };
      console.log(selectedItem.value.data.params);
    }
  }
}

function updateTrackName() {
    if (selectedItem.value && selectedItem.value.itemType === 'track') {
        const track = tracks.value.find(t => t.id === selectedItem.value.id);
        if (track) {
            if (track.generateBlockParams.type === 'Axes' && selectedItem.value.id !== 'axis') {
                ElMessage.warning("坐标轴 (Axis) 泳道的名称固定为 'axis'，不可修改。");
                selectedItem.value.name = 'axis'; // Revert
                selectedItem.value.id = 'axis';
                return;
            }
            track.name = selectedItem.value.name;
            track.id = selectedItem.value.id;
        }
    } else if (selectedItem.value && selectedItem.value.itemType === 'function_track') {
        const track = tracks.value.find(t => t.id === selectedItem.value.id);
        if (track) {
            track.name = selectedItem.value.name;
            track.id = selectedItem.value.id;
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
    case "DashedLine": newParams = { start: [0,0,0], end: [1,1,1], color: "WHITE", stroke_width: 2, use_axes: true}; newNecessary = ["start", "end", "use_axes"]; break;
    case "Circle": newParams = { center: [0,0,0], radius: 1, color: "WHITE", fill_opacity: 0, use_axes: true}; newNecessary = ["center", "radius", "use_axes"]; break;
    case "Rectangle": newParams = { corner_position: [0,0,0], width: 2, height: 1, color: "WHITE", fill_color: "WHITE", fill_opacity: 0, use_axes: true}; newNecessary = ["corner_position", "width", "height", "use_axes"]; break;
    case "Polygon": newParams = { vertices: [[0,0,0], [1,1,0], [1,0,0]], color: "WHITE", stroke_width: 1, fill_color: "WHITE", fill_opacity: 0, use_axes: true}; newNecessary = ["vertices", "use_axes"]; break;
    case "Arrow": newParams = { start: [0,0,0], end: [1,0,0], color: "WHITE", stroke_width: 2, buff: 0.1, use_axes: true}; newNecessary = ["start", "end", "use_axes"]; break;
    case "Brace": newParams = { left_bracket_position: [0,0,0], right_bracket_position: [1,0,0], color: "WHITE", stroke_width: 2, use_axes: true}; newNecessary = ["left_bracket_position", "right_bracket_position", "use_axes"]; break;
    case "Text": newParams = { content: "", position: [0,0,0], font_size: 24, color: "WHITE", use_axes: true}; newNecessary = ["content", "use_axes"]; break;
    case "MathTex": newParams = { formula: "", position: [0,0,0], font_size: 24, color: "WHITE", use_axes: true}; newNecessary = ["formula", "use_axes"]; break;
    case "Axes":
          if (isAxesExist(track.id)) {
            ElMessage.error("已有坐标轴！一个场景中只能有一个坐标轴。");
            selectedItem.value.data.params.chooseType = originalLastType; // Revert
            changeSelectedItemType();
            return;
        }
        newParams = { x_range: [-4,4,1], y_range: [-4,4,1], z_range: [], axis_config: { include_numbers: true, font_size: 24, color: "WHITE" }};
        newNecessary = ["x_range", "y_range"];
        
        // 设置ID和名称都为axisg6hbyyt
        track.id = 'axis'; // 添加这行
        track.name = 'axis';
        
        if(selectedItem.value) {
            selectedItem.value.id = 'axis'; // 添加这行
            selectedItem.value.name = 'axis';
        }
        
        // 更新相关引用
        tracks.value.forEach(t => {
          t.animationClips.forEach(clip => {
            if (clip.params.target_object === track.id) {
              clip.params.target_object = 'axis';
            }
          });
        });
        
        break;
    case "Graph": newParams = { function: "", x_range: [-3,3], color: "WHITE", stroke_width: 2, use_axes: true}; newNecessary = ["function", "x_range", "use_axes"]; break;
    case "ContourPlot": newParams = { function: "", x_range: [-3,3], y_range: [-3,3], levels: 10, use_axes: true}; newNecessary = ["function", "x_range", "y_range", "use_axes"]; break;
    case "Area": newParams = { curve: null, x_range: [], color: "BLUE", opacity: 0.5, use_axes: true}; newNecessary = ["curve", "x_range", "use_axes"]; break;
    case "Grid": newParams = { width: 6, height: 6, line_color: "WHITE"}; newNecessary = ["width", "height"]; break;
    case "Riemann": newParams = { curve: null, x_range: [0.5,1.5], width: 0.1, use_axes: true}; newNecessary = ["curve","x_range","width"]; break;
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
        case "FollowPath": newParams = { curve: null, path_type:"custom", path: [
  [0, 0, 0],
  [1, 1, 0],
  [2, 0, 0],
], t_range:[0,1], rate_func: "linear"}; newNecessary = ["path_type","t_range"]; if(newParams.path_type === 'custom') newNecessary.push("path"); else newNecessary.push("curve"); break;
       case "Rotate": 
            newParams = { angle: 90, about_point: null, rate_func: "linear", use_axes: true }; 
            newNecessary = ["angle", "run_time", "start_time", "use_axes"]; 
            break;

        case "Scale": 
            newParams = { scale_factor: 1, rate_func: "linear" }; 
            newNecessary = ["scale_factor", "run_time", "start_time"]; 
            break;

        case "FadeIn": 
            newParams = { rate_func: "linear" }; 
            newNecessary = ["run_time", "start_time"]; 
            break;

        case "FadeOut": 
            newParams = { rate_func: "linear" }; 
            newNecessary = ["run_time", "start_time"]; 
            break;

        case "SetColor": 
            newParams = { color: "BLUE", rate_func: "linear" }; 
            newNecessary = ["color", "run_time", "start_time"]; 
            break;

        case "Create": 
            newParams = { rate_func: "linear" }; 
            newNecessary = ["run_time", "start_time"]; 
            break;

        case "ApplyMatrix": 
            newParams = { matrix: null, about_point: null, rate_func: "linear", use_axes: true }; 
            newNecessary = ["matrix", "run_time", "start_time", "use_axes"]; 
            break;

        case "Show": 
        // 检查是否可以设置为Show类型（必须是第一个动画块）
          const isFirstClip = track.animationClips.every(c => 
            c.id === clip.id || c.startTime >= clip.startTime);
          
          if (!isFirstClip) {
            ElMessage.error("Show动画只能作为第一个动画块出现");
            // console.log(originalLastType);
            selectedItem.value.data.params.chooseType = originalLastType; // 恢复原类型
            //console.log(selectedItem.data.params.chooseType);
            //changeSelectedItemType();
            // clip.params = { type: tempType, ...newParams, chooseType: originalChooseType, lastType: originalChooseType, necessary: newNecessary };
            // clip.type = tempType;
            // selectAnimationClip(track.id, clip.id);
            
            return;
          }
              // Show动画不需要额外参数，直接设置
             newParams = { rate_func: "linear" }; 
              newNecessary = ["start_time"]; // 只需要开始时间
              // 设置一个极小的持续时间
              if (clip) {
                  clip.duration = 0.1; // 设置为最小可能的持续时间
                  if (selectedItem.value && selectedItem.value.id === clip.id) {
                      selectedItem.value.duration = 0.1;
                  }
              }
            break;
              
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

// 检查时间段是否与轨道上的其他片段重叠
function checkOverlap(trackId, startTime, endTime, excludeClipId = null) {
  const track = tracks.value.find(t => t.id === trackId);
  if (!track) return false;
  
  return track.animationClips.some(clip => {
    // 排除当前正在编辑的片段
    if (clip.id === excludeClipId) return false;
    
    // 检查重叠：新片段的开始时间小于已有片段的结束时间，且新片段的结束时间大于已有片段的开始时间
    return startTime < (clip.startTime + clip.duration) && endTime > clip.startTime;
  });
}

// 复制动画片段
function copyAnimationClip(trackId, clipId) {
  const track = tracks.value.find(t => t.id === trackId);
  if (track) {
    const clip = track.animationClips.find(c => c.id === clipId);
    if (clip) {
      // 深拷贝动画片段数据，避免引用问题
      copiedClip.value = JSON.parse(JSON.stringify(clip));
      isPasteMode.value = true; // 进入粘贴模式
      //ElMessage.success(`已复制动画片段 "${clip.params.type}"，点击轨道任意位置粘贴`);
    }
  }
}
// 获取选中泳道的所有项目
function getSelectedTrackItems() {
  if (!selectedItem.value) return [];
  
  // 确定泳道ID
  const trackId = selectedItem.value.trackId || selectedItem.value.id;
  if (!trackId) return [];
  
  // 从所有项目中筛选出当前泳道的项目
  return timelineItems.value.filter(item => item.group === trackId);
}
// 粘贴动画片段
// 粘贴动画片段
function pasteAnimationClip(trackId, startTime) {
  if (!copiedClip.value) {
    ElMessage.warning("没有可粘贴的动画片段");
    return;
  }
  
  const track = tracks.value.find(t => t.id === trackId);
  if (!track) return;
  
  const clipType = copiedClip.value.params.type;
  const sortedClips = [...track.animationClips].sort((a, b) => a.startTime - b.startTime);
  
  // 1. 获取位置约束信息
  const firstPositionClip = sortedClips.find(clip => 
    clip.params.type === 'Show' || clip.params.type === 'FadeIn');
  
  const lastPositionClip = sortedClips.find(clip => 
    clip.params.type === 'FadeOut' || 
    clip.params.type === 'Transform' || 
    clip.params.type === 'ReplacementTransform');
  
  // 2. 根据动画类型和约束条件，确定允许的放置区域
  let minAllowedTime = 0;
  let maxAllowedTime = Infinity;
  
  if (clipType === 'Show' || clipType === 'FadeIn') {
    // 首位类型：必须是轨道上的第一个动画
    if (firstPositionClip) {
      ElMessage.error(`轨道上已有 ${firstPositionClip.params.type} 动画，不能再添加 ${clipType} 动画`);
      return;
    }
    
    // 检查是否有任何动画在当前选择的位置之前
    if (sortedClips.some(clip => clip.startTime < startTime)) {
      ElMessage.error(`${clipType} 动画必须是轨道上的第一个动画，不能在其他动画之后`);
      return;
    }
    
    // 用户选择的位置可以保留，只需设置最大允许时间
    maxAllowedTime = sortedClips.length > 0 ? 
      sortedClips.find(clip => clip.startTime > startTime)?.startTime || Infinity : 
      Infinity;
  } 
  else if (clipType === 'FadeOut' || clipType === 'Transform' || clipType === 'ReplacementTransform') {
    // 末位类型：必须放在所有动画之后
    if (lastPositionClip) {
      ElMessage.error(`轨道上已有 ${lastPositionClip.params.type} 动画，不能再添加 ${clipType} 动画`);
      return;
    }
    
    // 确保当前没有任何动画在粘贴位置之后
    const hasAnimationAfter = sortedClips.some(clip => clip.startTime > startTime);
    if (hasAnimationAfter) {
      ElMessage.error(`${clipType} 动画必须是最后一个动画块`);
      return;
    }
    
    if (sortedClips.length > 0) {
      const lastClip = sortedClips[sortedClips.length - 1];
      minAllowedTime = lastClip.startTime + lastClip.duration;
    }
  }
  else {
    // 普通类型：必须在首位类型之后，末位类型之前
    if (firstPositionClip) {
      minAllowedTime = firstPositionClip.startTime + firstPositionClip.duration;
    }
    
    if (lastPositionClip) {
      maxAllowedTime = lastPositionClip.startTime;
    }
    
    // 检查是否尝试在Show/FadeIn之前放置
    if (sortedClips.some(clip => 
      (clip.params.type === 'Show' || clip.params.type === 'FadeIn') && 
      clip.startTime > startTime)) {
      ElMessage.error("不能在 Show 或 FadeIn 动画之前插入其他动画");
      return;
    }
    
    // 检查是否尝试在FadeOut/Transform/ReplacementTransform之后放置
    if (sortedClips.some(clip => 
      (clip.params.type === 'FadeOut' || 
       clip.params.type === 'Transform' || 
       clip.params.type === 'ReplacementTransform') &&
      clip.startTime < startTime)) {
      ElMessage.error("不能在 FadeOut、Transform 或 ReplacementTransform 动画之后添加其他动画");
      return;
    }
  }
  
  // 3. 检查初始放置位置是否符合约束
  if (startTime < minAllowedTime) {
    startTime = minAllowedTime;
  }
  
  if (startTime + copiedClip.value.duration > maxAllowedTime) {
    if (clipType === 'Show' || clipType === 'FadeIn') {
      ElMessage.error(`${clipType} 动画放置后会与后续动画重叠，无法放置`);
      return;
    } else if (clipType === 'FadeOut' || clipType === 'Transform' || clipType === 'ReplacementTransform') {
      // 可以放置在所有动画之后
      startTime = minAllowedTime;
    } else {
      ElMessage.error(`没有足够空间放置该动画，最大允许位置为 ${maxAllowedTime.toFixed(1)}s`);
      return;
    }
  }
  
  // 4. 在约束范围内查找不重叠的位置
  const newStartTime = startTime;
  const newEndTime = newStartTime + copiedClip.value.duration;
  
  if (checkOverlap(trackId, newStartTime, newEndTime)) {
    // 寻找最接近鼠标点击位置的空闲区域
    const neededSpace = copiedClip.value.duration;
    let bestPosition = null;
    let minDistance = Infinity;
    
    // 添加轨道的起始位置作为可能的位置
    if (minAllowedTime + neededSpace <= (sortedClips[0]?.startTime || Infinity)) {
      bestPosition = minAllowedTime;
      minDistance = Math.abs(startTime - minAllowedTime);
      const tmp = Math.abs(startTime - (sortedClips[0]?.startTime - copiedClip.value.duration));
      if (tmp < minDistance) {
        bestPosition = (sortedClips[0]?.startTime - copiedClip.value.duration);
        minDistance = tmp;
      }
    }
    
    // 检查每个片段之间的空隙
    for (let i = 0; i < sortedClips.length - 1; i++) {
      const gapStart = sortedClips[i].startTime + sortedClips[i].duration;
      const gapEnd = sortedClips[i + 1].startTime;
      const gapSize = gapEnd - gapStart;
      
      // 跳过约束范围外的空隙
      if (gapStart < minAllowedTime || gapEnd > maxAllowedTime) continue;
      
      if (gapSize >= neededSpace) {
        const distance = Math.abs(startTime - (gapEnd - copiedClip.value.duration));
        if (distance < minDistance) {
          minDistance = distance;
          bestPosition = gapEnd - copiedClip.value.duration;
          
        }
        const distance2 = Math.abs(newStartTime - gapStart);
        if (distance2 < minDistance) {
          minDistance = distance2;
          bestPosition = gapStart;
        }
      }
    }
    
    // 检查最后一个片段之后的空间
    if (sortedClips.length > 0) {
      const lastClip = sortedClips[sortedClips.length - 1];
      const afterLastClip = lastClip.startTime + lastClip.duration;
      
      if (afterLastClip >= minAllowedTime && afterLastClip + neededSpace <= maxAllowedTime) {
        const distance = Math.abs(startTime - afterLastClip);
        if (distance < minDistance) {
          minDistance = distance;
          bestPosition = afterLastClip;
        }
        
      }
    }
    if (bestPosition !== null) {
      ElMessage.warning(`在时间点 ${newStartTime.toFixed(1)}s 处已有片段，将放置在 ${bestPosition.toFixed(1)}s 处`);
      startTime = bestPosition;
    } else {
      ElMessage.error(`没有足够的空间放置该动画`);
      return;
    }
  }
  
  // 5. 创建并添加新动画块
   let newClipId;
  do {
    newClipId = `clip_${clipIdCounter++}`;
  } while (isIdExists(newClipId));
  
  const newClip = {
    id: newClipId,
    type: clipType,
    params: JSON.parse(JSON.stringify(copiedClip.value.params)),
    startTime: startTime,
    duration: copiedClip.value.duration
  };
  track.animationClips.push(newClip);
  track.animationClips.sort((a, b) => a.startTime - b.startTime);
  
  selectAnimationClip(trackId, newClipId);
  updateTotalDuration();
  
  ElMessage.success(`已粘贴动画片段 "${newClip.params.type}"`);
  isPasteMode.value = false; // 粘贴完成后退出粘贴模式
}

// --- Clip and Track Management ---
function addNewAnimationClipToTrack({ trackId, dropTime }) {
  const track = tracks.value.find(t => t.id === trackId);
  if (!track) return;
  
  const newStartTime = dropTime || 0;
  const newEndTime = newStartTime + 1; // 默认持续时间为1秒
  const defaultAnimParams = {
    type: "MoveTo",
    chooseType: "MoveTo",
    lastType: "MoveTo",
    target: [1, 1, 0],
    rate_func: "linear",
    use_axes: true,
    necessary: ["target", "use_axes"],
  };
  
  const clipType = defaultAnimParams.type;
  const sortedClips = [...track.animationClips].sort((a, b) => a.startTime - b.startTime);
  
  // 1. 获取位置约束信息
  const firstPositionClip = sortedClips.find(clip => 
    clip.params.type === 'Show' || clip.params.type === 'FadeIn');
  
  const lastPositionClip = sortedClips.find(clip => 
    clip.params.type === 'FadeOut' || 
    clip.params.type === 'Transform' || 
    clip.params.type === 'ReplacementTransform');
  
  // 2. 确定允许的放置区域
  let minAllowedTime = 0;
  let maxAllowedTime = Infinity;
  
  // 普通类型：必须在首位类型之后，末位类型之前
  if (firstPositionClip) {
    minAllowedTime = firstPositionClip.startTime + firstPositionClip.duration;
  }
  
  if (lastPositionClip) {
    maxAllowedTime = lastPositionClip.startTime;
  }
  
  // 检查是否尝试在Show/FadeIn之前放置
  if (sortedClips.some(clip => 
    (clip.params.type === 'Show' || clip.params.type === 'FadeIn') && 
    clip.startTime > newStartTime)) {
    ElMessage.error("不能在 Show 或 FadeIn 动画之前添加动画");
    return;
  }
  
  // 检查是否尝试在FadeOut/Transform/ReplacementTransform之后放置
  if (sortedClips.some(clip => 
    (clip.params.type === 'FadeOut' || 
     clip.params.type === 'Transform' || 
     clip.params.type === 'ReplacementTransform') &&
    clip.startTime < newStartTime)) {
    ElMessage.error("不能在 FadeOut、Transform 或 ReplacementTransform 动画之后添加动画");
    return;
  }
  
  // 3. 检查初始放置位置是否符合约束
  if (newStartTime < minAllowedTime) {
    dropTime = minAllowedTime;
  }
  
  if (newStartTime + 1 > maxAllowedTime) {
    ElMessage.error(`没有足够空间放置该动画，最大允许位置为 ${maxAllowedTime.toFixed(1)}s`);
    return;
  }
  
  // 4. 在约束范围内查找不重叠的位置
  if (checkOverlap(trackId, newStartTime, newEndTime)) {
    // 寻找最接近鼠标点击位置的空闲区域
    const neededSpace = 1; // 默认持续时间为1秒
    let bestPosition = null;
    let minDistance = Infinity;
    
    // 添加轨道的起始位置作为可能的位置
    if (minAllowedTime + neededSpace <= (sortedClips[0]?.startTime || Infinity)) {
      bestPosition = minAllowedTime;
      minDistance = Math.abs(newStartTime - minAllowedTime);
      const tmp = Math.abs(newStartTime - (sortedClips[0]?.startTime - neededSpace));
      if (tmp < minDistance) {   
        bestPosition = (sortedClips[0]?.startTime - neededSpace);
        minDistance = tmp;
      }
    }
    
    // 检查每个片段之间的空隙
    for (let i = 0; i < sortedClips.length - 1; i++) {
      const gapStart = sortedClips[i].startTime + sortedClips[i].duration;
      const gapEnd = sortedClips[i + 1].startTime;
      const gapSize = gapEnd - gapStart;
      
      // 跳过约束范围外的空隙
      if (gapStart < minAllowedTime || gapEnd > maxAllowedTime) continue;
      
      if (gapSize >= neededSpace) {
        const distance = Math.abs(newStartTime - (gapEnd - neededSpace));
        if (distance < minDistance) {
          minDistance = distance;
          bestPosition = (gapEnd - neededSpace);
        }
        const distance2 = Math.abs(newStartTime - gapStart);
        if (distance2 < minDistance) {
          minDistance = distance2;
          bestPosition = gapStart;
        }
      }
    }
    
    // 检查最后一个片段之后的空间
    if (sortedClips.length > 0) {
      const lastClip = sortedClips[sortedClips.length - 1];
      const afterLastClip = lastClip.startTime + lastClip.duration;
      
      if (afterLastClip >= minAllowedTime && afterLastClip + neededSpace <= maxAllowedTime) {
        const distance = Math.abs(newStartTime - afterLastClip);
        if (distance < minDistance) {
          minDistance = distance;
          bestPosition = afterLastClip;
        }
      }
    }
    
    if (bestPosition !== null) {
      ElMessage.warning(`在时间点 ${newStartTime.toFixed(1)}s 处已有片段，将放置在 ${bestPosition.toFixed(1)}s 处`);
      dropTime = bestPosition;
    } else {
      ElMessage.error(`在满足位置约束的条件下，没有足够的空间放置该动画`);
      return;
    }
  }
  
  // 5. 创建并添加新动画块
  let newClipId;
  do {
    newClipId = `clip_${clipIdCounter++}`;
  } while (isIdExists(newClipId));
  
  const newClip = {
    id: newClipId,
    type: defaultAnimParams.type,
    params: defaultAnimParams,
    startTime: dropTime,
    duration: 1 // 默认持续时间
  };
  
  track.animationClips.push(newClip);
  track.animationClips.sort((a, b) => a.startTime - b.startTime);
  
  selectAnimationClip(trackId, newClipId);
  updateTotalDuration();
}

function updateAnimationClipTime({ trackId, clipId, startTime, duration }) {
  const track = tracks.value.find(t => t.id === trackId);
  if (track) {
    // 检查是否会重叠
    if (checkOverlap(trackId, startTime, startTime + duration, clipId)) {
      // ElMessage.warning("与其他片段时间重叠，无法更新时间");
      // 恢复原始状态
      const clip = track.animationClips.find(c => c.id === clipId);
      if (clip && selectedItem.value && selectedItem.value.id === clipId) {
        selectedItem.value.startTime = clip.startTime;
        selectedItem.value.duration = clip.duration;
      }
      return;
    }
    const clip = track.animationClips.find(c => c.id === clipId);
    if (clip) {
      // Show类型只能移动位置，不能改变持续时间
      if (clip.params && clip.params.type === 'Show') {
        clip.startTime = Math.max(0, startTime);
        // 保持持续时间不变
      }
      else{
        // 对于其他类型，更新开始时间和持续时间
        clip.startTime = Math.max(0, startTime);
        clip.duration = Math.max(0.1, duration); // 确保持续时间至少为0.1秒
      }
      // clip.startTime = Math.max(0, startTime);
      // clip.duration = Math.max(0.1, duration);
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

// 检查轨道ID是否已存在
function isTrackIdExists(id) {
  return tracks.value.some(track => track.id === id);
}

// 生成唯一的轨道ID
function generateUniqueTrackId(prefix = 'track_') {
  let newId;
  do {
    newId = `${prefix}${trackIdCounter++}`;
  } while (isIdExists(newId));
  return newId;
}

// 复制轨道函数
function copyTrack(trackId) {
  const track = tracks.value.find(t => t.id === trackId);
  if (track) {
    // 深拷贝轨道数据，避免引用问题
    copiedTrack.value = JSON.parse(JSON.stringify(track));
    ElMessage.success(`已复制轨道 "${track.id}"`);
  }
}
// 检查ID是否已存在于轨道或动画块中
function isIdExists(id) {
  // 检查轨道ID
  if (tracks.value.some(track => track.id === id)) {
    return true;
  }
  
  // 检查所有动画块ID
  for (const track of tracks.value) {
    if (track.animationClips.some(clip => clip.id === id)) {
      return true;
    }
  }
  
  return false;
}

// 更新动画块ID
function updateClipId() {
  if (!selectedItem.value || selectedItem.value.itemType !== 'clip') {
    return;
  }
   const track = tracks.value.find(t => t.id === selectedItem.value.trackId);
  if (!track) return;
  
  // 修改查找逻辑，精确匹配当前选中的动画块
  // 首先尝试用oldId查找（如果有），否则用当前id查找
  const clipIndex = selectedItem.value.oldId 
    ? track.animationClips.findIndex(c => c.id === selectedItem.value.oldId)
    : track.animationClips.findIndex(c => c.id === selectedItem.value.id);
  
  if (clipIndex === -1) return; // 没找到对应的动画块
  
  const clip = track.animationClips[clipIndex];
  const oldId = clip.id;
  const newId = selectedItem.value.id;
  
  // 如果ID没有改变，不做任何处理
  if (oldId === newId) return;
  
  
  // 检查新ID是否有效（不为空且不含空格）
  if (!newId || newId.trim() === '' || newId.includes(' ')) {
    ElMessage.error('ID不能为空或包含空格');
    selectedItem.value.id = oldId; // 恢复原ID
    return;
  }
  
  // 检查新ID是否已存在
  if (isIdExists(newId)) {
    ElMessage.error(`ID "${newId}" 已存在于轨道或动画块中，请使用唯一ID`);
    selectedItem.value.id = oldId; // 恢复原ID
    return;
  }
  
  // 保存旧ID用于更新引用
  selectedItem.value.oldId = oldId;
  
  // 更新动画块ID
  clip.id = newId;
  
  // 更新可能引用了该ID的其他动画块
  tracks.value.forEach(t => {
    t.animationClips.forEach(c => {
      if (c.params.target_object === oldId) {
        c.params.target_object = newId;
      }
    });
  });
  // 关键修复1: 强制触发Vue的响应式更新
  tracks.value = [...tracks.value];
  
  // 关键修复2: 刷新时间线组件状态
  nextTick(() => {
    // 如果开启了缩略图，刷新缩略图视图
    if (showTimelineMap.value) {
      showTimelineMap.value = false;
      nextTick(() => {
        showTimelineMap.value = true;
      });
    }
    
    // 重新选中该动画块，确保UI正确更新
    selectAnimationClip(track.id, newId);
  });
  ElMessage.success(`动画块ID已从 "${oldId}" 更新为 "${newId}"`);
}


function updateIdCounters() {
  // 更新轨道ID计数器
  tracks.value.forEach(track => {
    const match = track.id.match(/track_(\d+)/);
    if (match && match[1]) {
      const idNum = parseInt(match[1]);
      trackIdCounter = Math.max(trackIdCounter, idNum + 1);
    }
    
    // 更新片段ID计数器
    track.animationClips.forEach(clip => {
      const match = clip.id.match(/clip_(\d+)/);
      if (match && match[1]) {
        const idNum = parseInt(match[1]);
        clipIdCounter = Math.max(clipIdCounter, idNum + 1);
      }
    });
  });
}

// 粘贴轨道函数
function pasteTrack() {
  if (!copiedTrack.value) {
    ElMessage.warning("没有可粘贴的轨道数据");
    return;
  }
  
  // 创建新的轨道ID
  let newTrackId;
  do {
    newTrackId = `track_${trackIdCounter++}`;
  } while (isIdExists(newTrackId));
  
  // 创建新轨道对象，基于复制的数据
  const newTrack = {
    id: newTrackId,
    name: `${copiedTrack.value.id} 副本`,
    generateBlockType: copiedTrack.value.generateBlockType,
    generateBlockParams: JSON.parse(JSON.stringify(copiedTrack.value.generateBlockParams)),
    animationClips: []
  };
  
  // 对于坐标轴类型的特殊处理
  if (newTrack.generateBlockParams.type === 'Axes') {
    if (isAxesExist()) {
      ElMessage.error("已有坐标轴！一个场景中只能有一个坐标轴。");
      return;
    }
    newTrack.name = 'axis'; // 确保坐标轴名称为axis
    newTrack.id = 'axis';
  }
  
  // 复制所有动画片段，为每个片段分配新ID
  copiedTrack.value.animationClips.forEach(clip => {
    let newClipId;
    do {
      newClipId = `clip_${clipIdCounter++}`;
    } while (isIdExists(newClipId));
    newTrack.animationClips.push({
      id: newClipId,
      type: clip.type,
      params: JSON.parse(JSON.stringify(clip.params)),
      startTime: clip.startTime,
      duration: clip.duration
    });
  });
  
  // 添加新轨道
  tracks.value.push(newTrack);
  
  // 选中新轨道
  selectTrack(newTrackId);
  
  // 更新时间轴
  updateTotalDuration();
  
  ElMessage.success(`已粘贴轨道为 "${newTrack.id}"`);
}

function confirmDeleteTrack(trackId) {
  ElMessageBox.confirm(
    '确定要删除这个泳道吗？这将同时删除所有相关的动画片段。',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    deleteTrack(trackId);
    ElMessage({
      type: 'success',
      message: '删除成功'
    });
  }).catch(() => {
    // 用户取消删除
  });
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

// 添加timelineRef和当前视口状态
const timelineRef = ref(null);
const currentViewport = ref({ start: 0, end: timelineViewport.value.max });

// 左移右移函数
function moveLeft() {
  if (!timelineRef.value) return;
  const viewportSize = currentViewport.value.end - currentViewport.value.start;
  const moveAmount = viewportSize * 0.2;
  timelineRef.value.setViewport(
    Math.max(0, currentViewport.value.start - moveAmount),
    Math.max(viewportSize, currentViewport.value.end - moveAmount)
  );
}

function moveRight() {
  if (!timelineRef.value) return;
  const viewportSize = currentViewport.value.end - currentViewport.value.start;
  const moveAmount = viewportSize * 0.2;
  timelineRef.value.setViewport(
    Math.min(timelineViewport.value.max - viewportSize, currentViewport.value.start + moveAmount),
    Math.min(timelineViewport.value.max, currentViewport.value.end + moveAmount)
  );
}

// 缩放函数 - 放大（缩小视口范围）
function zoomIn() {
  if (!timelineRef.value) return;
  const viewportSize = currentViewport.value.end - currentViewport.value.start;
  const center = (currentViewport.value.start + currentViewport.value.end) / 2;
  const newSize = viewportSize * 0.8; // 缩小视口范围到80%
  
  // 确保不会缩放太小
  if (newSize < 1000) return; // 最小1秒
  
  timelineRef.value.setViewport(
    center - newSize / 2,
    center + newSize / 2
  );
}

// 在script部分添加这个辅助函数
function isShowAnimation(item) {
  if (!item) return false;
  const track = tracks.value.find(t => t.id === item.group);
  if (!track) return false;
  const clip = track.animationClips.find(c => c.id === item.id);
  //console.log(clip.params.type);
  return clip && clip.params && clip.params.type === 'Show';
}

// 缩放函数 - 缩小（扩大视口范围）
function zoomOut() {
  if (!timelineRef.value) return;
  const viewportSize = currentViewport.value.end - currentViewport.value.start;
  const center = (currentViewport.value.start + currentViewport.value.end) / 2;
  const newSize = viewportSize * 1.2; // 扩大视口范围到120%
  
  // 确保不会超出最大范围
  const maxEnd = Math.min(timelineViewport.value.max, center + newSize / 2);
  const maxStart = Math.max(0, center - newSize / 2);
  
  timelineRef.value.setViewport(maxStart, maxEnd);
}
function updateTotalDuration() {
  if (!autoFitViewport.value) {
    return; 
  }
    let maxTime = 9; // Minimum duration
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
    totalDuration.value = Math.ceil(maxTime + 2); // Add some buffer
    
}


// --- Data Transformation for Backend ---
function collectGraphData() {
  const manimNodes = [];
  const manimEdges = [];

  tracks.value.forEach(track => {
    // 1. 创建元素块节点
    const generateNode = {
      id: track.id,
      blockType: track.generateBlockParams.type === 'Wait' ? 'function' : 'generate',
      data: {
        params: { ...track.generateBlockParams }
      },
    };
    
    // 移除辅助字段
     //delete generateNode.data.params.chooseType;
     //delete generateNode.data.params.lastType;
     //delete generateNode.data.params.necessary;
    
    // Wait类型特殊处理
    if (track.generateBlockParams.type === 'Wait' && track.generateBlockParams.params) {
        generateNode.data.params = {
            type: 'Wait',
            start_time: track.generateBlockParams.params.start_time,
            duration: track.generateBlockParams.params.duration,
        };
    }

    if (generateNode.data.params.type === "Axes" && !generateNode.data.params.z_range) {
        delete generateNode.data.params.z_range;
    }
    manimNodes.push(generateNode);

    // 2. 创建动画块节点和连接边
    let lastClipId = null;
    track.animationClips.forEach((clip, index) => {
      const animationNode = {
        id: clip.id,
        blockType: 'animation',
        data: {
          params: {
            ...clip.params,
            run_time: clip.duration, // 重要：将duration转换为run_time
            start_time: clip.startTime,
          }
        },
      };
       //delete animationNode.data.params.chooseType;
       //delete animationNode.data.params.lastType;
       //delete animationNode.data.params.necessary;
      manimNodes.push(animationNode);

      // 创建连接边
      if (index === 0) { // 第一个片段连接到轨道的元素块
        manimEdges.push({ source: track.id, target: clip.id });
      } else if (lastClipId) { // 后续片段连接到前一个片段
        manimEdges.push({ source: lastClipId, target: clip.id });
      }
      lastClipId = clip.id;
    });
  });
  // 特殊处理 Transform 和 ReplacementTransform 的 target_object
  // manimEdges.forEach(edge => {
  //   const targetNode = manimNodes.find(n => n.id === edge.target);
  //   const sourceNode = manimNodes.find(n => n.id === edge.source);
    
  //   if (targetNode && targetNode.data.params.type === 'Transform' || 
  //       targetNode.data.params.type === 'ReplacementTransform') {
  //     targetNode.data.params.target_object = sourceNode.id;
  //   }
  // });
  const finalGraphData = { nodes: manimNodes, edges: manimEdges };
  console.log("发送给后端的数据结构:", JSON.parse(JSON.stringify(finalGraphData)));
  return finalGraphData;
}


// --- Backend Interaction (largely same as Main.vue, uses collectGraphData) ---
const fullscreenLoading = ref(false);
const videoSource = ref(""); // For preview, if used

function sendGraphDataToBackend() {
  var res = checkNecessary();
  if(res !== true) {
    ElMessage.error(res);
    return;
  }
  
  fullscreenLoading.value = true;
  const graphData = collectGraphData();
  var promise = PostVideo(graphData);
  promise.then((result) => {
    videoSource.value = result.video_url;
    ElMessage.success("预览视频已生成");
  })
  .finally(() => {
    fullscreenLoading.value = false;
  });
}
const downloadDialog = ref(false);
const quality = ref("4k");
const frame_rate = ref(60);
const videoType = [ { value: "480p", label: "480p" }, { value: "1080p", label: "1080p" }, { value: "4k", label: "4k" }, ];
const fpsType = [ { value: 30, label: "30" }, { value: 60, label: "60" }, ];

function toggleAutoFitViewport(value) {
  if (value) {
    updateTotalDuration(); // 确保在开启时更新总时长
    ElMessage.success('已开启自动适配视图');
  } else {
    ElMessage.info('已关闭自动适配视图');
  }
}



function downloadAnim() {
  var res = checkNecessary();
  if(res !== true) {
    ElMessage.error(res);
    return;
  }
  
  downloadDialog.value = false;
  fullscreenLoading.value = true;
  const graphData = collectGraphData();
  var promise = DownloadVideo({
    projectName: "project_name",
    quality: quality.value,
    frame_rate: frame_rate.value,
    nodes: graphData.nodes,
    edges: graphData.edges
  });
  promise.then((result) => {
    ElMessage.success(`导出成功！视频位于 ${result.video_path}`);
  })
  .finally(() => {
    fullscreenLoading.value = false;
  });
}

function handleDownloadClick() {
  var res = checkNecessary();
  if(res !== true) {
    ElMessage.error(res);
    return;
  }
  
  fullscreenLoading.value = true;
  const graphData = collectGraphData();
  var promise = DownloadVideo({
    projectName: "project_name",
    // quality 和 frame_rate 参数已被移除
    nodes: graphData.nodes,
    edges: graphData.edges
  });
  promise.then((result) => {
    ElMessage.success(`导出成功！视频位于 ${result.video_path}`);
  })
  .finally(() => {
    fullscreenLoading.value = false;
  });
}
// --- Project Save/Load ---
const saveDialog = ref(false);
const projectName = ref(null);
const loadDialog = ref(false);
const projectList = ref(); // Renamed from project to avoid conflict

function saveProject() {
  if(projectName.value && projectName.value.length > 0) {
    const graphData = collectGraphData(); // 获取转换后的nodes和edges
    var promise = PostProject({
      projectName: projectName.value,
      nodes: graphData.nodes,
      edges: graphData.edges
    });
    promise.then((result) => {
      if(result.status === 200) {
        ElMessage.success("暂存成功！");
        saveDialog.value = false;
        projectName.value = "";
      }
      else if(result.status === 400) {
        ElMessage.error("项目名称不可重复！请更改名称！");
      }
    });
  }
  else {
    ElMessage.error("项目名称不可为空！");
  }
}
function loadProject() {
  loadDialog.value = true;
  var promise = GetProject();
  promise.then((result) => {
    projectList.value = result;
  });
}

function loadSavedProject(index) {
  // 直接使用后端返回的数据，保持结构一致性
  const projectToLoad = projectList.value[index];
  
  // 检查项目数据是否有效
  if (projectToLoad && projectToLoad.nodes && projectToLoad.edges) {
    // 需要将nodes和edges转换为tracks结构
    convertOldProjectToTracks(projectToLoad.nodes, projectToLoad.edges);
    
    // 提示成功
    ElMessage.success(`项目 "${projectToLoad.projectName}" 加载成功!`);
  } else {
    ElMessage.error("项目数据格式不正确，无法加载。");
  }
  
  loadDialog.value = false;
}
function convertOldProjectToTracks(oldNodes2, oldEdges) {
  // --- 新增：预处理节点，确保 chooseType 存在 ---
  const processedNodes = oldNodes2.map(node => {
    if (node.data && node.data.params && node.data.params.type && !node.data.params.chooseType) {
      // 创建一个节点的深拷贝以避免直接修改原始数据
      const newNode = JSON.parse(JSON.stringify(node));
      newNode.data.params.chooseType = generateChooseTypeFromType(newNode.data.params.type);
      // 同时，为了保险起见，也添加 lastType
      newNode.data.params.lastType = newNode.data.params.chooseType;
      return newNode;
    }
    return node; // 如果已有 chooseType 或数据不完整，则返回原节点
  });
  // --- 预处理结束 ---
  // 清空当前轨道
   tracks.value = [];
  
  // 复位ID计数器
  trackIdCounter = 0;
  clipIdCounter = 0;

  
  const oldNodes = processedNodes.map(node => {
    if (node.blockType === 'animation' && node.data?.params?.type === 'Show') {
      // 创建深拷贝以避免修改原始数据
      const newNode = JSON.parse(JSON.stringify(node));
      newNode.data.params.run_time = 0.1;
      return newNode;
    }
    return node;
  });
  
  
  // 1. 找出所有元素块节点(generate和function类型，且没有前置节点的)
  // 注意：这里假设主节点是没有其他节点指向它的节点
  const elementNodes = oldNodes.filter(node => 
    (node.blockType === 'generate' || 
     (node.blockType === 'function' && node.data.params.type === 'Wait')) &&
    !oldEdges.some(edge => edge.target === node.id)
  );
  
  // 2. 为每个元素块创建一个泳道
  elementNodes.forEach(elementNode => {
    const trackId = elementNode.id;
    const trackName = elementNode.id;
    const isWaitTrack = elementNode.blockType === 'function' && elementNode.data.params.type === 'Wait';
    
    // 创建新泳道
    const track = {
      id: trackId,
      name: trackName || trackId,
      generateBlockType: elementNode.data.params.type,
      generateBlockParams: { ...elementNode.data.params },
      animationClips: []
    };
    
    // 确保坐标轴ID保持为axis
    if (track.generateBlockParams.type === 'Axes') {
      track.id = 'axis';
      track.name = 'axis';
    }
    
    // 更新trackIdCounter，确保后续ID不重复
    const match = trackId.match(/track_(\d+)/);
    if (match && match[1]) {
      trackIdCounter = Math.max(trackIdCounter, parseInt(match[1]) + 1);
    }
    
    // 3. 找出所有连接到这个元素块的动画块（通过边构建连接图）
    let animationSequence = [];
    let currentNodeId = trackId;
    
    // 使用BFS查找所有连接的动画块
    while (true) {
      // 查找从当前节点出发的边
      const nextEdge = oldEdges.find(edge => edge.source === currentNodeId);
      if (!nextEdge) break; // 没有后续节点
      
      // 找到这条边连接的目标节点
      const nextNode = oldNodes.find(n => n.id === nextEdge.target);
      if (!nextNode || nextNode.blockType !== 'animation') break; // 不是动画块
      
      // 加入序列
      animationSequence.push(nextNode);
      currentNodeId = nextNode.id; // 继续查找下一个节点
    }
    
    // 4. 将动画序列转换为片段，添加到泳道
    animationSequence.forEach(animNode => {
      // 创建时间轴片段
      const clip = {
        id: animNode.id,
        type: animNode.data.params.type,
        startTime: parseFloat(animNode.data.params.start_time) || 0,
        duration: animNode.data.params.type === 'Wait' 
          ? parseFloat(animNode.data.params.duration) || 1 
          : parseFloat(animNode.data.params.run_time) || 1,
        params: { ...animNode.data.params }
      };
      
      // 更新clipIdCounter，确保后续ID不重复
      const clipMatch = animNode.id.match(/clip_(\d+)/);
      if (clipMatch && clipMatch[1]) {
        clipIdCounter = Math.max(clipIdCounter, parseInt(clipMatch[1]) + 1);
      }
      
      track.animationClips.push(clip);
    });
    
    // 5. 处理目标对象引用
    // 对于Transform和ReplacementTransform类型的动画块，检查target_object属性
    track.animationClips.forEach(clip => {
      if ((clip.params.type === 'Transform' || clip.params.type === 'ReplacementTransform') && 
          clip.params.target_object) {
        // 暂不修改target_object，保持对原始节点ID的引用
      }
      
      // 对于FollowPath类型的动画块，检查curve属性
      if (clip.params.type === 'FollowPath' && clip.params.path_type === 'graph' && 
          clip.params.curve) {
        // 保持对原始曲线节点ID的引用
      }
      
      // 对于Area类型的动画块，检查curve属性
      if (clip.params.type === 'Area' && clip.params.curve) {
        // 保持对原始曲线节点ID的引用
      }
    });
    
    // 添加到tracks
    tracks.value.push(track);
  });
  
  // 6. 处理孤立的Wait节点
  const waitNodes = oldNodes.filter(node => 
    node.blockType === 'function' && 
    node.data.params.type === 'Wait' &&
    !elementNodes.includes(node)
  );
  
  waitNodes.forEach(waitNode => {
    const trackId = waitNode.id;
    
    // 创建Wait轨道
    const track = {
      id: trackId,
      name: trackId,
      generateBlockType: 'Wait',
      generateBlockParams: {
        type: 'Wait',
        start_time: parseFloat(waitNode.data.params.start_time) || 0,
        duration: parseFloat(waitNode.data.params.duration) || 1,
        necessary: ["start_time", "duration"],
        chooseType: "Wait",
        lastType: "Wait"
      },
      animationClips: []
    };
    
    // 更新trackIdCounter
    const match = trackId.match(/track_(\d+)/);
    if (match && match[1]) {
      trackIdCounter = Math.max(trackIdCounter, parseInt(match[1]) + 1);
    }
    
    tracks.value.push(track);
  });
  
  // 排序轨道，确保坐标轴轨道在最前面
  tracks.value.sort((a, b) => {
    if (a.id === 'axis') return -1;
    if (b.id === 'axis') return 1;
    return 0;
  });
  
  // 更新时间轴
  updateTotalDuration();
  
  // 如果轨道不为空，选中第一个轨道
  if (tracks.value.length > 0) {
    selectTrack(tracks.value[0].id);
  }
  
  // 添加轨道鼠标事件
  // nextTick(() => {
  //   addTrackMouseEvents();
  // });
  
  // 更新视图
  if (showTimelineMap.value) {
    // 刷新缩略图
    showTimelineMap.value = false;
    nextTick(() => {
      showTimelineMap.value = true;
    });
  }
}

const deleteDialog = ref(false);
function openDeleteDialog() {
  var promise = GetProject();
  promise.then((result) => {
    projectList.value = result;
    deleteDialog.value = true;
  });
}

function deleteProject(index) {
  var promise = DeleteProject({
    projectName: projectList.value[index].projectName
  });
  promise.then((result) => {
    ElMessage.success("删除成功！");
    openDeleteDialog(); // 刷新列表
  });
}

// --- Predefined Animations ---
const preDialog = ref(false);
const preLimits = ref([]);
const prePoints = ref([]);

async function loadPredefinedAnimations() {
  try {
    // 加载极限相关的预制动画
    const responseLimit = await fetch('/static/json/limit/fileList.json');
    const filesLimit = await responseLimit.json();
    for (const file of filesLimit) {
      const fileResponse = await fetch(`/static/json/limit/${file}`);
      preLimits.value.push(await fileResponse.json());
    }
    
    // 加载积分相关的预制动画
    const responsePoint = await fetch('/static/json/point/fileList.json');
    const filesPoint = await responsePoint.json();
    for (const file of filesPoint) {
      const fileResponse = await fetch(`/static/json/point/${file}`);
      prePoints.value.push(await fileResponse.json());
    }
  } catch (error) { 
    console.error('加载预制动画 JSON 失败：', error); 
    ElMessage.error('加载预制动画失败，请检查网络连接');
  }
}

function choosePredefinedAnimation(item) {
  // This needs a converter from old nodes/edges format to new tracks format
  // For now, this will likely break or load incorrectly.
  // convertOldProjectToTracks(item.nodes, item.edges);
  console.log("加载预制动画 nodes:", item.nodes);
  console.log("加载预制动画 edges:", item.edges);
  convertOldProjectToTracks(item.nodes, item.edges);
  
  // 更新UI
  ElMessage.success(`已加载预制动画: ${item.name}`);
  preDialog.value = false;
}

// --- AI Chat (assuming same as Main.vue) ---
function openAI(){ window.open(`${window.location.origin}/ai`, '_blank'); }
// ... other AI related functions from Main.vue would go here ...

// --- Validation ---
function checkNecessary() {
  for (const track of tracks.value) {
    const trackParams = track.generateBlockParams;
    //console.log("检查泳道参数:", trackParams);
    if (trackParams.necessary) {
      for (const prop of trackParams.necessary) {
        
        if (trackParams[prop] === undefined || trackParams[prop] === null || (Array.isArray(trackParams[prop]) && trackParams[prop].length === 0) || String(trackParams[prop]).trim() === "") {
          selectTrack(track.id);
          return `泳道 "${track.id}" 的参数 "${prop}" 未填写！`;
        }
      }
    }
    if (track.generateBlockParams.type === 'Wait' && track.generateBlockParams.params) {
        if (track.generateBlockParams.params.duration === undefined || track.generateBlockParams.params.duration === null) {
            selectTrack(track.id);
            return `功能泳道 "${track.id}" 的 "等待时间" 未填写！`;
        }
         if (track.generateBlockParams.params.start_time === undefined || track.generateBlockParams.params.start_time === null) {
            selectTrack(track.id);
            return `功能泳道 "${track.id}" 的 "开始时间" 未填写！`;
        }
    }


    for (const clip of track.animationClips) {
      const clipP = clip.params; // Actual parameters are in clip.params
       //console.log("检查片段参数:", clipP);
       //console.log("检查片段参数2:", clip);
      if (clipP.necessary) {
        for (const prop of clipP.necessary) {
          if (prop === 'start_time' || prop === 'duration' || prop === 'run_time') {
            if (clip.startTime === undefined || clip.startTime === null || clip.duration === undefined || clip.duration === null) {
              selectAnimationClip(track.id, clip.id);
              return `泳道 "${track.id}" 中片段 "${clip.id}" (${clip.type}) 的参数 "${prop}" 未填写！`;
            }
            continue; // 已检查，跳过后续检查
          }
          if (clipP[prop] === undefined || clipP[prop] === null || (Array.isArray(clipP[prop]) && clipP[prop].length === 0) || String(clipP[prop]).trim() === "") {
            selectAnimationClip(track.id, clip.id);
            return `泳道 "${track.id}" 中片段 "${clip.id}" (${clip.type}) 的参数 "${prop}" 未填写！`;
          }
          
          if (prop === 'path' && Array.isArray(clipP.path)) {
            if (clipP.path.some(p => !Array.isArray(p) || p.length === 0)) {
                 selectAnimationClip(track.id, clip.id);
                 return `泳道 "${track.id}" 中片段 "${clip.id}" (${clip.type}) 的路径点对象未完整填写！`;
            }
          }
        }
      }
    }
  }
  return true; // No error
}

/**
 * 新增：根据 type 字符串生成 chooseType 数组
 * @param {string} type - 节点的类型, 例如 "Point" 或 "MoveTo".
 * @returns {Array|string} - 返回对应的 chooseType 数组, 例如 ['basic', 'Point'].
 */
function generateChooseTypeFromType(type) {
  // 元素块的映射关系
  const generateMap = {
    'Point': ['basic', 'Point'], 'Line': ['basic', 'Line'], 'DashedLine': ['basic', 'DashedLine'],
    'Circle': ['basic', 'Circle'], 'Rectangle': ['basic', 'Rectangle'], 'Polygon': ['basic', 'Polygon'],
    'Arrow': ['basic', 'Arrow'], 'Brace': ['basic', 'Brace'], 'Riemann': ['basic', 'Riemann'],
    'Text': ['text', 'Text'], 'MathTex': ['text', 'MathTex'],
    'Axes': ['axis', 'Axes'], 'Graph': ['axis', 'Graph'], 'ContourPlot': ['axis', 'ContourPlot'],
    'Area': ['area', 'Area'], 'Grid': ['area', 'Grid']
  };
  if (generateMap[type]) {
    return generateMap[type];
  }

  // 动画块的映射关系 (通常是单层)
  const animationMap = {
    'MoveTo': ['MoveTo'], 'Rotate': ['Rotate'], 'Scale': ['Scale'], 'FadeIn': ['FadeIn'],
    'FadeOut': ['FadeOut'], 'SetColor': ['SetColor'], 'FollowPath': ['FollowPath'],
    'Transform': ['Transform'], 'ReplacementTransform': ['ReplacementTransform'],
    'Create': ['Create'], 'ApplyMatrix': ['ApplyMatrix'], 'Show': ['Show']
  };
  if (animationMap[type]) {
    return animationMap[type];
  }

  // 功能块
  if (type === 'Wait') {
    return 'Wait';
  }

  // 如果没有找到匹配项，返回原始类型作为备用
  return [type];
}

function deleteClip(trackId, clipId) {
  const track = tracks.value.find(t => t.id === trackId);
  if (track) {
    track.animationClips = track.animationClips.filter(c => c.id !== clipId);
    // 如果当前选中的是被删除的片段，清除选择
    if (selectedItem.value && 
        selectedItem.value.itemType === 'clip' && 
        selectedItem.value.id === clipId) {
      selectedItem.value = null;
    }
    // 更新时间轴总时长
    updateTotalDuration();
  }
}

// --- Lifecycle Hooks ---
onMounted(() => {
  // --- 新增：从 localStorage 加载 AI 生成的数据 ---
  const nodesString = localStorage.getItem('vueflow-nodes');
  const edgesString = localStorage.getItem('vueflow-edges');

  // 检查localStorage中是否有有效数据 (不为null且不是空数组的字符串)
  if (nodesString && nodesString !== '[]' && edgesString) {
    try {
      const nodes = JSON.parse(nodesString);
      const edges = JSON.parse(edgesString);
      
      // 调用现有的转换函数将旧数据结构转换为新的tracks结构
      convertOldProjectToTracks(nodes, edges);
      
      ElMessage.success("已成功从AI生成的数据加载到画布！");
      
      // 清空localStorage，防止刷新页面时重复加载
      localStorage.setItem('vueflow-nodes', JSON.stringify([]));
      localStorage.setItem('vueflow-edges', JSON.stringify([]));
    } catch (error) {
      console.error("从localStorage加载AI数据失败:", error);
      ElMessage.error("加载AI数据失败，数据格式可能已损坏。");
    }
  }
  // --- 新增结束 ---
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
const handleKeyDown = (event) => {
  // 按ESC键退出粘贴模式
  if (event.key === 'Escape' && isPasteMode.value) {
    isPasteMode.value = false;
    ElMessage.info("已取消粘贴模式");
    event.preventDefault();
  }
  
  // Ctrl+C: 复制当前选中的动画块
  if (event.ctrlKey && event.key === 'c') {
    if (selectedItem.value && selectedItem.value.itemType === 'clip') {
      copyAnimationClip(selectedItem.value.trackId, selectedItem.value.id);
      ElMessage.success("已复制动画块，按Ctrl+V粘贴");
      event.preventDefault();
    }
  }
  

};


</script>

<style lang="scss" scoped>
/* Styles from Main.vue, plus new styles for timeline */
.header { align-items: center; justify-content: flex-end; display: flex; height: 10vh; }
.header .button { display: flex; align-items: center; justify-content: center; margin: 1%; color: #909399; background-color: #F5F7FA; border: white; font-size: 15px; font-weight: 500; font-family: 'Microsoft YaHei',arial,tahoma,\5b8b\4f53,sans-serif; }
.header .button :hover { color: black; outline: none; }

.main {
  height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止溢出 */
}
.el-row {
  flex-grow: 1;
  display: flex;
  overflow: hidden; /* 防止溢出 */
}
.program-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden; /* 防止内容溢出到整个页面 */
}
 /* program-area to fill its col */
.animation-panel { background-color: white; border-left: 1px solid #c2c3c5; padding: 10px; overflow-y: auto; height: 100%; }
.node-info h3 { margin-top: 0; }

.swimlane-timeline-editor {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.952);
  border: 2px solid #ccc;
  overflow: hidden; /* 保持hidden，因为我们希望滚动发生在Timeline内部 */
  position: relative;
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


.preBlock { margin: 1%; text-align: center; width: 98%; display: inline-block; }
.preBlock:hover { background-color: rgb(235.9, 245.3, 255); cursor: pointer; }

/* Ensure el-form-item labels are visible */
.el-form-item__label {
  color: #606266;
}


/* Timeline容器样式 */
.timeline-container {
  flex-grow: 1;
  height: calc(100% - 40px);
  width: 100%;
  overflow-y: auto; /* 添加垂直滚动条 */
}

/* 项目内容样式 */


/* 调整大小的手柄 */
.resize-handle {
  position: absolute;
  width: 1.2rem;
  height: 100%;
  cursor: ew-resize;
  opacity: 0.6;
  top: 0;
}

.resize-handle.left {
  left: 0;
}

.resize-handle.right {
  right: 0;
}

.resize-handle::before {
  content: '';
  border-inline: 1px solid white;
  width: 4px;
  height: 40%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  position: absolute;
}

.resize-handle:hover {
  opacity: 1;
}

/* 项目内容样式 - 调整布局 */
.timeline-item-content {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: move;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.8em;
  color: #000;
  font-weight: 500;
}
/* 组标签样式 */
.group-label-content {
  display: flex;
  align-items: center;
  
  gap: 5px;
  width: 100%;
  padding: 0 5px;
}
.header {
  display: flex;
  justify-content: space-between; /* 修改为space-between让左侧和右侧有间隔 */
  align-items: center;
  height: 10vh;
}

.header-panel {
  margin-left: 10px; /* 增加左侧边距 */
}


.track-icon {
  font-size: 14px;
}

// .track-name {
//   flex-grow: 1;
//   white-space: nowrap;
//   overflow: hidden;
//   text-overflow: ellipsis;
// }

:deep(.timeline-group-label) {
  padding: 0 !important;
  height: auto !important;
}

:deep(.timeline-group-content) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

:deep(.timeline) {
  --group-border-top: 1px solid #e0e0e0;
  --group-padding-top: 0;
  --group-padding-bottom: 0;
  --item-border-radius: 4px;
  --item-border: 1px solid rgba(0, 0, 0, 0.1);
  --marker-width: 2px;
  --marker-color: var(--el-color-primary);
}

/* 添加到<style>部分 */
.timeline-container.drag-over-animation {
  outline: 2px dashed var(--el-color-primary);
  outline-offset: -2px;
  background-color: rgba(64, 158, 255, 0.05);
}

.draggable {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: space-between;
    cursor: move;

    .draggable-handle {
      position: relative;
      width: 1.2rem;
      height: 100%;
      cursor: ew-resize;
      opacity: .6;

      &::before {
        content: '';
        border-inline: 1px solid white;
        width: 4px;
        height: 40%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        position: absolute;
      }

      &:hover {
        opacity: 1;
      }
    }
  }
.timeline-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 5px;
  border-radius: 4px;
}

/* 轨道标签悬浮效果 */
.group-label-content {
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;
  padding: 0 5px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
}

.group-label-content:hover {
  background-color: rgba(64, 158, 255, 0.1);
  border-left: 3px solid var(--el-color-primary-light-5);
}

/* 选中状态的样式 */
:deep(.timeline-group.selected) .group-label-content,
.group-label-content.selected {
  background-color: var(--el-color-primary-light-9);
  border-left: 3px solid var(--el-color-primary);
}

/* 添加到style部分 */
:deep(.timeline .marker) {
  contain: unset;
  display: flex;
}

.marker-content {
  font-size: small;
  align-self: start;
  text-wrap: nowrap;
  padding: 0 4px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  opacity: 0.9;
  pointer-events: none;
}
.hover-time-control {
  display: flex;
  align-items: center;
  margin: 1%;
  padding: 0 15px;
}
/* 缩略时间线样式 */
/* 修改缩略时间线整体样式 */
.timeline-map {
  height: 100%;
  width: 100%;
  --group-items-height: 2.45em;
  --group-border-top: 0;
  --label-padding: 0;
  --group-padding-top: 0;
  --group-padding-bottom: 0;
}


/* 修改第一个和最后一个组的内边距，让它们紧贴容器 */
.timeline-map:deep(.group:first-of-type) {
  padding-top: 0;
}

.timeline-map:deep(.group:last-of-type) {
  padding-bottom: 0;
}

/* 修改背景元素，使其占满整个高度 */
.timeline-map:deep(.background) {
  --item-background: rgba(64, 158, 255, 0.2);
  border: 0px solid var(--el-color-primary);
  cursor: pointer;
  z-index: 1;
  height: 100% !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  inset: 0 !important;
}

/* 添加标题提示用户这是缩略视图 */
.left-side-timeline-map::before {
  content: '全局视图';
  position: absolute;
  top: -20px;
  left: 0;
  font-size: 12px;
  color: #666;
}
/* 确保items容器也占满整个高度 */
.timeline-map:deep(.timeline-group-items) {
  height: 100% !important;
}

.main-timeline-wrapper {
  width: 100%;
  height: v-bind('showTimelineMap ? "calc(100% - 80px)" : "100%"');
  overflow: auto;
  
}

.left-side-timeline-map {
  position: absolute;
  bottom: 8px;
  left: 10px;
  width: 98%; /* 适当调整宽度 */
  height: 70px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.main-timeline-wrapper.paste-mode-active {
  cursor: cell;
  outline: 2px dashed var(--el-color-primary);
  outline-offset: -2px;
  background-color: rgba(64, 158, 255, 0.03);
}

.main-timeline-wrapper.paste-mode-active::after {
  content: '点击轨道任意位置粘贴动画块，按Esc退出粘贴模式';
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 255, 255, 0.55);
  padding: 8px 15px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
  font-size: 14px;
  color: var(--el-color-primary);
  font-weight: 500;
  pointer-events: none;
}
.track-order-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.track-order-controls .el-button {
  flex: 1;
}

/* 添加箭头图标样式 */
.el-icon.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.show-animation-item {
  color:white;
}

/* 新增：为左右布局添加过渡动画 */
.transition-col {
  transition: max-width 0.3s ease, flex-basis 0.3s ease;
}

/* 新增：为右侧面板内容添加淡入淡出效果 */
.fade-in-fast-enter-active,
.fade-in-fast-leave-active {
  transition: opacity 0.2s ease;
}

.fade-in-fast-enter-from,
.fade-in-fast-leave-to {
  opacity: 0;
}
</style>