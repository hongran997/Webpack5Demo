<template>
  <div class="header">Hello Vue Cli</div>
  <el-button type="primary">I am ElButton</el-button>
  <ul>
    <li><router-link to="/home">Home</router-link></li>
    <li><router-link to="/about">About</router-link></li>
  </ul>
  <router-view />
</template>

<!-- 这里的lang="ts" 暂时不可以用，因为没有下载解析ts的工具，所以会报错。
  如果script标签里面没有内容还好，有内容的话就会出现解析问题 -->
<script setup >
</script>

<style scoped>
.header{
  color: pink;
}
</style>