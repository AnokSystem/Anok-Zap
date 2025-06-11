
import { useState, useCallback } from 'react';
import { TutorialData } from '@/services/tutorialService';

export const useTutorialState = () => {
  const [tutorials, setTutorials] = useState<TutorialData[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const updateTutorialsList = useCallback((updatedTutorial: TutorialData) => {
    setTutorials(prevTutorials => {
      const filtered = prevTutorials.filter(t => t.id !== updatedTutorial.id);
      return [...filtered, updatedTutorial];
    });
  }, []);

  const replaceTutorial = useCallback((tutorialId: string, updatedTutorial: TutorialData) => {
    setTutorials(prevTutorials => 
      prevTutorials.map(t => t.id === tutorialId ? updatedTutorial : t)
    );
  }, []);

  const removeTutorial = useCallback((tutorialId: string) => {
    setTutorials(prevTutorials => {
      const filtered = prevTutorials.filter(t => t.id !== tutorialId);
      console.log('🔄 useTutorialState - Lista atualizada, restam:', filtered.length, 'tutoriais');
      return filtered;
    });
  }, []);

  return {
    tutorials,
    setTutorials,
    loading,
    setLoading,
    uploading,
    setUploading,
    updateTutorialsList,
    replaceTutorial,
    removeTutorial
  };
};
