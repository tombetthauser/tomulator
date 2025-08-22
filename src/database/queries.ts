import pool from './connection';

export interface TableSchema {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

export interface TableInfo {
  table_name: string;
  table_schema: string;
}

// Get all tables in the database
export async function getAllTables(): Promise<TableInfo[]> {
  const query = `
    SELECT table_name, table_schema 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `;
  const result = await pool.query(query);
  return result.rows;
}

// Get table schema
export async function getTableSchema(tableName: string): Promise<TableSchema[]> {
  const query = `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = $1 AND table_schema = 'public'
    ORDER BY ordinal_position
  `;
  const result = await pool.query(query, [tableName]);
  return result.rows;
}

// Get all data from a table
export async function getTableData(tableName: string): Promise<any[]> {
  const query = `SELECT * FROM ${tableName} ORDER BY id`;
  const result = await pool.query(query);
  return result.rows;
}

// Insert new row
export async function insertRow(tableName: string, data: Record<string, any>): Promise<any> {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
  
  const query = `
    INSERT INTO ${tableName} (${columns.join(', ')}) 
    VALUES (${placeholders}) 
    RETURNING *
  `;
  
  const result = await pool.query(query, values);
  return result.rows[0];
}

// Update row
export async function updateRow(tableName: string, id: number, data: Record<string, any>): Promise<any> {
  // Remove id and any timestamp fields from the update data
  const { id: _, created_at, updated_at, ...updateData } = data;
  
  const columns = Object.keys(updateData);
  if (columns.length === 0) {
    throw new Error('No valid columns to update');
  }
  
  const values = Object.values(updateData);
  const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');
  
  const query = `
    UPDATE ${tableName} 
    SET ${setClause}
    WHERE id = $${values.length + 1} 
    RETURNING *
  `;
  
  const result = await pool.query(query, [...values, id]);
  return result.rows[0];
}

// Delete row
export async function deleteRow(tableName: string, id: number, hardDelete: boolean = false): Promise<boolean> {
  if (hardDelete) {
    // Hard delete - permanently remove from database
    const query = `DELETE FROM ${tableName} WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  } else {
    // Soft delete - check if table has is_deleted column
    const schemaQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1 AND column_name = 'is_deleted'
    `;
    const schemaResult = await pool.query(schemaQuery, [tableName]);
    
    if (schemaResult.rows.length > 0) {
      // Table has is_deleted column, perform soft delete
      const query = `UPDATE ${tableName} SET is_deleted = 'true' WHERE id = $1`;
      const result = await pool.query(query, [id]);
      return result.rowCount > 0;
    } else {
      // Table doesn't have is_deleted column, perform hard delete
      const query = `DELETE FROM ${tableName} WHERE id = $1`;
      const result = await pool.query(query, [id]);
      return result.rowCount > 0;
    }
  }
}
