
import { minioService } from './minio';
import { nocodbService } from './nocodb';

export interface TutorialData {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  documentUrls: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTutorialData {
  title: string;
  description: string;
  category: string;
  videoFile?: File;
  documentFiles: File[];
}

class TutorialService {
  private readonly TUTORIALS_FOLDER = 'tutoriais';
  private readonly TUTORIALS_TABLE = 'Tutoriais';

  async uploadTutorialFiles(tutorialId: string, videoFile?: File, documentFiles: File[] = []): Promise<{ videoUrl?: string; documentUrls: string[] }> {
    const results = {
      videoUrl: undefined as string | undefined,
      documentUrls: [] as string[]
    };

    try {
      console.log(`Iniciando upload de arquivos para tutorial: ${tutorialId}`);

      // Upload video se fornecido
      if (videoFile) {
        console.log('Fazendo upload do vídeo...');
        try {
          const timestamp = Date.now();
          const fileExtension = videoFile.name.split('.').pop() || 'mp4';
          const videoFileName = `${this.TUTORIALS_FOLDER}/${tutorialId}/video/video_${timestamp}.${fileExtension}`;
          
          const renamedVideoFile = new File([videoFile], videoFileName, { type: videoFile.type });
          
          results.videoUrl = await minioService.uploadFile(renamedVideoFile);
          console.log('Vídeo enviado com sucesso:', results.videoUrl);
        } catch (error) {
          console.error('Erro no upload do vídeo:', error);
          throw new Error('Falha no upload do vídeo');
        }
      }

      // Upload documentos
      if (documentFiles.length > 0) {
        console.log(`Fazendo upload de ${documentFiles.length} documentos...`);
        for (let i = 0; i < documentFiles.length; i++) {
          const file = documentFiles[i];
          try {
            const timestamp = Date.now();
            const fileExtension = file.name.split('.').pop() || 'pdf';
            const docFileName = `${this.TUTORIALS_FOLDER}/${tutorialId}/documentos/doc_${i + 1}_${timestamp}.${fileExtension}`;
            
            const renamedDocFile = new File([file], docFileName, { type: file.type });
            
            const docUrl = await minioService.uploadFile(renamedDocFile);
            results.documentUrls.push(docUrl);
            console.log(`Documento ${i + 1} enviado:`, docUrl);
          } catch (error) {
            console.error(`Erro no upload do documento ${i + 1}:`, error);
            throw new Error(`Falha no upload do documento: ${file.name}`);
          }
        }
        console.log('Todos os documentos enviados com sucesso');
      }

      return results;
    } catch (error) {
      console.error('Erro geral no upload dos arquivos do tutorial:', error);
      throw error;
    }
  }

