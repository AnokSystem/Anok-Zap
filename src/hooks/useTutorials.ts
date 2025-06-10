
import { useState, useEffect } from 'react';
import { tutorialService, TutorialData, CreateTutorialData } from '@/services/tutorialService';
import { useToast } from '@/hooks/use-toast';

export const useTutorials = () => {
  const [tutorials, setTutorials] = useState<TutorialData[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchTutorials = async () => {
    try {
      setLoading(true);
      console.log('Iniciando busca de tutoriais...');
      const data = await tutorialService.getTutorials();
      console.log('Tutoriais carregados:', data.length);
      setTutorials(data);
    } catch (error) {
      console.error('Erro ao buscar tutoriais:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tutoriais",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTutorial = async (data: CreateTutorialData): Promise<boolean> => {
    try {
      setUploading(true);
      console.log('Iniciando criação de tutorial:', data.title);
      
      // Validar dados obrigatórios
      if (!data.title || !data.description || !data.category) {
        toast({
          title: "Erro",
          description: "Título, descrição e categoria são obrigatórios",
          variant: "destructive"
        });
        return false;
      }

      // Validar arquivos antes do upload
      if (data.videoFile && data.videoFile.size > 100 * 1024 * 1024) { // 100MB
        toast({
          title: "Erro",
          description: "O vídeo deve ter no máximo 100MB",
          variant: "destructive"
        });
        return false;
      }

      // Validar documentos
      for (const doc of data.documentFiles) {
        if (doc.size > 10 * 1024 * 1024) { // 10MB
          toast({
            title: "Erro",
            description: `O documento ${doc.name} deve ter no máximo 10MB`,
            variant: "destructive"
          });
          return false;
        }
      }

      // Testar conexão MinIO primeiro
      console.log('Testando conexão MinIO...');
      const isConnected = await tutorialService.testMinioConnection();
      if (!isConnected) {
        toast({
          title: "Erro de Conexão",
          description: "Não foi possível conectar ao servidor de arquivos. Tente novamente.",
          variant: "destructive"
        });
        return false;
      }

      console.log('Conexão OK, criando tutorial...');
      
      const newTutorial = await tutorialService.createTutorial(data);
      
      console.log('Tutorial criado, atualizando lista...');
      
      // Atualizar a lista local imediatamente
      setTutorials(prev => {
        const updated = [...prev, newTutorial];
        console.log('Lista de tutoriais atualizada. Total:', updated.length);
        return updated;
      });
      
      toast({
        title: "Sucesso",
        description: "Tutorial criado com sucesso",
        variant: "default"
      });
      
      // Recarregar a lista para garantir sincronização
      await fetchTutorials();
      
      return true;
    } catch (error) {
      console.error('Erro ao criar tutorial:', error);
      
      let errorMessage = "Não foi possível criar o tutorial";
      if (error instanceof Error) {
        if (error.message.includes('MinIO')) {
          errorMessage = "Erro na conexão com o servidor de arquivos";
        } else if (error.message.includes('upload')) {
          errorMessage = "Erro no upload dos arquivos";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setUploading(false);
    }
  };

  const deleteTutorial = async (tutorialId: string): Promise<boolean> => {
    try {
      console.log('Deletando tutorial:', tutorialId);
      const success = await tutorialService.deleteTutorial(tutorialId);
      if (success) {
        setTutorials(prev => {
          const updated = prev.filter(t => t.id !== tutorialId);
          console.log('Tutorial removido da lista. Total restante:', updated.length);
          return updated;
        });
        toast({
          title: "Sucesso",
          description: "Tutorial deletado com sucesso"
        });
      }
      return success;
    } catch (error) {
      console.error('Erro ao deletar tutorial:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar o tutorial",
        variant: "destructive"
      });
      return false;
    }
  };

  const testConnection = async (): Promise<boolean> => {
    try {
      console.log('Testando conexão com MinIO...');
      const isConnected = await tutorialService.testMinioConnection();
      toast({
        title: isConnected ? "Conexão OK" : "Erro de Conexão",
        description: isConnected 
          ? "Conexão com MinIO funcionando corretamente" 
          : "Problema na conexão com o servidor de arquivos",
        variant: isConnected ? "default" : "destructive"
      });
      return isConnected;
    } catch (error) {
      console.error('Erro no teste de conexão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível testar a conexão",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    console.log('Hook useTutorials montado, carregando tutoriais...');
    fetchTutorials();
  }, []);

  return {
    tutorials,
    loading,
    uploading,
    createTutorial,
    deleteTutorial,
    refreshTutorials: fetchTutorials,
    testConnection
  };
};
