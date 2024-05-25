// import { PrismaClient } from '@prisma/client';
import { KyselyAuth } from '@auth/kysely-adapter';
import { DB } from 'common/db/types';
import { PostgresDialect } from 'kysely';
import { Pool } from 'pg';

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

if (process.env.NODE_ENV === 'production') {
  // prisma = new PrismaClient();
  db = new KyselyAuth<DB, DB>({
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
  const globalWithDB = global as typeof global & {
    db: KyselyAuth<DB, DB>;
  };
  if (!globalWithDB.db) {
    globalWithDB.db = new KyselyAuth<DB, DB>({
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
