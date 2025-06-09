
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RefreshCw, Smartphone } from 'lucide-react';
import InstanceCard from './InstanceCard';

interface Instance {
  id: string;
  name: string;
  status: string;
  phoneNumber?: string;
}

interface InstanceGridProps {
  instances: Instance[];
  isLoading: boolean;
  connectingInstance: string | null;
  onRefresh: () => Promise<void>;
  onDelete: (instanceId: string, instanceName: string) => void;
  onToggleConnection: (instanceId: string, currentStatus: string) => Promise<void>;
}

const InstanceGrid = ({ 
  instances, 
  isLoading, 
  connectingInstance, 
  onRefresh, 
  onDelete, 
  onToggleConnection 
}: InstanceGridProps) => {
  return (
    <div className="card-glass p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-purple-accent" />
          </div>
          <div>
            <Label className="font-semibold text-primary-contrast text-lg">Suas Instâncias</Label>
            <p className="text-sm text-gray-400 mt-1">
              {instances.length} instâncias configuradas
            </p>
          </div>
        </div>
        <Button
          onClick={onRefresh}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="bg-gray-700/50 border-gray-600 text-gray-200 hover:bg-gray-600/50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Carregando...' : 'Atualizar'}
        </Button>
      </div>

      {instances.length === 0 ? (
        <div className="text-center py-12">
          <Smartphone className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400 text-lg">
            {isLoading ? 'Carregando suas instâncias...' : 'Você ainda não possui instâncias'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instances.map((instance) => (
            <InstanceCard
              key={instance.id}
              instance={instance}
              isLoading={isLoading}
              connectingInstance={connectingInstance}
              onDelete={onDelete}
              onToggleConnection={onToggleConnection}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InstanceGrid;
