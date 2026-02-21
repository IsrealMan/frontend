import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Search, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight,
  X, Save, Loader2, AlertTriangle, CheckCircle2, ShieldCheck,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatParam } from '../utils/parameterLabels';

// ── Constants ─────────────────────────────────────────────────
const PAGE_SIZE_OPTIONS = [10, 25, 50];

const SCOPE_OPTIONS  = ['SIGNAL', 'QC'];
const SEV_OPTIONS    = [
  { value: 3, label: 'High Impact',   color: 'bg-red-50 text-red-700 border-red-200'       },
  { value: 2, label: 'Medium Impact', color: 'bg-amber-50 text-amber-700 border-amber-200'  },
  { value: 1, label: 'Low Impact',    color: 'bg-blue-50 text-blue-700 border-blue-200'     },
];
const SEV_MAP = Object.fromEntries(SEV_OPTIONS.map(s => [s.value, s]));

const COLUMNS = [
  { key: 'name',          label: 'Rule Name',      sortable: true  },
  { key: 'code',          label: 'Code',           sortable: false },
  { key: 'scope',         label: 'Scope',          sortable: true  },
  { key: 'parameter_name',label: 'Parameter',      sortable: true  },
  { key: 'severity',      label: 'Severity',       sortable: true  },
  { key: 'is_enabled',    label: 'Status',         sortable: true  },
  { key: 'actions',       label: '',               sortable: false },
];

const EMPTY_FORM = {
  rule_def_id: '',
  name: '', code: '', description: '',
  scope: 'SIGNAL', parameter_name: '', severity: 3,
  is_enabled: true, config_json: '{}',
};

// ── Helpers ───────────────────────────────────────────────────
function SortIcon({ col, sortKey, sortDir }) {
  if (col !== sortKey) return <ChevronsUpDown size={12} className="text-gray-300 ml-1 shrink-0" />;
  return sortDir === 'asc'
    ? <ChevronUp   size={12} className="text-indigo-500 ml-1 shrink-0" />
    : <ChevronDown size={12} className="text-indigo-500 ml-1 shrink-0" />;
}

