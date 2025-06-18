
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Smartphone } from 'lucide-react';

interface Instance {
  id: string;
  name: string;
  status: string;
}

interface InstanceSelectorProps {
  instances: Instance[];
  selectedInstances: string[];
  onInstanceToggle: (instanceId: string) => void;
}

export const InstanceSelector: React.FC<InstanceSelectorProps> = ({
  instances,
  selectedInstances,
  onInstanceToggle,
}) => {
  return (
    <Card className="bg-white data-[theme=dark]:bg-gray-800 border-gray-200 data-[theme=dark]:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 data-[theme=dark]:text-gray-100 flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Selecionar Instâncias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {instances.map((instance) => (
            <div key={instance.id} className="flex items-center space-x-2 p-3 bg-gray-50 data-[theme=dark]:bg-gray-700 border border-gray-200 data-[theme=dark]:border-gray-600 rounded-lg">
              <Checkbox
                id={instance.id}
                checked={selectedInstances.includes(instance.id)}
                onCheckedChange={() => onInstanceToggle(instance.id)}
              />
              <Label htmlFor={instance.id} className="text-gray-700 data-[theme=dark]:text-gray-300 flex-1 cursor-pointer">
                {instance.name}
                <span className={`ml-2 text-xs px-2 py-1 rounded ${
                  instance.status === 'conectado' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {instance.status}
                </span>
              </Label>
            </div>
          ))}
        </div>
        {selectedInstances.length > 0 && (
          <div className="mt-3 p-2 bg-purple-50 data-[theme=dark]:bg-purple-900/20 border border-purple-200 data-[theme=dark]:border-purple-700 rounded">
            <p className="text-sm text-purple-700 data-[theme=dark]:text-purple-300">
              {selectedInstances.length} instância(s) selecionada(s)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
