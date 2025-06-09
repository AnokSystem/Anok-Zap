
import { NocodbConfig, DiscoveredBase } from './types';
import { TableDiscovery } from './tableDiscovery';
import { TableCreation } from './tableCreation';

export class NocodbTableManager {
  private tableDiscovery: TableDiscovery;
  private tableCreation: TableCreation;

  constructor(config: NocodbConfig) {
    this.tableDiscovery = new TableDiscovery(config);
    this.tableCreation = new TableCreation(config);
  }

  async discoverBases() {
    return await this.tableDiscovery.discoverBases();
  }

  async createAllTables() {
    const targetBaseId = this.tableDiscovery.getTargetBaseId();
    return await this.tableCreation.createAllTables(targetBaseId);
  }

  async ensureTableExists(tableName: string): Promise<boolean> {
    // Primeiro descobre as bases se ainda não foram descobertas
    if (!this.tableDiscovery.getTargetBaseId()) {
      await this.tableDiscovery.discoverBases();
    }
    
    const targetBaseId = this.tableDiscovery.getTargetBaseId();
    return await this.tableCreation.ensureTableExists(targetBaseId, tableName);
  }

  getTargetBaseId(): string | null {
    return this.tableDiscovery.getTargetBaseId();
  }

  getDiscoveredBases(): DiscoveredBase[] {
    return this.tableDiscovery.getDiscoveredBases();
  }
}
