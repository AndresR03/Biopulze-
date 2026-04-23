-- Añade la preferencia de envío del código 2FA (correo o SMS).
-- Ejecutar en la base biomedica_app:
--   mysql -u usuario -p biomedica_app < preferencia_codigo_2fa.sql

ALTER TABLE usuarios
ADD COLUMN preferencia_codigo VARCHAR(10) NOT NULL DEFAULT 'email'
COMMENT 'email o sms'
AFTER telefono;
