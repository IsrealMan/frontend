import { useState, useMemo } from 'react';
import { useApi } from '../hooks/useApi';
import {
  Search, ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight, SlidersHorizontal, X
} from 'lucide-react';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const STATUS_CONFIG = {
  'In Control':    { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',  ring: 'ring-emerald-200' },
  'Warning':       { dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 border-amber-200',       ring: 'ring-amber-200'   },
  'Out of Control':{ dot: 'bg-red-500',     badge: 'bg-red-50 text-red-700 border-red-200',             ring: 'ring-red-200'     },
};

const COLUMNS = [
  { key: 'name',        label: 'Parameter Name',       sortable: true  },
  { key: 'category',    label: 'Category',             sortable: true  },
  { key: 'unit',        label: 'Unit',                 sortable: false },
  { key: 'specLimits',  label: 'Spec Limits (LSL–USL)',sortable: false },
  { key: 'ctrlLimits',  label: 'Control Limits (LCL–UCL)', sortable: false },
  { key: 'target',      label: 'Target',               sortable: true  },
  { key: 'status',      label: 'Status',               sortable: true  },
  { key: 'lastUpdated', label: 'Last Updated',         sortable: true  },
];

function fmt(v) {
  if (v === null || v === undefined) return '—';
  return Number(v) % 1 === 0 ? String(v) : Number(v).toFixed(3).replace(/\.?0+$/, '');
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function SortIcon({ col, sortKey, sortDir }) {
  if (col !== sortKey) return <ChevronsUpDown size={13} className="text-gray-300 ml-1" />;
  return sortDir === 'asc'
    ? <ChevronUp size={13} className="text-primary ml-1" />
    : <ChevronDown size={13} className="text-primary ml-1" />;
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      {COLUMNS.map((c) => (
        <td key={c.key} className="px-4 py-3.5">
          <div className="h-3.5 bg-gray-100 rounded animate-pulse" style={{ width: c.key === 'name' ? '70%' : '50%' }} />
        </td>
      ))}
    </tr>
  );
}

export default function QualityControl() {
  const { data: raw, loading, error } = useApi('/api/quality-parameters');

  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('All');
  const [statFilter, setStatFilter] = useState('All');
  const [sortKey,    setSortKey]    = useState('name');
  const [sortDir,    setSortDir]    = useState('asc');
  const [page,       setPage]       = useState(1);
  const [pageSize,   setPageSize]   = useState(10);

  const params = raw || [];

  const categories = useMemo(() => ['All', ...Array.from(new Set(params.map(p => p.category))).sort()], [params]);
  const statuses   = useMemo(() => ['All', 'In Control', 'Warning', 'Out of Control'], []);

  const filtered = useMemo(() => {
    let rows = params;
    if (search)               rows = rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    if (catFilter  !== 'All') rows = rows.filter(r => r.category === catFilter);
    if (statFilter !== 'All') rows = rows.filter(r => r.status   === statFilter);
    return rows;
  }, [params, search, catFilter, statFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (sortKey === 'lastUpdated') { av = new Date(av); bv = new Date(bv); }
      if (av == null) return 1;
      if (bv == null) return -1;
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows   = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key) => {
    if (!COLUMNS.find(c => c.key === key)?.sortable) return;
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const resetFilters = () => {
    setSearch(''); setCatFilter('All'); setStatFilter('All'); setPage(1);
  };

  const hasFilters = search || catFilter !== 'All' || statFilter !== 'All';

  // Counts for status summary
  const counts = useMemo(() => ({
    total:      params.length,
    inControl:  params.filter(p => p.status === 'In Control').length,
    warning:    params.filter(p => p.status === 'Warning').length,
    outOfCtrl:  params.filter(p => p.status === 'Out of Control').length,
  }), [params]);

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quality Parameters</h1>
          <p className="text-sm text-gray-500 mt-0.5">Specification and control limits across all measured parameters</p>
        </div>
      </div>

      {/* ── Status Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Parameters', value: counts.total,     color: 'border-t-gray-300',    text: 'text-gray-800'    },
          { label: 'In Control',        value: counts.inControl, color: 'border-t-emerald-500', text: 'text-emerald-700' },
          { label: 'Warning',           value: counts.warning,   color: 'border-t-amber-400',   text: 'text-amber-700'   },
          { label: 'Out of Control',    value: counts.outOfCtrl, color: 'border-t-red-500',     text: 'text-red-700'     },
        ].map(card => (
          <div key={card.label} className={`bg-white rounded-xl border border-gray-100 border-t-2 ${card.color} p-4 shadow-sm`}>
            {loading
              ? <div className="h-7 w-12 bg-gray-100 rounded animate-pulse mb-1" />
              : <div className={`text-2xl font-bold ${card.text}`}>{card.value}</div>
            }
            <div className="text-xs text-gray-500 font-medium">{card.label}</div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search parameters…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal size={14} className="text-gray-400" />
          <select
            value={catFilter}
            onChange={e => { setCatFilter(e.target.value); setPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-2.5 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Status filter */}
        <select
          value={statFilter}
          onChange={e => { setStatFilter(e.target.value); setPage(1); }}
          className="text-sm border border-gray-200 rounded-lg px-2.5 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>

        {hasFilters && (
          <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={13} /> Clear
          </button>
        )}

        {/* Page size */}
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none text-sm"
          >
            {PAGE_SIZE_OPTIONS.map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                {COLUMNS.map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap select-none
                      ${col.sortable ? 'cursor-pointer hover:text-gray-800 hover:bg-gray-100 transition-colors' : ''}`}
                  >
                    <div className="flex items-center">
                      {col.label}
                      {col.sortable && <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: pageSize > 10 ? 10 : pageSize }).map((_, i) => <SkeletonRow key={i} />)
                : error
                ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="text-center py-16 text-red-500 text-sm">
                      Failed to load quality parameters.
                    </td>
                  </tr>
                )
                : pageRows.length === 0
                ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Search size={28} className="text-gray-200" />
                        <span className="text-sm font-medium">No parameters match your filters</span>
                        {hasFilters && (
                          <button onClick={resetFilters} className="text-xs text-primary hover:underline mt-1">Clear filters</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
                : pageRows.map((row) => {
                  const s = STATUS_CONFIG[row.status] ?? STATUS_CONFIG['In Control'];
                  return (
                    <tr key={row.id} className="hover:bg-gray-50/60 transition-colors group">
                      {/* Name */}
                      <td className="px-4 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                        {row.name}
                      </td>
                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs rounded-md font-medium">
                          {row.category}
                        </span>
                      </td>
                      {/* Unit */}
                      <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">
                        {row.unit || '—'}
                      </td>
                      {/* Spec Limits */}
                      <td className="px-4 py-3.5 font-mono text-xs text-gray-600 whitespace-nowrap">
                        <span className="text-gray-400">LSL</span>{' '}
                        <span className="text-gray-800 font-semibold">{fmt(row.lsl)}</span>
                        <span className="text-gray-300 mx-1.5">|</span>
                        <span className="text-gray-400">USL</span>{' '}
                        <span className="text-gray-800 font-semibold">{fmt(row.usl)}</span>
                      </td>
                      {/* Control Limits */}
                      <td className="px-4 py-3.5 font-mono text-xs text-gray-600 whitespace-nowrap">
                        <span className="text-gray-400">LCL</span>{' '}
                        <span className="text-gray-800 font-semibold">{fmt(row.lcl)}</span>
                        <span className="text-gray-300 mx-1.5">|</span>
                        <span className="text-gray-400">UCL</span>{' '}
                        <span className="text-gray-800 font-semibold">{fmt(row.ucl)}</span>
                      </td>
                      {/* Target */}
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold text-gray-800">
                        {fmt(row.target)}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {row.status}
                        </span>
                      </td>
                      {/* Last Updated */}
                      <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                        {fmtDate(row.lastUpdated)}
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {!loading && !error && sorted.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3 flex flex-wrap items-center justify-between gap-3 bg-gray-50/40">
            <p className="text-xs text-gray-500">
              Showing{' '}
              <span className="font-semibold text-gray-700">
                {Math.min((page - 1) * pageSize + 1, sorted.length)}–{Math.min(page * pageSize, sorted.length)}
              </span>{' '}
              of <span className="font-semibold text-gray-700">{sorted.length}</span> parameters
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce((acc, n, idx, arr) => {
                  if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…');
                  acc.push(n);
                  return acc;
                }, [])
                .map((n, i) =>
                  n === '…'
                    ? <span key={`e${i}`} className="px-2 text-gray-400 text-xs">…</span>
                    : (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors
                          ${page === n
                            ? 'bg-primary text-white shadow-sm shadow-primary/20'
                            : 'border border-gray-200 text-gray-600 hover:bg-white'}`}
                      >
                        {n}
                      </button>
                    )
                )
              }
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
