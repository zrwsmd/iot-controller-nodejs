# 项目部署功能文档

## 📋 功能概述

实现从控制端（IDE）向上位机远程部署项目的完整功能，包括项目打包、上传、通知部署、状态查询等。

## 🏗️ 架构设计

### 方案选择：OSS + IoT 通知

```
┌─────────────────────────────────────────────────────────────────┐
│                      部署流程架构                                │
└─────────────────────────────────────────────────────────────────┘

控制端（IDE）          阿里云 OSS          IoT 平台          上位机
     │                     │                   │                │
     │ 1. 打包项目          │                   │                │
     │    (zip)            │                   │                │
     │                     │                   │                │
     │ 2. 上传到 OSS        │                   │                │
     ├────────────────────>│                   │                │
     │                     │                   │                │
     │ 3. 获取下载 URL      │                   │                │
     │<────────────────────┤                   │                │
     │                     │                   │                │
     │ 4. 调用部署服务      │                   │                │
     │    (传递 URL)       │                   │                │
     ├─────────────────────────────────────────>│                │
     │                     │                   │ 5. 转发        │
     │                     │                   ├───────────────>│
     │                     │                   │                │
     │                     │ 6. 下载项目        │                │
     │                     │<──────────────────────────────────┤
     │                     │                   │                │
     │                     │                   │ 7. 解压部署     │
     │                     │                   │                │
     │                     │                   │ 8. 更新状态     │
     │                     │                   │<───────────────┤
     │                     │                   │                │
     │ 9. 查询部署结果      │                   │                │
     │<─────────────────────────────────────────┤                │
     │                     │                   │                │
```

## 📡 物模型设计

### 1. 服务：deployProject

```json
{
  "identifier": "deployProject",
  "name": "部署项目",
  "callType": "async",
  "inputData": [
    {
      "identifier": "projectName",
      "dataType": { "type": "text", "specs": { "length": "128" } },
      "name": "项目名称"
    },
    {
      "identifier": "downloadUrl",
      "dataType": { "type": "text", "specs": { "length": "512" } },
      "name": "项目下载地址（OSS 签名 URL）"
    },
    {
      "identifier": "deployPath",
      "dataType": { "type": "text", "specs": { "length": "256" } },
      "name": "部署路径"
    },
    {
      "identifier": "deployCommand",
      "dataType": { "type": "text", "specs": { "length": "512" } },
      "name": "部署命令"
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
      "dataType": { "type": "text", "specs": { "length": "512" } },
      "name": "返回消息"
    },
    {
      "identifier": "deployLog",
      "dataType": { "type": "text", "specs": { "length": "2048" } },
      "name": "部署日志"
    }
  ]
}
```

### 2. 属性：deployStatus

```json
{
  "identifier": "deployStatus",
  "dataType": {
    "type": "text",
    "specs": { "length": "2048" }
  },
  "name": "部署状态",
  "accessMode": "rw",
  "description": "存储最新的部署状态信息（JSON格式）"
}
```

**deployStatus 存储格式：**
```json
{
  "success": true,
  "message": "部署成功",
  "deployLog": "npm install...\nnpm run build...\n部署完成",
  "timestamp": 1772779123456,
  "projectName": "iot-controller-nodejs",
  "deployPath": "/home/user/projects/iot-controller-nodejs"
}
```

## 🔧 安装依赖

```bash
npm install archiver @types/archiver ali-oss
```

**依赖说明：**
- `archiver`: 用于打包项目为 zip 文件
- `ali-oss`: 阿里云 OSS SDK，用于上传文件

## ⚙️ 环境配置

在 `.env` 文件中添加 OSS 配置：

```env
# 阿里云 OSS 配置
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_BUCKET=iot-deploy-bucket
```

## 📡 API 接口

### 调用方式说明

- **调用方视角**
  - 调用方不需要先手动上传项目到 OSS。
  - 调用方只需要调用 `POST /api/deploy/project`，并传入本地项目目录、项目名称、部署路径、部署命令。

- **控制端服务内部视角**
  - 控制端服务在收到 `/api/deploy/project` 请求后，会自动执行以下动作：
    1. 将 `projectPath` 指向的项目目录打包成 zip。
    2. 将 zip 文件上传到 OSS。
    3. 生成带签名的下载 URL。
    4. 调用 IoT 服务 `deployProject`，把下载 URL 和部署参数传给上位机。
    5. 上位机根据 URL 下载压缩包并执行解压、部署。

- **结论**
  - 不是“跳过 OSS 直接部署”，而是“OSS 上传动作被封装在控制端部署接口内部”。

### 1. 部署项目

**请求：**
```http
POST /api/deploy/project
Content-Type: application/json

{
  "projectPath": "/path/to/your/project",
  "projectName": "my-project",
  "deployPath": "/home/user/projects",
  "deployCommand": "npm install && npm run build"
}
```

**说明：**
- `projectPath` 是控制端服务器本地可访问的项目目录路径。
- 调用这个接口后，控制端会先在服务内部执行“打包 -> 上传 OSS -> 调用上位机部署服务”。
- 调用方本身不需要关心 OSS 上传细节，也不需要自己传 `downloadUrl`。

**响应示例（成功）：**
```json
{
  "success": true,
  "message": "部署成功",
  "deployLog": "npm install\n...\nnpm run build\n...\n部署完成"
}
```

**响应示例（失败）：**
```json
{
  "success": false,
  "message": "部署失败：npm install 失败",
  "deployLog": "npm ERR! ..."
}
```

### 2. 查询部署状态

**请求：**
```http
GET /api/deploy/status
```

