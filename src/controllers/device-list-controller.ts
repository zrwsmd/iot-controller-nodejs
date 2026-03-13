import { Request, Response } from 'express';
import IoTService from '../services/iot-service';

class DeviceListController {
  private iotService: IoTService;

  constructor() {
    this.iotService = new IoTService();
  }

  /**
   * 查询设备列表
   * GET /api/devices/list
   * Query: productKey (可选)
   */
  async getDeviceList(req: Request, res: Response): Promise<void> {
    try {
      const { productKey } = req.query;
      
      const devices = await this.iotService.queryDeviceList(productKey as string);
      
      res.json({
        success: true,
        data: {
          devices,
          total: devices.length
        }
      });
    } catch (error) {
      const err = error as Error;
      console.error('[DeviceListController] 查询设备列表失败:', err.message);
      res.status(500).json({
        success: false,
        message: '查询设备列表失败',
        error: err.message
      });
    }
  }
}

export default DeviceListController;
