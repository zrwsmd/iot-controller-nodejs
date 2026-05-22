# 测试不同 IDE 的互斥连接

本文档说明如何验证同一台工控机同一时间只允许一个 IDE 连接。

## 背景

`npm run example:client` 默认使用固定的 `clientId`：

```text
ide-client-12345678
```

如果同时打开两个窗口都直接执行 `npm run example:client`，两个窗口发送的是同一个 `clientId`。工控机会把它们识别为同一个 IDE 的重连，所以两个窗口看起来都能连接成功。

要验证“第二个 IDE 不能连接”，必须让两个窗口使用不同的 `clientId`。

## 测试步骤

先启动本地 IDE 服务：

```powershell
cd E:\windsurf-project\iot-controller-nodejs
npm run dev
```

然后打开两个新的 cmd 或 PowerShell 窗口。

窗口 A：

```powershell
cd E:\windsurf-project\iot-controller-nodejs
npm run example:client -- --clientId=ide-client-a
```

窗口 A 连接成功后保持不要关闭。

窗口 B：

```powershell
cd E:\windsurf-project\iot-controller-nodejs
npm run example:client -- --clientId=ide-client-b
```

也可以使用位置参数：

```powershell
npm run example:client -- ide-client-a
npm run example:client -- ide-client-b
```

## 预期结果

窗口 A：

```text
连接成功，并持续发送心跳
```

窗口 B：

```text
连接失败，提示已有其他 IDE 连接
```

工控机侧可能会返回类似：

```text
device is occupied by ide-client-a
```

本地 IDE 服务侧可能会返回：

```text
已有其他IDE连接 (ID: ide-client-a)，请稍后重试
```

## 结论

互斥逻辑已经实现。当前规则是：

```text
没有 IDE 连接 -> 接受
同一个 clientId 再连接 -> 认为是同一个 IDE 重连，接受
不同 clientId 再连接 -> 拒绝
```

所以测试互斥时，两个窗口必须使用不同的 `clientId`。
