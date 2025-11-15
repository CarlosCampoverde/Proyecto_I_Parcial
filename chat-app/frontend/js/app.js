// Chat App - JavaScript Principal
class ChatApp {
    constructor() {
        this.socket = null;
        this.currentRoom = null;
        this.currentUser = null;
        this.isConnected = false;
        this.typingTimer = null;
        this.typingUsers = new Set();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showWelcomeSection();
    }

    // Configurar eventos del DOM
    setupEventListeners() {
        // Navegación principal
        document.getElementById('adminBtn').addEventListener('click', () => this.showAdminSection());
        
        // Formularios de usuario
        document.getElementById('joinForm').addEventListener('submit', (e) => this.handleJoinRoom(e));
        
        // Formularios de administrador
        document.getElementById('adminLoginForm').addEventListener('submit', (e) => this.handleAdminLogin(e));
        document.getElementById('adminRegisterForm').addEventListener('submit', (e) => this.handleAdminRegister(e));
        document.getElementById('createRoomForm').addEventListener('submit', (e) => this.handleCreateRoom(e));
        
        // Cambio entre login y registro
        document.getElementById('showRegisterBtn').addEventListener('click', () => this.showAdminRegister());
        document.getElementById('showLoginBtn').addEventListener('click', () => this.showAdminLogin());
        
        // Acciones de administrador
        document.getElementById('refreshRoomsBtn').addEventListener('click', () => this.loadRooms());
        
        // Chat
        document.getElementById('messageForm').addEventListener('submit', (e) => this.handleSendMessage(e));
        document.getElementById('messageInput').addEventListener('input', () => this.handleTyping());
        document.getElementById('leaveRoomBtn').addEventListener('click', () => this.leaveRoom());
        document.getElementById('toggleUsersBtn').addEventListener('click', () => this.toggleUsersPanel());
        
        // Subida de archivos
        document.getElementById('fileUploadBtn').addEventListener('click', () => this.openFileSelector());
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Notificaciones
        document.getElementById('closeNotification').addEventListener('click', () => this.hideNotification());
        
        // Validación en tiempo real
        document.getElementById('nickname').addEventListener('input', (e) => this.validateNickname(e.target.value));
        document.getElementById('roomPin').addEventListener('input', (e) => this.validatePin(e.target.value));
    }

    // Inicializar Socket.IO
    initSocket() {
        if (this.socket) {
            this.socket.disconnect();
        }

        this.socket = io();
        
        // Eventos de conexión
        this.socket.on('connect', () => {
            console.log('Conectado al servidor');
            this.isConnected = true;
        });

        this.socket.on('disconnect', () => {
            console.log('Desconectado del servidor');
            this.isConnected = false;
            this.showNotification('Desconectado del servidor', 'error');
        });

        // Eventos del chat
        this.socket.on('joinedRoom', (data) => this.handleJoinedRoom(data));
        this.socket.on('newMessage', (data) => this.handleNewMessage(data));
        this.socket.on('messageHistory', (data) => this.handleMessageHistory(data));
        this.socket.on('userJoined', (data) => this.handleUserJoined(data));
        this.socket.on('userLeft', (data) => this.handleUserLeft(data));
        this.socket.on('updateUserList', (data) => this.handleUpdateUserList(data));
        this.socket.on('userTyping', (data) => this.handleUserTyping(data));
        this.socket.on('error', (data) => this.handleSocketError(data));
    }

    // Mostrar secciones
    showWelcomeSection() {
        this.hideAllSections();
        document.getElementById('welcomeSection').style.display = 'block';
    }

    showAdminSection() {
        this.hideAllSections();
        document.getElementById('adminSection').style.display = 'block';
        this.showAdminLogin();
    }

    showAdminLogin() {
        document.getElementById('adminLogin').style.display = 'block';
        document.getElementById('adminRegister').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'none';
    }

    showAdminRegister() {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminRegister').style.display = 'block';
        document.getElementById('adminDashboard').style.display = 'none';
    }

    showAdminDashboard() {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminRegister').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        this.loadRooms();
    }

    showChatSection() {
        this.hideAllSections();
        document.getElementById('chatSection').style.display = 'block';
        this.initSocket();
    }

