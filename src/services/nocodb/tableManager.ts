
import { NocodbConfig, DiscoveredBase } from './types';
import { TableDiscovery } from './tableDiscovery';
import { TableCreation } from './tableCreation';

export class NocodbTableManager {
  private tableDiscovery: TableDiscovery;
  private tableCreation: TableCreation;
  private TARGET_BASE_ID = 'pry2rly2dtgdfo5'; // ID fixo da base "Notificação Inteligente"

  constructor(config: NocodbConfig) {
    this.tableDiscovery = new TableDiscovery(config);
    this.tableCreation = new TableCreation(config);
  }

  async discoverBases() {
    return await this.tableDiscovery.discoverBases();
  }

  async createAllTables() {
    console.log('🏗️ Criando todas as tabelas na base pry2rly2dtgdfo5...');
    return await this.tableCreation.createAllTables(this.TARGET_BASE_ID);
  }

  async ensureTableExists(tableName: string): Promise<boolean> {
    // Primeiro descobre as bases se ainda não foram descobertas
    await this.tableDiscovery.discoverBases();
    
    console.log(`🔧 Garantindo que a tabela ${tableName} existe na base pry2rly2dtgdfo5...`);
    return await this.tableCreation.ensureTableExists(this.TARGET_BASE_ID, tableName);
  }

  getTargetBaseId(): string | null {
    return this.TARGET_BASE_ID;
  }

  getDiscoveredBases(): DiscoveredBase[] {
    return this.tableDiscovery.getDiscoveredBases();
  }
}
