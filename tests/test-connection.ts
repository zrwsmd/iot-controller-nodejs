import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const BASE_URL = 'http://localhost:3000';
const CLIENT_ID = `ide-client-${Date.now()}`;

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testConnection(): Promise<void> {
  console.log('\n========================================');
  console.log('  控制端连接管理测试');
  console.log('========================================\n');

  try {
    // 1. 查询初始连接状态
    console.log('1️⃣  查询初始连接状态...');
    const statusRes1 = await axios.get(`${BASE_URL}/api/connection/status`);
    console.log('   连接状态:', statusRes1.data.data);
    console.log();

    // 2. 请求连接
    console.log('2️⃣  请求连接...');
    console.log(`   客户端ID: ${CLIENT_ID}`);
    const connectRes = await axios.post(`${BASE_URL}/api/connection/connect`, {
      clientId: CLIENT_ID,
      clientInfo: JSON.stringify({ platform: 'test', version: '1.0.0' })
    });
    console.log('   ✓', connectRes.data.message);
    console.log('   连接时间:', new Date(connectRes.data.data.connectTime).toLocaleString('zh-CN'));
    console.log();

    // 3. 再次查询连接状态
    console.log('3️⃣  查询连接状态（应该已连接）...');
    const statusRes2 = await axios.get(`${BASE_URL}/api/connection/status`);
    console.log('   已连接:', statusRes2.data.data.connected);
    console.log('   控制端信息:', statusRes2.data.data.controller);
    console.log();

    // 4. 尝试第二个客户端连接（应该失败）
    console.log('4️⃣  尝试第二个客户端连接（应该被拒绝）...');
    try {
      await axios.post(`${BASE_URL}/api/connection/connect`, {
        clientId: 'ide-client-second',
        clientInfo: JSON.stringify({ platform: 'test2', version: '1.0.0' })
      });
      console.log('   ❌ 错误：不应该允许第二个控制端连接');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        console.log('   ✓ 正确拒绝:', error.response.data.message);
      } else {
        throw error;
      }
    }
    console.log();

    // 5. 心跳保活
    console.log('5️⃣  发送心跳保活...');
    const heartbeatRes = await axios.post(`${BASE_URL}/api/connection/heartbeat`, {
      clientId: CLIENT_ID
    });
    console.log('   ✓', heartbeatRes.data.message);
    console.log();

    // 6. 等待一段时间
    console.log('6️⃣  等待 2 秒...\n');
    await sleep(2000);

    // 7. 断开连接
    console.log('7️⃣  断开连接...');
    const disconnectRes = await axios.post(`${BASE_URL}/api/connection/disconnect`, {
      clientId: CLIENT_ID
    });
    console.log('   ✓', disconnectRes.data.message);
    console.log();

    // 8. 验证已断开
    console.log('8️⃣  验证连接已断开...');
    const statusRes3 = await axios.get(`${BASE_URL}/api/connection/status`);
    console.log('   已连接:', statusRes3.data.data.connected);
    console.log();

    // 9. 测试强制断开（先连接）
    console.log('9️⃣  测试强制断开功能...');
    await axios.post(`${BASE_URL}/api/connection/connect`, {
      clientId: CLIENT_ID,
      clientInfo: JSON.stringify({ platform: 'test', version: '1.0.0' })
    });
    console.log('   ✓ 重新连接成功');
    
    const forceDisconnectRes = await axios.post(`${BASE_URL}/api/connection/force-disconnect`);
    console.log('   ✓', forceDisconnectRes.data.message);
    console.log();

    console.log('========================================');
    console.log('  ✅ 所有连接管理测试完成');
    console.log('========================================\n');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('\n❌ 测试失败:', error.response?.data || error.message);
    } else {
      console.error('\n❌ 测试失败:', error);
    }
    process.exit(1);
  }
}

testConnection();
