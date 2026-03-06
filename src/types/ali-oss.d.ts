declare module 'ali-oss' {
  interface OSSOptions {
    region: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
  }

  interface SignatureUrlOptions {
    expires?: number;
    method?: string;
  }

  class OSS {
    constructor(options: OSSOptions);
    put(name: string, file: string): Promise<unknown>;
    signatureUrl(name: string, options?: SignatureUrlOptions): string;
  }

  export default OSS;
}
