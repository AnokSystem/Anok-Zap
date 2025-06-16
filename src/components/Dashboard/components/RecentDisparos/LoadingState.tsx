
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from 'lucide-react';

interface LoadingStateProps {
  showAll: boolean;
}

export const LoadingState = ({ showAll }: LoadingStateProps) => {
  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary-contrast">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          {showAll ? 'Todos os Disparos' : 'Disparos Recentes'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
