# Pruebas del backend BioPulse

Carpeta de **pruebas unitarias**, **de API** y **de rendimiento** con Jest. Para que tus compañeros puedan ejecutarlas y revisar el estado del aplicativo.

## Requisitos

- Node.js 18 o superior
- En la carpeta `Backend`: `npm install`

## Cómo ejecutar las pruebas

Desde la carpeta **Backend**:

```bash
cd Backend
npm install
npm test
```

### Comandos disponibles

| Comando | Descripción |
|--------|-------------|
| `npm test` | Ejecuta todos los tests (Jest) |
| `npm run test:watch` | Modo watch: vuelve a ejecutar al guardar cambios |
| `npm run test:coverage` | Ejecuta tests y genera informe de cobertura en `tests/coverage` |
| `npm run test:performance` | Ejecuta el script de rendimiento (requiere servidor levantado) |

## Estructura de la carpeta `tests/`

```
tests/
├── README.md           ← Este archivo
├── api/                ← Tests de API (rutas HTTP)
│   ├── status.test.mjs
│   ├── auth.validation.test.mjs
│   └── equipos.auth.test.mjs
├── unit/               ← Tests unitarios (lógica sin servidor)
│   └── validation.test.mjs
├── performance/        ← Pruebas de rendimiento
│   └── run.mjs
└── coverage/           ← Generado por npm run test:coverage
```

## Qué se prueba

- **API**
  - `GET /api/status`: responde 200 y mensaje de servidor activo.
  - `POST /register`: validación (campos obligatorios, contraseña mínima 8 caracteres).
  - `POST /login` y `POST /forgot-password`: validación de cuerpo.
  - Rutas protegidas (`/equipos`): sin token devuelven 401.
- **Unit**
  - Reglas de validación de contraseña y campos obligatorios.
- **Rendimiento**
  - Script que mide tiempos de respuesta de `/api/status` (ejecutar con el servidor en marcha).

## Pruebas de rendimiento

1. Levanta el servidor: `node servidor.mjs` (o `npm start` si lo tienes configurado).
2. En otra terminal, desde `Backend`:  
   `npm run test:performance`  
   Opcional: `BASE_URL=http://localhost:3000 node tests/performance/run.mjs`

## Notas para el equipo

- Los tests de API que **no** usan base de datos (status, validaciones de registro/login, rutas sin token) se ejecutan siempre.
- Si algún test falla por conexión a MySQL, comprobad que `.env` tenga la configuración correcta o que el servicio de BD esté activo; las validaciones anteriores no necesitan BD.
- Jest se ejecuta con soporte ESM (`--experimental-vm-modules`). Si en algún entorno falla, comprobad que la versión de Node sea ≥ 18.
