<template>
  <!-- <NavigationBar @pre="preDialog=true" style="height: 10vh;"/> -->
   <div style="background-color:#F5F7FA"  v-loading.fullscreen.lock="fullscreenLoading" element-loading-text="Loading...">
  <div class="header">
    <el-button size="large" class="button" @click="preDialog=true">
      <el-icon size="large">
        <MessageBox />
      </el-icon>&ensp;Animation
    </el-button>
    <el-button size="large" class="button" @click="sendGraphDataToBackend">
      <el-icon size="large">
        <View />
      </el-icon>&ensp;Preview
    </el-button>
    <el-button size="large" class="button" @click="downloadDialog=true">
      <el-icon size="large">
        <Download />
      </el-icon>&ensp;Download
    </el-button>
    <el-button size="large" class="button" @click="saveDialog = true">
      <el-icon size="large">
        <DocumentAdd />
      </el-icon>&ensp;Save Project
    </el-button>
    <el-button size="large" class="button" @click="loadProject()">
      <el-icon size="large">
        <FolderOpened />
      </el-icon>&ensp;Load Project
    </el-button>
    <el-button size="large" class="button" @click="openDeleteDialog()">
      <el-icon size="large">
        <Delete />
      </el-icon>&ensp;Delete Project
    </el-button>
    <el-button size="large" class="button" @click="openAI()">
      <el-icon size="large">
        <Service />
      </el-icon>&ensp;AI
    </el-button>
  </div>
  <div class="main">
    <el-row>
      <el-col :span="programSpan" class="program">
        <VueFlow
          :nodes="nodes"
          :edges="edges"
          :node-types="nodeTypes"
          :nodes-draggable="nodesDraggable"
          :nodes-connectable="nodesConnectable"
          :zoom-on-double-click="zoomOnDoubleClick"
          @dragover="onDragBlockOver"
          @dragleave="onDragBlockLeave"
          @drop="onDrop"
          @nodesChange="handleNodesChange"
          @edges-change="handleEdgesChange"
          @node-click="handleNodeClick"
        >
          <Background
            :style="{backgroundColor: isDragOver ? '#e7f3ff' : 'transparent',transition: 'background-color 0.2s ease',}"
          />
          <!-- <MiniMap pannable zoomable style="margin-bottom: 50%;" /> -->
          <Panel>
            <!-- <div>
              <el-button size="large" circle type="primary" plain link><el-icon :size="22"><Back /></el-icon></el-button>
              <el-button size="large" circle type="primary" plain link><el-icon :size="22"><Right /></el-icon></el-button>
            </div> -->
            <div class="button-block">
              <!-- <div>
                <el-button
                  link
                  size="large"
                  class="button"
                  :draggable="true"
                  @dragstart="onDragBlockStart($event, 'function')"
                >功能块</el-button>
              </div> -->
              <!-- <el-divider style="margin: 0%;" /> -->
              <div class="button">
                <el-tooltip placement="right" effect="light">
                  <template #content>
                    <div>
                      <el-button
                        link
                        size="large"
                        class="button"
                        :draggable="true"
                        @dragstart="onDragBlockStart($event, 'generate')"
                      >元素块</el-button>
                    </div>
                    <div>
                      <el-button
                        link
                        size="large"
                        class="button"
                        :draggable="true"
                        @dragstart="onDragBlockStart($event, 'animation')"
                      >动画块</el-button>
                    </div>
                  </template>
                  <el-button style="border: white;text-align: center;">
                      <el-icon size="20" ><Plus /></el-icon>
                    </el-button>
                </el-tooltip>
              </div>
              <div class="button">
                <el-tooltip content="节点可拖拽" placement="right" effect="light">
                  <el-button :style="nodesDraggable ? enabledStyle : disabledStyle" @click="nodesDraggable=!nodesDraggable">
                    <el-icon size="20"><Pointer /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
              <div class="button">
                <el-tooltip content="节点可连接" placement="right" effect="light">
                  <el-button :style="nodesConnectable ? enabledStyle : disabledStyle" @click="nodesConnectable=!nodesConnectable">
                    <el-icon size="20"><Link /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
              <div class="button">
                <el-tooltip content="双击可放大" placement="right" effect="light">
                  <el-button :style="zoomOnDoubleClick ? enabledStyle : disabledStyle" @click="zoomOnDoubleClick=!zoomOnDoubleClick">
                    <el-icon  size="20"><Search /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
          </Panel>
        </VueFlow>
 
        <!-- 时间轴 -->
        <!-- <div class="ai-block" @click="aiDialog = true;isLoading = true;">
          AI
          聊
          天
        </div> -->
        <div class="time-axis">
          <el-divider content-position="left">时间轴</el-divider>
          <!-- <el-scrollbar max-height="100%"> -->
            <!-- <span v-for="(node,index) in nodes" :key="node.id">
              <div v-if="node.type === 'animation'" class="time-block" @click="selectTimeAxis(node,index)">
                <div style="padding-bottom: 2px;">动画&ensp;{{ node.id }}&ensp;:</div>
                <span class="axis" :style="{
                'background-color': '#D4D7DE',
                width: `${100*parseInt(node.data.params.start_time)/durationSum}%`
                }"></span>
                <span class="axis" :style="{
                'background-color': `${colorArray[index % colorArray.length]}`,
                width: `${100*parseInt(node.data.params.run_time)/durationSum}%`
                }"></span>
                <span class="axis" :style="{
                'background-color': '#D4D7DE',
                width: `${100*(durationSum - parseInt(node.data.params.start_time) - parseInt(node.data.params.run_time))/durationSum}%`
                }"></span>
              </div>
              <div v-else-if="node.data.params.type === 'Wait'" class="time-block" @click="selectTimeAxis(node,index)">
                <div style="padding-bottom: 2px;">功能&ensp;{{ node.id }}&ensp;:</div>
                <span class="axis" :style="{
                'background-color': '#D4D7DE',
                width: `${100*parseInt(node.data.params.start_time)/durationSum}%`
                }"></span>
                <span class="axis" :style="{
                'background-color': `${colorArray[index % colorArray.length]}`,
                width: `${100*parseInt(node.data.params.duration)/durationSum}%`
                }"></span>
                <span class="axis" :style="{
                'background-color': '#D4D7DE',
                width: `${100*(durationSum - parseInt(node.data.params.start_time) - parseInt(node.data.params.duration))/durationSum}%`
                }"></span>
              </div>
            </span> -->
            <div ref="timelineChart" style="width: 100%; height: 70%;"></div>
          <!-- </el-scrollbar> -->
        </div>
      </el-col>

      <!-- 右侧：操作区 -->
      <el-col :span="animationSpan" class="animation">
        <!-- 折叠按钮 -->
        <el-button
          icon="DArrowRight"
          link
          size="large"
          @click="fold"
          :style="{transform: isFold ? 'rotate(180deg)' : 'rotate(0deg)',transition: 'transform 0.2s ease'}"
        ></el-button>

        <!-- 左侧按钮：显示预览/导出 -->
        <!-- <el-button
          v-if="!isFold"
          size="large"
          :type="currentView === 'preview' ? 'primary' : 'default'"
          @click="switchView('preview')"
        >功能</el-button> -->

        <!-- 右侧按钮：显示选中块信息 -->
        <!-- <el-button
          v-if="!isFold"
          size="large"
          :type="currentView === 'info' ? 'primary' : 'default'"
          @click="switchView('info')"
        >块信息</el-button> -->

        <!-- <el-divider /> -->

        <!-- 如果是功能视图 -->
        <!-- <div v-if="currentView === 'preview'"> -->
          <!-- 动画预览 -->
          <!-- <video ref="myVideo" autoplay muted controls :src="videoSource" style="width: 100%;"
          v-loading.fullscreen.lock="preLoading"
          element-loading-text="动画渲染中..."
          >
            您的浏览器不支持视频标签。
          </video>
          <el-divider /> -->
          <!-- 功能按钮 -->
          <!-- <div class="button-block">
            <div>
              <el-button v-if="!isFold" size="large" class="button" @click="sendGraphDataToBackend">预览动画</el-button>
              <el-tooltip v-if="isFold" effect="dark" content="预览动画" placement="left-start">
                <el-button v-if="isFold" size="large" class="button" @click="sendGraphDataToBackend" link>
                  <el-icon>
                    <View />
                  </el-icon>
                </el-button>
              </el-tooltip>
            </div>
            <div v-loading.fullscreen.lock="downloadLoading" element-loading-text="动画导出中...">
              <el-button v-if="!isFold" size="large" class="button" @click="downloadDialog=true">导出动画</el-button>
              <el-tooltip v-if="isFold" effect="dark" content="导出动画" placement="left-start">
                <el-button v-if="isFold" size="large" class="button" link>
                  <el-icon>
                    <Download />
                  </el-icon>
                </el-button>
              </el-tooltip>
            </div>
            <div>
              <el-button v-if="!isFold" size="large" class="button" @click="saveDialog = true">暂存项目</el-button>
              <el-tooltip v-if="isFold" effect="dark" content="暂存项目" placement="left-start">
                <el-button v-if="isFold" size="large" class="button" @click="saveDialog = true" link>
                  <el-icon>
                    <DocumentAdd />
                  </el-icon>
                </el-button>
              </el-tooltip>
            </div>
            <div>
              <el-button v-if="!isFold" size="large" class="button" @click="loadProject()">加载项目</el-button>
              <el-tooltip v-if="isFold" effect="dark" content="加载项目" placement="left-start">
                <el-button v-if="isFold" size="large" class="button" @click="loadProject()" link>
                  <el-icon>
                    <FolderOpened />
                  </el-icon>
                </el-button>
              </el-tooltip>
            </div>
            <div>
              <el-button v-if="!isFold" size="large" class="button" @click="openDeleteDialog()">删除项目</el-button>
              <el-tooltip v-if="isFold" effect="dark" content="删除项目" placement="left-start">
                <el-button v-if="isFold" size="large" class="button" @click="openDeleteDialog()" link>
                  <el-icon>
                    <Delete />
                  </el-icon>
                </el-button>
              </el-tooltip>
            </div>
            <div>
              <el-button v-if="!isFold" size="large" class="button" @click="getAiHistory()">AI聊天</el-button>
              <el-tooltip v-if="isFold" effect="dark" content="AI聊天" placement="left-start">
                <el-button v-if="isFold" size="large" class="button" @click="getAiHistory()" link>
                  <el-icon>
                    <Service />
                  </el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>
        </div> -->

        <!-- 如果是块信息视图 -->
        <div>
          <div class="node-info" v-if="!isFold">
            <h3>当前选中块信息</h3>
            <!-- 如果有选中节点 -->
            <div v-if="selectedNode && selectedNode != null">

              <!-- 不同类型块，显示不同的可编辑表单 -->
              <div v-if="selectedNode.blockType === 'generate'">
                <el-divider>Generate 块参数</el-divider>
                <div>
                  <el-form label-position="top" label-width="100px">
                    <el-form-item>
                      <template #label>
                        <span>类别</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-cascader
                        v-model="selectedNode.data.params.chooseType"
                        :options="generateType"
                        @change="change"
                        filterable
                      />
                    </el-form-item>

                    <!-- 基础几何图形类 -->
                    <!-- 点 (Point) -->
                    <div v-if="selectedNode.data.params.type == 'Point'">
                      <el-form-item>
                        <template #label>
                          <span>ID</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.id"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>坐标</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.position" @change="selectedNode.data.params.position = JSON.parse('[' + selectedNode.data.params.position + ']');"></el-input>
                      </el-form-item>
                      <el-form-item label="颜色">
                        <el-cascader
                          v-model="selectedNode.data.params.color"
                          :options="colorType"
                          @change="changeColor()"
                          filterable
                        />
                      </el-form-item>
                      <el-form-item label="大小">
                        <el-input v-model="selectedNode.data.params.size"></el-input>
                      </el-form-item>
                      <el-form-item label="是否依附于自定义坐标系">
                        <el-checkbox v-model="selectedNode.data.params.use_axes"></el-checkbox>
                      </el-form-item>
                    </div>

                    <!-- 直线 (Line) -->
                    <div v-if="selectedNode.data.params.type =='Line'">
                      <el-form-item>
                        <template #label>
                          <span>ID</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.id"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>起点坐标</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.start" @change="selectedNode.data.params.start = JSON.parse('[' + selectedNode.data.params.start + ']');"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>终点坐标</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.end" @change="selectedNode.data.params.end = JSON.parse('[' + selectedNode.data.params.end + ']');"></el-input>
                      </el-form-item>
                      <el-form-item label="颜色">
                        <el-cascader
                          v-model="selectedNode.data.params.color"
                          :options="colorType"
                          @change="changeColor()"
                          filterable
                        />
                      </el-form-item>
                      <el-form-item label="线宽">
                        <el-input v-model="selectedNode.data.params.stroke_width"></el-input>
                      </el-form-item>
                      <el-form-item label="是否依附于自定义坐标系">
                        <el-checkbox v-model="selectedNode.data.params.use_axes"></el-checkbox>
                      </el-form-item>
                    </div>

                    <!-- 虚线 (DashedLine) -->
                    <div v-if="selectedNode.data.params.type =='DashedLine'">
                      <el-form-item>
                        <template #label>
                          <span>ID</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.id"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>起点坐标</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.start" @change="selectedNode.data.params.start = JSON.parse('[' + selectedNode.data.params.start + ']');"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>终点坐标</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.end" @change="selectedNode.data.params.end = JSON.parse('[' + selectedNode.data.params.end + ']');"></el-input>
                      </el-form-item>
                      <el-form-item label="颜色">
                        <el-cascader
                          v-model="selectedNode.data.params.color"
                          :options="colorType"
                          @change="changeColor()"
                          filterable
                        />
                      </el-form-item>
                      <el-form-item label="线宽">
                        <el-input v-model="selectedNode.data.params.stroke_width"></el-input>
                      </el-form-item>
                      <el-form-item label="是否依附于自定义坐标系">
                        <el-checkbox v-model="selectedNode.data.params.use_axes"></el-checkbox>
                      </el-form-item>
                    </div>

                    <!-- 圆 (Circle) -->
                    <div v-if="selectedNode.data.params.type == 'Circle'">
                      <el-form-item>
                        <template #label>
                          <span>ID</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.id"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>圆心坐标</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.center"  @change="selectedNode.data.params.center = JSON.parse('[' + selectedNode.data.params.center + ']');"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>半径</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.radius"></el-input>
                      </el-form-item>
                      <el-form-item label="颜色">
                        <el-cascader
                          v-model="selectedNode.data.params.color"
                          :options="colorType"
                          @change="changeColor()"
                          filterable
                        />
                      </el-form-item>
                      <el-form-item label="填充透明度">
                        <el-input v-model="selectedNode.data.params.fill_opacity"></el-input>
                      </el-form-item>
                      <el-form-item label="是否依附于自定义坐标系">
                        <el-checkbox v-model="selectedNode.data.params.use_axes"></el-checkbox>
                      </el-form-item>
                    </div>

                    <!-- 矩形 (Rectangle) -->
                    <div v-if="selectedNode.data.params.type == 'Rectangle'">
                      <el-form-item>
                        <template #label>
                          <span>ID</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.id"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>左下角坐标</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.corner_position"  @change="selectedNode.data.params.corner_position = JSON.parse('[' + selectedNode.data.params.corner_position + ']');"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>宽度</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.width"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>高度</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.height"></el-input>
                      </el-form-item>
                      <el-form-item label="边框颜色">
                        <el-cascader
                          v-model="selectedNode.data.params.color"
                          :options="colorType"
                          @change="changeColor()"
                          filterable
                        />
                      </el-form-item>
                      <el-form-item label="填充颜色">
                        <el-cascader
                          v-model="selectedNode.data.params.fill_color"
                          :options="colorType"
                          @change="changeColor()"
                          filterable
                        />
                      </el-form-item>
                      <el-form-item label="填充透明度">
                        <el-input v-model="selectedNode.data.params.fill_opacity"></el-input>
                      </el-form-item>
                      <el-form-item label="是否依附于自定义坐标系">
                        <el-checkbox v-model="selectedNode.data.params.use_axes"></el-checkbox>
                      </el-form-item>
                    </div>

                    <!-- 多边形 (Polygon) -->
                    <div v-if="selectedNode.data.params.type == 'Polygon'">
                      <el-form-item>
                        <template #label>
                          <span>ID</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.id"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>顶点坐标</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.vertices"  @change="selectedNode.data.params.vertices = JSON.parse('[' + selectedNode.data.params.vertices + ']');"></el-input>
                      </el-form-item>
                      <el-form-item label="边框颜色">
                        <el-cascader
                          v-model="selectedNode.data.params.color"
                          :options="colorType"
                          @change="changeColor()"
                          filterable
                        />
                      </el-form-item>
                      <el-form-item label="边框宽度">
                        <el-input v-model="selectedNode.data.params.stroke_width"></el-input>
                      </el-form-item>
                      <el-form-item label="填充颜色">
                        <el-cascader
                          v-model="selectedNode.data.params.fill_color"
                          :options="colorType"
                          @change="changeColor()"
                          filterable
                        />
                      </el-form-item>
                      <el-form-item label="填充透明度">
                        <el-input v-model="selectedNode.data.params.fill_opacity"></el-input>
                      </el-form-item>
                      <el-form-item label="是否依附于自定义坐标系">
                        <el-checkbox v-model="selectedNode.data.params.use_axes"></el-checkbox>
                      </el-form-item>
                    </div>

                    <!-- 箭头 (Arrow) -->
                    <div v-if="selectedNode.data.params.type == 'Arrow'">
                      <el-form-item>
                        <template #label>
                          <span>ID</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.id"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>起点坐标</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.start" @change="selectedNode.data.params.start = JSON.parse('[' + selectedNode.data.params.start + ']');"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>终点坐标</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.end" @change="selectedNode.data.params.end = JSON.parse('[' + selectedNode.data.params.end + ']');"></el-input>
                      </el-form-item>
                      <el-form-item label="颜色">
                        <el-cascader
                          v-model="selectedNode.data.params.color"
                          :options="colorType"
                          @change="changeColor()"
                          filterable
                        />
                      </el-form-item>
                      <el-form-item label="线宽">
                        <el-input v-model="selectedNode.data.params.stroke_width"></el-input>
                      </el-form-item>
                      <el-form-item label="间距">
                        <el-input v-model="selectedNode.data.params.buff"></el-input>
                      </el-form-item>
                      <el-form-item label="是否依附于自定义坐标系">
                        <el-checkbox v-model="selectedNode.data.params.use_axes"></el-checkbox>
                      </el-form-item>
                    </div>

                    <!-- 括号 (Brace) -->
                    <div v-if="selectedNode.data.params.type ==='Brace'">
                      <el-form-item>
                        <template #label>
                          <span>ID</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.id"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>左括号坐标</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.left_bracket_position" @change="selectedNode.data.params.left_bracket_position = JSON.parse('[' + selectedNode.data.params.left_bracket_position + ']');"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>右括号坐标</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.right_bracket_position" @change="selectedNode.data.params.right_bracket_position = JSON.parse('[' + selectedNode.data.params.right_bracket_position + ']');"></el-input>
                      </el-form-item>
                      <el-form-item label="颜色">
                        <el-cascader
                          v-model="selectedNode.data.params.color"
                          :options="colorType"
                          @change="changeColor()"
                          filterable
                        />
                      </el-form-item>
                      <el-form-item label="线宽">
                        <el-input v-model="selectedNode.data.params.stroke_width"></el-input>
                      </el-form-item>
                      <el-form-item label="是否依附于自定义坐标系">
                        <el-checkbox v-model="selectedNode.data.params.use_axes"></el-checkbox>
                      </el-form-item>
                    </div>

                    <!-- 黎曼矩形 (Riemann) -->
                    <div v-if="selectedNode.data.params.type ==='Riemann'">
                      <el-form-item>
                        <template #label>
                          <span>ID</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.id"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>被填充的曲线</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-tooltip effect="dark" content="请通过连线指定！" placement="left-start">
                          <el-input v-model="selectedNode.data.params.curve" disabled></el-input>
                        </el-tooltip>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>填充范围</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.x_range" @change="selectedNode.data.params.x_range = JSON.parse('[' + selectedNode.data.params.x_range + ']');"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>矩形宽度</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.width"></el-input>
                      </el-form-item>
                    </div>

                    <!-- 文本与公式类 -->
                    <!-- 文本 (Text) -->
                    <div v-if="selectedNode.data.params.type == 'Text'">
                      <el-form-item>
                        <template #label>
                          <span>ID</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.id"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>文字内容</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.content"></el-input>
                      </el-form-item>
                      <el-form-item label="显示位置">
                        <el-input v-model="selectedNode.data.params.position" @change="selectedNode.data.params.position = JSON.parse('[' + selectedNode.data.params.position + ']');"></el-input>
                      </el-form-item>
                      <el-form-item label="字体大小">
                        <el-input v-model="selectedNode.data.params.font_size"></el-input>
                      </el-form-item>
                      <el-form-item label="文字颜色">
                        <el-cascader
                          v-model="selectedNode.data.params.color"
                          :options="colorType"
                          @change="changeColor()"
                          filterable
                        />
                      </el-form-item>
                      <el-form-item label="是否依附于自定义坐标系">
                        <el-checkbox v-model="selectedNode.data.params.use_axes"></el-checkbox>
                      </el-form-item>
                    </div>

                    <!-- 数学公式 (MathTex) -->
                    <div v-if="selectedNode.data.params.type == 'MathTex'">
                      <el-form-item>
                        <template #label>
                          <span>ID</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.id"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>LaTeX 表达式</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.formula"></el-input>
                      </el-form-item>
                      <el-form-item label="显示位置">
                        <el-input v-model="selectedNode.data.params.position" @change="selectedNode.data.params.position = JSON.parse('[' + selectedNode.data.params.position + ']');"></el-input>
                      </el-form-item>
                      <el-form-item label="字体大小">
                        <el-input v-model="selectedNode.data.params.font_size"></el-input>
                      </el-form-item>
                      <el-form-item label="公式颜色">
                        <el-cascader
                          v-model="selectedNode.data.params.color"
                          :options="colorType"
                          @change="changeColor()"
                          filterable
                        />
                      </el-form-item>
                      <el-form-item label="是否依附于自定义坐标系">
                        <el-checkbox v-model="selectedNode.data.params.use_axes"></el-checkbox>
                      </el-form-item>
                    </div>

                    <!-- 坐标系类 -->
                    <!-- 坐标轴 (Axes) -->
                    <div v-if="selectedNode.data.params.type == 'Axes'">
                      <el-form-item>
                        <template #label>
                          <span>ID</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.id" disabled></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>x 轴范围</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.x_range" @change="selectedNode.data.params.x_range = JSON.parse('[' + selectedNode.data.params.x_range + ']');"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>y 轴范围</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.y_range" @change="selectedNode.data.params.y_range = JSON.parse('[' + selectedNode.data.params.y_range + ']');"></el-input>
                      </el-form-item>
                      <el-form-item label="z 轴范围">
                        <el-input v-model="selectedNode.data.params.z_range" @change="selectedNode.data.params.z_range = JSON.parse('[' + selectedNode.data.params.z_range + ']');"></el-input>
                      </el-form-item>
                      <el-form-item label="显示刻度数字">
                        <el-checkbox v-model="selectedNode.data.params.axis_config.include_numbers"></el-checkbox>
                      </el-form-item>
                      <el-form-item label="字体大小">
                        <el-input v-model="selectedNode.data.params.axis_config.font_size"></el-input>
                      </el-form-item>
                      <el-form-item label="颜色">
                        <el-cascader
                          v-model="selectedNode.data.params.axis_config.color"
                          :options="colorType"
                          @change="changeColor()"
                          filterable
                        />
                      </el-form-item>
                    </div>

                    <!-- 函数图像 (Graph) -->
                    <div v-if="selectedNode.data.params.type == 'Graph'">
                      <el-form-item>
                        <template #label>
                          <span>ID</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.id"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>函数表达式</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.function"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>定义域范围</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.x_range" @change="selectedNode.data.params.x_range = JSON.parse('[' + selectedNode.data.params.x_range + ']');"></el-input>
                      </el-form-item>
                      <el-form-item label="曲线颜色">
                        <el-cascader
                          v-model="selectedNode.data.params.color"
                          :options="colorType"
                          @change="changeColor()"
                          filterable
                        />
                      </el-form-item>
                      <el-form-item label="曲线宽度">
                        <el-input v-model="selectedNode.data.params.stroke_width"></el-input>
                      </el-form-item>
                      <el-form-item label="是否依附于自定义坐标系">
                        <el-checkbox v-model="selectedNode.data.params.use_axes"></el-checkbox>
                      </el-form-item>
                    </div>

                    <!-- 等高线图 (ContourPlot) -->
                    <div v-if="selectedNode.data.params.type == 'ContourPlot'">
                      <el-form-item>
                        <template #label>
                          <span>ID</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.id"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>函数表达式</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.function"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>x 轴范围</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.x_range" @change="selectedNode.data.params.x_range = JSON.parse('[' + selectedNode.data.params.x_range + ']');"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>y 轴范围</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.y_range" @change="selectedNode.data.params.y_range = JSON.parse('[' + selectedNode.data.params.y_range + ']');"></el-input>
                      </el-form-item>
                      <el-form-item label="等高线层级数">
                        <el-input v-model="selectedNode.data.params.levels"></el-input>
                      </el-form-item>
                      <el-form-item label="是否依附于自定义坐标系">
                        <el-checkbox v-model="selectedNode.data.params.use_axes"></el-checkbox>
                      </el-form-item>
                    </div>

                    <!-- 动态区域类 -->
                    <!-- 填充区域 (Area) -->
                    <div v-if="selectedNode.data.params.type == 'Area'">
                      <el-form-item>
                        <template #label>
                          <span>ID</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.id"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>被填充的曲线</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-tooltip effect="dark" content="请通过连线指定！" placement="left-start">
                          <el-input v-model="selectedNode.data.params.curve" disabled></el-input>
                        </el-tooltip>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>填充范围</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.x_range" @change="selectedNode.data.params.x_range = JSON.parse('[' + selectedNode.data.params.x_range + ']');"></el-input>
                      </el-form-item>
                      <el-form-item label="填充颜色">
                        <el-cascader
                          v-model="selectedNode.data.params.color"
                          :options="colorType"
                          @change="changeColor()"
                          filterable
                        />
                      </el-form-item>
                      <el-form-item label="填充透明度">
                        <el-input v-model="selectedNode.data.params.opacity"></el-input>
                      </el-form-item>
                      <el-form-item label="是否依附于自定义坐标系">
                        <el-checkbox v-model="selectedNode.data.params.use_axes" disabled></el-checkbox>
                      </el-form-item>
                    </div>

                    <!-- 网格 (Grid) -->
                    <div v-if="selectedNode.data.params.type == 'Grid'">
                      <el-form-item>
                        <template #label>
                          <span>ID</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.id"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>宽度</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.width"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <template #label>
                          <span>高度</span>
                          <span style="color: red;">*</span>
                        </template>
                        <el-input v-model="selectedNode.data.params.height"></el-input>
                      </el-form-item>
                      <el-form-item label="网格线颜色">
                        <el-cascader
                          v-model="selectedNode.data.params.line_color"
                          :options="colorType"
                          @change="changeColor()"
                          filterable
                        />
                      </el-form-item>
                    </div>
                  </el-form>
                </div>
              </div>

              <!-- 动画块 -->
              <div v-else-if="selectedNode.blockType === 'animation'">
                <el-divider>Animation 块参数</el-divider>
                <el-form label-position="top" label-width="100px">
                  <el-form-item>
                    <template #label>
                      <span>类型</span>
                      <span style="color: red;">*</span>
                    </template>
                    <el-cascader
                      v-model="selectedNode.data.params.chooseType"
                      :options="animationType"
                      @change="change"
                      filterable
                    />
                  </el-form-item>

                  <!-- 平移动画 (MoveTo) -->
                  <div v-if="selectedNode.data.params.type == 'MoveTo'">
                    <el-form-item>
                      <template #label>
                        <span>ID</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="selectedNode.id"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>目标位置</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="selectedNode.data.params.target" @change="selectedNode.data.params.target = JSON.parse('[' + selectedNode.data.params.target + ']');"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>缓动函数</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-cascader
                        v-model="selectedNode.data.params.rate_func"
                        :options="rateFuncType"
                        @change="changeRateFunc()"
                        filterable
                      />
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>执行时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputRunTime" @change="changeTime(1);updateChart()"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>开始时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputStartTime" @change="changeTime(2);updateChart()"></el-input>
                    </el-form-item>
                    <el-form-item label="是否依附于自定义坐标系">
                      <el-checkbox v-model="selectedNode.data.params.use_axes"></el-checkbox>
                    </el-form-item>
                  </div>

                  <!-- 旋转动画 (Rotate) -->
                  <div v-if="selectedNode.data.params.type == 'Rotate'">
                    <el-form-item>
                      <template #label>
                        <span>ID</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="selectedNode.id"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>旋转角度（度数）</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="selectedNode.data.params.angle"></el-input>
                    </el-form-item>
                    <el-form-item label="旋转中心点">
                      <el-input v-model="selectedNode.data.params.about_point" @change="selectedNode.data.params.about_point = JSON.parse('[' + selectedNode.data.params.about_point + ']');"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>缓动函数</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-cascader
                        v-model="selectedNode.data.params.rate_func"
                        :options="rateFuncType"
                        @change="changeRateFunc()"
                        filterable
                      />
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>执行时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputRunTime" @change="changeTime(1);updateChart()"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>开始时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputStartTime" @change="changeTime(2);updateChart()"></el-input>
                    </el-form-item>
                    <el-form-item label="是否依附于自定义坐标系">
                      <el-checkbox v-model="selectedNode.data.params.use_axes"></el-checkbox>
                    </el-form-item>
                  </div>

                  <!-- 缩放动画 (Scale) -->
                  <div v-if="selectedNode.data.params.type == 'Scale'">
                    <el-form-item>
                      <template #label>
                        <span>ID</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="selectedNode.id"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>缩放比例</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="selectedNode.data.params.scale_factor"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>缓动函数</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-cascader
                        v-model="selectedNode.data.params.rate_func"
                        :options="rateFuncType"
                        @change="changeRateFunc()"
                        filterable
                      />
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>执行时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputRunTime" @change="changeTime(1);updateChart()"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>开始时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputStartTime" @change="changeTime(2);updateChart()"></el-input>
                    </el-form-item>
                  </div>

                  <!-- 淡入动画 (FadeIn) -->
                  <div v-if="selectedNode.data.params.type == 'FadeIn'">
                    <el-form-item>
                      <template #label>
                        <span>ID</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="selectedNode.id"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>缓动函数</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-cascader
                        v-model="selectedNode.data.params.rate_func"
                        :options="rateFuncType"
                        @change="changeRateFunc()"
                        filterable
                      />
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>执行时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputRunTime" @change="changeTime(1);updateChart()"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>开始时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputStartTime" @change="changeTime(2);updateChart()"></el-input>
                    </el-form-item>
                  </div>

                  <!-- 淡出动画 (FadeOut) -->
                  <div v-if="selectedNode.data.params.type == 'FadeOut'">
                    <el-form-item>
                      <template #label>
                        <span>ID</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="selectedNode.id"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>缓动函数</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-cascader
                        v-model="selectedNode.data.params.rate_func"
                        :options="rateFuncType"
                        @change="changeRateFunc()"
                        filterable
                      />
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>执行时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputRunTime" @change="changeTime(1);updateChart()"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>开始时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputStartTime" @change="changeTime(2);updateChart()"></el-input>
                    </el-form-item>
                  </div>

                  <!-- 改变颜色动画 (SetColor) -->
                  <div v-if="selectedNode.data.params.type == 'SetColor'">
                    <el-form-item>
                      <template #label>
                        <span>ID</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="selectedNode.id"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>目标颜色</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="selectedNode.data.params.color"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>缓动函数</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-cascader
                        v-model="selectedNode.data.params.rate_func"
                        :options="rateFuncType"
                        @change="changeRateFunc()"
                        filterable
                      />
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>执行时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputRunTime" @change="changeTime(1);updateChart()"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>开始时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputStartTime" @change="changeTime(2);updateChart()"></el-input>
                    </el-form-item>
                  </div>

                  <!-- 路径动画 (FollowPath) -->
                  <div v-if="selectedNode.data.params.type == 'FollowPath'">
                    <el-form-item>
                      <template #label>
                        <span>ID</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="selectedNode.id"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>路径类型</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-cascader
                          v-model="selectedNode.data.params.path_type"
                          :options="pathType"
                          @change="changePath()"
                          filterable
                        />
                    </el-form-item>
                    <el-form-item v-if="selectedNode.data.params.path_type === 'graph'">
                      <template #label>
                        <span>曲线对象</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-tooltip effect="dark" content="请通过连线指定！" placement="left-start">
                        <el-input v-model="selectedNode.data.params.curve" disabled></el-input>
                      </el-tooltip>
                    </el-form-item>
                    <el-form-item v-else-if="selectedNode.data.params.path_type === 'custom'">
                      <template #label>
                        <span>点对象</span>
                        <span style="color: red;">*</span>
                      </template>
                      <div v-for="(item,index) in selectedNode.data.params.path" :key="item.id">
                        <el-input v-model="selectedNode.data.params.path[index]" @change="selectedNode.data.params.path[index] = JSON.parse('[' + selectedNode.data.params.path[index] + ']');" style="width: 15vw;"></el-input>
                        &ensp;
                        <el-button @click="addPoint(index)" text circle><el-icon><Plus /></el-icon></el-button>
                        <el-button @click="deletePoint(index)" text circle :disabled="selectedNode.data.params.path.length == 1"><el-icon><Minus /></el-icon></el-button>
                      </div>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>函数曲线上的 t 值范围</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="selectedNode.data.params.t_range" @change="selectedNode.data.params.t_range = JSON.parse('[' + selectedNode.data.params.t_range + ']');"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>缓动函数</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-cascader
                        v-model="selectedNode.data.params.rate_func"
                        :options="rateFuncType"
                        @change="changeRateFunc()"
                        filterable
                      />
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>执行时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputRunTime" @change="changeTime(1);updateChart()"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>开始时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputStartTime" @change="changeTime(2);updateChart()"></el-input>
                    </el-form-item>
                  </div>

                  <!-- 变换动画 (Transform) -->
                  <div v-if="selectedNode.data.params.type == 'Transform'">
                    <el-form-item>
                      <template #label>
                        <span>ID</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="selectedNode.id"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>目标对象</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-tooltip effect="dark" content="请通过连线指定！" placement="left-start">
                        <el-input v-model="selectedNode.data.params.target_object" disabled></el-input>
                      </el-tooltip>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>缓动函数</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-cascader
                        v-model="selectedNode.data.params.rate_func"
                        :options="rateFuncType"
                        @change="changeRateFunc()"
                        filterable
                      />
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>执行时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputRunTime" @change="changeTime(1);updateChart()"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>开始时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputStartTime" @change="changeTime(2);updateChart()"></el-input>
                    </el-form-item>
                  </div>

                  <!-- 替换变换 (ReplacementTransform) -->
                  <div v-if="selectedNode.data.params.type == 'ReplacementTransform'">
                    <el-form-item>
                      <template #label>
                        <span>ID</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="selectedNode.id"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>目标对象</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-tooltip effect="dark" content="请通过连线指定！" placement="left-start">
                        <el-input v-model="selectedNode.data.params.target_object" disabled></el-input>
                      </el-tooltip>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>缓动函数</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-cascader
                        v-model="selectedNode.data.params.rate_func"
                        :options="rateFuncType"
                        @change="changeRateFunc()"
                        filterable
                      />
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>执行时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputRunTime" @change="changeTime(1);updateChart()"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>开始时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputStartTime" @change="changeTime(2);updateChart()"></el-input>
                    </el-form-item>
                  </div>

                  <!-- 创建动画 (Create) -->
                  <div v-if="selectedNode.data.params.type == 'Create'">
                    <el-form-item>
                      <template #label>
                        <span>ID</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="selectedNode.id"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>缓动函数</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-cascader
                        v-model="selectedNode.data.params.rate_func"
                        :options="rateFuncType"
                        @change="changeRateFunc()"
                        filterable
                      />
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>执行时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputRunTime" @change="changeTime(1);updateChart()"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>开始时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputStartTime" @change="changeTime(2);updateChart()"></el-input>
                    </el-form-item>
                  </div>

                  <!-- 旋转变换 (ApplyMatrix) -->
                  <div v-if="selectedNode.data.params.type == 'ApplyMatrix'">
                    <el-form-item>
                      <template #label>
                        <span>ID</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="selectedNode.id"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>变换矩阵</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="selectedNode.data.params.matrix"></el-input>
                    </el-form-item>
                    <el-form-item label="变换中心点">
                      <el-input v-model="selectedNode.data.params.about_point" @change="selectedNode.data.params.about_point = JSON.parse('[' + selectedNode.data.params.about_point + ']');"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>缓动函数</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-cascader
                        v-model="selectedNode.data.params.rate_func"
                        :options="rateFuncType"
                        @change="changeRateFunc()"
                        filterable
                      />
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>执行时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputRunTime" @change="changeTime(1);updateChart()"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>开始时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputStartTime" @change="changeTime(2);updateChart()"></el-input>
                    </el-form-item>
                    <el-form-item label="是否依附于自定义坐标系">
                      <el-checkbox v-model="selectedNode.data.params.use_axes"></el-checkbox>
                    </el-form-item>
                  </div>

                  <!-- 显示动画 (Show) -->
                  <div v-if="selectedNode.data.params.type == 'Show'">
                    <el-form-item>
                      <template #label>
                        <span>ID</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="selectedNode.id"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>出现时间点</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputStartTime" @change="changeTime(2);updateChart()"></el-input>
                    </el-form-item>
                  </div>
                </el-form>
              </div>

              <!-- 功能块 -->
              <div v-else-if="selectedNode.blockType === 'function'">
                <el-divider>Function 块参数</el-divider>
                <el-form label-position="top" label-width="100px">
                  <el-form-item>
                    <template #label>
                      <span>类型</span>
                      <span style="color: red;">*</span>
                    </template>
                    <el-cascader
                      v-model="selectedNode.data.params.chooseType"
                      :options="functionType"
                      @change="change"
                      filterable
                    />
                  </el-form-item>

                  <!-- 成组 (Group) -->
                  <div v-if="selectedNode.data.params.type == 'Group'">
                    <el-form-item>
                      <template #label>
                        <span>ID</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="selectedNode.id"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>目标对象列表</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input
                        v-model="selectedNode.data.params.targets"
                        type="textarea"
                        :rows="4"
                        placeholder="请输入目标对象的 ID，多个 ID 用逗号分隔"
                      ></el-input>
                    </el-form-item>
                  </div>

                  <!-- 解组 (Ungroup) -->
                  <div v-if="selectedNode.data.params.type == 'Ungroup'">
                    <el-form-item>
                      <template #label>
                        <span>ID</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="selectedNode.id"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>目标组列表</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input
                        v-model="selectedNode.data.params.targets"
                        type="textarea"
                        :rows="4"
                        placeholder="请输入目标组的 ID，多个 ID 用逗号分隔"
                      ></el-input>
                    </el-form-item>
                  </div>

                  <!-- 动态图层调整 (SetZIndex) -->
                  <div v-if="selectedNode.data.params.type == 'SetZIndex'">
                    <el-form-item>
                      <template #label>
                        <span>ID</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="selectedNode.id"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>目标对象列表</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input
                        v-model="selectedNode.data.params.targets"
                        type="textarea"
                        :rows="4"
                        placeholder="请输入目标对象的 ID，多个 ID 用逗号分隔"
                      ></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>图层层次值</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input
                        v-model="selectedNode.data.params.z_index"
                        placeholder="请输入图层层次值（数字）"
                      ></el-input>
                    </el-form-item>
                  </div>

                  <!-- 场景等待 (Wait) -->
                  <div v-if="selectedNode.data.params.type == 'Wait'">
                    <el-form-item>
                      <template #label>
                        <span>ID</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="selectedNode.id"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>等待时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input
                        v-model="inputRunTime"
                        placeholder="请输入等待时间（秒）"
                        @change="changeTime(1);updateChart()"
                      ></el-input>
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <span>开始时间</span>
                        <span style="color: red;">*</span>
                      </template>
                      <el-input v-model="inputStartTime" @change="changeTime(2);updateChart()"></el-input>
                    </el-form-item>
                  </div>
                </el-form>
              </div>
            </div>
            <!-- 如果没有选中节点 -->
            <p v-else>未选中任何块</p>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>

  <el-dialog
    v-model="saveDialog"
    title="暂存项目"
    width="500"
    align-center
  >
    <div style="text-align: start;">
      <span>请输入项目名称：</span>
      <el-input v-model="projectName" style="padding-bottom: 2%;padding-top: 2%;"></el-input>
    </div>
    <div style="text-align: end;">
      <el-button @click="saveProject()" type="primary">确认</el-button>
    </div>
  </el-dialog>

  <el-dialog
    v-model="loadDialog"
    title="加载项目"
    width="500"
    align-center
  >
    <el-table :data="project" style="width: 100%">
      <el-table-column prop="projectName" label="项目名称" width="200" />
      <el-table-column fixed="right" min-width="20">
        <template #default="scope">
          <el-button @click.prevent="loadJson(scope.$index)" type="primary" link>选择</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>

  <el-dialog
    v-model="deleteDialog"
    title="删除项目"
    width="500"
    align-center
  >
    <el-table :data="project" style="width: 100%">
      <el-table-column prop="projectName" label="项目名称" width="200" />
      <el-table-column fixed="right" min-width="20">
        <template #default="scope">
          <el-button @click.prevent="deleteProject(scope.$index)" type="primary" link>删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>

  <el-dialog
    v-model="preDialog"
    title="预制动画"
    width="900"
    align-center
  >
    <el-tabs tab-position="left">
      <el-tab-pane label="极限">
        <el-scrollbar max-height="600px">
          <el-card v-for="item in preLimits" :key="item.videoSource" class="preBlock" @click="chooseAnimation(item)">
            <video ref="myVideo" autoplay muted loop :src="item.videoSource" style="width: 100%;">您的浏览器不支持视频标签。</video>
            <template #footer>{{ item.name }}</template>
          </el-card>
        </el-scrollbar>
      </el-tab-pane>
      <el-tab-pane label="积分">
        <el-scrollbar max-height="600px">
          <el-card v-for="item in prePoints" :key="item.videoSource" class="preBlock" @click="chooseAnimation(item)">
            <video ref="myVideo" autoplay muted loop :src="item.videoSource" style="width: 100%;">您的浏览器不支持视频标签。</video>
            <template #footer>{{ item.name }}</template>
          </el-card>
        </el-scrollbar>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>

  <!-- <el-dialog
    v-model="aiDialog"
    width="1000"
    style="height: 70vh;"
    align-center
    @close="isComplete = false;isLoading = false;isSend = false"
  >
    <el-scrollbar height="40vh">
      <span v-for="(item,index) in ai" :key="index">
        <el-row style="margin: 1%;">
          <el-col :span="1">
            <el-avatar :size="35" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"/>
          </el-col>
          <el-col :span="23">
            <el-card class="dialog">
              {{ user[index] }}
            </el-card>
          </el-col>
        </el-row>
        <el-row style="margin: 1%;">
          <el-col :span="1">
            <el-avatar :size="35"
              src="https://cdn.dribbble.com/userupload/7419926/file/original-80fd73e15f97df080b0bae65408949f0.png?resize=1504x1128&vertical=center"
            />
          </el-col>
          <el-col :span="23">
            <el-card class="robot" >
              <div>
                <div class="markdown-body" v-html="renderMarkdown(ai[index])"></div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </span>
      <span>
        <el-row style="margin: 1%;" v-if="isSend">
          <el-col :span="1">
            <el-avatar :size="35" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"/>
          </el-col>
          <el-col :span="23">
            <el-card class="dialog">
              {{ requirements }}  
            </el-card>
          </el-col>
        </el-row>
        <el-row style="margin: 1%;" v-if="isSend">
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
                <el-button v-if="isComplete" @click="extractJsonFromResponse()">加载到画布</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </span>
    </el-scrollbar>
    <el-divider style="margin-bottom: 1vw; margin-top: 1vw;"></el-divider>
    <el-input v-model.lazy="description" :autosize="{ minRows: 5, maxRows: 5 }" type="textarea" placeholder="请输入你的需求" :resize="'none'" class="ai-textarea"/>
    <el-button round type="primary" plain style="margin-top:2%;" :style="use_latex ? enabledStyle : disabledStyle" @click="use_latex = !use_latex">
      <el-icon><DataLine /></el-icon>&ensp;使用latex
    </el-button>
    <el-button round style="margin-top:2%;" type="primary" plain :style="json_fix ? enabledStyle : disabledStyle" @click="json_fix = !json_fix">
      <el-icon><SetUp /></el-icon>&ensp;简化json
    </el-button>
    <button class="submit-button" @click="sendDescription()">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    </button>
  </el-dialog> -->

  <el-dialog
    v-model="downloadDialog"
    title="导出动画"
    width="500"
    style="height:35vh"
    align-center
  > 
    <el-divider style="margin-top: 1%;"></el-divider>
    <div style="margin: 2%;margin-bottom: 5vh;font-size: 15px;">
      视频质量：
      <el-cascader
        v-model="quality"
        :options="videoType"
      />
    </div>
    <div style="margin: 2%;margin-bottom: 5vh;font-size: 15px;">
      视频帧率：
      <el-cascader
        v-model="frame_rate"
        :options="fpsType"
      />
    </div>
    <template #footer>
      <div>
        <el-button @click="downloadDialog = false">取消</el-button>
        <el-button type="primary" @click="downloadAnim()">
          导出
        </el-button>
      </div>
    </template>
  </el-dialog>
