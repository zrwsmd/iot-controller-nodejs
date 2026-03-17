# IoT Controller API 接口文档

## 项目概述

IoT Controller 是一个基于 Node.js + Express + TypeScript 的物联网设备控制服务，提供设备管理、连接管理、项目部署和启动等功能。

**基础信息：**
- 基础 URL: `http://localhost:3000`
- 内容类型: `application/json`
- 响应格式: JSON

---

## 目录

1. [设备控制接口](#1-设备控制接口)
2. [设备列表接口](#2-设备列表接口)
3. [连接管理接口](#3-连接管理接口)
4. [项目部署接口](#4-项目部署接口)
5. [项目启动接口](#5-项目启动接口)
6. [系统接口](#6-系统接口)

---

## 1. 设备控制接口

### 1.1 设置 ADAS 开关

**接口地址：** `POST /api/device/adas-switch`

**功能描述：** 设置设备的 ADAS（高级驾驶辅助系统）开关状态

**请求参数：**
```json
{
  "value": 0  // 0: 关闭, 1: 开启
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "ADASSwitch 设置为 开",
  "data": {
    "messageId": "1234567890",
    "value": 1,
    "description": "开"
  }
}
```

**错误响应：**
```json
{
  "success": false,
  "message": "ADASSwitch 值必须是 0 或 1"
}
```

---

### 1.2 设置设备属性

**接口地址：** `POST /api/device/property`

**功能描述：** 批量设置设备属性

**请求参数：**
```json
{
  "properties": {
    "ADASSwitch": 1,
    "temperature": 25.5,
    "speed": 60
  }
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "属性设置成功",
  "data": {
    "messageId": "1234567890",
    "properties": {
      "ADASSwitch": 1,
      "temperature": 25.5,
      "speed": 60
    }
  }
}
```

---

### 1.3 查询设备属性

**接口地址：** `GET /api/device/property`

**功能描述：** 查询设备当前所有属性

**请求参数：** 无

**响应示例：**
```json
{
  "success": true,
  "message": "查询属性成功",
  "data": {
    "properties": {
      "ADASSwitch": 1,
      "temperature": 25.5,
      "speed": 60
    },
    "count": 3
  }
}
```

---

### 1.4 重启设备

**接口地址：** `POST /api/device/restart`

**功能描述：** 发送设备重启指令

**请求参数：** 无

**响应示例：**
```json
{
  "success": true,
  "message": "重启指令已发送",
  "data": {
    "messageId": "1234567890",
    "service": "restart"
  }
}
```

---

### 1.5 调用设备服务

**接口地址：** `POST /api/device/service/:serviceId`

**功能描述：** 调用设备的指定服务

**路径参数：**
- `serviceId`: 服务 ID（如：restart, update, reset 等）

**请求参数：**
```json
{
  "args": {
    "param1": "value1",
    "param2": "value2"
  }
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "服务 update 调用成功",
  "data": {
    "messageId": "1234567890",
    "service": "update"
  }
}
```

---

### 1.6 查询设备详情

**接口地址：** `GET /api/device/detail`

**功能描述：** 查询设备的详细信息

**请求参数：** 无

**响应示例：**
```json
{
  "success": true,
  "message": "查询设备详情成功",
  "data": {
    "deviceName": "device001",
    "productKey": "a1234567890",
    "status": "ONLINE",
    "gmtCreate": "2024-01-01T00:00:00.000Z",
    "gmtModified": "2024-03-17T03:14:00.000Z"
  }
}
```

---

### 1.7 获取设备状态

**接口地址：** `GET /api/device/status`

**功能描述：** 获取设备当前在线状态

**请求参数：** 无

**响应示例：**
```json
{
  "success": true,
  "message": "获取设备状态成功",
  "data": {
    "status": "ONLINE",
    "lastOnlineTime": "2024-03-17T03:14:00.000Z"
  }
}
```

---

## 2. 设备列表接口

### 2.1 查询设备列表

**接口地址：** `GET /api/devices/list`

**功能描述：** 查询产品下的所有设备列表

**请求参数（Query）：**
- `productKey`: 产品 Key（可选，不传则查询所有产品的设备）

**请求示例：**
```
GET /api/devices/list?productKey=a1234567890
```

**响应示例：**
```json
{
  "success": true,
  "message": "查询设备列表成功",
  "data": {
    "devices": [
      {
        "deviceName": "device001",
        "productKey": "a1234567890",
        "status": "ONLINE",
        "gmtCreate": "2024-01-01T00:00:00.000Z"
      },
      {
        "deviceName": "device002",
        "productKey": "a1234567890",
        "status": "OFFLINE",
        "gmtCreate": "2024-01-02T00:00:00.000Z"
      }
    ],
    "total": 2
  }
}
```

---

## 3. 连接管理接口

### 3.1 查询连接状态

**接口地址：** `GET /api/connection/status`

**功能描述：** 查询当前设备的连接状态

**请求参数：** 无

**响应示例：**
```json
{
  "success": true,
  "message": "查询连接状态成功",
  "data": {
    "isConnected": true,
    "currentClient": {
      "clientId": "client-001",
      "clientInfo": "Web Client",
      "connectedAt": "2024-03-17T03:00:00.000Z",
      "lastHeartbeat": "2024-03-17T03:14:00.000Z"
    },
    "connectionTimeout": 30000
  }
}
```

---

### 3.2 请求连接

**接口地址：** `POST /api/connection/connect`

**功能描述：** 客户端请求连接到设备（独占式连接）

**请求参数：**
```json
{
  "clientId": "client-001",
  "clientInfo": "Web Client"  // 可选
}
```

**成功响应：**
```json
{
  "success": true,
  "message": "连接成功",
  "data": {
    "clientId": "client-001",
    "connectedAt": "2024-03-17T03:14:00.000Z",
    "timeout": 30000
  }
}
```

**失败响应（已有其他客户端连接）：**
```json
{
  "success": false,
  "message": "设备已被其他客户端占用",
  "data": {
    "currentClient": {
      "clientId": "client-002",
      "clientInfo": "Mobile App",
      "connectedAt": "2024-03-17T03:00:00.000Z"
    }
  }
}
```

---

### 3.3 断开连接

**接口地址：** `POST /api/connection/disconnect`

**功能描述：** 客户端主动断开连接

**请求参数：**
```json
{
  "clientId": "client-001"
}
```

**成功响应：**
```json
{
  "success": true,
  "message": "断开连接成功",
  "data": {
    "clientId": "client-001",
    "disconnectedAt": "2024-03-17T03:14:00.000Z"
  }
}
```

**失败响应（非当前连接客户端）：**
```json
{
  "success": false,
  "message": "无权断开连接，当前连接客户端为其他客户端"
}
```

---

### 3.4 强制断开连接

**接口地址：** `POST /api/connection/force-disconnect`

**功能描述：** 管理员强制断开当前连接（无需验证客户端 ID）

**请求参数：** 无

**响应示例：**
```json
{
  "success": true,
  "message": "强制断开连接成功",
  "data": {
    "previousClient": {
      "clientId": "client-001",
      "clientInfo": "Web Client"
    },
    "disconnectedAt": "2024-03-17T03:14:00.000Z"
  }
}
```

---

### 3.5 心跳保活

**接口地址：** `POST /api/connection/heartbeat`

**功能描述：** 客户端发送心跳以保持连接活跃

**请求参数：**
```json
{
  "clientId": "client-001"
}
```

**成功响应：**
```json
{
  "success": true,
  "message": "心跳成功",
  "data": {
    "clientId": "client-001",
    "heartbeatAt": "2024-03-17T03:14:00.000Z",
    "nextHeartbeatBefore": "2024-03-17T03:14:30.000Z"
  }
}
```

**失败响应（客户端 ID 不匹配）：**
```json
{
  "success": false,
  "message": "心跳失败，clientId 不匹配或连接已失效"
}
```

---

## 4. 项目部署接口

### 4.1 部署项目

**接口地址：** `POST /api/deploy/project`

**功能描述：** 部署项目到指定路径（包含连接验证、文件传输、构建等完整流程）

**请求参数：**
```json
{
  "clientId": "client-001",
  "projectPath": "/local/path/to/project",
  "projectName": "my-iot-app",
  "deployPath": "/remote/deploy/path",
  "deployCommand": "npm install && npm run build"  // 可选，默认为 "npm install && npm run build"
}
```

**成功响应：**
```json
{
  "success": true,
  "message": "项目部署成功",
  "data": {
    "projectName": "my-iot-app",
    "deployPath": "/remote/deploy/path",
    "deployedAt": "2024-03-17T03:14:00.000Z",
    "buildOutput": "Build completed successfully",
    "duration": 45000
  }
}
```

**失败响应：**
```json
{
  "success": false,
  "message": "部署失败",
  "error": "连接验证失败：clientId 不匹配"
}
```

---

### 4.2 查询部署状态

**接口地址：** `GET /api/deploy/status`

**功能描述：** 查询当前部署任务的状态

**请求参数：** 无

**响应示例：**
```json
{
  "success": true,
  "message": "查询部署状态成功",
  "data": {
    "isDeploying": true,
    "currentTask": {
      "projectName": "my-iot-app",
      "startedAt": "2024-03-17T03:10:00.000Z",
      "status": "building",
      "progress": 65
    },
    "lastDeploy": {
      "projectName": "my-iot-app",
      "deployedAt": "2024-03-17T02:00:00.000Z",
      "success": true
    }
  }
}
```

---

## 5. 项目启动接口

### 5.1 启动项目

**接口地址：** `POST /api/start/project`

**功能描述：** 启动已部署的项目

**请求参数：**
```json
{
  "clientId": "client-001",
  "projectName": "my-iot-app",
  "deployPath": "/remote/deploy/path",
  "startCommand": "npm start"
}
```

**成功响应：**
```json
{
  "success": true,
  "message": "项目启动成功",
  "data": {
    "projectName": "my-iot-app",
    "deployPath": "/remote/deploy/path",
    "startedAt": "2024-03-17T03:14:00.000Z",
    "processId": 12345,
    "startOutput": "Server started on port 8080"
  }
}
```

**失败响应：**
```json
{
  "success": false,
  "message": "启动失败",
  "error": "项目路径不存在"
}
```

---

## 6. 系统接口

### 6.1 API 信息

**接口地址：** `GET /`

**功能描述：** 获取 API 基本信息和所有可用端点列表

**请求参数：** 无

**响应示例：**
```json
{
  "name": "IoT Controller API",
  "version": "1.0.0",
  "device": {
    "productKey": "a1234567890",
    "deviceName": "device001"
  },
  "endpoints": {
    "device": {
      "setADASSwitch": "POST /api/device/adas-switch",
      "setProperty": "POST /api/device/property",
      "queryProperty": "GET  /api/device/property",
      "restart": "POST /api/device/restart",
      "invokeService": "POST /api/device/service/:serviceId",
      "queryDetail": "GET  /api/device/detail",
      "getStatus": "GET  /api/device/status"
    },
    "devices": {
      "list": "GET  /api/devices/list"
    },
    "connection": {
      "status": "GET  /api/connection/status",
      "connect": "POST /api/connection/connect",
      "disconnect": "POST /api/connection/disconnect",
      "forceDisconnect": "POST /api/connection/force-disconnect",
      "heartbeat": "POST /api/connection/heartbeat"
    },
    "deploy": {
      "deployProject": "POST /api/deploy/project",
      "deployStatus": "GET  /api/deploy/status"
    },
    "start": {
      "startProject": "POST /api/start/project"
    }
  }
}
```

---

### 6.2 健康检查

**接口地址：** `GET /health`

**功能描述：** 检查服务健康状态

**请求参数：** 无

**响应示例：**
```json
{
  "status": "ok",
  "timestamp": "2024-03-17T03:14:00.000Z",
  "uptime": 3600.5
}
```

---

## 通用错误响应

所有接口在发生错误时都会返回以下格式的响应：

```json
{
  "success": false,
  "message": "错误描述信息",
  "error": "详细错误信息（仅开发环境）"
}
```

**常见 HTTP 状态码：**
- `200`: 请求成功
- `400`: 请求参数错误
- `401`: 未授权（心跳失败）
- `403`: 禁止访问（无权断开连接）
- `404`: 接口不存在
- `409`: 冲突（设备已被占用）
- `500`: 服务器内部错误

---

## 使用流程示例

### 完整的项目部署和启动流程

1. **查询连接状态**
   ```bash
   GET /api/connection/status
   ```

2. **请求连接**
   ```bash
   POST /api/connection/connect
   Body: { "clientId": "client-001", "clientInfo": "Deploy Client" }
   ```

3. **发送心跳保持连接**
   ```bash
   POST /api/connection/heartbeat
   Body: { "clientId": "client-001" }
   ```

4. **部署项目**
   ```bash
   POST /api/deploy/project
   Body: {
     "clientId": "client-001",
     "projectPath": "/local/project",
     "projectName": "my-app",
     "deployPath": "/remote/deploy",
     "deployCommand": "npm install && npm run build"
   }
   ```

5. **查询部署状态**
   ```bash
   GET /api/deploy/status
   ```

6. **启动项目**
   ```bash
   POST /api/start/project
   Body: {
     "clientId": "client-001",
     "projectName": "my-app",
     "deployPath": "/remote/deploy",
     "startCommand": "npm start"
   }
   ```

7. **断开连接**
   ```bash
   POST /api/connection/disconnect
   Body: { "clientId": "client-001" }
   ```

---

## 注意事项

1. **连接管理**：设备采用独占式连接模式，同一时间只允许一个客户端连接
2. **心跳机制**：客户端需要定期发送心跳（建议间隔 15-20 秒），否则连接会超时
3. **部署验证**：部署和启动操作需要先建立有效连接
4. **错误处理**：所有接口都有统一的错误响应格式，便于客户端处理

---

## 环境配置

项目需要配置以下环境变量（`.env` 文件）：

```env
# 阿里云 IoT 平台配置
ALIYUN_REGION_ID=cn-shanghai
ALIYUN_ACCESS_KEY_ID=your_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret
ALIYUN_PRODUCT_KEY=your_product_key
ALIYUN_DEVICE_NAME=your_device_name

# 服务器配置
PORT=3000
NODE_ENV=development
```

---

**文档版本：** v1.0.0  
**最后更新：** 2024-03-17  
**维护者：** IoT Controller Team
