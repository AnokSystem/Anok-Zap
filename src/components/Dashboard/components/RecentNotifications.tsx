
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, RefreshCw } from 'lucide-react';
import { useRecentNotifications } from '../hooks/useRecentNotifications';
import { NotificationDetailsModal } from './RecentNotifications/NotificationDetailsModal';
import { LoadingState } from './RecentNotifications/LoadingState';
import { ErrorState } from './RecentNotifications/ErrorState';
import { EmptyState } from './RecentNotifications/EmptyState';
import { NotificationsList } from './RecentNotifications/NotificationsList';

interface RecentNotificationsProps {
  showAll?: boolean;
}

export const RecentNotifications = ({ showAll = false }: RecentNotificationsProps) => {
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { 
    notifications, 
    isLoading, 
    error, 
    refetch 
  } = useRecentNotifications(showAll ? 50 : 10);

  const handleViewDetails = (notification: any) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <LoadingState showAll={showAll} />;
  }

  if (error) {
    return <ErrorState showAll={showAll} error={error} onRetry={refetch} />;
  }

  return (
    <>
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary-contrast">
            <Bell className="w-5 h-5 text-green-400" />
            {showAll ? 'Todas as Notificações' : 'Notificações Recentes'}
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline" className="border-green-500/30 text-green-400">
                {notifications.length} registros
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={refetch}
                className="text-gray-400 hover:text-primary-contrast"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <EmptyState />
          ) : (
            <NotificationsList
              notifications={notifications}
              showAll={showAll}
              onViewDetails={handleViewDetails}
            />
          )}
        </CardContent>
      </Card>

      <NotificationDetailsModal
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