</div>
</template>
  
<script setup>
import { ref, watch, onMounted, onUnmounted,reactive,toRefs, computed, nextTick } from "vue";
import { VueFlow, Panel, useVueFlow, MarkerType } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { MiniMap } from "@vue-flow/minimap";
import NavigationBar from "../components/NavigationBar.vue";
import { markRaw } from "vue";
import { marked } from 'marked';
import GenerateNode from "../components/GenerateNode.vue";
import AnimationNode from "../components/AnimationNode.vue";
import FunctionNode from "../components/FunctionNode.vue";
import { DeleteProject, DownloadVideo, GetCompleteJson, GetProject, PostProject, PostVideo } from "@/api/main";
import { ElMessage } from "element-plus";
import { serveAddress } from "@/api/api";
import { useStore } from "vuex";
import * as echarts from 'echarts'

const store = useStore()

const nodeTypes = {
  generate: markRaw(GenerateNode),
  animation: markRaw(AnimationNode),
  function: markRaw(FunctionNode),
};

const nodes = ref([]);
const edges = ref([]);

let videoSource = ref("");

/*****************************/
/********  撤销与重做  ********/
/*****************************/

let operaList = []
let undoList = []

onMounted(() => {
  window.addEventListener('keydown',handleKeyDown)
  loadJsonFiles()
  nodes.value = JSON.parse(localStorage.getItem('vueflow-nodes')) || [];
  edges.value = JSON.parse(localStorage.getItem('vueflow-edges')) || [];
  localStorage.setItem('vueflow-nodes', JSON.stringify([]));
  localStorage.setItem('vueflow-edges', JSON.stringify([]));
  changeTime(0)
  updateChart()
})

