import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { VueFlow } from 'vue-flow'
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';

const app = createApp(App)

app.config.warnHandler = (msg, vm, trace) => {
  if (msg.includes('Extraneous non-props attributes')) {
    // 忽略这个警告，不输出到控制台
    return;
  }
  // 输出其他警告
  console.warn(`[Vue warn]: ${msg}${trace}`);
};


app.use(router)
app.use(ElementPlus)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}//图标
app.component('VueFlow', VueFlow)

app.mount('#app')
