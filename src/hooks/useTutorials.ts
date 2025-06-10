
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
      const newTutorial = await tutorialService.createTutorial(data);
      setTutorials(prev => [...prev, newTutorial]);
      
      toast({
        title: "Sucesso",
        description: "Tutorial criado com sucesso"
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao criar tutorial:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o tutorial",
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

  useEffect(() => {
    fetchTutorials();
  }, []);

  return {
    tutorials,
    loading,
    uploading,
    createTutorial,
    deleteTutorial,
    refreshTutorials: fetchTutorials
  };
};
