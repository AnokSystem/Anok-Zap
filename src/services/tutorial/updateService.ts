
import { nocodbService } from '../nocodb';
import { TutorialData } from './types';
import { tutorialLocalStorageService } from './localStorageService';
import { tutorialConnectionService } from './connectionService';

class TutorialUpdateService {
  private readonly TUTORIALS_TABLE = 'Tutoriais';

  async updateTutorial(tutorial: TutorialData): Promise<void> {
    try {
      console.log('🔄 UpdateService - INICIANDO atualização do tutorial:', tutorial.id);
      
      if (!(await tutorialConnectionService.testConnection())) {
        console.warn('❌ UpdateService - Sem conexão com NocoDB, atualizando apenas no localStorage');
        tutorialLocalStorageService.saveTutorial(tutorial);
        return;
      }
      
      const targetBaseId = nocodbService.getTargetBaseId();
      const tableId = await nocodbService.getTableId(targetBaseId!, this.TUTORIALS_TABLE);
      
      if (!tableId) {
        throw new Error('Tabela de tutoriais não encontrada');
      }

      console.log('🔍 UpdateService - Buscando registro no NocoDB com ID:', tutorial.id);

      // Buscar o registro usando o campo ID customizado
      const searchResponse = await fetch(
        `${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${tableId}?where=(ID,eq,${encodeURIComponent(tutorial.id)})&limit=1`,
        {
          method: 'GET',
          headers: nocodbService.headers,
        }
      );

      if (!searchResponse.ok) {
        console.error('❌ UpdateService - Erro ao buscar tutorial:', searchResponse.status);
        throw new Error(`Erro ao buscar tutorial: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      const records = searchData.list || [];
      
      console.log('📊 UpdateService - Registros encontrados:', records.length);

      if (records.length === 0) {
        console.warn('⚠️ UpdateService - Tutorial não encontrado no NocoDB, salvando apenas no localStorage');
        tutorialLocalStorageService.saveTutorial(tutorial);
        return;
      }

      // Pegar o ID interno do NocoDB
      const record = records[0];
      const nocodbRecordId = record.Id || record.id;
      
      if (!nocodbRecordId) {
        console.error('❌ UpdateService - ID interno do NocoDB não encontrado');
        throw new Error('ID interno do registro não encontrado');
      }

      console.log('📝 UpdateService - ID interno do NocoDB encontrado:', nocodbRecordId);

      const tutorialData = {
        Title: tutorial.title,
        Description: tutorial.description,
        VideoUrl: tutorial.videoUrl || null,
        DocumentUrls: JSON.stringify(tutorial.documentUrls),
        CoverImageUrl: tutorial.coverImageUrl || null,
        Category: tutorial.category,
        UpdatedAt: tutorial.updatedAt
      };

      console.log('📤 UpdateService - Enviando atualização...');

      const updateResponse = await fetch(
        `${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${tableId}/${nocodbRecordId}`,
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
        console.log('✅ UpdateService - Tutorial atualizado no NocoDB com sucesso!');
        tutorialLocalStorageService.saveTutorial(tutorial);
      } else {
        const errorText = await updateResponse.text();
        console.error('❌ UpdateService - Erro ao atualizar no NocoDB:', updateResponse.status, errorText);
        throw new Error(`Erro ao atualizar tutorial no NocoDB: ${updateResponse.status}`);
      }
    } catch (error) {
      console.error('❌ UpdateService - Erro ao atualizar tutorial:', error);
      
      console.log('📦 UpdateService - Salvando no localStorage como fallback...');
      tutorialLocalStorageService.saveTutorial(tutorial);
      console.log('✅ UpdateService - Tutorial atualizado no localStorage como fallback');
    }
  }
}

export const tutorialUpdateService = new TutorialUpdateService();
