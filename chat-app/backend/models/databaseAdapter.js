/**
 * Adaptador de Base de Datos
 * Proporciona una interfaz unificada para SQLite y PostgreSQL
 * Permite que RoomManager y UserManager funcionen con ambas BD
 */

class DatabaseAdapter {
    constructor(database) {
        this.db = database;
        this.isPostgres = !!database.pool; // PostgreSQL tiene pool, SQLite tiene db
    }

    /**
     * Ejecutar una consulta que devuelve una sola fila
     */
    async get(sql, params = []) {
        if (this.isPostgres) {
            const result = await this.db.pool.query(sql, params);
            return result.rows[0] || null;
        } else {
            // SQLite
            return new Promise((resolve, reject) => {
                this.db.db.get(sql, params, (err, row) => {
                    if (err) reject(err);
                    else resolve(row || null);
                });
            });
        }
    }

    /**
     * Ejecutar una consulta que devuelve múltiples filas
     */
    async all(sql, params = []) {
        if (this.isPostgres) {
            const result = await this.db.pool.query(sql, params);
            return result.rows;
        } else {
            // SQLite
            return new Promise((resolve, reject) => {
                this.db.db.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });
        }
    }

    /**
     * Ejecutar una consulta de modificación (INSERT, UPDATE, DELETE)
     */
    async run(sql, params = []) {
        if (this.isPostgres) {
            const result = await this.db.pool.query(sql, params);
            return {
                lastID: result.rows[0]?.id || null,
                changes: result.rowCount
            };
        } else {
            // SQLite
            return new Promise((resolve, reject) => {
                this.db.db.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve({
                        lastID: this.lastID,
                        changes: this.changes
                    });
                });
            });
        }
    }

    /**
     * Convertir consulta SQLite a PostgreSQL si es necesario
     */
    adaptQuery(sql, params = []) {
        if (!this.isPostgres) {
            return { sql, params };
        }

        // Convertir placeholders de SQLite (?) a PostgreSQL ($1, $2, etc.)
        let paramIndex = 1;
        const adaptedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

        // Convertir algunas funciones específicas
        const finalSql = adaptedSql
            .replace(/DATETIME\('now'\)/g, 'NOW()')
            .replace(/datetime\('now'\)/g, 'NOW()')
            .replace(/AUTOINCREMENT/g, 'SERIAL')
            .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY');

        return { sql: finalSql, params };
    }

    /**
     * Ejecutar consulta adaptada que devuelve una fila
     */
    async getAdapted(sql, params = []) {
        const { sql: adaptedSql, params: adaptedParams } = this.adaptQuery(sql, params);
        return await this.get(adaptedSql, adaptedParams);
    }

    /**
     * Ejecutar consulta adaptada que devuelve múltiples filas
     */
    async allAdapted(sql, params = []) {
        const { sql: adaptedSql, params: adaptedParams } = this.adaptQuery(sql, params);
        return await this.all(adaptedSql, adaptedParams);
    }

    /**
     * Ejecutar consulta adaptada de modificación
     */
    async runAdapted(sql, params = []) {
        const { sql: adaptedSql, params: adaptedParams } = this.adaptQuery(sql, params);
        
        if (this.isPostgres && (sql.includes('INSERT') || sql.includes('UPDATE'))) {
            // Para PostgreSQL, agregar RETURNING id para obtener el ID generado
            if (sql.includes('INSERT') && !sql.includes('RETURNING')) {
                const returningSql = adaptedSql + ' RETURNING id';
                const result = await this.db.pool.query(returningSql, adaptedParams);
                return {
                    lastID: result.rows[0]?.id || null,
                    changes: result.rowCount
                };
            }
        }
        
        return await this.run(adaptedSql, adaptedParams);
    }
}

module.exports = DatabaseAdapter;