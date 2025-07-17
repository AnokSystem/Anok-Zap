
import { fileUploadService as nocodbUploadService } from '@/services/fileUpload';

export const fileUploadService = {
  uploadFile: async (file: File): Promise<string> => {
    try {
      console.log('🚀 FILEUPLOAD - Iniciando upload via NocoDB service...');
      console.log('📋 FILEUPLOAD - Arquivo:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Chamar o serviço NocoDB para fazer o upload
      const fileUrl = await nocodbUploadService.uploadFile(file);
      
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

  // Função para testar a conexão NocoDB
  testConnection: async (): Promise<boolean> => {
    try {
      console.log('🔧 FILEUPLOAD - Testando conexão NocoDB...');
      const isConnected = await nocodbUploadService.testConnection();
      console.log(`🔧 FILEUPLOAD - Resultado do teste: ${isConnected ? 'SUCESSO' : 'FALHA'}`);
      return isConnected;
    } catch (error) {
      console.error('❌ FILEUPLOAD - Erro no teste de conexão:', error);
      return false;
    }
  }
};
