import express, { Request, Response } from 'express';
import ConnectionController from '../controllers/connection-controller';

const router = express.Router();
const connectionController = new ConnectionController();

// 查询连接状态
router.get('/status', (req: Request, res: Response) => 
  connectionController.getStatus(req, res)
);

// 请求连接
router.post('/connect', (req: Request, res: Response) => 
  connectionController.connect(req, res)
);

// 断开连接
router.post('/disconnect', (req: Request, res: Response) => 
  connectionController.disconnect(req, res)
);

// 强制断开连接（管理员）
router.post('/force-disconnect', (req: Request, res: Response) => 
  connectionController.forceDisconnect(req, res)
);

// 心跳保活
router.post('/heartbeat', (req: Request, res: Response) => 
  connectionController.heartbeat(req, res)
);

export default router;
