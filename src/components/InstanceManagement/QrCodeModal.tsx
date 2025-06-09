
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, RefreshCw } from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: string;
}

const QrCodeModal = ({ isOpen, onClose, qrCode }: QrCodeModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-primary-contrast flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code para Conectar
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-white p-4 rounded-lg">
            <img 
              src={qrCode} 
              alt="QR Code" 
              className="w-64 h-64"
            />
          </div>
          <div className="text-center space-y-2">
            <p className="text-gray-400 text-sm">
              Escaneie este QR code com o WhatsApp no seu celular para conectar a instância
            </p>
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Aguardando conexão...</span>
            </div>
          </div>
          <Button 
            onClick={onClose}
            className="w-full"
            variant="outline"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QrCodeModal;
