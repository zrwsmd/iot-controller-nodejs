# IDE 连接管理功能文档 (基于物模型服务)

## 📋 功能概述

通过阿里云 IoT 平台的物模型服务实现 IDE 客户端与上位机的互斥连接管理。上位机负责连接状态的管理和验证，IDE 端通过调用物模型服务来请求连接、断开连接和发送心跳。

## 🏗️ 物模型设计

### 属性定义

需要在阿里云 IoT 平台添加以下 3 个属性：

#### 1. hasIDEConnected (布尔型)

```json
{
  "identifier": "hasIDEConnected",
  "dataType": { "type": "bool" },
  "name": "是否有IDE连接",
  "accessMode": "rw",
  "description": "标识当前是否有IDE客户端连接"
}
```

#### 2. IDEInfo (文本型)

```json
{
  "identifier": "IDEInfo",
  "dataType": {
    "type": "text",
    "specs": { "length": "512" }
  },
  "name": "IDE连接信息",
  "accessMode": "rw",
  "description": "存储已连接IDE的详细信息（JSON格式）"
}
```

**IDEInfo 存储格式：**
```json
{
  "clientId": "ide-client-001",
  "clientInfo": "{\"platform\":\"nodejs\",\"version\":\"1.0.0\"}",
  "connectTime": 1709697600000
}
```

#### 3. IDEHeartbeat (文本型)

```json
{
  "identifier": "IDEHeartbeat",
  "dataType": {
    "type": "text",
    "specs": { "length": "512" }
  },
  "name": "IDE心跳时间",
  "accessMode": "rw",
  "description": "存储最后一次心跳的时间戳"
}
```

### 服务定义

需要在阿里云 IoT 平台添加以下 3 个服务：

#### 1. requestConnect (请求连接)

```json
{
  "identifier": "requestConnect",
  "name": "请求连接",
  "callType": "async",
  "inputData": [
    {
      "identifier": "clientId",
      "dataType": { "type": "text", "specs": { "length": "128" } },
      "name": "客户端ID"
    },
    {
      "identifier": "clientInfo",
      "dataType": { "type": "text", "specs": { "length": "256" } },
      "name": "客户端信息"
    }
  ],
  "outputData": [
    {
      "identifier": "success",
      "dataType": { "type": "bool" },
      "name": "是否成功"
    },
    {
      "identifier": "message",
      "dataType": { "type": "text", "specs": { "length": "256" } },
      "name": "返回消息"
    }
  ]
}
```

#### 2. requestDisconnect (请求断开)

```json
{
  "identifier": "requestDisconnect",
  "name": "请求断开",
  "callType": "async",
  "inputData": [
    {
      "identifier": "clientId",
      "dataType": { "type": "text", "specs": { "length": "128" } },
      "name": "客户端ID"
    }
  ],
  "outputData": [
    {
      "identifier": "success",
      "dataType": { "type": "bool" },
      "name": "是否成功"
    },
    {
      "identifier": "message",
      "dataType": { "type": "text", "specs": { "length": "256" } },
      "name": "返回消息"
    }
  ]
}
```

#### 3. ideHeartbeat (IDE心跳)

```json
{
  "identifier": "ideHeartbeat",
  "name": "IDE心跳",
  "callType": "async",
  "inputData": [
    {
      "identifier": "clientId",
      "dataType": { "type": "text", "specs": { "length": "128" } },
      "name": "客户端ID"
    }
  ],
  "outputData": [
    {
      "identifier": "success",
      "dataType": { "type": "bool" },
      "name": "是否成功"
    },
    {
      "identifier": "message",
      "dataType": { "type": "text", "specs": { "length": "256" } },
      "name": "返回消息"
    }
  ]
}
```

## 📡 API 接口

### 1. 查询连接状态

**请求：**
```http
GET /api/connection/status
```

**响应示例（未连接）：**
```json
{
  "success": true,
  "message": "查询连接状态成功",
  "data": {
    "connected": false
  }
}
```

