
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
      const data = await tutorialService.getTutorials();
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
      
      // Validar arquivos antes do upload
      if (data.videoFile && data.videoFile.size > 100 * 1024 * 1024) { // 100MB
        toast({
          title: "Erro",
          description: "O vídeo deve ter no máximo 100MB",
          variant: "destructive"
        });
        return false;
      }

      // Testar conexão MinIO primeiro
      const isConnected = await tutorialService.testMinioConnection();
      if (!isConnected) {
        toast({
          title: "Erro de Conexão",
          description: "Não foi possível conectar ao servidor de arquivos. Tente novamente.",
          variant: "destructive"
        });
        return false;
      }

      console.log('Iniciando criação do tutorial:', data.title);
      
      const newTutorial = await tutorialService.createTutorial(data);
      setTutorials(prev => [...prev, newTutorial]);
      
      toast({
        title: "Sucesso",
        description: "Tutorial criado com sucesso"
      });
      
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
      const success = await tutorialService.deleteTutorial(tutorialId);
      if (success) {
        setTutorials(prev => prev.filter(t => t.id !== tutorialId));
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
