
import { minioService } from '../minio';
import { UploadResult } from './types';

class TutorialFileUploadService {
  private readonly TUTORIALS_FOLDER = 'tutoriais';

  async uploadTutorialFiles(tutorialId: string, videoFile?: File, documentFiles: File[] = [], coverImageFile?: File): Promise<UploadResult> {
    const results: UploadResult = {
      videoUrl: undefined,
      documentUrls: [],
      coverImageUrl: undefined
    };

    try {
      console.log(`Iniciando upload de arquivos para tutorial: ${tutorialId}`);

      // Upload da imagem de capa se fornecida
      if (coverImageFile) {
        console.log('Fazendo upload da imagem de capa...');
        try {
          const timestamp = Date.now();
          const fileExtension = coverImageFile.name.split('.').pop() || 'jpg';
          const coverImageFileName = `${this.TUTORIALS_FOLDER}/${tutorialId}/capa/cover_${timestamp}.${fileExtension}`;
          
          const renamedCoverFile = new File([coverImageFile], coverImageFileName, { type: coverImageFile.type });
          
          results.coverImageUrl = await minioService.uploadFile(renamedCoverFile);
          console.log('Imagem de capa enviada com sucesso:', results.coverImageUrl);
        } catch (error) {
          console.error('Erro no upload da imagem de capa:', error);
          throw new Error('Falha no upload da imagem de capa');
        }
      }

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

  async deleteFiles(videoUrl?: string, documentUrls: string[] = [], coverImageUrl?: string): Promise<void> {
    // Deletar imagem de capa se existir
    if (coverImageUrl) {
      try {
        await minioService.deleteFile(coverImageUrl);
        console.log('Imagem de capa deletada do MinIO');
      } catch (error) {
        console.error('Erro ao deletar imagem de capa:', error);
      }
    }

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
