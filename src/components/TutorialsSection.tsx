
import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { useTutorials } from '@/hooks/useTutorials';
import { TutorialData } from '@/services/tutorialService';
import CreateTutorialModal from './TutorialsSection/CreateTutorialModal';
import TutorialViewModal from './TutorialsSection/TutorialViewModal';
import TutorialsSectionHeader from './TutorialsSection/TutorialsSectionHeader';
import TutorialCategorySection from './TutorialsSection/TutorialCategorySection';
import EmptyTutorialsState from './TutorialsSection/EmptyTutorialsState';

const TutorialsSection = () => {
  const { tutorials, loading, deleteTutorial, refreshTutorials } = useTutorials();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialData | null>(null);
  const [tutorialsCount, setTutorialsCount] = useState(0);

  // Forçar re-renderização quando a lista de tutoriais mudar
  useEffect(() => {
    console.log('📊 Lista de tutoriais atualizada:', tutorials.length, 'tutoriais');
    setTutorialsCount(tutorials.length);
  }, [tutorials]);

  const handleDeleteTutorial = async (tutorialId: string) => {
    if (window.confirm('Tem certeza que deseja deletar este tutorial?')) {
      await deleteTutorial(tutorialId);
    }
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    // Forçar uma atualização adicional após fechar o modal
    setTimeout(() => {
      refreshTutorials();
    }, 100);
  };

  const groupedTutorials = tutorials.reduce((acc, tutorial) => {
    if (!acc[tutorial.category]) {
      acc[tutorial.category] = [];
    }
    acc[tutorial.category].push(tutorial);
    return acc;
  }, {} as Record<string, TutorialData[]>);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center pb-6 border-b border-white/10">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-purple">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-primary-contrast">Tutoriais</h3>
          </div>
          <p className="text-gray-400 text-lg">Carregando tutoriais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" key={`tutorials-${tutorialsCount}`}>
      {/* Header da Seção */}
      <TutorialsSectionHeader
        tutorialsCount={tutorialsCount}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      {/* Tutoriais por Categoria */}
      {Object.entries(groupedTutorials).map(([category, categoryTutorials]) => (
        <TutorialCategorySection
          key={`${category}-${categoryTutorials.length}`}
          category={category}
          tutorials={categoryTutorials}
          onViewTutorial={setSelectedTutorial}
          onDeleteTutorial={handleDeleteTutorial}
        />
      ))}

      {/* Estado Vazio */}
      {tutorials.length === 0 && (
        <EmptyTutorialsState
          onCreateClick={() => setIsCreateModalOpen(true)}
        />
      )}

      {/* Modais */}
      <CreateTutorialModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
      />
      
      <TutorialViewModal
        tutorial={selectedTutorial}
        isOpen={!!selectedTutorial}
        onClose={() => setSelectedTutorial(null)}
      />
    </div>
  );
};

export default TutorialsSection;
