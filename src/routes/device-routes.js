const express = require('express');
const DeviceController = require('../controllers/device-controller');

const router = express.Router();
const deviceController = new DeviceController();

// 属性相关
router.post('/adas-switch',         (req, res) => deviceController.setADASSwitch(req, res));
router.post('/property',            (req, res) => deviceController.setProperty(req, res));
router.get('/property',             (req, res) => deviceController.queryProperty(req, res));

// 服务相关
router.post('/restart',             (req, res) => deviceController.restart(req, res));
router.post('/service/:serviceId',  (req, res) => deviceController.invokeService(req, res));

// 查询相关
router.get('/detail',               (req, res) => deviceController.queryDetail(req, res));
router.get('/status',               (req, res) => deviceController.getStatus(req, res));

module.exports = router;
