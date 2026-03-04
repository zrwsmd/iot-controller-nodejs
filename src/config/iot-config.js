require('dotenv').config();

module.exports = {
  // 阿里云访问凭证
  accessKeyId: process.env.ACCESS_KEY_ID,
  accessKeySecret: process.env.ACCESS_KEY_SECRET,

  // IoT 平台配置
  iotInstanceId: process.env.IOT_INSTANCE_ID,
  region: process.env.IOT_REGION,
  endpoint: `iot.${process.env.IOT_REGION}.aliyuncs.com`,

  // 设备信息
  productKey: process.env.PRODUCT_KEY,
  deviceName: process.env.DEVICE_NAME,

  // 服务器配置
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development'
};
