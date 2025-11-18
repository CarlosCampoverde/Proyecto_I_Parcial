#!/bin/bash

# Script para verificar el estado de tu aplicación desplegada
# Úsalo para diagnosticar problemas de persistencia

echo "🔍 VERIFICANDO ESTADO DE LA APLICACIÓN DESPLEGADA"
echo "================================================="
echo ""

# Verificar si existe URL de la aplicación
if [ -z "$1" ]; then
    echo "❌ Uso: ./check-deployment.sh <URL_DE_TU_APP>"
    echo "   Ejemplo: ./check-deployment.sh https://tu-app.onrender.com"
    exit 1
fi

APP_URL="$1"
echo "🌐 URL de la aplicación: $APP_URL"
echo ""

# Verificar conectividad básica
echo "📡 Verificando conectividad..."
if curl -s --head "$APP_URL" | head -n 1 | grep "200 OK" > /dev/null; then
    echo "✅ Aplicación responde correctamente"
else
    echo "❌ Aplicación no responde o tiene errores"
    echo "   → Revisar logs en Render Dashboard"
fi
echo ""

# Verificar health endpoint (si existe)
echo "🏥 Verificando health endpoint..."
HEALTH_URL="$APP_URL/health"
if curl -s "$HEALTH_URL" > /dev/null 2>&1; then
    echo "✅ Health endpoint disponible"
else
    echo "⚠️  Health endpoint no disponible (normal si no está implementado)"
fi
echo ""

# Verificar socket.io
echo "🔌 Verificando Socket.IO..."
SOCKET_URL="$APP_URL/socket.io/"
if curl -s "$SOCKET_URL" | grep -q "socket.io"; then
    echo "✅ Socket.IO disponible"
else   
    echo "❌ Socket.IO no disponible"
    echo "   → Posible problema en el servidor"
fi
echo ""

# Información sobre base de datos
echo "🗄️ INFORMACIÓN SOBRE BASE DE DATOS:"
echo "-----------------------------------"
echo "Para verificar qué base de datos se está usando:"
echo "1. Ve a Render Dashboard → Tu servicio → Logs"
echo "2. Busca estos mensajes al iniciar:"
echo "   ✅ 'Conectado a PostgreSQL' = Datos persistentes"
echo "   ⚠️  'Conectado a la base de datos SQLite' = Datos se pierden"
echo ""

echo "💡 PRÓXIMOS PASOS:"
echo "------------------"
if curl -s --head "$APP_URL" | head -n 1 | grep "200 OK" > /dev/null; then
    echo "1. ✅ Tu app funciona básicamente"
    echo "2. 🔍 Revisar logs para confirmar tipo de BD"
    echo "3. 🗄️ Si usa SQLite, seguir SETUP_GUIDE.md"
    echo "4. 🧪 Probar persistencia creando salas/mensajes"
else
    echo "1. ❌ Hay problemas de conectividad"
    echo "2. 🔍 Revisar logs en Render Dashboard"
    echo "3. 🔧 Verificar configuración de variables de entorno"
    echo "4. 🚀 Probar deploy manual"
fi
echo ""

echo "📖 Documentación disponible:"
echo "   → SETUP_GUIDE.md (configuración paso a paso)"
echo "   → RENDER_SETUP.md (configuración PostgreSQL)"
echo "   → SESSION_CONTROL.md (control de sesiones)"
echo ""
echo "🎯 ¡Tu objetivo: ver 'Conectado a PostgreSQL' en los logs!"