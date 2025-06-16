
import { Button } from "@/components/ui/button";
import { MessageSquare } from 'lucide-react';

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export const EmptyState = ({ hasFilters, onClearFilters }: EmptyStateProps) => {
  return (
    <div className="text-center py-8">
      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-400">
        {hasFilters ? 'Nenhum disparo encontrado com os filtros aplicados' : 'Nenhum disparo encontrado'}
      </p>
      {hasFilters && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="mt-4 border-gray-600 hover:border-gray-500"
        >
          Limpar Filtros
        </Button>
      )}
    </div>
  );
};
