-- Solución para el error AUTH_SWITCH_PLUGIN_ERROR con MySQL 8 y mysql2.
-- Ejecuta este script en MySQL Workbench (conectado a tu servidor).
-- Ajusta el usuario y la contraseña si no usas 'bioapp' / 'andres123'.

-- Si el usuario se conecta desde cualquier host (%):
ALTER USER 'bioapp'@'%' IDENTIFIED WITH mysql_native_password BY 'andres123';

-- Si en tu MySQL el usuario es 'bioapp'@'localhost', usa esta en su lugar:
-- ALTER USER 'bioapp'@'localhost' IDENTIFIED WITH mysql_native_password BY 'andres123';

FLUSH PRIVILEGES;
