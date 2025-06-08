
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Trash2, Eye, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActiveNotificationsListProps {
  rules: any[];
  onDeleteRule: (ruleId: string) => void;
}

export const ActiveNotificationsList: React.FC<ActiveNotificationsListProps> = ({
  rules,
  onDeleteRule
}) => {
  const navigate = useNavigate();

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase-approved': return 'Compra Aprovada';
      case 'awaiting-payment': return 'Aguardando Pagamento';
      case 'cart-abandoned': return 'Carrinho Abandonado';
      default: return type;
    }
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'hotmart': return 'Hotmart';
      case 'braip': return 'Braip';
      case 'kiwfy': return 'Kiwfy';
      case 'monetize': return 'Monetize';
      default: return platform;
    }
  };

  const getRoleLabel = (role: string) => {
    return role === 'producer' ? 'Produtor' : 'Afiliado';
  };

  return (
    <div className="card-glass p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-purple-accent" />
          </div>
          <div>
            <h4 className="font-semibold text-primary-contrast text-lg">Notificações Ativas</h4>
            <p className="text-sm text-gray-400 mt-1">
              {rules.length} regras configuradas
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => navigate('/notifications')}
            variant="outline"
            size="sm"
            className="bg-purple-accent/20 border-purple-accent text-purple-accent hover:bg-purple-accent/30"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Página Completa
          </Button>
          
          <Button
            onClick={() => navigate('/notifications')}
            variant="outline"
            size="sm"
            className="bg-gray-700/50 border-gray-600 text-gray-200 hover:bg-gray-600/50"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver Todas
          </Button>
        </div>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-8">
          <Settings className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">Nenhuma notificação ativa</p>
          <Button
            onClick={() => navigate('/notifications')}
            variant="outline"
            size="sm"
            className="bg-purple-accent/20 border-purple-accent text-purple-accent hover:bg-purple-accent/30"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver Página de Notificações
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.slice(0, 3).map((rule) => (
            <div key={rule.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/50 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge className="bg-purple-accent/20 text-purple-accent border-purple-accent/30">
                  {getEventTypeLabel(rule.eventType)}
                </Badge>
                <span className="text-gray-200">{getPlatformLabel(rule.platform || '')}</span>
                <span className="text-sm text-gray-400">
                  {rule.profileName || 'Perfil não definido'}
                </span>
                <span className="text-sm text-gray-400">
                  {getRoleLabel(rule.userRole || '')}
                </span>
                <span className="text-sm text-gray-400">Instância: {rule.instanceId}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteRule(rule.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          {rules.length > 3 && (
            <div className="text-center pt-4">
              <Button
                onClick={() => navigate('/notifications')}
                variant="outline"
                size="sm"
                className="bg-purple-accent/20 border-purple-accent text-purple-accent hover:bg-purple-accent/30"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver todas as {rules.length} notificações
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
