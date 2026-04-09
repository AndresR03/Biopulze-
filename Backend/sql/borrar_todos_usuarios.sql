-- Borra todos los usuarios deshabilitando temporalmente las claves foráneas.
-- Ejecutar en MySQL Workbench: selecciona biomedica_app y ejecuta este script.

USE biomedica_app;

-- Opcional: dejar equipos sin "creado por" / "actualizado por"
UPDATE equipos SET created_by = NULL, updated_by = NULL WHERE 1;

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM usuarios;

SET FOREIGN_KEY_CHECKS = 1;

-- Comprobar que quedó vacío
SELECT COUNT(*) AS usuarios_restantes FROM usuarios;
