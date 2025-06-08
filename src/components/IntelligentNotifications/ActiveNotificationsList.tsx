
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Trash2, ExternalLink, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActiveNotificationsListProps {
  rules: any[];
  onDeleteRule: (ruleId: string) => void;
  onEditRule?: (rule: any) => void;
}

export const ActiveNotificationsList: React.FC<ActiveNotificationsListProps> = ({
  rules,
  onDeleteRule,
  onEditRule
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

  const getEventTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'purchase-approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'awaiting-payment': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'cart-abandoned': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-purple-accent/20 text-purple-accent border-purple-accent/30';
    }
  };

  // Função para extrair dados do JSON se necessário
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
              {rules.length} {rules.length === 1 ? 'regra configurada' : 'regras configuradas'}
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

      {rules.length === 0 ? (
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
      ) : (
        <div className="space-y-4">
          {rules.slice(0, 3).map((rule) => {
            const data = parseNotificationData(rule);
            return (
              <div key={rule.ID || rule.id} className="bg-gray-700/20 border border-gray-600/30 rounded-xl p-4 hover:bg-gray-700/30 transition-all duration-200">
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

                  {/* Ações */}
                  <div className="flex items-center space-x-2 ml-4">
                    {onEditRule && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditRule(rule)}
                        className="text-purple-accent hover:text-purple-accent/80 hover:bg-purple-accent/10"
                        title="Editar notificação"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteRule(rule.ID || rule.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      title="Excluir notificação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {rules.length > 3 && (
            <div className="text-center pt-6 border-t border-gray-600/30">
              <p className="text-gray-400 text-sm mb-3">
                Mostrando 3 de {rules.length} notificações
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
          )}
        </div>
      )}
    </div>
  );
};
