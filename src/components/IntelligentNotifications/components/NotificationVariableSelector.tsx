
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface NotificationVariableSelectorProps {
  onVariableInsert: (variable: string) => void;
}

export const NotificationVariableSelector: React.FC<NotificationVariableSelectorProps> = ({
  onVariableInsert,
}) => {
  const { toast } = useToast();

  const variables = [
    {
      name: 'Nome',
      variable: "{{ $('Dados do Lead1').item.json.Nome }}",
      description: 'Nome do cliente/lead'
    },
    {
      name: 'Nome Completo',
      variable: "{{ $('Dados do Lead1').item.json.Sobrenome }}",
      description: 'Nome completo do cliente/lead'
    },
    {
      name: 'CPF',
      variable: "{{ $('Dados do Lead1').item.json.CPF }}",
      description: 'CPF do cliente'
    },
    {
      name: 'Email',
      variable: "{{ $('Dados do Lead1').item.json.Email }}",
      description: 'Email do cliente'
    },
    {
      name: 'Telefone',
      variable: "{{ $('Dados do Lead1').item.json.Telefone }}",
      description: 'Telefone do cliente'
    },
    {
      name: 'Nome do Produto',
      variable: "{{ $('Dados do Lead1').item.json['Nome Produto'] }}",
      description: 'Nome do produto adquirido'
    }
  ];

  const handleVariableClick = (variable: string) => {
    onVariableInsert(variable);
    toast({
      title: "Variável inserida",
      description: "Variável adicionada à mensagem",
    });
  };

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable);
    toast({
      title: "Copiado",
      description: "Variável copiada para a área de transferência",
    });
  };

  return (
    <Card className="p-4 bg-gray-800/50 border-gray-700">
      <div className="flex items-center space-x-2 mb-4">
        <Info className="w-4 h-4 text-purple-400" />
        <h4 className="font-medium text-white">Variáveis do Hotmart</h4>
      </div>
      
      <p className="text-sm text-gray-400 mb-4">
        Clique em uma variável para inserir na mensagem atual:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {variables.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600/50 hover:border-purple-400/50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-purple-400 font-medium text-sm">
                  {item.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => copyVariable(item.variable)}
                  className="p-1 h-auto text-gray-400 hover:text-gray-200"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {item.description}
              </p>
              <code className="text-xs text-gray-500 mt-0.5 block break-all">
                {item.variable}
              </code>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleVariableClick(item.variable)}
              className="ml-3 bg-purple-600/20 border-purple-400/30 text-purple-300 hover:bg-purple-600/30"
            >
              Inserir
            </Button>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-400/30 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong>Dica:</strong> Essas variáveis serão substituídas pelos dados reais do Hotmart quando as notificações forem enviadas.
        </p>
      </div>
    </Card>
  );
};
