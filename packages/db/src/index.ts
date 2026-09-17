export type DatabaseConfig = {
  url: string;
  maxConnections: number;
};

export const defaultDatabaseConfig: DatabaseConfig = {
  url: '',
  maxConnections: 10,
};

export function createDatabaseConfig(overrides: Partial<DatabaseConfig> = {}): DatabaseConfig {
  return { ...defaultDatabaseConfig, ...overrides };
}
