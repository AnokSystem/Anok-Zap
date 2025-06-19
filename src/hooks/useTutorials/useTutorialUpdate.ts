
import { useCallback } from 'react';
import { tutorialService, CreateTutorialData, TutorialData } from '@/services/tutorialService';
import { useToast } from '@/hooks/use-toast';
import { validateTutorialData, getErrorMessage } from './validationUtils';

export const useTutorialUpdate = (
  setUploading: (uploading: boolean) => void,
  replaceTutorial: (tutorialId: string, tutorial: TutorialData) => void
) => {
  const { toast } = useToast();

  const updateTutorial = useCallback(async (tutorialId: string, data: CreateTutorialData): Promise<boolean> => {
    try {
      setUploading(true);
      console.log('🔄 useTutorialUpdate - INICIANDO atualização de tutorial:', tutorialId, data.title);
      
      const validation = validateTutorialData(data);
      if (!validation.isValid) {
        toast({
          title: "Erro",
          description: validation.error,
          variant: "destructive"
        });
        return false;
      }

      // Buscar tutorial existente
      const tutorials = await tutorialService.getTutorials();
      const existingTutorial = tutorials.find(t => t.id === tutorialId);
      
      if (!existingTutorial) {
        throw new Error('Tutorial não encontrado');
      }

      console.log('📋 useTutorialUpdate - Tutorial existente encontrado:', existingTutorial.title);

      // Criar dados do tutorial atualizado mantendo dados existentes
      const updatedTutorial: TutorialData = {
        ...existingTutorial, // Manter todos os dados existentes
        title: data.title,
        description: data.description,
        category: data.category,
        updatedAt: new Date().toISOString()
        // Manter videoUrl, documentUrls, coverImageUrl do tutorial existente
        // pois o modal de edição atual não permite alterar arquivos
      };

      console.log('💾 useTutorialUpdate - Dados para atualização:', {
        id: updatedTutorial.id,
        title: updatedTutorial.title,
        description: updatedTutorial.description,
        category: updatedTutorial.category
      });

      // Atualizar tutorial
      await tutorialService.updateTutorial(updatedTutorial);
      
      console.log('✅ useTutorialUpdate - Tutorial atualizado, atualizando interface...');
      
      replaceTutorial(tutorialId, updatedTutorial);
      
      toast({
        title: "Sucesso",
        description: `Tutorial "${updatedTutorial.title}" atualizado com sucesso`,
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error('❌ useTutorialUpdate - Erro ao atualizar tutorial:', error);
      
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
