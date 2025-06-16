
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Eye, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatusIcon } from './StatusIcon';
import { StatusBadge } from './StatusBadge';
import { ContactsReachedCell } from './ContactsReachedCell';
import { ProgressBar } from './ProgressBar';
import { getProgressPercentage } from './utils';

interface DisparoTableRowProps {
  disparo: any;
}

export const DisparoTableRow = ({ disparo }: DisparoTableRowProps) => {
  const progressPercentage = getProgressPercentage(disparo);

  return (
    <TableRow className="border-gray-700 hover:bg-gray-800/50">
      <TableCell>
        <div className="flex items-center gap-2">
          <StatusIcon status={disparo.status} />
          <span className="font-medium text-primary-contrast">
            {disparo.campaignName}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-gray-300">
        {disparo.instanceName}
      </TableCell>
      <TableCell className="text-gray-300">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-blue-400" />
          {disparo.recipientCount} contatos
        </div>
      </TableCell>
      <TableCell className="text-gray-300">
        <ContactsReachedCell disparo={disparo} />
      </TableCell>
      <TableCell>
        <ProgressBar progressPercentage={progressPercentage} />
      </TableCell>
      <TableCell>
        <StatusBadge status={disparo.status} />
      </TableCell>
      <TableCell className="text-gray-300">
        {format(new Date(disparo.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-primary-contrast"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
