import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Pencil, Trash2, X, Save, Loader2,
  Globe, ToggleLeft, ToggleRight, ChevronDown, FileText,
} from 'lucide-react';
import api from '../services/api';

// ── Constants ─────────────────────────────────────────────────
const PAGES = ['landing', 'dashboard', 'settings', 'reports', 'onboarding'];
const SECTIONS = ['hero', 'features', 'footer', 'cta', 'faq', 'nav', 'testimonials', 'pricing', 'general'];
const KNOWN_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'he', label: 'Hebrew' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'ar', label: 'Arabic' },
  { code: 'de', label: 'German' },
];

const EMPTY_FORM = { page: 'landing', key: '', section: 'hero', language: 'en', value: '', status: 'active' };

// ── Helpers ───────────────────────────────────────────────────
function SectionBadge({ section }) {
  const colors = {
    hero:         'bg-violet-100 text-violet-700',
    features:     'bg-blue-100 text-blue-700',
    footer:       'bg-gray-100 text-gray-600',
    cta:          'bg-orange-100 text-orange-700',
    faq:          'bg-yellow-100 text-yellow-700',
    nav:          'bg-indigo-100 text-indigo-700',
    testimonials: 'bg-pink-100 text-pink-700',
    pricing:      'bg-emerald-100 text-emerald-700',
    general:      'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors[section] ?? 'bg-gray-100 text-gray-600'}`}>
      {section}
    </span>
  );
}

function StatusBadge({ status }) {
  return status === 'active'
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Active</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Inactive</span>;
}

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all ${type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
      {msg}
      <button onClick={onClose}><X size={14} /></button>
    </div>
  );
}

