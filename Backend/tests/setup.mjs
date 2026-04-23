// Fija NODE_ENV=test antes de cargar servidor/db en cualquier test.
// Evita que db.mjs intente conectar a MySQL (AUTH_SWITCH_PLUGIN_ERROR y tear down).
process.env.NODE_ENV = "test";
