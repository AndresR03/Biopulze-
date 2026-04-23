import db from "../CONFIG/db.mjs";

function safeStringify(value) {
  try {
    const s = typeof value === "string" ? value : JSON.stringify(value);
    if (!s) return null;
    // Evitar que un log enorme rompa el insert (TEXT suele aguantar bastante, igual truncamos).
    return s.length > 20000 ? s.slice(0, 20000) + "…(truncado)" : s;
  } catch {
    return null;
  }
}

function tablaNoExiste(err) {
  const msg = (err && err.message) || "";
  return /audit_log/i.test(msg) && /doesn'?t exist|no existe|unknown table/i.test(msg);
}

export function logAudit({ entity, entityId = null, action, req, actor = null, details = null }) {
  if (!entity || !action) return;

  const actorUserId = actor?.id ?? null;
  const actorCorreo = actor?.correo ?? null;

  const ip =
    (req?.headers && (req.headers["x-forwarded-for"] || req.headers["x-real-ip"])) ||
    req?.ip ||
    null;

  const userAgent = (req?.headers && req.headers["user-agent"]) || null;

  const sql = `
    INSERT INTO audit_log
    (entity, entity_id, action, actor_user_id, actor_correo, ip, user_agent, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    String(entity),
    entityId === undefined ? null : entityId,
    String(action),
    actorUserId,
    actorCorreo,
    ip ? String(ip).slice(0, 64) : null,
    userAgent ? String(userAgent).slice(0, 255) : null,
    safeStringify(details)
  ];

  // Best-effort: si falla, no rompemos el flujo principal.
  db.query(sql, params, (err) => {
    if (!err) return;
    if (tablaNoExiste(err)) return;
    console.error("Error audit_log:", err.message || err);
  });
}