**响应示例（已连接）：**
```json
{
  "success": true,
  "message": "查询连接状态成功",
  "data": {
    "connected": true,
    "ideInfo": {
      "clientId": "ide-client-001",
      "clientInfo": "{\"platform\":\"nodejs\",\"version\":\"1.0.0\"}",
      "connectTime": 1709697600000
    },
    "lastHeartbeat": 1709697650000
  }
}
```

### 2. 请求连接

**请求：**
```http
POST /api/connection/connect
Content-Type: application/json

{
  "clientId": "ide-client-001",
  "clientInfo": "{\"platform\":\"nodejs\",\"version\":\"1.0.0\"}"  // 可选
}
```

**响应示例（成功）：**
```json
{
  "success": true,
  "message": "连接成功",
  "data": {
    "clientId": "ide-client-001",
    "connectTime": 1709697600000
  }
}
```

**响应示例（失败 - 已有连接）：**
```json
{
  "success": false,
  "message": "已有其他IDE连接 (ID: ide-client-002)，请稍后重试"
}
```
**HTTP 状态码：** 409 Conflict

### 3. 请求断开连接

**请求：**
```http
POST /api/connection/disconnect
Content-Type: application/json

{
  "clientId": "ide-client-001"
}
```

**响应示例（成功）：**
```json
{
  "success": true,
  "message": "断开连接成功"
}
```

**响应示例（失败）：**
```json
{
  "success": false,
  "message": "断开连接失败，上位机未响应"
}
```
**HTTP 状态码：** 403 Forbidden

### 4. 发送心跳

**请求：**
```http
POST /api/connection/heartbeat
Content-Type: application/json

{
  "clientId": "ide-client-001"
}
```

**响应示例（成功）：**
```json
{
  "success": true,
  "message": "心跳成功",
  "data": {
    "clientId": "ide-client-001",
    "connectTime": 1709697650000
  }
}
```

**响应示例（失败）：**
```json
{
  "success": false,
  "message": "连接已失效，需要重新连接"
}
```
**HTTP 状态码：** 401 Unauthorized

### 5. 强制断开连接（管理员）

**请求：**
```http
POST /api/connection/force-disconnect
```

**响应示例：**
```json
{
  "success": true,
  "message": "强制断开连接成功"
}
```

## 🔄 工作流程

```
┌─────────────────────────────────────────────────────────────┐
│                  IDE 连接管理流程                            │
└─────────────────────────────────────────────────────────────┘

IDE 客户端启动
    ↓
1️⃣ 查询连接状态
   GET /api/connection/status
    ↓
    ├─ 已有连接 → 显示提示，等待或退出
    └─ 无连接 → 继续
         ↓
2️⃣ 请求连接
   POST /api/connection/connect
   { clientId, clientInfo }
         ↓
   调用上位机服务 requestConnect
         ↓
   上位机验证并设置属性:
   - hasIDEConnected = true
   - IDEInfo = { clientId, clientInfo, connectTime }
         ↓
   IDE 端查询属性确认连接成功
         ↓
3️⃣ 启动心跳定时器 (每 30 秒)
   POST /api/connection/heartbeat
   { clientId }
         ↓
   调用上位机服务 ideHeartbeat
         ↓
   上位机更新 IDEHeartbeat 属性
         ↓
4️⃣ 用户退出或异常
         ↓
5️⃣ 请求断开
   POST /api/connection/disconnect
   { clientId }
         ↓
   调用上位机服务 requestDisconnect
         ↓
   上位机清除属性:
   - hasIDEConnected = false
   - IDEInfo = ''
   - IDEHeartbeat = ''
```

## 💻 使用示例

### TypeScript 客户端

