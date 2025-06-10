
import React from 'react';
import { TutorialData } from '@/services/tutorialService';

interface TutorialInfoSectionProps {
  tutorial: TutorialData;
}

const TutorialInfoSection = ({ tutorial }: TutorialInfoSectionProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600">
      <h3 className="font-semibold text-gray-200 mb-3">Informações do Tutorial</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-400">Categoria:</span>
          <span className="text-gray-200 ml-2">{tutorial.category}</span>
        </div>
        <div>
          <span className="text-gray-400">Criado em:</span>
          <span className="text-gray-200 ml-2">{formatDate(tutorial.createdAt)}</span>
        </div>
        <div>
          <span className="text-gray-400">Atualizado em:</span>
          <span className="text-gray-200 ml-2">{formatDate(tutorial.updatedAt)}</span>
        </div>
        <div>
          <span className="text-gray-400">Recursos:</span>
          <span className="text-gray-200 ml-2">
            {[
              tutorial.videoUrl && 'Vídeo',
              tutorial.documentUrls.length > 0 && `${tutorial.documentUrls.length} doc(s)`
            ].filter(Boolean).join(', ') || 'Apenas texto'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TutorialInfoSection;
