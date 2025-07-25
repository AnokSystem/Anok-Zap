

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Upload, Clock } from 'lucide-react';
import { Message } from './types';
import { NotificationVariableSelector } from './components/NotificationVariableSelector';

interface MessageEditorProps {
  messages: Message[];
  onAddMessage: () => void;
  onRemoveMessage: (messageId: string) => void;
  onUpdateMessage: (messageId: string, updates: Partial<Message>) => void;
  onFileUpload: (messageId: string, file: File) => void;
}

export const MessageEditor: React.FC<MessageEditorProps> = ({
  messages,
  onAddMessage,
  onRemoveMessage,
  onUpdateMessage,
  onFileUpload
}) => {
  const [currentEditingMessageId, setCurrentEditingMessageId] = useState<string>('');
  const [variablesMapping, setVariablesMapping] = useState<{[messageId: string]: {[displayText: string]: string}}>({});

  const variableMap: {[key: string]: string} = {
    'Nome': "{{ $('Dados do Lead1').item.json.Nome }}",
    'Sobrenome': "{{ $('Dados do Lead1').item.json.Sobrenome }}",
    'CPF': "{{ $('Dados do Lead1').item.json.CPF }}",
    'Email': "{{ $('Dados do Lead1').item.json.Email }}",
    'Telefone': "{{ $('Dados do Lead1').item.json.Telefone }}",
    'Nome do Produto': "{{ $('Dados do Lead1').item.json['Nome Produto'] }}"
  };

  const handleVariableInsert = (displayText: string, variableCode: string) => {
    if (currentEditingMessageId) {
      const currentMessage = messages.find(msg => msg.id === currentEditingMessageId);
      if (currentMessage) {
        const currentContent = currentMessage.content || '';
        // Inserir a variável com formato visual {{ displayText }}
        const formattedVariable = `{{ ${displayText} }}`;
        const newContent = currentContent + formattedVariable;
        
        // Atualizar o mapeamento de variáveis para esta mensagem
        setVariablesMapping(prev => ({
          ...prev,
          [currentEditingMessageId]: {
            ...prev[currentEditingMessageId],
            [formattedVariable]: variableCode
          }
        }));
        
        onUpdateMessage(currentEditingMessageId, { content: newContent });
      }
    }
  };

  const handleTextareaFocus = (messageId: string) => {
    setCurrentEditingMessageId(messageId);
  };

  const handleContentChange = (messageId: string, newContent: string) => {
    // Quando o conteúdo mudar, verificar se alguma variável foi removida
    const mapping = variablesMapping[messageId] || {};
    const usedVariables = Object.keys(mapping).filter(varName => 
      newContent.includes(varName)
    );
    
    // Atualizar o mapeamento apenas com as variáveis ainda presentes
    const updatedMapping = usedVariables.reduce((acc, varName) => {
      acc[varName] = mapping[varName];
      return acc;
    }, {} as {[key: string]: string});
    
    setVariablesMapping(prev => ({
      ...prev,
      [messageId]: updatedMapping
    }));
    
    onUpdateMessage(messageId, { content: newContent });
  };

  // Função para converter o conteúdo com nomes amigáveis para variáveis completas
  const convertToVariableCode = (messageId: string, content: string) => {
    let convertedContent = content;
    const mapping = variablesMapping[messageId] || {};
    
    // Substituir cada nome amigável pela variável completa
    Object.entries(mapping).forEach(([displayText, variableCode]) => {
      convertedContent = convertedContent.replace(new RegExp(displayText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), variableCode);
    });
    
    return convertedContent;
  };

  // Atualizar as mensagens quando elas mudarem para incluir as variáveis convertidas
  React.useEffect(() => {
    messages.forEach(message => {
      if (message.content && variablesMapping[message.id]) {
        const convertedContent = convertToVariableCode(message.id, message.content);
        if (convertedContent !== message.content) {
          // Armazenar a versão convertida no campo convertedContent
          onUpdateMessage(message.id, { 
            convertedContent 
          });
        }
      }
    });
  }, [variablesMapping, messages]);

  return (
    <div className="space-y-4">
      <Label className="text-gray-200 font-medium text-sm">Mensagens (até 5)</Label>

      {messages.map((message, index) => (
        <div key={message.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-gray-200 font-medium">Mensagem {index + 1}</Label>
              {messages.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveMessage(message.id)}
                  className="text-gray-400 hover:text-gray-200 hover:bg-gray-600/50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-1">
                <Label className="text-gray-200 font-medium text-sm">Tipo</Label>
                <Select
                  value={message.type}
                  onValueChange={(value: any) => onUpdateMessage(message.id, { type: value })}
                >
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 focus:border-purple-accent h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="text" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Texto</SelectItem>
                    <SelectItem value="image" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Imagem</SelectItem>
                    <SelectItem value="video" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Vídeo</SelectItem>
                    <SelectItem value="audio" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Áudio</SelectItem>
                    <SelectItem value="document" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Documento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-200 font-medium text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Delay (seg)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={message.delay}
                  onChange={(e) => onUpdateMessage(message.id, { delay: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="input-form h-10 w-20"
                />
              </div>

              {message.type !== 'text' && (
                <div className="md:col-span-2">
                  <Label className="text-gray-200 font-medium text-sm">Arquivo</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      accept={message.type === 'audio' ? '.mp3,.wav,.ogg' : 
                             message.type === 'video' ? '.mp4,.avi,.mov' :
                             message.type === 'image' ? '.jpg,.png,.gif,.jpeg' : 
                             '.pdf,.doc,.docx,.txt'}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onFileUpload(message.id, file);
                      }}
                      className="input-form h-10"
                    />
                    <Upload className="w-4 h-4 text-gray-200" />
                  </div>
                  {message.fileUrl && (
                    <p className="text-sm text-gray-200 mt-1">✓ Arquivo enviado</p>
                  )}
                </div>
              )}
            </div>

            {message.type === 'text' && (
              <div>
                <Label className="text-gray-200 font-medium text-sm">Conteúdo</Label>
                
                {/* Seletor de variáveis acima do campo de texto */}
                {currentEditingMessageId === message.id && (
                  <div className="mb-3">
                    <NotificationVariableSelector onVariableInsert={handleVariableInsert} />
                  </div>
                )}
                
                <Textarea
                  value={message.content}
                  onChange={(e) => handleContentChange(message.id, e.target.value)}
                  onFocus={() => handleTextareaFocus(message.id)}
                  placeholder="Digite sua mensagem..."
                  className="min-h-[100px] input-form"
                />
              </div>
            )}

            {(message.type === 'image' || message.type === 'video' || message.type === 'document') && message.fileUrl && (
              <div>
                <Label className="text-gray-200 font-medium text-sm">Descrição (opcional)</Label>
                
                {/* Seletor de variáveis acima do campo de descrição */}
                {currentEditingMessageId === message.id && (
                  <div className="mb-3">
                    <NotificationVariableSelector onVariableInsert={handleVariableInsert} />
                  </div>
                )}
                
                <Textarea
                  value={message.content || ''}
                  onChange={(e) => handleContentChange(message.id, e.target.value)}
                  onFocus={() => handleTextareaFocus(message.id)}
                  placeholder="Digite uma descrição para o arquivo..."
                  className="min-h-[100px] input-form"
                />
              </div>
            )}
          </div>
        </div>
      ))}

      {messages.length < 5 && (
        <div className="flex justify-center pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddMessage}
            className="bg-gray-700/50 border-gray-600 text-gray-200 hover:bg-gray-600/50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Mensagem
          </Button>
        </div>
      )}
    </div>
  );
};

