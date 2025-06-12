
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface Instance {
  id: string;
  name: string;
  status: string;
  creationDate: string;
  connectionStatus?: string;
  profileName?: string;
  profilePicUrl?: string;
}

interface ConnectionStatusProps {
  selectedInstance: string;
  instances: Instance[];
  getStatusColor: (status?: string) => string;
  isInstanceDisconnected: () => boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  selectedInstance,
  instances,
  getStatusColor,
  isInstanceDisconnected
}) => {
  if (!selectedInstance) return null;

  return (
    <Card className="border-gray-600/50 bg-gray-800/30">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-primary-contrast font-medium">Status da Instância</h4>
            <p className="text-gray-400 text-sm">
              Instância: {instances.find(i => i.id === selectedInstance)?.name}
            </p>
            {isInstanceDisconnected() && (
              <p className="text-yellow-400 text-sm mt-1">
                ⚠️ Para editar o perfil, a instância precisa estar conectada
              </p>
            )}
          </div>
          <div className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(instances.find(i => i.id === selectedInstance)?.status)}`}>
            {instances.find(i => i.id === selectedInstance)?.status}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionStatus;
