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

      // Fazer uma requisição simples para testar conectividade
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
      
      // Garantir que a tabela existe
      await nocodbService.ensureTableExists(this.TUTORIALS_TABLE);
      console.log('✅ Tabela de tutoriais verificada/criada');
      
    } catch (error) {
      console.error('❌ Erro ao garantir tabela de tutoriais:', error);
    }
  }

  async getTutorials(): Promise<TutorialData[]> {
    try {
      console.log('🔍 Buscando tutoriais...');
      
      // Forçar um novo teste de conexão
      this.connectionTested = false;
      
      if (!(await this.testConnection())) {
        console.warn('❌ Sem conexão com NocoDB, usando localStorage como fallback');
        return tutorialLocalStorageService.getTutorials();
      }
      
      // Garantir que a tabela existe primeiro
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
            id: item.ID || item.id, // Tentar ambas as variações
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
        
        // Sincronizar com localStorage como backup
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
      
      // Garantir que a tabela existe
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
        // Salvar também no localStorage como backup
        tutorialLocalStorageService.saveTutorial(tutorial);
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao salvar no NocoDB:', response.status, errorText);
        throw new Error(`Erro ao salvar tutorial no NocoDB: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar metadata no NocoDB:', error);
      
      // Fallback para localStorage
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

      // Primeiro, encontrar o registro pelo ID customizado usando o nome correto da coluna
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
          const recordId = records[0].Id; // ID interno do NocoDB (auto-increment)
          
          const tutorialData = {
            Title: tutorial.title,
            Description: tutorial.description,
            VideoUrl: tutorial.videoUrl || null,
            DocumentUrls: JSON.stringify(tutorial.documentUrls),
            CoverImageUrl: tutorial.coverImageUrl || null,
            Category: tutorial.category,
            UpdatedAt: tutorial.updatedAt
          };

          // Atualizar o registro
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
            // Atualizar também no localStorage como backup
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
      
      // Fallback para localStorage
      console.log('📦 Salvando no localStorage como fallback...');
      tutorialLocalStorageService.saveTutorial(tutorial);
      console.log('✅ Tutorial atualizado no localStorage como fallback');
    }
  }

  async deleteTutorial(tutorialId: string): Promise<void> {
    try {
      console.log('🗑️ MetadataService - Deletando tutorial:', tutorialId);
      
      if (!(await this.testConnection())) {
        console.warn('❌ MetadataService - Sem conexão com NocoDB');
        throw new Error('Falha na conexão com o NocoDB. Verifique sua conexão de internet.');
      }
      
      const targetBaseId = nocodbService.getTargetBaseId();
      const tableId = await nocodbService.getTableId(targetBaseId!, this.TUTORIALS_TABLE);
      
      if (!tableId) {
        console.error('❌ MetadataService - Tabela não encontrada');
        throw new Error('Tabela de tutoriais não encontrada no NocoDB');
      }

      // Primeiro, encontrar o registro pelo ID customizado usando o nome correto da coluna
      console.log('🔍 MetadataService - Buscando registro no NocoDB...');
      const searchResponse = await fetch(
        `${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${tableId}?where=(ID,eq,${tutorialId})`,
        {
          method: 'GET',
          headers: nocodbService.headers,
        }
      );

      if (!searchResponse.ok) {
        console.error('❌ MetadataService - Erro ao buscar tutorial:', searchResponse.status);
        throw new Error(`Erro ao buscar tutorial no NocoDB: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      const records = searchData.list || [];
      
      if (records.length === 0) {
        console.warn('⚠️ MetadataService - Tutorial não encontrado no NocoDB');
        // Remover do localStorage mesmo que não esteja no NocoDB
        tutorialLocalStorageService.deleteTutorial(tutorialId);
        throw new Error('Tutorial não encontrado no servidor');
      }

      const recordId = records[0].Id; // ID interno do NocoDB (auto-increment)
      console.log('📝 MetadataService - Registro encontrado, ID interno:', recordId);
      
      // Deletar o registro
      console.log('⏳ MetadataService - Executando exclusão no NocoDB...');
      const deleteResponse = await fetch(
        `${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${tableId}/${recordId}`,
        {
          method: 'DELETE',
          headers: nocodbService.headers,
        }
      );

      if (!deleteResponse.ok) {
        console.error('❌ MetadataService - Erro ao deletar do NocoDB:', deleteResponse.status);
        const errorText = await deleteResponse.text();
        console.error('❌ MetadataService - Detalhes do erro:', errorText);
        throw new Error(`Erro ao deletar tutorial do NocoDB: ${deleteResponse.status}`);
      }

      console.log('✅ MetadataService - Tutorial deletado do NocoDB com sucesso');
      
      // Remover do localStorage também
      tutorialLocalStorageService.deleteTutorial(tutorialId);
      console.log('✅ MetadataService - Tutorial removido do localStorage');
      
    } catch (error) {
      console.error('❌ MetadataService - Erro ao deletar tutorial:', error);
      throw error; // Re-lançar para que o serviço principal possa tratar
    }
  }
}

export const tutorialMetadataService = new TutorialMetadataService();
