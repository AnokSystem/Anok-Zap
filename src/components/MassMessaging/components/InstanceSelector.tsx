
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
    <div className="space-y-2">
      <Label htmlFor="instance">Instância WhatsApp</Label>
      <Select value={selectedInstance} onValueChange={onInstanceChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma instância" />
        </SelectTrigger>
        <SelectContent>
          {instances.map((instance) => (
            <SelectItem key={instance.id} value={instance.id}>
              {instance.name} ({instance.status})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
