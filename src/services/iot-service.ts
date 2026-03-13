import Iot20180120 from '@alicloud/iot20180120';
import { 
  SetDevicePropertyRequest,
  QueryDevicePropertyStatusRequest,
  InvokeThingServiceRequest,
  QueryDeviceDetailRequest,
  QueryDeviceRequest
} from '@alicloud/iot20180120';
import * as OpenApi from '@alicloud/openapi-client';
import config from '../config/iot-config';
import {
  SetPropertyResult,
  QueryPropertyResult,
  InvokeServiceResult,
  DeviceDetailResult,
  DeviceStatusResult,
  PropertyMap,
  DeviceInfo
} from '../types/iot.types';

class IoTService {
  private client: Iot20180120;
  private iotInstanceId: string;
  private productKey: string;
  private deviceName: string;

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

  async setProperty(properties: Record<string, any>): Promise<SetPropertyResult> {
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
        success: response.body.success ?? false,
        messageId: response.body.data?.messageId,
        errorMessage: response.body.errorMessage
      };
    } catch (error) {
      const err = error as Error;
      console.error('[IoTService] 设置属性失败:', err.message);
      throw error;
    }
  }

  async queryProperty(): Promise<QueryPropertyResult> {
    try {
      console.log('[IoTService] 查询设备属性');
      const request = new QueryDevicePropertyStatusRequest({
        iotInstanceId: this.iotInstanceId,
        productKey: this.productKey,
        deviceName: this.deviceName
      });
      const response = await this.client.queryDevicePropertyStatus(request);
      const properties = response.body.data?.list?.propertyStatusInfo || [];

      const propertyMap: PropertyMap = {};
      properties.forEach((prop: any) => {
        propertyMap[prop.identifier] = {
          value: prop.value,
          time: new Date(Number(prop.time)).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
        };
      });

      return { success: true, properties: propertyMap, count: properties.length };
    } catch (error) {
      const err = error as Error;
      console.error('[IoTService] 查询属性失败:', err.message);
      throw error;
    }
  }

  async invokeService(serviceId: string, args: Record<string, any> = {}): Promise<InvokeServiceResult> {
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
        success: response.body.success ?? false,
        messageId: response.body.data?.messageId,
        errorMessage: response.body.errorMessage
      };
    } catch (error) {
      const err = error as Error;
      console.error('[IoTService] 调用服务失败:', err.message);
      throw error;
    }
  }

  async queryDeviceDetail(): Promise<DeviceDetailResult> {
    try {
      console.log('[IoTService] 查询设备详情');
      const request = new QueryDeviceDetailRequest({
        iotInstanceId: this.iotInstanceId,
        productKey: this.productKey,
        deviceName: this.deviceName
      });
      const response = await this.client.queryDeviceDetail(request);
      const deviceInfo = response.body.data;
      if (!deviceInfo) {
        throw new Error('设备信息为空');
      }
      
      // 修正 online 字段：优先使用 status 判断
      // 阿里云 SDK 的 online 字段可能不准确，status 更可靠
      const isOnline = deviceInfo.status === 'ONLINE';
      
      return {
        success: true,
        deviceName: deviceInfo.deviceName ?? '',
        productKey: deviceInfo.productKey ?? '',
        deviceSecret: (deviceInfo.deviceSecret?.substring(0, 8) ?? '') + '****',
        status: deviceInfo.status ?? '',
        online: isOnline,
        gmtCreate: deviceInfo.gmtCreate ? new Date(deviceInfo.gmtCreate).toLocaleString('zh-CN') : '',
        gmtActive: deviceInfo.gmtActive ? new Date(deviceInfo.gmtActive).toLocaleString('zh-CN') : '',
        gmtOnline: deviceInfo.gmtOnline
          ? new Date(deviceInfo.gmtOnline).toLocaleString('zh-CN')
          : 'N/A',
        ipAddress: deviceInfo.ipAddress || 'N/A'
      };
    } catch (error) {
      const err = error as Error;
      console.error('[IoTService] 查询设备详情失败:', err.message);
      throw error;
    }
  }

  async getDeviceStatus(): Promise<DeviceStatusResult> {
    try {
      const detail = await this.queryDeviceDetail();
      const property = await this.queryProperty();
      
      return {
        success: true,
        online: detail.online,
        status: detail.status,
        properties: property.properties,
        lastOnlineTime: detail.gmtOnline,
        ipAddress: detail.ipAddress
      };
    } catch (error) {
      const err = error as Error;
      console.error('[IoTService] 获取设备状态失败:', err.message);
      throw error;
    }
  }

  /**
   * 查询设备列表
   * @param productKey 可选，指定产品Key则只查询该产品下的设备，不指定则使用配置的默认产品
   */
  async queryDeviceList(productKey?: string): Promise<DeviceInfo[]> {
    try {
      const targetProductKey = productKey || this.productKey;
      console.log(`[IoTService] 查询设备列表, ProductKey: ${targetProductKey}`);
      
      const request = new QueryDeviceRequest({
        iotInstanceId: this.iotInstanceId,
        productKey: targetProductKey,
        pageSize: 50,
        currentPage: 1
      });
      
      const response = await this.client.queryDevice(request);
      const deviceList = response.body.data?.deviceInfo || [];
      
      const devices: DeviceInfo[] = await Promise.all(
        deviceList.map(async (device: any) => {
          const deviceName = device.deviceName || '';
          const deviceProductKey = device.productKey || targetProductKey;
          let status = device.status || '';
          let gmtCreate = device.gmtCreate ? new Date(device.gmtCreate).toLocaleString('zh-CN') : '';
          let gmtActive = device.gmtActive ? new Date(device.gmtActive).toLocaleString('zh-CN') : '';
          let gmtOnline = device.gmtOnline ? new Date(device.gmtOnline).toLocaleString('zh-CN') : 'N/A';
          let ipAddress = device.ipAddress || 'N/A';

          try {
            const detailRequest = new QueryDeviceDetailRequest({
              iotInstanceId: this.iotInstanceId,
              productKey: deviceProductKey,
              deviceName
            });
            const detailResponse = await this.client.queryDeviceDetail(detailRequest);
            const detail = detailResponse.body.data;
            console.log(`[IoTService] 设备详情 ${deviceName}: status=${detail?.status}, online=${detail?.status === 'ONLINE'}`);
            if (detail) {
              status = detail.status || status;
              gmtCreate = detail.gmtCreate ? new Date(detail.gmtCreate).toLocaleString('zh-CN') : gmtCreate;
              gmtActive = detail.gmtActive ? new Date(detail.gmtActive).toLocaleString('zh-CN') : gmtActive;
              gmtOnline = detail.gmtOnline ? new Date(detail.gmtOnline).toLocaleString('zh-CN') : gmtOnline;
              ipAddress = detail.ipAddress || ipAddress;
            }
          } catch (error) {
            const err = error as Error;
            console.warn(`[IoTService] 查询设备详情失败(${deviceProductKey}/${deviceName}): ${err.message}`);
          }

          return {
            deviceName,
            productKey: deviceProductKey,
            status,
            online: status === 'ONLINE',
            gmtCreate,
            gmtActive,
            gmtOnline,
            ipAddress,
            nickname: device.nickname || deviceName
          };
        })
      );
      
      console.log(`[IoTService] 查询到 ${devices.length} 个设备`);
      return devices;
    } catch (error) {
      const err = error as Error;
      console.error('[IoTService] 查询设备列表失败:', err.message);
      throw error;
    }
  }
}

export default IoTService;
