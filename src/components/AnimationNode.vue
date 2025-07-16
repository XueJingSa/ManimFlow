<template>
  <div class="body">
    <div class="title">{{ name }}</div>
    <!-- <div class="divider"></div> -->
    <div v-if="data.params" class="inform">

      <!-- 平移动画 (MoveTo) -->
      <div v-if="data.params.type == 'MoveTo'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="目标位置">
          {{data.params.target}}
        </el-form-item>
        <el-form-item label="缓动函数">
          {{data.params.rate_func}}
        </el-form-item>
        <el-form-item label="执行时间">
          {{data.params.run_time}}
        </el-form-item>
        <el-form-item label="开始时间">
          {{data.params.start_time}}
        </el-form-item>
        <el-form-item label="使用自定义坐标系">
          <span v-if="data.params.use_axes" >✅</span>
          <span v-else>❌</span>
        </el-form-item>
      </div>

      <!-- 旋转动画 (Rotate) -->
      <div v-if="data.params.type == 'Rotate'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="旋转角度">
          {{data.params.angle}}
        </el-form-item>
        <el-form-item label="旋转中心点">
          {{data.params.about_point}}
        </el-form-item>
        <el-form-item label="缓动函数">
          {{data.params.rate_func}}
        </el-form-item>
        <el-form-item label="执行时间">
          {{data.params.run_time}}
        </el-form-item>
        <el-form-item label="开始时间">
          {{data.params.start_time}}
        </el-form-item>
        <el-form-item label="使用自定义坐标系">
          <span v-if="data.params.use_axes" >✅</span>
          <span v-else>❌</span>
        </el-form-item>
      </div>

      <!-- 缩放动画 (Scale) -->
      <div v-if="data.params.type == 'Scale'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="缩放比例">
          {{data.params.scale_factor}}
        </el-form-item>
        <el-form-item label="缓动函数">
          {{data.params.rate_func}}
        </el-form-item>
        <el-form-item label="执行时间">
          {{data.params.run_time}}
        </el-form-item>
        <el-form-item label="开始时间">
          {{data.params.start_time}}
        </el-form-item>
      </div>

      <!-- 淡入动画 (FadeIn) -->
      <div v-if="data.params.type == 'FadeIn'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="缓动函数">
          {{data.params.rate_func}}
        </el-form-item>
        <el-form-item label="执行时间">
          {{data.params.run_time}}
        </el-form-item>
        <el-form-item label="开始时间">
          {{data.params.start_time}}
        </el-form-item>
      </div>

      <!-- 淡出动画 (FadeOut) -->
      <div v-if="data.params.type == 'FadeOut'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="缓动函数">
          {{data.params.rate_func}}
        </el-form-item>
        <el-form-item label="执行时间">
          {{data.params.run_time}}
        </el-form-item>
        <el-form-item label="开始时间">
          {{data.params.start_time}}
        </el-form-item>
      </div>

      <!-- 改变颜色动画 (SetColor) -->
      <div v-if="data.params.type == 'SetColor'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="目标颜色">
          {{data.params.color}}
        </el-form-item>
        <el-form-item label="缓动函数">
          {{data.params.rate_func}}
        </el-form-item>
        <el-form-item label="执行时间">
          {{data.params.run_time}}
        </el-form-item>
        <el-form-item label="开始时间">
          {{data.params.start_time}}
        </el-form-item>
      </div>

      <!-- 路径动画 (FollowPath) -->
      <div v-if="data.params.type == 'FollowPath'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="路径类型">
          {{ data.params.path_type }}
        </el-form-item>
        <el-form-item v-if="data.params.path_type === 'graph'" label="曲线对象">
          {{ data.params.curve }}
        </el-form-item>
        <el-form-item v-else-if="data.params.path_type === 'custom'" label="点对象">
          {{data.params.path}}
        </el-form-item>
        <el-form-item label="t值范围">
          {{ data.params.t_range }}
        </el-form-item>
        <el-form-item label="缓动函数">
          {{data.params.rate_func}}
        </el-form-item>
        <el-form-item label="执行时间">
          {{data.params.run_time}}
        </el-form-item>
        <el-form-item label="开始时间">
          {{data.params.start_time}}
        </el-form-item>
      </div>

      <!-- 变换动画 (Transform) -->
      <div v-if="data.params.type == 'Transform'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="目标对象">
          {{data.params.target_object}}
        </el-form-item>
        <el-form-item label="缓动函数">
          {{data.params.rate_func}}
        </el-form-item>
        <el-form-item label="执行时间">
          {{data.params.run_time}}
        </el-form-item>
        <el-form-item label="开始时间">
          {{data.params.start_time}}
        </el-form-item>
      </div>

      <!-- 替换变换 (ReplacementTransform) -->
      <div v-if="data.params.type == 'ReplacementTransform'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="目标对象">
          {{data.params.target_object}}
        </el-form-item>
        <el-form-item label="缓动函数">
          {{data.params.rate_func}}
        </el-form-item>
        <el-form-item label="执行时间">
          {{data.params.run_time}}
        </el-form-item>
        <el-form-item label="开始时间">
          {{data.params.start_time}}
        </el-form-item>
      </div>

      <!-- 创建动画 (Create) -->
      <div v-if="data.params.type == 'Create'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="缓动函数">
          {{data.params.rate_func}}
        </el-form-item>
        <el-form-item label="执行时间">
          {{data.params.run_time}}
        </el-form-item>
        <el-form-item label="开始时间">
          {{data.params.start_time}}
        </el-form-item>
      </div>

      <!-- 旋转变换 (ApplyMatrix) -->
      <div v-if="data.params.type == 'ApplyMatrix'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="变换矩阵">
          {{data.params.matrix}}
        </el-form-item>
        <el-form-item label="变换中心点">
          {{data.params.about_point}}
        </el-form-item>
        <el-form-item label="缓动函数">
          {{data.params.rate_func}}
        </el-form-item>
        <el-form-item label="执行时间">
          {{data.params.run_time}}
        </el-form-item>
        <el-form-item label="开始时间">
          {{data.params.start_time}}
        </el-form-item>
      </div>

      <!-- 显示动画 (Show) -->
      <div v-if="data.params.type == 'Show'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="出现时间点">
          {{data.params.start_time}}
        </el-form-item>
      </div>
    </div>
    <!-- params 缺失 -->
    <div v-else class="error">
      <div v-if="params.value === undefined">字段 params 缺失</div>
    </div>
    <!-- Transform有3个端点，左边两个分别用于接受变化作用块和变化目标块 -->
    <div v-if="data.params.type === 'Transform' || data.params.type === 'ReplacementTransform'"> 
      <Handle id="input_func" type="source" :position="Position.Left" style="top: 20%;" :connectable="true"/>
      <Handle id="input_target" type="source" :position="Position.Left" style="top: 80%;" :connectable="true"/>
    </div>
    <Handle v-else-if="data.params.type === 'FollowPath' && data.params.path_type === 'graph'" id="area_input" type="source" :position="Position.Left" :connectableStart="false" :connectableEnd="true"/>
    <Handle v-else id="input" type="source" :position="Position.Left" :connectable="true"/>
    <Handle id="output" type="source" :position="Position.Right" :connectable="true"/>
  </div>
