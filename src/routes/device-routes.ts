import express, { Request, Response } from 'express';
import DeviceController from '../controllers/device-controller';

const router = express.Router();
const deviceController = new DeviceController();

router.post('/adas-switch',         (req: Request, res: Response) => deviceController.setADASSwitch(req, res));
router.post('/property',            (req: Request, res: Response) => deviceController.setProperty(req, res));
router.get('/property',             (req: Request, res: Response) => deviceController.queryProperty(req, res));

router.post('/restart',             (req: Request, res: Response) => deviceController.restart(req, res));
router.post('/service/:serviceId',  (req: Request, res: Response) => deviceController.invokeService(req, res));

router.get('/detail',               (req: Request, res: Response) => deviceController.queryDetail(req, res));
router.get('/status',               (req: Request, res: Response) => deviceController.getStatus(req, res));

export default router;
