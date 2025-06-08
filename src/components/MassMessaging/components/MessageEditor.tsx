
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Plus, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { minioService } from '@/services/minio';
import { Message } from '../types';

interface MessageEditorProps {
  messages: Message[];
  onMessagesChange: (messages: Message[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const MessageEditor: React.FC<MessageEditorProps> = ({
  messages,
  onMessagesChange,
  isLoading,
  setIsLoading,
}) => {
  const { toast } = useToast();

  const addMessage = () => {
    if (messages.length < 5) {
      onMessagesChange([...messages, {
        id: Date.now().toString(),
        type: 'text',
        content: ''
      }]);
    }
  };

  const removeMessage = (id: string) => {
    if (messages.length > 1) {
      onMessagesChange(messages.filter(msg => msg.id !== id));
    }
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    onMessagesChange(messages.map(msg => 
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

  return (
    <div className="space-y-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
      <div className="flex items-center justify-between">
        <Label className="text-purple-300 font-medium text-sm">Mensagens (até 5)</Label>
        {messages.length < 5 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMessage}
            className="flex items-center space-x-1 bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Mensagem</span>
          </Button>
        )}
      </div>

      {messages.map((message, index) => (
        <Card key={message.id} className="p-4 bg-gray-800/50 border-gray-700">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-purple-300 font-medium">Mensagem {index + 1}</Label>
              {messages.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMessage(message.id)}
                  className="text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-purple-300 font-medium text-sm">Tipo de Mensagem</Label>
                <Select
                  value={message.type}
                  onValueChange={(value: any) => updateMessage(message.id, { type: value })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-200 focus:border-purple-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="text" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Texto</SelectItem>
                    <SelectItem value="audio" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Áudio</SelectItem>
                    <SelectItem value="video" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Vídeo</SelectItem>
                    <SelectItem value="image" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Imagem</SelectItem>
                    <SelectItem value="document" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Documento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {message.type !== 'text' && (
                <div>
                  <Label className="text-purple-300 font-medium text-sm">Enviar Arquivo</Label>
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
                      className="flex-1 bg-gray-700 border-gray-600 text-gray-200 focus:border-purple-400"
                    />
                    <Upload className="w-4 h-4 text-purple-400" />
                  </div>
                  {message.fileUrl && (
                    <p className="text-sm text-purple-400 mt-1">Arquivo enviado com sucesso</p>
                  )}
                </div>
              )}
            </div>

            {message.type === 'text' && (
              <div>
                <Label className="text-purple-300 font-medium text-sm">Conteúdo da Mensagem</Label>
                <Textarea
                  value={message.content}
                  onChange={(e) => updateMessage(message.id, { content: e.target.value })}
                  placeholder="Digite sua mensagem aqui..."
                  className="min-h-[100px] bg-gray-700 border-gray-600 text-gray-200 focus:border-purple-400"
                />
                <p className="text-sm text-gray-400 mt-1">
                  {message.content.length} caracteres
                </p>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
