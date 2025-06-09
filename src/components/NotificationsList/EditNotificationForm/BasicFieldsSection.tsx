
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BasicFieldsSectionProps {
  formData: {
    eventType: string;
    platform: string;
    profileName: string;
    instanceId: string;
  };
  onUpdate: (field: string, value: string) => void;
}

export const BasicFieldsSection = ({ formData, onUpdate }: BasicFieldsSectionProps) => {
  return (
    <>
      {/* Primeira linha - Tipo de Evento e Plataforma */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-200 font-medium text-sm">Tipo de Evento</Label>
          <Select
            value={formData.eventType}
            onValueChange={(value) => onUpdate('eventType', value)}
          >
            <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200">
              <SelectValue placeholder="Selecione o evento" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="purchase-approved">Compra Aprovada</SelectItem>
              <SelectItem value="awaiting-payment">Aguardando Pagamento</SelectItem>
              <SelectItem value="cart-abandoned">Carrinho Abandonado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-200 font-medium text-sm">Plataforma</Label>
          <Select
            value={formData.platform}
            onValueChange={(value) => onUpdate('platform', value)}
          >
            <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200">
              <SelectValue placeholder="Selecione a plataforma" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="hotmart">Hotmart</SelectItem>
              <SelectItem value="braip">Braip</SelectItem>
              <SelectItem value="kiwfy">Kiwfy</SelectItem>
              <SelectItem value="monetize">Monetize</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Segunda linha - Perfil e Instância */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-200 font-medium text-sm">Nome do Perfil</Label>
          <Input
            value={formData.profileName}
            onChange={(e) => onUpdate('profileName', e.target.value)}
            placeholder="Nome cadastrado na plataforma"
            className="bg-gray-700/50 border-gray-600 text-gray-200"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-200 font-medium text-sm">ID da Instância</Label>
          <Input
            value={formData.instanceId}
            onChange={(e) => onUpdate('instanceId', e.target.value)}
            placeholder="ID da instância WhatsApp"
            className="bg-gray-700/50 border-gray-600 text-gray-200"
          />
        </div>
      </div>
    </>
  );
};
