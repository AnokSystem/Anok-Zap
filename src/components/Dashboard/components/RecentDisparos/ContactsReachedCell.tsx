
import { Badge } from "@/components/ui/badge";
import { getContactsReached, getProgressPercentage } from './utils';

interface ContactsReachedCellProps {
  disparo: any;
}

export const ContactsReachedCell = ({ disparo }: ContactsReachedCellProps) => {
  const contactsReached = getContactsReached(disparo);
  const progressPercentage = getProgressPercentage(disparo);

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-green-400">
        {contactsReached}/{disparo.recipientCount}
      </span>
      <Badge 
        variant="outline" 
        className={`text-xs ${
          progressPercentage === 100 
            ? 'border-green-500/30 text-green-400' 
            : progressPercentage > 0 
              ? 'border-blue-500/30 text-blue-400'
              : 'border-gray-500/30 text-gray-400'
        }`}
      >
        {progressPercentage}%
      </Badge>
    </div>
  );
};
