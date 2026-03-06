// IDE 连接信息
export interface IDEInfo {
  clientId: string;
  clientInfo: string;
  connectTime: number;
}

// 连接状态
export interface ConnectionStatus {
  connected: boolean;
  ideInfo?: IDEInfo;
  lastHeartbeat?: number;
}

// 请求连接参数
export interface ConnectRequest {
  clientId: string;
  clientInfo?: string;
}

// 连接结果
export interface ConnectResult {
  success: boolean;
  message: string;
  data?: {
    clientId: string;
    connectTime: number;
  };
}

// 服务调用结果（上位机返回）
export interface ServiceResponse {
  success: boolean;
  message: string;
}
