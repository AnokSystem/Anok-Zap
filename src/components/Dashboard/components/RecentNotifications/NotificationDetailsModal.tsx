
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bell, User, CreditCard, Calendar, Package, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationDetailsModalProps {
  notification: any;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDetailsModal = ({ notification, isOpen, onClose }: NotificationDetailsModalProps) => {
  if (!notification) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-primary-contrast">
            <Bell className="w-6 h-6 text-green-400" />
            Detalhes da Notificação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Badges da Plataforma e Evento */}
          <div className="flex gap-2">
            <Badge variant="outline" className={getPlatformColor(notification.platform)}>
              {notification.platform}
            </Badge>
            <Badge variant="outline" className={getEventTypeColor(notification.eventType)}>
              {notification.eventType}
            </Badge>
          </div>

          <Separator className="bg-gray-700" />

          {/* Informações do Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-contrast">Informações do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <User className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Nome</p>
                  <p className="text-primary-contrast font-medium">{notification.clientName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <Mail className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-primary-contrast font-medium">{notification.clientEmail}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-700" />

          {/* Informações do Produto */}
          {notification.productName && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary-contrast">Produto</h3>
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <Package className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Nome do Produto</p>
                    <p className="text-primary-contrast font-medium">{notification.productName}</p>
                  </div>
                </div>
              </div>
              <Separator className="bg-gray-700" />
            </>
          )}

          {/* Informações Financeiras */}
          {notification.value && notification.value > 0 && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary-contrast">Valor</h3>
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CreditCard className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Valor da Transação</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(notification.value)}</p>
                  </div>
                </div>
              </div>
              <Separator className="bg-gray-700" />
            </>
          )}

          {/* Data e Hora */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-contrast">Data e Hora</h3>
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
              <Calendar className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Recebido em</p>
                <p className="text-primary-contrast font-medium">
                  {format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
