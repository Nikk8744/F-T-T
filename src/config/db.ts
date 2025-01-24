import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";



// const pool = createPool({
//     database: "test",
//     user: "root",
//     password: "Wellcome@123",
//     host: "localhost",
//     port: 3308,
//     connectionLimit: 10,
// });

export const dialect = new MysqlDialect({
    pool: createPool({
        host : 'localhost',
        user : 'root',
        password : 'Wellcome@123',
        database : 'freelance_time_tracker',
        port: 3306,
        connectionLimit: 10,
    }),
  });

export const db = new Kysely({
    dialect,
})

