import pg from "pg";

const dbHost = process.env.DB_HOST ?? "127.0.0.1";
const dbPort = Number(process.env.DB_PORT ?? "5432");
const dbUser = process.env.DB_USER ?? "postgres";
const dbPassword = process.env.DB_PASSWORD ?? "";
const dbName = process.env.DB_NAME ?? "campus_cat_map";

export const pool = new pg.Pool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  max: 10
});
