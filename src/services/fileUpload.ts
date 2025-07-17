import { nocodbService } from './nocodb';

// Serviço de upload que usa NocoDB em vez de MinIO
export const fileUploadService = {
  uploadFile: async (file: File): Promise<string> => {
    return await (nocodbService as any).fileUploadService.uploadFile(file);
  },

  testConnection: async (): Promise<boolean> => {
    return await (nocodbService as any).fileUploadService.testConnection();
  }
};