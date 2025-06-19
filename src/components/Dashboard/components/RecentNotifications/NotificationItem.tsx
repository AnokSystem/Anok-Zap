
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, User, Mail, Phone, Package, CreditCard } from 'lucide-react';
import { formatCurrency, formatEventType, getPlatformColor, getEventTypeColor } from './utils';

interface NotificationItemProps {
  notification: any;
  onViewDetails: (notification: any) => void;
}

export const NotificationItem = ({ notification, onViewDetails }: NotificationItemProps) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:bg-gray-800/70 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          {/* Linha 1: Platform e Event Type */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={getPlatformColor(notification.platform)}>
              {notification.platform}
            </Badge>
            <Badge variant="outline" className={getEventTypeColor(notification.eventType)}>
              {formatEventType(notification.eventType)}
            </Badge>
          </div>

          {/* Linha 2: Informações do Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400">Nome:</span>
              <span className="text-gray-200 font-medium">{notification.clientName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-green-400" />
              <span className="text-gray-400">Email:</span>
              <span className="text-gray-300 text-xs">{notification.clientEmail}</span>
            </div>
            {notification.clientPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-purple-400" />
                <span className="text-gray-400">Telefone:</span>
                <span className="text-gray-200 font-medium">{notification.clientPhone}</span>
              </div>
            )}
          </div>

          {/* Linha 3: Produto e Valor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {notification.productName && (
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-purple-400" />
                <span className="text-gray-400">Produto:</span>
                <span className="text-gray-200 font-medium truncate">{notification.productName}</span>
              </div>
            )}
            {notification.value && notification.value > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-green-400" />
                <span className="text-gray-400">Valor:</span>
                <span className="text-green-400 font-bold">{formatCurrency(notification.value)}</span>
              </div>
            )}
          </div>

          {/* Linha 4: Data */}
          <div className="text-xs text-gray-500">
            {formatDate(notification.createdAt)}
          </div>
        </div>

        {/* Botão de ação */}
        <div className="ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(notification)}
            className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
