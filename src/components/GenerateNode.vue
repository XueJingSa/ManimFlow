<template>
  <div class="body">
    <div class="title">{{ name }}</div>
    <!-- <div class="divider"></div> -->
    <!-- 目前生成块，动画块，功能块的块内信息展示都是全展示，后续可以根据块的类型进行分类展示，届时需要修改下面的代码 -->
    <div v-if="data.params" class="inform">
      <div v-if="data.params.type == 'Point'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="坐标">
          {{ data.params.position }}
        </el-form-item>
        <el-form-item label="颜色">
          {{ data.params.color }}
        </el-form-item>
        <el-form-item label="大小">
          {{ data.params.size }}
        </el-form-item>
        <el-form-item label="使用自定义坐标系">
          <span v-if="data.params.use_axes" >✅</span>
          <span v-else>❌</span>
        </el-form-item>
      </div>

      <!-- 直线 (Line) -->
      <div v-if="data.params.type =='Line'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="起点坐标">
          {{ data.params.start }}
        </el-form-item>
        <el-form-item label="终点坐标">
          {{ data.params.end }}
        </el-form-item>
        <el-form-item label="颜色">
          {{ data.params.color }}
        </el-form-item>
        <el-form-item label="线宽">
          {{ data.params.stroke_width }}
        </el-form-item>
        <el-form-item label="使用自定义坐标系">
          <span v-if="data.params.use_axes" >✅</span>
          <span v-else>❌</span>
        </el-form-item>
      </div>

      <!-- 虚线 (DashedLine) -->
      <div v-if="data.params.type =='DashedLine'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="起点坐标">
          {{ data.params.start }}
        </el-form-item>
        <el-form-item label="终点坐标">
          {{ data.params.end }}
        </el-form-item>
        <el-form-item label="颜色">
          {{ data.params.color }}
        </el-form-item>
        <el-form-item label="线宽">
          {{ data.params.stroke_width }}
        </el-form-item>
        <el-form-item label="使用自定义坐标系">
          <span v-if="data.params.use_axes" >✅</span>
          <span v-else>❌</span>
        </el-form-item>
      </div>

      <!-- 圆 (Circle) -->
      <div v-if="data.params.type == 'Circle'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="圆心坐标">
          {{ data.params.center }}
        </el-form-item>
        <el-form-item label="半径">
          {{ data.params.radius }}
        </el-form-item>
        <el-form-item label="颜色">
          {{ data.params.color }}
        </el-form-item>
        <el-form-item label="填充透明度">
          {{ data.params.fill_opacity }}
        </el-form-item>
        <el-form-item label="使用自定义坐标系">
          <span v-if="data.params.use_axes" >✅</span>
          <span v-else>❌</span>
        </el-form-item>
      </div>

      <!-- 矩形 (Rectangle) -->
      <div v-if="data.params.type == 'Rectangle'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="左下角坐标">
          {{ data.params.corner_position }}
        </el-form-item>
        <el-form-item label="宽度">
          {{ data.params.width }}
        </el-form-item>
        <el-form-item label="高度">
          {{ data.params.height }}
        </el-form-item>
        <el-form-item label="边框颜色">
          {{ data.params.color }}
        </el-form-item>
        <el-form-item label="填充颜色">
          {{ data.params.fill_color }}
        </el-form-item>
        <el-form-item label="填充透明度">
          {{ data.params.fill_opacity }}
        </el-form-item>
        <el-form-item label="使用自定义坐标系">
          <span v-if="data.params.use_axes" >✅</span>
          <span v-else>❌</span>
        </el-form-item>
      </div>

      <!-- 多边形 (Polygon) -->
      <div v-if="data.params.type == 'Polygon'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="顶点坐标">
          {{ data.params.vertices }}
        </el-form-item>
        <el-form-item label="边框颜色">
          {{ data.params.color }}
        </el-form-item>
        <el-form-item label="边框宽度">
          {{ data.params.stroke_width }}
        </el-form-item>
        <el-form-item label="填充颜色">
          {{ data.params.fill_color }}
        </el-form-item>
        <el-form-item label="填充透明度">
          {{ data.params.fill_opacity }}
        </el-form-item>
        <el-form-item label="使用自定义坐标系">
          <span v-if="data.params.use_axes" >✅</span>
          <span v-else>❌</span>
        </el-form-item>
      </div>

      <!-- 箭头 (Arrow) -->
      <div v-if="data.params.type == 'Arrow'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="起点坐标">
          {{ data.params.start }}
        </el-form-item>
        <el-form-item label="终点坐标">
          {{ data.params.end }}
        </el-form-item>
        <el-form-item label="颜色">
          {{ data.params.color }}
        </el-form-item>
        <el-form-item label="线宽">
          {{ data.params.stroke_width }}
        </el-form-item>
        <el-form-item label="间距">
          {{ data.params.buff }}
        </el-form-item>
        <el-form-item label="使用自定义坐标系">
          <span v-if="data.params.use_axes" >✅</span>
          <span v-else>❌</span>
        </el-form-item>
      </div>

      <!-- 括号 (Brace) -->
      <div v-if="data.params.type =='Brace'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="左括号坐标">
          {{ data.params.left_bracket_position }}
        </el-form-item>
        <el-form-item label="右括号坐标">
          {{ data.params.right_bracket_position }}
        </el-form-item>
        <el-form-item label="颜色">
          {{ data.params.color }}
        </el-form-item>
        <el-form-item label="线宽">
          {{ data.params.stroke_width }}
        </el-form-item>
        <el-form-item label="使用自定义坐标系">
          <span v-if="data.params.use_axes" >✅</span>
          <span v-else>❌</span>
        </el-form-item>
      </div>

      <!-- 黎曼矩形 (Riemann) -->
      <div v-if="data.params.type =='Riemann'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="被填充曲线">
          {{ data.params.curve }}
        </el-form-item>
        <el-form-item label="填充范围">
          {{ data.params.x_range }}
        </el-form-item>
        <el-form-item label="矩形宽度">
          {{ data.params.width }}
        </el-form-item>
      </div>

      <!-- 文本与公式类 -->
      <!-- 文本 (Text) -->
      <div v-if="data.params.type == 'Text'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="文字内容">
          {{ data.params.content }}
        </el-form-item>
        <el-form-item label="显示位置">
          {{ data.params.position }}
        </el-form-item>
        <el-form-item label="字体大小">
          {{ data.params.font_size }}
        </el-form-item>
        <el-form-item label="文字颜色">
          {{ data.params.color }}
        </el-form-item>
        <el-form-item label="使用自定义坐标系">
          <span v-if="data.params.use_axes" >✅</span>
          <span v-else>❌</span>
        </el-form-item>
      </div>

      <!-- 数学公式 (MathTex) -->
      <div v-if="data.params.type == 'MathTex'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="LaTeX 表达式">
          {{ data.params.formula }}
        </el-form-item>
        <el-form-item label="显示位置">
          {{ data.params.position }}
        </el-form-item>
        <el-form-item label="字体大小">
          {{ data.params.font_size }}
        </el-form-item>
        <el-form-item label="公式颜色">
          {{ data.params.color }}
        </el-form-item>
        <el-form-item label="使用自定义坐标系">
          <span v-if="data.params.use_axes" >✅</span>
          <span v-else>❌</span>
        </el-form-item>
      </div>

      <!-- 坐标系类 -->
      <!-- 坐标轴 (Axes) -->
      <div v-if="data.params.type == 'Axes'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="x 轴范围">
          {{ data.params.x_range }}
        </el-form-item>
        <el-form-item label="y 轴范围">
          {{ data.params.y_range }}
        </el-form-item>
        <el-form-item label="轴配置">
          <div>
            <p>显示刻度数字: {{ data.params.axis_config.include_numbers }}</p>
            <p>字体大小: {{ data.params.axis_config.font_size }}</p>
            <p>颜色: {{ data.params.axis_config.color }}</p>
          </div>
        </el-form-item>
      </div>

      <!-- 函数图像 (Graph) -->
      <div v-if="data.params.type == 'Graph'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="函数表达式">
          {{ data.params.function }}
        </el-form-item>
        <el-form-item label="定义域范围">
          {{ data.params.x_range }}
        </el-form-item>
        <el-form-item label="曲线颜色">
          {{ data.params.color }}
        </el-form-item>
        <el-form-item label="曲线宽度">
          {{ data.params.stroke_width }}
        </el-form-item>
        <el-form-item label="使用自定义坐标系">
          <span v-if="data.params.use_axes" >✅</span>
          <span v-else>❌</span>
        </el-form-item>
      </div>

      <!-- 等高线图 (ContourPlot) -->
      <div v-if="data.params.type == 'ContourPlot'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="函数表达式">
          {{ data.params.function }}
        </el-form-item>
        <el-form-item label="x 轴范围">
          {{ data.params.x_range }}
        </el-form-item>
        <el-form-item label="y 轴范围">
          {{ data.params.y_range }}
        </el-form-item>
        <el-form-item label="等高线层级数">
          {{ data.params.levels }}
        </el-form-item>
        <el-form-item label="使用自定义坐标系">
          <span v-if="data.params.use_axes" >✅</span>
          <span v-else>❌</span>
        </el-form-item>
      </div>

      <!-- 动态区域类 -->
      <!-- 填充区域 (Area) -->
      <div v-if="data.params.type == 'Area'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="被填充的曲线">
          {{ data.params.curve }}
        </el-form-item>
        <el-form-item label="填充范围">
          {{ data.params.x_range }}
        </el-form-item>
        <el-form-item label="填充颜色">
          {{ data.params.color }}
        </el-form-item>
        <el-form-item label="填充透明度">
          {{ data.params.opacity }}
        </el-form-item>
        <el-form-item label="使用自定义坐标系">
          <span v-if="data.params.use_axes" >✅</span>
          <span v-else>❌</span> 
        </el-form-item>
      </div>

      <!-- 网格 (Grid) -->
      <div v-if="data.params.type == 'Grid'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="宽度">
          {{ data.params.width }}
        </el-form-item>
        <el-form-item label="高度">
          {{ data.params.height }}
        </el-form-item>
        <el-form-item label="网格线颜色">
          {{ data.params.line_color }}
        </el-form-item>
      </div>
    </div>
    <!-- params 缺失 -->
    <div v-else class="error">
      <div v-if="params.value == undefined">字段 params 缺失</div>
    </div>

    <Handle v-if="data.params.type === 'Area' || data.params.type === 'Riemann'" id="area_input" type="source" :position="Position.Left" :connectableStart="false" :connectableEnd="true"/>
    <Handle id="output" type="source" :position="Position.Right" :connectableStart="true" :connectableEnd="false"/>
  </div>