**响应示例：**
```json
{
  "success": true,
  "message": "查询部署状态成功",
  "data": {
    "success": true,
    "message": "部署成功",
    "deployLog": "...",
    "timestamp": 1772779123456,
    "projectName": "iot-controller-nodejs"
  }
}
```

## 💻 使用示例

### 方式一：使用 API

```typescript
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function deployProject() {
  try {
    const response = await axios.post(`${BASE_URL}/api/deploy/project`, {
      projectPath: '/path/to/your/project',
      projectName: 'my-project',
      deployPath: '/home/user/projects',
      deployCommand: 'npm install && npm run build && npm start'
    });

    console.log('部署结果:', response.data);
  } catch (error) {
    console.error('部署失败:', error);
  }
}
```

### 方式二：使用命令行示例

```bash
# 运行部署示例
npm run example:deploy
```

### 方式三：直接使用 DeployService

```typescript
import DeployService from './src/services/deploy-service';

const deployService = new DeployService();

await deployService.deployFullWorkflow({
  projectPath: '/path/to/your/project',
  projectName: 'my-project',
  deployPath: '/home/user/projects',
  deployCommand: 'npm install && npm run build'
});
```

## 🔄 完整流程

### 两层流程说明

#### 1. 调用方看到的流程

```text
调用方
  -> POST /api/deploy/project
  -> 等待部署结果 / 查询部署状态
```

#### 2. 控制端服务内部实际流程

```text
接收部署请求
  -> 打包本地项目目录
  -> 上传 zip 到 OSS
  -> 生成签名下载 URL
  -> 调用 IoT deployProject 服务
  -> 上位机下载并部署
  -> 查询 deployStatus
  -> 返回结果给调用方
```

### 控制端流程

1. **打包项目**
   ```typescript
   await deployService.packProject(projectPath, zipFilePath);
   ```
   - 排除 `node_modules`、`dist`、`.git` 等目录
   - 生成 zip 压缩包

2. **上传到 OSS**
   ```typescript
   const downloadUrl = await deployService.uploadToOSS(zipFilePath, objectName);
   ```
   - 上传到阿里云 OSS
   - 生成带签名的下载 URL（有效期 1 小时）

3. **通知上位机部署**
   ```typescript
   await iotService.invokeService('deployProject', {
     projectName,
     downloadUrl,
     deployPath,
     deployCommand
   });
   ```

4. **查询部署状态**
   ```typescript
   const status = await deployService.checkDeployStatus();
   ```

5. **清理临时文件**
   ```typescript
   fs.unlinkSync(zipFilePath);
   ```

### 上位机流程（伪代码）

```python
def handle_deployProject(projectName, downloadUrl, deployPath, deployCommand):
    try:
        # 1. 下载项目
        zip_file = download_from_url(downloadUrl)
        
        # 2. 解压到目标路径
        target_path = os.path.join(deployPath, projectName)
        extract_zip(zip_file, target_path)
        
        # 3. 执行部署命令
        os.chdir(target_path)
        result = subprocess.run(
            deployCommand,
            shell=True,
            capture_output=True,
            text=True
        )
        
        # 4. 更新部署状态
        deploy_status = {
            "success": result.returncode == 0,
            "message": "部署成功" if result.returncode == 0 else "部署失败",
            "deployLog": result.stdout + result.stderr,
            "timestamp": int(time.time() * 1000),
            "projectName": projectName,
            "deployPath": target_path
        }
        
        set_property("deployStatus", json.dumps(deploy_status))
        
        # 5. 返回结果
        return {
            "success": deploy_status["success"],
            "message": deploy_status["message"],
            "deployLog": deploy_status["deployLog"]
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"部署失败: {str(e)}",
            "deployLog": traceback.format_exc()
        }
```

## ⚠️ 注意事项

### 1. 文件大小限制

- **IoT 平台服务调用**：单次调用数据不超过 128KB
- **OSS 上传**：单个文件最大 5GB
- **建议**：项目压缩后不超过 100MB

### 2. 安全性

- OSS URL 使用签名，有效期 1 小时
- 上位机应验证下载来源
- 部署命令应进行安全检查

### 3. 超时处理

- 上传超时：根据文件大小调整
- 部署超时：上位机应设置合理的超时时间
- 建议：大项目使用异步部署，定期查询状态

### 4. 错误处理

- 网络错误：自动重试
- 部署失败：记录详细日志
- 清理机制：失败时清理临时文件

## 📊 部署日志示例

```
========================================
  开始部署流程
========================================

1️⃣  打包项目...
   ✓ 打包完成: /temp/my-project-1772779123456.zip

2️⃣  上传到 OSS...
   ✓ 上传完成
   下载地址: https://iot-deploy-bucket.oss-cn-hangzhou.aliyuncs.com/...

3️⃣  通知上位机部署...
   ✓ 部署请求已发送

4️⃣  清理临时文件...
   ✓ 清理完成

========================================
  ✅ 部署成功
========================================

消息: 部署成功

部署日志:
----------------------------------------
npm install
added 150 packages in 10s

npm run build
> build
> tsc

Build completed successfully
----------------------------------------
```

## 🔑 关键优势

1. **大文件支持**：通过 OSS 传输，不受 IoT 平台限制
2. **安全可靠**：签名 URL、临时有效
3. **异步处理**：不阻塞控制端
4. **详细日志**：完整的部署过程记录
5. **自动清理**：临时文件自动删除

## 📁 相关文件

- **服务层**：`src/services/deploy-service.ts`
- **控制器**：`src/controllers/deploy-controller.ts`
- **路由**：`src/routes/deploy-routes.ts`
- **示例**：`examples/deploy-example.ts`

---

**总结：** 通过 OSS + IoT 通知的方式，实现了完整的远程部署功能，支持大文件传输、异步处理、详细日志记录。
