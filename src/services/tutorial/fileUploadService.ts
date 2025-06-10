
import { minioService } from '../minio';
import { UploadResult } from './types';

class TutorialFileUploadService {
  private readonly TUTORIALS_FOLDER = 'tutoriais';

  async uploadTutorialFiles(tutorialId: string, videoFile?: File, documentFiles: File[] = []): Promise<UploadResult> {
    const results: UploadResult = {
      videoUrl: undefined,
      documentUrls: []
    };

    try {
      console.log(`Iniciando upload de arquivos para tutorial: ${tutorialId}`);

      // Upload video se fornecido
      if (videoFile) {
        console.log('Fazendo upload do vídeo...');
        try {
          const timestamp = Date.now();
          const fileExtension = videoFile.name.split('.').pop() || 'mp4';
          const videoFileName = `${this.TUTORIALS_FOLDER}/${tutorialId}/video/video_${timestamp}.${fileExtension}`;
          
          const renamedVideoFile = new File([videoFile], videoFileName, { type: videoFile.type });
          
          results.videoUrl = await minioService.uploadFile(renamedVideoFile);
          console.log('Vídeo enviado com sucesso:', results.videoUrl);
        } catch (error) {
          console.error('Erro no upload do vídeo:', error);
          throw new Error('Falha no upload do vídeo');
        }
      }

      // Upload documentos
      if (documentFiles.length > 0) {
        console.log(`Fazendo upload de ${documentFiles.length} documentos...`);
        for (let i = 0; i < documentFiles.length; i++) {
          const file = documentFiles[i];
          try {
            const timestamp = Date.now();
            const fileExtension = file.name.split('.').pop() || 'pdf';
            const docFileName = `${this.TUTORIALS_FOLDER}/${tutorialId}/documentos/doc_${i + 1}_${timestamp}.${fileExtension}`;
            
            const renamedDocFile = new File([file], docFileName, { type: file.type });
            
            const docUrl = await minioService.uploadFile(renamedDocFile);
            results.documentUrls.push(docUrl);
            console.log(`Documento ${i + 1} enviado:`, docUrl);
          } catch (error) {
            console.error(`Erro no upload do documento ${i + 1}:`, error);
            throw new Error(`Falha no upload do documento: ${file.name}`);
          }
        }
        console.log('Todos os documentos enviados com sucesso');
      }

      return results;
    } catch (error) {
      console.error('Erro geral no upload dos arquivos do tutorial:', error);
      throw error;
    }
  }

  async deleteFiles(videoUrl?: string, documentUrls: string[] = []): Promise<void> {
    // Deletar vídeo se existir
    if (videoUrl) {
      try {
        await minioService.deleteFile(videoUrl);
        console.log('Vídeo deletado do MinIO');
      } catch (error) {
        console.error('Erro ao deletar vídeo:', error);
      }
    }
    
    // Deletar documentos se existirem
    for (const docUrl of documentUrls) {
      try {
        await minioService.deleteFile(docUrl);
        console.log('Documento deletado do MinIO');
      } catch (error) {
        console.error('Erro ao deletar documento:', error);
      }
    }
  }
}

export const tutorialFileUploadService = new TutorialFileUploadService();
