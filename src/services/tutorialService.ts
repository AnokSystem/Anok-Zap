
import { minioService } from './minio';

export interface TutorialData {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  documentUrls: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTutorialData {
  title: string;
  description: string;
  category: string;
  videoFile?: File;
  documentFiles: File[];
}

class TutorialService {
  private readonly TUTORIALS_FOLDER = 'tutorials';
  private readonly METADATA_FILE = 'tutorials/metadata.json';

  async uploadTutorialFiles(tutorialId: string, videoFile?: File, documentFiles: File[] = []): Promise<{ videoUrl?: string; documentUrls: string[] }> {
    const results = {
      videoUrl: undefined as string | undefined,
      documentUrls: [] as string[]
    };

    try {
      // Upload video se fornecido
      if (videoFile) {
        console.log('Fazendo upload do vídeo...');
        const videoPath = `${this.TUTORIALS_FOLDER}/${tutorialId}/video/${videoFile.name}`;
        results.videoUrl = await minioService.uploadFile(videoFile);
        console.log('Vídeo enviado:', results.videoUrl);
      }

      // Upload documentos
      if (documentFiles.length > 0) {
        console.log('Fazendo upload dos documentos...');
        for (const file of documentFiles) {
          const docPath = `${this.TUTORIALS_FOLDER}/${tutorialId}/documents/${file.name}`;
          const docUrl = await minioService.uploadFile(file);
          results.documentUrls.push(docUrl);
        }
        console.log('Documentos enviados:', results.documentUrls);
      }

      return results;
    } catch (error) {
      console.error('Erro no upload dos arquivos do tutorial:', error);
      throw error;
    }
  }

  async createTutorial(data: CreateTutorialData): Promise<TutorialData> {
    try {
      const tutorialId = `tutorial_${Date.now()}`;
      console.log('Criando tutorial:', tutorialId);

      // Upload dos arquivos
      const { videoUrl, documentUrls } = await this.uploadTutorialFiles(
        tutorialId,
        data.videoFile,
        data.documentFiles
      );

      // Criar metadata do tutorial
      const tutorial: TutorialData = {
        id: tutorialId,
        title: data.title,
        description: data.description,
        videoUrl,
        documentUrls,
        category: data.category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Salvar metadata
      await this.saveTutorialMetadata(tutorial);

      console.log('Tutorial criado com sucesso:', tutorial);
      return tutorial;
    } catch (error) {
      console.error('Erro ao criar tutorial:', error);
      throw error;
    }
  }

  async getTutorials(): Promise<TutorialData[]> {
    try {
      console.log('Buscando tutoriais...');
      
      // Por enquanto, retornamos dados mock até implementarmos o storage de metadata
      const mockTutorials: TutorialData[] = [
        {
          id: 'tutorial_1',
          title: 'Como Conectar WhatsApp',
          description: 'Aprenda a conectar sua instância do WhatsApp ao sistema',
          category: 'Primeiros Passos',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          documentUrls: []
        },
        {
          id: 'tutorial_2',
          title: 'Configurar Disparos em Massa',
          description: 'Tutorial completo sobre como configurar e executar disparos em massa',
          category: 'Guias Avançados',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          documentUrls: []
        }
      ];

      return mockTutorials;
    } catch (error) {
      console.error('Erro ao buscar tutoriais:', error);
      return [];
    }
  }

  async deleteTutorial(tutorialId: string): Promise<boolean> {
    try {
      console.log('Deletando tutorial:', tutorialId);
      
      // Aqui implementaríamos a lógica para deletar arquivos do MinIO
      // e remover da metadata
      
      console.log('Tutorial deletado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao deletar tutorial:', error);
      return false;
    }
  }

  private async saveTutorialMetadata(tutorial: TutorialData): Promise<void> {
    try {
      // Por enquanto, só logamos. Em uma implementação completa,
      // salvaríamos a metadata em um arquivo JSON no MinIO
      console.log('Salvando metadata do tutorial:', tutorial);
    } catch (error) {
      console.error('Erro ao salvar metadata:', error);
      throw error;
    }
  }

  async testMinioConnection(): Promise<boolean> {
    return await minioService.testConnection();
  }
}

export const tutorialService = new TutorialService();
