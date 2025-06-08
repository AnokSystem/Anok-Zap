
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Eye, Database, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { nocodbService } from '@/services/nocodb';

interface Notification {
  ID: string;
  'Tipo de Evento': string;
  'ID da Instância': string;
  'Perfil Hotmart': string;
  'URL do Webhook': string;
  'CreatedAt': string;
  'Dados Completos (JSON)': string;
  'Plataforma'?: string;
  'Papel do Usuário'?: string;
}

const NotificationsList = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'success' | 'error' | 'loading' | null>(null);

  useEffect(() => {
    console.log('🚀 NotificationsList montado, carregando notificações...');
    loadNotifications();

    // Escutar evento de refresh
    const handleRefresh = () => {
      console.log('🔄 Evento de refresh recebido');
      loadNotifications();
    };

    window.addEventListener('refreshNotifications', handleRefresh);
    return () => window.removeEventListener('refreshNotifications', handleRefresh);
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    setSyncStatus('loading');
    
    try {
      console.log('📡 Carregando notificações do NocoDB...');
      
      // Primeiro testar a conexão
      const connectionTest = await nocodbService.testConnection();
      console.log('🔌 Teste de conexão:', connectionTest);
      
      if (!connectionTest.success) {
        throw new Error(connectionTest.error || 'Falha na conexão');
      }
      
      const data = await nocodbService.getHotmartNotifications();
      
      console.log('📋 Dados recebidos:', data);
      console.log(`📊 Total de notificações: ${data.length}`);
      
      setNotifications(data);
      setLastSync(new Date());
      setSyncStatus('success');
      
      toast({
        title: "Sucesso",
        description: `${data.length} notificações carregadas do NocoDB`,
      });
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error);
      setSyncStatus('error');
      toast({
        title: "Erro",
        description: `Falha ao carregar notificações: ${error.message}`,
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

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'loading': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className="border-gray-600/50 bg-gray-800/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getSyncStatusIcon()}
              <div>
                <p className="text-sm font-medium text-gray-200">
                  Status da Sincronização
                </p>
                <p className="text-xs text-gray-400">
                  {lastSync ? `Última sincronização: ${lastSync.toLocaleTimeString('pt-BR')}` : 'Nunca sincronizado'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-purple-accent border-purple-accent/30">
                {notifications.length} notificações
              </Badge>
              <Button
                onClick={loadNotifications}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="bg-gray-700/50 border-gray-600 text-gray-200 hover:bg-gray-600/50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Sincronizando...' : 'Sincronizar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
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
                  onClick={loadNotifications}
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
                        <Button
                          onClick={() => viewNotificationDetails(notification)}
                          size="sm"
                          variant="ghost"
                          className="text-purple-accent hover:text-purple-accent/80 hover:bg-purple-accent/10"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-primary-contrast">
                <span>Detalhes da Notificação</span>
                <Button
                  onClick={() => setSelectedNotification(null)}
                  variant="outline"
                  size="sm"
                  className="bg-gray-700/50 border-gray-600 text-gray-200 hover:bg-gray-600/50"
                >
                  Fechar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Tipo de Evento</label>
                  <p className="mt-1">
                    <Badge className={getEventTypeBadgeColor(selectedNotification['Tipo de Evento'])}>
                      {getEventTypeLabel(selectedNotification['Tipo de Evento'])}
                    </Badge>
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300">Perfil Hotmart</label>
                  <p className="mt-1 font-medium text-gray-200">{selectedNotification['Perfil Hotmart'] || '-'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300">ID da Instância</label>
                  <p className="mt-1 font-mono text-sm text-gray-200">{selectedNotification['ID da Instância'] || '-'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300">Data de Criação</label>
                  <p className="mt-1 text-gray-200">{formatDate(selectedNotification['Criado em'])}</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-300">URL do Webhook</label>
                  <p className="mt-1 break-all text-sm bg-gray-700/50 p-2 rounded text-gray-200">
                    {selectedNotification['URL do Webhook'] || '-'}
                  </p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-300">Mensagens Configuradas</label>
                  <div className="mt-2 space-y-2">
                    {getMessages(selectedNotification['Dados Completos (JSON)']).map((message: any, index: number) => (
                      <div key={index} className="bg-gray-700/50 p-3 rounded border border-gray-600/50">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="border-gray-500 text-gray-300">{message.type}</Badge>
                          <span className="text-xs text-gray-400">Mensagem {index + 1}</span>
                        </div>
                        {message.type === 'text' && (
                          <p className="text-sm text-gray-200">{message.content}</p>
                        )}
                        {message.type === 'image' && (
                          <p className="text-sm text-gray-300">📷 Imagem: {message.fileUrl || 'URL não disponível'}</p>
                        )}
                        {message.type === 'video' && (
                          <p className="text-sm text-gray-300">🎥 Vídeo: {message.fileUrl || 'URL não disponível'}</p>
                        )}
                        {message.type === 'audio' && (
                          <p className="text-sm text-gray-300">🎵 Áudio: {message.fileUrl || 'URL não disponível'}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NotificationsList;
