import { ZenStackClient } from '@zenstackhq/orm'
import { PolicyPlugin } from '@zenstackhq/plugin-policy'
import { schema } from '../zenstack/schema'
import { PostgresDialect } from '@zenstackhq/orm/dialects/postgres'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL!

// Base client — no user context yet
export const db = new ZenStackClient(schema, {
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: process.env.DATABASE_URL,
        }),
    }),
});



// Policy-aware client — still no user context
export const authDb = db.$use(new PolicyPlugin())