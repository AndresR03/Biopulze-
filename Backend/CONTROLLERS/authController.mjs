import db from "../CONFIG/db.mjs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { enviarCodigo2FA } from "../SERVICES/codeService.mjs";

const generarCodigo = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const MIN_PASSWORD_LENGTH = 8;

// ================= REGISTER con 2FA (código solo por correo) =================
export const register = async (req, res) => {
  const { nombre, correo, password, telefono } = req.body;

  if (!nombre || !correo || !password || !telefono) {
    return res
      .status(400)
      .json({ mensaje: "Todos los campos son obligatorios (incluye teléfono)" });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return res
      .status(400)
      .json({ mensaje: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` });
  }

  try {
    const checkSql = "SELECT * FROM usuarios WHERE correo = ?";

    db.query(checkSql, [correo], async (err, results) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ mensaje: "Error en el servidor" });
      }

      if (results.length > 0) {
        return res
          .status(400)
          .json({ mensaje: "Este correo ya está registrado. Usa otro o inicia sesión." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const codigo = generarCodigo();

      const insertSql = `
        INSERT INTO usuarios
        (nombre, correo, telefono, preferencia_codigo, password, verificado, codigo_2fa, codigo_2fa_expira)
        VALUES (?, ?, ?, 'email', ?, 0, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))
      `;
      const insertSqlSinPreferencia = `
        INSERT INTO usuarios
        (nombre, correo, telefono, password, verificado, codigo_2fa, codigo_2fa_expira)
        VALUES (?, ?, ?, ?, 0, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))
      `;

      db.query(
        insertSql,
        [nombre, correo, telefono, hashedPassword, codigo],
        async (err2) => {
          if (err2 && err2.code === "ER_BAD_FIELD_ERROR") {
            return db.query(
              insertSqlSinPreferencia,
              [nombre, correo, telefono, hashedPassword, codigo],
              async (err3) => {
                if (err3) {
                  console.error(err3);
                  return res.status(500).json({ mensaje: "Error al registrar usuario" });
                }
                await enviarCodigo2FA("email", correo, "", codigo);
                return res.json({
                  mensaje: "Registro correcto. Revisa tu correo e ingresa el código para activar la cuenta.",
                  requiere2FA: true,
                  correo
                });
              }
            );
          }
          if (err2) {
            console.error(err2);
            return res
              .status(500)
              .json({ mensaje: "Error al registrar usuario" });
          }

          await enviarCodigo2FA("email", correo, "", codigo);
          res.json({
            mensaje: "Registro correcto. Revisa tu correo e ingresa el código para activar la cuenta.",
            requiere2FA: true,
            correo
          });
        }
      );
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Error interno del servidor" });
  }
};

// Reenviar código de registro (usuario aún no verificado)
export const reenviarCodigoRegistro = async (req, res) => {
  const { correo } = req.body;
  if (!correo) {
    return res.status(400).json({ mensaje: "Correo obligatorio" });
  }
  const sql = "SELECT id, correo FROM usuarios WHERE correo = ? AND verificado = 0 LIMIT 1";
  db.query(sql, [correo], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: "Error en el servidor" });
    }
    if (results.length === 0) {
      return res.status(400).json({ mensaje: "Usuario no encontrado o ya verificado" });
    }
    const codigo = generarCodigo();
    const updateSql = "UPDATE usuarios SET codigo_2fa = ?, codigo_2fa_expira = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE id = ?";
    db.query(updateSql, [codigo, results[0].id], async (err2) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ mensaje: "Error al reenviar" });
      }
      await enviarCodigo2FA("email", results[0].correo, "", codigo);
      res.json({ mensaje: "Código reenviado. Revisa tu correo." });
    });
  });
};

// Verificar código de registro
export const verificarRegistro = (req, res) => {
  const { correo, codigo } = req.body;

  if (!correo || !codigo) {
    return res
      .status(400)
      .json({ mensaje: "Correo y código son obligatorios" });
  }

  const sql =
    "SELECT * FROM usuarios WHERE correo = ? AND verificado = 0 LIMIT 1";

  db.query(sql, [correo], async (err, results) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ mensaje: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res
        .status(400)
        .json({ mensaje: "Usuario no encontrado o ya verificado" });
    }

    const usuario = results[0];

    if (
      !usuario.codigo_2fa ||
      usuario.codigo_2fa !== codigo ||
      !usuario.codigo_2fa_expira ||
      new Date(usuario.codigo_2fa_expira) < new Date()
    ) {
      return res
        .status(400)
        .json({ mensaje: "Código inválido o expirado" });
    }

    const updateSql = `
      UPDATE usuarios
      SET verificado = 1, codigo_2fa = NULL, codigo_2fa_expira = NULL
      WHERE id = ?
    `;

    db.query(updateSql, [usuario.id], (err2) => {
      if (err2) {
        console.error(err2);
        return res
          .status(500)
          .json({ mensaje: "Error verificando usuario" });
      }

      // Generar token al completar registro
      const token = jwt.sign(
        { id: usuario.id, correo: usuario.correo },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      res.json({
        mensaje: "Registro verificado correctamente ✅",
        token
      });
    });
  });
};

// ================= LOGIN (paso 1: usuario + contraseña, genera código) =================
export const login = (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res
      .status(400)
      .json({ mensaje: "Correo y contraseña son obligatorios" });
  }

  const sql = "SELECT * FROM usuarios WHERE correo = ?";

  db.query(sql, [correo], async (err, results) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ mensaje: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res
        .status(400)
        .json({ mensaje: "Usuario no encontrado" });
    }

    const usuario = results[0];

    if (!usuario.verificado) {
      return res
        .status(401)
        .json({
          mensaje:
            "Cuenta no verificada. Completa el registro con el código enviado a tu correo."
        });
    }

    const passwordCorrecta = await bcrypt.compare(password, usuario.password);

    if (!passwordCorrecta) {
      return res
        .status(400)
        .json({ mensaje: "Contraseña incorrecta" });
    }

    const codigo = generarCodigo();

    const updateSql = `
      UPDATE usuarios
      SET codigo_2fa = ?, codigo_2fa_expira = DATE_ADD(NOW(), INTERVAL 10 MINUTE)
      WHERE id = ?
    `;

    db.query(updateSql, [codigo, usuario.id], async (err2) => {
      if (err2) {
        console.error(err2);
        return res
          .status(500)
          .json({ mensaje: "Error generando código de acceso" });
      }

      await enviarCodigo2FA("email", usuario.correo, "", codigo);
      res.json({
        mensaje: "Hemos enviado un código a tu correo. Ingrésalo para completar el inicio de sesión.",
        requiere2FA: true,
        correo: usuario.correo
      });
    });
  });
};

// Reenviar código de login (usuario verificado, pendiente de código)
export const reenviarCodigoLogin = async (req, res) => {
  const { correo } = req.body;
  if (!correo) {
    return res.status(400).json({ mensaje: "Correo obligatorio" });
  }
  const sql = "SELECT id, correo FROM usuarios WHERE correo = ? AND verificado = 1 LIMIT 1";
  db.query(sql, [correo], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: "Error en el servidor" });
    }
    if (results.length === 0) {
      return res.status(400).json({ mensaje: "Usuario no encontrado" });
    }
    const codigo = generarCodigo();
    const updateSql = "UPDATE usuarios SET codigo_2fa = ?, codigo_2fa_expira = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE id = ?";
    db.query(updateSql, [codigo, results[0].id], async (err2) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ mensaje: "Error al reenviar" });
      }
      await enviarCodigo2FA("email", results[0].correo, "", codigo);
      res.json({ mensaje: "Código reenviado. Revisa tu correo." });
    });
  });
};

// LOGIN paso 2: verificar código
export const verificarLogin = (req, res) => {
  const { correo, codigo } = req.body;

  if (!correo || !codigo) {
    return res
      .status(400)
      .json({ mensaje: "Correo y código son obligatorios" });
  }

  const sql =
    "SELECT * FROM usuarios WHERE correo = ? AND verificado = 1 LIMIT 1";

  db.query(sql, [correo], async (err, results) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ mensaje: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res
        .status(400)
        .json({ mensaje: "Usuario no encontrado" });
    }

    const usuario = results[0];

    if (
      !usuario.codigo_2fa ||
      usuario.codigo_2fa !== codigo ||
      !usuario.codigo_2fa_expira ||
      new Date(usuario.codigo_2fa_expira) < new Date()
    ) {
      return res
        .status(400)
        .json({ mensaje: "Código inválido o expirado" });
    }

    const clearSql = `
      UPDATE usuarios
      SET codigo_2fa = NULL, codigo_2fa_expira = NULL
      WHERE id = ?
    `;

    db.query(clearSql, [usuario.id], (err2) => {
      if (err2) {
        console.error(err2);
        return res
          .status(500)
          .json({ mensaje: "Error finalizando inicio de sesión" });
      }

      const token = jwt.sign(
        { id: usuario.id, correo: usuario.correo },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      res.json({
        mensaje: "Inicio de sesión exitoso ✅",
        token
      });
    });
  });
};

// ================= RECUPERAR CONTRASEÑA =================
// Paso 1: solicitar código al correo
export const forgotPassword = async (req, res) => {
  const { correo } = req.body;

  if (!correo) {
    return res
      .status(400)
      .json({ mensaje: "Ingresa tu correo" });
  }

  const sql = "SELECT id, correo FROM usuarios WHERE correo = ? AND verificado = 1 LIMIT 1";

  db.query(sql, [correo], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: "Error en el servidor" });
    }

    // Siempre devolver el mismo mensaje (seguridad: no revelar si el correo existe)
    const mensaje = "Si el correo está registrado, recibirás un código para restablecer tu contraseña.";

    if (results.length === 0) {
      return res.json({ mensaje });
    }

    const usuario = results[0];
    const codigo = generarCodigo();

    const updateSql = `
      UPDATE usuarios
      SET codigo_2fa = ?, codigo_2fa_expira = DATE_ADD(NOW(), INTERVAL 10 MINUTE)
      WHERE id = ?
    `;

    db.query(updateSql, [codigo, usuario.id], async (err2) => {
      if (err2) {
        console.error(err2);
        return res.json({ mensaje });
      }
      await enviarCodigo2FA("email", usuario.correo, "", codigo);
      res.json({ mensaje });
    });
  });
};

// Paso 2: verificar código y cambiar contraseña
export const resetPassword = (req, res) => {
  const { correo, codigo, nuevaPassword } = req.body;

  if (!correo || !codigo || !nuevaPassword) {
    return res
      .status(400)
      .json({ mensaje: "Correo, código y nueva contraseña son obligatorios" });
  }

  if (nuevaPassword.length < MIN_PASSWORD_LENGTH) {
    return res
      .status(400)
      .json({ mensaje: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` });
  }

  const sql = "SELECT * FROM usuarios WHERE correo = ? AND verificado = 1 LIMIT 1";

  db.query(sql, [correo], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(400).json({ mensaje: "Código inválido o expirado" });
    }

    const usuario = results[0];

    if (
      !usuario.codigo_2fa ||
      usuario.codigo_2fa !== codigo ||
      !usuario.codigo_2fa_expira ||
      new Date(usuario.codigo_2fa_expira) < new Date()
    ) {
      return res.status(400).json({ mensaje: "Código inválido o expirado" });
    }

    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
    const updateSql = `
      UPDATE usuarios
      SET password = ?, codigo_2fa = NULL, codigo_2fa_expira = NULL
      WHERE id = ?
    `;

    db.query(updateSql, [hashedPassword, usuario.id], (err2) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ mensaje: "Error al actualizar la contraseña" });
      }
      res.json({ mensaje: "Contraseña actualizada. Ya puedes iniciar sesión." });
    });
  });
};
