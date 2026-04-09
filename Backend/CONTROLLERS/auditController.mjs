import db from "../CONFIG/db.mjs";

function parseDetails(s) {
  if (!s) return null;
  if (typeof s !== "string") return s;
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

export const listarHistorialEquipos = (req, res) => {
  const limitRaw = Number(req.query.limit || 50);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 50;
  const equipoId = req.query.equipo_id ? Number(req.query.equipo_id) : null;

  const baseSql = `
    SELECT
      a.id,
      a.entity,
      a.entity_id,
      a.action,
      a.created_at,
      a.details,
      u.nombre AS actor_nombre,
      COALESCE(a.actor_correo, u.correo) AS actor_correo
    FROM audit_log a
    LEFT JOIN usuarios u ON a.actor_user_id = u.id
    WHERE a.entity = 'equipos'
      ${equipoId ? "AND a.entity_id = ?" : ""}
    ORDER BY a.created_at DESC, a.id DESC
    LIMIT ?
  `;

  const params = [];
  if (equipoId) params.push(equipoId);
  params.push(limit);

  db.query(baseSql, params, (err, rows) => {
    if (err) {
      const msg = err.message || "";
      const tablaNoExiste = /audit_log/i.test(msg) && /doesn'?t exist|no existe|unknown table/i.test(msg);
      if (tablaNoExiste) return res.json([]);
      console.error(err);
      return res.status(500).json({ mensaje: "Error obteniendo historial" });
    }

    const out = (rows || []).map((r) => ({
      id: r.id,
      entity: r.entity,
      entity_id: r.entity_id,
      action: r.action,
      created_at: r.created_at,
      actor_nombre: r.actor_nombre || null,
      actor_correo: r.actor_correo || null,
      details: parseDetails(r.details)
    }));

    res.json(out);
  });
};

