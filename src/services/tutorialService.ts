
import { minioService } from './minio';

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
  private readonly TUTORIALS_BASE_FOLDER = 'tutorials';

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
          // Criar um arquivo com nome organizado para a pasta de tutoriais
          const videoFileName = `${this.TUTORIALS_BASE_FOLDER}/${tutorialId}/video_${Date.now()}_${videoFile.name}`;
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
            // Criar um arquivo com nome organizado para a pasta de tutoriais
            const docFileName = `${this.TUTORIALS_BASE_FOLDER}/${tutorialId}/doc_${i + 1}_${Date.now()}_${file.name}`;
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
      const tutorialId = `tutorial_${Date.now()}`;
      console.log('Criando tutorial:', tutorialId);

      // Testar conexão com MinIO antes de continuar
      const isConnected = await minioService.testConnection();
      if (!isConnected) {
        throw new Error('Não foi possível conectar ao MinIO');
      }

      // Upload dos arquivos
      const { videoUrl, documentUrls } = await this.uploadTutorialFiles(
        tutorialId,
        data.videoFile,
        data.documentFiles
      );

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

      // Salvar metadata (por enquanto só no localStorage, depois implementaremos no MinIO)
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
      console.log('Buscando tutoriais...');
      
      // Tentar buscar do localStorage primeiro
      const stored = localStorage.getItem('tutorials');
      if (stored) {
        const tutorials = JSON.parse(stored);
        console.log('Tutoriais carregados do localStorage:', tutorials);
        return tutorials;
      }

      // Retornar dados mock se não houver tutoriais salvos
      const mockTutorials: TutorialData[] = [
        {
          id: 'tutorial_1',
          title: 'Como Conectar WhatsApp',
          description: 'Aprenda a conectar sua instância do WhatsApp ao sistema',
          category: 'Primeiros Passos',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          documentUrls: []
        },
        {
          id: 'tutorial_2',
          title: 'Configurar Disparos em Massa',
          description: 'Tutorial completo sobre como configurar e executar disparos em massa',
          category: 'Guias Avançados',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          documentUrls: []
        }
      ];

      return mockTutorials;
    } catch (error) {
      console.error('Erro ao buscar tutoriais:', error);
      return [];
    }
  }

  async deleteTutorial(tutorialId: string): Promise<boolean> {
    try {
      console.log('Deletando tutorial:', tutorialId);
      
      // Buscar tutorial para obter URLs dos arquivos
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
        
        // Remover da lista local
        const updatedTutorials = tutorials.filter(t => t.id !== tutorialId);
        localStorage.setItem('tutorials', JSON.stringify(updatedTutorials));
      }
      
      console.log('Tutorial deletado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao deletar tutorial:', error);
      return false;
    }
  }

  private async saveTutorialMetadata(tutorial: TutorialData): Promise<void> {
    try {
      // Salvar no localStorage por enquanto
      const existing = await this.getTutorials();
      const updated = [...existing.filter(t => t.id !== tutorial.id), tutorial];
      localStorage.setItem('tutorials', JSON.stringify(updated));
      console.log('Metadata do tutorial salva no localStorage');
    } catch (error) {
      console.error('Erro ao salvar metadata:', error);
      throw error;
    }
  }

  async testMinioConnection(): Promise<boolean> {
    try {
      const isConnected = await minioService.testConnection();
      console.log('Teste de conexão MinIO:', isConnected ? 'Sucesso' : 'Falha');
      return isConnected;
    } catch (error) {
      console.error('Erro no teste de conexão MinIO:', error);
      return false;
    }
  }
}

export const tutorialService = new TutorialService();
