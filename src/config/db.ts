import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import { DB } from "../utils/kysely-types";

export const dialect = new MysqlDialect({
    pool: createPool({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        port: parseInt(process.env.DATABASE_PORT || '3306'),
        connectionLimit: 10,
    }),
});

export const db = new Kysely<DB>({
    dialect,
})

