
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  switch (status) {
    case 'concluido':
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Concluído</Badge>;
    case 'enviando':
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Enviando</Badge>;
    case 'enviado':
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Enviado</Badge>;
    case 'pendente':
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendente</Badge>;
    case 'erro':
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Erro</Badge>;
    case 'cancelado':
      return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Cancelado</Badge>;
    default:
      return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Desconhecido</Badge>;
  }
};
