import IoTService from './iot-service';
import { IDEInfo, ConnectionStatus, ConnectRequest, ConnectResult } from '../types/connection.types';

class ConnectionService {
  private iotService: IoTService;

  constructor() {
    this.iotService = new IoTService();
  }

  /**
   * 检查当前连接状态（通过查询属性）
   */
  async checkConnectionStatus(): Promise<ConnectionStatus> {
    try {
      const result = await this.iotService.queryProperty();
      const connectedValue = result.properties.hasIDEConnected?.value;
      console.log('[ConnectionService] hasIDEConnected 原始值:', connectedValue, '类型:', typeof connectedValue);
      const connected = String(connectedValue) === 'true' || connectedValue === 1 || String(connectedValue) === '1';
      
      if (connected && result.properties.IDEInfo) {
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

        return { connected: true, ideInfo, lastHeartbeat };
      }

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
