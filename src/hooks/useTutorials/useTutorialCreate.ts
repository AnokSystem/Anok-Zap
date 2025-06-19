
import { useCallback } from 'react';
import { tutorialService, CreateTutorialData } from '@/services/tutorialService';
import { useToast } from '@/hooks/use-toast';
import { validateTutorialData, getErrorMessage } from './validationUtils';

export const useTutorialCreate = (
  setUploading: (uploading: boolean) => void,
  updateTutorialsList: (tutorial: any) => void,
  refreshTutorials?: () => Promise<any>
) => {
  const { toast } = useToast();

  const createTutorial = useCallback(async (data: CreateTutorialData): Promise<boolean> => {
    try {
      setUploading(true);
      console.log('🚀 useTutorialCreate - INICIANDO criação de tutorial:', data.title);
      
      const validation = validateTutorialData(data);
      if (!validation.isValid) {
        console.error('❌ useTutorialCreate - Dados inválidos:', validation.error);
        toast({
          title: "Erro de Validação",
          description: validation.error,
          variant: "destructive"
        });
        return false;
      }

      console.log('✅ useTutorialCreate - Validação OK, criando tutorial...');
      
      const newTutorial = await tutorialService.createTutorial(data);
      
      console.log('✅ useTutorialCreate - Tutorial criado com sucesso:', newTutorial.id);
      console.log('🔄 useTutorialCreate - Atualizando lista de tutoriais...');
      
      updateTutorialsList(newTutorial);
      
      // Aguardar um pouco e então forçar refresh da lista para garantir sincronização
      if (refreshTutorials) {
        console.log('🔄 useTutorialCreate - Fazendo refresh da lista para garantir sincronização...');
        setTimeout(() => {
          refreshTutorials();
        }, 1000);
      }
      
      toast({
        title: "Tutorial Criado",
        description: `Tutorial "${newTutorial.title}" foi criado com sucesso!`,
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error('❌ useTutorialCreate - ERRO ao criar tutorial:', error);
      
      let errorMessage = "Não foi possível criar o tutorial";
      
      if (error instanceof Error) {
        console.error('❌ useTutorialCreate - Mensagem do erro:', error.message);
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao Criar Tutorial",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setUploading(false);
    }
  }, [toast, setUploading, updateTutorialsList, refreshTutorials]);

  return { createTutorial };
};
