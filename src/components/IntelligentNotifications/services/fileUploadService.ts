
import { minioService } from '@/services/minio';

export const fileUploadService = {
  uploadFile: async (file: File): Promise<string> => {
    try {
      const fileUrl = await minioService.uploadFile(file);
      return fileUrl;
    } catch (error) {
      console.error('❌ Erro ao fazer upload do arquivo:', error);
      throw new Error('Falha ao enviar arquivo');
    }
  }
};