onUnmounted(() => {
  window.removeEventListener("keydown",handleKeyDown)
  if (eventSource) {
    eventSource.close();
  }
})

const handleKeyDown = (event) => {
  if(event.ctrlKey && event.key === 'z'){
    event.preventDefault()
    console.log(operaList)
    if(operaList.length > 0){
      let change = operaList[operaList.length - 1]
      operaList.pop()
      if(change.type === 'remove'){
        if(typeof change.item.animated === 'undefined'){
          nodes.value.push(change.item)
          changeTime(0)
          updateChart()
        }
        else{
          edges.value.push(change.item)
        }
        undoList.push(change)
      }
      else if(change.type === 'add'){
        if(typeof change.item.animated === 'undefined'){
          nodes.value = nodes.value.filter((node) => node.id !== change.item.id)
          changeTime(0)
          updateChart()
        }
        else{
          edges.value = edges.value.filter((node) => node.id !== change.item.id)
        }
        undoList.push(change)
      }
    }
  }
  else if(event.ctrlKey && event.key === 'y'){
    event.preventDefault()
    if(undoList.length > 0){
      let change = undoList[undoList.length - 1]
      undoList.pop()
      if(change.type === 'remove'){
        if(typeof change.item.animated === 'undefined'){
          nodes.value = nodes.value.filter((node) => node.id !== change.item.id)
          changeTime(0)
          updateChart()
        }
        else{
          edges.value = edges.value.filter((node) => node.id !== change.item.id)
        }
      }
      else if(change.type === 'add'){
        if(typeof change.item.animated === 'undefined'){
          nodes.value.push(change.item)
          changeTime(0)
          updateChart()
        }
        else{
          edges.value.push(change.item)
        }
      }
    }
  }
}


