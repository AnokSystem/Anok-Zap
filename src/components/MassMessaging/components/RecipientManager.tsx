
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download } from 'lucide-react';
import { useSpreadsheetProcessor } from '../hooks/useSpreadsheetProcessor';

interface RecipientManagerProps {
  recipients: string;
  onRecipientsChange: (recipients: string) => void;
}

export const RecipientManager: React.FC<RecipientManagerProps> = ({
  recipients,
  onRecipientsChange,
}) => {
  const { uploadedFile, isLoading, handleSpreadsheetUpload, downloadTemplate } = useSpreadsheetProcessor();

  return (
    <div className="space-y-4">
      <Label>Destinatários</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm">Entrada Manual</Label>
          <Textarea
            value={recipients}
            onChange={(e) => onRecipientsChange(e.target.value)}
            placeholder="Digite os contatos (um por linha)&#10;+5511999999999 - João Silva&#10;+5511888888888 - Maria Santos"
            className="min-h-[120px]"
          />
          <p className="text-sm text-gray-500 mt-1">
            {recipients.split('\n').filter(r => r.trim()).length} contatos
          </p>
        </div>
        <div>
          <Label className="text-sm">Enviar Planilha (CSV)</Label>
          <div className="space-y-2">
            <Input
              type="file"
              accept=".xlsx,.csv"
              onChange={(e) => handleSpreadsheetUpload(e, recipients, onRecipientsChange)}
              disabled={isLoading}
            />
            {uploadedFile && (
              <p className="text-sm text-green-600">
                📄 {uploadedFile.name} processado
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Modelo (Nome, Telefone)
            </Button>
            <p className="text-xs text-gray-500">
              Formato padrão: Nome, Telefone (uma linha por contato)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