function SeverityBadge({ severity }) {
  const s = SEV_MAP[severity];
  if (!s) return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${s.color}`}>
      {s.label}
    </span>
  );
}

function StatusBadge({ enabled }) {
  return enabled
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Enabled</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500 border border-gray-200"><span className="w-1.5 h-1.5 rounded-full bg-gray-400" />Disabled</span>;
}

// ── Confirm dialog ────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <p className="text-sm font-medium text-gray-800">{message}</p>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-3 py-1.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Rule Form Modal ───────────────────────────────────────────
function RuleModal({ rule, definitions, onClose, onSaved }) {
  const isEdit      = !!rule;
  const [form, setForm]     = useState(() => {
    if (!rule) return { ...EMPTY_FORM };
    return {
      rule_def_id: rule.rule_def_id ?? '',
      name: rule.name ?? '',
      code: rule.code ?? '',
      description: rule.description ?? '',
      scope: rule.scope,
      parameter_name: rule.parameter_name,
      severity: rule.severity,
      is_enabled: rule.is_enabled,
      config_json: JSON.stringify(rule.config_json ?? {}, null, 2),
    };
  });
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);
  const [useExisting, setUseExisting] = useState(isEdit || definitions.length > 0);
  const firstRef = useRef(null);

  useEffect(() => { firstRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  function validate() {
    const e = {};
    if (!isEdit) {
      if (useExisting && !form.rule_def_id) e.rule_def_id = 'Select a rule definition';
      if (!useExisting) {
        if (!form.name.trim()) e.name = 'Name is required';
        if (!form.code.trim()) e.code = 'Code is required';
        else if (!/^[A-Z0-9_]+$/.test(form.code)) e.code = 'Must be UPPERCASE_SNAKE_CASE';
      }
    }
    if (!form.parameter_name.trim()) e.parameter_name = 'Parameter name is required';
    try { JSON.parse(form.config_json); }
    catch { e.config_json = 'Must be valid JSON'; }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      let payload;
      if (isEdit) {
        payload = {
          scope: form.scope,
          parameter_name: form.parameter_name.trim(),
          severity: Number(form.severity),
          is_enabled: form.is_enabled,
          config_json: JSON.parse(form.config_json),
        };
        const res = await api.put(`/api/rules/${rule.rule_instance_id}`, payload);
        onSaved(res.data.rule, 'updated');
      } else {
        payload = {
          scope: form.scope,
          parameter_name: form.parameter_name.trim(),
          severity: Number(form.severity),
          is_enabled: form.is_enabled,
          config_json: JSON.parse(form.config_json),
          ...(useExisting
            ? { rule_def_id: Number(form.rule_def_id) }
            : { name: form.name.trim(), code: form.code.trim().toUpperCase(), description: form.description.trim() }),
        };
        const res = await api.post('/api/rules', payload);
        onSaved(res.data.rule, 'created');
      }
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Save failed';
      setErrors({ _form: msg });
      setSaving(false);
    }
  }

  const inputCls = key =>
    `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors ${errors[key] ? 'border-red-300 bg-red-50' : 'border-gray-200'}`;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-900">{isEdit ? 'Edit Rule' : 'Create Rule'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto px-6 py-4 space-y-4">

            {errors._form && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                <AlertTriangle size={14} className="shrink-0" />{errors._form}
              </div>
            )}

            {/* Rule Definition */}
            {!isEdit && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Rule Definition</label>
                {definitions.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    <button type="button" onClick={() => setUseExisting(true)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${useExisting ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                      Use existing
                    </button>
                    <button type="button" onClick={() => setUseExisting(false)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${!useExisting ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                      Create new
                    </button>
                  </div>
                )}

                {useExisting ? (
                  <div>
                    <select ref={firstRef} value={form.rule_def_id} onChange={e => set('rule_def_id', e.target.value)} className={inputCls('rule_def_id')}>
                      <option value="">— Select rule definition —</option>
                      {definitions.map(d => <option key={d.rule_def_id} value={d.rule_def_id}>{d.name} ({d.code})</option>)}
                    </select>
                    {errors.rule_def_id && <p className="text-xs text-red-500 mt-1">{errors.rule_def_id}</p>}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Name *</label>
                      <input ref={firstRef} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Temperature Control Frequency" className={inputCls('name')} />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Code * <span className="text-gray-300">(UPPERCASE_SNAKE_CASE)</span></label>
                      <input value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="TEMP_CONTROL_FREQ" className={inputCls('code')} />
                      {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Description</label>
                      <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className={`${inputCls('description')} resize-none`} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Read-only definition when editing */}
            {isEdit && (
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 mb-0.5">Rule Definition (read-only)</p>
                <p className="text-sm font-medium text-gray-800">{rule.name}</p>
                <p className="text-xs text-gray-400 font-mono">{rule.code}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Scope */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Scope *</label>
                <select value={form.scope} onChange={e => set('scope', e.target.value)} className={inputCls('scope')}>
                  {SCOPE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* Severity */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Severity *</label>
                <select value={form.severity} onChange={e => set('severity', Number(e.target.value))} className={inputCls('severity')}>
                  {SEV_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            {/* Parameter Name */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Parameter Name *</label>
              <input
                ref={isEdit ? firstRef : null}
                value={form.parameter_name}
                onChange={e => set('parameter_name', e.target.value)}
                placeholder="temperature"
                className={inputCls('parameter_name')}
              />
              {errors.parameter_name && <p className="text-xs text-red-500 mt-1">{errors.parameter_name}</p>}
            </div>

            {/* Config JSON */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Config JSON <span className="text-gray-300 font-normal">(optional)</span></label>
              <textarea
                value={form.config_json}
                onChange={e => set('config_json', e.target.value)}
                rows={3}
                spellCheck={false}
                className={`${inputCls('config_json')} font-mono text-xs resize-none`}
              />
              {errors.config_json && <p className="text-xs text-red-500 mt-1">{errors.config_json}</p>}
            </div>

            {/* Enabled toggle */}
            <div className="flex items-center justify-between py-2 border-t border-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-700">Enable rule</p>
                <p className="text-xs text-gray-400">Active rules are evaluated against incoming signals.</p>
              </div>
              <button
                type="button"
                onClick={() => set('is_enabled', !form.is_enabled)}
                className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0`}
                style={{ width: 40, height: 22, backgroundColor: form.is_enabled ? '#4f46e5' : '#e5e7eb' }}
              >
                <span
                  className="absolute top-0.5 left-0.5 bg-white rounded-full shadow transition-transform"
                  style={{ width: 18, height: 18, transform: form.is_enabled ? 'translateX(18px)' : 'translateX(0)' }}
                />
              </button>
            </div>

          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isEdit ? 'Save Changes' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Summary stats ─────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold tabular-nums ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