/*****************************/
/*****  拖动增加按钮部分  *****/
/*****************************/

let id = 0;
const isDragBlock = ref(false);
const isDragOver = ref(false);
const dragType = ref(null);

const {
  addNodes,
  onNodesInitialized,
  screenToFlowCoordinate,
  updateNode,
  addEdges,
  onConnect,
  nodesDraggable,
  nodesConnectable,
  zoomOnDoubleClick,
} = useVueFlow();

onConnect((params) => addEdges(params));

// 如果说在添加节点（换句话说就是在拖动），那么不允许选择到文字
watch(isDragBlock, (dragging) => {
  document.body.style.userSelect = dragging ? "none" : "";
});

function onDragBlockStart(event, type) {
  if (event.dataTransfer) {
    event.dataTransfer.setData("application/vueflow", type);
    event.dataTransfer.effectAllowed = "move";
  }

  isDragOver.value = true;
  dragType.value = type;
  isDragBlock.value = true;
  document.addEventListener("drop", onDragBlockEnd);
}

function onDragBlockOver(event) {
  event.preventDefault();
  if (dragType.value) {
    if (event.dataTransfer) {
      isDragOver.value = true;
      event.dataTransfer.dropEffect = "move";
    }
  }
}

function onDragBlockLeave() {
  isDragOver.value = false;
}

