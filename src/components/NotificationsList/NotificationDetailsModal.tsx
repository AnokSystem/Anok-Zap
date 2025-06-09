
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from 'lucide-react';
import { Notification } from './types';
import { useToast } from "@/hooks/use-toast";

interface NotificationDetailsModalProps {
  notification: Notification | null;
  onClose: () => void;
}

const NotificationDetailsModal = ({ notification, onClose }: NotificationDetailsModalProps) => {
  const { toast } = useToast();

  if (!notification) return null;

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

  const getEventTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'purchase-approved': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'awaiting-payment': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'cart-abandoned': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const copyWebhookUrl = () => {
    const webhookUrl = notification['URL do Webhook'];
    if (webhookUrl) {
      navigator.clipboard.writeText(webhookUrl);
      toast({
        title: "Copiado!",
        description: "URL do webhook copiada para a área de transferência",
      });
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔄 Fechando modal de detalhes');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose(e);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={handleBackdropClick}
    >
      <Card 
        className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-gray-800 border-gray-600"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <CardTitle className="text-primary-contrast">
            Detalhes da Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Tipo de Evento</label>
              <p className="mt-1">
                <Badge className={getEventTypeBadgeColor(notification['Tipo de Evento'])}>
                  {getEventTypeLabel(notification['Tipo de Evento'])}
                </Badge>
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300">Perfil Hotmart</label>
              <p className="mt-1 font-medium text-gray-200">{notification['Perfil Hotmart'] || '-'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300">ID da Instância</label>
              <p className="mt-1 font-mono text-sm text-gray-200">{notification['ID da Instância'] || '-'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300">Data de Criação</label>
              <p className="mt-1 text-gray-200">{formatDate(notification['CreatedAt'])}</p>
            </div>
            
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-300">URL do Webhook</label>
              <div className="mt-1 flex items-center space-x-2">
                <div className="flex-1 break-all text-sm bg-gray-700/50 p-2 rounded text-gray-200">
                  {notification['URL do Webhook'] || '-'}
                </div>
                {notification['URL do Webhook'] && (
                  <Button
                    onClick={copyWebhookUrl}
                    size="sm"
                    variant="outline"
                    className="bg-gray-700/50 border-gray-600 text-gray-200 hover:bg-gray-600/50 shrink-0"
                    title="Copiar URL do webhook"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-300">Mensagens Configuradas</label>
              <div className="mt-2 space-y-2">
                {getMessages(notification['Dados Completos (JSON)']).map((message: any, index: number) => (
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
          
          <div className="flex justify-end pt-4 border-t border-gray-600/50">
            <Button
              onClick={handleClose}
              variant="outline"
              className="bg-gray-700/50 border-gray-600 text-gray-200 hover:bg-gray-600/50"
            >
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationDetailsModal;
