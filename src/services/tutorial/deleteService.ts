
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
      
      // Testar conexão e obter Base ID
      if (!(await tutorialConnectionService.testConnection())) {
        console.warn('❌ DeleteService - Sem conexão com NocoDB, mas localStorage já foi atualizado');
        return;
      }
      
      const targetBaseId = tutorialConnectionService.getTargetBaseId();
      if (!targetBaseId) {
        console.error('❌ DeleteService - Base ID não encontrado');
        return;
      }

      console.log('✅ DeleteService - Base ID obtido:', targetBaseId);

      const tableId = await nocodbService.getTableId(targetBaseId, this.TUTORIALS_TABLE);
      
      if (!tableId) {
        console.error('❌ DeleteService - Tabela não encontrada, mas localStorage já foi atualizado');
        return;
      }

      console.log('✅ DeleteService - Table ID obtido:', tableId);
      console.log('🔍 DeleteService - Buscando registro no NocoDB com ID:', tutorialId);
      
      // Buscar o registro usando o campo ID customizado
      const searchUrl = `${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${tableId}`;
      const searchResponse = await fetch(
        `${searchUrl}?where=(ID,eq,${encodeURIComponent(tutorialId)})&limit=1`,
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

      // Pegar o ID interno do NocoDB do primeiro registro encontrado
      const record = records[0];
      const nocodbRecordId = record.Id || record.id;
      
      if (!nocodbRecordId) {
        console.error('❌ DeleteService - ID interno do NocoDB não encontrado');
        console.error('❌ DeleteService - Estrutura do registro:', record);
        return; // localStorage já foi atualizado
      }
      
      console.log('📝 DeleteService - ID interno do NocoDB encontrado:', nocodbRecordId);
      
      // Deletar usando o ID interno do NocoDB
      const deleteUrl = `${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${tableId}/${nocodbRecordId}`;
      
      console.log('⏳ DeleteService - Executando DELETE no NocoDB...');
      const deleteResponse = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: nocodbService.headers,
      });

      if (!deleteResponse.ok) {
        console.error('❌ DeleteService - Erro ao deletar do NocoDB:', deleteResponse.status);
        const errorText = await deleteResponse.text();
        console.error('❌ DeleteService - Detalhes do erro:', errorText);
        return; // localStorage já foi atualizado
      }

      const deleteResult = await deleteResponse.json();
      console.log('✅ DeleteService - Resposta do delete:', deleteResult);
      console.log('✅ DeleteService - Tutorial deletado do NocoDB com sucesso');
      
    } catch (error) {
      console.error('❌ DeleteService - Erro ao deletar tutorial:', error);
      // localStorage já foi atualizado no início da função
    }
  }
}

export const tutorialDeleteService = new TutorialDeleteService();
