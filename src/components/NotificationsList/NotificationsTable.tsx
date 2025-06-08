
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, Eye, Trash2, RefreshCw } from 'lucide-react';
import { Notification } from './types';

interface NotificationsTableProps {
  notifications: Notification[];
  isLoading: boolean;
  onViewDetails: (notification: Notification) => void;
  onDelete: (notificationId: string) => void;
  onRefresh: () => void;
}

const NotificationsTable = ({ notifications, isLoading, onViewDetails, onDelete, onRefresh }: NotificationsTableProps) => {
  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase-approved': return 'Compra Aprovada';
      case 'awaiting-payment': return 'Aguardando Pagamento';
      case 'cart-abandoned': return 'Carrinho Abandonado';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const getMessagePreview = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      const messages = data.messages || [];
      if (messages.length === 0) return 'Nenhuma mensagem';
      
      const firstMessage = messages[0];
      if (firstMessage.type === 'text') {
        return firstMessage.content.length > 50 
          ? firstMessage.content.substring(0, 50) + '...' 
          : firstMessage.content;
      }
      return `${firstMessage.type} (${messages.length} mensagens)`;
    } catch {
      return 'Dados inválidos';
    }
  };

  const getEventTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'purchase-approved': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'awaiting-payment': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'cart-abandoned': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <Card className="border-gray-600/50 bg-gray-800/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-primary-contrast">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Notificações Criadas</span>
          </div>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Lista de todas as notificações inteligentes configuradas no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Database className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              {isLoading ? 'Carregando notificações...' : 'Nenhuma notificação encontrada'}
            </p>
            {!isLoading && (
              <Button
                onClick={onRefresh}
                variant="outline"
                size="sm"
                className="mt-4 bg-purple-accent/20 border-purple-accent text-purple-accent hover:bg-purple-accent/30"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600/50">
                  <TableHead className="text-gray-300">Tipo de Evento</TableHead>
                  <TableHead className="text-gray-300">Plataforma</TableHead>
                  <TableHead className="text-gray-300">Perfil</TableHead>
                  <TableHead className="text-gray-300">Instância</TableHead>
                  <TableHead className="text-gray-300">Mensagem</TableHead>
                  <TableHead className="text-gray-300">Data Criada</TableHead>
                  <TableHead className="text-gray-300">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.ID} className="border-gray-600/50 hover:bg-gray-700/30">
                    <TableCell>
                      <Badge className={getEventTypeBadgeColor(notification['Tipo de Evento'])}>
                        {getEventTypeLabel(notification['Tipo de Evento'])}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-gray-200">
                      {notification['Plataforma'] || '-'}
                    </TableCell>
                    <TableCell className="font-medium text-gray-200">
                      {notification['Perfil Hotmart'] || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-gray-300">
                      {notification['ID da Instância']?.slice(0, 8) || '-'}...
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-gray-300">
                      {getMessagePreview(notification['Dados Completos (JSON)'])}
                    </TableCell>
                    <TableCell className="text-sm text-gray-400">
                      {formatDate(notification['CreatedAt'])}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => onViewDetails(notification)}
                          size="sm"
                          variant="ghost"
                          className="text-purple-accent hover:text-purple-accent/80 hover:bg-purple-accent/10"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => onDelete(notification.ID)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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

export default NotificationsTable;
