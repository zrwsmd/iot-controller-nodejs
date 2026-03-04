const Iot20180120 = require('@alicloud/iot20180120').default;
const { 
  SetDevicePropertyRequest,
  QueryDevicePropertyStatusRequest,
  InvokeThingServiceRequest,
  QueryDeviceDetailRequest
} = require('@alicloud/iot20180120');
const OpenApi = require('@alicloud/openapi-client');
const config = require('../config/iot-config');

class IoTService {
  constructor() {
    const openApiConfig = new OpenApi.Config({
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      endpoint: config.endpoint
    });

    this.client = new Iot20180120(openApiConfig);
    this.iotInstanceId = config.iotInstanceId;
    this.productKey = config.productKey;
    this.deviceName = config.deviceName;

    console.log('[IoTService] 初始化成功');
    console.log(`[IoTService] 设备: ${this.productKey}/${this.deviceName}`);
  }

  /**
   * 1. 设置设备属性
   * @param {Object} properties - 例如 { ADASSwitch: 1 }
   */
  async setProperty(properties) {
    try {
      console.log('[IoTService] 设置属性:', properties);
      const request = new SetDevicePropertyRequest({
        iotInstanceId: this.iotInstanceId,
        productKey: this.productKey,
        deviceName: this.deviceName,
        items: JSON.stringify(properties)
      });
      const response = await this.client.setDeviceProperty(request);
      return {
        success: response.body.success,
        messageId: response.body.data?.messageId,
        errorMessage: response.body.errorMessage
      };
    } catch (error) {
      console.error('[IoTService] 设置属性失败:', error.message);
      throw error;
    }
  }

  /**
   * 2. 查询设备属性
   */
  async queryProperty() {
    try {
      console.log('[IoTService] 查询设备属性');
      const request = new QueryDevicePropertyStatusRequest({
        iotInstanceId: this.iotInstanceId,
        productKey: this.productKey,
        deviceName: this.deviceName
      });
      const response = await this.client.queryDevicePropertyStatus(request);
      const properties = response.body.data?.list?.propertyStatusInfo || [];

      const propertyMap = {};
      properties.forEach(prop => {
        propertyMap[prop.identifier] = {
          value: prop.value,
          time: new Date(prop.time).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
        };
      });

      return { success: true, properties: propertyMap, count: properties.length };
    } catch (error) {
      console.error('[IoTService] 查询属性失败:', error.message);
      throw error;
    }
  }

  /**
   * 3. 调用设备服务
   * @param {String} serviceId - 例如 'restart'
   * @param {Object} args
   */
  async invokeService(serviceId, args = {}) {
    try {
      console.log(`[IoTService] 调用服务: ${serviceId}`, args);
      const request = new InvokeThingServiceRequest({
        iotInstanceId: this.iotInstanceId,
        productKey: this.productKey,
        deviceName: this.deviceName,
        identifier: serviceId,
        args: JSON.stringify(args)
      });
      const response = await this.client.invokeThingService(request);
      return {
        success: response.body.success,
        messageId: response.body.data?.messageId,
        errorMessage: response.body.errorMessage
      };
    } catch (error) {
      console.error('[IoTService] 调用服务失败:', error.message);
      throw error;
    }
  }

  /**
   * 4. 查询设备详情
   */
  async queryDeviceDetail() {
    try {
      console.log('[IoTService] 查询设备详情');
      const request = new QueryDeviceDetailRequest({
        iotInstanceId: this.iotInstanceId,
        productKey: this.productKey,
        deviceName: this.deviceName
      });
      const response = await this.client.queryDeviceDetail(request);
      const deviceInfo = response.body.data;
      return {
        success: true,
        deviceName: deviceInfo.deviceName,
        productKey: deviceInfo.productKey,
        deviceSecret: deviceInfo.deviceSecret?.substring(0, 8) + '****',
        status: deviceInfo.status,
        online: deviceInfo.online,
        gmtCreate: new Date(deviceInfo.gmtCreate).toLocaleString('zh-CN'),
        gmtActive: new Date(deviceInfo.gmtActive).toLocaleString('zh-CN'),
        gmtOnline: deviceInfo.gmtOnline
          ? new Date(deviceInfo.gmtOnline).toLocaleString('zh-CN')
          : 'N/A',
        ipAddress: deviceInfo.ipAddress || 'N/A'
      };
    } catch (error) {
      console.error('[IoTService] 查询设备详情失败:', error.message);
      throw error;
    }
  }

  /**
   * 5. 获取设备状态（综合信息）
   */
  async getDeviceStatus() {
    try {
      console.log('[IoTService] 获取设备状态');
      const [detail, property] = await Promise.all([
        this.queryDeviceDetail(),
        this.queryProperty()
      ]);
      return {
        success: true,
        online: detail.online,
        status: detail.status,
        properties: property.properties,
        lastOnlineTime: detail.gmtOnline,
        ipAddress: detail.ipAddress
      };
    } catch (error) {
      console.error('[IoTService] 获取设备状态失败:', error.message);
      throw error;
    }
  }
}

module.exports = IoTService;
