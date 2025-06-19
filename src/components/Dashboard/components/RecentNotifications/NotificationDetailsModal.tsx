
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bell, User, CreditCard, Calendar, Package, Mail, Phone } from 'lucide-react';
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
      <DialogContent className="max-w-lg w-[95vw] max-h-[85vh] overflow-y-auto bg-gray-900 border-gray-700 p-4 sm:p-6">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center gap-2 text-lg text-primary-contrast">
            <Bell className="w-5 h-5 text-green-400" />
            Detalhes da Notificação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Badges da Plataforma e Evento */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={getPlatformColor(notification.platform)}>
              {notification.platform}
            </Badge>
            <Badge variant="outline" className={getEventTypeColor(notification.eventType)}>
              {notification.eventType}
            </Badge>
          </div>

          <Separator className="bg-gray-700" />

          {/* Informações do Cliente */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-primary-contrast">Informações do Cliente</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                <User className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400">Nome</p>
                  <p className="text-sm text-primary-contrast font-medium break-words">{notification.clientName}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                <Mail className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm text-primary-contrast font-medium break-all">{notification.clientEmail}</p>
                </div>
              </div>
              
              {notification.clientPhone && (
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <Phone className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400">Telefone</p>
                    <p className="text-sm text-primary-contrast font-medium">{notification.clientPhone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informações do Produto */}
          {notification.productName && (
            <>
              <Separator className="bg-gray-700" />
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-primary-contrast">Produto</h3>
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <Package className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400">Nome do Produto</p>
                    <p className="text-sm text-primary-contrast font-medium break-words">{notification.productName}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Informações Financeiras */}
          {notification.value && notification.value > 0 && (
            <>
              <Separator className="bg-gray-700" />
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-primary-contrast">Valor</h3>
                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CreditCard className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400">Valor da Transação</p>
                    <p className="text-xl font-bold text-green-400">{formatCurrency(notification.value)}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Data e Hora */}
          <Separator className="bg-gray-700" />
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-primary-contrast">Data e Hora</h3>
            <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
              <Calendar className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400">Recebido em</p>
                <p className="text-sm text-primary-contrast font-medium">
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