function onDragBlockEnd() {
  isDragBlock.value = false;
  isDragOver.value = false;
  dragType.value = null;
  document.removeEventListener("drop", onDragBlockEnd);
}

function onDrop(event) {
  event.preventDefault();

  const position = screenToFlowCoordinate({
    x: event.clientX,
    y: event.clientY,
  });

  const nodeId = `block_${id++}`;

  let defaultNodeData = {
    label: `Node ${nodeId}`,
    params: {}, // 用来存放不同类型的节点默认参数
  };

  // 根据不同节点设置不同的默认参数
  switch (dragType.value) {
    case "generate":
      defaultNodeData.params = {
        type: "Point",
        chooseType:["basic","Point"],
        lastType:["basic","Point"],
        position: [0, 0, 0], // 点的位置
        color: "WHITE", // 点的颜色
        size: 0.1, // 点的大小
        use_axes: true, // 是否依附于自定义坐标系
        necessary: ["position", "use_axes"], // 必需的属性
      };
      break;

    case "animation":
      defaultNodeData.params = {
        type: "MoveTo",
        chooseType:"MoveTo",
        lastType: "MoveTo",
        target: [1, 1, 0], // 目标位置
        rate_func: "linear", // 缓动函数
        run_time: 1, // 执行时间
        start_time: durationSum.value + 1, // 开始时间
        use_axes: true, // 是否依附于自定义坐标系
        necessary: ["target", "run_time", "start_time", "use_axes"], // 必需的属性
      };
      changeTime(0)
      updateChart()
      break;

    case "function":
      defaultNodeData.params = {
        type: "Wait",
        chooseType: "Wait",
        lastType: "Wait",
        start_time: 1, // 开始时间
        duration: 1, // 等待时间
        necessary: ["start_time", "duration"], // 必需的属性
      };
      break;

    default:
      break;
  }

  const newNode = {
    id: nodeId,
    blockType: dragType.value,
    type: dragType.value,
    position,
    data: defaultNodeData,
  };

  // 使用 onNodesInitialized 初始化节点，确保节点的坐标是正确的，将节点居中对齐。
  const { off } = onNodesInitialized(() => {
    updateNode(nodeId, (node) => ({
      position: {
        x: node.position.x - node.dimensions.width / 2,
        y: node.position.y - node.dimensions.height / 2,
      },
    }));

    off();
  });

  addNodes(newNode);

  changeTime(0);
  updateChart()
}

/*****************************/
/****  删除/连接边或节点  *****/
/*****************************/

// 连接边
function handleEdgesChange(changes) {
  changes.forEach((change) => {
    operaList.push(change)
    undoList = []
    if (change.type === "add") {
      change.item.animated = true // 动画
      change.item.markerEnd = MarkerType.ArrowClosed // 箭头
      change.item.style =  { strokeWidth:"3",cursor:"point"}
      edges.value.push(change.item); // 添加新连线

      if(change.item.targetHandle === "area_input"){ // 指定curve
        change.item.targetNode.data.params.curve = change.item.sourceNode.id
      }
      else if(change.item.targetHandle === "input_target"){
        change.item.targetNode.data.params.target_object = change.item.sourceNode.id
      }

      if(change.item.sourceNode.type === "animation" && change.item.targetNode.type === "animation"){
        change.item.targetNode.data.params.start_time = parseInt(change.item.sourceNode.data.params.start_time)
        if(change.item.sourceNode.data.params.type === 'Wait'){
          change.item.targetNode.data.params.start_time += parseInt(change.item.sourceNode.data.params.duration)
        }
        else{
          change.item.targetNode.data.params.start_time += parseInt(change.item.sourceNode.data.params.run_time)
        }
        if(selectedNode.value.id === change.item.targetNode.id){
          inputStartTime.value = change.item.targetNode.data.params.start_time
        }
        durationSum.value = 0
        nodes.value.forEach((node) => {
          if(node.type === 'animation'){
            durationSum.value = parseInt(node.data.params.start_time)  + parseInt(node.data.params.run_time) > durationSum.value ? parseInt(node.data.params.start_time)  + parseInt(node.data.params.run_time) : durationSum.value
          }
          else if(node.data.params.type === 'Wait'){
            durationSum.value = parseInt(node.data.params.start_time)  + parseInt(node.data.params.duration) > durationSum.value ? parseInt(node.data.params.start_time)  + parseInt(node.data.params.duration) : durationSum.value
          }
          
        })
      }

    } else if (change.type === "remove") {
      edges.value = edges.value.filter((edge) => edge.id !== change.id); // 移除连线

      if(change.targetHandle === "area_input"){
        findNodeById(nodes.value,change.target).data.params.curve = null
      }
      else if(change.targetHandle === "input_target"){
        findNodeById(nodes.value,change.target).data.params.target_object = null
      }
    }
  });
}

/*****************************/
/***  路径动画点对象的增减  ***/
/*****************************/

function addPoint(index){
  selectedNode.value.data.params.path.splice(index + 1,0,[])
}

function deletePoint(index){
  selectedNode.value.data.params.path.splice(index,1)
}

/*****************************/
/**********  AI聊天  **********/
/*****************************/

function openAI(){
  window.open(`${window.location.origin}/ai`, '_blank')
}

// 渲染
const enabledStyle = {
  backgroundColor: "white",
  color: "#409EFF", 
  border:"white",
};

const disabledStyle = {
  backgroundColor: "white", 
  color: "grey", 
  border:"white",
};

// 变量
const aiDialog = ref(false)
const description = ref('')
const use_latex = ref(true)
const json_fix = ref(false)
const isLoading = ref(false)
const isSend = ref(false)
const typewriterContent = ref(""); // 用于显示逐字内容
const requirements = ref('') // 已经发送的东西
let eventSource = null
const isComplete = ref(false)
const ai = ref(["你好，请问有什么需要帮助的！","谢谢您的告知！我会改进！"])
const user = ref(["你好","请你再专业一点。"])

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


