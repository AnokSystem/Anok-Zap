import { nocodbService } from '../nocodb';
import { TutorialData } from './types';
import { tutorialLocalStorageService } from './localStorageService';

class TutorialMetadataService {
  private readonly TUTORIALS_TABLE = 'Tutoriais';
  private isConnected = false;
  private connectionTested = false;

  private parseDocumentUrls(documentUrls: string): string[] {
    if (!documentUrls) return [];
    try {
      return JSON.parse(documentUrls);
    } catch {
      return [];
    }
  }

  private async testConnection(): Promise<boolean> {
    if (this.connectionTested) return this.isConnected;
    
    try {
      console.log('🔌 Testando conexão com NocoDB...');
      const targetBaseId = nocodbService.getTargetBaseId();
      console.log('📋 Base ID encontrado:', targetBaseId);
      
      if (!targetBaseId) {
        console.warn('❌ Base do NocoDB não encontrada');
        this.isConnected = false;
        this.connectionTested = true;
        return false;
      }

      const response = await fetch(`${nocodbService.config.baseUrl}/api/v1/db/meta/projects/${targetBaseId}/tables`, {
        method: 'GET',
        headers: nocodbService.headers,
      });

      console.log('📡 Response status da conexão:', response.status);
      this.isConnected = response.ok;
      this.connectionTested = true;
      
      if (this.isConnected) {
        console.log('✅ Conexão com NocoDB estabelecida');
      } else {
        console.warn('❌ Falha na conexão com NocoDB:', response.status);
        const errorText = await response.text();
        console.warn('❌ Detalhes do erro:', errorText);
      }
      
      return this.isConnected;
    } catch (error) {
      console.error('❌ Erro ao testar conexão com NocoDB:', error);
      this.isConnected = false;
      this.connectionTested = true;
      return false;
    }
  }

  async ensureTutorialsTable(): Promise<void> {
    try {
      console.log('🔧 Garantindo que a tabela de tutoriais existe...');
      
      if (!(await this.testConnection())) {
        console.warn('❌ Sem conexão com NocoDB, pulando criação de tabela');
        return;
      }
      
      await nocodbService.ensureTableExists(this.TUTORIALS_TABLE);
      console.log('✅ Tabela de tutoriais verificada/criada');
      
    } catch (error) {
      console.error('❌ Erro ao garantir tabela de tutoriais:', error);
    }
  }

