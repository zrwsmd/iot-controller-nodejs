# IoT Controller - TypeScript 版本启动指南

## 📋 项目概述

这是一个基于 TypeScript + Node.js + Express 的阿里云 IoT 设备控制端，提供 RESTful API 来管理和控制 IoT 设备。

## 🛠️ 技术栈

- **语言**: TypeScript 5.x
- **运行时**: Node.js
- **框架**: Express.js
- **SDK**: 阿里云 IoT SDK (@alicloud/iot20180120)
- **构建工具**: TypeScript Compiler (tsc)
- **开发工具**: ts-node, nodemon

## 📦 项目结构

```
iot-controller-nodejs/
├── src/                      # TypeScript 源代码
│   ├── config/              # 配置文件
│   │   └── iot-config.ts    # IoT 配置
│   ├── types/               # TypeScript 类型定义
│   │   └── iot.types.ts     # IoT 相关类型
│   ├── services/            # 业务逻辑层
│   │   └── iot-service.ts   # IoT 服务
│   ├── controllers/         # 控制器层
│   │   └── device-controller.ts
│   ├── routes/              # 路由层
│   │   └── device-routes.ts
│   └── server.ts            # 服务器入口
├── tests/                   # 测试文件
│   ├── test-all.ts         # 完整测试
│   ├── test-query.ts       # 查询测试
│   ├── test-property.ts    # 属性测试
│   └── test-service.ts     # 服务测试
├── dist/                    # 编译输出目录（自动生成）
├── tsconfig.json           # TypeScript 配置
├── package.json            # 项目依赖
└── .env                    # 环境变量配置
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
# 阿里云访问凭证
ACCESS_KEY_ID=your_access_key_id
ACCESS_KEY_SECRET=your_access_key_secret

# IoT 平台配置
IOT_INSTANCE_ID=your_iot_instance_id
IOT_REGION=cn-shanghai

# 设备信息
PRODUCT_KEY=your_product_key
DEVICE_NAME=your_device_name

# 服务器配置
PORT=3000
NODE_ENV=development
```

### 3. 开发模式运行

#### 方式一：使用 ts-node 直接运行（推荐开发时使用）

```bash
npm run dev
```

#### 方式二：使用 nodemon 自动重启

```bash
npm run dev:watch
```

### 4. 生产模式运行

#### 步骤 1：编译 TypeScript

```bash
npm run build
```

这会将 `src/` 目录下的 TypeScript 文件编译到 `dist/` 目录。

#### 步骤 2：运行编译后的代码

```bash
npm start
```

## 🧪 运行测试

### 运行所有测试

```bash
npm test
```

### 运行单个测试

```bash
# 查询测试
npm run test:query

# 属性测试
npm run test:property

# 服务测试
npm run test:service
```

## 📡 API 接口

服务启动后，访问 `http://localhost:3000` 查看所有可用接口。

### 健康检查

```bash
GET http://localhost:3000/health
```

### 设备属性管理

```bash
# 查询设备属性
GET http://localhost:3000/api/device/property

# 设置 ADAS 开关（0=关，1=开）
POST http://localhost:3000/api/device/adas-switch
Content-Type: application/json
{
  "value": 1
}

# 设置多个属性
POST http://localhost:3000/api/device/property
Content-Type: application/json
{
  "properties": {
    "ADASSwitch": 1,
    "OtherProperty": "value"
  }
}
```

### 设备服务调用

```bash
# 重启设备
POST http://localhost:3000/api/device/restart

# 调用自定义服务
POST http://localhost:3000/api/device/service/:serviceId
Content-Type: application/json
{
  "args": {
    "param1": "value1"
  }
}
```

### 设备信息查询

```bash
# 查询设备详情
GET http://localhost:3000/api/device/detail

# 获取设备状态（详情+属性）
GET http://localhost:3000/api/device/status
```

## 🔧 开发命令

| 命令 | 说明 |
|------|------|
| `npm run build` | 编译 TypeScript 代码 |
| `npm start` | 运行编译后的代码（生产模式） |
| `npm run dev` | 使用 ts-node 直接运行（开发模式） |
| `npm run dev:watch` | 使用 nodemon 自动重启（开发模式） |
| `npm test` | 运行完整测试套件 |
| `npm run test:query` | 运行查询测试 |
| `npm run test:property` | 运行属性测试 |
| `npm run test:service` | 运行服务测试 |
| `npm run clean` | 清理编译输出目录 |

## 📝 TypeScript 配置说明

项目使用严格的 TypeScript 配置（`tsconfig.json`）：

- **严格模式**: 启用所有严格类型检查
- **目标版本**: ES2020
- **模块系统**: CommonJS
- **输出目录**: `dist/`
- **源码目录**: `src/`
- **生成声明文件**: 是
- **生成 Source Map**: 是

## ⚠️ 常见问题

### 1. 编译错误

如果遇到类型错误，检查：
- 是否安装了所有类型定义包（`@types/*`）
- TypeScript 版本是否正确
- `tsconfig.json` 配置是否正确

### 2. 运行时错误

如果遇到 "Cannot find module" 错误：
- 确保已运行 `npm run build`
- 检查 `dist/` 目录是否存在
- 确认环境变量配置正确

### 3. API 超时错误

如果看到 `ReadTimeout(3000)` 错误：
- 检查 RAM 用户是否有 IoT 权限
- 在阿里云 RAM 控制台添加 `AliyunIOTFullAccess` 权限
- 确认网络连接正常

## 🔐 权限配置

确保阿里云 RAM 用户具有以下权限：

1. 登录 [RAM 控制台](https://ram.console.aliyun.com/users)
2. 找到你的 RAM 用户
3. 添加权限策略：`AliyunIOTFullAccess`（IoT 完全访问权限）

## 📚 相关文档

- [阿里云 IoT 平台文档](https://help.aliyun.com/product/30520.html)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Express.js 文档](https://expressjs.com/)

## 🎯 下一步

1. 根据实际需求修改 `.env` 配置
2. 运行 `npm run dev` 启动开发服务器
3. 使用 Postman 或 curl 测试 API
4. 查看 TypeScript 类型提示，了解数据结构
5. 根据需要扩展更多 API 接口

## 💡 提示

- TypeScript 提供了完整的类型检查，可以在编码时发现潜在问题
- 使用 IDE（如 VS Code）可以获得更好的类型提示和自动完成
- 所有类型定义在 `src/types/iot.types.ts` 中，可根据需要扩展
- 开发时使用 `npm run dev:watch` 可以自动重启服务器

---

**祝开发顺利！** 🚀
