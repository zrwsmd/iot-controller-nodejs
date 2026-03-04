import dotenv from 'dotenv';

dotenv.config();

export interface IoTConfig {
  accessKeyId: string;
  accessKeySecret: string;
  iotInstanceId: string;
  region: string;
  endpoint: string;
  productKey: string;
  deviceName: string;
  port: number;
  nodeEnv: string;
}

const config: IoTConfig = {
  accessKeyId: process.env.ACCESS_KEY_ID || '',
  accessKeySecret: process.env.ACCESS_KEY_SECRET || '',
  iotInstanceId: process.env.IOT_INSTANCE_ID || '',
  region: process.env.IOT_REGION || 'cn-shanghai',
  endpoint: `iot.${process.env.IOT_REGION || 'cn-shanghai'}.aliyuncs.com`,
  productKey: process.env.PRODUCT_KEY || '',
  deviceName: process.env.DEVICE_NAME || '',
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development'
};

export default config;
