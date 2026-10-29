import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Settings,
  Sparkles,
} from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };
  
  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Leads", path: "/leads", icon: Users },
    { name: "Tasks", path: "/tasks", icon: KanbanSquare },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 crm-surface border-r border-white/5 flex flex-col p-5 transition-colors duration-300">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Sparkles size={18} className="text-white" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-white">IndieCRM</h1>
          <p className="text-xs text-gray-500">Premium Workspace</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "crm-button text-white shadow-lg shadow-blue-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Workspace Card */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent p-4">

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-base shadow-lg shadow-blue-500/20">
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {user.name || "User"}
              </p>

              <p className="text-xs text-gray-500 truncate">
                {user.email || "No email"}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 h-px bg-white/5"></div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 py-2.5 text-sm font-medium text-gray-300 hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;