  async createTutorial(data: CreateTutorialData): Promise<TutorialData> {
    try {
      const tutorialId = `tutorial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Criando tutorial:', tutorialId, 'com dados:', data.title);

      console.log('Iniciando uploads dos arquivos...');

      // Upload dos arquivos
      const { videoUrl, documentUrls } = await this.uploadTutorialFiles(
        tutorialId,
        data.videoFile,
        data.documentFiles
      );

      console.log('Uploads concluídos, criando metadata...');

      // Criar metadata do tutorial
      const tutorial: TutorialData = {
        id: tutorialId,
        title: data.title,
        description: data.description,
        videoUrl,
        documentUrls,
        category: data.category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Salvar metadata no NocoDB
      await this.saveTutorialMetadata(tutorial);

      console.log('Tutorial criado com sucesso:', tutorial);
      return tutorial;
    } catch (error) {
      console.error('Erro ao criar tutorial:', error);
      throw error;
    }
  }

  async getTutorials(): Promise<TutorialData[]> {
    try {
      console.log('Buscando tutoriais do NocoDB...');
      
      // Garantir que a tabela existe
      await nocodbService.ensureTableExists(this.TUTORIALS_TABLE);
      
      const targetBaseId = nocodbService.getTargetBaseId();
      if (!targetBaseId) {
        console.warn('Base do NocoDB não encontrada, usando localStorage como fallback');
        return this.getTutorialsFromLocalStorage();
      }

      const tableId = await nocodbService.getTableId(targetBaseId, this.TUTORIALS_TABLE);
      if (!tableId) {
        console.warn('Tabela de tutoriais não encontrada, usando localStorage como fallback');
        return this.getTutorialsFromLocalStorage();
      }

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
          category: item.category || item.Category,
          createdAt: item.createdAt || item.CreatedAt,
          updatedAt: item.updatedAt || item.UpdatedAt
        }));
        
        console.log('Tutoriais carregados do NocoDB:', tutorials.length, 'itens');
        return tutorials;
      } else {
        console.warn('Erro ao buscar tutoriais do NocoDB, usando localStorage como fallback');
        return this.getTutorialsFromLocalStorage();
      }
    } catch (error) {
      console.error('Erro ao buscar tutoriais do NocoDB:', error);
      console.log('Usando localStorage como fallback');
      return this.getTutorialsFromLocalStorage();
    }
  }

  private getTutorialsFromLocalStorage(): TutorialData[] {
    try {
      const stored = localStorage.getItem('tutoriais_metadata');
      if (stored) {
        const tutorials = JSON.parse(stored);
        console.log('Tutoriais carregados do localStorage:', tutorials.length, 'itens');
        
        // Validar estrutura dos dados
        const validTutorials = tutorials.filter((tutorial: any) => 
          tutorial.id && tutorial.title && tutorial.description && tutorial.category
        );
        
        return validTutorials;
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar tutoriais do localStorage:', error);
      return [];
    }
  }

  private parseDocumentUrls(documentUrls: string): string[] {
    if (!documentUrls) return [];
    try {
      return JSON.parse(documentUrls);
    } catch {
      return [];
    }
  }

  async deleteTutorial(tutorialId: string): Promise<boolean> {
    try {
      console.log('Deletando tutorial:', tutorialId);
      
      const tutorials = await this.getTutorials();
      const tutorial = tutorials.find(t => t.id === tutorialId);
      
      if (tutorial) {
        // Deletar vídeo se existir
        if (tutorial.videoUrl) {
          try {
            await minioService.deleteFile(tutorial.videoUrl);
            console.log('Vídeo deletado do MinIO');
          } catch (error) {
            console.error('Erro ao deletar vídeo:', error);
          }
        }
        
        // Deletar documentos se existirem
        for (const docUrl of tutorial.documentUrls) {
          try {
            await minioService.deleteFile(docUrl);
            console.log('Documento deletado do MinIO');
          } catch (error) {
            console.error('Erro ao deletar documento:', error);
          }
        }
        
        // Deletar do NocoDB
        await this.deleteTutorialFromNocoDB(tutorialId);
        
        // Remover do localStorage também (fallback)
        const storedTutorials = this.getTutorialsFromLocalStorage();
        const updatedTutorials = storedTutorials.filter(t => t.id !== tutorialId);
        localStorage.setItem('tutoriais_metadata', JSON.stringify(updatedTutorials));
      }
      
      console.log('Tutorial deletado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao deletar tutorial:', error);
      return false;
    }
  }

  private async deleteTutorialFromNocoDB(tutorialId: string): Promise<void> {
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
  }

  private async saveTutorialMetadata(tutorial: TutorialData): Promise<void> {
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
        const existing = this.getTutorialsFromLocalStorage();
        const filtered = existing.filter(t => t.id !== tutorial.id);
        const updated = [...filtered, tutorial];
        localStorage.setItem('tutoriais_metadata', JSON.stringify(updated));
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao salvar no NocoDB:', response.status, errorText);
        throw new Error(`Erro ao salvar tutorial no NocoDB: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao salvar metadata no NocoDB:', error);
      
      // Fallback para localStorage
      console.log('Salvando no localStorage como fallback...');
      const existing = this.getTutorialsFromLocalStorage();
      const filtered = existing.filter(t => t.id !== tutorial.id);
      const updated = [...filtered, tutorial];
      localStorage.setItem('tutoriais_metadata', JSON.stringify(updated));
      console.log('Tutorial salvo no localStorage como fallback');
    }
  }

  async clearAllTutorials(): Promise<void> {
    try {
      localStorage.removeItem('tutoriais_metadata');
      console.log('Todos os tutoriais foram removidos do localStorage');
    } catch (error) {
      console.error('Erro ao limpar tutoriais:', error);
    }
  }
}

export const tutorialService = new TutorialService();
