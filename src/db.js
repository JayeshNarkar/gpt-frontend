import Dexie from 'dexie';

export const db = new Dexie('myDatabase');
db.version(1).stores({
  gpt_db: '++id, prompt, response' // Primary key and indexed props
});