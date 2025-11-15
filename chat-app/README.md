# Chat App - Aplicación de Chat en Tiempo Real

Una aplicación de chat en tiempo real desarrollada con Node.js, Socket.IO y SQLite que permite la creación y gestión de salas de conversación seguras y colaborativas.

## Características Principales

### 🚀 Funcionalidades Core
- **Salas de Chat en Tiempo Real**: Comunicación instantánea mediante WebSockets
- **Gestión de Salas**: Crear salas de texto y multimedia con PINs únicos
- **Autenticación Segura**: Sistema de nicknames y validación de acceso
- **Sesión Única**: Control de una sesión por IP/dispositivo
- **Subida de Archivos**: Compartir imágenes y documentos en salas multimedia

### 🛡️ Seguridad
- Validación de nicknames y mensajes
- Rate limiting para prevenir spam
- Control de acceso mediante PINs de 6 dígitos
- Sesión única por dispositivo/IP
- Validación de tipos de archivo

### 🎨 Interfaz de Usuario
- Diseño responsivo y moderno
- Panel de administración completo
- Notificaciones en tiempo real
- Indicadores de escritura
- Lista de usuarios conectados

## Estructura del Proyecto

```
chat-app/
├── backend/                 # Servidor Node.js
│   ├── config/             # Configuración y base de datos
│   ├── middleware/         # Middleware personalizado
│   ├── models/             # Modelos de datos
│   │   ├── database.js     # Conexión y configuración de SQLite
│   │   ├── roomManager.js  # Gestión de salas
│   │   └── userManager.js  # Gestión de usuarios
│   ├── routes/             # Rutas de la API
│   │   ├── auth.js         # Autenticación
│   │   └── rooms.js        # Gestión de salas
│   ├── uploads/            # Archivos subidos
│   ├── package.json        # Dependencias del backend
│   └── server.js           # Servidor principal
├── frontend/               # Cliente web
│   ├── css/
│   │   └── styles.css      # Estilos principales
│   ├── js/
│   │   └── app.js          # Lógica del cliente
│   ├── assets/             # Recursos estáticos
│   └── index.html          # Página principal
└── README.md               # Este archivo
```

## Tecnologías Utilizadas

### Backend
- **Node.js**: Entorno de ejecución
- **Express.js**: Framework web
- **Socket.IO**: Comunicación en tiempo real
- **SQLite**: Base de datos embebida
- **Multer**: Manejo de archivos
- **bcryptjs**: Hashing de contraseñas
- **express-rate-limit**: Limitación de requests

### Frontend
- **HTML5/CSS3**: Estructura y estilos
- **JavaScript ES6+**: Lógica del cliente
- **Socket.IO Client**: Comunicación en tiempo real
- **Font Awesome**: Iconos

## Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   cd chat-app/backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar el servidor**
   ```bash
   # Modo desarrollo (con nodemon)
   npm run dev
   
   # Modo producción
   npm start
   ```

4. **Acceder a la aplicación**
   - Abrir navegador en: `http://localhost:3000`

## Uso de la Aplicación

### Para Administradores

1. **Registrarse como Administrador**
   - Hacer clic en "Administrador" en la esquina superior derecha
   - Registrar una nueva cuenta de administrador
   - Iniciar sesión con las credenciales

2. **Crear Salas de Chat**
   - En el panel de administración, completar el formulario "Crear Nueva Sala"
   - Elegir entre sala de "Solo Texto" o "Texto y Archivos"
   - El sistema generará automáticamente un PIN de 6 dígitos
   - Compartir el PIN con los usuarios

3. **Gestionar Salas**
   - Ver estadísticas de mensajes y usuarios
   - Desactivar salas cuando sea necesario
   - Monitorear la actividad en tiempo real

### Para Usuarios

1. **Unirse a una Sala**
   - Ingresar un nickname único (2-20 caracteres)
   - Introducir el PIN de 6 dígitos proporcionado por el administrador
   - Hacer clic en "Unirse al Chat"

2. **Chatear en Tiempo Real**
   - Escribir mensajes en la caja de texto inferior
   - Ver mensajes de otros usuarios instantáneamente
   - Observar indicadores de "escribiendo"

3. **Funciones Adicionales**
   - Ver lista de usuarios conectados
   - Subir archivos en salas multimedia (imágenes, PDFs, documentos)
   - Salir de la sala cuando termine la conversación

## Tipos de Salas

### Salas de Solo Texto
- Intercambio de mensajes de texto únicamente
- Máximo 500 caracteres por mensaje
- Ideal para conversaciones rápidas

### Salas Multimedia
- Mensajes de texto + subida de archivos
- Archivos soportados: imágenes (JPG, PNG, GIF, WEBP), PDFs, documentos de Word, archivos de texto
- Tamaño máximo: 10MB por archivo
- Perfect para colaboración y compartir recursos

