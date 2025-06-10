
import React, { useState, useEffect } from 'react';
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
  const [tutorialsCount, setTutorialsCount] = useState(0);

  useEffect(() => {
    console.log('📊 TutorialsSection - Lista de tutoriais atualizada:', tutorials.length, 'tutoriais');
    console.log('📋 TutorialsSection - Tutoriais completos:', tutorials);
    setTutorialsCount(tutorials.length);
  }, [tutorials]);

  // Force refresh on component mount and periodically
  useEffect(() => {
    console.log('🔄 TutorialsSection montado, forçando refresh...');
    
    // Refresh imediato
    refreshTutorials();
    
    // Refresh periódico para garantir sincronização
    const interval = setInterval(() => {
      console.log('⏰ Refresh automático de tutoriais...');
      refreshTutorials();
    }, 30000); // A cada 30 segundos
    
    return () => clearInterval(interval);
  }, []);

  const handleDeleteTutorial = async (tutorialId: string) => {
    console.log('🗑️ Tentativa de deletar tutorial:', tutorialId);
    
    const success = await deleteTutorial(tutorialId);
    console.log('🔄 Resultado da exclusão:', success);
    
    if (success) {
      console.log('✅ Tutorial deletado com sucesso');
    } else {
      console.log('❌ Falha ao deletar tutorial');
    }
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    // Forçar uma atualização adicional após fechar o modal
    setTimeout(() => {
      refreshTutorials();
    }, 100);
  };

  const handleEditTutorial = (tutorial: TutorialData) => {
    setEditingTutorial(tutorial);
  };

  const handleEditModalClose = () => {
    setEditingTutorial(null);
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

  console.log('🎨 TutorialsSection - Renderizando com', tutorialsCount, 'tutoriais');

  return (
    <div className="space-y-8" key={`tutorials-${tutorialsCount}-${Date.now()}`}>
      {/* Header da Seção */}
      <TutorialsSectionHeader
        tutorialsCount={tutorialsCount}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      {/* Debug Info Melhorado */}
      <div className="text-xs text-gray-500 p-3 bg-gray-800/20 rounded">
        <div>Debug: {tutorialsCount} tutoriais carregados | Última atualização: {new Date().toLocaleTimeString()}</div>
        <div className="mt-1">Status: {loading ? 'Carregando...' : 'Pronto'}</div>
        {tutorials.length > 0 && (
          <div className="mt-1">Tutoriais: {tutorials.map(t => t.title).join(', ')}</div>
        )}
      </div>

      {/* Tutoriais por Categoria */}
      {Object.entries(groupedTutorials).map(([category, categoryTutorials]) => (
        <TutorialCategorySection
          key={`${category}-${categoryTutorials.length}-${Date.now()}`}
          category={category}
          tutorials={categoryTutorials}
          onViewTutorial={setSelectedTutorial}
          onEditTutorial={handleEditTutorial}
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

      <EditTutorialModal
        tutorial={editingTutorial}
        isOpen={!!editingTutorial}
        onClose={handleEditModalClose}
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
