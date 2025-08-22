import React, { useState, useEffect } from 'react';

interface TableInfo {
  table_name: string;
  table_schema: string;
}

interface TableSchema {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

interface ColumnWidths {
  [key: string]: number;
}

const SimpleCrudApp: React.FC = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableSchema, setTableSchema] = useState<TableSchema[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [newRow, setNewRow] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [hideDeleted, setHideDeleted] = useState<boolean>(false);
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({});
  const [wordWrap, setWordWrap] = useState<boolean>(true);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizeStartX, setResizeStartX] = useState<number>(0);
  const [resizeColumn, setResizeColumn] = useState<string>('');
  const [resizeStartWidth, setResizeStartWidth] = useState<number>(0);

  // Default column widths
  const defaultColumnWidth = 150;
  const minColumnWidth = 80;
  const maxColumnWidth = 800;

  // Fetch all tables on component mount
  useEffect(() => {
    fetchTables();
  }, []);

  // Fetch table data and schema when selected table changes
  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable);
      fetchTableSchema(selectedTable);
    }
  }, [selectedTable]);

  // Initialize column widths when schema changes
  useEffect(() => {
    if (tableSchema.length > 0) {
      const initialWidths: ColumnWidths = {};
      tableSchema.forEach(col => {
        // Set wider width for certain column types
        let width = defaultColumnWidth;
        if (col.data_type === 'text' || col.column_name.includes('content') || col.column_name.includes('description')) {
          width = 250;
        } else if (col.column_name === 'id' || col.column_name === 'created_at') {
          width = 100;
        } else if (col.data_type === 'timestamp') {
          width = 180;
        }
        initialWidths[col.column_name] = width;
      });
      setColumnWidths(initialWidths);
    }
  }, [tableSchema]);

  // Filter data when search term, table data, schema, or hideDeleted changes
  useEffect(() => {
    const hasIsDeletedColumn = tableSchema.some(col => col.column_name === 'is_deleted');
    let workingData = tableData;

    if (hideDeleted && hasIsDeletedColumn) {
      workingData = workingData.filter(row => String(row['is_deleted']) !== 'true');
    }

    if (searchTerm.trim() === '') {
      setFilteredData(workingData);
    } else {
      const lowered = searchTerm.toLowerCase();
      const filtered = workingData.filter(row =>
        Object.values(row).some(value =>
          value && value.toString().toLowerCase().includes(lowered)
        )
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, tableData, tableSchema, hideDeleted]);

  // Handle mouse move for column resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && resizeColumn) {
        const deltaX = e.clientX - resizeStartX;
        const newWidth = Math.max(minColumnWidth, Math.min(maxColumnWidth, resizeStartWidth + deltaX));
        setColumnWidths(prev => ({
          ...prev,
          [resizeColumn]: newWidth
        }));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeColumn('');
      
      // Restore cursor and user selection
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeColumn, resizeStartX, resizeStartWidth]);

  const startResize = (e: React.MouseEvent, columnName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeColumn(columnName);
    setResizeStartX(e.clientX);
    setResizeStartWidth(columnWidths[columnName] || defaultColumnWidth);
    
    // Add visual feedback
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const resetColumnWidth = (columnName: string) => {
    let defaultWidth = defaultColumnWidth;
    const column = tableSchema.find(col => col.column_name === columnName);
    if (column) {
      if (column.data_type === 'text' || column.column_name.includes('content') || column.column_name.includes('description')) {
        defaultWidth = 250;
      } else if (column.column_name === 'id' || column.column_name === 'created_at') {
        defaultWidth = 100;
      } else if (column.data_type === 'timestamp') {
        defaultWidth = 180;
      }
    }
    
    setColumnWidths(prev => ({
      ...prev,
      [columnName]: defaultWidth
    }));
  };

  const renderCellContent = (value: any) => {
    const displayValue = value !== null && value !== undefined ? String(value) : '';
    
    if (wordWrap) {
      return (
        <span style={{ 
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          display: 'block',
          width: '100%'
        }}>
          {displayValue}
        </span>
      );
    } else {
      return (
        <span style={{ 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'block',
          width: '100%'
        }} title={displayValue}>
          {displayValue}
        </span>
      );
    }
  };

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables');
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const fetchTableData = async (tableName: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tables/${tableName}/data`);
      const data = await response.json();
      setTableData(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching table data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTableSchema = async (tableName: string) => {
    try {
      const response = await fetch(`/api/tables/${tableName}/schema`);
      const data = await response.json();
      setTableSchema(data);
      // Initialize new row with appropriate default values
      const initialRow: Record<string, any> = {};
      data.forEach((col: TableSchema) => {
        if (col.column_name !== 'id' && col.column_name !== 'created_at') {
          if (col.column_name === 'user_id') {
            initialRow[col.column_name] = 1; // Default user ID
          } else if (col.column_name === 'is_deleted') {
            initialRow[col.column_name] = 'false';
          } else if (col.column_name === 'start_index' || col.column_name === 'end_index' || col.column_name === 'x' || col.column_name === 'y') {
            initialRow[col.column_name] = 0;
          } else {
            initialRow[col.column_name] = '';
          }
        }
      });
      setNewRow(initialRow);
    } catch (error) {
      console.error('Error fetching table schema:', error);
    }
  };

  const handleEdit = (rowIndex: number) => {
    setEditingRow(rowIndex);
  };

  const handleSave = async (rowIndex: number): Promise<boolean> => {
    const rowData = tableData[rowIndex];
    try {
      const response = await fetch(`/api/tables/${selectedTable}/rows/${rowData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rowData)
      });
      
      if (response.ok) {
        // Update local state directly instead of refetching
        const updatedData = [...tableData];
        updatedData[rowIndex] = { ...rowData };
        setTableData(updatedData);
        setEditingRow(null);
        return true;
      }
    } catch (error) {
      console.error('Error updating row:', error);
    }
    return false;
  };

  const handleCancel = () => {
    setEditingRow(null);
    // Reset the row data to original values by refetching just this row
    fetchTableData(selectedTable);
  };

  const handleRowClick = async (rowIndex: number) => {
    // If clicking the same row, ensure it's in edit mode
    if (editingRow === null) {
      setEditingRow(rowIndex);
      return;
    }
    if (editingRow === rowIndex) return;
    const saved = await handleSave(editingRow);
    if (saved) {
      setEditingRow(rowIndex);
    }
  };

  const handleDelete = async (row: any) => {
    // Only proceed if table has an "is_deleted" column
    const hasIsDeletedColumn = tableSchema.some(col => col.column_name === 'is_deleted');
    if (!hasIsDeletedColumn) return;

    const currentlyDeleted = String(row['is_deleted']) === 'true';
    try {
      const response = await fetch(`/api/tables/${selectedTable}/rows/${row.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_deleted: currentlyDeleted ? 'false' : 'true' })
      });
      if (response.ok) {
        // Update local state directly instead of refetching
        const updatedData = tableData.map(r => 
          r.id === row.id 
            ? { ...r, is_deleted: currentlyDeleted ? 'false' : 'true' }
            : r
        );
        setTableData(updatedData);
      }
    } catch (error) {
      console.error('Error toggling soft delete:', error);
    }
  };

  const handleFullyDelete = async (id: number) => {
    if (!confirm('⚠️ WARNING: This will permanently delete this row from the database!\n\nThis action cannot be undone. Are you absolutely sure?')) return;
    
    try {
      const response = await fetch(`/api/tables/${selectedTable}/rows/${id}/hard-delete`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Update local state directly instead of refetching
        const updatedData = tableData.filter(r => r.id !== id);
        setTableData(updatedData);
      } else {
        alert('Failed to delete row. Please try again.');
      }
    } catch (error) {
      console.error('Error fully deleting row:', error);
      alert('Error deleting row. Please try again.');
    }
  };

  const handleAddRow = async () => {
    try {
      const response = await fetch(`/api/tables/${selectedTable}/rows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRow)
      });
      
      if (response.ok) {
        const newRowData = await response.json();
        // Update local state directly instead of refetching
        setTableData(prev => [...prev, newRowData]);
        
        // Reset new row form
        const initialRow: Record<string, any> = {};
        tableSchema.forEach((col: TableSchema) => {
          if (col.column_name !== 'id' && col.column_name !== 'created_at') {
            if (col.column_name === 'user_id') {
              initialRow[col.column_name] = 1;
            } else if (col.column_name === 'is_deleted') {
              initialRow[col.column_name] = 'false';
            } else if (col.column_name === 'start_index' || col.column_name === 'end_index' || col.column_name === 'x' || col.column_name === 'y') {
              initialRow[col.column_name] = 0;
            } else {
              initialRow[col.column_name] = '';
            }
          }
        });
        setNewRow(initialRow);
      }
    } catch (error) {
      console.error('Error adding row:', error);
    }
  };

  const handleInputChange = (rowIndex: number, field: string, value: any) => {
    const updatedData = [...tableData];
    updatedData[rowIndex][field] = value;
    setTableData(updatedData);
  };

  const handleNewRowChange = (field: string, value: any) => {
    setNewRow(prev => ({ ...prev, [field]: value }));
  };

  const getInputType = (columnName: string, dataType: string) => {
    if (columnName === 'is_deleted') return 'select';
    if (dataType === 'integer') return 'number';
    if (dataType === 'timestamp') return 'datetime-local';
    return 'text';
  };

  const renderInput = (column: TableSchema, value: any, onChange: (value: any) => void, onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => void) => {
    const inputType = getInputType(column.column_name, column.data_type);
    
    if (inputType === 'select' && column.column_name === 'is_deleted') {
      return (
        <select
          value={value || 'false'}
          onChange={(e) => onChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={onKeyDown}
          style={{
            width: '100%',
            padding: '4px',
            border: '1px solid #ccc',
            borderRadius: '2px'
          }}
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }
    
    if (inputType === 'number') {
      return (
        <input
          type="number"
          value={value || 0}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={onKeyDown}
          style={{
            width: '100%',
            padding: '4px',
            border: '1px solid #ccc',
            borderRadius: '2px'
          }}
        />
      );
    }
    
    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
        style={{
          width: '100%',
          padding: '4px',
          border: '1px solid #ccc',
          borderRadius: '2px'
        }}
        placeholder={column.column_name}
      />
    );
  };

  const getTableDescription = (tableName: string) => {
    const descriptions: Record<string, string> = {
      'curator_dialog': 'Dialog lines and context for content curation',
      'degradations': 'Content degradation tracking with user associations',
      'donations': 'User donations with nametags and content',
      'pixel_dust': 'Pixel coordinates for visual elements',
      'users': 'User management with unique identifiers'
    };
    return descriptions[tableName] || 'Table data management';
  };

  return (
    <div className="crud-app" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>Tomulator Database Manager Test App</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="table-select" style={{ marginRight: '10px', fontWeight: 'bold' }}>
          Select Table:
        </label>
        <select
          id="table-select"
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
          style={{ 
            padding: '8px 12px', 
            fontSize: '16px', 
            borderRadius: '4px', 
            border: '1px solid #ccc',
            minWidth: '200px'
          }}
        >
          <option value="">Choose a table...</option>
          {tables.map(table => (
            <option key={table.table_name} value={table.table_name}>
              {table.table_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {selectedTable && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginTop: '35px', marginBottom: '50px'}}>
            <h4 style={{ color: '#444', marginBottom: '10px' }}>Add New Row</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
              {tableSchema.map(col => {
                if (col.column_name === 'id' || col.column_name === 'created_at') {
                  return null;
                }
                return (
                  <div key={col.column_name} style={{ display: col.column_name === 'is_deleted' ? 'none' : 'inline-block', marginRight: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                      {col.column_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                    </label>
                    {renderInput(col, newRow[col.column_name], (value) => handleNewRowChange(col.column_name, value))}
                  </div>
                );
              })}
            </div>
            <button
              onClick={handleAddRow}
              style={{
                padding: '8px 16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                backgroundColor: '#f8f9fa'
              }}
            >
              Add Row
            </button>
          </div>

        </div>
      )}

      {selectedTable && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ color: '#444', margin: 0 }}>Table Data</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => fetchTableData(selectedTable)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  backgroundColor: '#f8f9fa'
                }}
                title="Refresh table data from database"
              >
                Reload Table
              </button>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#444', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={wordWrap}
                  onChange={(e) => setWordWrap(e.target.checked)}
                />
                Word wrap
              </label>
              <span style={{ color: '#666', fontSize: '12px', fontStyle: 'italic' }}>
                💡 Drag column edges to resize
              </span>
              <button
                onClick={() => {
                  const initialWidths: ColumnWidths = {};
                  tableSchema.forEach(col => {
                    let width = defaultColumnWidth;
                    if (col.data_type === 'text' || col.column_name.includes('content') || col.column_name.includes('description')) {
                      width = 250;
                    } else if (col.column_name === 'id' || col.column_name === 'created_at') {
                      width = 100;
                    } else if (col.data_type === 'timestamp') {
                      width = 180;
                    }
                    initialWidths[col.column_name] = width;
                  });
                  setColumnWidths(initialWidths);
                }}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  backgroundColor: '#f8f9fa'
                }}
                title="Reset all column widths to default"
              >
                Reset Columns
              </button>
              {tableSchema.some(col => col.column_name === 'is_deleted') && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#444', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={hideDeleted}
                    onChange={(e) => setHideDeleted(e.target.checked)}
                  />
                  Hide deleted
                </label>
              )}
              <input
                type="text"
                placeholder="Search in all fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                  minWidth: '200px'
                }}
              />
              <span style={{ color: '#666', fontSize: '14px' }}>
                {filteredData.length} of {tableData.length} rows
              </span>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading...</div>
        </div>
      )}

      {selectedTable && !loading && filteredData.length > 0 && (
        <div style={{ overflowX: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                {tableSchema.map(col => (
                                      <th key={col.column_name} style={{ 
                      padding: '12px 8px', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#495057',
                      width: columnWidths[col.column_name] || defaultColumnWidth,
                      position: 'relative',
                      cursor: 'default',
                      backgroundColor: isResizing && resizeColumn === col.column_name ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
                      transition: 'background-color 0.2s ease'
                    }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      width: '100%'
                    }}>
                      <span 
                        onDoubleClick={() => resetColumnWidth(col.column_name)}
                        style={{ cursor: 'pointer' }}
                        title="Double-click to reset column width"
                      >
                        {col.column_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                                              <div
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: '8px',
                            cursor: 'col-resize',
                            backgroundColor: 'transparent',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseDown={(e) => startResize(e, col.column_name)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        />
                    </div>
                  </th>
                ))}
                <th style={{ 
                  padding: '12px 8px', 
                  textAlign: 'center', 
                  borderBottom: '2px solid #dee2e6',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#495057',
                  width: '120px'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} style={{ 
                  backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#f8f9fa',
                  borderBottom: '1px solid #dee2e6',
                  cursor: 'pointer'
                }} onClick={() => handleRowClick(rowIndex)}>
                  {tableSchema.map(col => (
                    <td key={col.column_name} style={{ 
                      padding: '8px', 
                      borderBottom: '1px solid #dee2e6',
                      fontSize: '14px',
                      width: columnWidths[col.column_name] || defaultColumnWidth,
                      overflow: 'hidden'
                    }}>
                      {editingRow === rowIndex && col.column_name !== 'id' && col.column_name !== 'created_at' ? (
                        renderInput(
                          col,
                          row[col.column_name],
                          (value) => handleInputChange(rowIndex, col.column_name, value),
                          (e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSave(rowIndex);
                            }
                          }
                        )
                      ) : (
                        <div style={{ 
                          color: col.column_name === 'is_deleted' && row[col.column_name] === 'true' ? '#dc3545' : 'inherit',
                          fontWeight: col.column_name === 'is_deleted' && row[col.column_name] === 'true' ? 'bold' : 'normal'
                        }}>
                          {renderCellContent(row[col.column_name])}
                        </div>
                      )}
                    </td>
                  ))}
                  <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', textAlign: 'center' }}>
                    {editingRow === rowIndex ? (
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSave(rowIndex); }}
                          style={{
                            padding: '6px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            backgroundColor: '#f8f9fa'
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCancel(); }}
                          style={{
                            padding: '6px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            backgroundColor: '#f8f9fa'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(rowIndex); }}
                          style={{
                            padding: '6px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            backgroundColor: '#f8f9fa'
                          }}
                        >
                          Edit
                        </button>
                        <div 
                          style={{ 
                            position: 'relative', 
                            display: 'inline-block',
                            cursor: 'default'
                          }}
                          onMouseEnter={(e) => {
                            const fullyDeleteBtn = e.currentTarget.querySelector('[data-fully-delete]') as HTMLElement;
                            if (fullyDeleteBtn) fullyDeleteBtn.style.display = 'flex';
                          }}
                          onMouseLeave={(e) => {
                            const fullyDeleteBtn = e.currentTarget.querySelector('[data-fully-delete]') as HTMLElement;
                            if (fullyDeleteBtn) fullyDeleteBtn.style.display = 'none';
                          }}
                        >
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(row); }}
                            disabled={!tableSchema.some(col => 
                              col.column_name === 'is_deleted'
                            )}
                            style={{
                              padding: '6px 12px',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              cursor: tableSchema.some(col => 
                                col.column_name === 'is_deleted'
                              ) ? 'pointer' : 'not-allowed',
                              fontSize: '12px',
                              backgroundColor: '#f8f9fa',
                              opacity: tableSchema.some(col => 
                                col.column_name === 'is_deleted'
                              ) ? 1 : 0.7
                            }}
                            title={tableSchema.some(col => 
                              col.column_name === 'is_deleted'
                            ) ? (String(row['is_deleted']) === 'true' ? 'Un-Delete this row' : 'Soft delete this row') : 'Delete functionality disabled - table missing "is_deleted" column'}
                          >
                            {String(row['is_deleted']) === 'true' ? 'Re-Add' : 'Delete'}
                          </button>
                          
                          {/* Fully Delete button - appears on hover */}
                          <button
                            data-fully-delete
                            onClick={(e) => { e.stopPropagation(); handleFullyDelete(row.id); }}
                            style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              width: '20px',
                              height: '20px',
                              padding: '0',
                              backgroundColor: '#dc0000',
                              color: 'white',
                              border: '2px solid white',
                              borderRadius: '50%',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              display: 'none',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                              zIndex: 10,
                              transition: 'all 0.2s ease-in-out'
                            }}
                            title="Permanently delete this row from database"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedTable && !loading && filteredData.length === 0 && tableData.length > 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#666',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          border: '1px solid #dee2e6'
        }}>
          No results found for "{searchTerm}". Try a different search term.
        </div>
      )}

      {selectedTable && !loading && tableData.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#666',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          border: '1px solid #dee2e6'
        }}>
          No data found in this table. Use the form above to add your first row!
        </div>
      )}

      {!selectedTable && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#666',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>Welcome to Tomulator Database Manager Test App</h3>
          <p style={{ marginBottom: '20px' }}>
            Select a table from the dropdown above to view and edit data.
          </p>
          {/* <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
            {tables.slice(0, 4).map(table => (
              <div key={table.table_name} style={{ 
                padding: '20px', 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                border: '1px solid #dee2e6',
                textAlign: 'left'
              }}>
                <h4 style={{ color: '#007bff', marginBottom: '10px' }}>
                  {table.table_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h4>
                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                  {getTableDescription(table.table_name)}
                </p>
              </div>
            ))}
          </div> */}
        </div>
      )}
    </div>
  );
};

export default SimpleCrudApp;
