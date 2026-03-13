import IoTService from './iot-service';
import ConnectionService from './connection-service';
import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';
import OSS from 'ali-oss';

/**
 * 部署服务
 * 负责将项目打包、上传到 OSS、通知上位机部署
 */
type OSSClientInstance = InstanceType<typeof OSS>;

class DeployService {
  private iotService: IoTService;
  private connectionService: ConnectionService;
  private ossClient?: OSSClientInstance;

  constructor() {
    this.iotService = new IoTService();
    this.connectionService = new ConnectionService();
  }

  /**
   * 获取或初始化 OSS 客户端
   */
  private getOSSClient(): OSSClientInstance {
    if (!this.ossClient) {
      // 检查必要的环境变量
      if (!process.env.OSS_ACCESS_KEY_ID || !process.env.OSS_ACCESS_KEY_SECRET) {
        throw new Error('OSS 配置缺失：请在 .env 文件中配置 OSS_ACCESS_KEY_ID 和 OSS_ACCESS_KEY_SECRET');
      }

      // 延迟初始化 OSS 客户端
      this.ossClient = new OSS({
        region: process.env.OSS_REGION || 'oss-cn-hangzhou',
        accessKeyId: process.env.OSS_ACCESS_KEY_ID,
        accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
        bucket: process.env.OSS_BUCKET || 'iot-deploy-bucket'
      });
    }
    return this.ossClient;
  }

  /**
   * 打包项目为 zip 文件
   */
  async packProject(projectPath: string, outputPath: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        console.log(`[DeployService] 项目打包完成: ${archive.pointer()} bytes`);
        resolve(outputPath);
      });

      archive.on('error', (err: Error) => {
        reject(err);
      });

      archive.pipe(output);
      
      // 添加项目文件到压缩包（排除 node_modules 等）
      archive.glob('**/*', {
        cwd: projectPath,
        ignore: [
          'node_modules/**',
          'dist/**',
          '.git/**',
          '.env',
          '*.log',
          '.DS_Store'
        ]
      });

      archive.finalize();
    });
  }

  /**
   * 上传文件到 OSS
   */
  async uploadToOSS(filePath: string, objectName: string): Promise<string> {
    try {
      console.log(`[DeployService] 上传文件到 OSS: ${objectName}`);
      
      const ossClient = this.getOSSClient();
      await ossClient.put(objectName, filePath);
      
      // 生成带签名的下载 URL（有效期 1 小时）
      const url = ossClient.signatureUrl(objectName, {
        expires: 3600,
        method: 'GET'
      });

      console.log(`[DeployService] 上传成功，下载地址: ${url}`);
      return url;
    } catch (error) {
      console.error('[DeployService] 上传失败:', error);
      throw error;
    }
  }

  /**
   * 通知上位机部署项目
   */
  async deployProject(params: {
    clientId: string;
    projectName: string;
    downloadUrl: string;
    deployPath: string;
    deployCommand: string;
  }): Promise<{
    success: boolean;
    message: string;
    deployLog?: string;
  }> {
    try {
      console.log('[DeployService] 检查连接状态...');
      const status = await this.connectionService.checkConnectionStatus();
      
      if (!status.connected) {
        return {
          success: false,
          message: '未连接到上位机，请先建立连接'
        };
      }
      
      if (status.ideInfo?.clientId !== params.clientId) {
        return {
          success: false,
          message: `当前连接的客户端ID (${status.ideInfo?.clientId}) 与请求的客户端ID (${params.clientId}) 不匹配`
        };
      }
      
      console.log('[DeployService] 连接验证通过，通知上位机部署项目:', params.projectName);

      // 调用上位机的 deployProject 服务
      await this.iotService.invokeService('deployProject', {
        clientId: params.clientId,
        projectName: params.projectName,
        downloadUrl: params.downloadUrl,
        deployPath: params.deployPath,
        deployCommand: params.deployCommand
      });

      // 等待上位机处理
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 查询部署状态
      const deployStatus = await this.checkDeployStatus();

      return {
        success: deployStatus.success || false,
        message: deployStatus.message || '部署中...',
        deployLog: deployStatus.deployLog
      };
    } catch (error) {
      const err = error as Error;
      console.error('[DeployService] 部署失败:', err.message);
      throw error;
    }
  }

  /**
   * 查询部署状态
   */
  async checkDeployStatus(): Promise<{
    success?: boolean;
    message?: string;
    deployLog?: string;
    timestamp?: number;
  }> {
    try {
      const result = await this.iotService.queryProperty();
      const statusData = result.properties.deployStatus?.value;

      if (typeof statusData === 'string' && statusData) {
        try {
          return JSON.parse(statusData);
        } catch {
          return { message: statusData };
        }
      }

      return {};
    } catch (error) {
      console.error('[DeployService] 查询部署状态失败:', error);
      throw error;
    }
  }

  /**
   * 完整部署流程
   */
  async deployFullWorkflow(params: {
    clientId: string;
    projectPath: string;
    projectName: string;
    deployPath: string;
    deployCommand: string;
  }): Promise<{
    success: boolean;
    message: string;
    deployLog?: string;
  }> {
    try {
      console.log('\n========================================');
      console.log('  开始部署流程');
      console.log('========================================\n');

      // 1. 打包项目
      console.log('1️⃣  打包项目...');
      const timestamp = Date.now();
      const zipFileName = `${params.projectName}-${timestamp}.zip`;
      const zipFilePath = path.join(process.cwd(), 'temp', zipFileName);
      
      // 确保 temp 目录存在
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      await this.packProject(params.projectPath, zipFilePath);
      console.log(`   ✓ 打包完成: ${zipFilePath}`);
      console.log();

      // 2. 上传到 OSS
      console.log('2️⃣  上传到 OSS...');
      const objectName = `projects/${params.projectName}/${zipFileName}`;
      const downloadUrl = await this.uploadToOSS(zipFilePath, objectName);
      console.log(`   ✓ 上传完成`);
      console.log(`   下载地址: ${downloadUrl}`);
      console.log();

      // 3. 通知上位机部署
      console.log('3️⃣  通知上位机部署...');
      const deployResult = await this.deployProject({
        clientId: params.clientId,
        projectName: params.projectName,
        downloadUrl,
        deployPath: params.deployPath,
        deployCommand: params.deployCommand
      });

      // 4. 清理临时文件
      console.log('4️⃣  清理临时文件...');
      fs.unlinkSync(zipFilePath);
      console.log('   ✓ 清理完成');
      console.log();

      // 5. 显示结果
      console.log('========================================');
      if (deployResult.success) {
        console.log('  ✅ 部署成功');
      } else {
        console.log('  ❌ 部署失败');
      }
      console.log('========================================\n');
      console.log('消息:', deployResult.message);
      
      if (deployResult.deployLog) {
        console.log('\n部署日志:');
        console.log('----------------------------------------');
        console.log(deployResult.deployLog);
        console.log('----------------------------------------');
      }

      return deployResult;
    } catch (error) {
      const err = error as Error;
      console.error('\n❌ 部署流程失败:', err.message);
      throw error;
    }
  }
}

export default DeployService;
