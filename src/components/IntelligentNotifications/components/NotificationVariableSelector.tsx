
import React from 'react';
import { Button } from "@/components/ui/button";
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
    },
    {
      name: 'Nome Completo',
      variable: "{{ $('Dados do Lead1').item.json.Sobrenome }}",
    },
    {
      name: 'CPF',
      variable: "{{ $('Dados do Lead1').item.json.CPF }}",
    },
    {
      name: 'Email',
      variable: "{{ $('Dados do Lead1').item.json.Email }}",
    },
    {
      name: 'Telefone',
      variable: "{{ $('Dados do Lead1').item.json.Telefone }}",
    },
    {
      name: 'Nome do Produto',
      variable: "{{ $('Dados do Lead1').item.json['Nome Produto'] }}",
    }
  ];

  const handleVariableClick = (variable: string) => {
    onVariableInsert(variable);
    toast({
      title: "Variável inserida",
      description: "Variável adicionada à mensagem",
    });
  };

  return (
    <div className="p-3 bg-gray-800/30 border border-gray-600/50 rounded-lg">
      <p className="text-xs text-gray-400 mb-2">
        Clique em uma variável para inserir:
      </p>
      
      <div className="flex flex-wrap gap-2">
        {variables.map((item) => (
          <Button
            key={item.name}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleVariableClick(item.variable)}
            className="h-7 px-3 text-xs bg-purple-600/20 border-purple-400/30 text-purple-300 hover:bg-purple-600/30"
          >
            {item.name}
          </Button>
        ))}
      </div>
    </div>
  );
};
