
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from 'lucide-react';
import { formatCurrency, formatDate, getPlatformColor, getEventTypeColor } from './utils';

interface NotificationItemProps {
  notification: any;
  onViewDetails: (notification: any) => void;
}

export const NotificationItem = ({ notification, onViewDetails }: NotificationItemProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
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
                onClick={() => onViewDetails(notification)}
                className="text-gray-400 hover:text-primary-contrast hover:bg-green-500/20"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
