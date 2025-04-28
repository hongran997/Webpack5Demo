// import 'core-js';  // 引入全部，包比较大   235K
// import "core-js/es/promise";   // 按需引入，包比较小 33K
import { sum } from "./js/sum";
import "./css/index.css";
import "./less/index.less";
import "./sass/index1.sass";
import "./sass/index2.scss";
import "./stylus/index.styl";
import "./css/iconfont.css";
import { cloneDeep } from "lodash";

let obj = { name: 'zhao', age: 17 };
let newObj = cloneDeep(obj);
console.log(newObj.name);

console.log(sum([1, 2, 3]));
var name = 'hongran';
// js 热更新 原理
if (module.hot) {
  module.hot.accept("./js/sum.js")
}

// math文件使用按需加载的方式
document.getElementById("btn").onclick = function () {
  /* webpackChunkName 魔法注释，需要配合 chunkFileName 使用 */
  import(/* webpackChunkName:"math" */'./js/math')
    .then(({ add, mul }) => {
      console.log('模块加载成功', add(3, 3));

    })
    .catch(err => {
      console.log(err);
    })
}


new Promise((resolve) => {
  setTimeout(() => {
    resolve(1);
  }, 1000)
})

const arr = [1, 2, 3, 4];
console.log(arr.includes(1));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}