// 打开 SSE 连接并处理消息
function sendDescription() {
  if (!description.value.trim()) {
    ElMessage.warning("请不要发送空内容");
    return;
  }

  // 如果已有 SSE 连接，先关闭
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }

  isSend.value = true;
  typewriterContent.value = ""; // 清空内容
  renderedMarkdown.value = ""; // 清空渲染内容
  isLoading.value = true;

  requirements.value = description.value;
  const sendData = { description: description.value, use_latex: use_latex.value, json_fix: json_fix.value };
  description.value = "";

  const promise = SendDescription(sendData);
  promise.then((result) => {
    if (!result.success) {
      ElMessage.warning("服务器繁忙，请稍后再试");
      return;
    }
    const sessionId = result.data.session_id;
    const sseUrl = `${serveAddress}/ai/sse/${sessionId}/`;
    console.log("SSE URL:", sseUrl);

    eventSource = new EventSource(sseUrl);

    // 监听 SSE 消息
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("收到 SSE 消息：", data);

        switch (data.type) {
          case "connected":
            console.log("SSE 连接成功，Session ID:", data.session_id);
            break;
          case "status":
            console.log("状态更新：", data.data);
            break;
          case "latex_progress":
          case "reasoning":
            console.log("生成内容：", data.data);
            typewriterContent.value += data.data;
            renderedMarkdown.value = renderMarkdown(typewriterContent.value);
            isLoading.value = false;
            break;
          case "content":
            console.log("生成内容：", data.data);
            typewriterContent.value += data.data;
            renderedMarkdown.value = renderMarkdown(typewriterContent.value);
            isLoading.value = false;
            break;
          case "latex_complete":
            console.log("latex生成完毕");
            typewriterContent.value += '\n';
            renderedMarkdown.value = renderMarkdown(typewriterContent.value);
            isLoading.value = false;
            break;
          case "content":
            // isLoading.value = false;
            // displayTypingEffect(data.data); // 动态显示内容
            break;
          case "completed":
            console.log("生成完成");
            eventSource.close();
            eventSource = null;
            isComplete.value = true
            user.value.push(requirements.value)
            ai.value.push(typewriterContent.value)
            break;
          default:
            console.warn("未知消息类型：", data.type);
        }
      } catch (error) {
        console.error("解析 SSE 消息失败：", error, event.data);
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

// 提取json部分
function extractJsonFromResponse() {
  const jsonStart = "------------JSON_START------------";
  const jsonEnd = "------------JSON_END------------";

  // 提取 JSON 部分
  const startIndex = typewriterContent.value.indexOf(jsonStart) + jsonStart.length;
  const endIndex = typewriterContent.value.indexOf(jsonEnd);

  if (startIndex !== -1 && endIndex !== -1) {
    // 提取 JSON 部分并去掉代码块标记
    let jsonString = typewriterContent.value.slice(startIndex, endIndex).trim();

    // 去掉 ```json 和 ```
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.slice(7).trim(); // 去掉 ```json
    }
    if (jsonString.endsWith("```")) {
      jsonString = jsonString.slice(0, -3).trim(); // 去掉 ```
    }

    try {
      // 修复未正确转义的反斜杠
      let promise = GetCompleteJson({basic_json:jsonString})
      promise.then((result) => {
        if(result.success){
          nodes.value = result.data.complete_json.nodes
          edges.value = result.data.complete_json.edges
          aiDialog.value = false
          changeTime(0)
          updateChart()
        }
      })
    } catch (error) {
      console.error("JSON 解析失败：", error);
      console.error("错误的 JSON 字符串：", jsonString);
      return null;
    }
  } else {
    console.error("未找到 JSON 部分");
    return null;
  }
}

/*****************************/
/**********  时间轴  **********/
/*****************************/
const durationSum = ref(0);

// 可以随机出来的预选颜色数组
const colorArray = ['rgb(242.5, 208.5, 157.5)','rgb(159.5, 206.5, 255)','rgb(179, 224.5, 156.5)','rgb(250, 181.5, 181.5)']
const inputStartTime = ref(0)
const inputRunTime = ref(0)

function changeTime(type) { // type是1，那就是更改的执行时间；type是2，那就是更改的开始时间;0是初始化
  durationSum.value = 0
  if(type == 1){
    if(selectedNode.value.data.params.type === 'Wait'){
      if(inputRunTime.value){
        selectedNode.value.data.params.duration = inputRunTime.value
      }
      else{
        inputRunTime.value = selectedNode.value.data.params.duration
      }
    }
    else{
      if(inputRunTime.value){
        selectedNode.value.data.params.run_time = inputRunTime.value
      }
      else{
        inputRunTime.value = selectedNode.value.data.params.run_time
      }
    }
  }
  else if(type == 2){
    if(inputStartTime.value){
      selectedNode.value.data.params.start_time = inputStartTime.value
    }
    else{
      inputStartTime.value = selectedNode.value.data.params.start_time
    }
  }
  nodes.value.forEach((node) => {
    if(node.type === 'animation'){
      durationSum.value = parseInt(node.data.params.start_time)  + parseInt(node.data.params.run_time) > durationSum.value ? parseInt(node.data.params.start_time)  + parseInt(node.data.params.run_time) : durationSum.value
    }
    else if(node.data.params.type === 'Wait'){
      durationSum.value = parseInt(node.data.params.start_time)  + parseInt(node.data.params.duration) > durationSum.value ? parseInt(node.data.params.start_time)  + parseInt(node.data.params.duration) : durationSum.value
    }
    
  })

}

function selectTimeAxis(node,index){
  selectedNode.value = node
  isFold.value = false
  programSpan.value = 18;
  animationSpan.value = 6;
  if(selectedNode.value.type == 'animation'){
    inputStartTime.value = selectedNode.value.data.params.start_time
    inputRunTime.value = selectedNode.value.data.params.run_time
  }
}

const timelineChart = ref(null)
let myChart = null

function updateChart() {
  if (!myChart) return

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        const transparentBar = params[0];  // 起始时间
        const actualBar = params[1];       // 实际时间块
        
        if (!actualBar) return '';
        
        return `${actualBar.name}<br/>开始时间：${transparentBar.value}s<br/>持续时间：${actualBar.value}s`;
      }
    },
    grid: {
      top: '5vh',
      left: '32vw',    // 增加左侧空间以显示文字
      right: '15vh',
      bottom: '25vh',  // 增加底部空间以显示滚动条
      containLabel: true
    },
    dataZoom: [
      // x轴滚动条
      {
        type: 'slider',
        show: true,
        xAxisIndex: [0],
        bottom: '5vh',
        height: 20
      },
      {
        type: 'inside',
        xAxisIndex: [0]
      },
      // y轴滚动条
      {
        type: 'slider',
        show: true,
        yAxisIndex: [0],
        left: '5vh',
        width: 20
      },
      {
        type: 'inside',
        yAxisIndex: [0]
      }
    ],
    xAxis: {
      type: 'value',
      name: '时间(s)',
      nameLocation: 'end',
      min: 0,
      max: durationSum.value
    },
    yAxis: {
      type: 'category',
      data: nodes.value
        .filter(node => node.type === 'animation' || node.data?.params?.type === 'Wait')
        .map(node => `${node.id}`)
    },
    series: [
    {
        type: 'bar',
        stack: 'total',
        silent: true,
        itemStyle: {
          borderColor: 'transparent',
          color: 'transparent'
        },
        data: nodes.value
          .filter(node => node.type === 'animation' || node.data?.params?.type === 'Wait')
          .map(node => ({
            value: node.data.params.start_time,
          }))
      },
      {
        type: 'bar',
        stack: 'total',
        barWidth: 20,
        label: {
          show: true,
          position: 'inside',
          formatter: '{c}s'
        },
        itemStyle: {
          borderRadius: 4
        },
        data: nodes.value
          .filter(node => node.type === 'animation' || node.data?.params?.type === 'Wait')
          .map((node, index) => ({
            value: node.type === 'animation' ? node.data.params.run_time : node.data.params.duration,
            start: node.data.params.start_time,
            duration: node.type === 'animation' ? node.data.params.run_time : node.data.params.duration,
            itemStyle: {
              color: colorArray[index % colorArray.length]
            }
          }))
      },
    ]
  }

  myChart.setOption(option)

  // 添加点击事件监听
  myChart.off('click')  // 先移除之前的事件监听
  myChart.on('click', function(params) {
    // params.seriesIndex 表示点击的是哪个系列
    // params.dataIndex 表示点击的是数据中的第几项
    if (params.seriesIndex === 1) { // 第二个系列是实际显示的时间块
      const filteredNodes = nodes.value.filter(node => 
        node.type === 'animation' || node.data?.params?.type === 'Wait'
      )
      const clickedNode = filteredNodes[params.dataIndex]
      if (clickedNode) {
        console.log(clickedNode)
        selectTimeAxis(clickedNode, params.dataIndex)
      }
    }
  })
}

onMounted(() => {
  if (timelineChart.value) {
    myChart = echarts.init(timelineChart.value)
    updateChart()
  }
})


// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', () => {
    myChart?.resize()
  })
  myChart?.dispose()
})

/*****************************/
/*****  右侧栏折叠与展开  *****/
/*****************************/
const programSpan = ref(18);
const animationSpan = ref(6);
const isFold = ref(false);

function fold() {
  isFold.value = !isFold.value;
  if (isFold.value) {
    programSpan.value = 23;
    animationSpan.value = 1;
  } else {
    programSpan.value = 18;
    animationSpan.value = 6;
  }
  nextTick(() => {
    if (myChart) {
      myChart.resize();
    }
  });
}

/*****************************/
/********  右侧块信息  ********/
/*****************************/

// 判断是否已有坐标轴
function isAxesExist(){
  let res = false
  nodes.value.forEach((node) => {
    if(node.data.params.type === 'Axes' && node.id != selectedNode.value.id){
      res = true
      return
    }
  })
  return res
}

// 缓动函数发生改变时，将其变为非数组
function changeRateFunc(){
  if(selectedNode.value.data.params.rate_func && Array.isArray(selectedNode.value.data.params.rate_func)){
    selectedNode.value.data.params.rate_func = selectedNode.value.data.params.rate_func[0]
  }
}

// 颜色改变时，将其变为非数组
function changeColor(){
  if(selectedNode.value.data.params.color && Array.isArray(selectedNode.value.data.params.color)){
    selectedNode.value.data.params.color = selectedNode.value.data.params.color[0]
  }
}

// 路径类型改变时，将其变为非数组
function changePath(){
  if(selectedNode.value.data.params.path_type && Array.isArray(selectedNode.value.data.params.path_type)){
    selectedNode.value.data.params.path_type = selectedNode.value.data.params.path_type[0]
  }

  if(selectedNode.value.data.params.path_type === 'custom'){
    selectedNode.value.data.params.necessary = ["path","path_type","t_range", "run_time", "start_time"]
  }
  else{
    selectedNode.value.data.params.necessary = ["curve","path_type","t_range", "run_time", "start_time"]
  }
}

