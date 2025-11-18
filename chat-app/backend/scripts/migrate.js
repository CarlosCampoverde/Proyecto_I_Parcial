/**
 * Script de migración para inicializar la base de datos en producción
 * Este script se ejecuta automáticamente cuando se despliega en Render
 */

require('dotenv').config();
const PostgresDatabase = require('../models/postgresDatabase');

async function migrate() {
    console.log('🚀 Iniciando migración de base de datos...');
    
    // Verificar configuración
    console.log('🔍 Verificando configuración...');
    console.log(`USE_POSTGRES: ${process.env.USE_POSTGRES}`);
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada'}`);
    
    if (process.env.USE_POSTGRES !== 'true') {
        console.log('⚠️  USE_POSTGRES no está configurado como true');
        console.log('⚠️  La aplicación usará SQLite (datos no persistentes)');
        console.log('✅ Migración omitida - usando SQLite por defecto');
        process.exit(0);
    }
    
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL no está configurada');
        console.error('💡 Asegúrate de configurar DATABASE_URL en Render');
        process.exit(1);
    }
    
    try {
        const database = new PostgresDatabase();
        await database.init();
        
        console.log('✅ Migración completada exitosamente');
        console.log('✅ Tablas creadas y base de datos lista para usar');
        
        // Verificar que todas las tablas existen
        const tables = await database.pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        console.log('📋 Tablas creadas:');
        tables.rows.forEach(row => {
            console.log(`   ✅ ${row.table_name}`);
        });
        
        // Verificar específicamente la tabla admins
        const adminTable = tables.rows.find(row => row.table_name === 'admins');
        if (adminTable) {
            console.log('👤 Tabla admins: ✅ Disponible para registro de administradores');
        } else {
            console.error('❌ Tabla admins no encontrada - esto causará errores');
        }
        
        // Agregar algunos datos de ejemplo si es necesario
        await seedInitialData(database);
        
        // Cerrar conexión
        if (database.pool) {
            await database.pool.end();
            console.log('🔌 Conexión a base de datos cerrada');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la migración:', error.message);
        console.error('💡 Posibles causas:');
        console.error('   - DATABASE_URL incorrecta');
        console.error('   - Base de datos PostgreSQL no disponible');
        console.error('   - Problemas de conectividad');
        console.error('   - Error en creación de tablas');
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