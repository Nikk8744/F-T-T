import { defineConfig  } from 'kysely-ctl';
import { dialect } from './src/config/db'


export default defineConfig({
    dialect,
    migrations: {
        migrationFolder: './src/migrations' // <-- Only change needed
    }
  });