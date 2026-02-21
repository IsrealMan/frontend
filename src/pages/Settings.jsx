import { useState, useEffect, useCallback } from 'react';
import {
  User, Bell, Settings2, HelpCircle,
  Save, Loader2, CheckCircle2, ChevronRight,
  Mail, Smartphone, AlertTriangle, Info, Wrench, Tag,
  MessageCircle, BookOpen, ExternalLink,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// ── Tabs config ─────────────────────────────────────────────
const TABS = [
  { id: 'account',       label: 'Account',       icon: User      },
  { id: 'notifications', label: 'Notifications',  icon: Bell      },
  { id: 'system',        label: 'System',         icon: Settings2 },
  { id: 'help',          label: 'Help & Support', icon: HelpCircle },
];

const DEPARTMENTS = [
  '', 'Engineering', 'Production', 'Quality Control',
  'Maintenance', 'Management', 'R&D', 'Supply Chain', 'Other',
];

const INTEREST_OPTIONS = [
  'Temperature Monitoring', 'Pressure Control', 'Predictive Maintenance',
  'Quality Assurance', 'Energy Efficiency', 'Supply Chain', 'Machine Learning',
  'Process Optimization', 'Safety Compliance', 'Reporting & Analytics',
];

const FAQ = [
  { q: 'How does the AI recommendation engine work?', a: 'Our AI analyzes real-time sensor data and historical trends to surface actionable recommendations before issues become critical.' },
  { q: 'How often is machine health data refreshed?', a: 'Data refreshes every 30 seconds via WebSocket push, ensuring you always see the latest production state.' },
  { q: 'Can I export quality parameter reports?', a: 'CSV/PDF export is available from the Quality Control page using the export button in the toolbar.' },
  { q: 'What do LSL / USL / LCL / UCL mean?', a: 'LSL = Lower Spec Limit, USL = Upper Spec Limit (product acceptance). LCL = Lower Control Limit, UCL = Upper Control Limit (process stability).' },
];

// ── Shared save-state hook ───────────────────────────────────
function useSaveState() {
  const [state, setState] = useState('idle'); // idle | saving | saved | error

  const save = useCallback(async (fn) => {
    setState('saving');
    try {
      await fn();
      setState('saved');
      setTimeout(() => setState('idle'), 2500);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  }, []);

  return { state, save };
}

// ── Save button ──────────────────────────────────────────────
function SaveButton({ state, label = 'Save Changes' }) {
  const map = {
    idle:   { icon: <Save size={15} />,         text: label,       cls: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
    saving: { icon: <Loader2 size={15} className="animate-spin" />, text: 'Saving…',    cls: 'bg-indigo-400 text-white cursor-not-allowed' },
    saved:  { icon: <CheckCircle2 size={15} />, text: 'Saved!',    cls: 'bg-emerald-500 text-white' },
    error:  { icon: <AlertTriangle size={15} />, text: 'Error — retry', cls: 'bg-red-500 text-white' },
  };
  const { icon, text, cls } = map[state] ?? map.idle;
  return (
    <button
      type="submit"
      disabled={state === 'saving'}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${cls}`}
    >
      {icon}{text}
    </button>
  );
}

// ── Toggle row ───────────────────────────────────────────────
function ToggleRow({ label, description, checked, onChange, icon: Icon }) {
  return (
    <label className="flex items-center justify-between py-3 cursor-pointer group">
      <div className="flex items-start gap-3">
        {Icon && <Icon size={16} className="text-gray-400 mt-0.5 shrink-0" />}
        <div>
          <p className="text-sm font-medium text-gray-800">{label}</p>
          {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 ml-4 ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}
        style={{ width: 40, height: 22 }}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-[18px]' : ''}`}
          style={{ width: 18, height: 18, transition: 'transform 0.15s' }}
        />
      </div>
    </label>
  );
}

// ── Section card ─────────────────────────────────────────────
function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
      {title && <h4 className="text-sm font-semibold text-gray-700 mb-4">{title}</h4>}
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Account
// ═══════════════════════════════════════════════════════════════
function AccountTab({ settings, onSettingsChange }) {
  const { user } = useAuth();
  const { state, save } = useSaveState();
  const [name, setName]         = useState(user?.name || '');
  const [department, setDept]   = useState(settings?.department || '');

  // Sync when settings load
  useEffect(() => { setDept(settings?.department || ''); }, [settings?.department]);

  const handleSubmit = (e) => {
    e.preventDefault();
    save(async () => {
      await api.put('/api/settings/account', { name, department });
      onSettingsChange(prev => ({ ...prev, department }));
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card title="Profile Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              className="w-full px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 text-sm text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Role</label>
            <input
              type="text"
              value={user?.role || 'user'}
              readOnly
              className="w-full px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 text-sm text-gray-400 cursor-not-allowed capitalize"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Department</label>
            <select
              value={department}
              onChange={e => setDept(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors bg-white"
            >
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d || '— Select department —'}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <SaveButton state={state} />
      </div>
    </form>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Notifications
// ═══════════════════════════════════════════════════════════════
function NotificationsTab({ settings, onSettingsChange }) {
  const { state, save } = useSaveState();
  const [prefs, setPrefs] = useState({
    email: true, push: false,
    criticalAlerts: true, warnings: true, systemUpdates: false, maintenance: true,
    ...settings?.notifications,
  });

  useEffect(() => {
    if (settings?.notifications) setPrefs(p => ({ ...p, ...settings.notifications }));
  }, [settings?.notifications]);

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleSubmit = (e) => {
    e.preventDefault();
    save(async () => {
      await api.put('/api/settings/notifications', prefs);
      onSettingsChange(prev => ({ ...prev, notifications: prefs }));
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card title="Delivery Channels">
        <div className="divide-y divide-gray-50">
          <ToggleRow icon={Mail}       label="Email Notifications"  description="Receive alerts and digests by email"        checked={prefs.email} onChange={() => toggle('email')} />
          <ToggleRow icon={Smartphone} label="Push Notifications"   description="Browser push notifications when available"  checked={prefs.push}  onChange={() => toggle('push')}  />
        </div>
      </Card>

      <Card title="Alert Types">
        <div className="divide-y divide-gray-50">
          <ToggleRow icon={AlertTriangle} label="Critical Alerts"   description="Immediate notification for out-of-control parameters"  checked={prefs.criticalAlerts} onChange={() => toggle('criticalAlerts')} />
          <ToggleRow icon={AlertTriangle} label="Warnings"          description="Early warning before a parameter reaches critical level" checked={prefs.warnings}      onChange={() => toggle('warnings')}      />
          <ToggleRow icon={Info}          label="System Updates"    description="Product updates, new features and changelog"             checked={prefs.systemUpdates} onChange={() => toggle('systemUpdates')} />
          <ToggleRow icon={Wrench}        label="Maintenance Reminders" description="Upcoming scheduled maintenance windows"             checked={prefs.maintenance}   onChange={() => toggle('maintenance')}   />
        </div>
      </Card>

      <div className="flex justify-end">
        <SaveButton state={state} label="Save Preferences" />
      </div>
    </form>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: System
// ═══════════════════════════════════════════════════════════════
function SystemTab({ settings, onSettingsChange }) {
  const { state, save } = useSaveState();
  const [interests, setInterests] = useState(settings?.system?.areasOfInterest || []);
  const [tags,      setTags]      = useState(settings?.system?.customTags || '');

  useEffect(() => {
    setInterests(settings?.system?.areasOfInterest || []);
    setTags(settings?.system?.customTags || '');
  }, [settings?.system]);

  const toggleInterest = (item) => setInterests(prev =>
    prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    save(async () => {
      await api.put('/api/settings/system', { areasOfInterest: interests, customTags: tags });
      onSettingsChange(prev => ({ ...prev, system: { areasOfInterest: interests, customTags: tags } }));
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card title="Areas of Interest">
        <p className="text-xs text-gray-400 mb-4">Select topics relevant to your role — the AI will prioritise these in its recommendations.</p>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map(item => {
            const active = interests.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleInterest(item)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  active
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="Custom Tags">
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          <Tag size={12} className="inline mr-1" />
          Additional keywords (comma-separated)
        </label>
        <textarea
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="e.g. Plant A, Line 3, Shift B"
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors resize-none"
        />
      </Card>

      <div className="flex justify-end">
        <SaveButton state={state} label="Save System Settings" />
      </div>
    </form>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Help & Support
// ═══════════════════════════════════════════════════════════════
function HelpTab() {
  const [open, setOpen] = useState(null);
  const [chatMsg, setChatMsg]   = useState('');
  const [chatState, setChatState] = useState('idle'); // idle | sending | sent
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: 'Hi! How can I help you today?' },
  ]);

  const sendChat = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim() || chatState === 'sending') return;
    const userMsg = chatMsg.trim();
    setChatHistory(h => [...h, { role: 'user', text: userMsg }]);
    setChatMsg('');
    setChatState('sending');
    try {
      const res = await api.post('/api/help', { message: userMsg });
      setChatHistory(h => [...h, { role: 'assistant', text: res.data.reply || 'Got it! Our team will follow up shortly.' }]);
    } catch {
      setChatHistory(h => [...h, { role: 'assistant', text: 'Message received — our team will get back to you soon.' }]);
    }
    setChatState('idle');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* FAQ */}
      <div>
        <Card title="Frequently Asked Questions">
          <div className="space-y-1">
            {FAQ.map((item, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen size={13} className="text-indigo-400 shrink-0" />
                    {item.q}
                  </span>
                  <ChevronRight size={14} className={`text-gray-400 shrink-0 transition-transform ${open === i ? 'rotate-90' : ''}`} />
                </button>
                {open === i && (
                  <div className="px-4 pb-3 text-xs text-gray-500 leading-relaxed bg-gray-50/60">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Quick links */}
        <Card title="Resources">
          {[
            { label: 'Documentation', href: '#', icon: BookOpen },
            { label: 'Contact Support (senaitd@predixaai.com)', href: 'mailto:senaitd@predixaai.com', icon: Mail },
            { label: 'Call Us: 054-2334474', href: 'tel:0542334474', icon: Smartphone },
          ].map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <span className="flex items-center gap-2.5 text-sm text-gray-700">
                <Icon size={14} className="text-indigo-400" />
                {label}
              </span>
              <ExternalLink size={12} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
            </a>
          ))}
        </Card>
      </div>

      {/* Live chat */}
      <Card title="Chat with Support">
        <div className="flex flex-col h-72">
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-3">
            {chatHistory.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-700 rounded-bl-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {chatState === 'sending' && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-400 px-3 py-2 rounded-2xl rounded-bl-sm text-xs flex items-center gap-1">
                  <Loader2 size={11} className="animate-spin" /> Typing…
                </div>
              </div>
            )}
          </div>
          <form onSubmit={sendChat} className="flex gap-2">
            <input
              type="text"
              value={chatMsg}
              onChange={e => setChatMsg(e.target.value)}
              placeholder="Type your message…"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
            />
            <button
              type="submit"
              disabled={!chatMsg.trim() || chatState === 'sending'}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
            >
              <MessageCircle size={15} />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Settings page
// ═══════════════════════════════════════════════════════════════
function Settings() {
  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings]   = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get('/api/settings/me')
      .then(res => setSettings(res.data.settings))
      .catch(() => setSettings({}))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account preferences and system configuration</p>
      </div>

      {/* Tab strip */}
      <div className="bg-gray-100 rounded-xl p-1 inline-flex gap-0.5 mb-6 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[80, 48, 80].map((h, i) => (
            <div key={i} className={`h-${h === 80 ? '80' : '48'} bg-white rounded-2xl border border-gray-100 animate-pulse`} style={{ height: h * 2 }} />
          ))}
        </div>
      ) : (
        <>
          {activeTab === 'account'       && <AccountTab       settings={settings} onSettingsChange={setSettings} />}
          {activeTab === 'notifications' && <NotificationsTab settings={settings} onSettingsChange={setSettings} />}
          {activeTab === 'system'        && <SystemTab        settings={settings} onSettingsChange={setSettings} />}
          {activeTab === 'help'          && <HelpTab />}
        </>
      )}
    </div>
  );
}

export default Settings;
