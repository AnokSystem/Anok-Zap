
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X } from 'lucide-react';

interface DocumentUploadSectionProps {
  documentFiles: File[];
  onDocumentFilesChange: (files: File[]) => void;
  formatFileSize: (bytes: number) => string;
}

const DocumentUploadSection = ({ documentFiles, onDocumentFilesChange, formatFileSize }: DocumentUploadSectionProps) => {
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validar cada arquivo (10MB por documento)
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`O documento ${file.name} deve ter no máximo 10MB`);
        return false;
      }
      return true;
    });
    
    onDocumentFilesChange([...documentFiles, ...validFiles]);
  };

  const removeDocument = (index: number) => {
    onDocumentFilesChange(documentFiles.filter((_, i) => i !== index));
  };

  const triggerDocumentUpload = () => {
    const input = document.getElementById('document-upload') as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-gray-300">Documentos (Opcional) - Máximo 10MB cada</Label>
      
      {documentFiles.length > 0 && (
        <div className="space-y-2">
          {documentFiles.map((file, index) => (
            <div key={index} className="bg-gray-800/50 p-3 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-green-400" />
                  <div>
                    <p className="text-gray-200 text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-400 mb-2">Adicione documentos complementares</p>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          multiple
          onChange={handleDocumentChange}
          style={{ display: 'none' }}
          id="document-upload"
        />
        <Button 
          type="button" 
          variant="outline" 
          className="border-gray-600"
          onClick={triggerDocumentUpload}
        >
          <Upload className="w-4 h-4 mr-2" />
          Selecionar Documentos
        </Button>
      </div>
    </div>
  );
};

export default DocumentUploadSection;
