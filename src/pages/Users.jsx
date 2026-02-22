import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Search, Plus, Pencil, UserX, UserCheck, KeyRound,
  ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight,
  X, Save, Loader2, Users as UsersIcon, ShieldCheck, Wrench, UserCog,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// ── Constants ─────────────────────────────────────────────────
const ROLES = ['user', 'admin', 'operator'];
const ROLE_STYLE = {
  admin:    { label: 'Admin',    bg: 'bg-violet-100', text: 'text-violet-700' },
  operator: { label: 'Operator', bg: 'bg-blue-100',   text: 'text-blue-700'   },
  user:     { label: 'User',     bg: 'bg-gray-100',   text: 'text-gray-600'   },
};
const PAGE_SIZES = [10, 20, 50];

const EMPTY_FORM = {
  name: '', email: '', password: '', role: 'user', department: '',
};

// ── Sub-components ────────────────────────────────────────────
function RoleBadge({ role }) {
  const s = ROLE_STYLE[role] ?? ROLE_STYLE.user;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function StatusBadge({ active }) {
  return active
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Active</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Inactive</span>;
}

function Avatar({ name }) {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  const colors = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500'];
  const color  = colors[(name?.charCodeAt(0) ?? 0) % colors.length];
  return (
    <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center shrink-0`}>
      <span className="text-white text-xs font-semibold">{initials}</span>
    </div>
  );
}

function SortIcon({ field, sort, order }) {
  if (sort !== field) return <ChevronsUpDown size={13} className="text-gray-300" />;
  return order === 'asc'
    ? <ChevronUp size={13} className="text-primary" />
    : <ChevronDown size={13} className="text-primary" />;
}

// ── Toast ──────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white min-w-[220px] ${t.type === 'error' ? 'bg-red-500' : 'bg-gray-800'}`}>
          <span className="flex-1">{t.msg}</span>
          <button onClick={() => remove(t.id)}><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  const remove = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, add, remove };
}

