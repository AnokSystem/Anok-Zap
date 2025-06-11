
import { nocodbService } from '../nocodb';
import { TutorialData } from './types';
import { tutorialLocalStorageService } from './localStorageService';
import { tutorialConnectionService } from './connectionService';

class TutorialDataService {
  private readonly TUTORIALS_TABLE = 'Tutoriais';

  private parseDocumentUrls(documentUrls: string): string[] {
    if (!documentUrls) return [];
    try {
      return JSON.parse(documentUrls);
    } catch {
      return [];
    }
  }

  async ensureTutorialsTable(): Promise<void> {
    try {
      console.log('🔧 Garantindo que a tabela de tutoriais existe...');
      
      if (!(await tutorialConnectionService.testConnection())) {
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
      
      tutorialConnectionService.resetConnection();
      
      if (!(await tutorialConnectionService.testConnection())) {
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
}

export const tutorialDataService = new TutorialDataService();
