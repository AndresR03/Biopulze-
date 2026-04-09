import db from "../CONFIG/db.mjs";
import bcrypt from "bcryptjs";

const MIN_PASSWORD_LENGTH = 8;

/**
 * GET /me - Devuelve los datos del usuario autenticado (sin password).
 */
export const getMe = (req, res) => {
  const userId = req.usuario?.id;
  if (!userId) {
    return res.status(401).json({ mensaje: "No autorizado" });
  }

  const sql = `
    SELECT id, nombre, correo, telefono, cargo, imagen_perfil
    FROM usuarios
    WHERE id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err && err.code === "ER_BAD_FIELD_ERROR") {
      return db.query(
        "SELECT id, nombre, correo, telefono FROM usuarios WHERE id = ?",
        [userId],
        (err2, results2) => {
          if (err2 || results2.length === 0) {
            return res.status(err2 ? 500 : 404).json({ mensaje: err2 ? "Error al obtener perfil" : "Usuario no encontrado" });
          }
          const u = results2[0];
          return res.json({ id: u.id, nombre: u.nombre, correo: u.correo, telefono: u.telefono || "", cargo: "", imagen_perfil: null });
        }
      );
    }
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: "Error al obtener perfil" });
    }
    if (results.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    const user = results[0];
    res.json({
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      telefono: user.telefono || "",
      cargo: user.cargo != null ? user.cargo : "",
      imagen_perfil: user.imagen_perfil || null
    });
  });
};

/**
 * PUT /user/profile - Actualiza telefono, contraseña, cargo e imagen_perfil.
 * Body: { telefono?, nuevaPassword?, cargo?, imagen_perfil? } (todos opcionales)
 */
export const updateProfile = (req, res) => {
  const userId = req.usuario?.id;
  if (!userId) {
    return res.status(401).json({ mensaje: "No autorizado" });
  }

  const { telefono, nuevaPassword, cargo, imagen_perfil } = req.body;

  if (nuevaPassword !== undefined && nuevaPassword !== "") {
    if (nuevaPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        mensaje: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
      });
    }
  }

  const updates = [];
  const values = [];

  if (telefono !== undefined) {
    updates.push("telefono = ?");
    values.push(String(telefono).trim());
  }
  if (cargo !== undefined) {
    updates.push("cargo = ?");
    values.push(String(cargo).trim());
  }
  if (imagen_perfil !== undefined) {
    updates.push("imagen_perfil = ?");
    values.push(imagen_perfil === "" ? null : imagen_perfil);
  }
  if (nuevaPassword !== undefined && nuevaPassword !== "") {
    bcrypt.hash(nuevaPassword, 10).then((hashedPassword) => {
      updates.push("password = ?");
      values.push(hashedPassword);
      values.push(userId);
      const sql = `UPDATE usuarios SET ${updates.join(", ")} WHERE id = ?`;
      db.query(sql, values, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ mensaje: "Error al actualizar perfil" });
        }
        return res.json({ mensaje: "Perfil actualizado correctamente" });
      });
    }).catch((err) => {
      console.error(err);
      return res.status(500).json({ mensaje: "Error al actualizar contraseña" });
    });
    return;
  }

  if (updates.length === 0) {
    return res.status(400).json({ mensaje: "No hay datos para actualizar" });
  }

  values.push(userId);
  const sql = `UPDATE usuarios SET ${updates.join(", ")} WHERE id = ?`;
  db.query(sql, values, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: "Error al actualizar perfil" });
    }
    res.json({ mensaje: "Perfil actualizado correctamente" });
  });
};
