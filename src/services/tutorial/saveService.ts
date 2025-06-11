
import { nocodbService } from '../nocodb';
import { TutorialData } from './types';
import { tutorialLocalStorageService } from './localStorageService';
import { tutorialConnectionService } from './connectionService';
import { tutorialDataService } from './dataService';

class TutorialSaveService {
  private readonly TUTORIALS_TABLE = 'Tutoriais';

  async saveTutorial(tutorial: TutorialData): Promise<void> {
    try {
      console.log('💾 SaveService - Salvando metadata do tutorial:', tutorial.id);
      
      // Testar conexão primeiro
      if (!(await tutorialConnectionService.testConnection())) {
        console.warn('❌ SaveService - Sem conexão com NocoDB, salvando apenas no localStorage');
        tutorialLocalStorageService.saveTutorial(tutorial);
        return;
      }
      
      // Garantir que a tabela existe
      await tutorialDataService.ensureTutorialsTable();
      
      const targetBaseId = tutorialConnectionService.getTargetBaseId();
      if (!targetBaseId) {
        console.error('❌ SaveService - Base ID não encontrado');
        tutorialLocalStorageService.saveTutorial(tutorial);
        return;
      }

      console.log('✅ SaveService - Base ID obtido:', targetBaseId);

      const tableId = await nocodbService.getTableId(targetBaseId, this.TUTORIALS_TABLE);
      
      if (!tableId) {
        console.error('❌ SaveService - Tabela de tutoriais não encontrada');
        tutorialLocalStorageService.saveTutorial(tutorial);
        return;
      }

      console.log('✅ SaveService - Table ID obtido:', tableId);

      const tutorialData = {
        ID: tutorial.id,
        Title: tutorial.title,
        Description: tutorial.description,
        VideoUrl: tutorial.videoUrl || null,
        DocumentUrls: JSON.stringify(tutorial.documentUrls),
        CoverImageUrl: tutorial.coverImageUrl || null,
        Category: tutorial.category,
        CreatedAt: tutorial.createdAt,
        UpdatedAt: tutorial.updatedAt
      };

      console.log('📝 SaveService - Dados a serem salvos:', tutorialData);

      const saveUrl = `${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${tableId}`;
      console.log('🔗 SaveService - URL de salvamento:', saveUrl);

      const response = await fetch(saveUrl, {
        method: 'POST',
        headers: {
          ...nocodbService.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tutorialData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ SaveService - Tutorial salvo no NocoDB com sucesso!');
        console.log('✅ SaveService - Resposta:', result);
        tutorialLocalStorageService.saveTutorial(tutorial);
      } else {
        const errorText = await response.text();
        console.error('❌ SaveService - Erro ao salvar no NocoDB:', response.status, errorText);
        console.log('📦 SaveService - Salvando no localStorage como fallback...');
        tutorialLocalStorageService.saveTutorial(tutorial);
      }
    } catch (error) {
      console.error('❌ SaveService - Erro ao salvar metadata no NocoDB:', error);
      
      console.log('📦 SaveService - Salvando no localStorage como fallback...');
      tutorialLocalStorageService.saveTutorial(tutorial);
      console.log('✅ SaveService - Tutorial salvo no localStorage como fallback');
    }
  }
}

export const tutorialSaveService = new TutorialSaveService();
