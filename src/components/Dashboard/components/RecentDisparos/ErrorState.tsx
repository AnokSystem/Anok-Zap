
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, XCircle } from 'lucide-react';

interface ErrorStateProps {
  showAll: boolean;
  onRetry: () => void;
}

export const ErrorState = ({ showAll, onRetry }: ErrorStateProps) => {
  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary-contrast">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          {showAll ? 'Todos os Disparos' : 'Disparos Recentes'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-400">Erro ao carregar disparos</p>
          <Button
            variant="outline"
            onClick={onRetry}
            className="mt-4 border-gray-600 hover:border-gray-500"
          >
            Tentar Novamente
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
