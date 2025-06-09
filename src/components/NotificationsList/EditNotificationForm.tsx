
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X, RefreshCw } from 'lucide-react';
import { Notification } from './types';

interface EditNotificationFormProps {
  notification: Notification;
  onSave: (updatedData: any) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EditNotificationForm = ({ 
  notification, 
  onSave, 
  onCancel, 
  isLoading = false 
}: EditNotificationFormProps) => {
  const [formData, setFormData] = useState({
    eventType: '',
    platform: '',
    profileName: '',
    instanceId: '',
    userRole: '',
    messages: [] as any[]
  });

  useEffect(() => {
    // Parse dos dados da notificação para preencher o formulário
    let parsedData: any = {};
    
    if (notification['Dados Completos (JSON)']) {
      try {
        parsedData = JSON.parse(notification['Dados Completos (JSON)']);
      } catch (e) {
        console.error('❌ Erro ao fazer parse do JSON:', e);
        parsedData = {};
      }
    }
    
    setFormData({
      eventType: parsedData.eventType || notification['Tipo de Evento'] || '',
      platform: parsedData.platform || notification['Plataforma'] || '',
      profileName: parsedData.profileName || notification['Perfil Hotmart'] || '',
      instanceId: parsedData.instance || notification['ID da Instância'] || '',
      userRole: parsedData.userRole || '',
      messages: parsedData.messages || []
    });
  }, [notification]);

  const handleSave = async () => {
    const success = await onSave(formData);
    // O componente pai irá fechar o formulário se o save for bem-sucedido
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase-approved': return 'Compra Aprovada';
      case 'awaiting-payment': return 'Aguardando Pagamento';
      case 'cart-abandoned': return 'Carrinho Abandonado';
      default: return type;
    }
  };

  const getMessagePreview = (messages: any[]) => {
    if (!messages || messages.length === 0) return 'Nenhuma mensagem';
    
    const firstMessage = messages[0];
    if (firstMessage?.type === 'text') {
      return firstMessage.content?.length > 100 
        ? firstMessage.content.substring(0, 100) + '...' 
        : firstMessage.content;
    }
    return `${firstMessage?.type || 'Mensagem'} (${messages.length} mensagens)`;
  };

  return (
    <Card className="border-blue-500/50 bg-blue-500/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-primary-contrast">
          <div className="flex items-center space-x-2">
            <Edit className="w-5 h-5 text-blue-400" />
            <span>Editando Notificação</span>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              ID: {notification.ID}
            </Badge>
          </div>
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Modifique os campos abaixo e clique em salvar para atualizar a notificação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primeira linha - Tipo de Evento e Plataforma */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-200 font-medium text-sm">Tipo de Evento</Label>
            <Select
              value={formData.eventType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, eventType: value }))}
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
              onValueChange={(value) => setFormData(prev => ({ ...prev, platform: value }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, profileName: e.target.value }))}
              placeholder="Nome cadastrado na plataforma"
              className="bg-gray-700/50 border-gray-600 text-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-200 font-medium text-sm">ID da Instância</Label>
            <Input
              value={formData.instanceId}
              onChange={(e) => setFormData(prev => ({ ...prev, instanceId: e.target.value }))}
              placeholder="ID da instância WhatsApp"
              className="bg-gray-700/50 border-gray-600 text-gray-200"
            />
          </div>
        </div>

        {/* Função do Usuário */}
        <div className="space-y-2">
          <Label className="text-gray-200 font-medium text-sm">Você é</Label>
          <Select
            value={formData.userRole}
            onValueChange={(value) => setFormData(prev => ({ ...prev, userRole: value }))}
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

        {/* Preview das Mensagens */}
        <div className="space-y-2">
          <Label className="text-gray-200 font-medium text-sm">Mensagens Configuradas</Label>
          <Textarea
            value={getMessagePreview(formData.messages)}
            readOnly
            className="bg-gray-700/30 border-gray-600 text-gray-300 min-h-[80px]"
            placeholder="Nenhuma mensagem configurada"
          />
          <p className="text-xs text-gray-500">
            Para editar as mensagens completamente, use o formulário principal de notificações
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600/30">
          <Button
            onClick={onCancel}
            variant="ghost"
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-200"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading || !formData.eventType || !formData.platform || !formData.profileName}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
