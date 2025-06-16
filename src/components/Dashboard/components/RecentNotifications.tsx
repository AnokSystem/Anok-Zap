
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, Eye, Activity, AlertTriangle } from 'lucide-react';
import { useRecentNotifications } from '../hooks/useRecentNotifications';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecentNotificationsProps {
  showAll?: boolean;
}

export const RecentNotifications = ({ showAll = false }: RecentNotificationsProps) => {
  const { notifications, isLoading, error } = useRecentNotifications(showAll ? 50 : 10);

  const getEventTypeBadge = (eventType: string) => {
    switch (eventType) {
      case 'purchase':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Compra</Badge>;
      case 'subscription':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Assinatura</Badge>;
      case 'cancel':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Cancelamento</Badge>;
      case 'refund':
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Reembolso</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">{eventType}</Badge>;
    }
  };

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'hotmart':
        return <Badge variant="outline" className="border-purple-500/30 text-purple-400">Hotmart</Badge>;
      case 'eduzz':
        return <Badge variant="outline" className="border-blue-500/30 text-blue-400">Eduzz</Badge>;
      case 'monetizze':
        return <Badge variant="outline" className="border-green-500/30 text-green-400">Monetizze</Badge>;
      default:
        return <Badge variant="outline" className="border-gray-500/30 text-gray-400">{platform}</Badge>;
    }
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
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary-contrast">
          <Bell className="w-5 h-5 text-green-400" />
          {showAll ? 'Todas as Notificações' : 'Notificações Recentes'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Nenhuma notificação encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Evento</TableHead>
                  <TableHead className="text-gray-300">Plataforma</TableHead>
                  <TableHead className="text-gray-300">Cliente</TableHead>
                  <TableHead className="text-gray-300">Valor</TableHead>
                  <TableHead className="text-gray-300">Data</TableHead>
                  <TableHead className="text-gray-300">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id} className="border-gray-700 hover:bg-gray-800/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-400" />
                        {getEventTypeBadge(notification.eventType)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPlatformBadge(notification.platform)}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      <div>
                        <p className="font-medium">{notification.clientName}</p>
                        <p className="text-sm text-gray-400">{notification.clientEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {notification.value ? `R$ ${notification.value.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-primary-contrast"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
