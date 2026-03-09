import dotenv from 'dotenv';
import DeployService from '../src/services/deploy-service';
import path from 'path';

dotenv.config();

/**
 * 部署示例
 * 演示如何将项目部署到上位机
 */
async function main() {
  console.log('\n========================================');
  console.log('  项目部署示例');
  console.log('========================================\n');

  const deployService = new DeployService();

  try {
    // 部署参数
    const deployParams = {
      projectPath: path.join(__dirname, '..'),  // 当前项目路径
      projectName: 'iot-controller-nodejs',     // 项目名称
      deployPath: '/home/user/projects',        // 上位机部署路径
      deployCommand: 'npm install && npm run build'  // 部署命令
    };

    console.log('部署参数:');
    console.log('  项目路径:', deployParams.projectPath);
    console.log('  项目名称:', deployParams.projectName);
    console.log('  部署路径:', deployParams.deployPath);
    console.log('  部署命令:', deployParams.deployCommand);
    console.log();

    // 测试模式：使用固定的 OSS 下载地址，避免每次上传产生费用
    const USE_FIXED_URL = true;
    const FIXED_DOWNLOAD_URL = 'http://iot-deploy-bucket.oss-cn-hangzhou.aliyuncs.com/projects/iot-controller-nodejs/iot-controller-nodejs-1773021413017.zip?OSSAccessKeyId=LTAI5tNzcjJxpnyVfHAmPifK&Expires=1773025014&Signature=E5n6AGNWxYXISCuptJbvtxM%2Bjo0%3D';

    if (USE_FIXED_URL) {
      // 测试模式：直接使用固定的下载地址，跳过打包和上传
      console.log('========================================');
      console.log('  开始部署流程（测试模式）');
      console.log('========================================\n');

      console.log('⚡ 跳过打包和上传，使用固定下载地址');
      console.log('   下载地址:', FIXED_DOWNLOAD_URL.substring(0, 80) + '...');
      console.log();

      console.log('3️⃣  通知上位机部署...');
      const result = await deployService.deployProject({
        projectName: deployParams.projectName,
        downloadUrl: FIXED_DOWNLOAD_URL,
        deployPath: deployParams.deployPath,
        deployCommand: deployParams.deployCommand
      });

      console.log();
      console.log('========================================');
      if (result.success) {
        console.log('  ✅ 部署成功');
      } else {
        console.log('  ❌ 部署失败');
      }
      console.log('========================================\n');
      console.log('消息:', result.message);
      
      if (result.deployLog) {
        console.log('\n部署日志:');
        console.log('----------------------------------------');
        console.log(result.deployLog);
        console.log('----------------------------------------');
      }
    } else {
      // 执行部署
      const result = await deployService.deployFullWorkflow(deployParams);

      if (result.success) {
        console.log('\n✅ 部署成功！');
        process.exit(0);
      } else {
        console.log('\n❌ 部署失败！');
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('\n❌ 部署过程出错:', error);
    process.exit(1);
  }
}

main();
