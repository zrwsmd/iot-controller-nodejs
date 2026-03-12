import { Router } from 'express';
import StartController from '../controllers/start-controller';

const router = Router();
const startController = new StartController();

router.post('/project', (req, res) => startController.startProject(req, res));

export default router;
