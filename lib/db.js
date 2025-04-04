// lib/db.js
import pg from "pg";

const config = {
  user: "admin",
  password: "Fms2024@PgAdmin#",
  host: "167.71.58.161",
  port: 5432,
  database: "formus",
  ssl: {
    rejectUnauthorized: false,
  },
};

// console.log('Initializing database connection with config:', {
//     ...config,
//     password: '***' // არ ვაჩვენებთ პაროლს ლოგებში
// });

const pool = new pg.Pool(config);

pool.on("connect", (client) => {});

pool.on("error", (err) => {
  console.error("Unexpected database error:", err);
});

pool.on("acquire", (client) => {});

pool.on("remove", (client) => {});

export async function query(sql, params = []) {
  let client;
  try {
    client = await pool.connect();

    // Debug params types

    const result = await client.query(sql, params);

    return result.rows;
  } catch (error) {
    console.error("Database error details:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      position: error.position,
      query: sql,
      params,
    });
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Test connection on startup
pool
  .query("SELECT NOW()")
  .then(() => {})
  .catch((err) => console.error("Database connection test failed:", err));

export const db = {
  query,
};
