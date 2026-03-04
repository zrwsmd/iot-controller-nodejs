import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const BASE_URL = 'http://localhost:3000';

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAll(): Promise<void> {
  console.log('\n========================================');
  console.log('  IoT Controller 完整测试');
  console.log('========================================\n');

  try {
    console.log('1️⃣  健康检查...');
    const healthRes = await axios.get(`${BASE_URL}/health`);
    console.log(`   ✓ 状态: ${healthRes.data.status}`);
    console.log(`   ✓ 运行时间: ${Math.floor(healthRes.data.uptime)} 秒\n`);

    console.log('2️⃣  查询设备详情...');
    const detailRes = await axios.get(`${BASE_URL}/api/device/detail`);
    const detail = detailRes.data.data;
    console.log(`   ✓ 设备名称: ${detail.deviceName}`);
    console.log(`   ✓ 产品Key: ${detail.productKey}`);
    console.log(`   ✓ 设备状态: ${detail.status}`);
    console.log(`   ✓ 在线状态: ${detail.online ? '在线' : '离线'}`);
    console.log(`   ✓ IP地址: ${detail.ipAddress}`);
    console.log(`   ✓ 最后上线: ${detail.gmtOnline}\n`);

    console.log('3️⃣  查询设备属性...');
    const propertyRes = await axios.get(`${BASE_URL}/api/device/property`);
    const properties = propertyRes.data.data.properties;
    console.log(`   ✓ 属性数量: ${propertyRes.data.data.count}`);
    console.log('   ✓ 属性列表:');
    Object.entries(properties).forEach(([key, val]: [string, any]) => {
      console.log(`      - ${key}: ${val.value} (更新时间: ${val.time})`);
    });
    console.log();

    console.log('4️⃣  设置 ADASSwitch = 1（开）...');
    const setRes1 = await axios.post(`${BASE_URL}/api/device/adas-switch`, { value: 1 });
    console.log(`   ✓ 设置结果: ${setRes1.data.success}`);
    console.log(`   ✓ 消息ID: ${setRes1.data.data.messageId}`);
    console.log(`   ✓ 状态: ${setRes1.data.data.description}`);
    console.log('   ⏳ 等待 3 秒让设备处理...\n');
    await sleep(3000);

    console.log('5️⃣  查询属性确认...');
    const queryRes = await axios.get(`${BASE_URL}/api/device/property`);
    const adasValue = queryRes.data.data.properties.ADASSwitch?.value;
    console.log(`   ✓ ADASSwitch 当前值: ${adasValue} (${adasValue === 1 ? '开' : '关'})\n`);

    console.log('6️⃣  设置 ADASSwitch = 0（关）...');
    const setRes2 = await axios.post(`${BASE_URL}/api/device/adas-switch`, { value: 0 });
    console.log(`   ✓ 设置结果: ${setRes2.data.success}`);
    console.log(`   ✓ 状态: ${setRes2.data.data.description}`);
    console.log('   ⏳ 等待 3 秒...\n');
    await sleep(3000);

    console.log('7️⃣  调用 restart 服务...');
    const restartRes = await axios.post(`${BASE_URL}/api/device/restart`);
    console.log(`   ✓ 调用结果: ${restartRes.data.success}`);
    console.log(`   ✓ 消息ID: ${restartRes.data.data.messageId}`);
    console.log(`   ✓ 服务: ${restartRes.data.data.service}\n`);

    console.log('========================================');
    console.log('  ✅ 所有测试完成');
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

testAll();
