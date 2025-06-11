
import { useEffect } from 'react';
import { useTutorialState } from './useTutorials/useTutorialState';
import { useTutorialCreate } from './useTutorials/useTutorialCreate';
import { useTutorialUpdate } from './useTutorials/useTutorialUpdate';
import { useTutorialDelete } from './useTutorials/useTutorialDelete';
import { useTutorialLoad } from './useTutorials/useTutorialLoad';

export const useTutorials = () => {
  const {
    tutorials,
    setTutorials,
    loading,
    uploading,
    setUploading,
    updateTutorialsList,
    replaceTutorial,
    removeTutorial
  } = useTutorialState();

  const { fetchTutorials } = useTutorialLoad(
    (loading) => {}, // setLoading não é necessário aqui pois já temos no estado
    setTutorials
  );

  const { createTutorial } = useTutorialCreate(setUploading, updateTutorialsList);
  const { updateTutorial } = useTutorialUpdate(setUploading, replaceTutorial);
  const { deleteTutorial } = useTutorialDelete(tutorials, removeTutorial);

  // Executar apenas uma vez na montagem
  useEffect(() => {
    console.log('🔧 Hook useTutorials montado, carregando tutoriais...');
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
