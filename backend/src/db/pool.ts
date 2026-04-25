import pg from "pg";

let pool: pg.Pool | undefined;

export function getPool() {
  if (pool) return pool;

  const dbHost = process.env.DB_HOST ?? "127.0.0.1";
  const dbPort = Number(process.env.DB_PORT ?? "5432");
  const dbUser = process.env.DB_USER ?? "postgres";
  const dbPassword = process.env.DB_PASSWORD ?? "";
  const dbName = process.env.DB_NAME ?? "campus_cat_map";

  pool = new pg.Pool({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    max: 10
  });

  return pool;
}