function Rules() {
  const { user } = useAuth();
  const isAdmin  = user?.role === 'admin';

  const [rules,       setRules]       = useState([]);
  const [total,       setTotal]       = useState(0);
  const [definitions, setDefinitions] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  // Filters / sort / pagination
  const [search,   setSearch]   = useState('');
  const [scope,    setScope]    = useState('');
  const [severity, setSeverity] = useState('');
  const [enabled,  setEnabled]  = useState('');
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortKey,  setSortKey]  = useState('severity');
  const [sortDir,  setSortDir]  = useState('desc');

  // Modal / confirm
  const [modalRule, setModalRule]   = useState(undefined); // undefined=closed, null=create, obj=edit
  const [confirm,   setConfirm]     = useState(null);      // { id, name }
  const [toast,     setToast]       = useState(null);
  const [toggling,  setToggling]    = useState(null);
  const [deleting,  setDeleting]    = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit: pageSize, sort: sortKey, dir: sortDir });
      if (search)   params.set('search',   search);
      if (scope)    params.set('scope',    scope);
      if (severity) params.set('severity', severity);
      if (enabled)  params.set('enabled',  enabled);
      const res = await api.get(`/api/rules?${params}`);
      setRules(res.data.rules ?? []);
      setTotal(res.data.total ?? 0);
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to load rules');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortKey, sortDir, search, scope, severity, enabled]);

  const fetchDefinitions = useCallback(async () => {
    try {
      const res = await api.get('/api/rules/definitions');
      setDefinitions(res.data.definitions ?? []);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => { fetchRules(); }, [fetchRules]);
  useEffect(() => { fetchDefinitions(); }, [fetchDefinitions]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, scope, severity, enabled, pageSize]);

  const handleSort = key => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const handleToggle = useCallback(async (rule) => {
    setToggling(rule.rule_instance_id);
    try {
      const res = await api.patch(`/api/rules/${rule.rule_instance_id}/toggle`);
      setRules(prev => prev.map(r => r.rule_instance_id === rule.rule_instance_id
        ? { ...r, is_enabled: res.data.is_enabled } : r));
      showToast(`Rule ${res.data.is_enabled ? 'enabled' : 'disabled'}`);
    } catch {
      showToast('Toggle failed', 'error');
    } finally {
      setToggling(null);
    }
  }, [showToast]);

  const handleDeleteConfirm = useCallback(async () => {
    const { id } = confirm;
    setConfirm(null);
    setDeleting(id);
    try {
      await api.delete(`/api/rules/${id}`);
      setRules(prev => prev.filter(r => r.rule_instance_id !== id));
      setTotal(t => t - 1);
      showToast('Rule deleted');
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeleting(null);
    }
  }, [confirm, showToast]);

  const handleSaved = useCallback((savedRule, action) => {
    if (action === 'created') {
      setRules(prev => [savedRule, ...prev]);
      setTotal(t => t + 1);
    } else {
      setRules(prev => prev.map(r => r.rule_instance_id === savedRule.rule_instance_id ? savedRule : r));
    }
    setModalRule(undefined);
    showToast(`Rule ${action} successfully`);
  }, [showToast]);

  // Summary stats
  const stats = useMemo(() => {
    const enabled  = rules.filter(r => r.is_enabled).length;
    const disabled = rules.filter(r => !r.is_enabled).length;
    const high     = rules.filter(r => r.severity === 3).length;
    return { total: rules.length, enabled, disabled, high };
  }, [rules]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasFilters = search || scope || severity || enabled;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Rules Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Configure SPC detection rules bound to rule_instance &amp; rule_definition tables</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { fetchDefinitions(); setModalRule(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
          >
            <Plus size={15} /> Create Rule
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Rules"    value={total}        color="text-gray-900" />
        <StatCard label="Enabled"        value={stats.enabled}  color="text-emerald-600" sub="Active evaluation" />
        <StatCard label="Disabled"       value={stats.disabled} color="text-gray-400"    sub="Paused" />
        <StatCard label="High Severity"  value={stats.high}     color="text-red-500"     sub="Severity 3" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or parameter…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
          />
        </div>

        <select value={scope} onChange={e => setScope(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors">
          <option value="">All Scopes</option>
          {SCOPE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={severity} onChange={e => setSeverity(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors">
          <option value="">All Severities</option>
          {SEV_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <select value={enabled} onChange={e => setEnabled(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors">
          <option value="">All Status</option>
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>

        {hasFilters && (
          <button onClick={() => { setSearch(''); setScope(''); setSeverity(''); setEnabled(''); }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl transition-colors">
            <X size={13} />Clear
          </button>
        )}

        <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}
          className="ml-auto px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none">
          {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n} / page</option>)}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl mb-4">
          <AlertTriangle size={15} />{error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {COLUMNS.map(col => (
                  <th key={col.key}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap select-none ${col.sortable ? 'cursor-pointer hover:text-gray-800' : ''}`}>
                    <span className="flex items-center">
                      {col.label}
                      {col.sortable && <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 animate-pulse">
                    {COLUMNS.map(c => (
                      <td key={c.key} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded" style={{ width: c.key === 'actions' ? 64 : '80%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rules.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-4 py-16 text-center">
                    <ShieldCheck size={36} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-400">No rules found</p>
                    {hasFilters && <p className="text-xs text-gray-300 mt-1">Try clearing your filters</p>}
                  </td>
                </tr>
              ) : (
                rules.map(rule => (
                  <tr key={rule.rule_instance_id} className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${!rule.is_enabled ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{rule.name}</p>
                      {rule.description && <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{rule.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{rule.code}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${rule.scope === 'SIGNAL' ? 'bg-violet-50 text-violet-700' : 'bg-cyan-50 text-cyan-700'}`}>
                        {rule.scope}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{formatParam(rule.parameter_name)}</td>
                    <td className="px-4 py-3"><SeverityBadge severity={rule.severity} /></td>
                    <td className="px-4 py-3"><StatusBadge enabled={rule.is_enabled} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleToggle(rule)}
                              disabled={toggling === rule.rule_instance_id}
                              title={rule.is_enabled ? 'Disable' : 'Enable'}
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700 disabled:opacity-40"
                            >
                              {toggling === rule.rule_instance_id
                                ? <Loader2 size={15} className="animate-spin" />
                                : rule.is_enabled ? <ToggleRight size={15} className="text-emerald-500" /> : <ToggleLeft size={15} />}
                            </button>
                            <button
                              onClick={() => { fetchDefinitions(); setModalRule(rule); }}
                              title="Edit"
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-indigo-600"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setConfirm({ id: rule.rule_instance_id, name: rule.name })}
                              disabled={deleting === rule.rule_instance_id}
                              title="Delete"
                              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-300 hover:text-red-500 disabled:opacity-40"
                            >
                              {deleting === rule.rule_instance_id
                                ? <Loader2 size={14} className="animate-spin" />
                                : <Trash2 size={14} />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} rules
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 disabled:opacity-30">
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    className={`w-7 h-7 text-xs rounded-lg transition-colors ${pg === page ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
                    {pg}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 disabled:opacity-30">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalRule !== undefined && (
        <RuleModal
          rule={modalRule}
          definitions={definitions}
          onClose={() => setModalRule(undefined)}
          onSaved={handleSaved}
        />
      )}

      {confirm && (
        <ConfirmDialog
          message={`Delete rule instance for "${confirm.name}"? This cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-50 transition-all ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-900 text-white'}`}>
          {toast.type === 'error' ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

export default Rules;