</template>

<script setup>
import { Handle, Position } from '@vue-flow/core';
import { ref, onMounted } from 'vue';

const name = ref('元素块')

const props = defineProps({
  // Vue Flow 会把 node 对应的每个字段传进来，如果设置了相应的 props 则可以接收到原本的数据信息
  data: {
    type: Object,
  }
});

</script>

<style scoped>
.body {
  padding: 10px 30px;
  border: 3px solid  rgb(252, 210.9, 210.9);
  background-color: white;
  position: relative;
  border-radius: 5%;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 
              0 6px 20px rgba(0, 0, 0, 0.05);
}
.title{
  position: relative;
  text-align: center;
  font-size: x-large;
  font-weight: 800;
  margin-bottom: 10px;
}
.divider{
  position: relative;
  width: 120%;
  left: -10%;
  border: 0.5px solid rgb(252, 210.9, 210.9);
  margin-bottom: 2%;
}
.inform{
  position: relative;
  min-width: 100px;
  min-height: 50px;
}
.error{
  color: gray;
  text-align: center;
  font-size: medium;
  font-weight: 500;
}

.el-form-item {
  background-color:  rgb(243.9, 244.2, 244.8);
  border-radius: 10px;
  margin-top: 10%;
  padding: 3%;
  width: 101%;
}
</style>