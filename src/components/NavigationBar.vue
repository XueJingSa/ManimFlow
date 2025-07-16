<template>
    <div class="bar">
        菜单栏
        <el-divider direction="vertical" />
        <el-button @click="this.$emit('pre')" class="button" link>预制动画</el-button>
    </div>
</template>

<script setup>

</script>

<style scoped>
.bar {
    background-color: #303133;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    font-family: "Microsoft YaHei", Arial, sans-serif;
    color: white;
    padding-left: 2%;
}

.bar .button {
    font-family: "Microsoft YaHei", Arial, sans-serif;
    font-size: 15px;
    color: white;
    padding: 2%;
}

.bar .button:hover {
    color: #b9bcc2;
}
</style>