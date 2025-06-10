
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
      console.log('🔍 Iniciando busca de tutoriais com verificação de tabela...');
      
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

      console.log('📁 Criando tutorial com estrutura de pastas...');
      
      const newTutorial = await tutorialService.createTutorial(data);
      
      console.log('✅ Tutorial criado, atualizando lista imediatamente...');
      
      // Atualizar estado imediatamente com o novo tutorial
      setTutorials(prevTutorials => {
        const filtered = prevTutorials.filter(t => t.id !== newTutorial.id);
        return [...filtered, newTutorial];
      });
      
      // Recarregar a lista completa em segundo plano para garantir sincronização
      setTimeout(() => {
        fetchTutorials();
      }, 1000);
      
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
      
      // Recarregar a lista completa em segundo plano para garantir sincronização
      setTimeout(() => {
        fetchTutorials();
      }, 1000);
      
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
    try {
      console.log('🗑️ Iniciando exclusão do tutorial:', tutorialId);
      
      // Armazenar a lista atual para restaurar em caso de erro
      const currentTutorials = [...tutorials];
      
      // Encontrar o tutorial que será deletado para mostrar no toast
      const tutorialToDelete = tutorials.find(t => t.id === tutorialId);
      const tutorialTitle = tutorialToDelete?.title || 'Tutorial';
      
      console.log('📝 Tutorial a ser deletado:', tutorialTitle);
      
      // Remover imediatamente da interface (optimistic update)
      setTutorials(prevTutorials => {
        const filtered = prevTutorials.filter(t => t.id !== tutorialId);
        console.log('🔄 Lista atualizada, restam:', filtered.length, 'tutoriais');
        return filtered;
      });
      
      // Tentar deletar no backend
      console.log('⏳ Executando exclusão no backend...');
      const success = await tutorialService.deleteTutorial(tutorialId);
      
      if (success) {
        console.log('✅ Tutorial deletado com sucesso no backend');
        toast({
          title: "Sucesso",
          description: `Tutorial "${tutorialTitle}" foi excluído com sucesso`,
          variant: "default"
        });
        
        // Recarregar a lista completa para garantir sincronização
        setTimeout(() => {
          console.log('🔄 Recarregando lista após exclusão bem-sucedida...');
          fetchTutorials();
        }, 500);
        
        return true;
      } else {
        console.log('❌ Falha na exclusão do backend, revertendo mudanças...');
        // Reverter as mudanças se a exclusão falhou
        setTutorials(currentTutorials);
        toast({
          title: "Erro",
          description: `Não foi possível excluir o tutorial "${tutorialTitle}"`,
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Erro durante exclusão do tutorial:', error);
      
      // Recarregar a lista completa para garantir que está sincronizada
      console.log('🔄 Recarregando lista após erro...');
      await fetchTutorials();
      
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar excluir o tutorial",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    console.log('🔧 Hook useTutorials montado, verificando tabela e carregando tutoriais...');
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
