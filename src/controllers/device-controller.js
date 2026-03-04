const IoTService = require('../services/iot-service');

class DeviceController {
  constructor() {
    this.iotService = new IoTService();
  }

  async setADASSwitch(req, res) {
    try {
      const { value } = req.body;
      if (value !== 0 && value !== 1) {
        return res.status(400).json({ success: false, message: 'ADASSwitch 值必须是 0 或 1' });
      }
      const result = await this.iotService.setProperty({ ADASSwitch: value });
      res.json({
        success: result.success,
        message: `ADASSwitch 设置为 ${value === 1 ? '开' : '关'}`,
        data: { messageId: result.messageId, value, description: value === 1 ? '开' : '关' }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: '设置属性失败', error: error.message });
    }
  }

  async setProperty(req, res) {
    try {
      const { properties } = req.body;
      if (!properties || typeof properties !== 'object') {
        return res.status(400).json({ success: false, message: '属性参数格式错误' });
      }
      const result = await this.iotService.setProperty(properties);
      res.json({
        success: result.success,
        message: '属性设置成功',
        data: { messageId: result.messageId, properties }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: '设置属性失败', error: error.message });
    }
  }

  async queryProperty(req, res) {
    try {
      const result = await this.iotService.queryProperty();
      res.json({
        success: true,
        message: '查询属性成功',
        data: { properties: result.properties, count: result.count }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: '查询属性失败', error: error.message });
    }
  }

  async restart(req, res) {
    try {
      const result = await this.iotService.invokeService('restart', {});
      res.json({
        success: result.success,
        message: '重启指令已发送',
        data: { messageId: result.messageId, service: 'restart' }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: '调用服务失败', error: error.message });
    }
  }

  async invokeService(req, res) {
    try {
      const { serviceId } = req.params;
      const { args = {} } = req.body;
      const result = await this.iotService.invokeService(serviceId, args);
      res.json({
        success: result.success,
        message: `服务 ${serviceId} 调用成功`,
        data: { messageId: result.messageId, service: serviceId }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: '调用服务失败', error: error.message });
    }
  }

  async queryDetail(req, res) {
    try {
      const result = await this.iotService.queryDeviceDetail();
      res.json({ success: true, message: '查询设备详情成功', data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: '查询设备详情失败', error: error.message });
    }
  }

  async getStatus(req, res) {
    try {
      const result = await this.iotService.getDeviceStatus();
      res.json({ success: true, message: '获取设备状态成功', data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取设备状态失败', error: error.message });
    }
  }
}

module.exports = DeviceController;
