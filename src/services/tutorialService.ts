
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
  private readonly TUTORIALS_FOLDER = 'tutoriais';
  private readonly METADATA_KEY = 'tutoriais_metadata';

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
      
      const stored = localStorage.getItem(this.METADATA_KEY);
      if (stored) {
        const tutorials = JSON.parse(stored);
        console.log('Tutoriais carregados do localStorage:', tutorials.length, 'itens');
        
        // Validar estrutura dos dados
        const validTutorials = tutorials.filter((tutorial: any) => 
          tutorial.id && tutorial.title && tutorial.description && tutorial.category
        );
        
        if (validTutorials.length !== tutorials.length) {
          console.warn('Alguns tutoriais tinham dados inválidos e foram filtrados');
          localStorage.setItem(this.METADATA_KEY, JSON.stringify(validTutorials));
        }
        
        return validTutorials;
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
        localStorage.setItem(this.METADATA_KEY, JSON.stringify(updatedTutorials));
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
      
      const existing = await this.getTutorials();
      console.log('Tutoriais existentes:', existing.length);
      
      // Remover tutorial existente com mesmo ID e adicionar o novo
      const filtered = existing.filter(t => t.id !== tutorial.id);
      const updated = [...filtered, tutorial];
      
      // Salvar no localStorage com nova chave
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(updated));
      console.log('Metadata do tutorial salva. Total de tutoriais:', updated.length);
      
      // Verificar se foi salvo corretamente
      const verification = localStorage.getItem(this.METADATA_KEY);
      if (verification) {
        const parsed = JSON.parse(verification);
        const savedTutorial = parsed.find((t: TutorialData) => t.id === tutorial.id);
        if (savedTutorial) {
          console.log('✅ Tutorial salvo e verificado com sucesso!');
        } else {
          console.error('❌ Erro: Tutorial não encontrado após salvamento');
          throw new Error('Tutorial não foi salvo corretamente');
        }
      } else {
        throw new Error('Erro ao verificar salvamento no localStorage');
      }
    } catch (error) {
      console.error('Erro ao salvar metadata:', error);
      throw error;
    }
  }

  async clearAllTutorials(): Promise<void> {
    try {
      localStorage.removeItem(this.METADATA_KEY);
      console.log('Todos os tutoriais foram removidos');
    } catch (error) {
      console.error('Erro ao limpar tutoriais:', error);
    }
  }
}

export const tutorialService = new TutorialService();
