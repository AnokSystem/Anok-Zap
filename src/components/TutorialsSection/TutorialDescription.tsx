
import React from 'react';

interface TutorialDescriptionProps {
  description: string;
}

const TutorialDescription = ({ description }: TutorialDescriptionProps) => {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-200">Descrição</h3>
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default TutorialDescription;
