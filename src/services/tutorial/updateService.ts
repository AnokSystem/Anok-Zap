
import { nocodbService } from '../nocodb';
import { TutorialData } from './types';
import { tutorialLocalStorageService } from './localStorageService';
import { tutorialConnectionService } from './connectionService';

class TutorialUpdateService {
  private readonly TUTORIALS_TABLE = 'Tutoriais';

  async updateTutorial(tutorial: TutorialData): Promise<void> {
    try {
      console.log('🔄 Atualizando metadata do tutorial:', tutorial.id);
      
      if (!(await tutorialConnectionService.testConnection())) {
        console.warn('❌ Sem conexão com NocoDB, atualizando apenas no localStorage');
        tutorialLocalStorageService.saveTutorial(tutorial);
        return;
      }
      
      const targetBaseId = nocodbService.getTargetBaseId();
      const tableId = await nocodbService.getTableId(targetBaseId!, this.TUTORIALS_TABLE);
      
      if (!tableId) {
        throw new Error('Tabela de tutoriais não encontrada');
      }

      const searchResponse = await fetch(
        `${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${tableId}?where=(ID,eq,${tutorial.id})`,
        {
          method: 'GET',
          headers: nocodbService.headers,
        }
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const records = searchData.list || [];
        
        if (records.length > 0) {
          const recordId = records[0].Id;
          
          const tutorialData = {
            Title: tutorial.title,
            Description: tutorial.description,
            VideoUrl: tutorial.videoUrl || null,
            DocumentUrls: JSON.stringify(tutorial.documentUrls),
            CoverImageUrl: tutorial.coverImageUrl || null,
            Category: tutorial.category,
            UpdatedAt: tutorial.updatedAt
          };

          const updateResponse = await fetch(
            `${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${tableId}/${recordId}`,
            {
              method: 'PATCH',
              headers: {
                ...nocodbService.headers,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(tutorialData),
            }
          );

          if (updateResponse.ok) {
            console.log('✅ Tutorial atualizado no NocoDB com sucesso!');
            tutorialLocalStorageService.saveTutorial(tutorial);
          } else {
            const errorText = await updateResponse.text();
            console.error('❌ Erro ao atualizar no NocoDB:', updateResponse.status, errorText);
            throw new Error(`Erro ao atualizar tutorial no NocoDB: ${updateResponse.status}`);
          }
        } else {
          throw new Error('Tutorial não encontrado para atualização');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar metadata no NocoDB:', error);
      
      console.log('📦 Salvando no localStorage como fallback...');
      tutorialLocalStorageService.saveTutorial(tutorial);
      console.log('✅ Tutorial atualizado no localStorage como fallback');
    }
  }
}

export const tutorialUpdateService = new TutorialUpdateService();
