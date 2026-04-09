-- Añade cargo e imagen de perfil al usuario.
-- Ejecutar en MySQL (Workbench o consola): fuente este archivo en biomedica_app.

ALTER TABLE usuarios ADD COLUMN cargo VARCHAR(120) NULL DEFAULT NULL COMMENT 'Cargo o puesto del usuario';
ALTER TABLE usuarios ADD COLUMN imagen_perfil MEDIUMTEXT NULL DEFAULT NULL COMMENT 'Imagen de perfil en base64 (data URL)';
