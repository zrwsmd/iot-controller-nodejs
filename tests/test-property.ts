import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const BASE_URL = 'http://localhost:3000';

async function testProperty(): Promise<void> {
  console.log('\n========== 属性测试 ==========\n');
  try {
    console.log('1. 查询当前属性...');
    const queryRes = await axios.get(`${BASE_URL}/api/device/property`);
    console.log('当前属性:', queryRes.data.data.properties, '\n');

    console.log('2. 设置 ADASSwitch = 1...');
    const setRes = await axios.post(`${BASE_URL}/api/device/adas-switch`, { value: 1 });
    console.log('设置结果:', setRes.data.message);
    console.log('消息ID:', setRes.data.data.messageId, '\n');

    console.log('3. 等待 2 秒后查询...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    const queryRes2 = await axios.get(`${BASE_URL}/api/device/property`);
    console.log('更新后属性:', queryRes2.data.data.properties, '\n');

    console.log('✅ 属性测试完成\n');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ 测试失败:', error.response?.data || error.message);
    } else {
      console.error('❌ 测试失败:', error);
    }
  }
}

testProperty();
