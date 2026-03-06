# 控制端连接管理功能文档

## 📋 功能概述

实现了控制端互斥连接机制，确保同一时间只有一个控制端能够连接到上位机（IoT 设备）。

## 🎯 核心特性

- ✅ **互斥连接** - 同一时间只允许一个控制端连接
- ✅ **状态查询** - 实时查询当前连接状态
- ✅ **心跳保活** - 定期发送心跳维持连接
- ✅ **强制断开** - 管理员可强制断开任何连接
- ✅ **连接信息** - 记录控制端 ID、IP 地址、连接时间

## 🏗️ 实现原理

### 物模型属性定义

需要在阿里云 IoT 平台添加以下两个属性：

#### 1. hasIDEConnected（布尔型）

```json
{
  "identifier": "hasIDEConnected",
  "dataType": {
    "type": "bool"
  },
  "name": "IDE连接状态",
  "accessMode": "rw",
  "description": "标识是否有IDE已连接"
}
```

#### 2. IDEInfo（文本型）

```json
{
  "identifier": "IDEInfo",
  "dataType": {
    "type": "text",
    "specs": {
      "length": "512"
    }
  },
  "name": "已连接的IDE信息",
  "accessMode": "rw",
  "description": "存储已连接IDE的详细信息（JSON 格式）"
}
```

**IDEInfo 存储的 JSON 格式：**

```json
{
  "controllerId": "controller-001",
  "connectTime": 1709697600000,
  "ipAddress": "192.168.1.100"
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
    "controller": {
      "controllerId": "controller-001",
      "connectTime": 1709697600000,
      "ipAddress": "192.168.1.100"
    }
  }
}
```

### 2. 请求连接

**请求：**
```http
POST /api/connection/connect
Content-Type: application/json

{
  "controllerId": "controller-001",
  "ipAddress": "192.168.1.100"  // 可选，不传则使用请求 IP
}
```

**响应示例（成功）：**
```json
{
  "success": true,
  "message": "连接成功",
  "data": {
    "controllerId": "controller-001",
    "connectTime": 1709697600000
  }
}
```

**响应示例（失败 - 已有连接）：**
```json
{
  "success": false,
  "message": "已有控制端连接 (ID: controller-002)，请稍后重试",
  "data": {
    "controllerId": "controller-002",
    "connectTime": 1709697500000,
    "ipAddress": "192.168.1.101"
  }
}
```
**HTTP 状态码：** 409 Conflict

### 3. 断开连接

**请求：**
```http
POST /api/connection/disconnect
Content-Type: application/json

{
  "controllerId": "controller-001"
}
```

**响应示例（成功）：**
```json
{
  "success": true,
  "message": "断开连接成功"
}
```

**响应示例（失败 - 无权断开）：**
```json
{
  "success": false,
  "message": "无权断开连接，当前连接的控制端是: controller-002"
}
```
**HTTP 状态码：** 403 Forbidden

### 4. 心跳保活

**请求：**
```http
POST /api/connection/heartbeat
Content-Type: application/json

{
  "controllerId": "controller-001"
}
```

**响应示例（成功）：**
```json
{
  "success": true,
  "message": "心跳成功"
}
```

**响应示例（失败 - 连接已失效）：**
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

## 💻 使用示例

### JavaScript/TypeScript 客户端

```typescript
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const CONTROLLER_ID = 'my-controller-001';

class ControllerClient {
  private controllerId: string;
  private heartbeatTimer?: NodeJS.Timeout;

  constructor(controllerId: string) {
    this.controllerId = controllerId;
  }

  // 连接
  async connect(): Promise<boolean> {
    try {
      const response = await axios.post(`${BASE_URL}/api/connection/connect`, {
        controllerId: this.controllerId
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
      controllerId: this.controllerId
    });
    console.log('✅ 已断开连接');
  }

  // 启动心跳
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(async () => {
      try {
        const response = await axios.post(`${BASE_URL}/api/connection/heartbeat`, {
          controllerId: this.controllerId
        });
        
        if (!response.data.success) {
          console.log('⚠️ 心跳失败，连接已失效');
          this.stopHeartbeat();
        }
      } catch (error) {
        console.error('❌ 心跳错误:', error);
      }
    }, 30000); // 每 30 秒发送一次心跳
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
const client = new ControllerClient(CONTROLLER_ID);

// 连接
await client.connect();

// 执行操作...

// 断开连接
await client.disconnect();
```

### Python 客户端

