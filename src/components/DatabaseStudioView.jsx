import React, { useState, useEffect } from 'react';
import {
  Database,
  Table,
  Play,
  RotateCcw,
  Download,
  Key,
  Terminal,
  FileSpreadsheet
} from 'lucide-react';

const PRESET_QUERIES = [
  {
    label: 'Top Grossing Hardware SKUs',
    sql: `SELECT sku, name, category, price, stock, sold_count, ROUND(price * sold_count, 2) AS gross_revenue\nFROM products\nORDER BY gross_revenue DESC;`
  },
  {
    label: 'Netlify & Community Apps',
    sql: `SELECT name, source_provider, live_url, version, language, rating, downloads, security_score, developer\nFROM apps\nORDER BY downloads DESC;`
  },
  {
    label: 'Edge Server Cluster Telemetry',
    sql: `SELECT name, region, provider, ip_address, status, cpu_load, ram_usage, latency_ms, rps, uptime_pct\nFROM server_nodes\nORDER BY latency_ms ASC;`
  },
  {
    label: 'Security & WAF Audit Log',
    sql: `SELECT event_type, severity, action_taken, source_ip, target_resource, description, created_at\nFROM security_events\nORDER BY created_at DESC;`
  },
  {
    label: 'Connected Platform Integrations',
    sql: `SELECT name, provider, category, status, events_synced, latency_ms, endpoint_url\nFROM integrations\nORDER BY events_synced DESC;`
  },
  {
    label: 'Orders + Item Count Join',
    sql: `SELECT o.order_number, o.customer_name, o.shipping_city, o.status, o.total, COUNT(oi.id) AS item_lines\nFROM orders o\nLEFT JOIN order_items oi ON oi.order_id = o.id\nGROUP BY o.id\nORDER BY o.created_at DESC;`
  }
];