// ── Confirm Dialog ────────────────────────────────────────────
function ConfirmDialog({ open, title, message, confirmLabel, confirmClass, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className={`px-4 py-2 text-sm font-medium rounded-lg text-white ${confirmClass}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ── Password Reset Result Modal ───────────────────────────────
function PasswordModal({ open, tempPassword, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!open) return null;
  const copy = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Temporary Password</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Share this with the user securely. It will not be shown again.</p>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5">
          <span className="flex-1 font-mono text-sm tracking-wider text-gray-800">{tempPassword}</span>
          <button onClick={copy} className="text-xs font-medium text-primary hover:underline shrink-0">
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <button onClick={onClose} className="w-full py-2.5 text-sm font-medium rounded-xl bg-gray-900 text-white hover:bg-gray-700">Done</button>
      </div>
    </div>
  );
}

// ── User Modal (create / edit) ────────────────────────────────
function UserModal({ open, user, onClose, onSave }) {
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);
  const isEdit = !!user;
  const firstRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(user
      ? { name: user.name, email: user.email, password: '', role: user.role, department: user.settings?.department ?? '' }
      : EMPTY_FORM
    );
    setTimeout(() => firstRef.current?.focus(), 50);
  }, [open, user]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    if (!isEdit && form.password.length < 8) e.password = 'At least 8 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const body = { name: form.name.trim(), email: form.email.trim(), role: form.role, department: form.department.trim() };
      if (!isEdit) body.password = form.password;
      await onSave(body);
      onClose();
    } catch (err) {
      setErrors({ _global: err.response?.data?.error ?? 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const inputCls = (k) =>
    `w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-primary/30 transition ${errors[k] ? 'border-red-400' : 'border-gray-200 focus:border-primary'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-900">{isEdit ? 'Edit User' : 'New User'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {errors._global && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{errors._global}</div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
            <input ref={firstRef} value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="Jane Smith" className={inputCls('name')} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="jane@company.com" className={inputCls('email')} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Password (create only) */}
          {!isEdit && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Password *</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="Min 8 characters" className={inputCls('password')} />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
          )}

          {/* Role */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
            <select value={form.role} onChange={e => set('role', e.target.value)} className={inputCls('role')}>
              {ROLES.map(r => <option key={r} value={r}>{ROLE_STYLE[r].label}</option>)}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
            <input value={form.department} onChange={e => set('department', e.target.value)}
              placeholder="e.g. Engineering" className={inputCls('department')} />
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-60">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {isEdit ? 'Save changes' : 'Create user'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function Users() {
  const { user: me } = useAuth();
  const isAdmin = me?.role === 'admin';
  const { toasts, add: addToast, remove: removeToast } = useToast();

  // List state
  const [users,      setUsers]      = useState([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  // Filters / pagination / sort
  const [search,  setSearch]  = useState('');
  const [role,    setRole]    = useState('');
  const [status,  setStatus]  = useState('');
  const [page,    setPage]    = useState(1);
  const [limit,   setLimit]   = useState(20);
  const [sort,    setSort]    = useState('createdAt');
  const [order,   setOrder]   = useState('desc');

  // Modals
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editUser,   setEditUser]   = useState(null);
  const [confirm,    setConfirm]    = useState(null);   // { user, action: 'status'|'resetpw' }
  const [tempPass,   setTempPass]   = useState(null);

  // Derived stats
  const stats = useMemo(() => {
    const admins    = users.filter(u => u.role === 'admin').length;
    const operators = users.filter(u => u.role === 'operator').length;
    const inactive  = users.filter(u => !u.active).length;
    return [
      { label: 'Total Users',   value: total,     icon: UsersIcon,  color: 'bg-blue-50 text-blue-600'    },
      { label: 'Admins',        value: admins,    icon: ShieldCheck, color: 'bg-violet-50 text-violet-600' },
      { label: 'Operators',     value: operators, icon: Wrench,      color: 'bg-amber-50 text-amber-600'   },
      { label: 'Inactive',      value: inactive,  icon: UserX,       color: 'bg-red-50 text-red-500'       },
    ];
  }, [users, total]);

  // ── Fetch ──────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit, sort, order });
      if (search) params.set('search', search);
      if (role)   params.set('role',   role);
      if (status) params.set('status', status);
      const { data } = await api.get(`/api/admin/users?${params}`);
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, limit, sort, order, search, role, status]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, role, status, limit]);

  // ── Sort toggle ────────────────────────────────────────────
  const toggleSort = (field) => {
    if (sort === field) setOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSort(field); setOrder('asc'); }
  };

  // ── Actions ────────────────────────────────────────────────
  const openCreate = () => { setEditUser(null); setModalOpen(true); };
  const openEdit   = (u) => { setEditUser(u);   setModalOpen(true); };

  const handleSave = async (body) => {
    if (editUser) {
      const { data } = await api.put(`/api/admin/users/${editUser._id}`, body);
      setUsers(p => p.map(u => u._id === data._id ? data : u));
      addToast('User updated');
    } else {
      const { data } = await api.post('/api/admin/users', body);
      setUsers(p => [data, ...p]);
      setTotal(t => t + 1);
      addToast('User created');
    }
  };

  const handleStatusToggle = async (u) => {
    try {
      const { data } = await api.patch(`/api/admin/users/${u._id}/status`, { active: !u.active });
      setUsers(p => p.map(x => x._id === data._id ? data : x));
      addToast(data.active ? 'User activated' : 'User deactivated');
    } catch (err) {
      addToast(err.response?.data?.error ?? 'Failed to update status', 'error');
    }
  };

  const handleResetPassword = async (u) => {
    try {
      const { data } = await api.post(`/api/admin/users/${u._id}/reset-password`);
      setTempPass(data.tempPassword);
    } catch (err) {
      addToast(err.response?.data?.error ?? 'Reset failed', 'error');
    }
  };

  // ── Table header cell ──────────────────────────────────────
  const Th = ({ field, children }) => (
    <th
      onClick={field ? () => toggleSort(field) : undefined}
      className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide select-none ${field ? 'cursor-pointer hover:text-gray-700' : ''}`}
    >
      <div className="flex items-center gap-1">
        {children}
        {field && <SortIcon field={field} sort={sort} order={order} />}
      </div>
    </th>
  );

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage team members and permissions</p>
        </div>
        {isAdmin && (
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm">
            <Plus size={16} />New User
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name or email…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Role filter */}
          <select value={role} onChange={e => setRole(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-600">
            <option value="">All roles</option>
            {ROLES.map(r => <option key={r} value={r}>{ROLE_STYLE[r].label}</option>)}
          </select>

          {/* Status filter */}
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-600">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Clear */}
          {(search || role || status) && (
            <button onClick={() => { setSearch(''); setRole(''); setStatus(''); }}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              <X size={12} />Clear
            </button>
          )}

          {/* Page size */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400">Show</span>
            <select value={limit} onChange={e => setLimit(Number(e.target.value))}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-primary">
              {PAGE_SIZES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center py-20 text-sm text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <Th field="name">User</Th>
                  <Th field="role">Role</Th>
                  <Th>Department</Th>
                  <Th>Status</Th>
                  <Th field="createdAt">Joined</Th>
                  {isAdmin && <Th>Actions</Th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-100" /><div className="space-y-1.5"><div className="h-3 bg-gray-100 rounded w-28" /><div className="h-2.5 bg-gray-50 rounded w-40" /></div></div></td>
                      <td className="px-4 py-3"><div className="h-5 bg-gray-100 rounded-full w-16" /></td>
                      <td className="px-4 py-3"><div className="h-3 bg-gray-100 rounded w-24" /></td>
                      <td className="px-4 py-3"><div className="h-5 bg-gray-100 rounded-full w-16" /></td>
                      <td className="px-4 py-3"><div className="h-3 bg-gray-100 rounded w-20" /></td>
                      {isAdmin && <td className="px-4 py-3"><div className="h-7 bg-gray-100 rounded w-24" /></td>}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="py-20 text-center">
                      <UserCog size={32} className="text-gray-200 mx-auto mb-3" />
                      <p className="text-sm text-gray-400 font-medium">No users found</p>
                      <p className="text-xs text-gray-300 mt-1">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                            <p className="text-xs text-gray-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3"><RoleBadge role={u.role} /></td>

                      {/* Department */}
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {u.settings?.department || <span className="text-gray-300">—</span>}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3"><StatusBadge active={u.active} /></td>

                      {/* Joined */}
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>

                      {/* Actions */}
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {/* Edit */}
                            <button onClick={() => openEdit(u)} title="Edit"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors">
                              <Pencil size={14} />
                            </button>

                            {/* Disable / Enable */}
                            <button
                              onClick={() => setConfirm({ user: u, action: 'status' })}
                              title={u.active ? 'Deactivate' : 'Activate'}
                              disabled={u._id === me?._id}
                              className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${u.active ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                              {u.active ? <UserX size={14} /> : <UserCheck size={14} />}
                            </button>

                            {/* Reset password */}
                            <button onClick={() => setConfirm({ user: u, action: 'resetpw' })} title="Reset password"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                              <KeyRound size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total} users
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const n = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                return (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-7 h-7 text-xs rounded-lg font-medium transition-colors ${n === page ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                    {n}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      <UserModal
        open={modalOpen}
        user={editUser}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      {/* Confirm: status toggle */}
      <ConfirmDialog
        open={confirm?.action === 'status'}
        title={confirm?.user?.active ? 'Deactivate user?' : 'Activate user?'}
        message={confirm?.user?.active
          ? `${confirm.user.name} will be signed out and cannot log in until reactivated.`
          : `${confirm?.user?.name} will be able to log in again.`}
        confirmLabel={confirm?.user?.active ? 'Deactivate' : 'Activate'}
        confirmClass={confirm?.user?.active ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700'}
        onConfirm={() => { handleStatusToggle(confirm.user); setConfirm(null); }}
        onCancel={() => setConfirm(null)}
      />

      {/* Confirm: reset password */}
      <ConfirmDialog
        open={confirm?.action === 'resetpw'}
        title="Reset password?"
        message={`A new temporary password will be generated for ${confirm?.user?.name}. Their current sessions will be revoked.`}
        confirmLabel="Reset password"
        confirmClass="bg-amber-500 hover:bg-amber-600"
        onConfirm={() => { handleResetPassword(confirm.user); setConfirm(null); }}
        onCancel={() => setConfirm(null)}
      />

      {/* Temp password display */}
      <PasswordModal open={!!tempPass} tempPassword={tempPass ?? ''} onClose={() => setTempPass(null)} />

      {/* Toasts */}
      <Toast toasts={toasts} remove={removeToast} />
    </div>
  );
}
