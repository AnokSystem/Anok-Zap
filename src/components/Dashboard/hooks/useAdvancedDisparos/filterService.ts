
import { Disparo, DisparoFilters } from './types';

export const applyDisparoFilters = (disparos: Disparo[], filters: DisparoFilters): Disparo[] => {
  let filtered = [...disparos];

  if (filters.dateFrom) {
    filtered = filtered.filter(d => 
      new Date(d.createdAt) >= new Date(filters.dateFrom!)
    );
  }

  if (filters.dateTo) {
    filtered = filtered.filter(d => 
      new Date(d.createdAt) <= new Date(filters.dateTo!)
    );
  }

  if (filters.status) {
    filtered = filtered.filter(d => 
      d.status.toLowerCase().includes(filters.status!.toLowerCase())
    );
  }

  if (filters.instanceId) {
    filtered = filtered.filter(d => 
      d.instanceName.toLowerCase().includes(filters.instanceId!.toLowerCase())
    );
  }

  if (filters.campaignName) {
    filtered = filtered.filter(d => 
      d.campaignName.toLowerCase().includes(filters.campaignName!.toLowerCase())
    );
  }

  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(d => 
      d.campaignName.toLowerCase().includes(searchLower) ||
      d.instanceName.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
};
