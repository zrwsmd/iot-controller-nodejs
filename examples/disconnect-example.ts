import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const BASE_URL = 'http://localhost:3000';
const CLIENT_ID = 'ide-client-12345678';

/**
 * 断开连接示例
 * 演示如何断开与上位机的连接
 */
async function main() {
  console.log('\n========================================');
  console.log('  断开连接示例');
  console.log('========================================\n');

  try {
    console.log(`客户端ID: ${CLIENT_ID}\n`);

    // 1. 先查询当前连接状态
    console.log('📊 查询当前连接状态...\n');
    try {
      const statusResponse = await axios.get(`${BASE_URL}/api/connection/status`);
      
      if (statusResponse.data.success) {
        const { connected, ideInfo } = statusResponse.data.data;
        
        if (connected) {
          console.log('✅ 当前已连接');
          console.log(`   连接的客户端ID: ${ideInfo?.clientId}`);
          console.log(`   连接的平台: ${ideInfo?.platform || 'N/A'}`);
          console.log(`   连接的版本: ${ideInfo?.version || 'N/A'}\n`);
          
          if (ideInfo?.clientId !== CLIENT_ID) {
            console.log(`⚠️  警告: 当前连接的客户端ID (${ideInfo?.clientId}) 与本客户端ID (${CLIENT_ID}) 不匹配`);
            console.log('   你可能需要修改 CLIENT_ID 或使用强制断开\n');
          }
        } else {
          console.log('ℹ️  当前未连接到任何客户端\n');
          console.log('💡 提示: 可以先运行 npm run example:client 建立连接，再测试断开\n');
          return;
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ 查询状态失败:', error.response?.data || error.message);
      } else {
        console.error('❌ 错误:', error);
      }
      return;
    }

    // 2. 执行断开连接
    console.log('========================================');
    console.log('🔌 执行断开连接...\n');
    
    const disconnectResponse = await axios.post(`${BASE_URL}/api/connection/disconnect`, {
      clientId: CLIENT_ID
    });

    if (disconnectResponse.data.success) {
      console.log('✅ 断开连接成功\n');
      console.log('========================================');
      console.log('断开结果：');
      console.log('========================================');
      console.log(`状态: ${disconnectResponse.data.message}`);
      console.log(`客户端ID: ${CLIENT_ID}`);
      console.log();
    } else {
      console.log('❌ 断开连接失败:', disconnectResponse.data.message);
      console.log();
    }

    // 3. 再次查询状态确认
    console.log('========================================');
    console.log('📊 确认断开状态...\n');
    
    const finalStatusResponse = await axios.get(`${BASE_URL}/api/connection/status`);
    
    if (finalStatusResponse.data.success) {
      const { connected } = finalStatusResponse.data.data;
      
      if (!connected) {
        console.log('✅ 确认: 已成功断开连接');
        console.log('   当前状态: 未连接\n');
      } else {
        console.log('⚠️  警告: 连接状态仍然显示为已连接');
        console.log('   这可能是因为其他客户端建立了新连接\n');
      }
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ 请求失败:', error.response?.data || error.message);
      
      if (error.code === 'ECONNREFUSED') {
        console.error('\n💡 提示: 请先启动服务器');
        console.error('   运行: npm run dev\n');
      }
    } else {
      console.error('❌ 错误:', error);
    }
  }
}

main().catch(error => {
  console.error('❌ 程序错误:', error);
  process.exit(1);
});
