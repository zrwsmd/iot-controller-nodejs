import { Router } from 'express';
import DeployController from '../controllers/deploy-controller';

const router = Router();
const deployController = new DeployController();

// 部署项目
router.post('/project', (req, res) => deployController.deployProject(req, res));

// 查询部署状态
router.get('/status', (req, res) => deployController.getDeployStatus(req, res));

export default router;
