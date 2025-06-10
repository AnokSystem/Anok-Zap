
import React from 'react';
import { TutorialData } from '@/services/tutorialService';
import TutorialCard from './TutorialCard';

interface TutorialCategorySectionProps {
  category: string;
  tutorials: TutorialData[];
  onViewTutorial: (tutorial: TutorialData) => void;
  onEditTutorial: (tutorial: TutorialData) => void;
  onDeleteTutorial: (tutorialId: string) => void;
}

const TutorialCategorySection = ({ 
  category, 
  tutorials, 
  onViewTutorial, 
  onEditTutorial,
  onDeleteTutorial 
}: TutorialCategorySectionProps) => {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-primary-contrast border-b border-purple-accent/30 pb-2">
        {category}
      </h4>
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
