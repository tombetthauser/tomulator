import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ColumnDefinition {
  name: string;
  type: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  defaultValue: string;
  isAutoIncrement: boolean;
}

const NewTableCreator: React.FC = () => {
  const navigate = useNavigate();
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState<ColumnDefinition[]>([
    {
      name: 'id',
      type: 'SERIAL',
      isNullable: false,
      isPrimaryKey: true,
      defaultValue: '',
      isAutoIncrement: true
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isResizing, setIsResizing] = useState(false);
  const [currentResizer, setCurrentResizer] = useState<number | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const dataTypes = [
    'SERIAL',
    'INTEGER',
    'BIGINT',
    'SMALLINT',
    'TEXT',
    'VARCHAR',
    'CHAR',
    'BOOLEAN',
    'TIMESTAMP',
    'DATE',
    'TIME',
    'NUMERIC',
    'DECIMAL',
    'REAL',
    'DOUBLE PRECISION',
    'JSON',
    'JSONB',
    'UUID'
  ];

  const addColumn = () => {
    setColumns([
      ...columns,
      {
        name: '',
        type: 'TEXT',
        isNullable: true,
        isPrimaryKey: false,
        defaultValue: '',
        isAutoIncrement: false
      }
    ]);
  };

  const removeColumn = (index: number) => {
    if (columns[index].isPrimaryKey) {
      setError('Cannot remove primary key column');
      return;
    }
    setColumns(columns.filter((_, i) => i !== index));
    setError('');
  };

  const updateColumn = (index: number, field: keyof ColumnDefinition, value: any) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    
    // Handle special cases
    if (field === 'type') {
      // Reset auto-increment if type doesn't support it
      if (value !== 'SERIAL' && value !== 'INTEGER' && value !== 'BIGINT') {
        newColumns[index].isAutoIncrement = false;
      }
      // Reset default value if type is SERIAL
      if (value === 'SERIAL') {
        newColumns[index].defaultValue = '';
        newColumns[index].isAutoIncrement = true;
      }
    }
    
    if (field === 'isPrimaryKey') {
      // If setting as primary key, unset others
      if (value) {
        newColumns.forEach((col, i) => {
          if (i !== index) col.isPrimaryKey = false;
        });
      }
    }
    
    setColumns(newColumns);
    setError('');
  };

  const validateForm = (): boolean => {
    if (!tableName.trim()) {
      setError('Table name is required');
      return false;
    }
    
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      setError('Table name must start with a letter or underscore and contain only letters, numbers, and underscores');
      return false;
    }
    
    if (columns.length < 2) {
      setError('Table must have at least 2 columns');
      return false;
    }
    
    const hasPrimaryKey = columns.some(col => col.isPrimaryKey);
    if (!hasPrimaryKey) {
      setError('Table must have a primary key column');
      return false;
    }
    
    for (const column of columns) {
      if (!column.name.trim()) {
        setError('All columns must have names');
        return false;
      }
      
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column.name)) {
        setError('Column names must start with a letter or underscore and contain only letters, numbers, and underscores');
        return false;
      }
      
      if (column.type === 'VARCHAR' || column.type === 'CHAR') {
        if (!column.defaultValue || parseInt(column.defaultValue) <= 0) {
          setError('VARCHAR and CHAR columns must specify a length in the default value field');
          return false;
        }
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/tables/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableName,
          columns
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Table "${tableName}" created successfully!`);
        navigate('/');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create table');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDefaultValuePlaceholder = (type: string): string => {
    if (type === 'VARCHAR' || type === 'CHAR') return 'Length (e.g., 255)';
    if (type === 'NUMERIC' || type === 'DECIMAL') return 'Precision,Scale (e.g., 10,2)';
    if (type === 'SERIAL') return 'Auto-generated';
    return 'Default value (optional)';
  };

  const isDefaultValueDisabled = (type: string, isAutoIncrement: boolean): boolean => {
    return type === 'SERIAL' || isAutoIncrement;
  };

  const startResize = (e: React.MouseEvent, columnIndex: number) => {
    e.preventDefault();
    setIsResizing(true);
    setCurrentResizer(columnIndex);
    
    const startX = e.clientX;
    const th = tableRef.current?.querySelector(`th:nth-child(${columnIndex + 1})`) as HTMLElement;
    const startWidth = th?.getBoundingClientRect().width || 0;
    
    // Add visual feedback
    if (th) {
      th.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || currentResizer === null) return;
      
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(80, startWidth + deltaX); // Minimum width of 80px
      
      if (th) {
        th.style.width = `${newWidth}px`;
        th.style.minWidth = `${newWidth}px`;
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      setCurrentResizer(null);
      
      // Remove visual feedback
      if (th) {
        th.style.backgroundColor = '';
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Prevent text selection during resize
  const handleMouseDown = (e: React.MouseEvent, columnIndex: number) => {
    if (e.target === e.currentTarget) {
      startResize(e, columnIndex);
    }
  };

  return (
    <div className="page-container">
      <div className="header-container-large">
        <h1 className="page-title">Create New Table</h1>
        <button
          onClick={() => navigate('/')}
          className="btn"
        >
          ← Back to Database Manager
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <h3 className="section-title">Table Information</h3>
          <div className="form-row">
            <label className="form-label">Table Name:</label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="Enter table name (e.g., users, products)"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <div className="controls-container">
            <h3 className="section-title-no-margin">Columns</h3>
            <button
              type="button"
              onClick={addColumn}
              className="btn"
            >
              + Add Column
            </button>
          </div>

          <div className="table-container">
            <table className="table-bordered" ref={tableRef}>
              <thead>
                <tr>
                  <th onMouseDown={(e) => handleMouseDown(e, 0)}>Column Name</th>
                  <th onMouseDown={(e) => handleMouseDown(e, 1)}>Data Type</th>
                  <th className="center" onMouseDown={(e) => handleMouseDown(e, 2)}>Nullable</th>
                  <th className="center" onMouseDown={(e) => handleMouseDown(e, 3)}>Primary Key</th>
                  <th className="center" onMouseDown={(e) => handleMouseDown(e, 4)}>Auto Increment</th>
                  <th onMouseDown={(e) => handleMouseDown(e, 5)}>Default Value</th>
                  <th className="center" onMouseDown={(e) => handleMouseDown(e, 6)}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {columns.map((column, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={column.name}
                        onChange={(e) => updateColumn(index, 'name', e.target.value)}
                        placeholder="Column name"
                        className="form-input"
                      />
                    </td>
                    <td>
                      <select
                        value={column.type}
                        onChange={(e) => updateColumn(index, 'type', e.target.value)}
                        className="form-select-small"
                      >
                        {dataTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </td>
                    <td className="center">
                      <input
                        type="checkbox"
                        checked={column.isNullable}
                        onChange={(e) => updateColumn(index, 'isNullable', e.target.checked)}
                        disabled={column.isPrimaryKey}
                      />
                    </td>
                    <td className="center">
                      <input
                        type="checkbox"
                        checked={column.isPrimaryKey}
                        onChange={(e) => updateColumn(index, 'isPrimaryKey', e.target.checked)}
                      />
                    </td>
                    <td className="center">
                      <input
                        type="checkbox"
                        checked={column.isAutoIncrement}
                        onChange={(e) => updateColumn(index, 'isAutoIncrement', e.target.checked)}
                        disabled={!['SERIAL', 'INTEGER', 'BIGINT'].includes(column.type)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={column.defaultValue}
                        onChange={(e) => updateColumn(index, 'defaultValue', e.target.value)}
                        placeholder={getDefaultValuePlaceholder(column.type)}
                        disabled={isDefaultValueDisabled(column.type, column.isAutoIncrement)}
                        className={`form-input ${isDefaultValueDisabled(column.type, column.isAutoIncrement) ? 'form-input-disabled' : ''}`}
                      />
                    </td>
                    <td className="center">
                      <button
                        type="button"
                        onClick={() => removeColumn(index)}
                        disabled={column.isPrimaryKey}
                        className={`btn`}
                        style={{
                          cursor: column.isPrimaryKey ? 'not-allowed' : 'pointer',
                          opacity: column.isPrimaryKey ? 0.6 : 1
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn ${isSubmitting ? 'btn-secondary' : ''}`}
            style={{ marginRight: '15px' }}
          >
            {isSubmitting ? 'Creating Table...' : 'Create Table'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn"
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="info-box-large">
        <h4 className="tips-title">💡 Tips for Creating Tables</h4>
        <ul className="tips-text">
          <li>Every table should have a primary key column (usually an ID)</li>
          <li>Use SERIAL for auto-incrementing primary keys</li>
          <li>VARCHAR and CHAR columns require specifying a length in the default value field</li>
          <li>Consider adding an 'is_deleted' column for soft delete functionality</li>
          <li>Use TIMESTAMP for date/time fields that need timezone awareness</li>
          <li>Primary key columns cannot be nullable</li>
        </ul>
      </div>
    </div>
  );
};

export default NewTableCreator;
