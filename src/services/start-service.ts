import IoTService from './iot-service';
import ConnectionService from './connection-service';

/**
 * 启动服务
 * 负责启动已部署的项目
 */
class StartService {
  private iotService: IoTService;
  private connectionService: ConnectionService;

  constructor() {
    this.iotService = new IoTService();
    this.connectionService = new ConnectionService();
  }

  /**
   * 通知上位机启动项目
   */
  async startProject(params: {
    clientId: string;
    projectName: string;
    deployPath: string;
    startCommand: string;
  }): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log('[StartService] 检查连接状态...');
      const status = await this.connectionService.checkConnectionStatus();
      
      if (!status.connected) {
        return {
          success: false,
          message: '未连接到上位机，请先建立连接'
        };
      }
      
      if (status.ideInfo?.clientId !== params.clientId) {
        return {
          success: false,
          message: `当前连接的客户端ID (${status.ideInfo?.clientId}) 与请求的客户端ID (${params.clientId}) 不匹配`
        };
      }
      
      console.log('[StartService] 连接验证通过，通知上位机启动项目:', params.projectName);

      // 调用上位机的 startProject 服务
      const result = await this.iotService.invokeService('startProject', {
        clientId: params.clientId,
        projectName: params.projectName,
        deployPath: params.deployPath,
        startCommand: params.startCommand
      });

      return {
        success: result.success,
        message: result.success ? '启动成功' : '启动失败'
      };
    } catch (error) {
      const err = error as Error;
      console.error('[StartService] 启动失败:', err.message);
      throw error;
    }
  }
}

export default StartService;
