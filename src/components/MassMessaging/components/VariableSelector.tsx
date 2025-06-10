
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface VariableSelectorProps {
  onVariableInsert: (variable: string) => void;
}

export const VariableSelector: React.FC<VariableSelectorProps> = ({
  onVariableInsert,
}) => {
  const { toast } = useToast();

  const variables = [
    {
      name: '{nome}',
      description: 'Nome do contato',
      example: 'João Silva'
    },
    {
      name: '{telefone}',
      description: 'Número do telefone',
      example: '5511999999999'
    },
    {
      name: '{primeiroNome}',
      description: 'Primeiro nome apenas',
      example: 'João'
    },
    {
      name: '{dataAtual}',
      description: 'Data atual (DD/MM/AAAA)',
      example: '10/06/2025'
    },
    {
      name: '{horaAtual}',
      description: 'Hora atual (HH:MM)',
      example: '14:30'
    },
    {
      name: '{diaSemana}',
      description: 'Dia da semana',
      example: 'Segunda-feira'
    }
  ];

  const handleVariableClick = (variable: string) => {
    onVariableInsert(variable);
    toast({
      title: "Variável inserida",
      description: `${variable} foi adicionada à mensagem`,
    });
  };

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable);
    toast({
      title: "Copiado",
      description: `${variable} copiado para a área de transferência`,
    });
  };

  return (
    <Card className="p-4 bg-gray-800/50 border-gray-700">
      <div className="flex items-center space-x-2 mb-4">
        <Info className="w-4 h-4 text-purple-400" />
        <h4 className="font-medium text-white">Variáveis Disponíveis</h4>
      </div>
      
      <p className="text-sm text-gray-400 mb-4">
        Clique em uma variável para inserir na mensagem atual:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {variables.map((variable) => (
          <div
            key={variable.name}
            className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600/50 hover:border-purple-400/50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <code className="text-purple-400 font-mono text-sm bg-gray-900/50 px-2 py-1 rounded">
                  {variable.name}
                </code>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => copyVariable(variable.name)}
                  className="p-1 h-auto text-gray-400 hover:text-gray-200"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {variable.description}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Ex: {variable.example}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleVariableClick(variable.name)}
              className="ml-3 bg-purple-600/20 border-purple-400/30 text-purple-300 hover:bg-purple-600/30"
            >
              Inserir
            </Button>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-400/30 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong>Dica:</strong> As variáveis serão substituídas automaticamente pelos dados reais de cada contato no momento do envio.
        </p>
      </div>
    </Card>
  );
};
