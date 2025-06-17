
// Core types and interfaces
export * from './types/core';

// Table schemas organized by category
import { MassMessagingLogs } from './types/messagingSchemas';
import { NotificacoesPlataformas, NotificacoesHotmart } from './types/notificationSchemas';
import { WhatsAppContacts, WhatsAppInstances } from './types/whatsappSchemas';
import { DashboardStats } from './types/dashboardSchemas';
import { Usuarios } from './types/userSchemas';

// Export all table schemas in a centralized object for backward compatibility
export const TABLE_SCHEMAS = {
  // Messaging schemas
  MassMessagingLogs,
  
  // Notification schemas  
  NotificacoesPlataformas,
  NotificacoesHotmart,
  
  // WhatsApp schemas
  WhatsAppContacts,
  WhatsAppInstances,
  
  // Dashboard schemas
  DashboardStats,
  
  // User schemas
  Usuarios
};
