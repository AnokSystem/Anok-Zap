
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Contatos Encontrados ({contacts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                {contactType === 'groups' && <TableHead>Grupo</TableHead>}
                {contactType === 'groups' && <TableHead>Tipo</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.phoneNumber}</TableCell>
                  {contactType === 'groups' && (
                    <TableCell>{contact.groupName || 'N/A'}</TableCell>
                  )}
                  {contactType === 'groups' && (
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {contact.isAdmin ? (
                          <>
                            <Crown className="w-4 h-4 text-yellow-500" />
                            <span>Admin</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 text-blue-500" />
                            <span>Membro</span>
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
