import { TableDefinition, TableRowData, SqlQueryResult, ExplainPlanNode } from '../types';

export function executeSqlQuery(
  query: string,
  tables: TableDefinition[],
  tableData: Record<string, TableRowData[]>,
  onUpdateTableData?: (tableId: string, updater: (rows: TableRowData[]) => TableRowData[]) => void,
  onCreateTable?: (table: TableDefinition) => void
): SqlQueryResult {
  const startTime = performance.now();
  const trimmed = query.trim().replace(/;+$/, '');

  if (!trimmed) {
    return {
      columns: [],
      rows: [],
      rowCount: 0,
      executionTimeMs: 0,
      error: 'Empty query supplied',
    };
  }

  // Handle EXPLAIN query
  if (/^EXPLAIN\s+/i.test(trimmed)) {
    const innerQuery = trimmed.replace(/^EXPLAIN\s+(ANALYZE\s+)?/i, '');
    const isAnalyze = /ANALYZE/i.test(trimmed);
    const result = executeSqlQuery(innerQuery, tables, tableData);
    const executionTimeMs = Math.round(performance.now() - startTime + Math.random() * 5 + 4);

    const planNode: ExplainPlanNode = {
      nodeType: 'Limit',
      startupCost: 0.00,
      totalCost: 18.42,
      planRows: result.rowCount || 10,
      planWidth: 124,
      actualStartupTime: 0.012,
      actualTotalTime: 0.048,
      actualRows: result.rowCount,
      actualLoops: 1,
      plans: [
        {
          nodeType: result.rowCount > 50 ? 'Seq Scan' : 'Index Scan',
          relationName: 'posts',
          alias: 'p',
          indexName: 'posts_pkey',
          startupCost: 0.00,
          totalCost: 14.20,
          planRows: result.rowCount || 10,
          planWidth: 124,
          actualStartupTime: 0.008,
          actualTotalTime: 0.035,
          actualRows: result.rowCount,
          actualLoops: 1,
          filter: '(published = true)'
        }
      ]
    };

    return {
      columns: ['QUERY PLAN'],
      rows: [
        { 'QUERY PLAN': `Limit  (cost=0.00..18.42 rows=${result.rowCount} width=124)${isAnalyze ? ' (actual time=0.012..0.048 rows=' + result.rowCount + ' loops=1)' : ''}` },
        { 'QUERY PLAN': `  ->  Hash Join  (cost=1.20..14.20 rows=${result.rowCount} width=124)` },
        { 'QUERY PLAN': `        Hash Cond: (p.author_id = prof.id)` },
        { 'QUERY PLAN': `        ->  Seq Scan on posts p  (cost=0.00..12.00 rows=5 width=92)` },
        { 'QUERY PLAN': `              Filter: (published = true)` },
        { 'QUERY PLAN': `        ->  Hash  (cost=1.10..1.10 rows=6 width=64)` },
        { 'QUERY PLAN': `              ->  Seq Scan on profiles prof  (cost=0.00..1.10 rows=6 width=64)` },
        { 'QUERY PLAN': `Planning Time: 0.114 ms` },
        { 'QUERY PLAN': `Execution Time: ${(executionTimeMs / 10).toFixed(3)} ms` }
      ],
      rowCount: isAnalyze ? 9 : 7,
      executionTimeMs,
      explainPlan: planNode
    };
  }

  // Handle pg_policies special query
  if (/pg_policies/i.test(trimmed)) {
    const allPolicies = tables.flatMap(t => 
      t.policies.map(p => ({
        schemaname: t.schema,
        tablename: t.name,
        policyname: p.name,
        permissive: p.action,
        roles: p.roles.join(', '),
        cmd: p.command,
        qual: p.usingExpression,
        with_check: p.checkExpression || '—',
      }))
    );
    return {
      columns: ['schemaname', 'tablename', 'policyname', 'permissive', 'roles', 'cmd', 'qual', 'with_check'],
      rows: allPolicies,
      rowCount: allPolicies.length,
      executionTimeMs: Math.round(performance.now() - startTime + 8),
    };
  }

  // Handle pg_statio special query
  if (/pg_statio/i.test(trimmed)) {
    const stats = [
      { name: 'index hit rate', ratio: 99.82 },
      { name: 'table hit rate', ratio: 99.45 },
      { name: 'shared buffer usage', ratio: 78.20 },
      { name: 'wal checkpoint sync efficiency', ratio: 99.99 }
    ];
    return {
      columns: ['name', 'ratio'],
      rows: stats,
      rowCount: stats.length,
      executionTimeMs: Math.round(performance.now() - startTime + 6),
    };
  }

  // Handle SELECT query
  const selectMatch = trimmed.match(/^SELECT\s+([\s\S]+?)\s+FROM\s+([a-zA-Z0-9_.]+)([\s\S]*)$/i);
  if (selectMatch) {
    const rawCols = selectMatch[1].trim();
    const rawTable = selectMatch[2].trim().replace(/^public\./i, '');
    const rest = selectMatch[3] || '';

    // Find table
    const tableDef = tables.find(t => t.name.toLowerCase() === rawTable.toLowerCase());
    if (!tableDef) {
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: Math.round(performance.now() - startTime),
        error: `ERROR: 42P01: relation "${rawTable}" does not exist in schema "public"`,
      };
    }

    let rows = [...(tableData[tableDef.id] || [])];

    // Simple join support if referencing profiles from posts
    const joinMatch = rest.match(/LEFT\s+JOIN\s+([a-zA-Z0-9_.]+)\s+([a-zA-Z0-9_]+)?\s+ON\s+([\s\S]+?)(?:WHERE|GROUP|ORDER|LIMIT|$)/i);
    if (joinMatch) {
      const joinTableRaw = joinMatch[1].replace(/^public\./i, '');
      const joinTableDef = tables.find(t => t.name.toLowerCase() === joinTableRaw.toLowerCase());
      if (joinTableDef && joinTableRaw.toLowerCase() === 'profiles') {
        const joinData = tableData[joinTableDef.id] || [];
        rows = rows.map(r => {
          const author = joinData.find(u => u.id === r.author_id);
          return {
            ...r,
            author: author?.username || 'unknown',
            full_name: author?.full_name || 'Anonymous',
            total_comments: Math.floor(Math.random() * 8) + 1
          };
        });
      }
    }

    // WHERE filtering
    const whereMatch = rest.match(/WHERE\s+([\s\S]+?)(?:GROUP|ORDER|LIMIT|$)/i);
    if (whereMatch) {
      const whereClause = whereMatch[1].trim();
      if (/published\s*=\s*true/i.test(whereClause)) {
        rows = rows.filter(r => r.published === true || r.published === 'true');
      } else if (/published\s*=\s*false/i.test(whereClause)) {
        rows = rows.filter(r => r.published === false || r.published === 'false');
      } else if (/status\s*=\s*'completed'/i.test(whereClause)) {
        rows = rows.filter(r => r.status === 'completed');
      }
    }

    // ORDER BY
    const orderMatch = rest.match(/ORDER\s+BY\s+([a-zA-Z0-9_.]+)\s*(DESC|ASC)?/i);
    if (orderMatch) {
      const field = orderMatch[1].trim().replace(/^[a-zA-Z0-9_]+\./, '');
      const isDesc = (orderMatch[2] || 'ASC').toUpperCase() === 'DESC';
      rows.sort((a, b) => {
        const valA = a[field] ?? '';
        const valB = b[field] ?? '';
        if (typeof valA === 'number' && typeof valB === 'number') {
          return isDesc ? valB - valA : valA - valB;
        }
        return isDesc 
          ? String(valB).localeCompare(String(valA)) 
          : String(valA).localeCompare(String(valB));
      });
    }

    // LIMIT
    const limitMatch = rest.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1], 10);
      rows = rows.slice(0, limit);
    }

    // Columns determination
    let cols: string[] = [];
    if (rawCols === '*') {
      cols = tableDef.columns.map(c => c.name);
    } else {
      cols = rawCols.split(',').map(c => {
        const clean = c.trim();
        const asMatch = clean.match(/AS\s+([a-zA-Z0-9_]+)/i);
        if (asMatch) return asMatch[1];
        const dotMatch = clean.match(/\.([a-zA-Z0-9_]+)/);
        if (dotMatch) return dotMatch[1];
        return clean.replace(/[^a-zA-Z0-9_]/g, '');
      }).filter(Boolean);
    }

    const executionTimeMs = Math.round(performance.now() - startTime + Math.random() * 4 + 2);
    return {
      columns: cols.length > 0 ? cols : Object.keys(rows[0] || {}),
      rows,
      rowCount: rows.length,
      executionTimeMs,
    };
  }

  // Handle INSERT INTO
  const insertMatch = trimmed.match(/^INSERT\s+INTO\s+([a-zA-Z0-9_.]+)\s*\(([\s\S]+?)\)\s*VALUES\s*\(([\s\S]+?)\)/i);
  if (insertMatch) {
    const rawTable = insertMatch[1].trim().replace(/^public\./i, '');
    const tableDef = tables.find(t => t.name.toLowerCase() === rawTable.toLowerCase());
    if (!tableDef) {
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: Math.round(performance.now() - startTime),
        error: `ERROR: relation "${rawTable}" does not exist`,
      };
    }

    const cols = insertMatch[2].split(',').map(c => c.trim().replace(/['"]/g, ''));
    const vals = insertMatch[3].split(',').map(v => {
      const clean = v.trim();
      if (/^'([\s\S]*)'$/.test(clean)) return clean.slice(1, -1);
      if (/^\d+$/.test(clean)) return parseInt(clean, 10);
      if (/^\d+\.\d+$/.test(clean)) return parseFloat(clean);
      if (clean.toLowerCase() === 'true') return true;
      if (clean.toLowerCase() === 'false') return false;
      if (clean.toLowerCase() === 'now()') return new Date().toISOString();
      if (clean.toLowerCase() === 'gen_random_uuid()') return crypto.randomUUID();
      return clean;
    });

    const newRow: TableRowData = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    cols.forEach((col, idx) => {
      newRow[col] = vals[idx];
    });

    if (onUpdateTableData) {
      onUpdateTableData(tableDef.id, (prev) => [newRow, ...prev]);
    }

    const executionTimeMs = Math.round(performance.now() - startTime + 6);
    return {
      columns: ['status', 'inserted_id'],
      rows: [{ status: 'INSERT 0 1', inserted_id: newRow.id }],
      rowCount: 1,
      affectedRows: 1,
      executionTimeMs,
    };
  }

  // Handle CREATE TABLE
  if (/^CREATE\s+TABLE/i.test(trimmed)) {
    const createMatch = trimmed.match(/^CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_.]+)\s*\(([\s\S]+)\)/i);
    if (createMatch) {
      const tableName = createMatch[1].replace(/^public\./i, '');
      const newTable: TableDefinition = {
        id: `tbl-${tableName.toLowerCase()}-${Date.now()}`,
        schema: 'public',
        name: tableName,
        rlsEnabled: true,
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isNullable: false },
          { name: 'created_at', type: 'timestamptz', defaultValue: 'NOW()', isNullable: false }
        ],
        indexes: [
          { name: `${tableName}_pkey`, columns: ['id'], isUnique: true, type: 'btree' }
        ],
        policies: [
          {
            id: `pol-${Date.now()}`,
            name: 'Enable read access for all authenticated users',
            command: 'SELECT',
            roles: ['authenticated'],
            usingExpression: 'true',
            action: 'PERMISSIVE'
          }
        ],
        rowsCount: 0,
        sizeBytes: 8192
      };

      if (onCreateTable) {
        onCreateTable(newTable);
      }

      const executionTimeMs = Math.round(performance.now() - startTime + 12);
      return {
        columns: ['result'],
        rows: [{ result: `CREATE TABLE ${tableName} (Status: OK, RLS enabled by default)` }],
        rowCount: 1,
        executionTimeMs,
      };
    }
  }

  // Default fallback for generic SQL
  const executionTimeMs = Math.round(performance.now() - startTime + 9);
  return {
    columns: ['statement_executed', 'status'],
    rows: [{ statement_executed: trimmed.slice(0, 80) + (trimmed.length > 80 ? '...' : ''), status: 'SUCCESS (0.009s)' }],
    rowCount: 1,
    executionTimeMs,
  };
}
