import { Knex} from "knex";

const config: Knex.Config =  {
    client: 'mysql2',
    connection: {
        host : 'localhost',
        user : 'root',
        password : 'Wellcome@123',
        database : 'freelance_time_tracker'
    },
    migrations: {
        directory: './src/migrations',
    }
}

export default config;
