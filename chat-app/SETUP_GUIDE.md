# 🚀 Guía Paso a Paso: Activar Persistencia de Datos

## 🎯 Objetivo
Cambiar de SQLite (datos se pierden) a PostgreSQL (datos persistentes) en Render.

---

## 📋 MÉTODO 1: Configuración Manual (RECOMENDADO)

### 🗄️ **PASO 1: Crear Base de Datos PostgreSQL**

1. Ve a **https://dashboard.render.com**
2. Haz clic en **"New +"** (botón azul)
3. Selecciona **"PostgreSQL"**
4. Completa el formulario:
   ```
   Name: chat-app-db
   Database: chatapp  
   User: chatuser
   Region: Oregon (US West)
   PostgreSQL Version: 15
   Plan: Free
   ```
5. Haz clic **"Create Database"**
6. **Espera** hasta que aparezca **"Available"** (verde)

### ⚙️ **PASO 2: Configurar Variables de Entorno**

1. Ve a tu servicio web existente (debería llamarse algo como `chat-app`)
2. En el menú izquierdo, haz clic en **"Environment"**
3. **Agregar/Modificar** estas variables:

   **Variable 1:**
   ```
   Key: USE_POSTGRES
   Value: true
   ```

   **Variable 2:**
   ```
   Key: DATABASE_URL
   Value: [Seleccionar "Add from Database"]
   Database: chat-app-db
   Property: Connection String
   ```

   **Variable 3:** (verificar que exista)
   ```
   Key: NODE_ENV  
   Value: production
   ```

   **Variable 4:** (verificar que exista)
   ```
   Key: PORT
   Value: 10000
   ```

4. Haz clic **"Save Changes"**

### 🔧 **PASO 3: Actualizar Comando de Inicio**

1. En tu servicio web, ve a **"Settings"**
2. Busca **"Start Command"**
3. Cambia a:
   ```bash
   cd backend && npm run migrate && node server-scalable.js
   ```
4. Haz clic **"Save Changes"**

### 🚀 **PASO 4: Deploy Manual**

1. Ve a la pestaña principal de tu servicio web
2. Haz clic en **"Manual Deploy"** 
3. Selecciona branch **"main"**
4. Haz clic **"Deploy"**

### 🔍 **PASO 5: Verificar en Logs**

1. Ve a **"Logs"** en tu servicio web
2. Busca estos mensajes exitosos:
   ```
   ✅ Migración completada exitosamente
   ✅ Conectado a PostgreSQL  
   ✅ Tablas creadas y base de datos lista
   [Worker 123] corriendo en puerto 10000
   ```

3. **Si ves errores**, revisa la sección de "Solución de Problemas" abajo

---

## 📋 MÉTODO 2: Blueprint Deploy (Alternativo)

### **OPCIÓN A: Usar render.yaml completo**
1. En Render Dashboard, **"New +"** → **"Blueprint"**
2. Conectar repositorio GitHub
3. Usar archivo `render.yaml` del proyecto
4. **"Apply Blueprint"**

### **OPCIÓN B: Usar render-simple.yaml**
1. Renombrar `render-simple.yaml` a `render.yaml`
2. Hacer push a GitHub
3. Seguir pasos manuales para PostgreSQL

---

## 🧪 **Verificar que Funciona**

### Test de Persistencia:
1. **Abrir tu aplicación** desplegada
2. **Crear una sala** de chat
3. **Enviar mensajes**
4. **Hacer un nuevo deploy** (cambio en GitHub + push)
5. **✅ Verificar que los datos siguen ahí**

### Test de Conexión Única:
1. **Abrir dos pestañas** de tu app
2. **Conectarse desde ambas**
3. **✅ Solo una debería quedar conectada**

---

## 🚨 **Solución de Problemas**

### ❌ Error: "Database connection failed"
**Causa**: DATABASE_URL no configurada o BD no disponible
**Solución**:
- Verificar que PostgreSQL esté "Available" (verde)
- Reconfigurar DATABASE_URL desde la base de datos
- Hacer nuevo deploy manual

### ❌ Error: "Migration failed" 
**Causa**: Error en script de migración
**Solución**:
```bash
# Cambiar Start Command temporalmente a:
cd backend && node server-scalable.js

# Después de que funcione, volver a:
cd backend && npm run migrate && node server-scalable.js
```

### ❌ Sigue usando SQLite
**Causa**: USE_POSTGRES no está en true
**Solución**:
- Verificar variable `USE_POSTGRES=true`
- Hacer deploy manual
- Revisar logs para confirmar PostgreSQL

### ❌ Error: "Port already in use"
**Causa**: Variable PORT incorrecta
**Solución**:
- Verificar `PORT=10000` 
- No usar puerto 3000 en producción

---

## ✅ **Resultado Final**

Después de completar estos pasos:

- ✅ **Datos persistentes**: Salas y mensajes se mantienen
- ✅ **Sin pérdidas**: Deploys no borran información  
- ✅ **Mejor rendimiento**: PostgreSQL > SQLite
- ✅ **Escalable**: Soporta más usuarios concurrentes
- ✅ **Sesión única**: Una conexión por IP

---

## 📞 **¿Necesitas Ayuda?**

Si algo no funciona:
1. **Copiar logs de error** exactos
2. **Verificar estado** de PostgreSQL (debe estar verde)
3. **Confirmar variables** de entorno 
4. **Probar deploy manual** nuevamente

¡Con estos pasos tendrás persistencia de datos garantizada! 🎉