    hideAllSections() {
        document.getElementById('welcomeSection').style.display = 'none';
        document.getElementById('adminSection').style.display = 'none';
        document.getElementById('chatSection').style.display = 'none';
    }

    // Validaciones
    validateNickname(nickname) {
        const nicknameInput = document.getElementById('nickname');
        const isValid = /^[a-zA-Z0-9\-_]{2,20}$/.test(nickname);
        
        if (nickname.length === 0) {
            nicknameInput.style.borderColor = '#e9ecef';
            return true;
        }
        
        nicknameInput.style.borderColor = isValid ? '#28a745' : '#dc3545';
        return isValid;
    }

    validatePin(pin) {
        const pinInput = document.getElementById('roomPin');
        const isValid = /^\d{6}$/.test(pin);
        
        if (pin.length === 0) {
            pinInput.style.borderColor = '#e9ecef';
            return true;
        }
        
        pinInput.style.borderColor = isValid ? '#28a745' : '#dc3545';
        return isValid;
    }

    // Manejo de eventos del formulario
    async handleJoinRoom(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const nickname = formData.get('nickname').trim();
        const pin = formData.get('roomPin').trim();
        
        if (!this.validateNickname(nickname)) {
            this.showNotification('Nickname inválido. Use solo letras, números, guiones y guiones bajos (2-20 caracteres)', 'error');
            return;
        }
        
        if (!this.validatePin(pin)) {
            this.showNotification('PIN debe tener exactamente 6 dígitos', 'error');
            return;
        }

        this.showLoading();
        
        try {
            // Validar PIN en el servidor
            const response = await fetch(`/api/rooms/validate-pin/${pin}`);
            const result = await response.json();
            
            if (result.success) {
                this.currentUser = { nickname, pin };
                this.showChatSection();
                
                // Intentar unirse a la sala
                this.socket.emit('joinRoom', { nickname, pin });
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Error validando PIN:', error);
            this.showNotification('Error de conexión. Inténtalo más tarde.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleAdminLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const credentials = {
            username: formData.get('username').trim(),
            password: formData.get('password')
        };

        this.showLoading();
        
        try {
            const response = await fetch('/api/auth/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Login exitoso', 'success');
                this.showAdminDashboard();
                e.target.reset();
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Error en login:', error);
            this.showNotification('Error de conexión', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleAdminRegister(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userData = {
            username: formData.get('username').trim(),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword')
        };

        if (userData.password !== userData.confirmPassword) {
            this.showNotification('Las contraseñas no coinciden', 'error');
            return;
        }

        this.showLoading();
        
        try {
            const response = await fetch('/api/auth/admin/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Registro exitoso', 'success');
                this.showAdminLogin();
                e.target.reset();
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Error en registro:', error);
            this.showNotification('Error de conexión', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleCreateRoom(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const roomData = {
            name: formData.get('name').trim(),
            type: formData.get('type'),
            adminPassword: formData.get('adminPassword') || null
        };

        this.showLoading();
        
        try {
            const response = await fetch('/api/rooms/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roomData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(`Sala creada. PIN: ${result.room.pin}`, 'success');
                this.loadRooms();
                e.target.reset();
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Error creando sala:', error);
            this.showNotification('Error de conexión', 'error');
        } finally {
            this.hideLoading();
        }
    }

    handleSendMessage(e) {
        e.preventDefault();
        
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message || !this.socket || !this.isConnected) {
            return;
        }
        
        this.socket.emit('sendMessage', { message });
        messageInput.value = '';
        this.stopTyping();
    }

    handleTyping() {
        if (!this.socket || !this.isConnected) return;
        
        // Enviar evento de "escribiendo"
        this.socket.emit('typing', { isTyping: true });
        
        // Limpiar timer anterior
        clearTimeout(this.typingTimer);
        
        // Parar de escribir después de 1 segundo de inactividad
        this.typingTimer = setTimeout(() => {
            this.stopTyping();
        }, 1000);
    }

    stopTyping() {
        if (this.socket && this.isConnected) {
            this.socket.emit('typing', { isTyping: false });
        }
        clearTimeout(this.typingTimer);
    }

    // Manejo de eventos Socket.IO
    handleJoinedRoom(data) {
        this.currentRoom = data;
        document.getElementById('currentRoomName').textContent = data.roomName;
        document.getElementById('currentRoomType').textContent = `Tipo: ${data.roomType === 'text' ? 'Solo Texto' : 'Texto y Archivos'}`;
        
        // Mostrar botón de subida de archivos si es sala multimedia
        const fileUploadBtn = document.getElementById('fileUploadBtn');
        fileUploadBtn.style.display = data.roomType === 'multimedia' ? 'block' : 'none';
        
        this.showNotification(`Te has unido a la sala: ${data.roomName}`, 'success');
        this.hideLoading();
    }

    handleNewMessage(data) {
        this.addMessageToChat(data);
        this.scrollToBottom();
    }

    handleMessageHistory(messages) {
        const container = document.getElementById('messagesContainer');
        container.innerHTML = '';
        
        messages.forEach(message => {
            this.addMessageToChat(message, false);
        });
        
        this.scrollToBottom();
    }

    handleUserJoined(data) {
        this.addSystemMessage(data.message);
    }

    handleUserLeft(data) {
        this.addSystemMessage(data.message);
    }

    handleUpdateUserList(data) {
        const usersList = document.getElementById('usersList');
        const userCount = document.getElementById('userCount');
        
        usersList.innerHTML = '';
        userCount.textContent = data.users.length;
        
        data.users.forEach(username => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            userElement.textContent = username;
            usersList.appendChild(userElement);
        });
    }

    handleUserTyping(data) {
        const indicator = document.getElementById('typingIndicator');
        const text = document.getElementById('typingText');
        
        if (data.isTyping) {
            this.typingUsers.add(data.nickname);
        } else {
            this.typingUsers.delete(data.nickname);
        }
        
        if (this.typingUsers.size > 0) {
            const users = Array.from(this.typingUsers);
            let typingText = '';
            
            if (users.length === 1) {
                typingText = `${users[0]} está escribiendo...`;
            } else if (users.length === 2) {
                typingText = `${users[0]} y ${users[1]} están escribiendo...`;
            } else {
                typingText = `${users.length} usuarios están escribiendo...`;
            }
            
            text.textContent = typingText;
            indicator.style.display = 'block';
        } else {
            indicator.style.display = 'none';
        }
    }

    handleSocketError(data) {
        this.showNotification(data.message, 'error');
        this.hideLoading();
    }

    // Funciones del chat
    addMessageToChat(message, animate = true) {
        const container = document.getElementById('messagesContainer');
        const messageElement = document.createElement('div');
        
        const isOwnMessage = message.nickname === this.currentUser.nickname;
        messageElement.className = `message ${isOwnMessage ? 'own' : 'other'}`;
        
        const time = new Date(message.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        let content = `
            <div class="message-header">
                <span class="message-nickname">${message.nickname}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-content">${this.escapeHtml(message.message)}</div>
        `;
        
        // Agregar información de archivo si es necesario
        if (message.type === 'file' || message.type === 'image') {
            content += `
                <div class="file-message">
                    <i class="fas ${message.type === 'image' ? 'fa-image' : 'fa-file'} file-icon"></i>
                    <div class="file-info">
                        <div class="file-name">${message.fileName}</div>
                        <a href="${message.filePath}" target="_blank" class="btn btn-sm btn-primary">Descargar</a>
                    </div>
                </div>
            `;
        }
        
        messageElement.innerHTML = content;
        
        if (animate) {
            messageElement.style.opacity = '0';
            messageElement.style.transform = 'translateY(20px)';
        }
        
        container.appendChild(messageElement);
        
        if (animate) {
            setTimeout(() => {
                messageElement.style.transition = 'all 0.3s ease';
                messageElement.style.opacity = '1';
                messageElement.style.transform = 'translateY(0)';
            }, 10);
        }
    }

    addSystemMessage(message) {
        const container = document.getElementById('messagesContainer');
        const messageElement = document.createElement('div');
        messageElement.className = 'system-message';
        messageElement.textContent = message;
        container.appendChild(messageElement);
        this.scrollToBottom();
    }

    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        container.scrollTop = container.scrollHeight;
    }

    // Funciones de archivos
    openFileSelector() {
        document.getElementById('fileInput').click();
    }

    async handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tamaño (10MB máximo)
        if (file.size > 10 * 1024 * 1024) {
            this.showNotification('El archivo es demasiado grande (máximo 10MB)', 'error');
            return;
        }

        this.showLoading();

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('nickname', this.currentUser.nickname);

            const response = await fetch(`/api/rooms/${this.currentRoom.roomId}/upload`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Archivo subido exitosamente', 'success');
                // El mensaje aparecerá automáticamente vía Socket.IO
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Error subiendo archivo:', error);
            this.showNotification('Error subiendo archivo', 'error');
        } finally {
            this.hideLoading();
            e.target.value = '';
        }
    }

    // Funciones de administración
    async loadRooms() {
        try {
            const response = await fetch('/api/rooms/list');
            const result = await response.json();
            
            if (result.success) {
                this.displayRooms(result.data);
            } else {
                this.showNotification('Error cargando salas', 'error');
            }
        } catch (error) {
            console.error('Error cargando salas:', error);
            this.showNotification('Error de conexión', 'error');
        }
    }

    displayRooms(rooms) {
        const container = document.getElementById('roomsList');
        container.innerHTML = '';
        
        if (rooms.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No hay salas creadas</p>';
            return;
        }
        
        rooms.forEach(room => {
            const roomCard = document.createElement('div');
            roomCard.className = 'room-card';
            
            const createdAt = new Date(room.created_at).toLocaleString('es-ES');
            
            roomCard.innerHTML = `
                <div class="room-card-header">
                    <h5>${room.name}</h5>
                    <span class="room-type-badge ${room.type}">${room.type}</span>
                </div>
                <div class="room-info">
                    <strong>PIN:</strong> ${room.pin}<br>
                    <strong>Creado:</strong> ${createdAt}
                </div>
                <div class="room-actions">
                    <button class="btn btn-sm btn-info" onclick="chatApp.showRoomStats(${room.id})">
                        <i class="fas fa-chart-bar"></i> Estadísticas
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="chatApp.deactivateRoom(${room.id})">
                        <i class="fas fa-ban"></i> Desactivar
                    </button>
                </div>
            `;
            
            container.appendChild(roomCard);
        });
    }

    async showRoomStats(roomId) {
        try {
            const response = await fetch(`/api/rooms/${roomId}/stats`);
            const result = await response.json();
            
            if (result.success) {
                const stats = result.data;
                alert(`Estadísticas de la sala:
                
Nombre: ${stats.room.name}
Mensajes totales: ${stats.totalMessages}
Usuarios únicos: ${stats.uniqueUsers}
Primer mensaje: ${stats.firstMessage ? new Date(stats.firstMessage).toLocaleString('es-ES') : 'N/A'}
Último mensaje: ${stats.lastMessage ? new Date(stats.lastMessage).toLocaleString('es-ES') : 'N/A'}`);
            }
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            this.showNotification('Error obteniendo estadísticas', 'error');
        }
    }

    async deactivateRoom(roomId) {
        if (!confirm('¿Estás seguro de desactivar esta sala?')) {
            return;
        }

        try {
            const response = await fetch(`/api/rooms/${roomId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Sala desactivada exitosamente', 'success');
                this.loadRooms();
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Error desactivando sala:', error);
            this.showNotification('Error de conexión', 'error');
        }
    }

    // Funciones de UI
    leaveRoom() {
        if (this.socket) {
            this.socket.disconnect();
        }
        this.currentRoom = null;
        this.currentUser = null;
        this.typingUsers.clear();
        this.showWelcomeSection();
        this.showNotification('Has salido de la sala', 'info');
    }

    toggleUsersPanel() {
        const panel = document.getElementById('usersPanel');
        panel.classList.toggle('active');
    }

    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const text = document.getElementById('notificationText');
        
        notification.className = `notification ${type}`;
        text.textContent = message;
        notification.style.display = 'flex';
        
        setTimeout(() => {
            this.hideNotification();
        }, 5000);
    }

    hideNotification() {
        document.getElementById('notification').style.display = 'none';
    }

    // Utilidades
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar la aplicación
const chatApp = new ChatApp();

// Hacer chatApp global para los event handlers inline
window.chatApp = chatApp;