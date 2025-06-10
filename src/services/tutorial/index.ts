
import { TutorialData, CreateTutorialData } from './types';
import { tutorialFileUploadService } from './fileUploadService';
import { tutorialMetadataService } from './metadataService';
import { tutorialLocalStorageService } from './localStorageService';

class TutorialService {
  async createTutorial(data: CreateTutorialData): Promise<TutorialData> {
    try {
      const tutorialId = `tutorial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Criando tutorial:', tutorialId, 'com dados:', data.title);

      console.log('Iniciando uploads dos arquivos...');

      // Upload dos arquivos
      const { videoUrl, documentUrls, coverImageUrl } = await tutorialFileUploadService.uploadTutorialFiles(
        tutorialId,
        data.videoFile,
        data.documentFiles,
        data.coverImageFile
      );

      console.log('Uploads concluídos, criando metadata...');

      // Criar metadata do tutorial
      const tutorial: TutorialData = {
        id: tutorialId,
        title: data.title,
        description: data.description,
        videoUrl,
        documentUrls,
        coverImageUrl,
        category: data.category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Salvar metadata
      await tutorialMetadataService.saveTutorial(tutorial);

      console.log('Tutorial criado com sucesso:', tutorial);
      return tutorial;
    } catch (error) {
      console.error('Erro ao criar tutorial:', error);
      throw error;
    }
  }

  async getTutorials(): Promise<TutorialData[]> {
    return tutorialMetadataService.getTutorials();
  }

  async deleteTutorial(tutorialId: string): Promise<boolean> {
    try {
      console.log('Deletando tutorial:', tutorialId);
      
      const tutorials = await this.getTutorials();
      const tutorial = tutorials.find(t => t.id === tutorialId);
      
      if (tutorial) {
        // Deletar arquivos do MinIO
        await tutorialFileUploadService.deleteFiles(tutorial.videoUrl, tutorial.documentUrls, tutorial.coverImageUrl);
        
        // Deletar metadata
        await tutorialMetadataService.deleteTutorial(tutorialId);
      }
      
      console.log('Tutorial deletado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao deletar tutorial:', error);
      return false;
    }
  }

  async clearAllTutorials(): Promise<void> {
    tutorialLocalStorageService.clearAll();
  }
}

export const tutorialService = new TutorialService();
export * from './types';
