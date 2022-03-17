// 创建一个服务器去监听静态资源文件夹build
const express = require("express");

const app = express();

// 获取cookie
app.get("/login", (req, res) => {
  res.cookie("user", "jay", { maxAge: 1000 * 3600, httpOnly: true });
  res.json({ code: 0, message: "登录成功" });
});

app.get("/user", (req, res) => {
  const user = req.headers.cookie.split("=")[1];
  res.json({ code: 0, user });
});

app.use(express.static("build", { maxAge: 1000 * 3600 }));

app.listen(3600);
