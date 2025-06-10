
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

  async updateTutorial(tutorialId: string, data: CreateTutorialData): Promise<TutorialData> {
    try {
      console.log('Atualizando tutorial:', tutorialId, 'com dados:', data.title);

      // Buscar tutorial existente
      const existingTutorials = await this.getTutorials();
      const existingTutorial = existingTutorials.find(t => t.id === tutorialId);
      
      if (!existingTutorial) {
        throw new Error('Tutorial não encontrado');
      }

      console.log('Verificando necessidade de upload de novos arquivos...');

      // Upload dos novos arquivos se fornecidos
      const uploadResult = await tutorialFileUploadService.uploadTutorialFiles(
        tutorialId,
        data.videoFile,
        data.documentFiles,
        data.coverImageFile
      );

      // Criar tutorial atualizado mantendo URLs existentes se não há novos uploads
      const updatedTutorial: TutorialData = {
        ...existingTutorial,
        title: data.title,
        description: data.description,
        category: data.category,
        videoUrl: uploadResult.videoUrl || existingTutorial.videoUrl,
        documentUrls: uploadResult.documentUrls.length > 0 ? uploadResult.documentUrls : existingTutorial.documentUrls,
        coverImageUrl: uploadResult.coverImageUrl || existingTutorial.coverImageUrl,
        updatedAt: new Date().toISOString()
      };

      // Salvar metadata atualizada
      await tutorialMetadataService.updateTutorial(updatedTutorial);

      console.log('Tutorial atualizado com sucesso:', updatedTutorial);
      return updatedTutorial;
    } catch (error) {
      console.error('Erro ao atualizar tutorial:', error);
      throw error;
    }
  }

  async getTutorials(): Promise<TutorialData[]> {
    return tutorialMetadataService.getTutorials();
  }

  async deleteTutorial(tutorialId: string): Promise<boolean> {
    try {
      console.log('🗑️ TutorialService - Iniciando exclusão do tutorial:', tutorialId);
      
      const tutorials = await this.getTutorials();
      const tutorial = tutorials.find(t => t.id === tutorialId);
      
      if (!tutorial) {
        console.error('❌ TutorialService - Tutorial não encontrado:', tutorialId);
        throw new Error('Tutorial não encontrado');
      }
      
      console.log('📝 TutorialService - Tutorial encontrado:', tutorial.title);
      
      // Tentar deletar metadata primeiro (mais crítico)
      console.log('🔄 TutorialService - Deletando metadata...');
      await tutorialMetadataService.deleteTutorial(tutorialId);
      console.log('✅ TutorialService - Metadata deletado com sucesso');
      
      // Deletar arquivos do MinIO (menos crítico, não deve falhar a operação)
      try {
        console.log('🔄 TutorialService - Deletando arquivos do MinIO...');
        await tutorialFileUploadService.deleteFiles(tutorial.videoUrl, tutorial.documentUrls, tutorial.coverImageUrl);
        console.log('✅ TutorialService - Arquivos do MinIO deletados');
      } catch (minioError) {
        console.warn('⚠️ TutorialService - Falha ao deletar arquivos do MinIO (não crítico):', minioError);
      }
      
      console.log('✅ TutorialService - Tutorial deletado completamente');
      return true;
    } catch (error) {
      console.error('❌ TutorialService - Erro ao deletar tutorial:', error);
      throw error; // Re-lançar o erro para que o hook possa tratá-lo
    }
  }

  async clearAllTutorials(): Promise<void> {
    tutorialLocalStorageService.clearAll();
  }
}

export const tutorialService = new TutorialService();
export * from './types';
