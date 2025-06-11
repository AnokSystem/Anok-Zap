
import { useCallback } from 'react';
import { tutorialService, CreateTutorialData } from '@/services/tutorialService';
import { useToast } from '@/hooks/use-toast';
import { validateTutorialData, getErrorMessage } from './validationUtils';

export const useTutorialUpdate = (
  setUploading: (uploading: boolean) => void,
  replaceTutorial: (tutorialId: string, tutorial: any) => void
) => {
  const { toast } = useToast();

  const updateTutorial = useCallback(async (tutorialId: string, data: CreateTutorialData): Promise<boolean> => {
    try {
      setUploading(true);
      console.log('🔄 Iniciando atualização de tutorial:', tutorialId, data.title);
      
      const validation = validateTutorialData(data);
      if (!validation.isValid) {
        toast({
          title: "Erro",
          description: validation.error,
          variant: "destructive"
        });
        return false;
      }

      const updatedTutorial = await tutorialService.updateTutorial(tutorialId, data);
      
      console.log('✅ Tutorial atualizado, atualizando lista...');
      
      replaceTutorial(tutorialId, updatedTutorial);
      
      toast({
        title: "Sucesso",
        description: `Tutorial "${updatedTutorial.title}" atualizado com sucesso`,
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar tutorial:', error);
      
      const errorMessage = getErrorMessage(error);
      
      toast({
        title: "Erro",
        description: errorMessage || "Não foi possível atualizar o tutorial",
        variant: "destructive"
      });
      return false;
    } finally {
      setUploading(false);
    }
  }, [toast, setUploading, replaceTutorial]);

  return { updateTutorial };
};
