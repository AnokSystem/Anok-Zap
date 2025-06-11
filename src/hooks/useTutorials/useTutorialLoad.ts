
import { useCallback } from 'react';
import { tutorialService } from '@/services/tutorialService';
import { tutorialMetadataService } from '@/services/tutorial/metadataService';
import { useToast } from '@/hooks/use-toast';

export const useTutorialLoad = (
  setLoading: (loading: boolean) => void,
  setTutorials: (tutorials: any[]) => void
) => {
  const { toast } = useToast();

  const fetchTutorials = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 useTutorialLoad - Iniciando busca de tutoriais...');
      
      // Garantir que a tabela existe antes de buscar
      await tutorialMetadataService.ensureTutorialsTable();
      
      const data = await tutorialService.getTutorials();
      console.log('📚 useTutorialLoad - Tutoriais carregados:', data.length);
      
      setTutorials(data);
      return data;
    } catch (error) {
      console.error('❌ useTutorialLoad - Erro ao buscar tutoriais:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tutoriais",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast, setLoading, setTutorials]);

  return { fetchTutorials };
};
