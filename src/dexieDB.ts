// dexieDB.ts
import Dexie, { type Table } from 'dexie';

class wordStake extends Dexie {
  cached_data!: Table<any[], string>;

  constructor() {
    super('wordStake');
    this.version(1).stores({
        cached_data: '' // No index needed for key-value
    });
  }
}

export const db = new wordStake();
