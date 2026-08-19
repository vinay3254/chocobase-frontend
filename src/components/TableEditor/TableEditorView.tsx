import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  MoreVertical, 
  Layers, 
  Columns, 
  FileText, 
  Eye, 
  Sparkles,
  Link,
  ChevronDown,
  Info,
  Key,
  ChevronUp
} from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';
import { TableDefinition, ColumnDefinition, ColumnType, TableRowData, RlsPolicy } from '../../types';
import { VisualFilterBar, FilterCondition, FilterOperator } from './VisualFilterBar';

export const TableEditorView: React.FC = () => {
  const { 
    tables, 
    selectedTableId, 
    setSelectedTableId, 
    tableData, 
    updateTableRow, 
    insertTableRow, 
    deleteTableRow, 
    addNewTable,
    addColumnToTable,
    toggleRls,
    addRlsPolicy,
    deleteRlsPolicy,
    selectedSchema,
    setSelectedSchema,
    showNotification
  } = useSupabase();

  const [tableSearch, setTableSearch] = useState('');
  const [dataSearch, setDataSearch] = useState('');
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  const [matchMode, setMatchMode] = useState<'all' | 'any'>('all');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modals & Panels
  const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [isNewTableModalOpen, setIsNewTableModalOpen] = useState(false);
  const [isPolicyDrawerOpen, setIsPolicyDrawerOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{ rowId: string; colName: string } | null>(null);
  const [cellValue, setCellValue] = useState('');

  // Selected table
  const currentTable = useMemo(() => {
    return tables.find(t => t.id === selectedTableId) || tables[0];
  }, [tables, selectedTableId]);

  const rows = useMemo(() => {
    if (!currentTable) return [];
    return tableData[currentTable.id] || [];
  }, [tableData, currentTable]);

  // Comprehensive Filtering and Sorting
  const processedRows = useMemo(() => {
    let result = [...rows];

    // 1. Global fuzzy text search across all columns
    if (dataSearch.trim()) {
      const q = dataSearch.toLowerCase().trim();
      result = result.filter(r => 
        Object.values(r).some(val => 
          val !== null && val !== undefined && String(val).toLowerCase().includes(q)
        )
      );
    }

    // 2. Visual column filter conditions evaluation
    const activeConditions = filterConditions.filter(c => c.enabled);
    if (activeConditions.length > 0) {
      result = result.filter(r => {
        const evaluateCondition = (cond: FilterCondition): boolean => {
          const cell = r[cond.column];
          const val = (cond.value || '').trim().toLowerCase();

          if (cond.operator === 'is_null') {
            return cell === null || cell === undefined || cell === '';
          }
          if (cond.operator === 'is_not_null') {
            return cell !== null && cell !== undefined && cell !== '';
          }
          if (cond.operator === 'is_true') {
            return cell === true || cell === 'true' || cell === 1;
          }
          if (cond.operator === 'is_false') {
            return cell === false || cell === 'false' || cell === 0;
          }

          if (cell === null || cell === undefined) return false;

          const cellStr = String(cell).toLowerCase();

          if (cond.operator === 'contains') {
            return cellStr.includes(val);
          }
          if (cond.operator === 'does_not_contain') {
            return !cellStr.includes(val);
          }
          if (cond.operator === 'equals') {
            return cellStr === val;
          }
          if (cond.operator === 'not_equals') {
            return cellStr !== val;
          }
          if (cond.operator === 'starts_with') {
            return cellStr.startsWith(val);
          }
          if (cond.operator === 'ends_with') {
            return cellStr.endsWith(val);
          }

          // Numeric comparisons
          const cellNum = Number(cell);
          const valNum = Number(cond.value);
          if (!isNaN(cellNum) && !isNaN(valNum)) {
            if (cond.operator === 'greater_than') return cellNum > valNum;
            if (cond.operator === 'less_than') return cellNum < valNum;
            if (cond.operator === 'greater_or_equal') return cellNum >= valNum;
            if (cond.operator === 'less_or_equal') return cellNum <= valNum;
          }

          return true;
        };

        if (matchMode === 'all') {
          return activeConditions.every(evaluateCondition);
        } else {
          return activeConditions.some(evaluateCondition);
        }
      });
    }

    // 3. Sorting
    if (sortColumn) {
      result.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return sortDirection === 'asc' 
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return result;
  }, [rows, dataSearch, filterConditions, matchMode, sortColumn, sortDirection]);

  // Inline editing handler
  const handleStartEdit = (rowId: string, colName: string, initialVal: any) => {
    setEditingCell({ rowId, colName });
    setCellValue(typeof initialVal === 'object' ? JSON.stringify(initialVal) : String(initialVal ?? ''));
  };

  const handleSaveCell = (rowId: string, colName: string) => {
    if (!currentTable) return;
    let finalVal: any = cellValue;
    const colDef = currentTable.columns.find(c => c.name === colName);

    if (colDef?.type === 'integer' || colDef?.type === 'bigint') {
      finalVal = cellValue === '' ? null : parseInt(cellValue, 10);
    } else if (colDef?.type === 'numeric') {
      finalVal = cellValue === '' ? null : parseFloat(cellValue);
    } else if (colDef?.type === 'boolean') {
      finalVal = cellValue === 'true';
    } else if (colDef?.type === 'jsonb' || colDef?.type === 'json') {
      try {
        finalVal = JSON.parse(cellValue);
      } catch (e) {
        // keep as string
      }
    }

    updateTableRow(currentTable.id, rowId, { [colName]: finalVal });
    setEditingCell(null);
  };

  // Export handlers
  const exportAsCsv = () => {
    if (!currentTable || processedRows.length === 0) return;
    const cols = currentTable.columns.map(c => c.name);
    const csvLines = [
      cols.join(','),
      ...processedRows.map(r => cols.map(c => JSON.stringify(r[c] ?? '')).join(','))
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTable.name}_export.csv`;
    a.click();
    showNotification(`Exported ${processedRows.length} rows to CSV`);
  };

  const exportAsJson = () => {
    if (!currentTable) return;
    const blob = new Blob([JSON.stringify(processedRows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTable.name}_export.json`;
    a.click();
    showNotification(`Exported ${processedRows.length} rows to JSON`);
  };

  return (
    <div id="table-editor-view" className="flex h-[calc(100vh-4rem)] bg-[#FAF7F2] overflow-hidden text-[#2B1D20]">
      {/* Left Sidebar: Schema Tables List */}
      <div className="w-64 border-r border-[#E8DDD2] bg-[#FFFDF9] flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-[#E8DDD2] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2B1D20]">
              <Layers className="w-3.5 h-3.5 text-[#8B1E3F]" />
              <span>Tables ({tables.length})</span>
            </div>
            <button
              id="btn-create-table-modal"
              onClick={() => setIsNewTableModalOpen(true)}
              className="p-1 rounded-md border border-[#E8DDD2] hover:bg-[#FAF7F2] text-[#685559] hover:text-[#2B1D20] transition-colors shadow-2xs"
              title="Create new database table"
            >
              <Plus className="w-3.5 h-3.5 text-[#8B1E3F]" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#9B888C]" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Filter tables..."
              className="w-full pl-8 pr-2.5 py-1 rounded-md bg-[#FAF7F2] border border-[#E8DDD2] text-xs text-[#2B1D20] placeholder-[#9B888C] focus:outline-hidden focus:border-[#8B1E3F]"
            />
          </div>
        </div>

        {/* Tables list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {tables
            .filter(t => t.name.toLowerCase().includes(tableSearch.toLowerCase()))
            .map((table) => {
              const isSelected = table.id === currentTable?.id;
              const count = tableData[table.id]?.length ?? (table.rowsCount || 0);
              return (
                <button
                  key={table.id}
                  id={`table-list-item-${table.name}`}
                  onClick={() => setSelectedTableId(table.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs transition-colors ${
                    isSelected 
                      ? 'bg-[#FDF0F3] text-[#8B1E3F] font-semibold border-l-2 border-[#8B1E3F]' 
                      : 'text-[#685559] hover:text-[#2B1D20] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Table className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-[#8B1E3F]' : 'text-[#9B888C]'}`} />
                    <span className="truncate font-mono">{table.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {table.rlsEnabled && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#286E4F]" title="RLS Enabled" />
                    )}
                    <span className="font-mono text-[10px] text-[#9B888C]">{count}</span>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Main Content: Table Explorer Grid */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FAF7F2]">
        {/* Top Action Bar */}
        {currentTable && (
          <div className="p-3.5 border-b border-[#E8DDD2] bg-[#FFFDF9] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#2B1D20] font-mono">{currentTable.name}</h2>
                  <button
                    id="btn-toggle-rls-drawer"
                    onClick={() => setIsPolicyDrawerOpen(true)}
                    className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                      currentTable.rlsEnabled
                        ? 'bg-[#EFF7F3] text-[#286E4F] border-[#C4E6D5] hover:bg-[#E2F2E9]'
                        : 'bg-[#FFF8E6] text-[#B87A00] border-[#FCE199] hover:bg-[#FFF3D1]'
                    }`}
                  >
                    {currentTable.rlsEnabled ? <ShieldCheck className="w-3 h-3 text-[#286E4F]" /> : <ShieldAlert className="w-3 h-3 text-[#B87A00]" />}
                    <span>{currentTable.rlsEnabled ? `RLS Active (${currentTable.policies.length} policies)` : 'RLS Disabled'}</span>
                  </button>
                </div>
                {currentTable.comment && (
                  <p className="text-[11px] text-[#685559] mt-0.5">{currentTable.comment}</p>
                )}
              </div>
            </div>

            {/* Actions: Insert Row, Add Column, Export */}
            <div className="flex items-center gap-2">
              <button
                id="btn-add-column-modal"
                onClick={() => setIsAddColumnModalOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-[#E8DDD2] bg-[#FFFDF9] hover:bg-[#FAF7F2] text-xs font-medium text-[#2B1D20] flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Columns className="w-3.5 h-3.5 text-[#685559]" />
                <span>Add Column</span>
              </button>

              <button
                id="btn-insert-row-modal"
                onClick={() => setIsInsertModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-[#8B1E3F] hover:bg-[#721833] text-xs font-medium text-white flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Insert Row</span>
              </button>

              <div className="relative group">
                <button
                  className="px-3 py-1.5 rounded-lg border border-[#E8DDD2] bg-[#FFFDF9] hover:bg-[#FAF7F2] text-xs font-medium text-[#2B1D20] flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#685559]" />
                  <span className="hidden sm:inline">Export</span>
                  <ChevronDown className="w-3 h-3 text-[#9B888C]" />
                </button>
                <div className="absolute right-0 mt-1 w-36 bg-[#FFFDF9] border border-[#E8DDD2] rounded-lg shadow-lg py-1 hidden group-hover:block z-30">
                  <button
                    onClick={exportAsCsv}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#2B1D20] hover:bg-[#FAF7F2]"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={exportAsJson}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#2B1D20] hover:bg-[#FAF7F2]"
                  >
                    Export as JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visual Filter Bar Component */}
        {currentTable && (
          <VisualFilterBar
            columns={currentTable.columns}
            conditions={filterConditions}
            matchMode={matchMode}
            onConditionsChange={setFilterConditions}
            onMatchModeChange={setMatchMode}
            totalRows={rows.length}
            filteredRowsCount={processedRows.length}
            dataSearch={dataSearch}
            onDataSearchChange={setDataSearch}
          />
        )}

        {/* Data Grid */}
        <div className="flex-1 overflow-auto bg-[#FFFDF9]">
          {currentTable && (
            <table className="w-full border-collapse text-left text-xs font-mono select-text">
              <thead className="sticky top-0 z-10 bg-[#FAF7F2] border-b border-[#E8DDD2] text-[#685559]">
                <tr>
                  <th className="w-10 px-3 py-2 text-center text-[#999] border-r border-[#ececec]">#</th>
                  {currentTable.columns.map((col) => {
                    const isSorted = sortColumn === col.name;
                    return (
                      <th
                        key={col.name}
                        onClick={() => {
                          if (sortColumn === col.name) {
                            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortColumn(col.name);
                            setSortDirection('asc');
                          }
                        }}
                        className="px-3.5 py-2.5 font-bold text-[#685559] text-[11px] uppercase tracking-wider border-r border-[#E8DDD2] whitespace-nowrap hover:bg-[#FAF7F2] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {col.isPrimary && <Key className="w-3 h-3 text-[#8B1E3F]" />}
                            <span className="text-[#2B1D20]">{col.name}</span>
                            <span className="text-[10px] text-[#9B888C] font-normal lowercase">({col.type})</span>
                          </div>
                          {isSorted && (
                            <span className="text-[#8B1E3F]">
                              {sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                  <th className="w-12 px-3 py-2 text-center text-[#9B888C]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DDD2] text-[#2B1D20]">
                {processedRows.length === 0 ? (
                  <tr>
                    <td colSpan={currentTable.columns.length + 2} className="py-16 text-center text-[#9B888C] text-xs">
                      <div className="max-w-xs mx-auto space-y-2">
                        <Filter className="w-6 h-6 mx-auto text-[#9B888C]/60" />
                        <p className="font-semibold text-[#2B1D20]">No matching records found</p>
                        <p className="text-[11px] text-[#685559]">Adjust or clear your column filters and search criteria to see table rows.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  processedRows.map((row, rowIdx) => (
                    <tr 
                      key={row.id || rowIdx}
                      className="hover:bg-[#FAF7F2] transition-colors group"
                    >
                      <td className="px-3 py-2 text-center text-[#9B888C] font-mono text-[11px] border-r border-[#E8DDD2]">
                        {rowIdx + 1}
                      </td>

                      {currentTable.columns.map((col) => {
                        const val = row[col.name];
                        const isEditing = editingCell?.rowId === row.id && editingCell?.colName === col.name;

                        let displayVal = val;
                        if (val === null || val === undefined) {
                          displayVal = <span className="text-[#9B888C] italic">null</span>;
                        } else if (typeof val === 'boolean') {
                          displayVal = (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${val ? 'bg-[#EFF7F3] text-[#286E4F] border border-[#C4E6D5]' : 'bg-[#FDF0F3] text-[#8B1E3F] border border-[#F5C2CD]'}`}>
                              {String(val)}
                            </span>
                          );
                        } else if (typeof val === 'object') {
                          displayVal = (
                            <span className="text-[#8B1E3F] truncate max-w-xs block font-mono text-[11px]" title={JSON.stringify(val)}>
                              {JSON.stringify(val)}
                            </span>
                          );
                        }

                        return (
                          <td
                            key={col.name}
                            onDoubleClick={() => !col.isPrimary && handleStartEdit(row.id, col.name, val)}
                            className="px-3.5 py-2 border-r border-[#E8DDD2] whitespace-nowrap max-w-xs truncate text-[#2B1D20]"
                          >
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  autoFocus
                                  value={cellValue}
                                  onChange={(e) => setCellValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveCell(row.id, col.name);
                                    if (e.key === 'Escape') setEditingCell(null);
                                  }}
                                  className="w-full bg-[#FFFDF9] text-[#2B1D20] text-xs px-1.5 py-0.5 rounded border border-[#8B1E3F] focus:outline-hidden"
                                />
                                <button
                                  onClick={() => handleSaveCell(row.id, col.name)}
                                  className="p-0.5 text-[#8B1E3F] hover:text-[#721833]"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingCell(null)}
                                  className="p-0.5 text-[#9B888C] hover:text-[#2B1D20]"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-1 group/cell">
                                <span className="truncate">{displayVal}</span>
                                {!col.isPrimary && (
                                  <button
                                    onClick={() => handleStartEdit(row.id, col.name, val)}
                                    className="opacity-0 group-hover/cell:opacity-100 p-0.5 text-[#9B888C] hover:text-[#2B1D20] transition-opacity"
                                    title="Edit cell"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* Row Actions */}
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => deleteTableRow(currentTable.id, row.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#9B888C] hover:text-[#8B1E3F] transition-opacity"
                          title="Delete row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Insert Row Modal */}
      {isInsertModalOpen && currentTable && (
        <InsertRowModal
          table={currentTable}
          onClose={() => setIsInsertModalOpen(false)}
          onInsert={(newRow) => {
            insertTableRow(currentTable.id, newRow);
            setIsInsertModalOpen(false);
          }}
        />
      )}

      {/* Add Column Modal */}
      {isAddColumnModalOpen && currentTable && (
        <AddColumnModal
          table={currentTable}
          onClose={() => setIsAddColumnModalOpen(false)}
          onAddColumn={(col) => {
            addColumnToTable(currentTable.id, col);
            setIsAddColumnModalOpen(false);
          }}
        />
      )}

      {/* Create Table Modal */}
      {isNewTableModalOpen && (
        <CreateTableModal
          onClose={() => setIsNewTableModalOpen(false)}
          onCreateTable={(tbl) => {
            addNewTable(tbl);
            setIsNewTableModalOpen(false);
          }}
        />
      )}

      {/* Policy Drawer */}
      {isPolicyDrawerOpen && currentTable && (
        <PolicyDrawer
          table={currentTable}
          onClose={() => setIsPolicyDrawerOpen(false)}
          onToggleRls={() => toggleRls(currentTable.id)}
          onAddPolicy={(pol) => addRlsPolicy(currentTable.id, pol)}
          onDeletePolicy={(polId) => deleteRlsPolicy(currentTable.id, polId)}
        />
      )}
    </div>
  );
};

// Subcomponent: Insert Row Modal
const InsertRowModal: React.FC<{
  table: TableDefinition;
  onClose: () => void;
  onInsert: (row: Record<string, any>) => void;
}> = ({ table, onClose, onInsert }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInsert(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#FFFDF9] border border-[#E8DDD2] rounded-xl shadow-2xl overflow-hidden text-[#2B1D20] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8DDD2] bg-[#FAF7F2]">
          <h3 className="text-sm font-semibold text-[#2B1D20]">Insert Row into {table.name}</h3>
          <button onClick={onClose} className="text-[#9B888C] hover:text-[#2B1D20]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[70vh] overflow-y-auto">
          {table.columns.map((col) => {
            if (col.name === 'created_at' || col.name === 'updated_at') return null;
            return (
              <div key={col.name}>
                <label className="block text-xs font-medium text-[#2B1D20] mb-1">
                  {col.name} <span className="text-[#9B888C] font-mono">({col.type})</span>
                  {col.isPrimary && <span className="text-[#8B1E3F] ml-1 text-[10px] font-semibold">PRIMARY KEY</span>}
                </label>
                {col.type === 'boolean' ? (
                  <select
                    onChange={(e) => setFormData({ ...formData, [col.name]: e.target.value === 'true' })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs text-[#2B1D20] focus:outline-hidden focus:border-[#8B1E3F]"
                  >
                    <option value="false">false</option>
                    <option value="true">true</option>
                  </select>
                ) : col.type === 'jsonb' || col.type === 'json' ? (
                  <textarea
                    rows={2}
                    placeholder='{"key": "value"}'
                    onChange={(e) => {
                      try {
                        setFormData({ ...formData, [col.name]: JSON.parse(e.target.value) });
                      } catch {
                        setFormData({ ...formData, [col.name]: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs text-[#2B1D20] font-mono focus:outline-hidden focus:border-[#8B1E3F]"
                  />
                ) : (
                  <input
                    type="text"
                    placeholder={col.defaultValue || (col.isNullable ? 'NULL' : '')}
                    onChange={(e) => setFormData({ ...formData, [col.name]: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs text-[#2B1D20] font-mono focus:outline-hidden focus:border-[#8B1E3F]"
                  />
                )}
              </div>
            );
          })}

          <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E8DDD2]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs text-[#685559] hover:bg-[#FAF7F2] border border-[#E8DDD2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#8B1E3F] hover:bg-[#721833] text-xs font-medium text-white shadow-xs"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Subcomponent: Add Column Modal
const AddColumnModal: React.FC<{
  table: TableDefinition;
  onClose: () => void;
  onAddColumn: (col: ColumnDefinition) => void;
}> = ({ table, onClose, onAddColumn }) => {
  const [colName, setColName] = useState('');
  const [colType, setColType] = useState<ColumnType>('text');
  const [defaultValue, setDefaultValue] = useState('');
  const [isNullable, setIsNullable] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colName.trim()) return;
    onAddColumn({
      name: colName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      type: colType,
      defaultValue: defaultValue.trim() || null,
      isNullable,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#FFFDF9] border border-[#E8DDD2] rounded-xl shadow-2xl overflow-hidden text-[#2B1D20]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8DDD2] bg-[#FAF7F2]">
          <h3 className="text-sm font-semibold text-[#2B1D20]">Add Column to {table.name}</h3>
          <button onClick={onClose} className="text-[#9B888C] hover:text-[#2B1D20]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#2B1D20] mb-1">Column Name</label>
            <input
              type="text"
              required
              value={colName}
              onChange={(e) => setColName(e.target.value)}
              placeholder="e.g. status, bio, priority"
              className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs text-[#2B1D20] focus:outline-hidden focus:border-[#8B1E3F] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2B1D20] mb-1">Type</label>
            <select
              value={colType}
              onChange={(e) => setColType(e.target.value as ColumnType)}
              className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs text-[#2B1D20] focus:outline-hidden focus:border-[#8B1E3F] font-mono"
            >
              <option value="text">text</option>
              <option value="varchar">varchar</option>
              <option value="integer">integer</option>
              <option value="bigint">bigint</option>
              <option value="numeric">numeric</option>
              <option value="boolean">boolean</option>
              <option value="uuid">uuid</option>
              <option value="timestamptz">timestamptz</option>
              <option value="jsonb">jsonb</option>
              <option value="vector">vector (pgvector)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2B1D20] mb-1">Default Value (Optional)</label>
            <input
              type="text"
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              placeholder="e.g. 'draft', 0, NOW()"
              className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs text-[#2B1D20] focus:outline-hidden focus:border-[#8B1E3F] font-mono"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="nullable-checkbox"
              checked={isNullable}
              onChange={(e) => setIsNullable(e.target.checked)}
              className="rounded border-[#E8DDD2] text-[#8B1E3F] focus:ring-0"
            />
            <label htmlFor="nullable-checkbox" className="text-xs text-[#685559]">Allow NULL values</label>
          </div>

          <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E8DDD2]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs text-[#685559] hover:bg-[#FAF7F2] border border-[#E8DDD2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#8B1E3F] hover:bg-[#721833] text-xs font-medium text-white shadow-xs"
            >
              Add Column
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Subcomponent: Create Table Modal
const CreateTableModal: React.FC<{
  onClose: () => void;
  onCreateTable: (table: TableDefinition) => void;
}> = ({ onClose, onCreateTable }) => {
  const [tableName, setTableName] = useState('');
  const [description, setDescription] = useState('');
  const [enableRls, setEnableRls] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableName.trim()) return;

    const cleanName = tableName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const newTbl: TableDefinition = {
      id: `tbl-${cleanName}-${Date.now()}`,
      schema: 'public',
      name: cleanName,
      comment: description.trim() || undefined,
      rlsEnabled: enableRls,
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, defaultValue: 'gen_random_uuid()', isNullable: false },
        { name: 'created_at', type: 'timestamptz', defaultValue: 'NOW()', isNullable: false }
      ],
      indexes: [
        { name: `${cleanName}_pkey`, columns: ['id'], isUnique: true, type: 'btree' }
      ],
      policies: enableRls ? [
        {
          id: `pol-${Date.now()}`,
          name: `Enable read access for authenticated users on ${cleanName}`,
          command: 'SELECT',
          roles: ['authenticated'],
          usingExpression: 'true',
          action: 'PERMISSIVE'
        }
      ] : [],
      rowsCount: 0,
      sizeBytes: 8192
    };

    onCreateTable(newTbl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#FFFDF9] border border-[#E8DDD2] rounded-xl shadow-2xl overflow-hidden text-[#2B1D20]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8DDD2] bg-[#FAF7F2]">
          <h3 className="text-sm font-semibold text-[#2B1D20]">Create New Table</h3>
          <button onClick={onClose} className="text-[#9B888C] hover:text-[#2B1D20]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#2B1D20] mb-1">Table Name</label>
            <input
              type="text"
              required
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="e.g. notifications, projects, audit_logs"
              className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs text-[#2B1D20] focus:outline-hidden focus:border-[#8B1E3F] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2B1D20] mb-1">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. User notifications with delivery status"
              className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs text-[#2B1D20] focus:outline-hidden focus:border-[#8B1E3F]"
            />
          </div>

          <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#2B1D20]">Enable Row Level Security (RLS)</div>
              <p className="text-[11px] text-[#685559]">Enforce database-level access control policies</p>
            </div>
            <input
              type="checkbox"
              checked={enableRls}
              onChange={(e) => setEnableRls(e.target.checked)}
              className="rounded border-[#E8DDD2] text-[#8B1E3F] focus:ring-0 w-4 h-4"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E8DDD2]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs text-[#685559] hover:bg-[#FAF7F2] border border-[#E8DDD2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#8B1E3F] hover:bg-[#721833] text-xs font-medium text-white shadow-xs"
            >
              Create Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Subcomponent: RLS Policy Drawer
const PolicyDrawer: React.FC<{
  table: TableDefinition;
  onClose: () => void;
  onToggleRls: () => void;
  onAddPolicy: (policy: RlsPolicy) => void;
  onDeletePolicy: (policyId: string) => void;
}> = ({ table, onClose, onToggleRls, onAddPolicy, onDeletePolicy }) => {
  const [isAddingPolicy, setIsAddingPolicy] = useState(false);
  const [policyName, setPolicyName] = useState('');
  const [command, setCommand] = useState<RlsPolicy['command']>('SELECT');
  const [targetRole, setTargetRole] = useState('authenticated');
  const [usingExpr, setUsingExpr] = useState('auth.uid() = user_id');

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyName.trim()) return;

    onAddPolicy({
      id: `pol-${Date.now()}`,
      name: policyName.trim(),
      command,
      roles: [targetRole],
      usingExpression: usingExpr.trim(),
      action: 'PERMISSIVE'
    });
    setIsAddingPolicy(false);
    setPolicyName('');
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md z-50 bg-[#FFFDF9] border-l border-[#E8DDD2] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 text-[#2B1D20]">
      <div className="p-4 border-b border-[#E8DDD2] bg-[#FAF7F2] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#286E4F]" />
          <h3 className="text-sm font-semibold text-[#2B1D20]">RLS Policies for {table.name}</h3>
        </div>
        <button onClick={onClose} className="text-[#9B888C] hover:text-[#2B1D20]">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* Toggle RLS */}
        <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#2B1D20]">Row Level Security</div>
            <div className="text-[11px] text-[#685559]">
              {table.rlsEnabled ? 'Restricts unauthorized SQL, REST & GraphQL queries' : 'Table is publicly accessible without policies'}
            </div>
          </div>
          <button
            onClick={onToggleRls}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              table.rlsEnabled
                ? 'bg-[#EFF7F3] text-[#286E4F] border border-[#C4E6D5]'
                : 'bg-[#FAF7F2] text-[#685559] border border-[#E8DDD2]'
            }`}
          >
            {table.rlsEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Existing Policies */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-[#2B1D20]">
            <span>Active Policies ({table.policies.length})</span>
            <button
              onClick={() => setIsAddingPolicy(true)}
              className="text-[#8B1E3F] hover:text-[#721833] flex items-center gap-1 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Add Policy
            </button>
          </div>

          {table.policies.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#9B888C] border border-dashed border-[#E8DDD2] rounded-lg">
              No policies configured. When RLS is enabled, no data can be queried unless a policy allows it.
            </div>
          ) : (
            table.policies.map((policy) => (
              <div key={policy.id} className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold text-[#2B1D20]">{policy.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EFF7F3] text-[#286E4F] border border-[#C4E6D5]">
                        {policy.command}
                      </span>
                      <span className="text-[10px] text-[#685559]">
                        Roles: {policy.roles.join(', ')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeletePolicy(policy.id)}
                    className="p-1 text-[#9B888C] hover:text-[#8B1E3F]"
                    title="Delete Policy"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-2 rounded bg-[#FFFDF9] border border-[#E8DDD2] text-[11px] font-mono text-[#685559] truncate">
                  USING ({policy.usingExpression})
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Policy Form */}
        {isAddingPolicy && (
          <form onSubmit={handleSavePolicy} className="p-4 rounded-lg bg-[#FAF7F2] border border-[#8B1E3F]/30 space-y-3">
            <h4 className="text-xs font-semibold text-[#8B1E3F]">New Policy Definition</h4>
            <div>
              <label className="block text-[11px] text-[#2B1D20] mb-1">Policy Name</label>
              <input
                type="text"
                required
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
                placeholder="e.g. Users can read their own documents"
                className="w-full px-2.5 py-1.5 rounded-md bg-[#FFFDF9] border border-[#E8DDD2] text-xs text-[#2B1D20] focus:outline-hidden focus:border-[#8B1E3F]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-[#2B1D20] mb-1">Command</label>
                <select
                  value={command}
                  onChange={(e) => setCommand(e.target.value as any)}
                  className="w-full px-2 py-1.5 rounded-md bg-[#FFFDF9] border border-[#E8DDD2] text-xs text-[#2B1D20] focus:outline-hidden focus:border-[#8B1E3F]"
                >
                  <option value="SELECT">SELECT</option>
                  <option value="INSERT">INSERT</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                  <option value="ALL">ALL</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-[#2B1D20] mb-1">Target Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-md bg-[#FFFDF9] border border-[#E8DDD2] text-xs text-[#2B1D20] focus:outline-hidden focus:border-[#8B1E3F]"
                >
                  <option value="authenticated">authenticated</option>
                  <option value="anon">anon</option>
                  <option value="public">public</option>
                  <option value="service_role">service_role</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-[#2B1D20] mb-1">USING Expression (SQL)</label>
              <input
                type="text"
                required
                value={usingExpr}
                onChange={(e) => setUsingExpr(e.target.value)}
                placeholder="auth.uid() = user_id"
                className="w-full px-2.5 py-1.5 rounded-md bg-[#FFFDF9] border border-[#E8DDD2] text-xs text-[#2B1D20] font-mono focus:outline-hidden focus:border-[#8B1E3F]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingPolicy(false)}
                className="px-3 py-1 text-xs text-[#685559] hover:bg-[#FAF7F2] border border-[#E8DDD2] rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-[#8B1E3F] hover:bg-[#721833] text-xs font-medium text-white rounded shadow-xs"
              >
                Save Policy
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
