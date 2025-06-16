
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DisparoTableRow } from './DisparoTableRow';

interface DisparosTableProps {
  disparos: any[];
}

export const DisparosTable = ({ disparos }: DisparosTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700">
            <TableHead className="text-gray-300">Campanha</TableHead>
            <TableHead className="text-gray-300">Instância</TableHead>
            <TableHead className="text-gray-300">Destinatários</TableHead>
            <TableHead className="text-gray-300">Contatos Alcançados</TableHead>
            <TableHead className="text-gray-300">Progresso</TableHead>
            <TableHead className="text-gray-300">Status</TableHead>
            <TableHead className="text-gray-300">Data</TableHead>
            <TableHead className="text-gray-300">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {disparos.map((disparo) => (
            <DisparoTableRow key={disparo.id} disparo={disparo} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
