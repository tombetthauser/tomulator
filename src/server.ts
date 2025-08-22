import express from 'express';
import { getAllTables, getTableSchema, getTableData, insertRow, updateRow, deleteRow, createTable } from './database/queries';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('dist'));
app.use(express.static('src')); // Also serve from src for development

// API Routes
app.get('/api/tables', async (req, res) => {
  try {
    const tables = await getAllTables();
    res.json(tables);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

app.get('/api/tables/:tableName/schema', async (req, res) => {
  try {
    const { tableName } = req.params;
    const schema = await getTableSchema(tableName);
    res.json(schema);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch table schema' });
  }
});

app.get('/api/tables/:tableName/data', async (req, res) => {
  try {
    const { tableName } = req.params;
    const data = await getTableData(tableName);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch table data' });
  }
});

app.post('/api/tables/:tableName/rows', async (req, res) => {
  try {
    const { tableName } = req.params;
    const data = req.body;
    const newRow = await insertRow(tableName, data);
    res.json(newRow);
  } catch (error) {
    console.error('Insert error:', error);
    res.status(500).json({ 
      error: 'Failed to insert row', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.put('/api/tables/:tableName/rows/:id', async (req, res) => {
  try {
    const { tableName, id } = req.params;
    const data = req.body;
    const updatedRow = await updateRow(tableName, parseInt(id), data);
    res.json(updatedRow);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ 
      error: 'Failed to update row', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.delete('/api/tables/:tableName/rows/:id', async (req, res) => {
  try {
    const { tableName, id } = req.params;
    const success = await deleteRow(tableName, parseInt(id));
    if (success) {
      res.json({ message: 'Row deleted successfully' });
    } else {
      res.status(404).json({ error: 'Row not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete row' });
  }
});

// Hard delete endpoint - permanently removes row from database
app.delete('/api/tables/:tableName/rows/:id/hard-delete', async (req, res) => {
  try {
    const { tableName, id } = req.params;
    const success = await deleteRow(tableName, parseInt(id), true); // true for hard delete
    if (success) {
      res.json({ message: 'Row permanently deleted successfully' });
    } else {
      res.status(404).json({ error: 'Row not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to permanently delete row' });
  }
});

// Create new table endpoint
app.post('/api/tables/create', async (req, res) => {
  try {
    const { tableName, columns } = req.body;
    
    if (!tableName || !columns || !Array.isArray(columns)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    
    await createTable(tableName, columns);
    res.json({ message: `Table "${tableName}" created successfully` });
  } catch (error) {
    console.error('Create table error:', error);
    res.status(500).json({ 
      error: 'Failed to create table', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile('dist/index.html', { root: '.' });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = Number(PORT) + 1;
    console.log(`Port ${PORT} is busy, trying ${nextPort}...`);
    server.listen(nextPort);
  } else {
    console.error('Server error:', err);
  }
});
