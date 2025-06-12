
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smartphone, RefreshCw } from 'lucide-react';

interface Instance {
  id: string;
  name: string;
  status: string;
  creationDate: string;
  connectionStatus?: string;
  profileName?: string;
  profilePicUrl?: string;
}

interface InstanceSelectorProps {
  instances: Instance[];
  selectedInstance: string;
  onInstanceChange: (instanceId: string) => void;
  onRefresh: () => void;
  getStatusColor: (status?: string) => string;
}

const InstanceSelector: React.FC<InstanceSelectorProps> = ({
  instances,
  selectedInstance,
  onInstanceChange,
  onRefresh,
  getStatusColor
}) => {
  return (
    <Card className="border-gray-600/50 bg-gray-800/30">
      <CardHeader>
        <CardTitle className="text-primary-contrast flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Selecionar Instância
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <div className="flex-1">
            <Label className="text-gray-300">Instância Ativa</Label>
            <Select value={selectedInstance} onValueChange={onInstanceChange}>
              <SelectTrigger className="bg-gray-800 border-gray-600">
                <SelectValue placeholder="Escolha uma instância" />
              </SelectTrigger>
              <SelectContent>
                {instances.map((instance) => (
                  <SelectItem key={instance.id} value={instance.id}>
                    <div className="flex items-center gap-2">
                      {instance.name}
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(instance.status)}`}>
                        {instance.status}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline" 
            onClick={onRefresh}
            className="bg-gray-800 border-gray-600 mt-6"
            disabled={!selectedInstance}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstanceSelector;
