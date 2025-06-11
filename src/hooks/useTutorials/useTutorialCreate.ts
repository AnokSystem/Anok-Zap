
import { useCallback } from 'react';
import { tutorialService, CreateTutorialData } from '@/services/tutorialService';
import { useToast } from '@/hooks/use-toast';
import { validateTutorialData, getErrorMessage } from './validationUtils';

export const useTutorialCreate = (
  setUploading: (uploading: boolean) => void,
  updateTutorialsList: (tutorial: any) => void
) => {
  const { toast } = useToast();

  const createTutorial = useCallback(async (data: CreateTutorialData): Promise<boolean> => {
    try {
      setUploading(true);
      console.log('🚀 Iniciando criação de tutorial:', data.title);
      
      const validation = validateTutorialData(data);
      if (!validation.isValid) {
        toast({
          title: "Erro",
          description: validation.error,
          variant: "destructive"
        });
        return false;
      }

      console.log('📁 Criando tutorial...');
      
      const newTutorial = await tutorialService.createTutorial(data);
      
      console.log('✅ Tutorial criado, atualizando lista...');
      
      updateTutorialsList(newTutorial);
      
      toast({
        title: "Sucesso",
        description: `Tutorial "${newTutorial.title}" criado com sucesso`,
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao criar tutorial:', error);
      
      const errorMessage = getErrorMessage(error);
      
      toast({
        title: "Erro",
        description: errorMessage || "Não foi possível criar o tutorial",
        variant: "destructive"
      });
      return false;
    } finally {
      setUploading(false);
    }
  }, [toast, setUploading, updateTutorialsList]);

  return { createTutorial };
};
