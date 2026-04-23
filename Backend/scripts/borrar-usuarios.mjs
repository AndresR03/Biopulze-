/**
 * Script para borrar todos los usuarios de la tabla usuarios.
 * Ejecutar desde la carpeta Backend: node scripts/borrar-usuarios.mjs
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: "utf8mb4"
});

try {
  console.log("Conectado a MySQL. Borrando usuarios...");

  await connection.query("UPDATE equipos SET created_by = NULL, updated_by = NULL");
  console.log("  - equipos.created_by/updated_by puestos a NULL");

  await connection.query("SET FOREIGN_KEY_CHECKS = 0");
  const [result] = await connection.query("DELETE FROM usuarios");
  await connection.query("ALTER TABLE usuarios AUTO_INCREMENT = 1");
  await connection.query("SET FOREIGN_KEY_CHECKS = 1");

  const filas = result.affectedRows ?? 0;
  console.log("  - DELETE FROM usuarios →", filas, "fila(s) borrada(s)");
  console.log("  - ID reiniciado (próximo usuario será id 1)");

  const [rows] = await connection.query("SELECT COUNT(*) AS total FROM usuarios");
  console.log("  - Usuarios restantes:", rows[0].total);
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
} finally {
  await connection.end();
}

console.log("Listo.");
