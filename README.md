# iot-controller-nodejs

阿里云 IoT 本地控制端（Node.js）

## 快速开始

```bash
# 1. 配置环境变量
# 编辑 .env 文件，填写 AccessKey 和设备信息

# 2. 启动服务器
npm start

# 3. 开发模式（自动重启）
npm run dev

# 4. 运行测试（需先启动服务器）
npm test
```

## API 列表

| 方法 | 路径 | 功能 |
|------|------|------|
| GET  | /health | 健康检查 |
| POST | /api/device/adas-switch | 设置 ADASSwitch |
| POST | /api/device/property | 设置属性（通用） |
| GET  | /api/device/property | 查询设备属性 |
| POST | /api/device/restart | 调用 restart 服务 |
| POST | /api/device/service/:serviceId | 调用服务（通用） |
| GET  | /api/device/detail | 查询设备详情 |
| GET  | /api/device/status | 获取设备状态 |

作为控制端(IDE)使用
