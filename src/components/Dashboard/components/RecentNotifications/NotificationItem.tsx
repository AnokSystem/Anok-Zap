
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, User, Mail, Phone, Package, CreditCard } from 'lucide-react';
import { formatCurrency, getPlatformColor, getEventTypeColor } from './utils';

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
    <div className="bg-gray-800/40 border border-gray-700/30 rounded-lg p-3 hover:bg-gray-800/60 transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          {/* Header: Platform, Event Type e Badges */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${getPlatformColor(notification.platform)} text-xs px-2 py-0.5`}>
                {notification.platform}
              </Badge>
              <Badge variant="outline" className={`${getEventTypeColor(notification.eventType)} text-xs px-2 py-0.5`}>
                {notification.eventType}
              </Badge>
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(notification.createdAt)}
            </div>
          </div>

          {/* Informações principais em uma linha */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3 text-blue-400" />
                <span className="text-gray-200 font-medium truncate max-w-[120px]">
                  {notification.clientName}
                </span>
              </div>
              
              {notification.productName && (
                <div className="flex items-center gap-1">
                  <Package className="w-3 h-3 text-purple-400" />
                  <span className="text-gray-300 text-xs truncate max-w-[100px]">
                    {notification.productName}
                  </span>
                </div>
              )}
            </div>

            {/* Valor e botão de ação */}
            <div className="flex items-center gap-3">
              {notification.value && notification.value > 0 && (
                <div className="flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-green-400" />
                  <span className="text-green-400 font-bold text-sm">
                    {formatCurrency(notification.value)}
                  </span>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(notification)}
                className="text-green-400 hover:text-green-300 hover:bg-green-400/10 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Eye className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Email e telefone em linha secundária (opcional) */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-green-400" />
              <span className="truncate max-w-[150px]">{notification.clientEmail}</span>
            </div>
            
            {notification.clientPhone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-purple-400" />
                <span>{notification.clientPhone}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
