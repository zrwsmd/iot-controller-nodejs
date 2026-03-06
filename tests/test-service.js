require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testService() {
  console.log('\n========== 服务测试 ==========\n');
  try {
    // console.log('1. 调用 restart 服务...');
    // const restartRes = await axios.post(`${BASE_URL}/api/device/restart`);
    // console.log('调用结果:', restartRes.data.message);
    // console.log('消息ID:', restartRes.data.data.messageId, '\n');

    console.log('2. 通用服务调用（openfiewwalld）...');
    const serviceRes = await axios.post(`${BASE_URL}/api/device/service/openfiewwalld`, { args: {} });
    console.log('调用结果:', serviceRes.data.message);
    console.log('消息ID:', serviceRes.data.data.messageId, '\n');

    console.log('✅ 服务测试完成\n');
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testService();
