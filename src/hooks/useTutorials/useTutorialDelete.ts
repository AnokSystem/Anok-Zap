
import { useCallback } from 'react';
import { tutorialService } from '@/services/tutorialService';
import { useToast } from '@/hooks/use-toast';

export const useTutorialDelete = (
  tutorials: any[],
  removeTutorial: (tutorialId: string) => void
) => {
  const { toast } = useToast();

  const deleteTutorial = useCallback(async (tutorialId: string): Promise<boolean> => {
    console.log('🚀 useTutorialDelete - INICIANDO PROCESSO DE EXCLUSÃO');
    console.log('📝 useTutorialDelete - Tutorial ID:', tutorialId);
    
    try {
      const tutorialToDelete = tutorials.find(t => t.id === tutorialId);
      console.log('🔍 useTutorialDelete - Tutorial encontrado:', tutorialToDelete);
      
      if (!tutorialToDelete) {
        console.error('❌ useTutorialDelete - Tutorial não encontrado na lista local');
        toast({
          title: "Erro",
          description: "Tutorial não encontrado",
          variant: "destructive"
        });
        return false;
      }
      
      const tutorialTitle = tutorialToDelete.title;
      console.log('📝 useTutorialDelete - Deletando tutorial:', tutorialTitle);
      
      // Tentar deletar do backend primeiro
      console.log('⏳ useTutorialDelete - Chamando tutorialService.deleteTutorial...');
      await tutorialService.deleteTutorial(tutorialId);
      console.log('✅ useTutorialDelete - Serviço executado com sucesso');
      
      // Remover da interface após sucesso no backend
      removeTutorial(tutorialId);
      
      console.log('🎉 useTutorialDelete - PROCESSO CONCLUÍDO COM SUCESSO');
      
      toast({
        title: "Sucesso",
        description: `Tutorial "${tutorialTitle}" foi excluído com sucesso`,
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error('❌ useTutorialDelete - ERRO DURANTE EXCLUSÃO:', error);
      
      // Ainda assim remover da interface para melhor UX
      removeTutorial(tutorialId);
      
      toast({
        title: "Tutorial Removido",
        description: "Tutorial removido da interface. Verifique a conexão com o servidor.",
        variant: "default"
      });
      
      return true;
    }
  }, [tutorials, toast, removeTutorial]);

  return { deleteTutorial };
};
