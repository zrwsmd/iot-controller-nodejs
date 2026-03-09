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


1.




[
  {
    "identifier": "ControllerID",
    "dataType": "text",
    "accessMode": "读写",
    "description": "当前连接的控制端ID，空表示未占用"
  },
  {
    "identifier": "ControllerHeartbeat",
    "dataType": "int",
    "accessMode": "读写",
    "description": "控制端心跳时间戳（毫秒）"
  }
]

1.部署失败：The specified bucket does not exist.
        在阿里云 OSS 控制台创建 bucket（推荐）
        登录阿里云 OSS 控制台：https://oss.console.aliyun.com/
        点击"创建 Bucket"
        填写信息：
        Bucket 名称：iot-deploy-bucket（或其他名称）
        区域：选择 华东1（杭州）（对应 oss-cn-hangzhou）
        存储类型：标准存储
        读写权限：私有（推荐）
        创建完成后，回到项目继续测试





 2.部署流程失败: You have no right to access this object because of bucket acl.
        如果是 RAM 子账号：
        登录 RAM 控制台：https://ram.console.aliyun.com/
        找到对应的用户
        点击 权限管理 → 添加权限
        添加策略：AliyunOSSFullAccess（OSS 完整权限）