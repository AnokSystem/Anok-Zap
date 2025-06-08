
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
    <div className="space-y-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
      <Label className="text-purple-300 font-medium text-sm">Destinatários</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="text-purple-300 font-medium text-sm">Entrada Manual</Label>
          <Textarea
            value={recipients}
            onChange={(e) => onRecipientsChange(e.target.value)}
            placeholder="Digite os contatos (um por linha)&#10;+5511999999999 - João Silva&#10;+5511888888888 - Maria Santos"
            className="min-h-[120px] bg-gray-700 border-gray-600 text-gray-200 focus:border-purple-400"
          />
          <p className="text-sm text-gray-400">
            {recipients.split('\n').filter(r => r.trim()).length} contatos
          </p>
        </div>
        <div className="space-y-3">
          <Label className="text-purple-300 font-medium text-sm">Enviar Planilha (CSV)</Label>
          <div className="space-y-3">
            <Input
              type="file"
              accept=".xlsx,.csv"
              onChange={(e) => handleSpreadsheetUpload(e, recipients, onRecipientsChange)}
              disabled={isLoading}
              className="bg-gray-700 border-gray-600 text-gray-200 focus:border-purple-400"
            />
            {uploadedFile && (
              <p className="text-sm text-purple-400">
                📄 {uploadedFile.name} processado
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="w-full bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Modelo (Nome, Telefone)
            </Button>
            <p className="text-xs text-gray-400">
              Formato padrão: Nome, Telefone (uma linha por contato)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
