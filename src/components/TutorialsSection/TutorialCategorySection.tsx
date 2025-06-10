
import React from 'react';
import { TutorialData } from '@/services/tutorialService';
import TutorialCard from './TutorialCard';

interface TutorialCategorySectionProps {
  category: string;
  tutorials: TutorialData[];
  onViewTutorial: (tutorial: TutorialData) => void;
  onEditTutorial: (tutorial: TutorialData) => void;
  onDeleteTutorial: (tutorialId: string) => Promise<void>;
}

const TutorialCategorySection = ({ 
  category, 
  tutorials, 
  onViewTutorial, 
  onEditTutorial, 
  onDeleteTutorial 
}: TutorialCategorySectionProps) => {
  console.log('🏷️ TutorialCategorySection - Renderizando categoria:', category, 'com', tutorials.length, 'tutoriais');

  return (
    <div className="space-y-4">
      {/* Título da Categoria */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
          <span className="text-purple-400 font-semibold text-sm">
            {category.charAt(0).toUpperCase()}
          </span>
        </div>
        <h4 className="text-xl font-semibold text-primary-contrast">
          {category}
        </h4>
        <span className="text-sm text-gray-400">
          ({tutorials.length} {tutorials.length === 1 ? 'tutorial' : 'tutoriais'})
        </span>
      </div>

      {/* Grid de Tutoriais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map((tutorial) => (
          <TutorialCard
            key={tutorial.id}
            tutorial={tutorial}
            onView={onViewTutorial}
            onEdit={onEditTutorial}
            onDelete={onDeleteTutorial}
          />
        ))}
      </div>
    </div>
  );
};

export default TutorialCategorySection;
