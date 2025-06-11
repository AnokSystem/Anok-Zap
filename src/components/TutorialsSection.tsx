
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { useTutorials } from '@/hooks/useTutorials';
import { TutorialData } from '@/services/tutorialService';
import CreateTutorialModal from './TutorialsSection/CreateTutorialModal';
import EditTutorialModal from './TutorialsSection/EditTutorialModal';
import TutorialViewModal from './TutorialsSection/TutorialViewModal';
import TutorialsSectionHeader from './TutorialsSection/TutorialsSectionHeader';
import TutorialCategorySection from './TutorialsSection/TutorialCategorySection';
import EmptyTutorialsState from './TutorialsSection/EmptyTutorialsState';

const TutorialsSection = () => {
  const { tutorials, loading, deleteTutorial, refreshTutorials } = useTutorials();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialData | null>(null);
  const [editingTutorial, setEditingTutorial] = useState<TutorialData | null>(null);

  // Memoizar o número de tutoriais para evitar re-renders desnecessários
  const tutorialsCount = useMemo(() => tutorials.length, [tutorials.length]);

  // Memoizar tutoriais agrupados
  const groupedTutorials = useMemo(() => {
    return tutorials.reduce((acc, tutorial) => {
      if (!acc[tutorial.category]) {
        acc[tutorial.category] = [];
      }
      acc[tutorial.category].push(tutorial);
      return acc;
    }, {} as Record<string, TutorialData[]>);
  }, [tutorials]);

  // Usar useCallback para evitar re-criação desnecessária das funções
  const handleDeleteTutorial = useCallback(async (tutorialId: string): Promise<void> => {
    console.log('🗑️ TutorialsSection.handleDeleteTutorial - INICIANDO:', tutorialId);
    
    try {
      const success = await deleteTutorial(tutorialId);
      console.log('🔄 TutorialsSection.handleDeleteTutorial - Resultado:', success);
    } catch (error) {
      console.error('❌ TutorialsSection.handleDeleteTutorial - ERRO:', error);
      throw error;
    }
  }, [deleteTutorial]);

  const handleCreateModalClose = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleEditTutorial = useCallback((tutorial: TutorialData) => {
    setEditingTutorial(tutorial);
  }, []);

  const handleEditModalClose = useCallback(() => {
    setEditingTutorial(null);
  }, []);

  const handleCreateClick = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleViewTutorial = useCallback((tutorial: TutorialData) => {
    setSelectedTutorial(tutorial);
  }, []);

  const handleCloseViewModal = useCallback(() => {
    setSelectedTutorial(null);
  }, []);

  // Executar apenas na montagem inicial - sem interval automático
  useEffect(() => {
    console.log('🔄 TutorialsSection montado, carregando tutoriais inicial...');
    refreshTutorials();
  }, []);

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

  console.log('🎨 TutorialsSection - Renderizando com', tutorialsCount, 'tutoriais');

  return (
    <div className="space-y-8">
      <TutorialsSectionHeader
        tutorialsCount={tutorialsCount}
        onCreateClick={handleCreateClick}
      />

      {Object.entries(groupedTutorials).map(([category, categoryTutorials]) => (
        <TutorialCategorySection
          key={category}
          category={category}
          tutorials={categoryTutorials}
          onViewTutorial={handleViewTutorial}
          onEditTutorial={handleEditTutorial}
          onDeleteTutorial={handleDeleteTutorial}
        />
      ))}

      {tutorials.length === 0 && (
        <EmptyTutorialsState
          onCreateClick={handleCreateClick}
        />
      )}

      <CreateTutorialModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
      />

      <EditTutorialModal
        tutorial={editingTutorial}
        isOpen={!!editingTutorial}
        onClose={handleEditModalClose}
      />
      
      <TutorialViewModal
        tutorial={selectedTutorial}
        isOpen={!!selectedTutorial}
        onClose={handleCloseViewModal}
      />
    </div>
  );
};

export default TutorialsSection;
