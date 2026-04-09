-- Ejecutar en la base (ej: biomedica_app) para habilitar auditoría de acciones.
-- Ejemplo: mysql -u usuario -p biomedica_app < audit_log.sql

CREATE TABLE IF NOT EXISTS audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entity VARCHAR(40) NOT NULL,
  entity_id INT DEFAULT NULL,
  action VARCHAR(10) NOT NULL, -- CREATE | UPDATE | DELETE
  actor_user_id INT DEFAULT NULL,
  actor_correo VARCHAR(255) DEFAULT NULL,
  ip VARCHAR(64) DEFAULT NULL,
  user_agent VARCHAR(255) DEFAULT NULL,
  details TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_actor_usuario FOREIGN KEY (actor_user_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_entity ON audit_log(entity);
CREATE INDEX idx_audit_entity_id ON audit_log(entity_id);
CREATE INDEX idx_audit_created_at ON audit_log(created_at);
