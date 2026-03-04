import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const BASE_URL = 'http://localhost:3000';

async function testService(): Promise<void> {
  console.log('\n========== 服务测试 ==========\n');
  try {
    console.log('1. 调用 restart 服务...');
    const restartRes = await axios.post(`${BASE_URL}/api/device/restart`);
    console.log('重启结果:', restartRes.data.message);
    console.log('消息ID:', restartRes.data.data.messageId, '\n');

    console.log('✅ 服务测试完成\n');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ 测试失败:', error.response?.data || error.message);
    } else {
      console.error('❌ 测试失败:', error);
    }
  }
}

testService();
