import { Router } from 'express';
import DeviceListController from '../controllers/device-list-controller';

const router = Router();
const deviceListController = new DeviceListController();

router.get('/list', (req, res) => deviceListController.getDeviceList(req, res));

export default router;
