
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NotificationRule {
  platform: string;
  profileName: string;
}

interface PlatformProfileSectionProps {
  newRule: Partial<NotificationRule>;
  setNewRule: (rule: Partial<NotificationRule> | ((prev: Partial<NotificationRule>) => Partial<NotificationRule>)) => void;
}

export const PlatformProfileSection = ({ newRule, setNewRule }: PlatformProfileSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
      <div className="space-y-2">
        <Label className="text-gray-200 font-medium text-sm">Plataforma *</Label>
        <Select
          value={newRule.platform}
          onValueChange={(value) => setNewRule(prev => ({ ...prev, platform: value }))}
        >
          <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 focus:border-purple-accent h-10">
            <SelectValue placeholder="Selecione a plataforma" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="hotmart" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Hotmart</SelectItem>
            <SelectItem value="braip" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Braip</SelectItem>
            <SelectItem value="kiwfy" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Kiwfy</SelectItem>
            <SelectItem value="monetize" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Monetize</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-200 font-medium text-sm">Nome do Perfil *</Label>
        <Input
          value={newRule.profileName || ''}
          onChange={(e) => setNewRule(prev => ({ ...prev, profileName: e.target.value }))}
          placeholder="Nome cadastrado na plataforma"
          className="input-form h-10"
        />
      </div>
    </div>
  );
};
