import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const BASE_URL = 'http://localhost:3000';
const DEFAULT_CLIENT_ID = 'ide-client-12345678';
const CLIENT_ID = resolveClientId();
const HEARTBEAT_INTERVAL = 30000; // 30 秒

function resolveClientId(): string {
  const namedArg = process.argv.find(arg => arg.startsWith('--clientId='));
  if (namedArg) {
    const value = namedArg.slice('--clientId='.length).trim();
    if (value) {
      return value;
    }
  }

  const positionalArg = process.argv[2];
  if (positionalArg && !positionalArg.startsWith('--')) {
    return positionalArg;
  }

  return process.env.IDE_CLIENT_ID || DEFAULT_CLIENT_ID;
}

/**
 * IDE 客户端示例
 * 演示如何正确使用连接管理功能，包括持续心跳
 */
class IDEClient {
  private clientId: string;
  private heartbeatTimer?: NodeJS.Timeout;
  private connected: boolean = false;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  /**
   * 连接到上位机
   */
  async connect(): Promise<boolean> {
    try {
      console.log(`\n🔌 正在连接... (ID: ${this.clientId})`);
      
      const response = await axios.post(`${BASE_URL}/api/connection/connect`, {
        clientId: this.clientId,
        clientInfo: JSON.stringify({
          platform: 'nodejs',
          version: '1.0.0',
          hostname: require('os').hostname(),
          pid: process.pid
        })
      });

      if (response.data.success) {
        this.connected = true;
        console.log('✅ 连接成功');
        console.log(`   连接时间: ${new Date(response.data.data.connectTime).toLocaleString('zh-CN')}`);
        
        // 启动心跳
        this.startHeartbeat();
        
        return true;
      } else {
        console.log('❌ 连接失败:', response.data.message);
        return false;
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        console.log('❌ 连接失败:', error.response.data.message);
      } else {
        console.error('❌ 连接错误:', error);
      }
      return false;
    }
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    if (!this.connected) {
      console.log('⚠️  当前未连接');
      return;
    }

    try {
      // 停止心跳
      this.stopHeartbeat();

      console.log('\n🔌 正在断开连接...');
      
      const response = await axios.post(`${BASE_URL}/api/connection/disconnect`, {
        clientId: this.clientId
      });

      if (response.data.success) {
        this.connected = false;
        console.log('✅ 断开连接成功');
      } else {
        console.log('❌ 断开连接失败:', response.data.message);
      }
    } catch (error) {
      console.error('❌ 断开连接错误:', error);
    }
  }

  /**
   * 启动心跳定时器
   */
  private startHeartbeat(): void {
    console.log(`\n💓 启动心跳定时器 (间隔: ${HEARTBEAT_INTERVAL / 1000} 秒)`);
    
    this.heartbeatTimer = setInterval(async () => {
      try {
        const response = await axios.post(`${BASE_URL}/api/connection/heartbeat`, {
          clientId: this.clientId
        });

        if (response.data.success) {
          console.log(`💓 心跳成功 [${new Date().toLocaleTimeString('zh-CN')}]`);
        } else {
          console.log('⚠️  心跳失败:', response.data.message);
          console.log('🔄 连接已失效，尝试重新连接...');
          
          this.stopHeartbeat();
          this.connected = false;
          
          // 等待 2 秒后重新连接
          setTimeout(() => {
            this.connect();
          }, 2000);
        }
      } catch (error) {
        console.error('❌ 心跳错误:', error);
      }
    }, HEARTBEAT_INTERVAL);
  }

  /**
   * 停止心跳定时器
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
      console.log('💓 心跳定时器已停止');
    }
  }

  /**
   * 查询连接状态
   */
  async getStatus(): Promise<void> {
    try {
      const response = await axios.get(`${BASE_URL}/api/connection/status`);
      const data = response.data.data;
      
      console.log('\n📊 连接状态:');
      console.log('   已连接:', data.connected);
      
      if (data.connected && data.ideInfo) {
        console.log('   客户端ID:', data.ideInfo.clientId);
        console.log('   连接时间:', new Date(data.ideInfo.connectTime).toLocaleString('zh-CN'));
        
        if (data.lastHeartbeat) {
          console.log('   最后心跳:', new Date(data.lastHeartbeat).toLocaleString('zh-CN'));
        }
      }
    } catch (error) {
      console.error('❌ 查询状态错误:', error);
    }
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    return this.connected;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('========================================');
  console.log('  IDE 客户端示例');
  console.log('========================================');

  const client = new IDEClient(CLIENT_ID);

  // 1. 查询初始状态
  await client.getStatus();

  // 2. 连接
  const connected = await client.connect();
  
  if (!connected) {
    console.log('\n❌ 连接失败，程序退出');
    process.exit(1);
  }

  // 3. 查询连接后的状态
  await new Promise(resolve => setTimeout(resolve, 2000));
  await client.getStatus();

  // 4. 保持运行，让心跳持续发送
  console.log('\n⏳ 客户端正在运行，按 Ctrl+C 退出...');
  console.log('   心跳将每 30 秒自动发送一次\n');

  // 优雅退出处理
  process.on('SIGINT', async () => {
    console.log('\n\n⚠️  收到退出信号...');
    await client.disconnect();
    console.log('\n👋 程序已退出\n');
    process.exit(0);
  });

  // 保持进程运行
  await new Promise(() => {});
}

// 运行
main().catch(error => {
  console.error('❌ 程序错误:', error);
  process.exit(1);
});
