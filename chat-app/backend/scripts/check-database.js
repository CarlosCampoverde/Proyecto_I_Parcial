/**
 * Script para verificar qué base de datos se está usando
 * Útil para debugging en producción
 */

require('dotenv').config();

async function checkDatabaseConfig() {
    console.log('🔍 VERIFICANDO CONFIGURACIÓN DE BASE DE DATOS');
    console.log('===============================================');
    
    // Variables de entorno
    console.log('📊 Variables de entorno:');
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'no definido'}`);
    console.log(`USE_POSTGRES: ${process.env.USE_POSTGRES || 'no definido'}`);
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada'}`);
    console.log(`DB_HOST: ${process.env.DB_HOST || 'no definido'}`);
    console.log(`DB_NAME: ${process.env.DB_NAME || 'no definido'}`);
    console.log('');
    
    // Determinar qué base de datos se usará
    const usePostgres = process.env.USE_POSTGRES === 'true';
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    
    console.log('🗄️ Base de datos que se usará:');
    if (usePostgres && hasDatabaseUrl) {
        console.log('✅ PostgreSQL (con DATABASE_URL)');
        console.log('   └─ Datos PERSISTENTES ✅');
    } else if (usePostgres && !hasDatabaseUrl) {
        console.log('⚠️  PostgreSQL configurado pero sin DATABASE_URL');
        console.log('   └─ Posible error de configuración');
    } else {
        console.log('⚠️  SQLite (base de datos en archivo)');
        console.log('   └─ Datos se PIERDEN en cada deploy ❌');
    }
    console.log('');
    
    // Intentar conectar
    console.log('🔌 Probando conexión...');
    try {
        if (usePostgres) {
            const PostgresDatabase = require('../models/postgresDatabase');
            const db = new PostgresDatabase();
            await db.init();
            console.log('✅ Conexión a PostgreSQL exitosa');
            
            // Verificar tablas
            const query = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'";
            const result = await db.pool.query(query);
            console.log(`📋 Tablas encontradas: ${result.rows.length}`);
            result.rows.forEach(row => {
                console.log(`   └─ ${row.table_name}`);
            });
            
            await db.pool.end();
        } else {
            const Database = require('../models/database');
            const db = new Database();
            await db.init();
            console.log('✅ Conexión a SQLite exitosa');
            console.log('⚠️  RECORDATORIO: Los datos se perderán en el próximo deploy');
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }
    
    console.log('');
    console.log('💡 RECOMENDACIONES:');
    if (!usePostgres) {
        console.log('1. Configurar USE_POSTGRES=true en Render');
        console.log('2. Crear base de datos PostgreSQL en Render');
        console.log('3. Configurar DATABASE_URL desde la base de datos');
    } else if (!hasDatabaseUrl) {
        console.log('1. Verificar que DATABASE_URL esté configurada en Render');
        console.log('2. La variable debe venir automáticamente de PostgreSQL service');
    } else {
        console.log('✅ Configuración correcta - datos persistentes');
    }
}

// Ejecutar verificación
if (require.main === module) {
    checkDatabaseConfig().catch(console.error);
}

module.exports = { checkDatabaseConfig };