```python
import requests
import time
import threading

class ControllerClient:
    def __init__(self, base_url, controller_id):
        self.base_url = base_url
        self.controller_id = controller_id
        self.heartbeat_thread = None
        self.running = False

    def connect(self):
        """连接到上位机"""
        try:
            response = requests.post(
                f"{self.base_url}/api/connection/connect",
                json={"controllerId": self.controller_id}
            )
            
            if response.status_code == 200:
                print("✅ 连接成功")
                self.start_heartbeat()
                return True
            elif response.status_code == 409:
                print(f"❌ 连接失败: {response.json()['message']}")
                return False
        except Exception as e:
            print(f"❌ 连接错误: {e}")
            return False

    def disconnect(self):
        """断开连接"""
        self.stop_heartbeat()
        requests.post(
            f"{self.base_url}/api/connection/disconnect",
            json={"controllerId": self.controller_id}
        )
        print("✅ 已断开连接")

    def start_heartbeat(self):
        """启动心跳线程"""
        self.running = True
        self.heartbeat_thread = threading.Thread(target=self._heartbeat_loop)
        self.heartbeat_thread.daemon = True
        self.heartbeat_thread.start()

    def _heartbeat_loop(self):
        """心跳循环"""
        while self.running:
            time.sleep(30)  # 每 30 秒
            try:
                response = requests.post(
                    f"{self.base_url}/api/connection/heartbeat",
                    json={"controllerId": self.controller_id}
                )
                if response.status_code != 200:
                    print("⚠️ 心跳失败，连接已失效")
                    self.running = False
            except Exception as e:
                print(f"❌ 心跳错误: {e}")

    def stop_heartbeat(self):
        """停止心跳"""
        self.running = False
        if self.heartbeat_thread:
            self.heartbeat_thread.join(timeout=1)

# 使用示例
client = ControllerClient("http://localhost:3000", "python-controller-001")
client.connect()
# 执行操作...
client.disconnect()
```

## 🔄 完整工作流程

```
┌─────────────────────────────────────────────────────────────┐
│                  控制端连接流程图                            │
└─────────────────────────────────────────────────────────────┘

控制端启动
    ↓
查询连接状态 (GET /api/connection/status)
    ↓
    ├─ 已有连接 → 显示提示，等待或退出
    └─ 无连接 → 继续
         ↓
    请求连接 (POST /api/connection/connect)
         ↓
         ├─ 成功 (200) → 连接建立
         │    ↓
         │    启动心跳定时器 (每 30 秒)
         │    ↓
         │    执行控制操作
         │    ↓
         │    用户退出或异常
         │    ↓
         │    断开连接 (POST /api/connection/disconnect)
         │
         └─ 失败 (409) → 显示错误，退出

心跳定时器循环:
    ↓
    发送心跳 (POST /api/connection/heartbeat)
    ↓
    ├─ 成功 → 继续
    └─ 失败 → 连接失效，停止心跳，提示重连
```

## ⚠️ 注意事项

### 1. 物模型配置

确保需要在阿里云 IoT 平台的物模型中添加了 `hasIDEConnected` 和 `IDEInfo` 两个属性。

### 2. 心跳间隔

建议心跳间隔设置为 **30-60 秒**，太频繁会增加网络开销，太长可能导致连接状态不准确。

### 3. 超时处理

如果控制端异常退出未能正常断开连接，可以：
- 设置连接超时时间（通过心跳时间判断）
- 使用强制断开接口清除状态
- 在控制端重启时检测并强制断开旧连接

### 4. 并发控制

当前实现基于物模型属性的读写，存在极小概率的并发问题（两个控制端同时连接）。如需更严格的并发控制，可以：
- 在服务层添加本地锁
- 使用 Redis 等分布式锁
- 在 IoT 平台侧实现服务端校验

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
npm run test:connection
# 或
ts-node tests/test-connection.ts
```

## 📊 状态码说明

| 状态码 | 说明 | 场景 |
|--------|------|------|
| 200 | 成功 | 操作成功完成 |
| 400 | 请求参数错误 | 缺少必填参数 |
| 401 | 未授权 | 心跳失败，连接已失效 |
| 403 | 禁止访问 | 无权断开其他控制端的连接 |
| 409 | 冲突 | 已有其他控制端连接 |
| 500 | 服务器错误 | 内部错误 |

## 🎯 最佳实践

1. **优雅退出** - 程序退出时务必调用 `disconnect` 接口
2. **异常处理** - 捕获所有可能的异常并正确处理
3. **重连机制** - 心跳失败时实现自动重连逻辑
4. **日志记录** - 记录所有连接、断开、心跳事件
5. **用户提示** - 连接失败时给用户明确的提示信息

---

**实现完成！** 🎉 现在你的控制端可以通过 IoT 平台实现互斥连接管理了。
