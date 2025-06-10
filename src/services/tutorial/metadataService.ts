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

      this.isConnected = response.ok;
      this.connectionTested = true;
      
      if (this.isConnected) {
        console.log('✅ Conexão com NocoDB estabelecida');
      } else {
        console.warn('❌ Falha na conexão com NocoDB:', response.status);
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
      
      const targetBaseId = nocodbService.getTargetBaseId();
      const tableId = await nocodbService.getTableId(targetBaseId!, this.TUTORIALS_TABLE);
      
      if (!tableId) {
        console.warn('❌ Tabela de tutoriais não encontrada, tentando criar...');
        
        // Criar a tabela com as colunas necessárias
        const createTableResponse = await fetch(`${nocodbService.config.baseUrl}/api/v1/db/meta/projects/${targetBaseId}/tables`, {
          method: 'POST',
          headers: {
            ...nocodbService.headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            table_name: this.TUTORIALS_TABLE,
            title: this.TUTORIALS_TABLE,
            columns: [
              { column_name: 'id', title: 'ID', uidt: 'SingleLineText', pk: true },
              { column_name: 'title', title: 'Title', uidt: 'SingleLineText' },
              { column_name: 'description', title: 'Description', uidt: 'LongText' },
              { column_name: 'videoUrl', title: 'VideoUrl', uidt: 'URL' },
              { column_name: 'documentUrls', title: 'DocumentUrls', uidt: 'LongText' },
              { column_name: 'coverImageUrl', title: 'CoverImageUrl', uidt: 'URL' },
              { column_name: 'category', title: 'Category', uidt: 'SingleLineText' },
              { column_name: 'createdAt', title: 'CreatedAt', uidt: 'DateTime' },
              { column_name: 'updatedAt', title: 'UpdatedAt', uidt: 'DateTime' }
            ]
          }),
        });

        if (createTableResponse.ok) {
          console.log('✅ Tabela de tutoriais criada com sucesso');
        } else {
          console.error('❌ Erro ao criar tabela de tutoriais:', await createTableResponse.text());
        }
      } else {
        console.log('✅ Tabela de tutoriais já existe');
      }
    } catch (error) {
      console.error('❌ Erro ao garantir tabela de tutoriais:', error);
    }
  }

  async getTutorials(): Promise<TutorialData[]> {
    try {
      console.log('🔍 Buscando tutoriais...');
      
      if (!(await this.testConnection())) {
        console.warn('❌ Sem conexão com NocoDB, usando localStorage como fallback');
        return tutorialLocalStorageService.getTutorials();
      }
      
      // Garantir que a tabela existe primeiro
      await this.ensureTutorialsTable();
      
      const targetBaseId = nocodbService.getTargetBaseId();
      const tableId = await nocodbService.getTableId(targetBaseId!, this.TUTORIALS_TABLE);
      
      if (!tableId) {
        console.warn('❌ Tabela de tutoriais não encontrada, usando localStorage como fallback');
        return tutorialLocalStorageService.getTutorials();
      }

      console.log('📋 Fazendo busca de todos os tutoriais...');
      const response = await fetch(`${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${tableId}?limit=1000`, {
        method: 'GET',
        headers: nocodbService.headers,
      });

      if (response.ok) {
        const data = await response.json();
        const tutorials = (data.list || []).map((item: any) => ({
          id: item.id || item.Id || item.ID,
          title: item.title || item.Title,
          description: item.description || item.Description,
          videoUrl: item.videoUrl || item.VideoUrl || undefined,
          documentUrls: this.parseDocumentUrls(item.documentUrls || item.DocumentUrls || ''),
          coverImageUrl: item.coverImageUrl || item.CoverImageUrl || undefined,
          category: item.category || item.Category,
          createdAt: item.createdAt || item.CreatedAt,
          updatedAt: item.updatedAt || item.UpdatedAt
        }));
        
        console.log('✅ Tutoriais carregados do NocoDB:', tutorials.length, 'itens');
        
        // Sincronizar com localStorage como backup
        tutorials.forEach(tutorial => {
          tutorialLocalStorageService.saveTutorial(tutorial);
        });
        
        return tutorials;
      } else {
        console.warn('❌ Erro ao buscar tutoriais do NocoDB, usando localStorage como fallback');
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
        id: tutorial.id,
        title: tutorial.title,
        description: tutorial.description,
        videoUrl: tutorial.videoUrl || null,
        documentUrls: JSON.stringify(tutorial.documentUrls),
        coverImageUrl: tutorial.coverImageUrl || null,
        category: tutorial.category,
        createdAt: tutorial.createdAt,
        updatedAt: tutorial.updatedAt
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

      // Primeiro, encontrar o registro pelo ID customizado
      const searchResponse = await fetch(
        `${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${tableId}?where=(id,eq,${tutorial.id})`,
        {
          method: 'GET',
          headers: nocodbService.headers,
        }
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const records = searchData.list || [];
        
        if (records.length > 0) {
          const recordId = records[0].Id || records[0].ID; // ID interno do NocoDB
          
          const tutorialData = {
            title: tutorial.title,
            description: tutorial.description,
            videoUrl: tutorial.videoUrl || null,
            documentUrls: JSON.stringify(tutorial.documentUrls),
            coverImageUrl: tutorial.coverImageUrl || null,
            category: tutorial.category,
            updatedAt: tutorial.updatedAt
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

      // Primeiro, encontrar o registro pelo ID customizado
      console.log('🔍 MetadataService - Buscando registro no NocoDB...');
      const searchResponse = await fetch(
        `${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${tableId}?where=(id,eq,${tutorialId})`,
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

      const recordId = records[0].Id || records[0].ID; // ID interno do NocoDB
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

}
