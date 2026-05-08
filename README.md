# 🏥 BioPulze version 1
#### Aplicativo web para la gestión integral de mantenimiento y calibración de equipos biomédicos

BioPulze es un aplicativo web que permite gestionar el mantenimiento y calibración de equipos biomédicos en instituciones de salud desde un dashboard centralizado. Está diseñado para ingenieros biomédicos, ingenieros clínicos y áreas administrativas que necesitan centralizar la información técnica, automatizar alertas preventivas y garantizar la trazabilidad de los procesos clínicos.

# 🚀 Características principales
* 📊 Registro y seguimiento de equipos biomédicos en tiempo real
* 🖥️ Visualización de estado operativo, mantenimientos y calibraciones
* 🔔 Alertas automáticas de mantenimientos próximos a vencer
* 🌐 Dashboard web accesible desde cualquier navegador
* 🔐 Sistema de autenticación con verificación en dos pasos (2FA)
* 👤 Registro de usuarios con verificación por correo electrónico
* 🔑 Recuperación de contraseña vía email
* 📋 Historial completo de cambios con auditoría por usuario
* 📁 Exportación de reportes en formato CSV
* 🔍 Filtros de reporte por día, mes y año
* 🧹 Trazabilidad de operaciones con created_by y updated_by

# 🏗️ Arquitectura del sistema
#### BioPulze está compuesto por tres capas bien diferenciadas bajo el patrón MVC:

# 1. 🖥️ Front-End (Presentación)
Interfaz de usuario construida con HTML y CSS, diseñada previamente en Figma.

* Contiene los 6 módulos del aplicativo
* Interfaz responsiva e intuitiva
* Integración con el back-end mediante consumo de API REST
* Control de sesión expirada con redirección automática
  
# 2. ⚙️ Back-End (Lógica)
Núcleo del sistema implementado sobre Apache Cordova con Node.js y Express.

* Procesa peticiones del front-end y aplica lógica de negocio
* Gestiona seguridad mediante autenticación JWT y bcrypt
* Verificación en dos pasos (2FA) por correo electrónico
* Validaciones de entrada en todos los endpoints críticos
* Pruebas unitarias automatizadas con Jest
  
# 3. 🗄️ Base de Datos
Gestionada con MySQL (sistema relacional) que garantiza integridad de datos clínicos.

* Almacena equipos, historial de mantenimientos, calibraciones y usuarios
* Tabla audit_log para bitácora de acciones CREATE, UPDATE, DELETE
* Tabla equipo_estado_historial para trazabilidad de estados

# 🔧 Tecnologías utilizadas
* 🌐 HTML + CSS (front-end responsivo)
* ⚡ Node.js + Express (back-end)
* 📱 Apache Cordova (framework de integración)
* 🗃️ MySQL (base de datos relacional)
* 🔒 JWT + bcrypt (autenticación segura)
* ✉️ Nodemailer / codeService (2FA por correo)
* 🧪 Jest (pruebas unitarias y de API)
* 🎨 Figma (diseño de interfaces)

# 🔐 Autenticación y seguridad
BioPulze incluye un sistema completo de autenticación alineado con OWASP API Security:

* Registro de usuarios con nombre, correo, teléfono y contraseña mínima de 8 caracteres
* Verificación mediante código enviado por email (2FA)
* Inicio de sesión seguro con tokens JWT
* Recuperación de contraseña vía correo electrónico
* Middleware authMiddleware.mjs que protege todas las rutas críticas
* Hash de contraseñas con bcrypt
* Respuesta HTTP 401 en rutas sin token válido

# 📦 Módulos del sistema

#### 1. 🏠 Módulo de Inicio
Punto de entrada con identidad visual biomédica. Presenta el nombre del sistema y orienta al usuario desde el primer contacto.

#### 2. 🔐 Módulo de Login
Autenticación segura con validación de campos, mensajes de error descriptivos y verificación en dos pasos.

#### 3. 👤 Módulo de Registro de Usuarios
Creación de cuenta con verificación de correo real mediante código 2FA. Contraseña mínima de 8 caracteres.

#### 4. 📊 Panel de Control (Dashboard)
Centraliza la información más relevante en una sola vista:

* Total de equipos registrados
* Equipos operativos / en mantenimiento / fuera de servicio
* Lista de próximos mantenimientos con fechas
* Alertas y notificaciones activas
  
#### 5. 🏥 Módulo de Registro y Edición de Equipos
CRUD completo para dispositivos biomédicos con campos:

* Nombre, modelo, marca, ubicación, estado
* Último y próximo mantenimiento
* Técnico responsable y tipo de mantenimiento
* Historial de movimientos con auditoría por usuario
  
#### 6. 📁 Módulo de Generación de Reportes
Exportación en formato CSV con filtros por día, mes y año. Incluye información del usuario que realizó cada registro o cambio.

# 👨‍💻 Autores
Juan José González Dagua — Juan.gonzalez25@usc.edu.co

Andrés Felipe Rodríguez Zapata — Andres.rodriguez12@usc.edu.co

Willy Javier Franco Rodriguez — Willy.franco00@usc.edu.co

Jair Enrique Sanclemente Castro, M.Sc (director) — jairsanclemente00@usc.edu.co

Universidad Santiago de Cali · Facultad de Ingeniería · Programa de Ingeniería de Sistemas · 2026
