// 创建一个服务器去监听静态资源文件夹build
const express = require("express");

const app = express();

app.use(express.static("build", { maxAge: 1000 * 3600 }));

app.listen(3600);
