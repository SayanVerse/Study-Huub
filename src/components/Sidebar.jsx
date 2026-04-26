import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard,
  Star,
  Tag,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/starred", icon: Star, label: "Starred" },
  { to: "/tags", icon: Tag, label: "Tags" },
];

const Sidebar = ({ open, onClose, collapsed, onToggleCollapse }) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen z-30 flex flex-col border-r transition-all duration-300
          ${open ? "translate-x-0 w-64" : `-translate-x-full lg:translate-x-0 ${collapsed ? "w-16" : "w-64"}`}`}
        style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}
      >
        {/* Logo */}
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} px-4 py-4 border-b`} style={{ borderColor: 'var(--border)' }}>
          <div className={`flex items-center gap-2 ${collapsed ? "hidden" : ""}`}>
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center overflow-hidden p-0.5 shrink-0">
              <img src="/src/assets/logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.target.style.display='none'; }} />
            </div>
            <span className="font-bold text-base tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
              Study Hub
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
          <button
            onClick={onToggleCollapse}
            className={`hidden lg:flex items-center justify-center p-1.5 rounded-lg transition-colors hover:bg-slate-800/60 ${collapsed ? "mx-auto" : ""}`}
            style={{ color: 'var(--text-muted)' }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${collapsed ? "justify-center" : "gap-3"}
                ${
                  isActive
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-900/30"
                    : "hover:bg-slate-800/60"
                }`
              }
              style={({ isActive }) => isActive ? {} : { color: 'var(--text-secondary)' }}
              title={collapsed ? label : ""}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer: Theme toggle + User + Logout */}
        <div className="px-2 py-3 border-t space-y-1" style={{ borderColor: 'var(--border)' }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`flex items-center w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-slate-800/60 ${collapsed ? "justify-center" : "gap-3 px-3"}`}
            style={{ color: 'var(--text-secondary)' }}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <Sun size={18} className="shrink-0 text-amber-400" />
            ) : (
              <Moon size={18} className="shrink-0 text-slate-500" />
            )}
            {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          </button>

          {/* User info */}
          <div className={`flex items-center py-2 ${collapsed ? "justify-center" : "gap-3 px-3"}`}>
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="avatar"
                className="w-8 h-8 rounded-full ring-2 ring-violet-500/40 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                {currentUser?.email?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {currentUser?.displayName || "Student"}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {currentUser?.email}
                </p>
              </div>
            )}
          </div>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className={`flex items-center w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-red-400/10 hover:text-red-400 ${collapsed ? "justify-center" : "gap-3 px-3"}`}
            style={{ color: 'var(--text-muted)' }}
            title={collapsed ? "Sign Out" : ""}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
