require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config/iot-config');
const deviceRoutes = require('./routes/device-routes');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleString('zh-CN')}] ${req.method} ${req.path}`);
  next();
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: 'IoT Controller API',
    version: '1.0.0',
    device: { productKey: config.productKey, deviceName: config.deviceName },
    endpoints: {
      setADASSwitch:  'POST /api/device/adas-switch',
      setProperty:    'POST /api/device/property',
      queryProperty:  'GET  /api/device/property',
      restart:        'POST /api/device/restart',
      invokeService:  'POST /api/device/service/:serviceId',
      queryDetail:    'GET  /api/device/detail',
      getStatus:      'GET  /api/device/status'
    }
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// 设备 API
app.use('/api/device', deviceRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: '接口不存在', path: req.path });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: config.nodeEnv === 'development' ? err.message : undefined
  });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('  IoT Controller API 启动成功');
  console.log('========================================');
  console.log(`📖 地址: http://localhost:${PORT}`);
  console.log(`💚 健康检查: http://localhost:${PORT}/health`);
  console.log(`📱 设备: ${config.productKey}/${config.deviceName}`);
  console.log('========================================\n');
});

module.exports = app;
