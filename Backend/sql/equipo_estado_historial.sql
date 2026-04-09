-- Ejecutar en la base biomedica_app para habilitar historial de cambios de estado.
-- Ejemplo: mysql -u usuario -p biomedica_app < equipo_estado_historial.sql

CREATE TABLE IF NOT EXISTS equipo_estado_historial (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipo_id INT NOT NULL,
  estado VARCHAR(50) NOT NULL,
  fecha_cambio DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT DEFAULT NULL,
  CONSTRAINT fk_historial_equipo FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
  CONSTRAINT fk_historial_usuario FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_historial_equipo_id ON equipo_estado_historial(equipo_id);
CREATE INDEX idx_historial_fecha ON equipo_estado_historial(fecha_cambio);
