import { Search, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Topbar() {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="fixed top-0 left-[220px] right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
      {/* Title */}
      <h1 className="text-xl font-semibold">
        <span className="text-primary">Manufacturing</span>{' '}
        <span className="text-gray-800">Dashboard</span>
      </h1>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-48 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-colors"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
          <Bell size={22} />
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-medium">
            3
          </span>
        </button>

        {/* User */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">{getInitials(user?.name)}</span>
          </div>
          <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
