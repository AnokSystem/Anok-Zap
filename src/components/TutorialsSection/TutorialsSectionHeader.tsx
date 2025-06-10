
import React from 'react';
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface TutorialsSectionHeaderProps {
  tutorialsCount: number;
  onCreateClick: () => void;
}

const TutorialsSectionHeader = ({ tutorialsCount, onCreateClick }: TutorialsSectionHeaderProps) => {
  const { user } = useAuth();
  const isAdmin = user?.Email === 'kona@admin.com';

  return (
    <div className="text-center pb-6 border-b border-white/10">
      <div className="flex items-center justify-center space-x-3 mb-4">
        <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-purple">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-primary-contrast">Central de Tutoriais</h3>
      </div>
      <p className="text-gray-400 text-lg">
        Aprenda a usar todas as funcionalidades do sistema
        {tutorialsCount > 0 && (
          <span className="block mt-2 text-purple-accent">
            {tutorialsCount} tutorial(s) disponível(is)
          </span>
        )}
      </p>
      
      {isAdmin && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={onCreateClick}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Novo Tutorial
          </Button>
        </div>
      )}
    </div>
  );
};

export default TutorialsSectionHeader;
