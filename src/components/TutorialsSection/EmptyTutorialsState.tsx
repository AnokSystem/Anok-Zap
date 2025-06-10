
import React from 'react';
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface EmptyTutorialsStateProps {
  onCreateClick: () => void;
}

const EmptyTutorialsState = ({ onCreateClick }: EmptyTutorialsStateProps) => {
  const { user } = useAuth();
  const isAdmin = user?.Email === 'kona@admin.com';

  return (
    <div className="card-glass p-12 text-center">
      <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
        <BookOpen className="w-8 h-8 text-gray-400" />
      </div>
      <h4 className="text-xl font-semibold text-gray-300 mb-2">
        Nenhum tutorial disponível
      </h4>
      <p className="text-gray-400 mb-6">
        {isAdmin 
          ? "Comece criando seu primeiro tutorial para ajudar os usuários."
          : "Os tutoriais estarão disponíveis em breve."
        }
      </p>
      {isAdmin && (
        <Button
          onClick={onCreateClick}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar Primeiro Tutorial
        </Button>
      )}
    </div>
  );
};

export default EmptyTutorialsState;
