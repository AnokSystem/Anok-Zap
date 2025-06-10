
import { nocodbService } from '../nocodb';
import { TutorialData } from './types';
import { tutorialLocalStorageService } from './localStorageService';

class TutorialMetadataService {
  private readonly TUTORIALS_TABLE = 'Tutoriais';

  private parseDocumentUrls(documentUrls: string): string[] {
    if (!documentUrls) return [];
    try {
      return JSON.parse(documentUrls);
    } catch {
      return [];
    }
  }

  async getTutorials(): Promise<TutorialData[]> {
    try {
      console.log('🔍 Buscando TODOS os tutoriais do NocoDB (sem filtro de usuário)...');
      
      // Garantir que a tabela existe
      await nocodbService.ensureTableExists(this.TUTORIALS_TABLE);
      
      const targetBaseId = nocodbService.getTargetBaseId();
      if (!targetBaseId) {
        console.warn('Base do NocoDB não encontrada, usando localStorage como fallback');
        return tutorialLocalStorageService.getTutorials();
      }

      const tableId = await nocodbService.getTableId(targetBaseId, this.TUTORIALS_TABLE);
      if (!tableId) {
        console.warn('Tabela de tutoriais não encontrada, usando localStorage como fallback');
        return tutorialLocalStorageService.getTutorials();
      }

      // CORREÇÃO: Buscar TODOS os tutoriais sem filtro de usuário
      console.log('📋 Fazendo busca geral de todos os tutoriais...');
      const response = await fetch(`${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${tableId}`, {
        method: 'GET',
        headers: nocodbService.headers,
      });

      if (response.ok) {
        const data = await response.json();
        const tutorials = (data.list || []).map((item: any) => ({
          id: item.id || item.Id,
          title: item.title || item.Title,
          description: item.description || item.Description,
          videoUrl: item.videoUrl || item.VideoUrl || undefined,
          documentUrls: this.parseDocumentUrls(item.documentUrls || item.DocumentUrls || ''),
          coverImageUrl: item.coverImageUrl || item.CoverImageUrl || undefined,
          category: item.category || item.Category,
          createdAt: item.createdAt || item.CreatedAt,
          updatedAt: item.updatedAt || item.UpdatedAt
        }));
        
        console.log('✅ Tutoriais carregados do NocoDB (TODOS os usuários):', tutorials.length, 'itens');
        return tutorials;
      } else {
        console.warn('Erro ao buscar tutoriais do NocoDB, usando localStorage como fallback');
        return tutorialLocalStorageService.getTutorials();
      }
    } catch (error) {
      console.error('Erro ao buscar tutoriais do NocoDB:', error);
      console.log('Usando localStorage como fallback');
      return tutorialLocalStorageService.getTutorials();
    }
  }

  async saveTutorial(tutorial: TutorialData): Promise<void> {
    try {
      console.log('Salvando metadata do tutorial no NocoDB:', tutorial.id);
      
      // Garantir que a tabela existe
      await nocodbService.ensureTableExists(this.TUTORIALS_TABLE);
      
      const targetBaseId = nocodbService.getTargetBaseId();
      if (!targetBaseId) {
        throw new Error('Base do NocoDB não encontrada');
      }

      const tableId = await nocodbService.getTableId(targetBaseId, this.TUTORIALS_TABLE);
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
      console.error('Erro ao salvar metadata no NocoDB:', error);
      
      // Fallback para localStorage
      console.log('Salvando no localStorage como fallback...');
      tutorialLocalStorageService.saveTutorial(tutorial);
      console.log('Tutorial salvo no localStorage como fallback');
    }
  }

  async updateTutorial(tutorial: TutorialData): Promise<void> {
    try {
      console.log('Atualizando metadata do tutorial no NocoDB:', tutorial.id);
      
      const targetBaseId = nocodbService.getTargetBaseId();
      if (!targetBaseId) {
        throw new Error('Base do NocoDB não encontrada');
      }

      const tableId = await nocodbService.getTableId(targetBaseId, this.TUTORIALS_TABLE);
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
          const recordId = records[0].Id; // ID interno do NocoDB
          
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
      console.error('Erro ao atualizar metadata no NocoDB:', error);
      
      // Fallback para localStorage
      console.log('Salvando no localStorage como fallback...');
      tutorialLocalStorageService.saveTutorial(tutorial);
      console.log('Tutorial atualizado no localStorage como fallback');
    }
  }

  async deleteTutorial(tutorialId: string): Promise<void> {
    try {
      const targetBaseId = nocodbService.getTargetBaseId();
      if (!targetBaseId) return;

      const tableId = await nocodbService.getTableId(targetBaseId, this.TUTORIALS_TABLE);
      if (!tableId) return;

      // Primeiro, encontrar o registro pelo ID customizado
      const searchResponse = await fetch(
        `${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${tableId}?where=(id,eq,${tutorialId})`,
        {
          method: 'GET',
          headers: nocodbService.headers,
        }
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const records = searchData.list || [];
        
        if (records.length > 0) {
          const recordId = records[0].Id; // ID interno do NocoDB
          
          // Deletar o registro
          const deleteResponse = await fetch(
            `${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${tableId}/${recordId}`,
            {
              method: 'DELETE',
              headers: nocodbService.headers,
            }
          );

          if (deleteResponse.ok) {
            console.log('Tutorial deletado do NocoDB');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao deletar tutorial do NocoDB:', error);
    }
    
    // Remover do localStorage também (fallback)
    tutorialLocalStorageService.deleteTutorial(tutorialId);
  }
}

export const tutorialMetadataService = new TutorialMetadataService();
