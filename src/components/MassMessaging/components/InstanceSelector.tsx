
import React from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Shuffle } from 'lucide-react';

interface InstanceSelectorProps {
  instances: any[];
  selectedInstances: string[];
  onInstancesChange: (instances: string[]) => void;
}

export const InstanceSelector: React.FC<InstanceSelectorProps> = ({
  instances,
  selectedInstances,
  onInstancesChange,
}) => {
  const handleInstanceToggle = (instanceId: string) => {
    if (selectedInstances.includes(instanceId)) {
      onInstancesChange(selectedInstances.filter(id => id !== instanceId));
    } else {
      onInstancesChange([...selectedInstances, instanceId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedInstances.length === instances.length) {
      onInstancesChange([]);
    } else {
      onInstancesChange(instances.map(instance => instance.id));
    }
  };

  const connectedInstances = instances.filter(instance => instance.status === 'conectado');
  const hasConnectedInstances = connectedInstances.length > 0;

  return (
    <div className="space-y-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
      <div className="flex items-center justify-between">
        <Label className="text-white font-medium text-sm">Instâncias WhatsApp</Label>
        {hasConnectedInstances && (
          <div className="flex items-center space-x-2">
            <Shuffle className="w-4 h-4 text-purple-accent" />
            <span className="text-xs text-purple-accent">Envios randomizados</span>
          </div>
        )}
      </div>

      {!hasConnectedInstances ? (
        <div className="text-center py-6">
          <Circle className="w-12 h-12 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Nenhuma instância conectada disponível</p>
          <p className="text-gray-500 text-xs mt-1">
            Conecte pelo menos uma instância na seção "Config" para enviar mensagens
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs bg-gray-600 border-gray-500 text-gray-200 hover:bg-gray-500"
            >
              {selectedInstances.length === connectedInstances.length ? 'Desmarcar Todas' : 'Marcar Todas'}
            </Button>
            
            <div className="text-xs text-gray-400">
              {selectedInstances.length} de {connectedInstances.length} selecionadas
            </div>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {connectedInstances.map((instance) => {
              const isSelected = selectedInstances.includes(instance.id);
              
              return (
                <div
                  key={instance.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-purple-accent/20 border-purple-accent/50 shadow-sm' 
                      : 'bg-gray-600/50 border-gray-500/50 hover:bg-gray-600/70'
                  }`}
                  onClick={() => handleInstanceToggle(instance.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleInstanceToggle(instance.id)}
                    className="data-[state=checked]:bg-purple-accent data-[state=checked]:border-purple-accent"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-200 font-medium text-sm truncate">
                        {instance.name}
                      </span>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400 capitalize">
                          {instance.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedInstances.length > 1 && (
            <div className="mt-3 p-3 bg-purple-accent/10 border border-purple-accent/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <Shuffle className="w-4 h-4 text-purple-accent" />
                <span className="text-sm text-purple-accent font-medium">
                  Modo Randomização Ativo
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1">
                Os envios serão distribuídos aleatoriamente entre as {selectedInstances.length} instâncias selecionadas 
                para melhor distribuição e performance.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
