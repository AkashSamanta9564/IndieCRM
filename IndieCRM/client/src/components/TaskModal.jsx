import { useState } from "react";

function TaskModal({ onClose, onSave, leads, task = null, mode = "add" }) {
  const [form, setForm] = useState(
    task || {
      title: "",
      lead: "",
      status: "Todo",
      dueDate: "",
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-96 space-y-4"
      >
        <h2 className="text-3xl font-bold text-white">
          {mode === "edit" ? "Edit Task" : "New Task"}
        </h2>

        <input
          type="text"
          placeholder="Task Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white"
          required
        />

       <select
  value={form.lead}
  onChange={(e) => setForm({ ...form, lead: e.target.value })}
  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
  required
>
  <option value="">Select Lead</option>

  {leads?.map((lead) => (
    <option key={lead.id || lead._id} value={lead.name}>
      {lead.name}
    </option>
  ))}
</select>

        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white"
        >
          <option>Todo</option>
          <option>In Progress</option>
          <option>Done</option>
        </select>

        <input
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white"
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-700 px-4 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg"
          >
            {mode === "edit" ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskModal;