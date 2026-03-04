require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testAll() {
  console.log('\n========================================');
  console.log('  IoT Controller 完整测试');
  console.log('========================================\n');

  try {
    console.log('1️⃣  健康检查...');
    const healthRes = await axios.get(`${BASE_URL}/health`);
    console.log('   ✓ 状态:', healthRes.data.status);
    console.log('   ✓ 运行时间:', Math.floor(healthRes.data.uptime), '秒\n');

    console.log('2️⃣  查询设备详情...');
    const detailRes = await axios.get(`${BASE_URL}/api/device/detail`);
    console.log('   ✓ 设备名称:', detailRes.data.data.deviceName);
    console.log('   ✓ 产品Key:', detailRes.data.data.productKey);
    console.log('   ✓ 设备状态:', detailRes.data.data.status);
    console.log('   ✓ 在线状态:', detailRes.data.data.online ? '在线' : '离线');
    console.log('   ✓ IP地址:', detailRes.data.data.ipAddress);
    console.log('   ✓ 最后上线:', detailRes.data.data.gmtOnline, '\n');

    console.log('3️⃣  查询设备属性...');
    const propertyRes = await axios.get(`${BASE_URL}/api/device/property`);
    console.log('   ✓ 属性数量:', propertyRes.data.data.count);
    console.log('   ✓ 属性列表:');
    Object.entries(propertyRes.data.data.properties).forEach(([key, value]) => {
      console.log(`      - ${key}: ${value.value} (更新时间: ${value.time})`);
    });
    console.log('');

    console.log('4️⃣  设置 ADASSwitch = 1（开）...');
    const setOnRes = await axios.post(`${BASE_URL}/api/device/adas-switch`, { value: 1 });
    console.log('   ✓ 设置结果:', setOnRes.data.success);
    console.log('   ✓ 消息ID:', setOnRes.data.data.messageId);
    console.log('   ✓ 状态:', setOnRes.data.data.description, '\n');

    console.log('   ⏳ 等待 3 秒让设备处理...\n');
    await sleep(3000);

    console.log('5️⃣  查询属性确认...');
    const propertyRes2 = await axios.get(`${BASE_URL}/api/device/property`);
    const adasValue = propertyRes2.data.data.properties.ADASSwitch?.value;
    console.log('   ✓ ADASSwitch 当前值:', adasValue, `(${adasValue === '1' ? '开' : '关'})\n`);

    console.log('6️⃣  设置 ADASSwitch = 0（关）...');
    const setOffRes = await axios.post(`${BASE_URL}/api/device/adas-switch`, { value: 0 });
    console.log('   ✓ 设置结果:', setOffRes.data.success);
    console.log('   ✓ 状态:', setOffRes.data.data.description, '\n');

    console.log('   ⏳ 等待 3 秒...\n');
    await sleep(3000);

    console.log('7️⃣  调用 restart 服务...');
    const restartRes = await axios.post(`${BASE_URL}/api/device/restart`);
    console.log('   ✓ 调用结果:', restartRes.data.success);
    console.log('   ✓ 消息ID:', restartRes.data.data.messageId);
    console.log('   ✓ 服务:', restartRes.data.data.service, '\n');

    console.log('8️⃣  获取设备状态（综合）...');
    const statusRes = await axios.get(`${BASE_URL}/api/device/status`);
    console.log('   ✓ 在线:', statusRes.data.data.online ? '是' : '否');
    console.log('   ✓ 状态:', statusRes.data.data.status);
    console.log('   ✓ IP地址:', statusRes.data.data.ipAddress);
    console.log('   ✓ 属性:');
    Object.entries(statusRes.data.data.properties).forEach(([key, value]) => {
      console.log(`      - ${key}: ${value.value}`);
    });
    console.log('');

    console.log('========================================');
    console.log('  ✅ 所有测试通过！');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ 测试失败:');
    if (error.response) {
      console.error('   状态码:', error.response.status);
      console.error('   错误信息:', error.response.data);
    } else {
      console.error('   错误:', error.message);
    }
  }
}

testAll();
