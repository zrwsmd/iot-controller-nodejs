import IoTService from './iot-service';

/**
 * 启动服务
 * 负责启动已部署的项目
 */
class StartService {
  private iotService: IoTService;

  constructor() {
    this.iotService = new IoTService();
  }

  /**
   * 通知上位机启动项目
   */
  async startProject(params: {
    projectName: string;
    deployPath: string;
    startCommand: string;
  }): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log('[StartService] 通知上位机启动项目:', params.projectName);

      // 调用上位机的 startProject 服务
      const result = await this.iotService.invokeService('startProject', {
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
