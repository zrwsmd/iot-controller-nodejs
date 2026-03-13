import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const BASE_URL = 'http://localhost:3000';

/**
 * 设备列表查询示例
 * 演示如何查询产品下的所有设备及其在线状态
 */
async function main() {
  console.log('\n========================================');
  console.log('  设备列表查询示例');
  console.log('========================================\n');

  try {
    // 查询设备列表
    console.log('📋 查询设备列表...\n');
    const response = await axios.get(`${BASE_URL}/api/devices/list`);

    if (response.data.success) {
      const { devices, total } = response.data.data;
      
      console.log(`✅ 查询成功，共 ${total} 个设备\n`);
      console.log('========================================');
      console.log('设备列表：');
      console.log('========================================\n');

      devices.forEach((device: any, index: number) => {
        console.log(`${index + 1}. ${device.nickname || device.deviceName}`);
        console.log(`   设备名称: ${device.deviceName}`);
        console.log(`   产品Key:  ${device.productKey}`);
        console.log(`   在线状态: ${device.online ? '🟢 在线' : '🔴 离线'}`);
        console.log(`   设备状态: ${device.status}`);
        console.log(`   IP地址:   ${device.ipAddress}`);
        console.log(`   创建时间: ${device.gmtCreate}`);
        console.log(`   激活时间: ${device.gmtActive}`);
        console.log(`   最后在线: ${device.gmtOnline}`);
        console.log();
      });

      // 统计在线/离线设备数量
      const onlineCount = devices.filter((d: any) => d.online).length;
      const offlineCount = total - onlineCount;
      
      console.log('========================================');
      console.log('统计信息：');
      console.log('========================================');
      console.log(`总设备数: ${total}`);
      console.log(`在线设备: ${onlineCount} 🟢`);
      console.log(`离线设备: ${offlineCount} 🔴`);
      console.log();

    } else {
      console.log('❌ 查询失败:', response.data.message);
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ 请求失败:', error.response?.data || error.message);
    } else {
      console.error('❌ 错误:', error);
    }
  }
}

main().catch(error => {
  console.error('❌ 程序错误:', error);
  process.exit(1);
});