// ── Key Modal ─────────────────────────────────────────────────
function KeyModal({ initial, activeLang, activePage, onSave, onClose, saving }) {
  const [form, setForm] = useState(
    initial ?? { ...EMPTY_FORM, language: activeLang, page: activePage }
  );
  const isEdit = !!initial;

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const langOptions = [
    ...KNOWN_LANGUAGES,
    ...([form.language].filter(c => !KNOWN_LANGUAGES.find(l => l.code === c)).map(c => ({ code: c, label: c.toUpperCase() }))),
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">{isEdit ? 'Edit Translation Key' : 'Add Translation Key'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Page */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Page</label>
              <div className="relative">
                <select
                  value={form.page}
                  onChange={e => set('page', e.target.value)}
                  disabled={isEdit}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50 disabled:text-gray-500 pr-8"
                >
                  {PAGES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Language</label>
              <div className="relative">
                <select
                  value={form.language}
                  onChange={e => set('language', e.target.value)}
                  disabled={isEdit}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50 disabled:text-gray-500 pr-8"
                >
                  {langOptions.map(l => <option key={l.code} value={l.code}>{l.label} ({l.code})</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Section */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Section</label>
              <div className="relative">
                <select
                  value={form.section}
                  onChange={e => set('section', e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 pr-8"
                >
                  {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <div className="relative">
                <select
                  value={form.status}
                  onChange={e => set('status', e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 pr-8"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Key */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Key</label>
            <input
              value={form.key}
              onChange={e => set('key', e.target.value)}
              disabled={isEdit}
              placeholder="e.g. hero.title"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {/* Value */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Value</label>
            <textarea
              value={form.value}
              onChange={e => set('value', e.target.value)}
              rows={4}
              placeholder="Translation text..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.key.trim() || !form.value.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isEdit ? 'Save Changes' : 'Add Key'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Confirm Dialog ─────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <p className="text-sm text-gray-700 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600">Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function LocalizationManagement() {
  const [keys, setKeys]             = useState([]);
  const [grouped, setGrouped]       = useState({});
  const [languages, setLanguages]   = useState(['en']);
  const [pages, setPages]           = useState(['landing']);
  const [activeLang, setActiveLang] = useState('en');
  const [activePage, setActivePage] = useState('landing');
  const [sectionFilter, setSectionFilter] = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [modal, setModal]           = useState(null);
  const [confirm, setConfirm]       = useState(null);
  const [toast, setToast]           = useState(null);
  const [newLang, setNewLang]       = useState('');
  const [addingLang, setAddingLang] = useState(false);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: activePage, language: activeLang };
      if (sectionFilter) params.section = sectionFilter;
      if (statusFilter)  params.status  = statusFilter;
      if (search)        params.search  = search;
      const res = await api.get('/api/admin/landing-keys', { params });
      setKeys(res.data.keys);
      setGrouped(res.data.grouped);
      setLanguages(Array.from(new Set(['en', ...(res.data.languages ?? [])])));
      setPages(Array.from(new Set(['landing', ...(res.data.pages ?? [])])));
    } catch (err) {
      showToast(err.response?.data?.error ?? 'Failed to load keys', 'error');
    } finally {
      setLoading(false);
    }
  }, [activePage, activeLang, sectionFilter, statusFilter, search]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/api/admin/landing-keys', form);
        showToast('Translation key created');
      } else {
        await api.put(`/api/admin/landing-keys/${modal._id}`, {
          value: form.value, status: form.status, section: form.section,
        });
        showToast('Translation key updated');
      }
      setModal(null);
      fetchKeys();
    } catch (err) {
      showToast(err.response?.data?.error ?? 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (row) => {
    const next = row.status === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/api/admin/landing-keys/${row._id}/status`, { status: next });
      showToast(`Key ${next === 'active' ? 'enabled' : 'disabled'}`);
      fetchKeys();
    } catch (err) {
      showToast(err.response?.data?.error ?? 'Update failed', 'error');
    }
  };

  const handleDelete = (row) => {
    setConfirm({
      message: `Delete key "${row.key}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await api.delete(`/api/admin/landing-keys/${row._id}`);
          showToast('Key deleted');
          fetchKeys();
        } catch (err) {
          showToast(err.response?.data?.error ?? 'Delete failed', 'error');
        }
      },
    });
  };

  const handleAddLanguage = () => {
    const code = newLang.trim().toLowerCase();
    if (!code || languages.includes(code)) { setAddingLang(false); setNewLang(''); return; }
    setLanguages(prev => [...prev, code]);
    setActiveLang(code);
    setAddingLang(false);
    setNewLang('');
  };

  const langLabel = (code) => KNOWN_LANGUAGES.find(l => l.code === code)?.label ?? code.toUpperCase();
  const displaySections = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Localization Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage multi-language content keys across app pages</p>
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Plus size={16} />
          Add Key
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Keys',  value: keys.length },
          { label: 'Sections',    value: displaySections.length },
          { label: 'Active',      value: keys.filter(k => k.status === 'active').length },
          { label: 'Inactive',    value: keys.filter(k => k.status === 'inactive').length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {/* Page tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-gray-100 overflow-x-auto">
          {pages.map(p => (
            <button
              key={p}
              onClick={() => setActivePage(p)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                activePage === p
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText size={12} />
              {p}
            </button>
          ))}
        </div>

        {/* Language tabs */}
        <div className="flex items-center gap-1 px-4 py-3 border-b border-gray-100 flex-wrap">
          {languages.map(lang => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeLang === lang ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Globe size={13} />
              {langLabel(lang)}
            </button>
          ))}

          {addingLang ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                value={newLang}
                onChange={e => setNewLang(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddLanguage();
                  if (e.key === 'Escape') { setAddingLang(false); setNewLang(''); }
                }}
                placeholder="e.g. fr"
                maxLength={5}
                className="border border-gray-200 rounded-lg px-2 py-1 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button onClick={handleAddLanguage} className="text-xs text-primary font-medium hover:underline">Add</button>
              <button onClick={() => { setAddingLang(false); setNewLang(''); }} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => setAddingLang(true)}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg"
            >
              <Plus size={12} /> language
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 px-4 py-3 border-b border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search keys or values..."
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="relative">
            <select
              value={sectionFilter}
              onChange={e => setSectionFilter(e.target.value)}
              className="appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm pr-7 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Sections</option>
              {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm pr-7 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown size={13} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 size={24} className="animate-spin mr-2" /> Loading...
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Globe size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No keys found for <strong>{langLabel(activeLang)}</strong> / <strong>{activePage}</strong></p>
            <button onClick={() => setModal('add')} className="mt-3 text-sm text-primary hover:underline">Add the first key</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {displaySections.map(section => (
              <div key={section}>
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                  <SectionBadge section={section} />
                  <span className="text-xs text-gray-400">{grouped[section]?.length ?? 0} keys</span>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {(grouped[section] ?? []).map(row => (
                      <tr key={row._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 w-48">
                          <span className="font-mono text-xs text-gray-700 break-all">{row.key}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-sm">
                          <span className="line-clamp-2">{row.value}</span>
                        </td>
                        <td className="px-4 py-3 w-24">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="px-4 py-3 w-28 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setModal(row)}
                              className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(row)}
                              className={`p-1.5 rounded-lg ${row.status === 'active' ? 'text-gray-400 hover:text-orange-500 hover:bg-orange-50' : 'text-gray-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
                              title={row.status === 'active' ? 'Disable' : 'Enable'}
                            >
                              {row.status === 'active' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                            </button>
                            <button
                              onClick={() => handleDelete(row)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal !== null && (
        <KeyModal
          initial={modal === 'add' ? null : modal}
          activeLang={activeLang}
          activePage={activePage}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}

      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
