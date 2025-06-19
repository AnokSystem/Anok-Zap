
import React from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink } from 'lucide-react';
import { NotificationItem } from './NotificationItem';

interface NotificationsListProps {
  notifications: any[];
  showAll: boolean;
  onViewDetails: (notification: any) => void;
}

export const NotificationsList = ({ 
  notifications, 
  showAll, 
  onViewDetails 
}: NotificationsListProps) => {
  return (
    <div className="space-y-3">
      {notifications.map((notification, index) => (
        <NotificationItem
          key={notification.id || index}
          notification={notification}
          onViewDetails={onViewDetails}
        />
      ))}
      
      {showAll && notifications.length > 10 && (
        <div className="text-center pt-4">
          <Button 
            variant="outline" 
            className="border-gray-600 hover:border-green-500"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver todas as {notifications.length} notificações
          </Button>
        </div>
      )}
    </div>
  );
};
