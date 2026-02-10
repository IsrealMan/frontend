import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  CheckCircle2,
  MessageSquare,
  AlertTriangle,
  Settings,
  ChevronLeft
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Activity, label: 'Production Health', path: '/production-health' },
  { icon: BarChart3, label: 'Production Metrics', path: '/production-metrics' },
  { icon: CheckCircle2, label: 'Quality Control', path: '/quality-control' },
  { icon: MessageSquare, label: 'Chat', path: '/chat' },
  { icon: AlertTriangle, label: 'Anomalies', path: '/anomalies' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-white border-r border-gray-200 flex flex-col z-20">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">P</span>
        </div>
        <span className="text-xl font-semibold text-gray-800">Predixa</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Version */}
      <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between">
        <span className="text-xs text-gray-400">v1.2.0</span>
        <button className="text-gray-400 hover:text-gray-600">
          <ChevronLeft size={18} />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
