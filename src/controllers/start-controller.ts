import { Request, Response } from 'express';
import StartService from '../services/start-service';

class StartController {
  private startService: StartService;

  constructor() {
    this.startService = new StartService();
  }

  /**
   * 启动项目
   * POST /api/start/project
   * Body: {
   *   projectName: string,
   *   deployPath: string,
   *   startCommand: string
   * }
   */
  async startProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectName, deployPath, startCommand } = req.body;

      // 参数验证
      if (!projectName || !deployPath || !startCommand) {
        res.status(400).json({
          success: false,
          message: '缺少必填参数: projectName, deployPath, startCommand'
        });
        return;
      }

      // 执行启动
      const result = await this.startService.startProject({
        projectName,
        deployPath,
        startCommand
      });

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        success: false,
        message: '启动失败',
        error: err.message
      });
    }
  }
}

export default StartController;
