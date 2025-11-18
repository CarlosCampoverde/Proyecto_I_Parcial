/**
 * Script para actualizar automáticamente todos los métodos de SQLite
 * por los métodos adaptados en RoomManager y UserManager
 */

const fs = require('fs');
const path = require('path');

function updateDatabaseMethods(filePath) {
    console.log(`Actualizando ${filePath}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changes = 0;
    
    // Reemplazar métodos SQLite por adaptados
    const replacements = [
        { from: /this\.db\.get\(/g, to: 'this.db.getAdapted(' },
        { from: /this\.db\.all\(/g, to: 'this.db.allAdapted(' },
        { from: /this\.db\.run\(/g, to: 'this.db.runAdapted(' }
    ];
    
    replacements.forEach(({ from, to }) => {
        const matches = content.match(from);
        if (matches) {
            content = content.replace(from, to);
            changes += matches.length;
            console.log(`  - Reemplazadas ${matches.length} ocurrencias de ${from.source}`);
        }
    });
    
    if (changes > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${filePath} actualizado con ${changes} cambios`);
    } else {
        console.log(`ℹ️  ${filePath} no necesita cambios`);
    }
    
    return changes;
}

// Actualizar archivos
const files = [
    path.join(__dirname, 'roomManager.js'),
    path.join(__dirname, 'userManager.js')
];

let totalChanges = 0;

files.forEach(file => {
    if (fs.existsSync(file)) {
        totalChanges += updateDatabaseMethods(file);
    } else {
        console.log(`❌ Archivo no encontrado: ${file}`);
    }
});

console.log(`\n🎯 Total de cambios realizados: ${totalChanges}`);
console.log('✅ Actualización completada');