</template>

<script setup>
import { Handle, Position } from '@vue-flow/core';
import { ref, onMounted } from 'vue';

const name = ref('动画块')

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
  border: 3px solid  rgb(121.3, 187.1, 255);
  background-color: white;
  position: relative;
  border-radius: 5%;
  font-family: Helvetica, 'Hiragino Sans GB', 'Microsoft Yahei', '微软雅黑', Arial, sans-serif;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 
              0 6px 20px rgba(0, 0, 0, 0.05);
}
.title{
  position: relative;
  text-align: center;
  font-size: x-large;
  font-weight: 550;
  margin-bottom: 10px;
}
.divider{
  position: relative;
  border: 0.5px solid rgb(159.5, 206.5, 255);
  width: 120%;
  left: -10%;
  margin-bottom: 2%;
}
.inform{
  display: flex;
  position: relative;
}
.label{
  display: flex;
  flex-direction: column;
  position: relative;
  text-align: left;
  font-size: medium;
  font-weight: 600;
}
.content{
  display: flex;
  flex-direction: column;
  position: relative;
  text-align: left;
  font-size: medium;
  font-weight: 400;
  margin-left: 10px;
}
.error{
  color: gray;
  text-align: center;
  font-size: medium;
  font-weight: 500;
}

.el-form-item {
  background-color: rgb(243.9, 244.2, 244.8);
  border-radius: 10px;
  margin-top: 10%;
  padding: 3%;
  width: 101%;
}
</style>
