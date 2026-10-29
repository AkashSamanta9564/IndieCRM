import { useState, useEffect } from "react";
import { User, Mail, Building2, X, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

function LeadModal({
  open = false,
  mode = "add",
  lead = null,
  onClose,
  onSave,
}) {
  if (!open) return null;
  const [loadingAI, setLoadingAI] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    status: "New Lead",
    score: 50,
    notes: "",
  });

  useEffect(() => {
    if (mode === "edit" && lead) {
      setFormData({
        name: lead.name || "",
        company: lead.company || "",
        email: lead.email || "",
        status: lead.status || "New Lead",
        score: lead.score || 50,
        notes: lead.notes || "",
      });
    }
  }, [mode, lead]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }
    onSave(formData);
  };

  // Optional: Connect to your AI Score endpoint if notes exist
  const generateAIScore = async () => {
    if (!formData.notes) {
      toast.error("Please add some notes first for AI to analyze.");
      return;
    }
    
    setLoadingAI(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: formData.notes }),
      });

      if (!res.ok) throw new Error("Failed to generate score");
      
      const data = await res.json();
      setFormData(prev => ({ ...prev, score: data.score }));
      toast.success("AI updated lead score!");
    } catch (err) {
      console.error(err);
      toast.error("AI scoring failed");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-[#0B1220] border border-white/10 rounded-3xl p-7 shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-white transition"
        >
          <X size={20} />
        </button>

        <h3 className="text-2xl font-bold mb-6 text-white">
          {mode === "edit" ? "Edit Lead" : "New Lead"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Input */}
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Full Name <span className="text-red-400">*</span></label>
            <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 transition">
              <User size={16} className="text-gray-500" />
              <input
                required
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-transparent outline-none w-full text-white placeholder:text-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-sm text-gray-400">Email</label>
              <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 transition">
                <Mail size={16} className="text-gray-500" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-transparent outline-none w-full text-white placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Company Input */}
            <div className="space-y-1">
              <label className="text-sm text-gray-400">Company</label>
              <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 transition">
                <Building2 size={16} className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Acme Corp"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="bg-transparent outline-none w-full text-white placeholder:text-gray-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status Select */}
            <div className="space-y-1">
              <label className="text-sm text-gray-400">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-white appearance-none cursor-pointer"
              >
                <option value="New Lead">New Lead</option>
                <option value="Interested">Interested</option>
                <option value="Hot Lead">Hot Lead</option>
              </select>
            </div>

            {/* AI Score Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">AI Score (0-100)</label>
                <button 
                  type="button" 
                  onClick={generateAIScore}
                  disabled={loadingAI}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 disabled:opacity-50"
                >
                  <Sparkles size={12} />
                  {loadingAI ? "Scoring..." : "Auto Score"}
                </button>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.score}
                onChange={(e) => setFormData({...formData, score: Number(e.target.value)})}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-white"
              />
            </div>
          </div>

          {/* Notes Input */}
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Notes</label>
            <textarea
              rows="3"
              placeholder="Add any relevant details about this lead..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-white resize-none placeholder:text-gray-600"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-700 text-white hover:bg-white/5 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition font-medium"
            >
              {mode === "edit" ? "Update Lead" : "Save Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeadModal;