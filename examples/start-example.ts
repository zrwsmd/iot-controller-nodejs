import dotenv from 'dotenv';
import StartService from '../src/services/start-service';

dotenv.config();

/**
 * 启动项目示例
 * 演示如何启动已部署的项目
 */
async function main() {
  console.log('\n========================================');
  console.log('  项目启动示例');
  console.log('========================================\n');

  const startService = new StartService();

  try {
    // 启动参数
    const startParams = {
      projectName: 'iot-controller-nodejs',     // 项目名称
      deployPath: '/home/user/projects',        // 上位机部署路径
      startCommand: 'pm2 start npm --name iot-app -- run dev'  // 启动命令
    };

    console.log('启动参数:');
    console.log('  项目名称:', startParams.projectName);
    console.log('  部署路径:', startParams.deployPath);
    console.log('  启动命令:', startParams.startCommand);
    console.log();

    console.log('========================================');
    console.log('  开始启动流程');
    console.log('========================================\n');

    console.log('🚀 通知上位机启动项目...');
    const result = await startService.startProject(startParams);

    console.log();
    console.log('========================================');
    if (result.success) {
      console.log('  ✅ 启动成功');
    } else {
      console.log('  ❌ 启动失败');
    }
    console.log('========================================\n');
    console.log('消息:', result.message);

    if (result.success) {
      console.log('\n✅ 项目启动成功！');
      process.exit(0);
    } else {
      console.log('\n❌ 项目启动失败！');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ 启动过程出错:', error);
    process.exit(1);
  }
}

main();
