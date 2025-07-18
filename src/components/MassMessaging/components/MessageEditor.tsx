
import React, { useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Plus, Trash2, Wand2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { fileUploadService } from '@/services/fileUpload';
import { Message } from '../types';
import { VariableProcessor } from '../utils/variableProcessor';

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
  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});
  const captionRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

  const variables = [
    { name: '{nome}', label: 'Nome' },
    { name: '{telefone}', label: 'Telefone' },
    { name: '{primeiroNome}', label: 'Primeiro Nome' },
    { name: '{dataAtual}', label: 'Data Atual' },
    { name: '{horaAtual}', label: 'Hora Atual' },
    { name: '{diaSemana}', label: 'Dia da Semana' }
  ];

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

  const handleVariableInsert = (messageId: string, variable: string, isCaption = false) => {
    const textarea = isCaption ? captionRefs.current[messageId] : textareaRefs.current[messageId];
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const message = messages.find(msg => msg.id === messageId);
      
      if (message) {
        const currentContent = isCaption ? (message.caption || '') : message.content;
        const newContent = 
          currentContent.substring(0, start) + 
          variable + 
          currentContent.substring(end);
        
        if (isCaption) {
          updateMessage(messageId, { caption: newContent });
        } else {
          updateMessage(messageId, { content: newContent });
        }
        
        // Reposicionar cursor após a variável inserida
        setTimeout(() => {
          if (textarea) {
            textarea.focus();
            textarea.setSelectionRange(start + variable.length, start + variable.length);
          }
        }, 0);
      }
    }

    toast({
      title: "Variável inserida",
      description: `${variable} foi adicionada à ${isCaption ? 'descrição' : 'mensagem'}`,
    });
  };

  const validateMessageVariables = (content: string) => {
    const validation = VariableProcessor.validateMessage(content);
    if (!validation.isValid) {
      toast({
        title: "Variáveis inválidas",
        description: validation.errors.join(', '),
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (messageId: string, file: File) => {
    try {
      setIsLoading(true);
      const fileUrl = await fileUploadService.uploadFile(file);
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
    <div className="space-y-6">
      {/* Editor de Mensagens */}
      <div className="space-y-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
        <div className="flex items-center justify-between">
          <Label className="text-white font-medium text-sm">Mensagens (até 5)</Label>
        </div>

        {messages.map((message, index) => (
          <Card key={message.id} className="p-4 bg-gray-800/50 border-gray-700">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-white font-medium">Mensagem {index + 1}</Label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white font-medium text-sm">Tipo de Mensagem</Label>
                  <Select
                    value={message.type}
                    onValueChange={(value: any) => updateMessage(message.id, { type: value })}
                  >
                    <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-gray-200 focus:border-purple-400">
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
                    <Label className="text-white font-medium text-sm">Enviar Arquivo</Label>
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
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white font-medium text-sm">Conteúdo da Mensagem</Label>
                    <div className="flex flex-wrap gap-2">
                      {variables.map((variable) => (
                        <Button
                          key={variable.name}
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVariableInsert(message.id, variable.name)}
                          className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 text-xs px-2 py-1 h-auto"
                        >
                          <Wand2 className="w-3 h-3 mr-1" />
                          {variable.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    ref={(el) => textareaRefs.current[message.id] = el}
                    value={message.content}
                    onChange={(e) => updateMessage(message.id, { content: e.target.value })}
                    onBlur={() => validateMessageVariables(message.content)}
                    placeholder="Digite sua mensagem aqui... Use variáveis como {nome}, {primeiroNome}, {telefone}, etc."
                    className="min-h-[100px]"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-gray-400">
                      {message.content.length} caracteres
                    </p>
                    {message.content.includes('{') && (
                      <p className="text-xs text-purple-400">
                        ✨ Variáveis detectadas - serão personalizadas para cada contato
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Campo de descrição para arquivos de mídia */}
              {message.type !== 'text' && message.type !== 'audio' && message.fileUrl && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white font-medium text-sm">Descrição do Arquivo (Opcional)</Label>
                    <div className="flex flex-wrap gap-2">
                      {variables.map((variable) => (
                        <Button
                          key={variable.name}
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVariableInsert(message.id, variable.name, true)}
                          className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 text-xs px-2 py-1 h-auto"
                        >
                          <Wand2 className="w-3 h-3 mr-1" />
                          {variable.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    ref={(el) => captionRefs.current[message.id] = el}
                    value={message.caption || ''}
                    onChange={(e) => updateMessage(message.id, { caption: e.target.value })}
                    onBlur={() => message.caption && validateMessageVariables(message.caption)}
                    placeholder="Digite uma descrição para acompanhar o arquivo... Use variáveis como {nome}, {primeiroNome}, {telefone}, etc."
                    className="min-h-[80px]"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-gray-400">
                      {(message.caption || '').length} caracteres
                    </p>
                    {message.caption && message.caption.includes('{') && (
                      <p className="text-xs text-purple-400">
                        ✨ Variáveis detectadas - serão personalizadas para cada contato
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}

        {/* Botão Adicionar Mensagem - Movido para o final e centralizado */}
        {messages.length < 5 && (
          <div className="flex justify-center pt-4 border-t border-gray-600/50">
            <Button
              type="button"
              variant="outline"
              onClick={addMessage}
              className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 px-6 py-3"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Mensagem
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
