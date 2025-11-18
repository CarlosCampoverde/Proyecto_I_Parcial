# Guía de Despliegue con Persistencia de Datos

## 🎯 Solución Implementada

Se ha configurado **PostgreSQL** como base de datos persistente en Render para resolver el problema de pérdida de datos en cada deploy.

## 📋 Qué se cambió

### 1. Configuración de Render (`render.yaml`)
- ✅ Agregada base de datos PostgreSQL (`pserv`)
- ✅ Configurada variable `DATABASE_URL` automática
- ✅ Cambiado a `server-scalable.js` para usar PostgreSQL
- ✅ Agregada migración automática en cada deploy

### 2. Configuración de Base de Datos
- ✅ Actualizada `postgresDatabase.js` para usar `DATABASE_URL`
- ✅ Agregado soporte SSL para producción
- ✅ Configuración optimizada para Render

### 3. Scripts de Migración
- ✅ Creado `scripts/migrate.js` para inicializar la BD
- ✅ Agregados datos iniciales (sala de bienvenida)

## 🚀 Cómo Desplegar

### Opción 1: Despliegue Automático
1. Haz push de los cambios a tu repositorio
2. Render detectará los cambios y desplegará automáticamente
3. Se creará la base de datos PostgreSQL
4. Se ejecutarán las migraciones automáticamente

### Opción 2: Despliegue Manual en Render Dashboard
1. Ve a tu dashboard de Render
2. Busca tu servicio `chat-app`
3. Haz clic en "Manual Deploy"
4. Render creará la base de datos y desplegará la app

## 🗄️ Estructura de la Base de Datos

La base de datos PostgreSQL incluirá:
- **rooms**: Salas de chat con pins únicos
- **messages**: Mensajes persistentes  
- **users**: Usuarios conectados
- **room_users**: Relación usuarios-salas

## 🔧 Variables de Entorno

Render configurará automáticamente:
- `DATABASE_URL`: Conexión a PostgreSQL
- `USE_POSTGRES=true`: Activar PostgreSQL
- `NODE_ENV=production`: Modo producción

## 🧪 Para Desarrollo Local

Si quieres probar con PostgreSQL localmente:

```bash
# 1. Instalar PostgreSQL localmente
# 2. Crear base de datos
createdb chatapp

# 3. Configurar variables de entorno
cp backend/.env.example backend/.env

# 4. Editar .env con tus credenciales locales
USE_POSTGRES=true
DB_HOST=localhost
DB_NAME=chatapp
DB_USER=tu_usuario
DB_PASSWORD=tu_password

# 5. Ejecutar migraciones
npm run migrate

# 6. Iniciar servidor
npm run dev:scalable
```

## ✅ Beneficios de esta Solución

1. **Persistencia Total**: Los datos nunca se pierden
2. **Escalabilidad**: PostgreSQL maneja múltiples usuarios
3. **Rendimiento**: Optimizado para aplicaciones web
4. **Automatización**: Deploy sin intervención manual
5. **Gratuito**: Plan free de Render incluye PostgreSQL

## 🔍 Verificar que Funciona

Después del deploy:
1. Abre tu app en Render
2. Crea una sala de chat
3. Envía algunos mensajes
4. Redeploya la aplicación 
5. ✅ Los datos deben persistir

## 🆘 Solución de Problemas

### Si la migración falla:
```bash
# En el dashboard de Render, ir a logs y buscar errores
# Común: problemas de conexión a BD
```

### Si la conexión a BD falla:
- Verificar que `DATABASE_URL` esté configurada
- Comprobar que el servicio PostgreSQL esté activo
- Revisar logs de la base de datos en Render

### Para conectar a la BD directamente:
```bash
# Render proporciona la URL de conexión en el dashboard
psql $DATABASE_URL
```

## 📞 Siguiente Paso

¡Listo para deploy! Haz push de estos cambios y tu aplicación tendrá persistencia de datos completa.