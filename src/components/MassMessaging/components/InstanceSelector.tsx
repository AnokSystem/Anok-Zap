
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InstanceSelectorProps {
  instances: any[];
  selectedInstance: string;
  onInstanceChange: (value: string) => void;
}

export const InstanceSelector: React.FC<InstanceSelectorProps> = ({
  instances,
  selectedInstance,
  onInstanceChange,
}) => {
  return (
    <div className="space-y-3 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
      <Label htmlFor="instance" className="text-white font-medium text-sm">Instância WhatsApp</Label>
      <Select value={selectedInstance} onValueChange={onInstanceChange}>
        <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-200 focus:border-purple-400">
          <SelectValue placeholder="Selecione uma instância" className="text-gray-200" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          {instances.map((instance) => (
            <SelectItem key={instance.id} value={instance.id} className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">
              {instance.name} ({instance.status})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
