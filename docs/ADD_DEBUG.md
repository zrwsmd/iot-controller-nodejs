推荐流程（最简单）：

打开 src/services/iot-service.ts
在第 211 行点一下，设置断点（会出现红点）
按 F5，选择 "🚀 启动服务器 (Dev Server)"
等服务器启动（看到 服务器运行在 http://localhost:3000）
打开新终端，执行 npm run example:devices(或curl http://localhost:3000/api/devices/list)
断点会触发，程序暂停，你可以查看 detail?.status 等变量的值

