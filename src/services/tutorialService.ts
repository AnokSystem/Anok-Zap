
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
          // Criar nome simples e limpo para o arquivo
          const timestamp = Date.now();
          const cleanFileName = videoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const videoFileName = `${this.TUTORIALS_BASE_FOLDER}/${tutorialId}/video_${timestamp}_${cleanFileName}`;
          
          // Criar um novo arquivo com o nome correto
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
            const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const docFileName = `${this.TUTORIALS_BASE_FOLDER}/${tutorialId}/doc_${i + 1}_${timestamp}_${cleanFileName}`;
            
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
      console.log('Criando tutorial:', tutorialId, 'com dados:', data.title);

      // Testar conexão com MinIO antes de continuar
      const isConnected = await minioService.testConnection();
      if (!isConnected) {
        throw new Error('Não foi possível conectar ao MinIO');
      }

      console.log('Conexão MinIO OK, iniciando uploads...');

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

      // Salvar metadata
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
      
      // Buscar do localStorage
      const stored = localStorage.getItem('tutorials');
      if (stored) {
        const tutorials = JSON.parse(stored);
        console.log('Tutoriais carregados do localStorage:', tutorials.length, 'itens');
        return tutorials;
      }

      console.log('Nenhum tutorial salvo, retornando array vazio');
      return [];
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
        console.log('Tutorial removido do localStorage');
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
      console.log('Salvando metadata do tutorial:', tutorial.id);
      
      // Buscar tutoriais existentes
      const existing = await this.getTutorials();
      console.log('Tutoriais existentes:', existing.length);
      
      // Adicionar o novo tutorial
      const updated = [...existing.filter(t => t.id !== tutorial.id), tutorial];
      
      // Salvar no localStorage
      localStorage.setItem('tutorials', JSON.stringify(updated));
      console.log('Metadata do tutorial salva no localStorage. Total de tutoriais:', updated.length);
      
      // Verificar se foi salvo corretamente
      const verification = localStorage.getItem('tutorials');
      if (verification) {
        const parsed = JSON.parse(verification);
        console.log('Verificação: tutorial salvo com sucesso. Total:', parsed.length);
      }
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
