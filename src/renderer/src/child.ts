import "./assets/css/styles.less";

import {createApp} from "vue";
import Child from "./Child.vue";
import router from "./router/index";
import ElementPlus from "element-plus";
import "../../../node_modules/element-plus/dist/index.css";
import {createPinia} from "pinia";
createApp(Child).use(router).use(ElementPlus).use(createPinia()).mount("#app");
