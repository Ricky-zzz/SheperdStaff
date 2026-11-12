/** A `.sqlite` backup file stored on this device. */
export interface BackupEntry {
  uri: string;
  name: string;
  size: number;
  /** Epoch ms of the last write. */
  createdAt: number;
}

/** What a restore brought back, used for the confirmation message. */
export interface RestoreSummary {
  livestock: number;
  expenses: number;
  income: number;
  inventoryItems: number;
  /** Whether the backup carried a profile (and therefore a lock password). */
  hasProfile: boolean;
}

/** Result of exporting a readable JSON copy of the data (not for restoring). */
export interface ExportResult {
  uri: string;
  name: string;
  size: number;
  records: number;
}
