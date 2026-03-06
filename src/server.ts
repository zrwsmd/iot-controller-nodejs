import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import config from './config/iot-config';
import deviceRoutes from './routes/device-routes';
import connectionRoutes from './routes/connection-routes';
import deployRoutes from './routes/deploy-routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toLocaleString('zh-CN')}] ${req.method} ${req.path}`);
  next();
});

app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'IoT Controller API',
    version: '1.0.0',
    device: { productKey: config.productKey, deviceName: config.deviceName },
    endpoints: {
      device: {
        setADASSwitch:  'POST /api/device/adas-switch',
        setProperty:    'POST /api/device/property',
        queryProperty:  'GET  /api/device/property',
        restart:        'POST /api/device/restart',
        invokeService:  'POST /api/device/service/:serviceId',
        queryDetail:    'GET  /api/device/detail',
        getStatus:      'GET  /api/device/status'
      },
      connection: {
        status:          'GET  /api/connection/status',
        connect:         'POST /api/connection/connect',
        disconnect:      'POST /api/connection/disconnect',
        forceDisconnect: 'POST /api/connection/force-disconnect',
        heartbeat:       'POST /api/connection/heartbeat'
      }
    }
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.use('/api/device', deviceRoutes);
app.use('/api/connection', connectionRoutes);
app.use('/api/deploy', deployRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: '接口不存在', path: req.path });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
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

export default app;
