
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, RefreshCw, ExternalLink, Eye } from 'lucide-react';
import { useRecentNotifications } from '../hooks/useRecentNotifications';
import { NotificationDetailsModal } from './RecentNotifications/NotificationDetailsModal';

interface RecentNotificationsProps {
  showAll?: boolean;
}

export const RecentNotifications = ({ showAll = false }: RecentNotificationsProps) => {
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { 
    notifications, 
    isLoading, 
    error, 
    refetch 
  } = useRecentNotifications(showAll ? 50 : 10);

  const displayNotifications = notifications;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'hotmart':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'eduzz':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'monetizze':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'purchase':
      case 'compra':
        return 'bg-green-500/20 text-green-400';
      case 'subscription':
      case 'assinatura':
        return 'bg-blue-500/20 text-blue-400';
      case 'cancel':
      case 'cancelamento':
        return 'bg-red-500/20 text-red-400';
      case 'refund':
      case 'reembolso':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-purple-500/20 text-purple-400';
    }
  };

  const handleViewDetails = (notification: any) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary-contrast">
            <Bell className="w-5 h-5 text-green-400" />
            {showAll ? 'Todas as Notificações' : 'Notificações Recentes'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="card-modern border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary-contrast">
            <Bell className="w-5 h-5 text-red-400" />
            Erro ao carregar notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-red-400">{error}</span>
            <Button 
              onClick={refetch}
              className="bg-red-600 hover:bg-red-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary-contrast">
            <Bell className="w-5 h-5 text-green-400" />
            {showAll ? 'Todas as Notificações' : 'Notificações Recentes'}
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline" className="border-green-500/30 text-green-400">
                {notifications.length} registros
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={refetch}
                className="text-gray-400 hover:text-primary-contrast"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">
                Nenhuma notificação encontrada
              </h3>
              <p className="text-gray-400">
                Aguardando novas notificações das plataformas...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayNotifications.map((notification, index) => (
                <div
                  key={notification.id || index}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex flex-col space-y-1">
                      <Badge variant="outline" className={getPlatformColor(notification.platform)}>
                        {notification.platform}
                      </Badge>
                      <Badge variant="outline" className={getEventTypeColor(notification.eventType)}>
                        {notification.eventType}
                      </Badge>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-primary-contrast">
                            {notification.clientName}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {notification.clientEmail}
                          </p>
                          {notification.productName && (
                            <p className="text-sm text-gray-300">
                              {notification.productName}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            {notification.value && notification.value > 0 && (
                              <span className="text-lg font-bold text-green-400">
                                {formatCurrency(notification.value)}
                              </span>
                            )}
                            <p className="text-sm text-gray-400">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(notification)}
                            className="text-gray-400 hover:text-primary-contrast hover:bg-green-500/20"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {showAll && notifications.length > 10 && (
                <div className="text-center pt-4">
                  <Button 
                    variant="outline" 
                    className="border-gray-600 hover:border-green-500"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver todas as {notifications.length} notificações
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <NotificationDetailsModal
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