  async getTutorials(): Promise<TutorialData[]> {
    try {
      console.log('🔍 Buscando tutoriais...');
      
      this.connectionTested = false;
      
      if (!(await this.testConnection())) {
        console.warn('❌ Sem conexão com NocoDB, usando localStorage como fallback');
        return tutorialLocalStorageService.getTutorials();
      }
      
      await this.ensureTutorialsTable();
      
      const targetBaseId = nocodbService.getTargetBaseId();
      const tableId = await nocodbService.getTableId(targetBaseId!, this.TUTORIALS_TABLE);
      
      console.log('📋 Table ID encontrado:', tableId);
      
      if (!tableId) {
        console.warn('❌ Tabela de tutoriais não encontrada, usando localStorage como fallback');
        return tutorialLocalStorageService.getTutorials();
      }

      console.log('📋 Fazendo busca de todos os tutoriais...');
      const response = await fetch(`${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${tableId}?limit=1000`, {
        method: 'GET',
        headers: nocodbService.headers,
      });

      console.log('📡 Response status da busca:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Dados brutos recebidos do NocoDB:', data);
        
        const tutorials = (data.list || []).map((item: any) => {
          console.log('🔄 Processando item:', item);
          return {
            id: item.ID || item.id,
            title: item.Title || item.title,
            description: item.Description || item.description,
            videoUrl: item.VideoUrl || item.videoUrl || undefined,
            documentUrls: this.parseDocumentUrls(item.DocumentUrls || item.documentUrls || ''),
            coverImageUrl: item.CoverImageUrl || item.coverImageUrl || undefined,
            category: item.Category || item.category,
            createdAt: item.CreatedAt || item.createdAt,
            updatedAt: item.UpdatedAt || item.updatedAt
          };
        });
        
        console.log('✅ Tutoriais processados:', tutorials.length, 'itens');
        console.log('📋 Tutoriais processados:', tutorials);
        
        tutorials.forEach(tutorial => {
          tutorialLocalStorageService.saveTutorial(tutorial);
        });
        
        return tutorials;
      } else {
        const errorText = await response.text();
        console.warn('❌ Erro ao buscar tutoriais do NocoDB:', response.status, errorText);
        return tutorialLocalStorageService.getTutorials();
      }
    } catch (error) {
      console.error('❌ Erro ao buscar tutoriais do NocoDB:', error);
      console.log('📦 Usando localStorage como fallback');
      return tutorialLocalStorageService.getTutorials();
    }
  }

  async saveTutorial(tutorial: TutorialData): Promise<void> {
    try {
      console.log('💾 Salvando metadata do tutorial:', tutorial.id);
      
      if (!(await this.testConnection())) {
        console.warn('❌ Sem conexão com NocoDB, salvando apenas no localStorage');
        tutorialLocalStorageService.saveTutorial(tutorial);
        return;
      }
      
      await this.ensureTutorialsTable();
      
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

  async updateTutorial(tutorial: TutorialData): Promise<void> {
    try {
      console.log('🔄 Atualizando metadata do tutorial:', tutorial.id);
      
      if (!(await this.testConnection())) {
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

  async deleteTutorial(tutorialId: string): Promise<void> {
    try {
      console.log('🗑️ MetadataService.deleteTutorial - INICIANDO exclusão:', tutorialId);
      
      // Sempre remove do localStorage primeiro
      tutorialLocalStorageService.deleteTutorial(tutorialId);
      console.log('✅ MetadataService - Tutorial removido do localStorage');
      
      if (!(await this.testConnection())) {
        console.warn('❌ MetadataService - Sem conexão com NocoDB, mas localStorage já foi atualizado');
        return;
      }
      
      const targetBaseId = nocodbService.getTargetBaseId();
      const tableId = await nocodbService.getTableId(targetBaseId!, this.TUTORIALS_TABLE);
      
      if (!tableId) {
        console.error('❌ MetadataService - Tabela não encontrada, mas localStorage já foi atualizado');
        return;
      }

      console.log('🔍 MetadataService - Buscando registro no NocoDB com ID:', tutorialId);
      const searchResponse = await fetch(
        `${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${tableId}?where=(ID,eq,${tutorialId})`,
        {
          method: 'GET',
          headers: nocodbService.headers,
        }
      );

      if (!searchResponse.ok) {
        console.error('❌ MetadataService - Erro ao buscar tutorial:', searchResponse.status);
        const errorText = await searchResponse.text();
        console.error('❌ MetadataService - Detalhes:', errorText);
        return; // localStorage já foi atualizado
      }

      const searchData = await searchResponse.json();
      const records = searchData.list || [];
      
      console.log('📊 MetadataService - Registros encontrados:', records.length);
      console.log('📋 MetadataService - Dados dos registros:', records);
      
      if (records.length === 0) {
        console.warn('⚠️ MetadataService - Tutorial não encontrado no NocoDB');
        return; // localStorage já foi atualizado
      }

      // Usar o campo correto para o ID interno do NocoDB
      const record = records[0];
      const internalRecordId = record.CreatedAt1 ? record.CreatedAt1 : record.Id;
      
      if (!internalRecordId) {
        console.error('❌ MetadataService - ID interno do registro não encontrado');
        console.error('❌ MetadataService - Estrutura do registro:', record);
        return; // localStorage já foi atualizado
      }
      
      console.log('📝 MetadataService - ID interno encontrado:', internalRecordId);
      
      // Vamos tentar usar o endpoint de busca por ID customizado
      const deleteUrl = `${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${tableId}`;
      
      console.log('⏳ MetadataService - Tentando deletar pelo ID customizado...');
      const deleteResponse = await fetch(
        `${deleteUrl}?where=(ID,eq,${tutorialId})`,
        {
          method: 'DELETE',
          headers: nocodbService.headers,
        }
      );

      if (!deleteResponse.ok) {
        console.error('❌ MetadataService - Erro ao deletar do NocoDB:', deleteResponse.status);
        const errorText = await deleteResponse.text();
        console.error('❌ MetadataService - Detalhes do erro:', errorText);
        return; // localStorage já foi atualizado
      }

      console.log('✅ MetadataService - Tutorial deletado do NocoDB com sucesso');
      
    } catch (error) {
      console.error('❌ MetadataService - Erro ao deletar tutorial:', error);
      // localStorage já foi atualizado no início da função
    }
  }
}

export const tutorialMetadataService = new TutorialMetadataService();
