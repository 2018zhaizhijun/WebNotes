// import { PrismaClient } from '@prisma/client';
import { Pool } from "pg";
import { PostgresDialect } from "kysely";
import { DB } from "common/db/types";
import { KyselyAuth } from "@auth/kysely-adapter";

// let prisma: PrismaClient;

// if (process.env.NODE_ENV === "production") {
//   prisma = new PrismaClient();
// } else {
//   if (!global.prisma) {
//     global.prisma = new PrismaClient();
//   }
//   prisma = global.prisma;
// }

// export default prisma;

let db: KyselyAuth<DB, DB>;

if (process.env.NODE_ENV === "production") {
  // prisma = new PrismaClient();
  db = new KyselyAuth<DB, DB>({
    // Use MysqlDialect for MySQL and SqliteDialect for SQLite.
    dialect: new PostgresDialect({
      pool: new Pool({
        database: process.env.POSTGRES_DATABASE,
        host: process.env.POSTGRES_HOST,
        port: Number(process.env.POSTGRES_PORT),
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
      }),
    }),
  });
} else {
  let globalWithDB = global as typeof globalThis & {
    db: KyselyAuth<DB, DB>;
  };
  if (!globalWithDB.db) {
    globalWithDB.db = new KyselyAuth<DB, DB>({
      // Use MysqlDialect for MySQL and SqliteDialect for SQLite.
      dialect: new PostgresDialect({
        pool: new Pool({
          database: process.env.POSTGRES_DATABASE,
          host: process.env.POSTGRES_HOST,
          user: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
        }),
      }),
    });
  }
  db = globalWithDB.db;
}

export default db;
