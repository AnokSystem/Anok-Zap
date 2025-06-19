
import { nocodbService } from '../nocodb';
import { TutorialData } from './types';
import { tutorialLocalStorageService } from './localStorageService';
import { tutorialConnectionService } from './connectionService';
import { tutorialDataService } from './dataService';

class TutorialSaveService {
  private readonly TUTORIALS_TABLE = 'Tutoriais';

  async saveTutorial(tutorial: TutorialData): Promise<void> {
    try {
      console.log('💾 SaveService - INICIANDO salvamento do tutorial:', tutorial.id);
      console.log('📝 SaveService - Dados do tutorial:', {
        id: tutorial.id,
        title: tutorial.title,
        category: tutorial.category,
        hasVideo: !!tutorial.videoUrl,
        hasDocuments: tutorial.documentUrls.length > 0,
        hasCover: !!tutorial.coverImageUrl
      });
      
      // Testar conexão primeiro
      console.log('🔗 SaveService - Testando conexão com NocoDB...');
      if (!(await tutorialConnectionService.testConnection())) {
        console.warn('❌ SaveService - Sem conexão com NocoDB, salvando apenas no localStorage');
        tutorialLocalStorageService.saveTutorial(tutorial);
        return;
      }
      console.log('✅ SaveService - Conexão com NocoDB OK');
      
      // Garantir que a tabela existe
      console.log('📋 SaveService - Verificando se tabela existe...');
      await tutorialDataService.ensureTutorialsTable();
      console.log('✅ SaveService - Tabela verificada');
      
      // Usar o mesmo Base ID que foi testado na conexão
      const targetBaseId = tutorialConnectionService.getTargetBaseId();
      if (!targetBaseId) {
        console.error('❌ SaveService - Base ID não encontrado');
        tutorialLocalStorageService.saveTutorial(tutorial);
        return;
      }

      console.log('✅ SaveService - Base ID obtido:', targetBaseId);

      // Buscar a tabela pelo nome correto
      const tableId = await nocodbService.getTableId(targetBaseId, this.TUTORIALS_TABLE);
      
      if (!tableId) {
        console.error('❌ SaveService - Tabela de tutoriais não encontrada, tentando criar...');
        
        // Tentar garantir que a tabela existe novamente
        await tutorialDataService.ensureTutorialsTable();
        
        // Tentar buscar novamente
        const retryTableId = await nocodbService.getTableId(targetBaseId, this.TUTORIALS_TABLE);
        
        if (!retryTableId) {
          console.error('❌ SaveService - Falha definitiva ao encontrar/criar tabela');
          tutorialLocalStorageService.saveTutorial(tutorial);
          return;
        }
        
        console.log('✅ SaveService - Tabela encontrada após retry:', retryTableId);
      }

      const finalTableId = tableId || await nocodbService.getTableId(targetBaseId, this.TUTORIALS_TABLE);
      console.log('✅ SaveService - Table ID final:', finalTableId);

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

      console.log('📝 SaveService - Dados formatados para NocoDB:', tutorialData);

      const saveUrl = `${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${finalTableId}`;
      console.log('🔗 SaveService - URL de salvamento:', saveUrl);

      console.log('📡 SaveService - Enviando requisição POST...');
      const response = await fetch(saveUrl, {
        method: 'POST',
        headers: {
          ...nocodbService.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tutorialData),
      });

      console.log('📥 SaveService - Status da resposta:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ SaveService - Tutorial salvo no NocoDB com SUCESSO!');
        console.log('✅ SaveService - Dados salvos:', result);
        
        // Salvar também no localStorage como backup
        tutorialLocalStorageService.saveTutorial(tutorial);
        console.log('✅ SaveService - Backup no localStorage realizado');
      } else {
        const errorText = await response.text();
        console.error('❌ SaveService - ERRO ao salvar no NocoDB!');
        console.error('❌ SaveService - Status:', response.status);
        console.error('❌ SaveService - Resposta:', errorText);
        
        // Tentar parsear a resposta de erro
        try {
          const errorData = JSON.parse(errorText);
          console.error('❌ SaveService - Erro detalhado:', errorData);
        } catch (parseError) {
          console.error('❌ SaveService - Erro não é JSON válido');
        }
        
        console.log('📦 SaveService - Salvando no localStorage como fallback...');
        tutorialLocalStorageService.saveTutorial(tutorial);
        
        throw new Error(`Erro ao salvar no NocoDB: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('💥 SaveService - ERRO GERAL ao salvar tutorial:', error);
      
      console.log('📦 SaveService - Salvando no localStorage como fallback de emergência...');
      tutorialLocalStorageService.saveTutorial(tutorial);
      console.log('✅ SaveService - Tutorial salvo no localStorage como fallback');
      
      // Re-throw o erro para que seja capturado pelos hooks
      throw error;
    }
  }
}

export const tutorialSaveService = new TutorialSaveService();
