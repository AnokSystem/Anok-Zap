
import { TutorialData, CreateTutorialData } from './types';
import { tutorialMetadataService } from './metadataService';
import { tutorialFileUploadService } from './fileUploadService';

class TutorialService {
  async getTutorials(): Promise<TutorialData[]> {
    return tutorialMetadataService.getTutorials();
  }

  async createTutorial(data: CreateTutorialData): Promise<TutorialData> {
    try {
      console.log('🏗️ TutorialService - INICIANDO criação de tutorial:', data.title);
      
      // Generate tutorial ID
      const tutorialId = `tutorial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('🆔 TutorialService - ID gerado:', tutorialId);
      
      // Upload files
      console.log('📤 TutorialService - Fazendo upload dos arquivos...');
      const uploadResult = await tutorialFileUploadService.uploadTutorialFiles(
        tutorialId,
        data.videoFile,
        data.documentFiles,
        data.coverImageFile
      );
      console.log('✅ TutorialService - Upload concluído:', {
        hasVideo: !!uploadResult.videoUrl,
        documentsCount: uploadResult.documentUrls.length,
        hasCover: !!uploadResult.coverImageUrl
      });

      // Create tutorial data
      const tutorial: TutorialData = {
        id: tutorialId,
        title: data.title,
        description: data.description,
        category: data.category,
        videoUrl: uploadResult.videoUrl,
        documentUrls: uploadResult.documentUrls,
        coverImageUrl: uploadResult.coverImageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('💾 TutorialService - Salvando metadata do tutorial...');
      // Save tutorial metadata
      await tutorialMetadataService.saveTutorial(tutorial);
      
      console.log('✅ TutorialService - Tutorial criado com SUCESSO:', tutorial.id);
      return tutorial;
    } catch (error) {
      console.error('❌ TutorialService - ERRO na criação do tutorial:', error);
      throw error;
    }
  }

  async updateTutorial(tutorial: TutorialData): Promise<void> {
    return tutorialMetadataService.updateTutorial(tutorial);
  }

  async deleteTutorial(tutorialId: string): Promise<void> {
    return tutorialMetadataService.deleteTutorial(tutorialId);
  }
}

export const tutorialService = new TutorialService();
