import React, { useState } from 'react';
import { 
  Filter, 
  Plus, 
  Trash2, 
  X, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  SlidersHorizontal, 
  Sparkles,
  Tag,
  Search,
  EyeOff,
  Columns
} from 'lucide-react';
import { ColumnDefinition } from '../../types';

export type FilterOperator = 
  | 'contains' 
  | 'does_not_contain'
  | 'equals' 
  | 'not_equals' 
  | 'starts_with' 
  | 'ends_with' 
  | 'greater_than' 
  | 'less_than' 
  | 'greater_or_equal' 
  | 'less_or_equal' 
  | 'is_true' 
  | 'is_false' 
  | 'is_null' 
  | 'is_not_null';

export interface FilterCondition {
  id: string;
  column: string;
  operator: FilterOperator;
  value: string;
  enabled: boolean;
}

interface VisualFilterBarProps {
  columns: ColumnDefinition[];
  conditions: FilterCondition[];
  matchMode: 'all' | 'any';
  onConditionsChange: (conditions: FilterCondition[]) => void;
  onMatchModeChange: (mode: 'all' | 'any') => void;
  totalRows: number;
  filteredRowsCount: number;
  dataSearch: string;
  onDataSearchChange: (search: string) => void;
}

export const VisualFilterBar: React.FC<VisualFilterBarProps> = ({
  columns,
  conditions,
  matchMode,
  onConditionsChange,
  onMatchModeChange,
  totalRows,
  filteredRowsCount,
  dataSearch,
  onDataSearchChange
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Helper to determine available operators by column type
  const getOperatorsForType = (type: string): { label: string; value: FilterOperator }[] => {
    switch (type) {
      case 'integer':
      case 'bigint':
      case 'numeric':
        return [
          { label: '= equals', value: 'equals' },
          { label: '≠ not equals', value: 'not_equals' },
          { label: '> greater than', value: 'greater_than' },
          { label: '< less than', value: 'less_than' },
          { label: '≥ greater or equal', value: 'greater_or_equal' },
          { label: '≤ less or equal', value: 'less_or_equal' },
          { label: 'is null (empty)', value: 'is_null' },
          { label: 'is not null (has value)', value: 'is_not_null' },
        ];
      case 'boolean':
        return [
          { label: 'is TRUE', value: 'is_true' },
          { label: 'is FALSE', value: 'is_false' },
          { label: 'is null', value: 'is_null' },
          { label: 'is not null', value: 'is_not_null' },
        ];
      case 'timestamp':
      case 'timestamptz':
      case 'date':
        return [
          { label: 'contains date/time', value: 'contains' },
          { label: '= equals exact date', value: 'equals' },
          { label: '> after timestamp', value: 'greater_than' },
          { label: '< before timestamp', value: 'less_than' },
          { label: 'is null', value: 'is_null' },
          { label: 'is not null', value: 'is_not_null' },
        ];
      default:
        // text, varchar, uuid, jsonb, etc.
        return [
          { label: 'contains substring', value: 'contains' },
          { label: 'does not contain', value: 'does_not_contain' },
          { label: '= exact match', value: 'equals' },
          { label: '≠ not equal to', value: 'not_equals' },
          { label: 'starts with', value: 'starts_with' },
          { label: 'ends with', value: 'ends_with' },
          { label: 'is null / empty', value: 'is_null' },
          { label: 'is not null', value: 'is_not_null' },
        ];
    }
  };

  const handleAddCondition = (initialCol?: string) => {
    const targetCol = initialCol || columns[0]?.name || 'id';
    const colDef = columns.find(c => c.name === targetCol);
    const defaultOperator = colDef?.type === 'boolean' ? 'is_true' : 'contains';
    
    const newCondition: FilterCondition = {
      id: `filter_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      column: targetCol,
      operator: defaultOperator,
      value: '',
      enabled: true
    };
    onConditionsChange([...conditions, newCondition]);
    setIsExpanded(true);
  };

  const handleUpdateCondition = (id: string, updates: Partial<FilterCondition>) => {
    onConditionsChange(
      conditions.map(cond => {
        if (cond.id !== id) return cond;
        
        // If column changed, reset operator to a compatible one
        if (updates.column && updates.column !== cond.column) {
          const colDef = columns.find(c => c.name === updates.column);
          const validOps = getOperatorsForType(colDef?.type || 'text');
          const isOpValid = validOps.some(o => o.value === cond.operator);
          return {
            ...cond,
            ...updates,
            operator: isOpValid ? cond.operator : validOps[0].value,
            value: ''
          };
        }

        return { ...cond, ...updates };
      })
    );
  };

  const handleRemoveCondition = (id: string) => {
    onConditionsChange(conditions.filter(cond => cond.id !== id));
  };

  const handleClearAll = () => {
    onConditionsChange([]);
    onDataSearchChange('');
  };

  const activeConditionsCount = conditions.filter(c => c.enabled).length;
  const isUnaryOperator = (op: FilterOperator) => ['is_null', 'is_not_null', 'is_true', 'is_false'].includes(op);

  return (
    <div 
      id="table-visual-filter-bar" 
      className="border-b border-[#E8DDD2] bg-[#FAF7F2] text-[#2B1D20] text-xs transition-all select-none"
    >
      {/* Top Bar: Search Input, Quick Stats, Expand/Collapse, and Filter Presets */}
      <div className="px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3 bg-[#FAF7F2]">
        {/* Left Side: Global Record Search + Visual Filter Toggle */}
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px] max-w-xl">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#9B888C]" />
            <input
              type="text"
              value={dataSearch}
              onChange={(e) => onDataSearchChange(e.target.value)}
              placeholder="Fuzzy search all table records..."
              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[#FFFDF9] border border-[#E8DDD2] text-xs text-[#2B1D20] placeholder-[#9B888C] focus:outline-hidden focus:border-[#8B1E3F] focus:ring-1 focus:ring-[#8B1E3F]/20 transition-all shadow-2xs"
            />
            {dataSearch && (
              <button
                onClick={() => onDataSearchChange('')}
                className="absolute right-2 top-2 text-[#9B888C] hover:text-[#2B1D20] p-0.5"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Toggle Filter Panel Button */}
          <button
            id="btn-toggle-visual-filters"
            onClick={() => setIsExpanded(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-2xs ${
              activeConditionsCount > 0
                ? 'bg-[#8B1E3F] text-white border-[#8B1E3F] shadow-xs hover:bg-[#721833]'
                : 'bg-[#FFFDF9] border-[#E8DDD2] text-[#685559] hover:bg-[#F4EFEA] hover:text-[#2B1D20]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {activeConditionsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-[#8B1E3F] text-[10px] font-bold flex items-center justify-center">
                {activeConditionsCount}
              </span>
            )}
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Right Side: Rows Match Telemetry & Quick Action Badges */}
        <div className="flex items-center gap-2.5">
          {/* Row Count Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFFDF9] border border-[#E8DDD2] text-[11px] font-mono text-[#685559] shadow-2xs">
            <span className="font-bold text-[#2B1D20]">{filteredRowsCount}</span>
            <span>of {totalRows} rows</span>
            {filteredRowsCount < totalRows && (
              <span className="text-[#8B1E3F] font-semibold">
                ({totalRows - filteredRowsCount} filtered out)
              </span>
            )}
          </div>

          {/* Clear all filters button if any active */}
          {(activeConditionsCount > 0 || dataSearch.trim()) && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E8DDD2] bg-[#FFFDF9] hover:bg-[#F4EFEA] text-[11px] font-semibold text-[#8B1E3F] transition-colors shadow-2xs"
              title="Reset all filters and text search"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Visual Filter Builder Panel */}
      {isExpanded && (
        <div className="px-3.5 pt-1 pb-3 border-t border-[#E8DDD2]/60 bg-[#FFFDF9] space-y-2.5">
          {/* Quick Column Filter Quick-Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B888C] flex items-center gap-1 flex-shrink-0 mr-1">
              <Tag className="w-3 h-3" />
              Filter by:
            </span>
            {columns.map(col => {
              const isColFiltered = conditions.some(c => c.column === col.name && c.enabled);
              return (
                <button
                  key={col.name}
                  onClick={() => handleAddCondition(col.name)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] border font-mono transition-all flex-shrink-0 ${
                    isColFiltered
                      ? 'bg-[#FDF0F3] border-[#8B1E3F]/40 text-[#8B1E3F] font-semibold shadow-2xs'
                      : 'bg-[#FAF7F2] border-[#E8DDD2] text-[#685559] hover:border-[#8B1E3F]/30 hover:text-[#2B1D20]'
                  }`}
                  title={`Add filter condition for ${col.name} (${col.type})`}
                >
                  <span>{col.name}</span>
                  <span className="text-[9px] text-[#9B888C] opacity-75">({col.type.slice(0, 4)})</span>
                  <Plus className="w-2.5 h-2.5 opacity-60" />
                </button>
              );
            })}
          </div>

          {/* Active Filter Conditions List */}
          {conditions.length > 0 ? (
            <div className="space-y-2 pt-1">
              {/* Match Mode Logic Selector */}
              {conditions.length > 1 && (
                <div className="flex items-center gap-2 text-[11px] text-[#685559] font-medium pb-1">
                  <span>Match</span>
                  <div className="inline-flex rounded-md border border-[#E8DDD2] bg-[#FAF7F2] p-0.5 shadow-2xs">
                    <button
                      onClick={() => onMatchModeChange('all')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                        matchMode === 'all'
                          ? 'bg-[#8B1E3F] text-white shadow-xs'
                          : 'text-[#685559] hover:text-[#2B1D20]'
                      }`}
                    >
                      ALL (AND)
                    </button>
                    <button
                      onClick={() => onMatchModeChange('any')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                        matchMode === 'any'
                          ? 'bg-[#8B1E3F] text-white shadow-xs'
                          : 'text-[#685559] hover:text-[#2B1D20]'
                      }`}
                    >
                      ANY (OR)
                    </button>
                  </div>
                  <span>conditions:</span>
                </div>
              )}

              {/* Conditions List */}
              <div className="space-y-1.5">
                {conditions.map((cond, index) => {
                  const currentColumnDef = columns.find(c => c.name === cond.column) || columns[0];
                  const operators = getOperatorsForType(currentColumnDef?.type || 'text');
                  const unary = isUnaryOperator(cond.operator);

                  return (
                    <div 
                      key={cond.id}
                      className={`flex flex-wrap items-center gap-2 p-2 rounded-lg border transition-all ${
                        cond.enabled 
                          ? 'bg-[#FAF7F2] border-[#E8DDD2] shadow-2xs' 
                          : 'bg-[#F4EFEA]/60 border-[#E8DDD2]/60 opacity-60'
                      }`}
                    >
                      {/* Active Toggle Checkbox */}
                      <label className="flex items-center cursor-pointer" title="Enable / disable this filter condition">
                        <input
                          type="checkbox"
                          checked={cond.enabled}
                          onChange={(e) => handleUpdateCondition(cond.id, { enabled: e.target.checked })}
                          className="w-3.5 h-3.5 rounded border-[#E8DDD2] text-[#8B1E3F] focus:ring-[#8B1E3F]/30"
                        />
                      </label>

                      <span className="text-[11px] font-mono text-[#9B888C] w-5 text-center">
                        {index === 0 ? 'Where' : matchMode.toUpperCase()}
                      </span>

                      {/* Column Selector */}
                      <select
                        value={cond.column}
                        onChange={(e) => handleUpdateCondition(cond.id, { column: e.target.value })}
                        className="bg-[#FFFDF9] border border-[#E8DDD2] text-[#2B1D20] text-xs font-mono font-medium rounded-md px-2.5 py-1 focus:outline-hidden focus:border-[#8B1E3F] shadow-2xs"
                      >
                        {columns.map(c => (
                          <option key={c.name} value={c.name}>
                            {c.name} ({c.type})
                          </option>
                        ))}
                      </select>

                      {/* Operator Selector */}
                      <select
                        value={cond.operator}
                        onChange={(e) => handleUpdateCondition(cond.id, { operator: e.target.value as FilterOperator })}
                        className="bg-[#FFFDF9] border border-[#E8DDD2] text-[#2B1D20] text-xs rounded-md px-2.5 py-1 focus:outline-hidden focus:border-[#8B1E3F] shadow-2xs"
                      >
                        {operators.map(op => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>

                      {/* Filter Value Input (if not unary operator) */}
                      {!unary && (
                        <div className="flex-1 min-w-[140px]">
                          {currentColumnDef?.type === 'boolean' ? (
                            <select
                              value={cond.value}
                              onChange={(e) => handleUpdateCondition(cond.id, { value: e.target.value })}
                              className="w-full bg-[#FFFDF9] border border-[#E8DDD2] text-[#2B1D20] text-xs rounded-md px-2.5 py-1 focus:outline-hidden focus:border-[#8B1E3F] shadow-2xs"
                            >
                              <option value="true">true</option>
                              <option value="false">false</option>
                            </select>
                          ) : (
                            <input
                              type={
                                currentColumnDef?.type === 'integer' || currentColumnDef?.type === 'bigint' || currentColumnDef?.type === 'numeric'
                                  ? 'number'
                                  : 'text'
                              }
                              value={cond.value}
                              onChange={(e) => handleUpdateCondition(cond.id, { value: e.target.value })}
                              placeholder={`Filter value for ${cond.column}...`}
                              className="w-full bg-[#FFFDF9] border border-[#E8DDD2] text-[#2B1D20] text-xs rounded-md px-2.5 py-1 placeholder-[#9B888C] focus:outline-hidden focus:border-[#8B1E3F] shadow-2xs font-mono"
                            />
                          )}
                        </div>
                      )}

                      {/* Remove Condition Button */}
                      <button
                        onClick={() => handleRemoveCondition(cond.id)}
                        className="p-1 rounded text-[#9B888C] hover:text-[#8B1E3F] hover:bg-[#FDF0F3] transition-colors"
                        title="Remove condition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add New Filter Condition Action */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  id="btn-add-filter-condition"
                  onClick={() => handleAddCondition()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8DDD2] bg-[#FAF7F2] hover:bg-[#F4EFEA] text-xs font-semibold text-[#8B1E3F] transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Condition</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-dashed border-[#E8DDD2] bg-[#FAF7F2]/60 text-xs text-[#685559]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#9B888C]" />
                <span>No active column filters. Click any column chip above or add a custom rule.</span>
              </div>
              <button
                onClick={() => handleAddCondition()}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FFFDF9] border border-[#E8DDD2] text-xs font-semibold text-[#8B1E3F] hover:bg-[#FAF7F2] transition-colors shadow-2xs"
              >
                <Plus className="w-3 h-3" />
                <span>Add Filter</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