// 类型发生改变时，重置默认值
function change() {
  let temp = selectedNode.value.data.params.chooseType;

  // 如果 chooseType 是数组，取最后一个值
  if (Array.isArray(selectedNode.value.data.params.chooseType)) {
    temp =
      selectedNode.value.data.params.chooseType[
        selectedNode.value.data.params.chooseType.length - 1
      ];
  }

  // 对于连线指定的块，如果类型更改为无需连线的，那么需要删除无关的连线
  let curve1 = selectedNode.value.data.params.curve
  let target_object1 = selectedNode.value.data.params.target_object

  if(selectedNode.value.data.params.target_object == undefined){
    selectedNode.value.data.params.target_object = null
  }

  // 根据 type 设置默认值
  switch (temp) {
    case "Point":
      selectedNode.value.data.params = {
        type: "Point",
        position: [0, 0, 0], // 点的位置
        color: "WHITE", // 点的颜色
        size: 0.1, // 点的大小
        use_axes: true, // 是否依附于自定义坐标系
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["position", "use_axes"], // 必需的属性
      };
      break;

    case "Line":
      selectedNode.value.data.params = {
        type: "Line",
        start: [0, 0, 0], // 起点
        end: [1, 1, 0], // 终点
        color: "WHITE", // 线的颜色
        stroke_width: 2, // 线宽
        use_axes: true, // 是否依附于自定义坐标系
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["start", "end", "use_axes"], // 必需的属性
      };
      break;
    
    case "DashedLine":
      selectedNode.value.data.params = {
        type: "DashedLine",
        start: [0, 0, 0], // 起点
        end: [1, 1, 1], // 终点
        color: "WHITE", // 线的颜色
        stroke_width: 2, // 线宽
        use_axes: true, // 是否依附于自定义坐标系
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["start", "end", "use_axes"], // 必需的属性
      };
      break;

    case "Circle":
      selectedNode.value.data.params = {
        type: "Circle",
        center: [0, 0, 0], // 圆心
        radius: 1, // 半径
        color: "WHITE", // 圆的颜色
        fill_opacity: 0, // 填充透明度
        use_axes: true, // 是否依附于自定义坐标系
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["center", "radius", "use_axes"], // 必需的属性
      };
      break;

    case "Rectangle":
      selectedNode.value.data.params = {
        type: "Rectangle",
        corner_position: [0, 0, 0], // 左下角坐标
        width: 2, // 宽度
        height: 1, // 高度
        color: "WHITE", // 边框颜色
        fill_color: "WHITE", // 填充颜色
        fill_opacity: 0, // 填充透明度
        use_axes: true, // 是否依附于自定义坐标系
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["corner_position", "width", "height", "use_axes"], // 必需的属性
      };
      break;

    case "Polygon":
      selectedNode.value.data.params = {
        type: "Polygon",
        vertices: [
          [0, 0, 0],
          [1, 1, 0],
          [1, 0, 0],
        ], // 顶点坐标
        color: "WHITE", // 边框颜色
        stroke_width: 1, // 边框宽度
        fill_color: "WHITE", // 填充颜色
        fill_opacity: 0, // 填充透明度
        use_axes: true, // 是否依附于自定义坐标系
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["vertices", "use_axes"], // 必需的属性
      };
      break;

    case "Arrow":
      selectedNode.value.data.params = {
        type: "Arrow",
        start: [0, 0, 0], // 起点
        end: [1, 0, 0], // 终点
        color: "WHITE", // 箭头颜色
        stroke_width: 2, // 线宽
        buff: 0.1, // 箭头间距
        use_axes: true, // 是否依附于自定义坐标系
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["start", "end", "use_axes"], // 必需的属性
      };
      break;

    case "Text":
      selectedNode.value.data.params = {
        type: "Text",
        content: "", // 文本内容
        position: [0, 0, 0], // 显示位置
        font_size: 24, // 字体大小
        color: "WHITE", // 文字颜色
        use_axes: true, // 是否依附于自定义坐标系
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["content", "use_axes"], // 必需的属性
      };
      break;

    case "MathTex":
      selectedNode.value.data.params = {
        type: "MathTex",
        formula: "", // LaTeX 表达式
        position: [0, 0, 0], // 显示位置
        font_size: 24, // 字体大小
        color: "WHITE", // 公式颜色
        use_axes: true, // 是否依附于自定义坐标系
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: [ "formula", "use_axes"], // 必需的属性
      };
      break;

    case "Axes":
      if (isAxesExist()) {
        ElMessage.error("已有坐标轴！");
        selectedNode.value.data.params.chooseType = selectedNode.value.data.params.lastType;
        return;
      } else {
        selectedNode.value.data.params = {
          type: "Axes",
          x_range: [-4, 4, 1], // x 轴范围
          y_range: [-4, 4, 1], // y 轴范围
          z_range: [], // z 轴范围
          axis_config: {
            include_numbers: true, // 是否包含数字
            font_size: 24, // 字体大小
            color: "WHITE", // 颜色
          },
          chooseType: selectedNode.value.data.params.chooseType,
          necessary: ["x_range", "y_range"], // 必需的属性
        };
        selectedNode.value.id = "axis"; // 特殊 ID
      }
      break;

    case "Graph":
      selectedNode.value.data.params = {
        type: "Graph",
        function: "", // 函数表达式
        x_range: [-3, 3], // 定义域范围
        color: "WHITE", // 曲线颜色
        stroke_width: 2, // 曲线宽度
        use_axes: true, // 是否依附于自定义坐标系
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["function", "x_range", "use_axes"], // 必需的属性
      };
      break;

    case "ContourPlot":
      selectedNode.value.data.params = {
        type: "ContourPlot",
        function: "", // 函数表达式
        x_range: [-3, 3], // x 范围
        y_range: [-3, 3], // y 范围
        levels: 10, // 等高线层级数
        use_axes: true, // 是否依附于自定义坐标系
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["function", "x_range", "y_range", "use_axes"], // 必需的属性
      };
      break;

    case "Area":
      selectedNode.value.data.params = {
        type: "Area",
        curve: selectedNode.value.data.params.curve, // 被填充的曲线
        x_range: [], // 填充范围
        color: "BLUE", // 填充颜色
        opacity: 0.5, // 填充透明度
        use_axes: true, // 是否依附于自定义坐标系
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["curve", "x_range", "use_axes"], // 必需的属性
      };
      break;

    case "Grid":
      selectedNode.value.data.params = {
        type: "Grid",
        width: 6, // 网格宽度
        height: 6, // 网格高度
        line_color: "WHITE", // 网格线颜色
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["width", "height"], // 必需的属性
      };
      break;

    case "Brace":
      selectedNode.value.data.params = {
        type: "Brace",
        left_bracket_position:[0,0,0],
        right_bracket_position:[1,0,0],
        color:"WHITE",
        stroke_width:2,
        use_axes:true,
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["left_bracket_position","right_bracket_position","use_axes"],
      };
      break;

    case "Riemann":
      selectedNode.value.data.params = {
        type: "Riemann",
        curve: selectedNode.value.data.params.curve,
        x_range: [0.5,1.5],
        width: 0.1,
        use_axes: true, // 是否依附于自定义坐标系
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["curve","x_range","width"],
      }
      break;

    case "MoveTo":
      selectedNode.value.data.params = {
        type: "MoveTo",
        target: [1, 1, 0], // 目标位置
        rate_func: "linear", // 缓动函数
        run_time: selectedNode.value.data.params.run_time, // 执行时间
        start_time: selectedNode.value.data.params.start_time, // 开始时间
        use_axes: true, // 是否依附于自定义坐标系
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["target", "run_time", "start_time", "use_axes"], // 必需的属性
      };
      break;

    case "Rotate":
      selectedNode.value.data.params = {
        type: "Rotate",
        angle: 90, // 旋转角度
        about_point: null, // 旋转中心点
        rate_func: "linear", // 缓动函数
        run_time: selectedNode.value.data.params.run_time, // 执行时间
        start_time: selectedNode.value.data.params.start_time, // 开始时间
        use_axes: true, // 是否依附于自定义坐标系
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["angle", "run_time", "start_time", "use_axes"], // 必需的属性
      };
      break;

    case "Scale":
      selectedNode.value.data.params = {
        type: "Scale",
        scale_factor: 1, // 缩放比例
        rate_func: "linear", // 缓动函数
        run_time: selectedNode.value.data.params.run_time, // 执行时间
        start_time: selectedNode.value.data.params.start_time, // 开始时间
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["scale_factor", "run_time", "start_time"], // 必需的属性
      };
      break;

    case "FadeIn":
      selectedNode.value.data.params = {
        type: "FadeIn",
        rate_func: "linear", // 缓动函数
        run_time: selectedNode.value.data.params.run_time, // 执行时间
        start_time: selectedNode.value.data.params.start_time, // 开始时间
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: [ "run_time", "start_time"], // 必需的属性
      };
      break;

    case "FadeOut":
      selectedNode.value.data.params = {
        type: "FadeOut",
        rate_func: "linear", // 缓动函数
        run_time: selectedNode.value.data.params.run_time, // 执行时间
        start_time: selectedNode.value.data.params.start_time, // 开始时间
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: [ "run_time", "start_time"], // 必需的属性
      };
      break;

    case "SetColor":
      selectedNode.value.data.params = {
        type: "SetColor",
        color: "BLUE", // 目标颜色
        rate_func: "linear", // 缓动函数
        run_time: selectedNode.value.data.params.run_time, // 执行时间
        start_time: selectedNode.value.data.params.start_time, // 开始时间
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["color", "run_time", "start_time"], // 必需的属性
      };
      break;

    case "FollowPath":
      selectedNode.value.data.params = {
        type: "FollowPath",
        curve:selectedNode.value.data.params.curve,
        path_type:"custom",
        path: [
          [0, 0, 0],
          [1, 1, 0],
          [2, 0, 0],
        ], // 路径对象
        t_range:[0,1],
        rate_func: "linear", // 缓动函数
        run_time: selectedNode.value.data.params.run_time, // 执行时间
        start_time: selectedNode.value.data.params.start_time, // 开始时间
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["path","path_type","t_range", "run_time", "start_time"], // 必需的属性
      };
      break;

    case "Transform":
      selectedNode.value.data.params = {
        type: "Transform",
        target_object: selectedNode.value.data.params.target_object, // 目标对象
        rate_func: "linear", // 缓动函数
        run_time: selectedNode.value.data.params.run_time, // 执行时间
        start_time: selectedNode.value.data.params.start_time, // 开始时间
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["target_object", "run_time", "start_time"], // 必需的属性
      };
      break;

    case "ReplacementTransform":
      selectedNode.value.data.params = {
        type: "ReplacementTransform",
        target_object: selectedNode.value.data.params.target_object, // 目标对象
        rate_func: "linear", // 缓动函数
        run_time: selectedNode.value.data.params.run_time, // 执行时间
        start_time: selectedNode.value.data.params.start_time, // 开始时间
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["target_object", "run_time", "start_time"], // 必需的属性
      };
      break;

    case "Create":
      selectedNode.value.data.params = {
        type: "Create",
        rate_func: "linear", // 缓动函数
        run_time: selectedNode.value.data.params.run_time, // 执行时间
        start_time: selectedNode.value.data.params.start_time, // 开始时间
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["run_time", "start_time"], // 必需的属性
      };
      break;

    case "ApplyMatrix":
      selectedNode.value.data.params = {
        type: "ApplyMatrix",
        matrix: null, // 变换矩阵
        about_point: null, // 变换中心点
        rate_func: "linear", // 缓动函数
        run_time: selectedNode.value.data.params.run_time, // 执行时间
        start_time: selectedNode.value.data.params.start_time, // 开始时间
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["matrix", "run_time", "start_time"], // 必需的属性
      };
      break;

    case "Show":
      selectedNode.value.data.params = {
        type: "Show",
        start_time: selectedNode.value.data.params.start_time, // 显示时间
        run_time: selectedNode.value.data.params.run_time,
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["start_time"], // 必需的属性
      };
      break;

    case "Group":
      selectedNode.value.data.params = {
        type: "Group",
        targets: [], // 目标对象列表
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["targets"], // 必需的属性
      };
      break;

    case "Ungroup":
      selectedNode.value.data.params = {
        type: "Ungroup",
        targets: [], // 目标对象列表
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["targets"], // 必需的属性
      };
      break;

    case "SetZIndex":
      selectedNode.value.data.params = {
        type: "SetZIndex",
        targets: [], // 目标对象列表
        z_index: 0, // 图层层次值
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["targets", "z_index"], // 必需的属性
      };
      break;

    case "Wait":
      selectedNode.value.data.params = {
        type: "Wait",
        start_time: 1, // 开始时间
        duration: 1, // 等待时间
        chooseType: selectedNode.value.data.params.chooseType,
        necessary: ["start_time", "duration"], // 必需的属性
      };
      break;

    default:
      break;
  }

  let curve2 = selectedNode.value.data.params.curve
  let target_object2 = selectedNode.value.data.params.target_object

  if(target_object1 !== target_object2 || curve1 !== curve2){
    edges.value = edges.value.filter((edge) => {
      return edge.target !== selectedNode.value.id
    })
  }

  selectedNode.value.data.params.lastType = selectedNode.value.data.params.chooseType;
  inputRunTime.value = selectedNode.value.data.params.run_time
  inputStartTime.value = selectedNode.value.data.params.start_time

}

/* TieZhu:能够选择的类型 */
const generateType = [
  {
    value: "basic",
    label: "基础几何图形",
    children: [
      {
        value: "Point",
        label: "点",
      },
      {
        value: "Line",
        label: "直线",
      },
      {
        value: "DashedLine",
        label: "虚线",
      },
      {
        value: "Circle",
        label: "圆",
      },
      {
        value: "Rectangle",
        label: "矩形",
      },
      {
        value: "Polygon",
        label: "多边形",
      },
      {
        value: "Arrow",
        label: "箭头",
      },
      {
        value: "Brace",
        label: "括号",
      },
      {
        value: "Riemann",
        label: "黎曼矩形",
      }
    ],
  },
  {
    value: "text",
    label: "文本与公式",
    children: [
      {
        value: "Text",
        label: "文本",
      },
      {
        value: "MathTex",
        label: "数学公式",
      },
    ],
  },
  {
    value: "axis",
    label: "坐标系",
    children: [
      {
        value: "Axes",
        label: "坐标轴",
      },
      {
        value: "Graph",
        label: "函数图像",
      },
      {
        value: "ContourPlot",
        label: "等高线",
      },
    ],
  },
  {
    value: "area",
    label: "动态区域",
    children: [
      {
        value: "Area",
        label: "填充区域",
      },
      {
        value: "Grid",
        label: "网格",
      },
    ],
  },
];

