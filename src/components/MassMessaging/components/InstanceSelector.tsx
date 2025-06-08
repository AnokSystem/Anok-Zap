
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
    <div className="form-card space-y-3">
      <Label htmlFor="instance" className="label-form-highlight">Instância WhatsApp</Label>
      <Select value={selectedInstance} onValueChange={onInstanceChange}>
        <SelectTrigger className="select-form">
          <SelectValue placeholder="Selecione uma instância" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          {instances.map((instance) => (
            <SelectItem key={instance.id} value={instance.id} className="text-foreground hover:bg-gray-700">
              {instance.name} ({instance.status})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
