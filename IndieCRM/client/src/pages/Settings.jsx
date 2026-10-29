import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Sparkles,
  Bell,
  Palette,
  User,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../lib/api";

function Settings() {
  // 1. State Declarations
  const [profile, setProfile] = useState({
    workspace: "IndieCRM",
    owner: "Akash",
  });

  const [aiSettings, setAiSettings] = useState({
    enableGemini: true,
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    dueToday: true,
    overdue: true,
  });

  const [theme, setTheme] = useState("dark");
  const [showThemePopup, setShowThemePopup] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // 2. Load Saved Data on Mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("crm-profile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    const savedAI = localStorage.getItem("crm-ai-settings");
    if (savedAI) {
      setAiSettings(JSON.parse(savedAI));
    }

    const savedNotifications = localStorage.getItem("crm-notification-settings");
    if (savedNotifications) {
      setNotificationSettings(JSON.parse(savedNotifications));
    }

    const savedTheme = localStorage.getItem("crm-theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // 3. Handlers
  const saveProfile = () => {
    localStorage.setItem("crm-profile", JSON.stringify(profile));
    toast.success("Profile saved");
  };

  const saveAISettings = () => {
    localStorage.setItem(
      "crm-ai-settings",
      JSON.stringify(aiSettings)
    );
    toast.success("AI settings saved");
  };

  const saveNotificationSettings = () => {
    localStorage.setItem(
      "crm-notification-settings",
      JSON.stringify(notificationSettings)
    );
    toast.success("Notification settings saved");
  };

 const saveTheme = (selectedTheme) => {
  setTheme(selectedTheme);
  localStorage.setItem("crm-theme", selectedTheme);

  // Instantly notify App.jsx
  window.dispatchEvent(new Event("themeChanged"));

  setShowThemePopup(false);
};

  const resetCRM = async () => {
    setShowResetModal(false);

    try {
      // Delete all leads
      const leadsRes = await apiFetch("/api/leads");
      if (!leadsRes.ok) throw new Error("Could not load leads");
      const leads = await leadsRes.json();

      await Promise.all(
        leads.map((lead) =>
          apiFetch(`/api/leads/${lead._id || lead.id}`, {
            method: "DELETE",
          })
        )
      );

      // Delete all tasks
      const tasksRes = await apiFetch("/api/tasks");
      if (!tasksRes.ok) throw new Error("Could not load tasks");
      const tasks = await tasksRes.json();

      await Promise.all(
        tasks.map((task) =>
          apiFetch(`/api/tasks/${task._id || task.id}`, {
            method: "DELETE",
          })
        )
      );

      // Clear local settings
      localStorage.removeItem("crm-profile");
      localStorage.removeItem("crm-ai-settings");
      localStorage.removeItem("crm-notification-settings");
      localStorage.removeItem("crm-theme");

      toast.success("CRM has been reset");

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error("Reset failed");
    }
  };

  // 4. Render
  return (
    <div className="space-y-7 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Settings</h1>
          <p className="text-gray-500 mt-1">
            Customize your workspace
          </p>
        </div>

        <button
          onClick={() => setShowThemePopup(true)}
          className="crm-button-secondary p-3 hover:scale-105 transition text-white border border-gray-700 rounded-xl"
        >
          <SettingsIcon size={20}/>
        </button>
      </div>

      {/* Profile Card */}
      <div className="crm-panel crm-hover p-7 rounded-2xl border border-white/5 bg-[#0B1220] text-white">
        <div className="flex items-center gap-5 mb-6">
          <div className="crm-avatar w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-bold">
            {profile.owner.charAt(0)}
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              {profile.owner}
            </h2>

            <p className="text-gray-500">
              Workspace: {profile.workspace}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Workspace Name
            </label>

            <input
              value={profile.workspace}
              onChange={(e)=>
                setProfile({
                  ...profile,
                  workspace:e.target.value
                })
              }
              className="crm-input w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Owner Name
            </label>

            <input
              value={profile.owner}
              onChange={(e)=>
                setProfile({
                  ...profile,
                  owner:e.target.value
                })
              }
              className="crm-input w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          onClick={saveProfile}
          className="crm-button mt-6 px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition"
        >
          Save Profile
        </button>
      </div>

      {/* Grid */}
      <div className="grid lg:grid-cols-2 gap-6 text-white">
        {/* Theme */}
        <div className="crm-panel crm-hover p-6 rounded-2xl border border-white/5 bg-[#0B1220]">
          <div className="flex items-center gap-2 mb-5">
            <Palette size={18}/>
            <h3 className="font-semibold text-lg">
              Theme
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "dark", label: "Dark", bg: "#0f172a" },
              { id: "blue", label: "Blue", bg: "#1e3a8a" },
              { id: "purple", label: "Purple", bg: "#6b21a8" },
              { id: "green", label: "Green", bg: "#166534" },
            ].map((color) => (
              <button
                key={color.id}
                onClick={() => saveTheme(color.id)}
                className={`rounded-2xl border p-3 text-left transition-all duration-200 hover:scale-[1.02] ${
                  theme === color.id
                    ? "border-blue-500 ring-2 ring-blue-500/30"
                    : "border-white/5 hover:border-white/10"
                }`}
              >
                {/* Color Preview */}
                <div
                  className="h-12 rounded-xl mb-3"
                  style={{ background: color.bg }}
                />

                {/* Theme Name */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {color.label}
                  </span>

                  {theme === color.id && (
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Theme changes instantly across the app.
          </p>
        </div>

        {/* Notifications */}
        <div className="crm-panel crm-hover p-6 rounded-2xl border border-white/5 bg-[#0B1220]">
          <div className="flex items-center gap-2 mb-5">
            <Bell size={18}/>
            <h3 className="font-semibold text-lg">
              Notifications
            </h3>
          </div>

          <div className="space-y-5">
            {[
              {
                key: "dueToday",
                title: "Due Today Alerts",
                desc: "Get notified when tasks are due today."
              },
              {
                key: "overdue",
                title: "Overdue Alerts",
                desc: "Receive reminders for overdue tasks."
              }
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:bg-white/[0.04] transition"
              >
                <div>
                  <p className="font-medium text-white">
                    {item.title}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {item.desc}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key],
                    }))
                  }
                  className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
                    notificationSettings[item.key]
                      ? "bg-blue-600 shadow-[0_0_18px_rgba(37,99,235,0.35)]"
                      : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform duration-300 ${
                      notificationSettings[item.key]
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={saveNotificationSettings}
            className="crm-button mt-6 px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition"
          >
            Save Notifications
          </button>
        </div>
      </div>

      {/* AI Preferences */}
      <div className="crm-panel crm-hover p-6 rounded-2xl border border-white/5 bg-[#0B1220] text-white">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Sparkles size={20} className="text-blue-400"/>
            </div>

            <div>
              <h3 className="font-semibold text-lg">AI Preferences</h3>
              <p className="text-sm text-gray-500">
                Powered by Gemini AI
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              setAiSettings(prev => ({
                ...prev,
                enableGemini: !prev.enableGemini,
              }))
            }
            className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
              aiSettings.enableGemini
                ? "bg-blue-600 shadow-[0_0_18px_rgba(37,99,235,0.35)]"
                : "bg-gray-700"
            }`}
          >
            <span
              className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform duration-300 ${
                aiSettings.enableGemini
                  ? "translate-x-5"
                  : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="crm-pill crm-pill-info bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-medium">
            AI Tags
          </span>

          <span className="crm-pill crm-pill-success bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-medium">
            Lead Scoring
          </span>

          <span className="crm-pill crm-pill-info bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-medium">
            Follow-ups
          </span>
        </div>

        <p className="text-sm text-gray-400 mb-6 leading-6">
          Automatically generate smart tags, score leads based on buying intent,
          and create AI-powered follow-up tasks.
        </p>

        <button
          onClick={saveAISettings}
          className="crm-button px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition"
        >
          Save AI Settings
        </button>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-6">
        <div className="flex items-center gap-2 text-red-400 mb-3">
          <RotateCcw size={18}/>
          <h3 className="font-semibold text-lg">
            Danger Zone
          </h3>
        </div>

        <p className="text-sm text-gray-400 mb-5">
          Permanently delete all leads, tasks and saved settings.
        </p>

        <button
          onClick={() => setShowResetModal(true)}
          className="rounded-xl bg-red-600 hover:bg-red-500 px-5 py-3 text-white transition"
        >
          Reset CRM
        </button>
      </div>

      {/* Theme Popup Insertion */}
      {showThemePopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="crm-modal w-[380px] rounded-3xl p-7 text-white bg-[#0B1220] border border-white/10">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-2xl font-bold">
                Choose Theme
              </h3>
              <button 
                onClick={() => setShowThemePopup(false)}
                className="text-gray-500 hover:text-white transition"
              >
                ✕
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-6">
              Changes apply instantly.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                {id:"dark",label:"Dark",bg:"#0f172a"},
                {id:"blue",label:"Blue",bg:"#1e3a8a"},
                {id:"purple",label:"Purple",bg:"#6b21a8"},
                {id:"green",label:"Green",bg:"#166534"},
              ].map(color=>(
                <button
                  key={color.id}
                  onClick={()=>saveTheme(color.id)}
                  className={`rounded-2xl p-4 text-left border transition hover:scale-[1.02] ${
                    theme===color.id
                      ? "border-blue-500 ring-2 ring-blue-500/30"
                      : "border-white/5"
                  }`}
                  style={{background:color.bg}}
                >
                  <p className="font-semibold">
                    {color.label}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="crm-modal w-[420px] rounded-3xl p-7 bg-[#0B1220] border border-white/10 text-white">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center mb-5">
              <RotateCcw size={24} className="text-red-400"/>
            </div>

            <h3 className="text-2xl font-bold mb-2">
              Reset CRM
            </h3>

            <p className="text-gray-400 leading-6 mb-8">
              This will permanently delete all leads, tasks, profile settings and AI preferences.
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-700 hover:bg-white/5 transition"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await resetCRM();
                }}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 py-3 text-white transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
