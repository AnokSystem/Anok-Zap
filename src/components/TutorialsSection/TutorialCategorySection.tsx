
import React from 'react';
import { BookOpen } from 'lucide-react';
import { TutorialData } from '@/services/tutorialService';
import TutorialCard from './TutorialCard';

interface TutorialCategorySectionProps {
  category: string;
  tutorials: TutorialData[];
  onViewTutorial: (tutorial: TutorialData) => void;
  onDeleteTutorial: (tutorialId: string) => void;
}

const TutorialCategorySection = ({ 
  category, 
  tutorials, 
  onViewTutorial, 
  onDeleteTutorial 
}: TutorialCategorySectionProps) => {
  return (
    <div className="card-glass p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-purple-accent" />
        </div>
        <div>
          <h4 className="font-semibold text-primary-contrast text-lg">{category}</h4>
          <p className="text-sm text-gray-400 mt-1">
            {tutorials.length} tutorial(s) disponível(is)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map((tutorial) => (
          <TutorialCard
            key={`${tutorial.id}-${tutorial.updatedAt}`}
            tutorial={tutorial}
            onView={onViewTutorial}
            onDelete={onDeleteTutorial}
          />
        ))}
      </div>
    </div>
  );
};

export default TutorialCategorySection;
