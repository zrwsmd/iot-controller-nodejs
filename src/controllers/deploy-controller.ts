import { Request, Response } from 'express';
import DeployService from '../services/deploy-service';

class DeployController {
  private deployService: DeployService;

  constructor() {
    this.deployService = new DeployService();
  }

  /**
   * 部署项目
   * POST /api/deploy/project
   * Body: {
   *   clientId: string,
   *   projectPath: string,
   *   projectName: string,
   *   deployPath: string,
   *   deployCommand: string
   * }
   */
  async deployProject(req: Request, res: Response): Promise<void> {
    try {
      const { clientId, projectPath, projectName, deployPath, deployCommand } = req.body;

      // 参数验证
      if (!clientId || !projectPath || !projectName || !deployPath) {
        res.status(400).json({
          success: false,
          message: '缺少必填参数: clientId, projectPath, projectName, deployPath'
        });
        return;
      }

      // 执行部署
      const result = await this.deployService.deployFullWorkflow({
        clientId,
        projectPath,
        projectName,
        deployPath,
        deployCommand: deployCommand || 'npm install && npm run build'
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
        message: '部署失败',
        error: err.message
      });
    }
  }

  /**
   * 查询部署状态
   * GET /api/deploy/status
   */
  async getDeployStatus(_req: Request, res: Response): Promise<void> {
    try {
      const status = await this.deployService.checkDeployStatus();
      res.json({
        success: true,
        message: '查询部署状态成功',
        data: status
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        success: false,
        message: '查询部署状态失败',
        error: err.message
      });
    }
  }
}

export default DeployController;
