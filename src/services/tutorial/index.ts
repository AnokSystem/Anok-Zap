
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
    console.log('🚀 TutorialService.deleteTutorial - INICIANDO EXCLUSÃO');
    console.log('📝 TutorialService.deleteTutorial - Tutorial ID:', tutorialId);
    console.log('⏰ TutorialService.deleteTutorial - Timestamp:', new Date().toISOString());
    
    try {
      console.log('🔍 TutorialService.deleteTutorial - Buscando tutorial na lista...');
      const tutorials = await this.getTutorials();
      console.log('📋 TutorialService.deleteTutorial - Total de tutoriais encontrados:', tutorials.length);
      
      const tutorial = tutorials.find(t => t.id === tutorialId);
      console.log('🔍 TutorialService.deleteTutorial - Tutorial encontrado:', tutorial ? tutorial.title : 'NÃO ENCONTRADO');
      
      if (!tutorial) {
        console.error('❌ TutorialService.deleteTutorial - Tutorial não encontrado:', tutorialId);
        throw new Error('Tutorial não encontrado');
      }
      
      console.log('📝 TutorialService.deleteTutorial - Tutorial encontrado:', tutorial.title);
      console.log('🔧 TutorialService.deleteTutorial - Dados do tutorial:', {
        id: tutorial.id,
        title: tutorial.title,
        videoUrl: tutorial.videoUrl,
        documentUrls: tutorial.documentUrls,
        coverImageUrl: tutorial.coverImageUrl
      });
      
      // Tentar deletar metadata primeiro (mais crítico)
      console.log('🔄 TutorialService.deleteTutorial - Deletando metadata...');
      console.log('🔧 TutorialService.deleteTutorial - Chamando tutorialMetadataService.deleteTutorial...');
      
      await tutorialMetadataService.deleteTutorial(tutorialId);
      console.log('✅ TutorialService.deleteTutorial - Metadata deletado com sucesso');
      
      // Deletar arquivos do MinIO (menos crítico, não deve falhar a operação)
      try {
        console.log('🔄 TutorialService.deleteTutorial - Deletando arquivos do MinIO...');
        await tutorialFileUploadService.deleteFiles(tutorial.videoUrl, tutorial.documentUrls, tutorial.coverImageUrl);
        console.log('✅ TutorialService.deleteTutorial - Arquivos do MinIO deletados');
      } catch (minioError) {
        console.warn('⚠️ TutorialService.deleteTutorial - Falha ao deletar arquivos do MinIO (não crítico):', minioError);
      }
      
      console.log('🎉 TutorialService.deleteTutorial - TUTORIAL DELETADO COMPLETAMENTE');
      return true;
    } catch (error) {
      console.error('❌ TutorialService.deleteTutorial - ERRO CRÍTICO:', error);
      console.error('🔍 TutorialService.deleteTutorial - Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error,
        tutorialId
      });
      throw error; // Re-lançar o erro para que o hook possa tratá-lo
    }
  }

  async clearAllTutorials(): Promise<void> {
    tutorialLocalStorageService.clearAll();
  }
}

export const tutorialService = new TutorialService();
export * from './types';
