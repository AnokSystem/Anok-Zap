
import React from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ViewMoreFooterProps {
  totalRules: number;
  displayedRules: number;
}

export const ViewMoreFooter: React.FC<ViewMoreFooterProps> = ({ 
  totalRules, 
  displayedRules 
}) => {
  const navigate = useNavigate();

  if (totalRules <= displayedRules) return null;

  return (
    <div className="text-center pt-6 border-t border-gray-600/30">
      <p className="text-gray-400 text-sm mb-3">
        Mostrando {displayedRules} de {totalRules} notificações
      </p>
      <Button
        onClick={() => navigate('/notifications')}
        variant="outline"
        size="sm"
        className="bg-purple-accent/20 border-purple-accent text-purple-accent hover:bg-purple-accent/30"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Ver todas as notificações
      </Button>
    </div>
  );
};
