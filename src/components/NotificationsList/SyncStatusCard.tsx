
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { SyncStatus, Notification } from './types';

interface SyncStatusCardProps {
  syncStatus: SyncStatus;
  lastSync: Date | null;
  notifications: Notification[];
  isLoading: boolean;
  onRefresh: () => void;
}

const SyncStatusCard = ({ syncStatus, lastSync, notifications, isLoading, onRefresh }: SyncStatusCardProps) => {
  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'loading': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
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
              onClick={onRefresh}
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
  );
};

export default SyncStatusCard;