```typescript
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const CLIENT_ID = `ide-client-${Date.now()}`;

class IDEClient {
  private clientId: string;
  private heartbeatTimer?: NodeJS.Timeout;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  // 连接
  async connect(): Promise<boolean> {
    try {
      const response = await axios.post(`${BASE_URL}/api/connection/connect`, {
        clientId: this.clientId,
        clientInfo: JSON.stringify({
          platform: 'nodejs',
          version: '1.0.0',
          hostname: require('os').hostname()
        })
      });

      if (response.data.success) {
        console.log('✅ 连接成功');
        this.startHeartbeat();
        return true;
      }
      return false;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        console.log('❌ 连接失败:', error.response.data.message);
      }
      return false;
    }
  }

  // 断开连接
  async disconnect(): Promise<void> {
    this.stopHeartbeat();
    await axios.post(`${BASE_URL}/api/connection/disconnect`, {
      clientId: this.clientId
    });
    console.log('✅ 已断开连接');
  }

  // 启动心跳
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(async () => {
      try {
        const response = await axios.post(`${BASE_URL}/api/connection/heartbeat`, {
          clientId: this.clientId
        });
        
        if (!response.data.success) {
          console.log('⚠️ 心跳失败，连接已失效');
          this.stopHeartbeat();
        } else {
          console.log('💓 心跳成功');
        }
      } catch (error) {
        console.error('❌ 心跳错误:', error);
      }
    }, 30000); // 每 30 秒
  }

  // 停止心跳
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }
}

// 使用示例
const client = new IDEClient(CLIENT_ID);

// 连接
await client.connect();

// 执行操作...

// 断开连接
await client.disconnect();
```

## ⚠️ 注意事项

### 1. 物模型配置

确保在阿里云 IoT 平台完成以下配置：
- **属性**：`hasIDEConnected`、`IDEInfo`、`IDEHeartbeat`
- **服务**：`requestConnect`、`requestDisconnect`、`ideHeartbeat`

### 2. 上位机实现

上位机需要实现这 3 个服务的处理逻辑：
- 验证 clientId 的合法性
- 管理连接状态（互斥逻辑）
- 更新属性值
- 返回正确的响应

### 3. 心跳间隔

建议心跳间隔设置为 **30 秒**，可根据实际需求调整。

### 4. 超时处理

- IDE 端调用服务后会等待 1 秒让上位机处理
- 然后查询属性确认操作是否成功
- 如果上位机未响应，会返回失败

### 5. 错误处理

客户端应该处理以下错误情况：
- 网络超时
- 连接被拒绝（409）
- 心跳失败（401）
- 服务器错误（500）

## 🧪 测试

运行测试脚本：

```bash
# 启动服务器
npm run dev

# 运行连接管理测试
ts-node tests/test-connection.ts
```

## 📊 状态码说明

| 状态码 | 说明 | 场景 |
|--------|------|------|
| 200 | 成功 | 操作成功完成 |
| 400 | 请求参数错误 | 缺少必填参数 clientId |
| 401 | 未授权 | 心跳失败，连接已失效 |
| 403 | 禁止访问 | 断开连接失败 |
| 409 | 冲突 | 已有其他 IDE 连接 |
| 500 | 服务器错误 | 内部错误 |

## 🎯 最佳实践

1. **优雅退出** - 程序退出时务必调用 `disconnect` 接口
2. **异常处理** - 捕获所有可能的异常并正确处理
3. **重连机制** - 心跳失败时实现自动重连逻辑
4. **日志记录** - 记录所有连接、断开、心跳事件
5. **用户提示** - 连接失败时给用户明确的提示信息
6. **clientId 唯一性** - 确保每个 IDE 实例使用唯一的 clientId

## 🔑 关键差异（与旧版本对比）

| 项目 | 旧版本 | 新版本 |
|------|--------|--------|
| **连接方式** | 直接设置属性 | 调用上位机服务 |
| **参数名** | controllerId, ipAddress | clientId, clientInfo |
| **属性名** | ControllerConnected, ConnectedController | hasIDEConnected, IDEInfo, IDEHeartbeat |
| **验证逻辑** | IDE 端自行验证 | 上位机统一验证 |
| **心跳方式** | 更新属性 | 调用服务 |

---

**实现完成！** 🎉 现在 IDE 端通过调用上位机服务来管理连接，上位机负责所有的验证和状态管理逻辑。
