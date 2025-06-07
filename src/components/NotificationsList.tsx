
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Eye, Database } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { nocodbService } from '@/services/nocodb';

interface Notification {
  ID: string;
  'Tipo de Evento': string;
  'ID da Instância': string;
  'Perfil Hotmart': string;
  'URL do Webhook': string;
  'Criado em': string;
  'Dados Completos (JSON)': string;
}

const NotificationsList = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      console.log('Carregando notificações do NocoDB...');
      const data = await nocodbService.getHotmartNotifications();
      
      console.log('Dados recebidos:', data);
      setNotifications(data);
      
      toast({
        title: "Sucesso",
        description: `${data.length} notificações carregadas do NocoDB`,
      });
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar notificações do NocoDB",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const getMessages = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      return data.messages || [];
    } catch {
      return [];
    }
  };

  const getMessagePreview = (jsonData: string) => {
    const messages = getMessages(jsonData);
    if (messages.length === 0) return 'Nenhuma mensagem';
    
    const firstMessage = messages[0];
    if (firstMessage.type === 'text') {
      return firstMessage.content.length > 50 
        ? firstMessage.content.substring(0, 50) + '...' 
        : firstMessage.content;
    }
    return `${firstMessage.type} (${messages.length} mensagens)`;
  };

  const viewNotificationDetails = (notification: Notification) => {
    setSelectedNotification(notification);
  };

  const getEventTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'purchase-approved': return 'bg-green-100 text-green-800';
      case 'awaiting-payment': return 'bg-yellow-100 text-yellow-800';
      case 'cart-abandoned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Notificações Criadas</span>
            </div>
            <Button
              onClick={loadNotifications}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Carregando...' : 'Atualizar'}
            </Button>
          </CardTitle>
          <CardDescription>
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
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo de Evento</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Instância</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead>Data Criada</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.ID}>
                      <TableCell>
                        <Badge className={getEventTypeBadgeColor(notification['Tipo de Evento'])}>
                          {getEventTypeLabel(notification['Tipo de Evento'])}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {notification['Perfil Hotmart'] || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {notification['ID da Instância']?.slice(0, 8) || '-'}...
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {getMessagePreview(notification['Dados Completos (JSON)'])}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(notification['Criado em'])}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => viewNotificationDetails(notification)}
                          size="sm"
                          variant="ghost"
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

      {/* Modal de detalhes */}
      {selectedNotification && (
        <Card className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm p-6 overflow-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Detalhes da Notificação</span>
              <Button
                onClick={() => setSelectedNotification(null)}
                variant="outline"
                size="sm"
              >
                Fechar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Tipo de Evento</label>
                <p className="mt-1">
                  <Badge className={getEventTypeBadgeColor(selectedNotification['Tipo de Evento'])}>
                    {getEventTypeLabel(selectedNotification['Tipo de Evento'])}
                  </Badge>
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Perfil Hotmart</label>
                <p className="mt-1 font-medium">{selectedNotification['Perfil Hotmart'] || '-'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">ID da Instância</label>
                <p className="mt-1 font-mono text-sm">{selectedNotification['ID da Instância'] || '-'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Data de Criação</label>
                <p className="mt-1">{formatDate(selectedNotification['Criado em'])}</p>
              </div>
              
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">URL do Webhook</label>
                <p className="mt-1 break-all text-sm bg-gray-100 p-2 rounded">
                  {selectedNotification['URL do Webhook'] || '-'}
                </p>
              </div>
              
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Mensagens Configuradas</label>
                <div className="mt-2 space-y-2">
                  {getMessages(selectedNotification['Dados Completos (JSON)']).map((message: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-3 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{message.type}</Badge>
                        <span className="text-xs text-gray-500">Mensagem {index + 1}</span>
                      </div>
                      {message.type === 'text' && (
                        <p className="text-sm">{message.content}</p>
                      )}
                      {message.type === 'image' && (
                        <p className="text-sm text-gray-600">📷 Imagem: {message.fileUrl || 'URL não disponível'}</p>
                      )}
                      {message.type === 'video' && (
                        <p className="text-sm text-gray-600">🎥 Vídeo: {message.fileUrl || 'URL não disponível'}</p>
                      )}
                      {message.type === 'audio' && (
                        <p className="text-sm text-gray-600">🎵 Áudio: {message.fileUrl || 'URL não disponível'}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationsList;
