<template>
  <div class="body">
    <div class="title">{{ name }}</div>
    <div class="divider"></div>
    <div v-if="data.params" class="inform">
      <!-- 成组 (Group) -->
      <div v-if="data.params.type === 'Group'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="目标对象列表">
          {{ data.params.targets }}
        </el-form-item>
      </div>

      <!-- 解组 (Ungroup) -->
      <div v-if="data.params.type === 'Ungroup'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="目标组列表">
          {{ data.params.targets }}
        </el-form-item>
      </div>

      <!-- 动态图层调整 (SetZIndex) -->
      <div v-if="data.params.type === 'SetZIndex'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="目标对象列表">
          {{ data.params.targets }}
        </el-form-item>
        <el-form-item label="图层层次值">
          {{ data.params.z_index }}
        </el-form-item>
      </div>

      <!-- 场景等待 (Wait) -->
      <div v-if="data.params.type === 'Wait'">
        <el-form-item label="类别">
          {{ data.params.type }}
        </el-form-item>
        <el-form-item label="等待时间">
          {{ data.params.duration }}
        </el-form-item>
        <el-form-item label="开始时间">
          {{data.params.start_time}}
        </el-form-item>
      </div>
    </div>
    <!-- params 缺失 -->
    <div v-else class="error">
      <div v-if="params.value === undefined">字段 params 缺失</div>
    </div>

    <Handle id="input" type="target" :position="Position.Left" :connectableStart="false" :connectableEnd="true"/>
  </div>
</template>

<script setup>
import { Handle, Position } from '@vue-flow/core';
import { ref, onMounted } from 'vue';

const name = ref('功能块')

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
  border: 1px solid green;
  background-color: #d9f7be;
  position: relative;
  border-radius: 5%;
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
  border: 0.5px solid grey;
  width: 120%;
  left: -10%;
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
</style>
