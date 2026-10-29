import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { 
  Bell, 
  AlertCircle, 
  Clock, 
  Search, 
  Users, 
  Flame, 
  Bot, 
  MessageSquare,
  Plus,
  CheckCircle2,
  Sparkles,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import LeadModal from "../components/LeadModal";

const COLORS = ["#3B82F6", "#22C55E", "#EF4444"];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-white font-semibold">{payload[0].name}</p>
      <p className="text-blue-400">{payload[0].value} Leads</p>
    </div>
  );
}

function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [search, setSearch] = useState("");
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [readNotifications, setReadNotifications] = useState(() => {
    const saved = localStorage.getItem("readNotifications");
    return saved ? JSON.parse(saved) : [];
  });
  const [notificationSettings, setNotificationSettings] = useState({
    dueToday: true,
    overdue: true,
  });
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const formatTime = (date) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);

    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`;
    if (diff < 10080) return `${Math.floor(diff / 1440)} day ago`;

    return new Date(date).toLocaleDateString();
  };

  const fetchDashboardData = useCallback(() => {
    apiFetch("/api/leads")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load leads");
        return res.json();
      })
      .then((data) => setLeads(data))
      .catch(console.error);

    apiFetch("/api/tasks")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load tasks");
        return res.json();
      })
      .then(setTasks)
      .catch(console.error);
  }, []);

  // Fetch leads, tasks, and load settings
  useEffect(() => {
    fetchDashboardData();

    window.addEventListener("leadUpdated", fetchDashboardData);

    return () =>
      window.removeEventListener("leadUpdated", fetchDashboardData);
  }, [fetchDashboardData]);

  useEffect(() => {
    const savedSettings = localStorage.getItem("crm-notification-settings");
    if (savedSettings) {
      setNotificationSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Compute notifications based on tasks and user settings
  useEffect(() => {
    if (tasks.length === 0) {
      setNotifications([]);
      setReadNotifications([]);
      localStorage.removeItem("readNotifications");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    const dueToday = tasks.filter(
      (task) => task.dueDate === today && task.status !== "Done"
    );

    const overdue = tasks.filter(
      (task) => task.dueDate < today && task.status !== "Done"
    );

    const overdueNotifications = overdue.map((task) => ({
      id: task._id || task.id,
      type: "overdue",
      text: `${task.title} is overdue`,
    }));

    const dueTodayNotifications = dueToday.map((task) => ({
      id: task._id || task.id,
      type: "today",
      text: `${task.title} is due today`,
    }));

    const items = [
      ...(notificationSettings.overdue ? overdueNotifications : []),
      ...(notificationSettings.dueToday ? dueTodayNotifications : []),
    ];

    setNotifications(items);

    // Remove notifications when the task is no longer an alert
    setReadNotifications((prev) =>
      prev.filter((id) => items.some((n) => n.id === id))
    );
  }, [tasks, notificationSettings]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCommandPalette(true);
      }

      if (e.key === "Escape") {
        setShowCommandPalette(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Persist read notifications to localStorage
  useEffect(() => {
    localStorage.setItem(
      "readNotifications",
      JSON.stringify(readNotifications)
    );
  }, [readNotifications]);

  const unreadNotifications = notifications.filter(
    (n) => !readNotifications.includes(n.id)
  );

  // Live Stats
  const totalLeads = leads.length;
  const newLeads = leads.filter((lead) => lead.status === "New Lead").length;
  const hotLeads = leads.filter((lead) => (lead.score || 0) >= 70).length;
  const interestedLeads = leads.filter((lead) => lead.status === "Interested").length;
  const avgScore = leads.length
    ? Math.round(
        leads.reduce((sum, lead) => sum + (lead.score || 0), 0) / leads.length
      )
    : 0;

  const chartData = [
    { name: "New", value: newLeads },
    { name: "Interested", value: interestedLeads },
    { name: "Hot", value: hotLeads },
  ];

  const recentActivity = leads
    .slice(0, 5)
    .map((lead) => ({
      id: lead._id,
      title: "New Lead Added",
      name: lead.name,
      company: lead.company,
      time: formatTime(lead.createdAt),
      score: lead.score || 0,
    }));

  const cards = [
    {
      title: "Total Leads",
      value: totalLeads,
      icon: Users,
      colorClass: "text-blue-400",
      bgClass: "bg-blue-500",
    },
    {
      title: "Hot Leads",
      value: hotLeads,
      icon: Flame,
      colorClass: "text-red-400",
      bgClass: "bg-red-500",
    },
    {
      title: "Avg AI Score",
      value: avgScore,
      icon: Bot,
      colorClass: "text-purple-400",
      bgClass: "bg-purple-500",
    },
    {
      title: "Interested",
      value: interestedLeads,
      icon: MessageSquare,
      colorClass: "text-green-400",
      bgClass: "bg-green-500",
    },
  ];

  const aiInsights = [
    {
      color: "green",
      text: hotLeads
        ? `${hotLeads} high-priority lead${hotLeads > 1 ? "s" : ""} detected.`
        : "No hot leads detected today.",
    },
    {
      color: "blue",
      text: interestedLeads
        ? `${interestedLeads} interested lead${interestedLeads > 1 ? "s are" : " is"} waiting for follow-up.`
        : "No interested leads need follow-up.",
    },
    {
      color: "purple",
      text:
        avgScore >= 70
          ? `Average AI score is ${avgScore}. Lead quality is strong.`
          : `Average AI score is ${avgScore}. Focus on nurturing leads.`,
    },
  ];

  const filteredLeads = leads.filter((lead) => {
    const q = search.toLowerCase();

    return (
      lead.name?.toLowerCase().includes(q) ||
      lead.company?.toLowerCase().includes(q)
    );
  });

  const filteredTasks = tasks.filter((task) =>
    task.title?.toLowerCase().includes(search.toLowerCase())
  );

  const commandResults = [
    ...filteredLeads.map((lead) => ({
      id: lead._id,
      type: "Lead",
      title: lead.name,
      subtitle: lead.company,
      action: () => {
        navigate("/leads");
        setShowCommandPalette(false);
      },
    })),

    ...filteredTasks.map((task) => ({
      id: task._id,
      type: "Task",
      title: task.title,
      subtitle: task.status,
      action: () => {
        navigate("/tasks");
        setShowCommandPalette(false);
      },
    })),

    {
      id: "dashboard",
      type: "Page",
      title: "Dashboard",
      subtitle: "Go to Dashboard",
      action: () => {
        navigate("/");
        setShowCommandPalette(false);
      },
    },

    {
      id: "settings",
      type: "Page",
      title: "Settings",
      subtitle: "Open Settings",
      action: () => {
        navigate("/settings");
        setShowCommandPalette(false);
      },
    },
  ];

  const bestLead =
    leads.length > 0
      ? [...leads].sort((a, b) => (b.score || 0) - (a.score || 0))[0]
      : null;

  const pendingTasks = tasks.filter(
    (task) => task.status !== "Done"
  ).length;

  return (
    <div className="p-6 space-y-6">
      
      {/* Header with Search and Profile */}
      <div className="flex items-center justify-between mb-8">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 w-64 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/20">
          <Search size={18} className="text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads, companies, tasks..."
            className="bg-transparent outline-none text-sm w-full text-white placeholder:text-gray-500"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 text-gray-300 hover:text-white"
            >
              <Bell size={18} />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-80 rounded-2xl bg-gray-900 border border-gray-800 p-4 shadow-2xl z-50"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                    <h3 className="text-white font-semibold text-sm">Notifications</h3>
                    <span className="text-xs text-gray-400">
                      {unreadNotifications.length} unread
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
                    {unreadNotifications.map((notification, index) => (
                      <div
                        key={notification.id || index}
                        onClick={() => {
                          const updated = [...readNotifications, notification.id];
                          setReadNotifications(updated);
                          localStorage.setItem("readNotifications", JSON.stringify(updated));
                          setShowNotifications(false);
                          navigate("/tasks", {
                            state: { highlightTask: notification.id },
                          });
                        }}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-xs leading-relaxed cursor-pointer transition-all hover:scale-[1.02] ${
                          notification.type === "overdue"
                            ? "bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20"
                            : "bg-yellow-500/10 border-yellow-500/20 text-yellow-300 hover:bg-yellow-500/20"
                        }`}
                      >
                        {notification.type === "overdue" ? (
                          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                        ) : (
                          <Clock size={16} className="text-yellow-400 mt-0.5 shrink-0" />
                        )}
                        <span>{notification.text}</span>
                      </div>
                    ))}

                    {unreadNotifications.length === 0 && (
                      <p className="text-gray-400 p-4 text-center text-xs">
                        No unread notifications.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700 shadow-[0_0_18px_rgba(59,130,246,0.08)] flex items-center justify-center font-semibold text-white">
              {(user.name || "A").charAt(0).toUpperCase()}
            </div>

            <div className="hidden md:block text-white">
              <p className="text-sm font-medium">{user.name || "User"}</p>
              <p className="text-xs text-gray-500">Workspace Owner</p>
            </div>
          </div>
        </div>
      </div>

      {search && (
        <div className="crm-card rounded-2xl p-5 border border-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">
              Search Results
            </h3>
            <span className="text-xs text-gray-500">
              {filteredLeads.length + filteredTasks.length} results
            </span>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">

            {filteredLeads.map((lead) => (
              <div
                key={lead._id}
                className="rounded-xl bg-white/[0.03] p-3 border border-white/5"
              >
                <p className="text-white font-medium">{lead.name}</p>
                <p className="text-xs text-gray-400">
                  {lead.company} • AI Score {lead.score || 0}
                </p>
              </div>
            ))}

            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className="rounded-xl bg-white/[0.03] p-3 border border-white/5"
              >
                <p className="text-white font-medium">{task.title}</p>
                <p className="text-xs text-gray-400">
                  Status: {task.status}
                </p>
              </div>
            ))}

            {filteredLeads.length === 0 &&
              filteredTasks.length === 0 && (
                <p className="text-gray-400 text-sm">
                  No matching results.
                </p>
            )}

          </div>
        </div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="crm-card rounded-3xl p-6 mb-6 border border-white/5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          <div>
            <h2 className="text-2xl font-bold text-white">
              Welcome back, {user.name || "User"} 👋
            </h2>

            <p className="text-gray-400 mt-1">
              You have {notifications.length} pending notification{notifications.length !== 1 ? "s" : ""}.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            <button
              onClick={() => setShowLeadModal(true)}
              className="group rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 hover:scale-105 transition-all shadow-[0_0_25px_rgba(37,99,235,.25)]"
            >
              <Plus size={22} className="mb-3 text-white" />
              <p className="text-sm font-medium text-white">New Lead</p>
            </button>

            <button
              onClick={() => navigate("/tasks")}
              className="group rounded-2xl bg-white/[0.03] border border-white/5 p-4 hover:bg-white/[0.06] hover:scale-105 transition-all"
            >
              <CheckCircle2 size={22} className="mb-3 text-green-400" />
              <p className="text-sm text-white">New Task</p>
            </button>

            <button
              onClick={() => setShowInsights(true)}
              className="group rounded-2xl bg-white/[0.03] border border-white/5 p-4 hover:bg-white/[0.06] hover:scale-105 transition-all"
            >
              <Sparkles size={22} className="mb-3 text-purple-400" />
              <p className="text-sm text-white">AI Insights</p>
            </button>

            <button
              onClick={() => setShowAnalytics(true)}
              className="group rounded-2xl bg-white/[0.03] border border-white/5 p-4 hover:bg-white/[0.06] hover:scale-105 transition-all"
            >
              <BarChart3 size={22} className="mb-3 text-yellow-400" />
              <p className="text-sm text-white">Analytics</p>
            </button>

          </div>

        </div>

        <div className="mt-5 flex items-center gap-2 text-sm text-blue-400">
          <span>Everything is synced with MongoDB Atlas</span>
          <ArrowRight size={16} />
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent p-6 hover:border-blue-500/20 hover:shadow-[0_0_30px_rgba(37,99,235,0.08)] transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400">{card.title}</p>
                  <motion.h2 
                    className="text-4xl font-bold mt-3 text-white"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: 0.35,
                      delay: index * 0.1 + 0.2,
                    }}
                  >
                    {card.value}
                  </motion.h2>
                </div>

                <Icon className={card.colorClass} size={24} />
              </div>

              <div className="mt-5 h-1 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className={`h-full ${card.bgClass} rounded-full transition-all duration-700`}
                  style={{ width: `${Math.min(card.value, 100)}%` }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Chart and AI Insights Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Left - Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#0B1220] p-6 hover:border-blue-500/20 hover:shadow-[0_0_30px_rgba(37,99,235,0.08)] transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Lead Status Distribution</h3>
            <button className="text-xs text-blue-400 hover:text-blue-300 transition">
              Details
            </button>
          </div>

          <div className="flex flex-col justify-center py-6 w-full">
            <div className="relative h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    outerRadius={110}
                    innerRadius={60}
                    paddingAngle={5}
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Donut Chart Center Badge */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-28 h-28 rounded-full bg-gray-900 border border-blue-500/40 shadow-[0_0_35px_rgba(59,130,246,0.35)] flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {totalLeads}
                  </span>
                  <span className="text-xs text-gray-400">
                    Leads
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-6 justify-center mt-6">
              {chartData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-gray-300 text-sm">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right - AI Insights (Dynamic) */}
        <div className="rounded-2xl border border-white/5 bg-[#0B1220] p-6 hover:border-blue-500/20 hover:shadow-[0_0_30px_rgba(37,99,235,0.08)] transition-all duration-300 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">AI Insights</h3>
            <span className="text-xs text-blue-400">Beta</span>
          </div>

          <div className="space-y-5 flex-1">
            {aiInsights.map((insight, index) => (
              <div key={index} className="flex gap-3">
                <div
                  className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                    insight.color === "green"
                      ? "bg-green-400"
                      : insight.color === "blue"
                      ? "bg-blue-400"
                      : "bg-purple-400"
                  }`}
                />

                <div>
                  <p className="text-sm text-gray-300">{insight.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
            <span>Updated just now</span>
            <span className="flex items-center gap-1 text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              Live
            </span>
          </div>

          <button className="w-full mt-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] py-3 text-sm text-gray-300 hover:text-white transition">
            View All Insights
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 rounded-2xl border border-white/5 bg-[#0B1220] p-6 hover:border-blue-500/20 hover:shadow-[0_0_30px_rgba(37,99,235,0.08)] transition-all duration-300">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <button className="text-xs text-gray-400 hover:text-white transition">
            View All
          </button>
        </div>

        <div className="space-y-5">
          {recentActivity.length > 0 ? (
            recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-white/[0.03] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700 shadow-[0_0_18px_rgba(59,130,246,0.08)] flex items-center justify-center text-sm font-semibold text-white">
                    {item.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                   <div>
  <p className="text-sm font-semibold text-white">{item.name}</p>
  <p className="text-xs text-gray-400">
    {item.company} • AI Score {item.score}
  </p>
</div>
                  </div>
                </div>

                <span className="text-xs text-gray-500">{item.time}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm pl-3">No recent activity found.</p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCommandPalette && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex justify-center pt-28 px-4"
            onClick={() => setShowCommandPalette(false)}
          >
            <motion.div
              initial={{ y: -20, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -20, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0B1220] shadow-[0_0_40px_rgba(37,99,235,.15)] overflow-hidden"
            >
              <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
                <Search className="text-gray-500" size={20} />

                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search leads, tasks, pages..."
                  className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-500"
                />
              </div>

              <div className="max-h-96 overflow-y-auto p-2">
                {commandResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className="w-full rounded-xl p-4 text-left hover:bg-white/5 transition flex justify-between items-center"
                  >
                    <div>
                      <p className="text-white font-medium">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.subtitle}</p>
                    </div>

                    <span className="text-xs text-blue-400">{item.type}</span>
                  </button>
                ))}

                {commandResults.length === 0 && (
                  <p className="text-center text-gray-400 py-10">
                    No results found.
                  </p>
                )}
              </div>

              <div className="border-t border-white/5 px-5 py-3 flex justify-between text-xs text-gray-500">
                <span>Esc to close</span>
                <span>Ctrl + K</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showInsights && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          onClick={() => setShowInsights(false)}
        >
          <div
            className="crm-card w-full max-w-2xl rounded-3xl p-7 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  AI Insights
                </h2>
                <p className="text-gray-400 text-sm">
                  Live recommendations from your CRM
                </p>
              </div>

              <button
                onClick={() => setShowInsights(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-5">

              <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-5">
                <p className="text-blue-400 text-sm">Best Lead</p>
                <h3 className="text-xl font-bold text-white mt-1">
                  {bestLead?.name || "No Leads"}
                </h3>
                <p className="text-gray-400 text-sm">
                  AI Score: {bestLead?.score || 0}
                </p>
              </div>

              <div className="rounded-2xl bg-purple-500/10 border border-purple-500/20 p-5">
                <p className="text-purple-400 text-sm">Average Score</p>
                <h3 className="text-xl font-bold text-white mt-1">
                  {avgScore}
                </h3>
                <p className="text-gray-400 text-sm">
                  Across {totalLeads} leads
                </p>
              </div>

            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 space-y-4">

              <div className="flex justify-between">
                <span className="text-gray-400">Hot Leads</span>
                <span className="text-green-400 font-semibold">
                  {hotLeads}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Pending Tasks</span>
                <span className="text-yellow-400 font-semibold">
                  {pendingTasks}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">CRM Health</span>
                <span className="text-blue-400 font-semibold">
                  {avgScore >= 70
                    ? "Excellent"
                    : avgScore >= 50
                    ? "Good"
                    : "Needs Attention"}
                </span>
              </div>

            </div>

            <div className="mt-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 p-5">
              <h4 className="text-white font-semibold mb-2">
                AI Recommendation
              </h4>

              <p className="text-gray-300 text-sm leading-6">
                {bestLead
                  ? `Follow up with ${bestLead.name} first. Their AI score is ${bestLead.score}, making them your strongest opportunity.`
                  : "Add more leads to receive AI recommendations."}
              </p>
            </div>
          </div>
        </div>
      )}

      {showAnalytics && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          onClick={() => setShowAnalytics(false)}
        >
          <div
            className="crm-card w-full max-w-4xl rounded-3xl p-7 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Analytics</h2>
                <p className="text-gray-400 text-sm">
                  Real-time CRM performance overview
                </p>
              </div>

              <button
                onClick={() => setShowAnalytics(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-6">

              <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-4">
                <p className="text-xs text-blue-300">Total Leads</p>
                <p className="text-3xl font-bold text-white">{totalLeads}</p>
              </div>

              <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-4">
                <p className="text-xs text-green-300">Hot Leads</p>
                <p className="text-3xl font-bold text-white">{hotLeads}</p>
              </div>

              <div className="rounded-2xl bg-purple-500/10 border border-purple-500/20 p-4">
                <p className="text-xs text-purple-300">Average Score</p>
                <p className="text-3xl font-bold text-white">{avgScore}</p>
              </div>

              <div className="rounded-2xl bg-yellow-500/10 border border-yellow-500/20 p-4">
                <p className="text-xs text-yellow-300">Pending Tasks</p>
                <p className="text-3xl font-bold text-white">
                  {tasks.filter((t) => t.status !== "Done").length}
                </p>
              </div>

            </div>

            <div className="grid md:grid-cols-2 gap-5">

              <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
                <h3 className="font-semibold text-white mb-4">
                  Lead Status
                </h3>

                <div className="space-y-3">

                  <div className="flex justify-between">
                    <span className="text-gray-400">New Lead</span>
                    <span className="text-white">{newLeads}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Interested</span>
                    <span className="text-white">{interestedLeads}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Hot Lead</span>
                    <span className="text-white">{hotLeads}</span>
                  </div>

                </div>
              </div>

              <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
                <h3 className="font-semibold text-white mb-4">
                  Performance
                </h3>

                <div className="space-y-3">

                  <div className="flex justify-between">
                    <span className="text-gray-400">CRM Health</span>
                    <span className="text-blue-400">
                      {avgScore >= 70
                        ? "Excellent"
                        : avgScore >= 50
                        ? "Good"
                        : "Needs Attention"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Completion Rate</span>
                    <span className="text-green-400">
                      {tasks.length
                        ? Math.round(
                            (tasks.filter((t) => t.status === "Done").length /
                              tasks.length) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      <LeadModal
        open={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        onSave={async (form) => {
          try {
            const res = await apiFetch("/api/leads", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error("Create failed");

            window.dispatchEvent(new Event("leadUpdated"));
            setShowLeadModal(false);
          } catch (err) {
            console.error(err);
          }
        }}
      />

    </div>
  );
}

export default Dashboard;