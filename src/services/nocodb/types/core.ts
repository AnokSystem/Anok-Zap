
export interface NocodbConfig {
  baseUrl: string;
  apiToken: string;
}

export interface DiscoveredBase {
  id: string;
  name: string;
  title: string;
}

export interface ConnectionTestResult {
  success: boolean;
  bases?: DiscoveredBase[];
  targetBase?: string | null;
  tablesVerified?: boolean;
  error?: string;
}

export interface TableSchema {
  table_name: string;
  title: string;
  columns: ColumnSchema[];
}

export interface ColumnSchema {
  column_name: string;
  title: string;
  uidt: string;
  pk?: boolean;
  ai?: boolean;
  rqd?: boolean;
  default?: string | number | boolean;
  dtxp?: string;
}
