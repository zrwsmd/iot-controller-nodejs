import IoTService from './iot-service';
import { IDEInfo, ConnectionStatus, ConnectRequest, ConnectResult } from '../types/connection.types';

class ConnectionService {
  private iotService: IoTService;

  constructor() {
    this.iotService = new IoTService();
  }

  /**
   * 检查当前连接状态（通过查询属性和设备在线状态）
   */
  async checkConnectionStatus(): Promise<ConnectionStatus> {
    try {
      // 1. 先检查设备是否在线（从阿里云平台获取）
      const deviceStatus = await this.iotService.getDeviceStatus();
      console.log('[ConnectionService] 设备在线状态:', deviceStatus.online);
      
      // 如果设备离线，直接返回未连接
      if (!deviceStatus.online) {
        console.log('[ConnectionService] 设备离线，连接无效');
        return { connected: false };
      }
      
      // 2. 设备在线，再检查 IDE 连接状态
      const result = await this.iotService.queryProperty();
      const connectedValue = result.properties.hasIDEConnected?.value;
      console.log('[ConnectionService] hasIDEConnected 原始值:', connectedValue, '类型:', typeof connectedValue);
      const hasIDEConnected = String(connectedValue) === 'true' || connectedValue === 1 || String(connectedValue) === '1';
      
      // 3. 只有设备在线且 hasIDEConnected 为 true 时才认为连接有效
      if (hasIDEConnected && result.properties.IDEInfo) {
        const ideInfoData = result.properties.IDEInfo.value;
        let ideInfo: IDEInfo | undefined;
        
        if (typeof ideInfoData === 'string') {
          try {
            ideInfo = JSON.parse(ideInfoData);
          } catch {
            ideInfo = undefined;
          }
        } else if (typeof ideInfoData === 'object') {
          ideInfo = ideInfoData as IDEInfo;
        }

        // 获取心跳时间
        const heartbeatData = result.properties.IDEHeartbeat?.value;
        let lastHeartbeat: number | undefined;
        if (typeof heartbeatData === 'string') {
          lastHeartbeat = parseInt(heartbeatData, 10);
        } else if (typeof heartbeatData === 'number') {
          lastHeartbeat = heartbeatData;
        }

        console.log('[ConnectionService] 设备在线且已连接IDE:', ideInfo?.clientId);
        return { connected: true, ideInfo, lastHeartbeat };
      }

      console.log('[ConnectionService] 设备在线但未连接IDE');
      return { connected: false };
    } catch (error) {
      console.error('[ConnectionService] 检查连接状态失败:', error);
      throw error;
    }
  }

  /**
   * 请求连接（调用上位机服务）
   */
  async connect(request: ConnectRequest): Promise<ConnectResult> {
    try {
      console.log('[ConnectionService] 请求连接:', request.clientId);
      
      // 调用上位机的 requestConnect 服务
      await this.iotService.invokeService('requestConnect', {
        clientId: request.clientId,
        clientInfo: request.clientInfo || JSON.stringify({
          platform: 'nodejs',
          version: '1.0.0',
          timestamp: Date.now()
        })
      });

      // 等待一下让上位机处理完成
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 查询连接状态确认
      const status = await this.checkConnectionStatus();
      
      if (status.connected && status.ideInfo?.clientId === request.clientId) {
        return {
          success: true,
          message: '连接成功',
          data: {
            clientId: request.clientId,
            connectTime: status.ideInfo.connectTime
          }
        };
      } else if (status.connected && status.ideInfo?.clientId !== request.clientId) {
        return {
          success: false,
          message: `已有其他IDE连接 (ID: ${status.ideInfo?.clientId || 'unknown'})，请稍后重试`
        };
      } else {
        return {
          success: false,
          message: '连接失败，上位机未响应'
        };
      }
    } catch (error) {
      const err = error as Error;
      console.error('[ConnectionService] 连接失败:', err.message);
      throw error;
    }
  }

  /**
   * 请求断开连接（调用上位机服务）
   */
  async disconnect(clientId: string): Promise<ConnectResult> {
    try {
      console.log('[ConnectionService] 请求断开连接:', clientId);
      
      // 调用上位机的 requestDisconnect 服务
      await this.iotService.invokeService('requestDisconnect', {
        clientId
      });

      // 等待一下让上位机处理完成
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 查询连接状态确认
      const status = await this.checkConnectionStatus();
      
      if (!status.connected) {
        return {
          success: true,
          message: '断开连接成功'
        };
      } else {
        return {
          success: false,
          message: '断开连接失败，上位机未响应'
        };
      }
    } catch (error) {
      const err = error as Error;
      console.error('[ConnectionService] 断开连接失败:', err.message);
      throw error;
    }
  }

  /**
   * 强制断开连接（直接设置属性，不调用服务）
   */
  async forceDisconnect(): Promise<ConnectResult> {
    try {
      console.log('[ConnectionService] 强制断开连接');
      
      await this.iotService.setProperty({
        hasIDEConnected: false,
        IDEInfo: '',
        IDEHeartbeat: ''
      });

      return {
        success: true,
        message: '强制断开连接成功'
      };
    } catch (error) {
      const err = error as Error;
      console.error('[ConnectionService] 强制断开连接失败:', err.message);
      throw error;
    }
  }

  /**
   * 发送心跳（调用上位机服务）
   */
  async heartbeat(clientId: string): Promise<ConnectResult> {
    try {
      console.log('[ConnectionService] 发送心跳:', clientId);
      
      // 调用上位机的 ideHeartbeat 服务
      await this.iotService.invokeService('ideHeartbeat', {
        clientId
      });

      // 等待一下让上位机处理完成
      await new Promise(resolve => setTimeout(resolve, 500));

      // 查询连接状态确认
      const status = await this.checkConnectionStatus();
      
      if (status.connected && status.ideInfo?.clientId === clientId) {
        return {
          success: true,
          message: '心跳成功',
          data: {
            clientId,
            connectTime: status.lastHeartbeat || Date.now()
          }
        };
      } else {
        return {
          success: false,
          message: '连接已失效，需要重新连接'
        };
      }
    } catch (error) {
      const err = error as Error;
      console.error('[ConnectionService] 心跳失败:', err.message);
      throw error;
    }
  }
}

export default ConnectionService;
