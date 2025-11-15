const { v4: uuidv4 } = require('uuid');

class RoomManager {
    constructor(database) {
        this.db = database;
    }

    // Generar PIN único de 6 dígitos
    generatePin() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Crear nueva sala
    async createRoom(roomData) {
        const { name, type, adminPassword } = roomData;
        
        // Validaciones
        if (!name || name.length < 3 || name.length > 50) {
            throw new Error('El nombre de la sala debe tener entre 3 y 50 caracteres');
        }

        if (!['text', 'multimedia'].includes(type)) {
            throw new Error('Tipo de sala inválido. Debe ser "text" o "multimedia"');
        }

        let pin;
        let attempts = 0;
        const maxAttempts = 10;

        // Generar PIN único
        do {
            pin = this.generatePin();
            const existing = await this.db.get('SELECT id FROM rooms WHERE pin = ?', [pin]);
            if (!existing) break;
            attempts++;
        } while (attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            throw new Error('No se pudo generar un PIN único. Inténtalo más tarde.');
        }

        try {
            const result = await this.db.run(
                `INSERT INTO rooms (name, type, pin, admin_password) 
                 VALUES (?, ?, ?, ?)`,
                [name, type, pin, adminPassword || null]
            );

            return {
                id: result.id,
                name,
                type,
                pin,
                created_at: new Date().toISOString()
            };
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                throw new Error('Ya existe una sala con ese PIN. Inténtalo de nuevo.');
            }
            throw error;
        }
    }

    // Obtener sala por PIN
    async getRoomByPin(pin) {
        if (!pin || pin.length !== 6) {
            return null;
        }

        return await this.db.get(
            'SELECT * FROM rooms WHERE pin = ? AND is_active = 1',
            [pin]
        );
    }

    // Obtener sala por ID
    async getRoomById(id) {
        return await this.db.get(
            'SELECT * FROM rooms WHERE id = ? AND is_active = 1',
            [id]
        );
    }

    // Listar todas las salas activas (para administrador)
    async getAllRooms() {
        return await this.db.all(
            'SELECT id, name, type, pin, created_at FROM rooms WHERE is_active = 1 ORDER BY created_at DESC'
        );
    }

    // Desactivar sala
    async deactivateRoom(id) {
        const result = await this.db.run(
            'UPDATE rooms SET is_active = 0 WHERE id = ?',
            [id]
        );
        return result.changes > 0;
    }

    // Eliminar sala permanentemente
    async deleteRoom(id) {
        try {
            // Eliminar mensajes asociados
            await this.db.run('DELETE FROM messages WHERE room_id = ?', [id]);
            
            // Eliminar la sala
            const result = await this.db.run('DELETE FROM rooms WHERE id = ?', [id]);
            
            return result.changes > 0;
        } catch (error) {
            throw new Error('Error al eliminar la sala: ' + error.message);
        }
    }

    // Guardar mensaje
    async saveMessage(messageData) {
        const { roomId, nickname, message, messageType = 'text', filePath = null, fileName = null } = messageData;

        try {
            const result = await this.db.run(
                `INSERT INTO messages (room_id, nickname, message, message_type, file_path, file_name) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [roomId, nickname, message, messageType, filePath, fileName]
            );

            return {
                id: result.id,
                roomId,
                nickname,
                message,
                messageType,
                filePath,
                fileName,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            throw new Error('Error al guardar mensaje: ' + error.message);
        }
    }

    // Obtener historial de mensajes de una sala
    async getRoomMessages(roomId, limit = 50, offset = 0) {
        try {
            const messages = await this.db.all(
                `SELECT id, nickname, message, message_type, file_path, file_name, timestamp 
                 FROM messages 
                 WHERE room_id = ? 
                 ORDER BY timestamp DESC 
                 LIMIT ? OFFSET ?`,
                [roomId, limit, offset]
            );

            // Revertir el orden para mostrar del más antiguo al más reciente
            return messages.reverse().map(msg => ({
                id: msg.id,
                nickname: msg.nickname,
                message: msg.message,
                type: msg.message_type,
                filePath: msg.file_path,
                fileName: msg.file_name,
                timestamp: msg.timestamp
            }));
        } catch (error) {
            throw new Error('Error al obtener mensajes: ' + error.message);
        }
    }

    // Obtener estadísticas de una sala
    async getRoomStats(roomId) {
        try {
            const stats = await this.db.get(
                `SELECT 
                    COUNT(*) as total_messages,
                    COUNT(DISTINCT nickname) as unique_users,
                    MIN(timestamp) as first_message,
                    MAX(timestamp) as last_message
                 FROM messages 
                 WHERE room_id = ?`,
                [roomId]
            );

            const room = await this.getRoomById(roomId);
            
            return {
                room: room,
                totalMessages: stats.total_messages,
                uniqueUsers: stats.unique_users,
                firstMessage: stats.first_message,
                lastMessage: stats.last_message
            };
        } catch (error) {
            throw new Error('Error al obtener estadísticas: ' + error.message);
        }
    }

    // Limpiar mensajes antiguos de una sala
    async clearOldMessages(roomId, daysOld = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        
        try {
            const result = await this.db.run(
                'DELETE FROM messages WHERE room_id = ? AND timestamp < ?',
                [roomId, cutoffDate.toISOString()]
            );
            
            return result.changes;
        } catch (error) {
            throw new Error('Error al limpiar mensajes antiguos: ' + error.message);
        }
    }

    // Buscar mensajes en una sala
    async searchMessages(roomId, searchTerm, limit = 20) {
        try {
            const messages = await this.db.all(
                `SELECT id, nickname, message, message_type, file_path, file_name, timestamp 
                 FROM messages 
                 WHERE room_id = ? AND (message LIKE ? OR nickname LIKE ?)
                 ORDER BY timestamp DESC 
                 LIMIT ?`,
                [roomId, `%${searchTerm}%`, `%${searchTerm}%`, limit]
            );

            return messages.map(msg => ({
                id: msg.id,
                nickname: msg.nickname,
                message: msg.message,
                type: msg.message_type,
                filePath: msg.file_path,
                fileName: msg.file_name,
                timestamp: msg.timestamp
            }));
        } catch (error) {
            throw new Error('Error al buscar mensajes: ' + error.message);
        }
    }

    // Validar PIN
    validatePin(pin) {
        return /^\d{6}$/.test(pin);
    }

    // Validar nombre de sala
    validateRoomName(name) {
        return name && name.length >= 3 && name.length <= 50 && /^[a-zA-Z0-9\s\-_]+$/.test(name);
    }
}

module.exports = RoomManager;