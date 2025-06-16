
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

interface StatusIconProps {
  status: string;
}

export const StatusIcon = ({ status }: StatusIconProps) => {
  switch (status) {
    case 'concluido':
    case 'enviado':
      return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    case 'enviando':
      return <Clock className="w-4 h-4 text-blue-400" />;
    case 'pendente':
      return <Clock className="w-4 h-4 text-yellow-400" />;
    case 'erro':
      return <XCircle className="w-4 h-4 text-red-400" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-400" />;
  }
};
