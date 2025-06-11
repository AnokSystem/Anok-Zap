
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
      
      // Remover da interface IMEDIATAMENTE para melhor UX
      removeTutorial(tutorialId);
      
      // Tentar deletar do backend (se falhar, já removemos da interface)
      console.log('⏳ useTutorialDelete - Chamando tutorialService.deleteTutorial...');
      await tutorialService.deleteTutorial(tutorialId);
      console.log('✅ useTutorialDelete - Serviço executado com sucesso');
      
      console.log('🎉 useTutorialDelete - PROCESSO CONCLUÍDO COM SUCESSO');
      
      toast({
        title: "Sucesso",
        description: `Tutorial "${tutorialTitle}" foi excluído com sucesso`,
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error('❌ useTutorialDelete - ERRO DURANTE EXCLUSÃO:', error);
      
      toast({
        title: "Tutorial Removido",
        description: "Tutorial removido da interface. Pode haver problemas de sincronização com o servidor.",
        variant: "default"
      });
      
      // Não restaurar o tutorial na interface - melhor experiência do usuário
      return true;
    }
  }, [tutorials, toast, removeTutorial]);

  return { deleteTutorial };
};