const animationType = [
  { value: "MoveTo", label: "平移动画" },
  { value: "Rotate", label: "旋转动画" },
  { value: "Scale", label: "缩放动画" },
  { value: "FadeIn", label: "淡入动画" },
  { value: "FadeOut", label: "淡出动画" },
  { value: "SetColor", label: "改变颜色动画" },
  { value: "FollowPath", label: "路径动画" },
  { value: "Transform", label: "变换动画" },
  { value: "ReplacementTransform", label: "替换变换" },
  { value: "Create", label: "创建动画" },
  { value: "ApplyMatrix", label: "旋转变换" },
  { value: "Show", label: "显示动画" },
];

const functionType = [
  { value: "Group", label: "成组" },
  { value: "Ungroup", label: "解组" },
  { value: "SetZIndex", label: "动态图层调整" },
  { value: "Wait", label: "场景等待" },
];

const rateFuncType = [
  { value: "linear", label: "linear"},
  { value: "smooth", label: "smooth"},
  { value: "rush_into", label: "rush_into"},
  { value: "rush_from", label: "rush_from"},
  { value: "wiggle", label: "wiggle"},
  { value: "running_start", label: "running_start"},
]

const colorType = [
  { value: "RED", label: "RED"},
  { value: "YELLOW", label: "YELLOW"},
  { value: "BLUE", label: "BLUE"},
  { value: "WHITE", label: "WHITE"},
  { value: "ORANGE", label: "ORANGE"},
  { value: "GREEN", label: "GREEN"},
  { value: "PURPLE", label: "PURPLE"},
]

const pathType = [
  { value: "custom",label: "custom(点列表)"},
  { value: "graph",label: "graph(函数曲线)"},
]

// 当前显示的视图：'preview' 或 'info'
const currentView = ref("preview");

// 当前选中的节点
const selectedNode = ref(null);

// 切换视图
function switchView(view) {
  currentView.value = view;
}

// 选中节点
function handleNodeClick(event) {
  selectedNode.value = event.node
  inputStartTime.value = selectedNode.value.data.params.start_time
  if(selectedNode.value.data.params.type === 'Wait'){
    inputRunTime.value = selectedNode.value.data.params.duration
  }
  else{
    inputRunTime.value = selectedNode.value.data.params.run_time
  }
}

/*****************************/
/***  左侧后端交互/功能按钮  ***/
/*****************************/

function handleNodesChange(changes) {
  // 使用 changes 更新外部 nodes
  changes.forEach((change) => {
    if (change.type === "add") {
      operaList.push(change)
      undoList = []
      nodes.value.push(change.item); // 添加新节点
    }
    else if(change.type === 'remove'){
      let item;
      nodes.value = nodes.value.filter((node) => {
        if(node.id !== change.id){
          return true
        }
        else{
          item = node
          return false
        }
      })

      operaList.push({type:"remove",item:item})

      changeTime(0)
      updateChart()
    }
  });
}

// 收集节点和连线信息
function collectGraphData() {
  var graphData = {
    nodes: nodes.value.map((node) => {
      const nodeData = {
        id: node.id,
        blockType: node.blockType,
        data: {
          params: { ...node.data.params },
        },
      };

      // 如果是 Axes 类型且 z_range 为空，则删除 z_range
      if (
        nodeData.data.params.type == "Axes" &&
        !nodeData.data.params.z_range
      ) {
        delete nodeData.data.params.z_range;
      }

      return nodeData;
    }),
    edges: edges.value
    .filter((edge) => {
      return edge.targetHandle !== "input_target" && edge.targetHandle !== "area_input"
    })
    .map((edge) => ({
      source: edge.source,
      target: edge.target,
    })),
  };
  
  edges.value.forEach((edge) => {
    if(edge.targetHandle === "input_target"){
      findNodeById(graphData.nodes,edge.target).target_object = edge.source
    }
  })
  console.log("我是传给后端的")
  console.log(graphData)

  return graphData;
}

// 预览动画
const fullscreenLoading = ref(false)

function sendGraphDataToBackend() {
  var res = checkNecessary()
  if(res !== true){
    ElMessage.error(res)
    return
  }
  fullscreenLoading.value = true
  const graphData = collectGraphData();
  var promise = PostVideo(graphData);
  promise.then((result) => { 
    videoSource.value = result.video_url
  })
  .finally(() => {
    fullscreenLoading.value = false
  })
}

// 导出动画
const downloadDialog = ref(false)
const quality = ref("4k")
const frame_rate = ref(60)
const videoType = [
  { value: "480p", label: "480p" },
  { value: "1080p", label: "1080p" },
  { value: "4k", label: "4k" },
]
const fpsType = [
  { value: 30, label: "30" },
  { value: 60, label: "60" },
]

function downloadAnim(){
  var res = checkNecessary()
  if(res !== true){
    ElMessage.error(res)
    return
  }
  fullscreenLoading.value = true
  const graphData = collectGraphData();
  var promise = DownloadVideo({quality:quality.value,frame_rate:frame_rate.value,nodes:graphData.nodes,edges:graphData.edges});
  promise.then((result) => { 
    ElMessage.success("导出成功！视频位于" + `${result.video_path}`)
  })
  .finally(() => {
    fullscreenLoading.value = false
  })
}

// 暂存项目
const saveDialog = ref(false)
const projectName = ref(null)
function saveProject(){
  if(projectName.value && projectName.value.length > 0){
    var promise = PostProject({
      projectName:projectName.value,
      nodes:nodes.value,
      edges:edges.value
    })
    promise.then((result) => {
      if(result.status === 200){
        ElMessage.success("暂存成功！")
        saveDialog.value = false
      }
      else if(result.status === 400){
        ElMessage.error("项目名称不可重复！请更改名称！")
      }
    })
  }
  else {
    ElMessage.error("项目名称不可为空！")
  }
}

// 加载项目
const loadDialog = ref(false)
const project = ref()
function loadProject(){
  loadDialog.value = true
  var promise = GetProject()
  promise.then((result) => {
    project.value = result
  })
}

function loadJson(index){
  nodes.value = project.value[index].nodes
  edges.value = project.value[index].edges
  changeTime(0)
  updateChart()
  loadDialog.value = false
}

// 删除项目
const deleteDialog = ref(false)
function openDeleteDialog(){
  var promise = GetProject()
  promise.then((result) => {
    project.value = result
    deleteDialog.value = true
  })
}
function deleteProject(index){
  var promise = DeleteProject({projectName:project.value[index].projectName})
  promise.then((result) => {
    ElMessage.success("删除成功！")
    deleteDialog.value = false
  })
}

// 预制动画
const preDialog = ref(false)
const preLimits = ref([])
const prePoints = ref([])

function chooseAnimation(item){
  nodes.value = item.nodes
  edges.value = item.edges
  changeTime(0)
  updateChart()
  preDialog.value = false
}

async function loadJsonFiles() {
  try {
    // 加载文件列表
    const responseLimit = await fetch('/static/json/limit/fileList.json');
    const responsePoint = await fetch('/static/json/point/fileList.json');
    const filesLimit = await responseLimit.json();
    const filesPoint = await responsePoint.json();

    // 遍历文件列表并加载 JSON 内容
    for (const file of filesLimit) {
      const fileResponse = await fetch(`/static/json/limit/${file}`);
      const jsonData = await fileResponse.json();
      preLimits.value.push(jsonData);
    }

    for (const file of filesPoint) {
      const fileResponse = await fetch(`/static/json/point/${file}`);
      const jsonData = await fileResponse.json();
      prePoints.value.push(jsonData);
    }
  } catch (error) {
    console.error('加载 JSON 文件失败：', error);
  }
}

/*****************************/
/*********  工具函数  *********/
/*****************************/

// 通过 id 找到对应的 node
function findNodeById(findNodes,id){
  var res = null;
  findNodes.forEach((node) => {
    if(node.id === id){
      res = node
      return
    }
  })
  return res
}

// 检查是否有节点的必填属性没有填
function checkNecessary(){
  var res = true
  nodes.value.forEach((node) => {
    node.data.params.necessary.forEach((property) => {
      if(node.data.params[property] === undefined || node.data.params[property] == null || node.data.params[property].length == 0){
        res = "此节点"+ property +"未填写！"
        selectedNode.value = node
        currentView.value = 'info'
        isFold.value = false
        programSpan.value = 18;
        animationSpan.value = 6;
        return
      }
      // 检查点对象有无空的
      else if(property === 'path' && Array.isArray(node.data.params.path)){
        let temp = false
        node.data.params.path.forEach((point) => {
          if(point.length == 0){
            res = "此节点点对象未填写！"
            selectedNode.value = node
            currentView.value = 'info'
            isFold.value = false
            programSpan.value = 18;
            animationSpan.value = 6;
            temp = true
            return
          }
        })
        if(temp){
          return
        }
      }
    })
    if(res !== true){
      return
    }
  })
  return res
}

</script>
  
<style scoped>
.header {
  align-items: center;
  justify-content: flex-end; /* 水平居右 */
  display: flex; /* 确保 flex 布局生效 */
  height: 10vh;
}

.header .button {
  display: flex;
  align-items: center; 
  justify-content: center;
  margin: 1%;
  color: #909399;
  background-color: #F5F7FA;
  border: white;
  font-size: 15px;
  font-weight: 500;
  font-family: 'Microsoft YaHei',arial,tahoma,\5b8b\4f53,sans-serif;
}

.header .button :hover {
  color: black;
  outline: none; /* 移除默认的聚焦样式 */
}

.main {
  height: 90vh;
}

.main .program {
  height: 90vh;
  margin-bottom: 0px;
}

.main .program .button-block {
  margin-left: 30%;
  margin-top: 30%;
  background-color: white;
  font-family: "Microsoft YaHei", Arial, sans-serif;
  padding: 20%;
  width:4vw;
  border-radius: 18px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  justify-items: center;
}

.main .program .button-block .button {
  font-size: 15px;
  color: white;
  margin: 5%;
  padding: 7%;
}

.main .program .button-block .button:hover {
  color: rgb(192, 192, 192);
}

.main .program .time-axis {
  margin-top: -28vh;
  margin-left: 10vw;
  padding-left: 10px;
  padding-right: 10px;
  height: 24vh;
  background-color: white;
  border: 1px solid #c2c3c5;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  width: 60vw;
}

.main .program .time-axis .time-block {
  padding: 1%;
  font-family: "楷体";
}

.main .program .time-axis .time-block:hover {
  background-color: rgb(235.9, 245.3, 255); 
  color: rgb(75, 76, 77);
  cursor: pointer
}

.main .program .time-block .axis {
  height: 10px;
  display: inline-block;
  border-radius: 5px;
}

.main .program .ai-block {
  margin-top: -8%;
  position: absolute;
  background-color: #7ba2ef;
  color: white;
  border-radius: 2px;
  width: 1%;
  text-align: center;
  font-family: "宋体";
  padding: 8px;
  cursor: pointer;
  user-select: none;
}

.main .divider {
  width: 10px;
  background-color: #ccc;
  cursor: ew-resize;
  height: 100%;
}

.main .animation {
  background-color: white;
  border: 1px solid #c2c3c5;
  padding: 1%;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.main .animation .button-block {
  text-align: center;
}

.main .animation .button-block .button {
  margin: 2%;
  margin-bottom: 5%;
  width: 50%;
  font-size: 20px;
}

.preBlock {
  margin: 1%;
  text-align: center;
  width: 45%;
  display: inline-block;
}

.preBlock:hover {
  background-color: rgb(235.9, 245.3, 255); 
  cursor: pointer;
}

.ai-textarea {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-size: 16px;
  color: #333;
  line-height: 1.5;
  background-color: #fff;
  transition: all 0.3s ease;
}

.submit-button {
  position: absolute;
  right: 1vw;
  bottom: 1vw;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-button:hover {
  background: #4338ca;
  transform: scale(1.05);
}

.submit-button:active {
  transform: scale(0.95);
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

::v-deep(element.style) {
  visibility:visible;
}
</style>
  