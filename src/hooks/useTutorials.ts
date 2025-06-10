import { useState, useEffect } from 'react';
import { tutorialService, TutorialData, CreateTutorialData } from '@/services/tutorialService';
import { tutorialMetadataService } from '@/services/tutorial/metadataService';
import { useToast } from '@/hooks/use-toast';

export const useTutorials = () => {
  const [tutorials, setTutorials] = useState<TutorialData[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchTutorials = async () => {
    try {
      setLoading(true);
      console.log('🔍 Iniciando busca de tutoriais...');
      
      // Garantir que a tabela existe antes de buscar
      await tutorialMetadataService.ensureTutorialsTable();
      
      const data = await tutorialService.getTutorials();
      console.log('📚 Tutoriais carregados:', data.length);
      setTutorials(data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar tutoriais:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tutoriais",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createTutorial = async (data: CreateTutorialData): Promise<boolean> => {
    try {
      setUploading(true);
      console.log('🚀 Iniciando criação de tutorial:', data.title);
      
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

      console.log('📁 Criando tutorial...');
      
      const newTutorial = await tutorialService.createTutorial(data);
      
      console.log('✅ Tutorial criado, atualizando lista...');
      
      // Atualizar estado imediatamente com o novo tutorial
      setTutorials(prevTutorials => {
        const filtered = prevTutorials.filter(t => t.id !== newTutorial.id);
        return [...filtered, newTutorial];
      });
      
      toast({
        title: "Sucesso",
        description: `Tutorial "${newTutorial.title}" criado com sucesso`,
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao criar tutorial:', error);
      
      let errorMessage = "Não foi possível criar o tutorial";
      if (error instanceof Error) {
        if (error.message.includes('MinIO') || error.message.includes('upload')) {
          errorMessage = "Erro no upload dos arquivos. Verifique sua conexão.";
        } else if (error.message.includes('salvo')) {
          errorMessage = "Erro ao salvar os dados do tutorial";
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

  const updateTutorial = async (tutorialId: string, data: CreateTutorialData): Promise<boolean> => {
    try {
      setUploading(true);
      console.log('🔄 Iniciando atualização de tutorial:', tutorialId, data.title);
      
      // Validar dados obrigatórios
      if (!data.title || !data.description || !data.category) {
        toast({
          title: "Erro",
          description: "Título, descrição e categoria são obrigatórios",
          variant: "destructive"
        });
        return false;
      }

      // Validar arquivos antes do upload se fornecidos
      if (data.videoFile && data.videoFile.size > 100 * 1024 * 1024) { // 100MB
        toast({
          title: "Erro",
          description: "O vídeo deve ter no máximo 100MB",
          variant: "destructive"
        });
        return false;
      }

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

      const updatedTutorial = await tutorialService.updateTutorial(tutorialId, data);
      
      console.log('✅ Tutorial atualizado, atualizando lista...');
      
      // Atualizar estado imediatamente
      setTutorials(prevTutorials => 
        prevTutorials.map(t => t.id === tutorialId ? updatedTutorial : t)
      );
      
      toast({
        title: "Sucesso",
        description: `Tutorial "${updatedTutorial.title}" atualizado com sucesso`,
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar tutorial:', error);
      
      let errorMessage = "Não foi possível atualizar o tutorial";
      if (error instanceof Error) {
        if (error.message.includes('MinIO') || error.message.includes('upload')) {
          errorMessage = "Erro no upload dos arquivos. Verifique sua conexão.";
        } else if (error.message.includes('salvo')) {
          errorMessage = "Erro ao salvar os dados do tutorial";
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
    console.log('🚀 useTutorials.deleteTutorial - INICIANDO PROCESSO DE EXCLUSÃO');
    console.log('📝 useTutorials.deleteTutorial - Tutorial ID:', tutorialId);
    console.log('📋 useTutorials.deleteTutorial - Lista atual de tutoriais:', tutorials.map(t => ({ id: t.id, title: t.title })));
    
    try {
      // Encontrar o tutorial que será deletado para mostrar o nome
      const tutorialToDelete = tutorials.find(t => t.id === tutorialId);
      console.log('🔍 useTutorials.deleteTutorial - Tutorial encontrado:', tutorialToDelete);
      
      if (!tutorialToDelete) {
        console.error('❌ useTutorials.deleteTutorial - Tutorial não encontrado na lista local');
        toast({
          title: "Erro",
          description: "Tutorial não encontrado",
          variant: "destructive"
        });
        return false;
      }
      
      const tutorialTitle = tutorialToDelete.title;
      console.log('📝 useTutorials.deleteTutorial - Deletando tutorial:', tutorialTitle);
      
      // Chamar o serviço de exclusão
      console.log('⏳ useTutorials.deleteTutorial - Chamando tutorialService.deleteTutorial...');
      console.log('🔧 useTutorials.deleteTutorial - Tipo do tutorialService:', typeof tutorialService);
      console.log('🔧 useTutorials.deleteTutorial - Função deleteTutorial existe:', typeof tutorialService.deleteTutorial);
      
      const serviceResult = await tutorialService.deleteTutorial(tutorialId);
      console.log('📊 useTutorials.deleteTutorial - Resultado do serviço:', serviceResult);
      
      if (serviceResult !== true) {
        console.error('❌ useTutorials.deleteTutorial - Serviço retornou falso');
        throw new Error('Falha na exclusão pelo serviço');
      }
      
      console.log('✅ useTutorials.deleteTutorial - Tutorial deletado no backend, atualizando interface...');
      
      // Remover da interface apenas após confirmação do backend
      setTutorials(prevTutorials => {
        const filtered = prevTutorials.filter(t => t.id !== tutorialId);
        console.log('🔄 useTutorials.deleteTutorial - Lista atualizada, restam:', filtered.length, 'tutoriais');
        console.log('📋 useTutorials.deleteTutorial - Nova lista:', filtered.map(t => ({ id: t.id, title: t.title })));
        return filtered;
      });
      
      console.log('🎉 useTutorials.deleteTutorial - PROCESSO CONCLUÍDO COM SUCESSO');
      
      toast({
        title: "Sucesso",
        description: `Tutorial "${tutorialTitle}" foi excluído com sucesso`,
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error('❌ useTutorials.deleteTutorial - ERRO DURANTE EXCLUSÃO:', error);
      console.error('🔍 useTutorials.deleteTutorial - Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error,
        tutorialId
      });
      
      let errorMessage = "Não foi possível excluir o tutorial";
      if (error instanceof Error) {
        if (error.message.includes('Tutorial não encontrado')) {
          errorMessage = "Tutorial não encontrado";
        } else if (error.message.includes('conexão') || error.message.includes('NocoDB')) {
          errorMessage = "Erro de conexão com o servidor. Verifique sua internet.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erro na Exclusão",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
    }
  };

  useEffect(() => {
    console.log('🔧 Hook useTutorials montado, carregando tutoriais...');
    fetchTutorials();
  }, []);

  return {
    tutorials,
    loading,
    uploading,
    createTutorial,
    updateTutorial,
    deleteTutorial,
    refreshTutorials: fetchTutorials
  };
};
