# Almacén App - Sistema de Gestión de Inventario

**Aplicación React Native + Express.js + Supabase** para gestión integral de equipos, revisiones técnicas e inventario.

---

## 📱 Características

- ✅ **Consulta de Equipos**: Busca equipos por número de serie con QR scanner
- ✅ **Modificación CRUD**: Crear, leer, actualizar y eliminar equipos
- ✅ **Revisiones Técnicas**: Registro de diagnósticos y revisiones
- ✅ **Historial**: Seguimiento completo de cambios por equipo
- ✅ **Gestión de Inventario**: Interfaz intuitiva para control de activos
- ✅ **Sincronización**: Base de datos en tiempo real con Supabase

---

## 🏗️ Arquitectura

```
Almacen-app/
├── mi-app/                    # Frontend React Native (Expo)
│   ├── Consulta.js           # Pantalla de búsqueda de equipos
│   ├── InventarioModificar.js # CRUD de equipos
│   ├── menu.js               # Menú principal
│   ├── config.js             # Configuración de URLs (dinámico)
│   └── ...
├── Back-end/
│   ├── src/
│   │   ├── index.js          # Servidor Express
│   │   ├── routes/
│   │   │   ├── equipos.js    # Rutas CRUD
│   │   │   └── revisiones.js # Rutas de diagnósticos
│   │   ├── config/
│   │   │   └── supabase.js   # Cliente Supabase
│   │   └── middleware/       # Manejo de errores
│   ├── .env.example          # Ejemplo de variables
│   ├── Procfile              # Para Render
│   └── package.json
├── app.json                  # Configuración Expo
├── eas.json                  # Configuración EAS Build
└── DEPLOYMENT.md             # Guía de despliegue
```

---

## 🚀 Quick Start

### 1. Clonar repositorio

```bash
git clone <repo-url>
cd Almacen-app
```

### 2. Instalar dependencias

```bash
# Frontend
npm install

# Backend
cd Back-end
npm install
cd ..
```

### 3. Configurar variables de entorno

```bash
# Backend
cp Back-end/.env.example Back-end/.env
# Editar Back-end/.env con tus credenciales de Supabase
```

### 4. Ejecutar en desarrollo

```bash
# Terminal 1: Backend
cd Back-end
npm run dev

# Terminal 2: Frontend (desde raíz)
npm start
```

---

## 📚 Estructura de Base de Datos

### Tabla: `equipos`
```sql
- id_equipo (UUID, PK)
- numero_serie (VARCHAR, UNIQUE)
- tipo_equipo (VARCHAR)
- marca (VARCHAR)
- modelo (VARCHAR)
- procesador (VARCHAR)
- almacenamiento (VARCHAR)
- dueno (VARCHAR)
- fecha_ingreso (TIMESTAMP)
- fecha_registro (TIMESTAMP)
- created_at (TIMESTAMP)
```

### Tabla: `diagnosticos`
```sql
- id_diagnostico (UUID, PK)
- numero_serie (VARCHAR, FK → equipos)
- id_equipo (UUID, FK → equipos)
- id_empleado (UUID, FK → empleados)
- detalles_revision (JSONB)
- estatus_final (VARCHAR)
- observaciones_extra (TEXT)
- created_at (TIMESTAMP)
```

---

## 🔄 Flujo de Datos

```
Frontend (React Native)
    ↓
API Local (http://localhost:3000) - En desarrollo
    ↓ O
API Render (https://almacen-app-backend.onrender.com) - En producción
    ↓
Backend Express
    ↓
Supabase API
    ↓
PostgreSQL Database
```

---

## 🛠️ Endpoints Backend

### Equipos
- `GET /api/equipos/:numero_serie` - Obtener equipo y último diagnóstico
- `POST /api/equipos` - Crear nuevo equipo
- `PATCH /api/equipos/:numero_serie` - Actualizar equipo
- `DELETE /api/equipos/:numero_serie` - Eliminar equipo

### Revisiones
- `GET /api/revisiones` - Listar todas las revisiones
- `GET /api/revisiones/:id` - Obtener revisión específica
- `POST /api/revisiones` - Crear nueva revisión
- `DELETE /api/revisiones/:id` - Eliminar revisión

---

## 📦 Compilación & Despliegue

### Generar APK con EAS CLI

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Autenticarse
eas login

# Build para Android (APK)
eas build --platform android

# Descargar e instalar
adb install almacen-app.apk
```

### Desplegar Backend en Render

```bash
# 1. Pushear cambios a Git
git add .
git commit -m "Update backend"
git push

# 2. Render auto-redeploya desde el repositorio
# O usar Render Dashboard para Deploy
```

**Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para guía completa.**

---

## 🔒 Seguridad

- ✅ Backend usa **Service Role Key** de Supabase
- ✅ RLS (Row Level Security) habilitado en Supabase
- ✅ CORS configurado para múltiples orígenes
- ✅ Validación de entrada en todos los endpoints
- ✅ Manejo centralizado de errores

---

## 🐛 Troubleshooting

### "Cannot connect to localhost:3000"
- Verificar que el backend esté corriendo
- En APK, debe apuntar a la URL de Render, no a localhost

### "CORS error"
- El backend ya incluye CORS configurado
- Verificar `index.js` en Back-end/src

### "Supabase connection failed"
- Verificar variables de entorno en `.env`
- Confirmar que las claves son válidas en Supabase Dashboard

### "APK no se instala"
- Verificar compatibilidad Android API level
- Usar `adb logcat` para ver errores

---

## 📖 Documentación

- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Render Docs](https://render.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Express.js Docs](https://expressjs.com/)
- [React Native Docs](https://reactnative.dev/)

---

## 👨‍💻 Desarrollo

### Stack Tecnológico

**Frontend:**
- React Native (Expo)
- Context API para estado global
- Fetch API para HTTP requests

**Backend:**
- Express.js
- Node.js
- CORS habilitado
- Dotenv para configuración

**Base de Datos:**
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Foreign Keys

---

## 📝 Commits y Versionamiento

```bash
# Versionamiento semántico
v1.0.0 - Release inicial
v1.1.0 - Feature: CRUD de equipos
v1.2.0 - Feature: Despliegue en Render

# Workflow de commits
git checkout -b feature/nueva-pantalla
git commit -m "feat: agregar pantalla XYZ"
git push origin feature/nueva-pantalla
# Crear Pull Request
```

---

## 📱 Requisitos del Sistema

- **Frontend:**
  - Node.js 16+
  - npm o yarn
  - Android SDK 21+ (para APK)
  - Expo CLI

- **Backend:**
  - Node.js 18+
  - npm 8+

- **Supabase:**
  - Proyecto activo
  - Tablas configuradas
  - Service Role Key válida

---

## 🎯 Roadmap

- [ ] Notificaciones push
- [ ] Sincronización offline
- [ ] Reportes PDF
- [ ] Auditoría de cambios
- [ ] Autenticación de usuarios
- [ ] Multi-lenguaje (i18n)
- [ ] Dark mode completo

---

## 📄 Licencia

MIT

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisar [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Consultar logs con `adb logcat` (Android)
3. Verificar Render/Supabase dashboards
4. Contactar al equipo de desarrollo
