
import React from 'react';
import { Button } from "@/components/ui/button";
import { Settings, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EmptyState: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-700/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Settings className="w-8 h-8 text-gray-400" />
      </div>
      <h5 className="text-lg font-medium text-gray-300 mb-2">Nenhuma notificação ativa</h5>
      <p className="text-gray-500 mb-6">Configure sua primeira notificação automática</p>
      <Button
        onClick={() => navigate('/notifications')}
        variant="outline"
        size="sm"
        className="bg-purple-accent/20 border-purple-accent text-purple-accent hover:bg-purple-accent/30"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Criar Primeira Notificação
      </Button>
    </div>
  );
};
