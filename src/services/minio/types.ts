
export interface MinioConfig {
  serverUrl: string;
  accessKey: string;
  secretKey: string;
  bucketName: string;
  region: string;
}

export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface MinioHeaders {
  [key: string]: string;
}