## Seguridad y Limitaciones

### Controles de Seguridad
- **Rate Limiting**: Máximo 100 requests por IP cada 15 minutos
- **Validación de Entrada**: Sanitización de todos los inputs del usuario
- **Sesión Única**: Un usuario por IP/dispositivo simultáneamente
- **PINs Únicos**: Generación automática de PINs únicos de 6 dígitos

### Limitaciones Técnicas
- Mensajes: 500 caracteres máximo
- Archivos: 10MB máximo por archivo
- Nicknames: 2-20 caracteres (letras, números, guiones, guiones bajos)
- Salas: Máximo usuarios determinado por capacidad del servidor

## API Endpoints

### Autenticación (`/api/auth`)
- `POST /admin/login` - Login de administrador
- `POST /admin/register` - Registro de administrador
- `POST /validate-nickname` - Validar nickname
- `POST /validate-message` - Validar mensaje

### Salas (`/api/rooms`)
- `POST /create` - Crear nueva sala
- `GET /validate-pin/:pin` - Validar PIN de sala
- `GET /list` - Listar salas (admin)
- `GET /:id/stats` - Estadísticas de sala
- `GET /:id/messages` - Mensajes de sala
- `POST /:id/upload` - Subir archivo
- `DELETE /:id` - Desactivar sala

### WebSocket Events

#### Cliente → Servidor
- `joinRoom` - Unirse a sala
- `sendMessage` - Enviar mensaje
- `typing` - Indicador de escritura

#### Servidor → Cliente
- `joinedRoom` - Confirmación de unión
- `newMessage` - Nuevo mensaje
- `messageHistory` - Historial de mensajes
- `userJoined` - Usuario se unió
- `userLeft` - Usuario salió
- `updateUserList` - Actualizar lista de usuarios
- `userTyping` - Usuario escribiendo
- `error` - Error del servidor

## Base de Datos

### Tablas Principales

**rooms**
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT) - Nombre de la sala
- `type` (TEXT) - 'text' o 'multimedia'
- `pin` (TEXT UNIQUE) - PIN de 6 dígitos
- `admin_password` (TEXT) - Contraseña opcional
- `created_at` (DATETIME)
- `is_active` (BOOLEAN)

**messages**
- `id` (INTEGER PRIMARY KEY)
- `room_id` (INTEGER) - Referencia a rooms
- `nickname` (TEXT) - Nombre del usuario
- `message` (TEXT) - Contenido del mensaje
- `message_type` (TEXT) - 'text', 'file', 'image'
- `file_path` (TEXT) - Ruta del archivo (opcional)
- `file_name` (TEXT) - Nombre original (opcional)
- `timestamp` (DATETIME)

**admins**
- `id` (INTEGER PRIMARY KEY)
- `username` (TEXT UNIQUE)
- `password_hash` (TEXT)
- `created_at` (DATETIME)
- `is_active` (BOOLEAN)

## Desarrollo y Personalización

### Variables de Entorno Opcionales
```bash
PORT=3000                    # Puerto del servidor
DB_PATH=./config/chat.db    # Ruta de la base de datos
MAX_FILE_SIZE=10485760      # Tamaño máximo de archivo (10MB)
```

### Scripts Disponibles
```bash
npm start       # Iniciar servidor
npm run dev     # Servidor con nodemon (desarrollo)
npm test        # Ejecutar pruebas (cuando estén disponibles)
```

### Personalización de Estilos
Los estilos están definidos en `/frontend/css/styles.css` con variables CSS que pueden modificarse fácilmente:

```css
:root {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --success-color: #28a745;
    /* ... más variables */
}
```

## Troubleshooting

### Problemas Comunes

1. **Error de conexión a la base de datos**
   - Verificar que el directorio `backend/config` existe
   - Comprobar permisos de escritura

2. **Socket.IO no conecta**
   - Verificar que el servidor está corriendo
   - Comprobar firewall y puertos

3. **Archivos no se suben**
   - Verificar que el directorio `backend/uploads` existe
   - Comprobar permisos de escritura
   - Validar tamaño y tipo de archivo

4. **PIN no válido**
   - Verificar que el PIN tiene exactamente 6 dígitos
   - Comprobar que la sala está activa

### Logs del Servidor
El servidor registra eventos importantes en la consola:
- Conexiones de usuarios
- Creación de salas
- Errores de validación
- Eventos de Socket.IO

## Licencia

MIT License - Consultar archivo LICENSE para más detalles.

## Contribución

1. Fork del repositorio
2. Crear rama para nueva funcionalidad
3. Commit de cambios
4. Push a la rama
5. Crear Pull Request

## Contacto y Soporte

Para reportar bugs o solicitar funcionalidades, crear un issue en el repositorio del proyecto.