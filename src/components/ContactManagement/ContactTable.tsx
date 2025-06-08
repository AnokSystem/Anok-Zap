
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Crown, UserCheck } from 'lucide-react';
import { Contact, ContactType } from './types';

interface ContactTableProps {
  contacts: Contact[];
  contactType: ContactType;
}

const ContactTable: React.FC<ContactTableProps> = ({ contacts, contactType }) => {
  if (contacts.length === 0) return null;

  return (
    <Card className="bg-transparent border-0">
      <CardHeader>
        <CardTitle className="text-lg text-primary-contrast">
          Contatos Encontrados ({contacts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700/50">
                <TableHead className="text-gray-300">Nome</TableHead>
                <TableHead className="text-gray-300">Telefone</TableHead>
                {contactType === 'groups' && <TableHead className="text-gray-300">Grupo</TableHead>}
                {contactType === 'groups' && <TableHead className="text-gray-300">Tipo</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id} className="border-gray-700/50 hover:bg-gray-700/30">
                  <TableCell className="font-medium text-gray-200">{contact.name}</TableCell>
                  <TableCell className="text-gray-300">{contact.phoneNumber}</TableCell>
                  {contactType === 'groups' && (
                    <TableCell className="text-gray-300">{contact.groupName || 'N/A'}</TableCell>
                  )}
                  {contactType === 'groups' && (
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {contact.isAdmin ? (
                          <>
                            <Crown className="w-4 h-4 text-purple-accent" />
                            <span className="text-gray-300">Admin</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 text-purple-accent" />
                            <span className="text-gray-300">Membro</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactTable;
