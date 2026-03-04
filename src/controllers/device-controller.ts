import { Request, Response } from 'express';
import IoTService from '../services/iot-service';

class DeviceController {
  private iotService: IoTService;

  constructor() {
    this.iotService = new IoTService();
  }

  async setADASSwitch(req: Request, res: Response): Promise<void> {
    try {
      const { value } = req.body;
      if (value !== 0 && value !== 1) {
        res.status(400).json({ success: false, message: 'ADASSwitch 值必须是 0 或 1' });
        return;
      }
      const result = await this.iotService.setProperty({ ADASSwitch: value });
      res.json({
        success: result.success,
        message: `ADASSwitch 设置为 ${value === 1 ? '开' : '关'}`,
        data: { messageId: result.messageId, value, description: value === 1 ? '开' : '关' }
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ success: false, message: '设置属性失败', error: err.message });
    }
  }

  async setProperty(req: Request, res: Response): Promise<void> {
    try {
      const { properties } = req.body;
      if (!properties || typeof properties !== 'object') {
        res.status(400).json({ success: false, message: '属性参数格式错误' });
        return;
      }
      const result = await this.iotService.setProperty(properties);
      res.json({
        success: result.success,
        message: '属性设置成功',
        data: { messageId: result.messageId, properties }
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ success: false, message: '设置属性失败', error: err.message });
    }
  }

  async queryProperty(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.iotService.queryProperty();
      res.json({
        success: true,
        message: '查询属性成功',
        data: { properties: result.properties, count: result.count }
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ success: false, message: '查询属性失败', error: err.message });
    }
  }

  async restart(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.iotService.invokeService('restart', {});
      res.json({
        success: result.success,
        message: '重启指令已发送',
        data: { messageId: result.messageId, service: 'restart' }
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ success: false, message: '调用服务失败', error: err.message });
    }
  }

  async invokeService(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      const serviceIdStr = Array.isArray(serviceId) ? serviceId[0] : serviceId;
      const { args = {} } = req.body;
      const result = await this.iotService.invokeService(serviceIdStr, args);
      res.json({
        success: result.success,
        message: `服务 ${serviceIdStr} 调用成功`,
        data: { messageId: result.messageId, service: serviceIdStr }
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ success: false, message: '调用服务失败', error: err.message });
    }
  }

  async queryDetail(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.iotService.queryDeviceDetail();
      res.json({ success: true, message: '查询设备详情成功', data: result });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ success: false, message: '查询设备详情失败', error: err.message });
    }
  }

  async getStatus(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.iotService.getDeviceStatus();
      res.json({ success: true, message: '获取设备状态成功', data: result });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ success: false, message: '获取设备状态失败', error: err.message });
    }
  }
}

export default DeviceController;
