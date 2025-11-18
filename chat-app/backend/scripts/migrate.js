/**
 * Script de migración para inicializar la base de datos en producción
 * Este script se ejecuta automáticamente cuando se despliega en Render
 */

require('dotenv').config();
const PostgresDatabase = require('../models/postgresDatabase');

async function migrate() {
    console.log('🚀 Iniciando migración de base de datos...');
    
    try {
        const database = new PostgresDatabase();
        await database.init();
        
        console.log('✅ Migración completada exitosamente');
        console.log('✅ Tablas creadas y base de datos lista para usar');
        
        // Agregar algunos datos de ejemplo si es necesario
        await seedInitialData(database);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

async function seedInitialData(database) {
    try {
        // Verificar si ya existen datos
        const existingRooms = await database.getRooms();
        
        if (existingRooms.length === 0) {
            console.log('📊 Agregando datos iniciales...');
            
            // Crear una sala de ejemplo
            await database.createRoom('Bienvenida', 'text', '123456', null);
            console.log('✅ Sala de bienvenida creada');
        } else {
            console.log('📊 La base de datos ya contiene datos, omitiendo seed');
        }
    } catch (error) {
        console.warn('⚠️  Advertencia al agregar datos iniciales:', error.message);
        // No fallar la migración por esto
    }
}

// Ejecutar migración
if (require.main === module) {
    migrate();
}

module.exports = { migrate, seedInitialData };