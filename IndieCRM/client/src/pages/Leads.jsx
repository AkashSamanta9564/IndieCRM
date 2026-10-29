import { useEffect, useState } from "react";
import LeadModal from "../components/LeadModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { apiFetch } from "../lib/api";
import ScoreRing from "../components/ScoreRing";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Filter,
  Pencil,
  Sparkles,
  Trash2,
  MoreHorizontal,
} from "lucide-react";

function Leads() {
  const [leads, setLeads] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadPendingDeletion, setLeadPendingDeletion] = useState(null);

  useEffect(() => {
    apiFetch("/api/leads")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load leads");
        return res.json();
      })
      .then((data) => setLeads(data))
      .catch((err) => console.error("Error fetching leads:", err));
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const nameMatch = lead.name?.toLowerCase().includes(search.toLowerCase());
    const companyMatch = lead.company?.toLowerCase().includes(search.toLowerCase());
    return nameMatch || companyMatch;
  });

  const generateFollowUp = async (lead) => {
    try {
      toast.loading("Generating AI follow-up...", { id: "followup" });

      const aiRes = await apiFetch("/api/ai-followup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: lead.name,
          notes: lead.notes,
        }),
      });

      if (!aiRes.ok) throw new Error("AI generation failed");

      const aiTask = await aiRes.json();

      const taskRes = await apiFetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: aiTask.title,
          lead: lead.name,
          status: aiTask.status || "Todo",
          dueDate: new Date().toISOString().split("T")[0],
        }),
      });

      if (!taskRes.ok) throw new Error("Task creation failed");

      toast.success("AI follow-up task created!", { id: "followup" });
    } catch (err) {
      console.error(err);
      toast.error(err.message, { id: "followup" });
    }
  };

  const handleEdit = (lead) => {
    setSelectedLead(lead);
    setShowModal(true);
  };

  const handleDelete = async (leadId) => {
    try {
      const res = await apiFetch(`/api/leads/${leadId}`, { 
        method: "DELETE" 
      });

      if (!res.ok) throw new Error("Delete failed");

      setLeads((prev) => prev.filter((l) => (l._id || l.id) !== leadId));
      toast.success("Lead deleted!");
    } catch (err) {
      console.error("Error deleting lead:", err);
      toast.error(err.message);
    }
  };

  const saveLead = async (form) => {
    try {
      if (selectedLead) {
        // ---------- EDIT ----------
        const leadId = selectedLead._id || selectedLead.id;

        const res = await apiFetch(`/api/leads/${leadId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });

        if (!res.ok) throw new Error("Update failed");

        const updatedLead = await res.json();

        setLeads((prev) =>
          prev.map((l) => ((l._id || l.id) === leadId ? updatedLead : l))
        );
        toast.success("Lead updated!");
      } else {
        // ---------- ADD ----------
        const res = await apiFetch("/api/leads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });

        if (!res.ok) throw new Error("Create failed");

        const newLead = await res.json();

        setLeads((prev) => [...prev, newLead]);
        toast.success("Lead created successfully!");
      }

      setShowModal(false);
      setSelectedLead(null);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden p-6">
        
        {/* Header & Controls */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Leads
            </h1>
            <p className="text-gray-500 mt-1">
              Manage and track your leads
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 w-64 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/20">
              <Search size={18} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm text-white w-full placeholder:text-gray-500"
              />
            </div>

            {/* Filter */}
            <button className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.04] px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition">
              <Filter size={16} />
              Filter
            </button>

            {/* New Lead */}
            <button
              onClick={() => {
                setSelectedLead(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-medium shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition text-white"
            >
              <Plus size={16} />
              New Lead
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/5 bg-[#0B1220] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#111827]/60 backdrop-blur-sm border-b border-white/5">
              <tr className="text-left text-sm text-gray-400">
                <th className="px-6 py-4">Lead</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead._id || lead.id}
                    className="border-b border-white/5 hover:bg-[#111827]/60 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] transition-all duration-200"
                  >
                    {/* Lead */}
                    <td className="py-6 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700 shadow-[0_0_18px_rgba(59,130,246,0.08)] flex items-center justify-center text-white font-semibold">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-white">{lead.name}</p>
                          <p className="text-xs text-gray-500">Lead</p>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-6 px-6">
                      <div>
                        <p className="font-medium text-white">{lead.company}</p>

                        <p className="text-sm text-gray-400 mt-1 max-w-xs line-clamp-2">
                          {lead.notes || "No notes yet."}
                        </p>

                        <div className="flex gap-2 mt-3 flex-wrap">
                          {lead.tags?.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 rounded-full text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-6 px-6">
                      <div className="space-y-3">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            lead.status === "Interested"
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : lead.status === "Hot Lead"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          }`}
                        >
                          {lead.status}
                        </span>

                        <div className="flex items-center gap-3">
                          <ScoreRing score={lead.score || 0} />
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-6 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(lead)}
                          className="w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 text-gray-400 hover:text-white"
                          title="Edit Lead"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => generateFollowUp(lead)}
                          className="w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-blue-500/10 border border-white/[0.04] hover:border-blue-500/20 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 text-blue-400"
                          title="Generate AI Follow-up"
                        >
                          <Sparkles size={16} />
                        </button>

                        <button
                          onClick={() => setLeadPendingDeletion(lead)}
                          className="w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-red-500/10 border border-white/[0.04] hover:border-red-500/20 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 text-gray-400 hover:text-red-400"
                          title="Delete Lead"
                        >
                          <Trash2 size={16} />
                        </button>

                        <button className="w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 text-gray-400 hover:text-white">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center p-6 text-gray-400">
                    No leads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 text-sm text-gray-500">
            <p>Showing {filteredLeads.length > 0 ? 1 : 0} to {filteredLeads.length} of {leads.length} results</p>

            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-lg border border-white/5 hover:bg-white/5">‹</button>
              <button className="w-8 h-8 rounded-lg bg-blue-600 text-white">1</button>
              <button className="w-8 h-8 rounded-lg border border-white/5 hover:bg-white/5">›</button>
            </div>
          </div>
        </div>
      </div>

      <LeadModal
        open={showModal}
        mode={selectedLead ? "edit" : "add"}
        lead={selectedLead}
        onClose={() => {
          setShowModal(false);
          setSelectedLead(null);
        }}
        onSave={saveLead}
      />

      <ConfirmDialog
        open={Boolean(leadPendingDeletion)}
        title="Delete lead?"
        message={`This will permanently delete ${leadPendingDeletion?.name || "this lead"}.`}
        onCancel={() => setLeadPendingDeletion(null)}
        onConfirm={() => {
          const leadId = leadPendingDeletion?._id || leadPendingDeletion?.id;
          setLeadPendingDeletion(null);
          if (leadId) handleDelete(leadId);
        }}
      />
    </div>
  );
}

export default Leads;