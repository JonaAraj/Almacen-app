# Guía de Despliegue - Almacén App

## 1. Requisitos Previos

- Node.js 18+ instalado
- Cuenta en [EAS Build](https://eas.build)
- Cuenta en [Render](https://render.com)
- Cuenta en Expo
- Git configurado
- Android SDK o acceso a EAS Build en la nube

---

## 2. Configuración del Backend para Render

### Paso 1: Preparar el Backend

En la carpeta `Back-end/`:

```bash
# Instalar dependencias
npm install

# Crear archivo .env basado en .env.example
cp .env.example .env
```

Llenar el archivo `.env` con:
```env
SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
PORT=3000
NODE_ENV=production
```

### Paso 2: Desplegar en Render

1. Ir a [Render Dashboard](https://dashboard.render.com)
2. Click en "New +" → "Web Service"
3. Conectar repositorio Git o subir manualmente
4. Configurar:
   - **Name**: `almacen-app-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (o Paid según necesidad)
   - **Root Directory**: `Back-end`

5. Agregar variables de entorno:
   - `SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NODE_ENV=production`

6. Hacer Deploy

> Si Render detecta la rama raíz, el archivo `Procfile` en la raíz ya fuerza el inicio del servicio con `npm run backend:start`.
>
> El backend estará disponible en: `https://almacen-app-backend.onrender.com`

---

## 3. Configuración de la App React Native para EAS Build

### Paso 1: Instalar EAS CLI

```bash
npm install -g eas-cli
```

### Paso 2: Autenticarse con Expo

```bash
eas login
```

### Paso 3: Actualizar app.json

El archivo ya contiene:
```json
{
  "expo": {
    "name": "almacen-app",
    "slug": "almacen-app",
    "owner": "jonaraj",
    "extra": {
      "eas": {
        "projectId": "510bccaa-07f5-463f-8b91-b843ff1ed716"
      }
    }
  }
}
```

### Paso 4: Crear Build para Android (APK)

En la raíz del proyecto:

```bash
# Build local para desarrollo (APK)
eas build --platform android --local

# O build en la nube (recomendado)
eas build --platform android
```

El proceso:
1. Subirá el código a EAS
2. Compilará el APK en la nube
3. Te dará un link para descargar el APK
4. Podrás instalar en tu dispositivo Android

### Paso 5: Descarga e Instalación

```bash
# Una vez completado el build, EAS te dará un link para descargar
# O puedes obtener el último build con:
eas build:list --platform android
```

Instalar en el dispositivo:
```bash
adb install path/to/almacen-app.apk
```

---

## 4. Variables de Entorno - Flujo Completo

### Frontend (app.json)
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://almacen-app-backend.onrender.com"
    }
  }
}
```

### Backend (.env en Render)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
PORT=3000
NODE_ENV=production
```

La app automáticamente:
- En desarrollo local: usa `http://localhost:3000`
- En producción (APK): usa `https://almacen-app-backend.onrender.com`

---

## 5. Flujo de Despliegue Completo

### Primera Vez:

```bash
# 1. Backend
cd Back-end
npm install
# configurar .env
# pushear a git
# desplegar en Render (desde dashboard)

# 2. Frontend
cd ..
npm install
eas login
eas build --platform android
# descargar APK desde el link proporcionado

# 3. Instalar en dispositivo
adb install build/almacen-app.apk
```

### Actualizaciones Posteriores:

```bash
# Backend
cd Back-end
git add .
git commit -m "Update backend"
git push
# Render auto-redeploya

# Frontend
cd ..
# Cambiar versión en app.json
eas build --platform android
# Descargar y reinstalar APK
```

---

## 6. Troubleshooting

### El APK se conecta a localhost en lugar del backend

- Verificar que `__DEV__` está correctamente definido
- En APK, `__DEV__` es `false` automáticamente
- Si falla, actualizar manualmente en `mi-app/config.js`

### Backend en Render no responde

- Verificar que el `.env` tenga todas las variables
- Verificar logs en Render Dashboard
- Asegurar que Supabase Service Role Key es válida

### Error de CORS

- El backend ya incluye CORS configurado
- Si falta, agregar en `index.js`:
```javascript
app.use(cors({ origin: "*", methods: ["GET", "POST", "PATCH", "DELETE"] }));
```

---

## 7. URLs Importantes

- **Frontend EAS**: https://eas.build
- **Backend Render**: https://almacen-app-backend.onrender.com
- **Supabase**: https://supabase.com
- **App en Render**: https://almacen-app-backend.onrender.com (API base)

---

## 8. Notas Finales

- El APK está completamente funcional offline si todos los datos ya están en caché
- Para actualizaciones OTA (sin reinstalar APK), usar Expo Updates
- Los datos en Supabase se sincronizan automáticamente
- El backend es stateless y puede escalarse en Render si es necesario
