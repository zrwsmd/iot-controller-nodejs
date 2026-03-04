require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testQuery() {
  console.log('\n========== 查询测试 ==========\n');
  try {
    console.log('1. 查询设备详情...');
    const detailRes = await axios.get(`${BASE_URL}/api/device/detail`);
    console.log('设备信息:', JSON.stringify(detailRes.data.data, null, 2), '\n');

    console.log('2. 查询设备属性...');
    const propertyRes = await axios.get(`${BASE_URL}/api/device/property`);
    console.log('设备属性:', JSON.stringify(propertyRes.data.data, null, 2), '\n');

    console.log('3. 获取设备状态...');
    const statusRes = await axios.get(`${BASE_URL}/api/device/status`);
    console.log('设备状态:', JSON.stringify(statusRes.data.data, null, 2), '\n');

    console.log('✅ 查询测试完成\n');
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testQuery();
