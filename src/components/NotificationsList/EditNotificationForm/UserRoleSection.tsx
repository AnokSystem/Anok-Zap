
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserRoleSectionProps {
  userRole: string;
  onUpdate: (value: string) => void;
}

export const UserRoleSection = ({ userRole, onUpdate }: UserRoleSectionProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-gray-200 font-medium text-sm">Você é</Label>
      <Select
        value={userRole}
        onValueChange={onUpdate}
      >
        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200">
          <SelectValue placeholder="Selecione seu papel" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          <SelectItem value="producer">Produtor</SelectItem>
          <SelectItem value="affiliate">Afiliado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
