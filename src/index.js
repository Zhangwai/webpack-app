import css from "$static/css/index";
import less from "$static/css/index.less";
// import { print } from "./static/js/print.js";
import { mut } from "$static/js/common.js";
import $ from "jquery";
import lodash from "lodash";

//动态导入语法可以将某个文件单独打包
// import(/* webpackChunkName: 'print' */ "./static/js/print.js").then((res) => {
//   console.log(res);
// });

document.getElementById("btn").onclick = () => {
  // 懒加载
  // 预加载 prefetch：会在使用之前，提前加载js文件 加载文件但是不解析文件
  // 正常加载可以认为是并行加载 预加载等浏览器空闲了在去加载，兼容差
  import(
    /* webpackChunkName: 'print', webpackPrefetch: true */ "./static/js/print.js"
  ).then(({ print }) => {
    print("懒加载点击打印完成~~");
  });
};
console.log($);
console.log(lodash, "~~~");
console.log("~~~");
const add = (a, b) => a + b;
add(1, 2);
console.log("index.js文件被重新加载123");
// print();
mut();
const p = new Promise((resolve) => {
  setTimeout(() => {
    console.log("定时器执行");
    resolve(22);
  }, 1000);
});
console.log(add, add(1, 2), 123, "asd");

/**
 * 检测到热模块，监听并执行以下行为
 * 入口文件无法做HMR
 */
if (module.hot) {
  module.hot.accept("./static/js/print.js", () => {
    print();
  });
}

/**
 * 注册serviceWorker
 * 处理兼容性问题
 * pwa需要跑在服务器上面
 */
// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker
//       .register("/service-worker.js")
//       .then(() => {
//         console.log("sw注册成功");
//       })
//       .catch(() => {
//         console.log("sw注册失败");
//       });
//   });
// }
