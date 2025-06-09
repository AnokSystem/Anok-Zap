
import { minioService } from '@/services/minio';

export const fileUploadService = {
  uploadFile: async (file: File): Promise<string> => {
    try {
      console.log('🚀 FILEUPLOAD - Iniciando upload via MinIO service...');
      console.log('📋 FILEUPLOAD - Arquivo:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Chamar o serviço MinIO para fazer o upload
      const fileUrl = await minioService.uploadFile(file);
      
      console.log('✅ FILEUPLOAD - Upload concluído com sucesso:', fileUrl);
      return fileUrl;
      
    } catch (error) {
      console.error('❌ FILEUPLOAD - Erro ao fazer upload:', error);
      console.error('❌ FILEUPLOAD - Detalhes do erro:', {
        message: error.message,
        stack: error.stack
      });
      
      // Re-throw com uma mensagem mais clara
      throw new Error(`Falha no upload: ${error.message}`);
    }
  },

  // Função para testar a conexão MinIO
  testConnection: async (): Promise<boolean> => {
    try {
      console.log('🔧 FILEUPLOAD - Testando conexão MinIO...');
      const isConnected = await minioService.testConnection();
      console.log(`🔧 FILEUPLOAD - Resultado do teste: ${isConnected ? 'SUCESSO' : 'FALHA'}`);
      return isConnected;
    } catch (error) {
      console.error('❌ FILEUPLOAD - Erro no teste de conexão:', error);
      return false;
    }
  }
};
