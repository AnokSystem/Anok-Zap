
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Power, Wifi, WifiOff, Clock, RefreshCw } from 'lucide-react';

interface Instance {
  id: string;
  name: string;
  status: string;
  phoneNumber?: string;
}

interface InstanceCardProps {
  instance: Instance;
  isLoading: boolean;
  connectingInstance: string | null;
  onDelete: (instanceId: string, instanceName: string) => void;
  onToggleConnection: (instanceId: string, currentStatus: string) => Promise<void>;
}

const InstanceCard = ({ 
  instance, 
  isLoading, 
  connectingInstance, 
  onDelete, 
  onToggleConnection 
}: InstanceCardProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
      case 'conectado':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-2">
            <Wifi className="w-3 h-3" />
            Conectado
          </Badge>
        );
      case 'close':
      case 'desconectado':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-2">
            <WifiOff className="w-3 h-3" />
            Desconectado
          </Badge>
        );
      case 'connecting':
      case 'conectando':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Conectando
          </Badge>
        );
      default:
        return (
          <Badge className="bg-purple-accent/20 text-purple-accent border-purple-accent/30 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Aguardando
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
      case 'conectado':
        return <Wifi className="w-5 h-5 text-green-400" />;
      case 'close':
      case 'desconectado':
        return <WifiOff className="w-5 h-5 text-red-400" />;
      case 'connecting':
      case 'conectando':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <Clock className="w-5 h-5 text-purple-accent" />;
    }
  };

  const isConnected = (status: string) => {
    return status === 'open' || status === 'conectado';
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
              {getStatusIcon(instance.status)}
            </div>
            <div>
              <CardTitle className="text-gray-200 text-base font-semibold">
                {instance.name}
              </CardTitle>
              <CardDescription className="text-xs text-gray-400">
                ID: {instance.id}
              </CardDescription>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 h-8 w-8 p-0"
            onClick={() => onDelete(instance.id, instance.name)}
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Status:</span>
            {getStatusBadge(instance.status)}
          </div>
          
          {instance.phoneNumber && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Telefone:</span>
              <span className="text-sm text-gray-200">{instance.phoneNumber}</span>
            </div>
          )}
          
          <div className="pt-2 border-t border-gray-700/50">
            <Button
              size="sm"
              variant={isConnected(instance.status) ? "destructive" : "default"}
              className="w-full"
              onClick={() => onToggleConnection(instance.id, instance.status)}
              disabled={isLoading || connectingInstance === instance.id}
            >
              {connectingInstance === instance.id ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Power className="w-3 h-3 mr-2" />
                  {isConnected(instance.status) ? 'Desconectar' : 'Conectar'}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstanceCard;
