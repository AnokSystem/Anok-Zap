
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Upload, Plus, Trash2, Send, Download, MessageSquare } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';
import { minioService } from '@/services/minio';
import { nocodbService } from '@/services/nocodb';

interface Message {
  id: string;
  type: 'text' | 'audio' | 'video' | 'image' | 'document';
  content: string;
  file?: File;
  fileUrl?: string;
}

const MassMessaging = () => {
  const { toast } = useToast();
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedInstance, setSelectedInstance] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'text', content: '' }
  ]);
  const [recipients, setRecipients] = useState('');
  const [delay, setDelay] = useState([5]);
  const [notificationPhone, setNotificationPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    try {
      const instancesData = await evolutionApiService.getInstances();
      setInstances(instancesData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar instâncias do WhatsApp",
        variant: "destructive",
      });
    }
  };

  const addMessage = () => {
    if (messages.length < 5) {
      setMessages([...messages, {
        id: Date.now().toString(),
        type: 'text',
        content: ''
      }]);
    }
  };

  const removeMessage = (id: string) => {
    if (messages.length > 1) {
      setMessages(messages.filter(msg => msg.id !== id));
    }
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  };

  const handleFileUpload = async (messageId: string, file: File) => {
    try {
      setIsLoading(true);
      const fileUrl = await minioService.uploadFile(file);
      updateMessage(messageId, { file, fileUrl });
      toast({
        title: "Sucesso",
        description: "Arquivo enviado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar arquivo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpreadsheetUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast({
        title: "Arquivo carregado",
        description: "Planilha processada com sucesso",
      });
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Telefone,Nome\n+5511999999999,João Silva\n+5511888888888,Maria Santos";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo_contatos_whatsapp.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSendCampaign = async () => {
    if (!selectedInstance || messages.length === 0 || !recipients.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const campaignData = {
        instance: selectedInstance,
        messages: messages,
        recipients: recipients.split('\n').filter(r => r.trim()),
        delay: delay[0],
        notificationPhone
      };

      // Enviar para webhook n8n
      const response = await fetch('https://webhook.novahagencia.com.br/webhook/bb39433b-a53b-484c-8721-f9a66d54f821', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar para webhook');
      }

      // Salvar no NocoDB
      await nocodbService.saveMassMessagingLog(campaignData);

      toast({
        title: "Campanha Iniciada",
        description: "Campanha de disparo em massa foi iniciada",
      });

      // Reset form
      setMessages([{ id: '1', type: 'text', content: '' }]);
      setRecipients('');
      setNotificationPhone('');
    } catch (error) {
      console.error('Erro ao iniciar campanha:', error);
      toast({
        title: "Erro",
        description: "Falha ao iniciar campanha",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Campanha de Disparo em Massa</span>
          </CardTitle>
          <CardDescription>
            Envie mensagens em lote para múltiplos contatos do WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de Instância */}
          <div className="space-y-2">
            <Label htmlFor="instance">Instância WhatsApp</Label>
            <Select value={selectedInstance} onValueChange={setSelectedInstance}>
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

          {/* Configuração de Mensagens */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Mensagens (até 5)</Label>
              {messages.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMessage}
                  className="flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Mensagem</span>
                </Button>
              )}
            </div>

            {messages.map((message, index) => (
              <Card key={message.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Mensagem {index + 1}</Label>
                    {messages.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMessage(message.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo de Mensagem</Label>
                      <Select
                        value={message.type}
                        onValueChange={(value: any) => updateMessage(message.id, { type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Texto</SelectItem>
                          <SelectItem value="audio">Áudio</SelectItem>
                          <SelectItem value="video">Vídeo</SelectItem>
                          <SelectItem value="image">Imagem</SelectItem>
                          <SelectItem value="document">Documento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {message.type !== 'text' && (
                      <div>
                        <Label>Enviar Arquivo</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="file"
                            accept={message.type === 'audio' ? '.mp3,.wav,.ogg' : 
                                   message.type === 'video' ? '.mp4,.avi,.mov' :
                                   message.type === 'image' ? '.jpg,.png,.gif,.jpeg' : 
                                   '.pdf,.doc,.docx,.txt'}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(message.id, file);
                            }}
                            className="flex-1"
                          />
                          <Upload className="w-4 h-4 text-gray-400" />
                        </div>
                        {message.fileUrl && (
                          <p className="text-sm text-green-600 mt-1">Arquivo enviado com sucesso</p>
                        )}
                      </div>
                    )}
                  </div>

                  {message.type === 'text' && (
                    <div>
                      <Label>Conteúdo da Mensagem</Label>
                      <Textarea
                        value={message.content}
                        onChange={(e) => updateMessage(message.id, { content: e.target.value })}
                        placeholder="Digite sua mensagem aqui..."
                        className="min-h-[100px]"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {message.content.length} caracteres
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Destinatários */}
          <div className="space-y-4">
            <Label>Destinatários</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Entrada Manual</Label>
                <Textarea
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder="Digite os números de telefone (um por linha)&#10;+5511999999999&#10;+5511888888888"
                  className="min-h-[120px]"
                />
              </div>
              <div>
                <Label className="text-sm">Enviar Planilha</Label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept=".xlsx,.csv"
                    onChange={handleSpreadsheetUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplate}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Modelo
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Configuração de Delay */}
          <div className="space-y-2">
            <Label>Delay Entre Mensagens: {delay[0]} segundos</Label>
            <Slider
              value={delay}
              onValueChange={setDelay}
              max={60}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Telefone para Notificação */}
          <div className="space-y-2">
            <Label>Telefone para Notificação de Conclusão (opcional)</Label>
            <Input
              value={notificationPhone}
              onChange={(e) => setNotificationPhone(e.target.value)}
              placeholder="+5511999999999"
            />
          </div>

          {/* Botão Enviar */}
          <Button
            onClick={handleSendCampaign}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
          >
            <Send className="w-4 h-4 mr-2" />
            {isLoading ? 'Iniciando Campanha...' : 'Iniciar Campanha'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MassMessaging;
