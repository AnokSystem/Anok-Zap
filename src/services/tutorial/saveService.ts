
import { nocodbService } from '../nocodb';
import { TutorialData } from './types';
import { tutorialLocalStorageService } from './localStorageService';
import { tutorialConnectionService } from './connectionService';
import { tutorialDataService } from './dataService';

class TutorialSaveService {
  private readonly TUTORIALS_TABLE = 'Tutoriais';

  async saveTutorial(tutorial: TutorialData): Promise<void> {
    try {
      console.log('💾 Salvando metadata do tutorial:', tutorial.id);
      
      if (!(await tutorialConnectionService.testConnection())) {
        console.warn('❌ Sem conexão com NocoDB, salvando apenas no localStorage');
        tutorialLocalStorageService.saveTutorial(tutorial);
        return;
      }
      
      await tutorialDataService.ensureTutorialsTable();
      
      const targetBaseId = nocodbService.getTargetBaseId();
      const tableId = await nocodbService.getTableId(targetBaseId!, this.TUTORIALS_TABLE);
      
      if (!tableId) {
        throw new Error('Tabela de tutoriais não encontrada');
      }

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

      const response = await fetch(`${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${tableId}`, {
        method: 'POST',
        headers: {
          ...nocodbService.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tutorialData),
      });

      if (response.ok) {
        console.log('✅ Tutorial salvo no NocoDB com sucesso!');
        tutorialLocalStorageService.saveTutorial(tutorial);
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao salvar no NocoDB:', response.status, errorText);
        throw new Error(`Erro ao salvar tutorial no NocoDB: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar metadata no NocoDB:', error);
      
      console.log('📦 Salvando no localStorage como fallback...');
      tutorialLocalStorageService.saveTutorial(tutorial);
      console.log('✅ Tutorial salvo no localStorage como fallback');
    }
  }
}

export const tutorialSaveService = new TutorialSaveService();
