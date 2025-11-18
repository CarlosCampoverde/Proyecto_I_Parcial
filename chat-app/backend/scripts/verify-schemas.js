/**
 * Script para verificar consistencia entre esquemas SQLite y PostgreSQL
 * Detecta tablas que faltan o difieren entre ambas bases de datos
 */

const fs = require('fs');

function extractTablesFromSQL(content, dbType) {
    const tableRegex = /CREATE TABLE[^(]*\(([^)]+)\)/gi;
    const tables = {};
    let match;
    
    while ((match = tableRegex.exec(content)) !== null) {
        // Extraer nombre de tabla
        const tableNameMatch = match[0].match(/CREATE TABLE[^`'"]*(?:`|'|")?([a-zA-Z_][a-zA-Z0-9_]*)(?:`|'|")?/i);
        if (tableNameMatch) {
            const tableName = tableNameMatch[1];
            tables[tableName] = {
                sql: match[0],
                dbType
            };
        }
    }
    
    return tables;
}

function compareSchemas() {
    console.log('🔍 VERIFICANDO CONSISTENCIA DE ESQUEMAS DE BD');
    console.log('=============================================');
    
    // Leer archivos de esquema
    const sqlitePath = '../models/database.js';
    const postgresPath = '../models/postgresDatabase.js';
    
    if (!fs.existsSync(sqlitePath) || !fs.existsSync(postgresPath)) {
        console.error('❌ No se encontraron los archivos de esquema');
        return;
    }
    
    const sqliteContent = fs.readFileSync(sqlitePath, 'utf8');
    const postgresContent = fs.readFileSync(postgresPath, 'utf8');
    
    // Extraer tablas
    const sqliteTables = extractTablesFromSQL(sqliteContent, 'SQLite');
    const postgresTables = extractTablesFromSQL(postgresContent, 'PostgreSQL');
    
    console.log('\n📊 TABLAS ENCONTRADAS:');
    console.log('SQLite:', Object.keys(sqliteTables).join(', '));
    console.log('PostgreSQL:', Object.keys(postgresTables).join(', '));
    
    // Encontrar diferencias
    const allTables = new Set([...Object.keys(sqliteTables), ...Object.keys(postgresTables)]);
    const differences = [];
    
    console.log('\n🔍 ANÁLISIS DE CONSISTENCIA:');
    
    allTables.forEach(tableName => {
        const inSQLite = tableName in sqliteTables;
        const inPostgres = tableName in postgresTables;
        
        if (inSQLite && inPostgres) {
            console.log(`✅ ${tableName}: Presente en ambas BD`);
        } else if (inSQLite && !inPostgres) {
            console.log(`❌ ${tableName}: FALTA en PostgreSQL`);
            differences.push({
                table: tableName,
                issue: 'missing_in_postgres',
                sqliteSQL: sqliteTables[tableName].sql
            });
        } else if (!inSQLite && inPostgres) {
            console.log(`⚠️  ${tableName}: Solo en PostgreSQL`);
            differences.push({
                table: tableName,
                issue: 'only_in_postgres',
                postgresSQL: postgresTables[tableName].sql
            });
        }
    });
    
    // Mostrar recomendaciones
    console.log('\n💡 RECOMENDACIONES:');
    
    if (differences.length === 0) {
        console.log('✅ Esquemas consistentes - no se requieren cambios');
    } else {
        differences.forEach(diff => {
            if (diff.issue === 'missing_in_postgres') {
                console.log(`\n🔧 Agregar tabla "${diff.table}" a PostgreSQL:`);
                console.log('   Convertir de SQLite a PostgreSQL y agregar a postgresDatabase.js');
            }
        });
    }
    
    return differences;
}

// Ejecutar verificación
if (require.main === module) {
    compareSchemas();
}

module.exports = { compareSchemas };