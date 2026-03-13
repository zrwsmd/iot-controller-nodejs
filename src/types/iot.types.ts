export interface DeviceProperty {
  value: string | number;
  time: string;
}

export interface PropertyMap {
  [key: string]: DeviceProperty;
}

export interface SetPropertyResult {
  success: boolean;
  messageId?: string;
  errorMessage?: string;
}

export interface QueryPropertyResult {
  success: boolean;
  properties: PropertyMap;
  count: number;
}

export interface InvokeServiceResult {
  success: boolean;
  messageId?: string;
  errorMessage?: string;
}

export interface DeviceDetailResult {
  success: boolean;
  deviceName: string;
  productKey: string;
  deviceSecret: string;
  status: string;
  online: boolean;
  gmtCreate: string;
  gmtActive: string;
  gmtOnline: string;
  ipAddress: string;
}

export interface DeviceStatusResult {
  success: boolean;
  online: boolean;
  status: string;
  properties: PropertyMap;
  lastOnlineTime: string;
  ipAddress: string;
}

export interface DeviceInfo {
  deviceName: string;
  productKey: string;
  status: string;
  online: boolean;
  gmtCreate: string;
  gmtActive: string;
  gmtOnline: string;
  ipAddress: string;
  nickname?: string;
}

export interface DeviceListResult {
  success: boolean;
  devices: DeviceInfo[];
  total: number;
}