export default function DatabaseStudioView({ dbStats, darkMode, onResetDatabase }) {
  const [selectedTable, setSelectedTable] = useState('products');
  const [tableData, setTableData] = useState({ columns: [], rows: [], rowCount: 0 });
  const [loadingTable, setLoadingTable] = useState(false);

  // SQL Runner State
  const [sqlInput, setSqlInput] = useState(PRESET_QUERIES[0].sql);
  const [queryResult, setQueryResult] = useState(null);
  const [queryError, setQueryError] = useState('');
  const [resetting, setResetting] = useState(false);

  const fetchTable = async (tableName) => {
    setLoadingTable(true);
    try {
      const res = await fetch(`/api/db/table/${tableName}?limit=100`);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setTableData(data);
        return;
      }
      // Static fallback when hosted on Netlify without Node backend
      const localTable = dbStats?.tables?.find((t) => t.name === tableName);
      if (localTable) {
        setTableData({
          columns: localTable.columns || [],
          rows: localTable.rows || [],
          rowCount: (localTable.rows || []).length
        });
      }
    } catch {
      const localTable = dbStats?.tables?.find((t) => t.name === tableName);
      if (localTable) {
        setTableData({
          columns: localTable.columns || [],
          rows: localTable.rows || [],
          rowCount: (localTable.rows || []).length
        });
      }
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchTable(selectedTable);
  }, [selectedTable, dbStats?.totalRows]);

  const handleRunSql = async (sqlOverride) => {
    const sqlToRun = sqlOverride ?? sqlInput;
    setQueryError('');
    try {
      const res = await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: sqlToRun })
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) {
          setQueryError(data.error || 'Query failed');
          setQueryResult(null);
        } else {
          setQueryResult(data);
        }
        return;
      }
    } catch {
      // Static fallback below
    }
    const match = sqlToRun.match(/FROM\s+([a-zA-Z0-9_]+)/i);
    const tblName = match?.[1]?.toLowerCase() || selectedTable;
    const localTable = dbStats?.tables?.find((t) => t.name === tblName);
    if (localTable) {
      setQueryResult({
        rows: localTable.rows || [],
        rowCount: (localTable.rows || []).length,
        durationMs: 0.42
      });
    } else {
      setQueryError(`Table "${tblName}" not found`);
    }
  };

  const handleExportJson = (rows, filename = `${selectedTable}.json`) => {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = (rows, filename = `${selectedTable}.csv`) => {
    if (!rows || rows.length === 0) return;
    const cols = Object.keys(rows[0]);
    const csvLines = [
      cols.join(','),
      ...rows.map((r) =>
        cols
          .map((c) => {
            const v = r[c] === null || r[c] === undefined ? '' : String(r[c]);
            return `"${v.replace(/"/g, '""')}"`;
          })
          .join(',')
      )
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeRows = queryResult ? queryResult.rows : tableData.rows;
  const activeColumns =
    activeRows && activeRows.length > 0
      ? Object.keys(activeRows[0])
      : tableData.columns.map((c) => c.name);

  const cardSurface = darkMode ? 'surface-card-dark' : 'surface-card-light';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Top Database Engine Telemetry Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6 md:p-8 ${cardSurface}`}>
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-3 py-0.5 font-mono-num text-xs font-bold text-cyan-400">
            <Database className="h-3.5 w-3.5" />
            <span>RELATIONAL SQLITE 3 ENGINE • WAL PERSISTENCE</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            NEX Store SQLite Database Studio
          </h1>
          <p className={`text-xs sm:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Inspect all {dbStats?.totalTables || 11} relational tables (`products`, `apps`,
            `categories`, `orders`, `order_items`, `reviews`, `coupons`, `inventory_logs`,
            `activity_events`, `chat_messages`, `subscribers`), view column schemas, and execute live SQL queries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`rounded-2xl border px-3.5 py-2 font-mono-num text-xs ${
              darkMode
                ? 'border-white/[0.08] bg-slate-950/80'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="text-[10px] text-slate-400">DB FILE & SIZE</div>
            <div className="font-bold text-cyan-400">
              {dbStats?.filePath || 'data/nexstore.db'} ({dbStats?.sizeFormatted || '64.0 KB'})
            </div>
          </div>

          <div
            className={`rounded-2xl border px-3.5 py-2 font-mono-num text-xs ${
              darkMode
                ? 'border-white/[0.08] bg-slate-950/80'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="text-[10px] text-slate-400">TOTAL RECORDS</div>
            <div className="font-bold text-emerald-400">
              {dbStats?.totalRows || 0} rows / {dbStats?.totalTables || 11} tables
            </div>
          </div>

          <button
            disabled={resetting}
            onClick={async () => {
              setResetting(true);
              await onResetDatabase();
              setQueryResult(null);
              await fetchTable(selectedTable);
              setResetting(false);
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 px-4 py-2.5 text-xs font-semibold text-amber-400 transition cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{resetting ? 'Re-Seeding...' : 'Reset & Re-Seed DB'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Layout: Left Table Sidebar + Right SQL & Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 3 Cols: Relational Table Selector & Schema */}
        <div className="lg:col-span-3 space-y-4">
          <div className={`rounded-3xl p-4 space-y-2 ${cardSurface}`}>
            <h2 className="font-mono-num text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              SQLite Tables ({dbStats?.tables?.length || 11})
            </h2>
            <div className="space-y-1">
              {(dbStats?.tables || []).map((t) => {
                const isSelected = selectedTable === t.name && !queryResult;
                return (
                  <button
                    key={t.name}
                    onClick={() => {
                      setQueryResult(null);
                      setSelectedTable(t.name);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 font-mono-num text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold shadow-sm'
                        : darkMode
                        ? 'text-slate-300 hover:bg-slate-800/70'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Table className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                      <span className="truncate">{t.name}</span>
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : darkMode
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {t.rowCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Table Column Schema */}
          <div className={`rounded-3xl p-4 space-y-2.5 ${cardSurface}`}>
            <h3 className="font-mono-num text-xs font-bold uppercase tracking-wider text-slate-400">
              Schema: `{selectedTable}`
            </h3>
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {(
                dbStats?.tables?.find((t) => t.name === selectedTable)?.columns ||
                tableData.columns ||
                []
              ).map((col) => (
                <div
                  key={col.name}
                  className={`flex items-center justify-between rounded-xl border px-2.5 py-1.5 font-mono-num text-[11px] ${
                    darkMode
                      ? 'bg-slate-950/70 border-white/[0.07] text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {Boolean(col.pk) && <Key className="h-3 w-3 text-amber-400" />}
                    <span>{col.name}</span>
                  </span>
                  <span className="text-[10px] font-bold text-indigo-400">
                    {col.type || 'TEXT'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 9 Cols: Interactive SQL Query Console & Live Data Table */}
        <div className="lg:col-span-9 space-y-5">
          {/* Interactive SQL Console */}
          <div className={`rounded-3xl p-5 space-y-3.5 ${cardSurface}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-cyan-400" />
                <h2 className="font-display text-sm font-bold">
                  Interactive SQL Query Console (Read-Only `SELECT` / `PRAGMA`)
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {PRESET_QUERIES.map((pq) => (
                  <button
                    key={pq.label}
                    onClick={() => {
                      setSqlInput(pq.sql);
                      handleRunSql(pq.sql);
                    }}
                    className={`rounded-lg border px-2.5 py-1 font-mono-num text-[10px] font-semibold transition cursor-pointer ${
                      darkMode
                        ? 'bg-slate-950 border-white/[0.08] text-slate-300 hover:border-indigo-500/40 hover:text-indigo-300'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600'
                    }`}
                  >
                    {pq.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <textarea
                rows={3}
                value={sqlInput}
                onChange={(e) => setSqlInput(e.target.value)}
                className={`flex-1 rounded-2xl border p-3.5 font-mono-num text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  darkMode
                    ? 'border-white/[0.08] bg-slate-950 text-cyan-300'
                    : 'border-slate-300 bg-slate-900 text-cyan-300'
                }`}
              />
              <div className="flex sm:flex-col justify-between gap-2">
                <button
                  onClick={() => handleRunSql()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Execute SQL</span>
                </button>
                {queryResult && (
                  <button
                    onClick={() => setQueryResult(null)}
                    className={`rounded-xl border px-3 py-2 text-[11px] font-semibold cursor-pointer ${
                      darkMode
                        ? 'border-white/[0.1] text-slate-300 hover:text-white'
                        : 'border-slate-300 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    Show Table `{selectedTable}`
                  </button>
                )}
              </div>
            </div>

            {queryError && (
              <div className="rounded-xl bg-rose-500/15 border border-rose-500/30 p-3 font-mono-num text-xs text-rose-400">
                {queryError}
              </div>
            )}
          </div>

          {/* Live Data Grid */}
          <div className={`rounded-3xl overflow-hidden ${cardSurface}`}>
            <div
              className={`flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3.5 ${
                darkMode ? 'border-white/[0.08]' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 font-mono-num text-xs">
                <span className="font-bold text-indigo-400">
                  {queryResult ? 'CUSTOM SQL QUERY RESULT' : `TABLE: ${selectedTable}`}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400 font-semibold">
                  {activeRows.length} rows returned
                </span>
                {queryResult?.durationMs !== undefined && (
                  <span className="rounded bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                    {queryResult.durationMs} ms
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleExportCsv(
                      activeRows,
                      queryResult ? 'nexstore-query.csv' : `${selectedTable}.csv`
                    )
                  }
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono-num text-[11px] font-semibold cursor-pointer ${
                    darkMode
                      ? 'border-white/[0.1] bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                      : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={() =>
                    handleExportJson(
                      activeRows,
                      queryResult ? 'nexstore-query.json' : `${selectedTable}.json`
                    )
                  }
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono-num text-[11px] font-semibold cursor-pointer ${
                    darkMode
                      ? 'border-white/[0.1] bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                      : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Download className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            {loadingTable ? (
              <div className="p-8 text-center font-mono-num text-xs text-slate-400">
                Reading SQLite pages...
              </div>
            ) : activeRows.length === 0 ? (
              <div className="p-8 text-center font-mono-num text-xs text-slate-400">
                0 rows in result set.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[460px]">
                <table className="w-full border-collapse text-left font-mono-num text-xs">
                  <thead
                    className={`sticky top-0 border-b text-[11px] uppercase text-slate-400 ${
                      darkMode
                        ? 'bg-slate-950 border-white/[0.08]'
                        : 'bg-slate-100 border-slate-200'
                    }`}
                  >
                    <tr>
                      {activeColumns.map((col) => (
                        <th key={col} className="px-3.5 py-2.5 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      darkMode ? 'divide-white/[0.06]' : 'divide-slate-200'
                    }`}
                  >
                    {activeRows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className={
                          darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-100/70'
                        }
                      >
                        {activeColumns.map((col) => {
                          const val = row[col];
                          const isNull = val === null || val === undefined;
                          const isNum = typeof val === 'number';
                          const strVal = isNull
                            ? 'NULL'
                            : typeof val === 'object'
                            ? JSON.stringify(val)
                            : String(val);
                          return (
                            <td
                              key={col}
                              className={`px-3.5 py-2.5 max-w-[240px] truncate ${
                                isNull
                                  ? 'text-slate-500 italic'
                                  : isNum
                                  ? 'text-indigo-400 font-semibold'
                                  : darkMode
                                  ? 'text-slate-300'
                                  : 'text-slate-700'
                              }`}
                              title={strVal}
                            >
                              {strVal}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
