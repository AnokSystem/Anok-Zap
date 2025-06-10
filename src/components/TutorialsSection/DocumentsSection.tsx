
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Download } from 'lucide-react';

interface DocumentsSectionProps {
  documentUrls: string[];
}

const DocumentsSection = ({ documentUrls }: DocumentsSectionProps) => {
  const handleDownloadDocument = (docUrl: string, index: number) => {
    window.open(docUrl, '_blank');
  };

  if (documentUrls.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <FileText className="w-5 h-5 text-green-400" />
        <h3 className="font-semibold text-gray-200">Documentos Complementares</h3>
      </div>
      
      <div className="space-y-2">
        {documentUrls.map((docUrl, index) => (
          <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-200 font-medium">
                    Documento {index + 1}
                  </p>
                  <p className="text-xs text-gray-400">
                    Material complementar
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => handleDownloadDocument(docUrl, index)}
                variant="outline"
                size="sm"
                className="border-gray-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentsSection;
