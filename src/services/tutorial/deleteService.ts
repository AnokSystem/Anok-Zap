
import { nocodbService } from '../nocodb';
import { tutorialLocalStorageService } from './localStorageService';
import { tutorialConnectionService } from './connectionService';

class TutorialDeleteService {
  private readonly TUTORIALS_TABLE = 'Tutoriais';

  async deleteTutorial(tutorialId: string): Promise<void> {
    try {
      console.log('🗑️ DeleteService.deleteTutorial - INICIANDO exclusão:', tutorialId);
      
      // Sempre remove do localStorage primeiro
      tutorialLocalStorageService.deleteTutorial(tutorialId);
      console.log('✅ DeleteService - Tutorial removido do localStorage');
      
      if (!(await tutorialConnectionService.testConnection())) {
        console.warn('❌ DeleteService - Sem conexão com NocoDB, mas localStorage já foi atualizado');
        return;
      }
      
      const targetBaseId = nocodbService.getTargetBaseId();
      const tableId = await nocodbService.getTableId(targetBaseId!, this.TUTORIALS_TABLE);
      
      if (!tableId) {
        console.error('❌ DeleteService - Tabela não encontrada, mas localStorage já foi atualizado');
        return;
      }

      console.log('🔍 DeleteService - Buscando registro no NocoDB com ID:', tutorialId);
      const searchResponse = await fetch(
        `${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${tableId}?where=(ID,eq,${tutorialId})`,
        {
          method: 'GET',
          headers: nocodbService.headers,
        }
      );

      if (!searchResponse.ok) {
        console.error('❌ DeleteService - Erro ao buscar tutorial:', searchResponse.status);
        const errorText = await searchResponse.text();
        console.error('❌ DeleteService - Detalhes:', errorText);
        return; // localStorage já foi atualizado
      }

      const searchData = await searchResponse.json();
      const records = searchData.list || [];
      
      console.log('📊 DeleteService - Registros encontrados:', records.length);
      console.log('📋 DeleteService - Dados dos registros:', records);
      
      if (records.length === 0) {
        console.warn('⚠️ DeleteService - Tutorial não encontrado no NocoDB');
        return; // localStorage já foi atualizado
      }

      // Usar o campo correto para o ID interno do NocoDB
      const record = records[0];
      const internalRecordId = record.CreatedAt1 ? record.CreatedAt1 : record.Id;
      
      if (!internalRecordId) {
        console.error('❌ DeleteService - ID interno do registro não encontrado');
        console.error('❌ DeleteService - Estrutura do registro:', record);
        return; // localStorage já foi atualizado
      }
      
      console.log('📝 DeleteService - ID interno encontrado:', internalRecordId);
      
      // Vamos tentar usar o endpoint de busca por ID customizado
      const deleteUrl = `${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${tableId}`;
      
      console.log('⏳ DeleteService - Tentando deletar pelo ID customizado...');
      const deleteResponse = await fetch(
        `${deleteUrl}?where=(ID,eq,${tutorialId})`,
        {
          method: 'DELETE',
          headers: nocodbService.headers,
        }
      );

      if (!deleteResponse.ok) {
        console.error('❌ DeleteService - Erro ao deletar do NocoDB:', deleteResponse.status);
        const errorText = await deleteResponse.text();
        console.error('❌ DeleteService - Detalhes do erro:', errorText);
        return; // localStorage já foi atualizado
      }

      console.log('✅ DeleteService - Tutorial deletado do NocoDB com sucesso');
      
    } catch (error) {
      console.error('❌ DeleteService - Erro ao deletar tutorial:', error);
      // localStorage já foi atualizado no início da função
    }
  }
}

export const tutorialDeleteService = new TutorialDeleteService();
