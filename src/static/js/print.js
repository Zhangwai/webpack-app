import $ from "jquery";
import { mut } from "$static/js/common.js";

console.log($, mut);
console.log("print被加载");

export const print = (x) => {
  document.getElementById("content").innerHTML = x;
  console.log("print~~~~~");
};
