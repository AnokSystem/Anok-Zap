
import React from 'react';
import { Button } from "@/components/ui/button";
import { Settings, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ListHeaderProps {
  rulesCount: number;
}

export const ListHeader: React.FC<ListHeaderProps> = ({ rulesCount }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
          <Settings className="w-5 h-5 text-purple-accent" />
        </div>
        <div>
          <h4 className="font-semibold text-primary-contrast text-lg">Notificações Ativas</h4>
          <p className="text-sm text-gray-400 mt-1">
            {rulesCount} {rulesCount === 1 ? 'regra configurada' : 'regras configuradas'}
          </p>
        </div>
      </div>
      
      <Button
        onClick={() => navigate('/notifications')}
        variant="outline"
        size="sm"
        className="bg-purple-accent/20 border-purple-accent text-purple-accent hover:bg-purple-accent/30"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Página Completa
      </Button>
    </div>
  );
};
