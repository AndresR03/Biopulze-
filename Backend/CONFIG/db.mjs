import dotenv from "dotenv";

dotenv.config();

const isTest = process.env.NODE_ENV === "test";

let db;

if (isTest) {
  // Mock: no cargar mysql2 en test → evita AUTH_SWITCH_PLUGIN_ERROR, cesu8, tear down
  db = {
    connect: () => {},
    query: (sql, params, cb) => {
      const callback = typeof params === "function" ? params : cb;
      if (callback) callback(null, []);
    }
  };
} else {
  const mysql = await import("mysql2");
  db = mysql.default.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: "utf8mb4"
  });
  db.connect((err) => {
    if (err) {
      console.error("Error conectando a MySQL:", err);
    } else {
      console.log("Conectado a MySQL");
    }
  });
}

export default db;
