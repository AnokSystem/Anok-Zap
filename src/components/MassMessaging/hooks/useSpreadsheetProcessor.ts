
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

export const useSpreadsheetProcessor = () => {
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const processSpreadsheet = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n');
          const contacts: string[] = [];
          
          // Pular o cabeçalho (primeira linha)
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Detectar separador (vírgula, ponto e vírgula ou tab)
            let columns: string[];
            if (line.includes('\t')) {
              // Arquivo separado por tab (Excel)
              columns = line.split('\t');
            } else if (line.includes(';')) {
              // Arquivo CSV separado por ponto e vírgula
              columns = line.split(';');
            } else {
              // Arquivo CSV separado por vírgula
              columns = line.split(',');
            }
            
            if (columns.length >= 2) {
              // NOVO PADRÃO: Primeira coluna: Nome, Segunda coluna: Telefone
              let name = columns[0].trim();
              let phone = columns[1].trim();
              
              // Remover aspas se existirem
              name = name.replace(/^["']|["']$/g, '');
              phone = phone.replace(/^["']|["']$/g, '');
              
              // Verificar se parece com um número de telefone
              if (phone && (phone.includes('+') || phone.match(/^\d+$/))) {
                // Adicionar + se não tiver
                if (!phone.startsWith('+') && phone.match(/^\d+$/)) {
                  phone = '+' + phone;
                }
                
                // Formatar como "telefone - nome" ou apenas telefone se não tiver nome
                const contactEntry = name ? `${phone} - ${name}` : phone;
                contacts.push(contactEntry);
              }
            }
          }
          
          resolve(contacts);
        } catch (error) {
          console.error('Erro ao processar planilha:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  };

  const handleSpreadsheetUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    recipients: string,
    setRecipients: (value: string) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsLoading(true);
        setUploadedFile(file);
        
        console.log('Processando planilha:', file.name);
        const extractedContacts = await processSpreadsheet(file);
        
        console.log('Contatos extraídos:', extractedContacts);
        
        if (extractedContacts.length > 0) {
          // Adicionar os contatos à entrada manual
          const currentRecipients = recipients.trim();
          const newRecipients = currentRecipients 
            ? currentRecipients + '\n' + extractedContacts.join('\n')
            : extractedContacts.join('\n');
          
          setRecipients(newRecipients);
          
          toast({
            title: "Planilha processada com sucesso",
            description: `${extractedContacts.length} contatos foram adicionados à entrada manual`,
          });
        } else {
          toast({
            title: "Nenhum contato encontrado",
            description: "Verifique se a planilha possui nome na 1ª coluna e telefone na 2ª coluna",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Erro ao processar planilha:', error);
        toast({
          title: "Erro ao processar planilha",
          description: "Verifique se o arquivo está no formato correto (CSV) com 2 colunas: Nome, Telefone",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const downloadTemplate = () => {
    // Modelo padronizado: Nome, Telefone
    const csvContent = "Nome,Telefone\nJoão Silva,+5511999999999\nMaria Santos,+5511888888888";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo_contatos_whatsapp.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return {
    uploadedFile,
    isLoading,
    handleSpreadsheetUpload,
    downloadTemplate,
  };
};
