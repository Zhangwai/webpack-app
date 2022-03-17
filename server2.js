// 创建一个服务器去监听静态资源文件夹build
const express = require("express");

const app = express();
app.use("*", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3600");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.get("/otheruser", (req, res) => {
  res.json({ code: 0, msg: "这是3601端口" });
});

app.use(express.static("build", { maxAge: 1000 * 3600 }));

app.listen(3601);
