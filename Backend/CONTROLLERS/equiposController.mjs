import db from "../CONFIG/db.mjs";
import { logAudit } from "../SERVICES/auditService.mjs";

// Crear nuevo equipo
export const crearEquipo = (req, res) => {
  const {
    nombre,
    marca,
    modelo,
    ubicacion,
    estado,
    proximo_mantenimiento,
    ultimo_mantenimiento_fecha,
    ultimo_mantenimiento_tecnico,
    ultimo_mantenimiento_tipo
  } = req.body;

  if (!nombre) {
    return res.status(400).json({ mensaje: "El nombre del equipo es obligatorio" });
  }

  const usuarioId = req.usuario?.id || null;

  const sql = `
    INSERT INTO equipos
    (nombre, marca, modelo, ubicacion, estado, proximo_mantenimiento,
     ultimo_mantenimiento_fecha, ultimo_mantenimiento_tecnico, ultimo_mantenimiento_tipo,
     created_by, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    nombre,
    marca || null,
    modelo || null,
    ubicacion || null,
    estado || "Operativo",
    proximo_mantenimiento || null,
    ultimo_mantenimiento_fecha || null,
    ultimo_mantenimiento_tecnico || null,
    ultimo_mantenimiento_tipo || null,
    usuarioId,
    usuarioId
  ];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        mensaje: "Error guardando equipo"
      });
    }

    const newId = result.insertId;
    logAudit({
      entity: "equipos",
      entityId: newId,
      action: "CREATE",
      req,
      actor: req.usuario || null,
      details: {
        equipo: {
          id: newId,
          nombre,
          marca: marca || null,
          modelo: modelo || null,
          ubicacion: ubicacion || null,
          estado: estado || "Operativo",
          proximo_mantenimiento: proximo_mantenimiento || null,
          ultimo_mantenimiento_fecha: ultimo_mantenimiento_fecha || null,
          ultimo_mantenimiento_tecnico: ultimo_mantenimiento_tecnico || null,
          ultimo_mantenimiento_tipo: ultimo_mantenimiento_tipo || null
        }
      }
    });

    res.json({
      mensaje: "Equipo guardado correctamente ✅",
      id: newId
    });
  });
};

// Listar todos los equipos (incluye último cambio de estado si existe tabla equipo_estado_historial)
export const listarEquipos = (req, res) => {
  const sqlConHistorial = `
    SELECT
      e.id,
      e.nombre,
      e.marca,
      e.modelo,
      e.ubicacion,
      e.estado,
      e.proximo_mantenimiento,
      e.ultimo_mantenimiento_fecha,
      e.ultimo_mantenimiento_tecnico,
      e.ultimo_mantenimiento_tipo,
      cu.nombre AS creado_por,
      uu.nombre AS actualizado_por,
      (SELECT h.estado FROM equipo_estado_historial h WHERE h.equipo_id = e.id ORDER BY h.fecha_cambio DESC, h.id DESC LIMIT 1) AS ultimo_cambio_estado,
      (SELECT h.fecha_cambio FROM equipo_estado_historial h WHERE h.equipo_id = e.id ORDER BY h.fecha_cambio DESC, h.id DESC LIMIT 1) AS ultimo_cambio_fecha
    FROM equipos e
    LEFT JOIN usuarios cu ON e.created_by = cu.id
    LEFT JOIN usuarios uu ON e.updated_by = uu.id
    ORDER BY e.id DESC
  `;
  const sqlSinHistorial = `
    SELECT
      e.id,
      e.nombre,
      e.marca,
      e.modelo,
      e.ubicacion,
      e.estado,
      e.proximo_mantenimiento,
      e.ultimo_mantenimiento_fecha,
      e.ultimo_mantenimiento_tecnico,
      e.ultimo_mantenimiento_tipo,
      cu.nombre AS creado_por,
      uu.nombre AS actualizado_por
    FROM equipos e
    LEFT JOIN usuarios cu ON e.created_by = cu.id
    LEFT JOIN usuarios uu ON e.updated_by = uu.id
    ORDER BY e.id DESC
  `;

  db.query(sqlConHistorial, (err, results) => {
    if (err) {
      const tablaNoExiste = /equipo_estado_historial/.test(err.message);
      if (tablaNoExiste) {
        return db.query(sqlSinHistorial, (err2, results2) => {
          if (err2) {
            console.error(err2);
            return res.status(500).json({ mensaje: "Error obteniendo equipos" });
          }
          res.json(results2);
        });
      }
      console.error(err);
      return res.status(500).json({
        mensaje: "Error obteniendo equipos"
      });
    }
    res.json(results);
  });
};

// Actualizar equipo existente (registra cambio de estado en historial si cambió)
export const actualizarEquipo = (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    marca,
    modelo,
    ubicacion,
    estado,
    proximo_mantenimiento,
    ultimo_mantenimiento_fecha,
    ultimo_mantenimiento_tecnico,
    ultimo_mantenimiento_tipo
  } = req.body;

  if (!id) {
    return res.status(400).json({ mensaje: "ID de equipo requerido" });
  }

  const usuarioId = req.usuario?.id || null;
  const nuevoEstado = estado || "Operativo";

  // Obtener estado actual y, si cambió, registrar en historial
  db.query("SELECT estado FROM equipos WHERE id = ?", [id], (errSelect, rows) => {
    if (errSelect) {
      console.error(errSelect);
      return res.status(500).json({ mensaje: "Error actualizando equipo" });
    }
    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Equipo no encontrado" });
    }

    const estadoAnterior = rows[0].estado || "";
    const registrarHistorial = estadoAnterior !== nuevoEstado;

    const insertarHistorial = (next) => {
      if (!registrarHistorial) return next();
      db.query(
        "INSERT INTO equipo_estado_historial (equipo_id, estado, created_by) VALUES (?, ?, ?)",
        [id, nuevoEstado, usuarioId],
        (errHist) => {
          if (errHist) console.error("Historial estado (tabla puede no existir):", errHist.message);
          next();
        }
      );
    };

    insertarHistorial(() => {
      const sql = `
        UPDATE equipos
        SET
          nombre = ?,
          marca = ?,
          modelo = ?,
          ubicacion = ?,
          estado = ?,
          proximo_mantenimiento = ?,
          ultimo_mantenimiento_fecha = ?,
          ultimo_mantenimiento_tecnico = ?,
          ultimo_mantenimiento_tipo = ?,
          updated_by = ?
        WHERE id = ?
      `;
      const params = [
        nombre,
        marca || null,
        modelo || null,
        ubicacion || null,
        nuevoEstado,
        proximo_mantenimiento || null,
        ultimo_mantenimiento_fecha || null,
        ultimo_mantenimiento_tecnico || null,
        ultimo_mantenimiento_tipo || null,
        usuarioId,
        id
      ];

      db.query(sql, params, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            mensaje: "Error actualizando equipo"
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ mensaje: "Equipo no encontrado" });
        }

        logAudit({
          entity: "equipos",
          entityId: Number(id),
          action: "UPDATE",
          req,
          actor: req.usuario || null,
          details: {
            equipo_id: Number(id),
            payload: {
              nombre,
              marca: marca || null,
              modelo: modelo || null,
              ubicacion: ubicacion || null,
              estado: nuevoEstado,
              proximo_mantenimiento: proximo_mantenimiento || null,
              ultimo_mantenimiento_fecha: ultimo_mantenimiento_fecha || null,
              ultimo_mantenimiento_tecnico: ultimo_mantenimiento_tecnico || null,
              ultimo_mantenimiento_tipo: ultimo_mantenimiento_tipo || null
            },
            cambio_estado: registrarHistorial
              ? { de: estadoAnterior, a: nuevoEstado }
              : null
          }
        });

        res.json({
          mensaje: "Equipo actualizado correctamente ✅"
        });
      });
    });
  });
};

// Eliminar equipo
export const eliminarEquipo = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ mensaje: "ID de equipo requerido" });
  }

  // Capturar snapshot mínimo antes de eliminar (para que el historial tenga contexto)
  db.query("SELECT * FROM equipos WHERE id = ? LIMIT 1", [id], (errSel, rows) => {
    if (errSel) {
      console.error(errSel);
      return res.status(500).json({ mensaje: "Error eliminando equipo" });
    }
    if (!rows || rows.length === 0) {
      return res.status(404).json({ mensaje: "Equipo no encontrado" });
    }

    const snapshot = rows[0];

    const sql = "DELETE FROM equipos WHERE id = ?";
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ mensaje: "Error eliminando equipo" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: "Equipo no encontrado" });
      }

      logAudit({
        entity: "equipos",
        entityId: Number(id),
        action: "DELETE",
        req,
        actor: req.usuario || null,
        details: { equipo: snapshot }
      });

      res.json({ mensaje: "Equipo eliminado correctamente 🗑️" });
    });
  });
};