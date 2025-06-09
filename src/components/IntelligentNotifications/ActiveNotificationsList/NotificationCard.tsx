
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from 'lucide-react';

interface NotificationCardProps {
  rule: any;
  onViewDetails: (rule: any) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  rule,
  onViewDetails
}) => {
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

  const getEventTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'purchase-approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'awaiting-payment': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'cart-abandoned': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-purple-accent/20 text-purple-accent border-purple-accent/30';
    }
  };

  const parseNotificationData = (notification: any) => {
    if (notification['Dados Completos (JSON)']) {
      try {
        const jsonData = JSON.parse(notification['Dados Completos (JSON)']);
        return {
          eventType: jsonData.eventType || notification['Tipo de Evento'],
          platform: jsonData.platform || notification['Plataforma'],
          profileName: jsonData.profileName || notification['Perfil Hotmart'],
          userRole: jsonData.userRole || notification['Função do Usuário'],
          instanceId: jsonData.instance || notification['ID da Instância'],
          messageCount: jsonData.messages ? jsonData.messages.length : 0
        };
      } catch (e) {
        console.error('Erro ao fazer parse do JSON:', e);
      }
    }
    
    return {
      eventType: notification['Tipo de Evento'],
      platform: notification['Plataforma'],
      profileName: notification['Perfil Hotmart'],
      userRole: notification['Função do Usuário'],
      instanceId: notification['ID da Instância'],
      messageCount: notification['Quantidade de Mensagens'] || 0
    };
  };

  const data = parseNotificationData(rule);

  return (
    <div className="bg-gray-700/20 border border-gray-600/30 rounded-xl p-4 hover:bg-gray-700/30 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          {/* Linha 1: Badge do evento e plataforma */}
          <div className="flex items-center space-x-3">
            <Badge className={getEventTypeBadgeColor(data.eventType)}>
              {getEventTypeLabel(data.eventType)}
            </Badge>
            <span className="text-sm font-medium text-gray-200">
              {getPlatformLabel(data.platform || '')}
            </span>
          </div>

          {/* Linha 2: Informações do perfil e função */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Perfil:</span>
              <span className="text-gray-200 font-medium">
                {data.profileName || 'Não definido'}
              </span>
            </div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Função:</span>
              <span className="text-gray-200">
                {getRoleLabel(data.userRole || '')}
              </span>
            </div>
          </div>

          {/* Linha 3: Instância e mensagens */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Instância:</span>
              <span className="text-gray-300 font-mono text-xs">
                {data.instanceId?.slice(0, 12) || 'N/A'}...
              </span>
            </div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Mensagens:</span>
              <span className="text-purple-accent font-medium">
                {data.messageCount}
              </span>
            </div>
          </div>
        </div>

        {/* Ação - Apenas Visualizar */}
        <div className="flex items-center ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(rule)}
            className="text-purple-accent hover:text-purple-accent/80 hover:bg-purple-accent/10"
            title="Ver detalhes"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
