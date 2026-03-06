import { Request, Response } from 'express';
import ConnectionService from '../services/connection-service';

class ConnectionController {
  private connectionService: ConnectionService;

  constructor() {
    this.connectionService = new ConnectionService();
  }

  /**
   * 获取当前连接状态
   * GET /api/connection/status
   */
  async getStatus(_req: Request, res: Response): Promise<void> {
    try {
      const status = await this.connectionService.checkConnectionStatus();
      res.json({
        success: true,
        message: '查询连接状态成功',
        data: status
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        success: false,
        message: '查询连接状态失败',
        error: err.message
      });
    }
  }

  /**
   * 请求连接
   * POST /api/connection/connect
   * Body: { clientId: string, clientInfo?: string }
   */
  async connect(req: Request, res: Response): Promise<void> {
    try {
      const { clientId, clientInfo } = req.body;

      if (!clientId) {
        res.status(400).json({
          success: false,
          message: 'clientId 参数必填'
        });
        return;
      }

      const result = await this.connectionService.connect({
        clientId,
        clientInfo
      });

      if (result.success) {
        res.json(result);
      } else {
        res.status(409).json(result); // 409 Conflict
      }
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        success: false,
        message: '连接失败',
        error: err.message
      });
    }
  }

  /**
   * 断开连接
   * POST /api/connection/disconnect
   * Body: { clientId: string }
   */
  async disconnect(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.body;

      if (!clientId) {
        res.status(400).json({
          success: false,
          message: 'clientId 参数必填'
        });
        return;
      }

      const result = await this.connectionService.disconnect(clientId);

      if (result.success) {
        res.json(result);
      } else {
        res.status(403).json(result); // 403 Forbidden
      }
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        success: false,
        message: '断开连接失败',
        error: err.message
      });
    }
  }

  /**
   * 强制断开连接（管理员功能）
   * POST /api/connection/force-disconnect
   */
  async forceDisconnect(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.connectionService.forceDisconnect();
      res.json(result);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        success: false,
        message: '强制断开连接失败',
        error: err.message
      });
    }
  }

  /**
   * 心跳保活
   * POST /api/connection/heartbeat
   * Body: { clientId: string }
   */
  async heartbeat(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.body;

      if (!clientId) {
        res.status(400).json({
          success: false,
          message: 'clientId 参数必填'
        });
        return;
      }

      const result = await this.connectionService.heartbeat(clientId);

      if (result.success) {
        res.json(result);
      } else {
        res.status(401).json(result); // 401 Unauthorized
      }
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        success: false,
        message: '心跳失败',
        error: err.message
      });
    }
  }
}

export default ConnectionController;
