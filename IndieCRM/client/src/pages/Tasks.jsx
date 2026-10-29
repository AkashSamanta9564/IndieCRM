import { useEffect, useState } from "react";
import TaskModal from "../components/TaskModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { apiFetch } from "../lib/api";
import {
  Plus,
  Calendar,
  MoreHorizontal,
  Circle,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [leads, setLeads] = useState([]);
  const location = useLocation();
  const [highlightedTask, setHighlightedTask] = useState(null);
  const [taskPendingDeletion, setTaskPendingDeletion] = useState(null);

  useEffect(() => {
    apiFetch("/api/tasks")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load tasks");
        return res.json();
      })
      .then((data) => setTasks(data))
      .catch((err) => console.error("Error fetching tasks:", err));

    apiFetch("/api/leads")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load leads");
        return res.json();
      })
      .then((data) => setLeads(data))
      .catch((err) => console.error("Error fetching leads:", err));
  }, []);

  // Detect when navigation comes from Dashboard and highlight for 3 seconds
  useEffect(() => {
    if (location.state?.highlightTask) {
      setHighlightedTask(location.state.highlightTask);

      const timer = setTimeout(() => {
        setHighlightedTask(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const columns = {
    Todo: tasks.filter(t => t.status === "Todo"),
    "In Progress": tasks.filter(t => t.status === "In Progress"),
    Done: tasks.filter(t => t.status === "Done"),
  };

  const handleDelete = async (task) => {
    const taskId = task.id || task._id;

    try {
      const res = await apiFetch(
        `/api/tasks/${taskId}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Delete failed");

      setTasks((prev) =>
        prev.filter((item) => (item.id || item._id) !== taskId)
      );
      toast.success("Task deleted!");
    } catch (err) {
      console.error("Error deleting task:", err);
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Tasks
            </h1>
            <p className="text-gray-500 mt-1">
              Organize your work with AI
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedTask(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition text-white font-medium"
          >
            <Plus size={16}/>
            New Task
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {Object.entries(columns).map(([title, list]) => (
            <div
              key={title}
              className="rounded-2xl border border-white/5 bg-[#0B1220] p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Circle
                    size={10}
                    fill={
                      title === "Todo"
                        ? "#F59E0B"
                        : title === "In Progress"
                        ? "#3B82F6"
                        : "#22C55E"
                    }
                    color="transparent"
                  />

                  <h3 className="font-semibold text-white">
                    {title}
                  </h3>
                </div>

                <span className="text-xs text-gray-500">
                  {list.length}
                </span>
              </div>

              <div className="space-y-3">
                {list.map(task => (
                  <div
                    key={task._id || task.id}
                    className={`rounded-xl bg-white/[0.03] border border-white/5 p-4 hover:bg-white/[0.06] hover:-translate-y-1 transition-all duration-200 ${
                      highlightedTask === (task.id || task._id)
                        ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/20"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-white">
                          {task.title}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          {task.lead}
                        </p>
                      </div>

                      <button 
                        onClick={() => {
                          setSelectedTask(task);
                          setShowModal(true);
                        }}
                        className="text-gray-500 hover:text-white"
                      >
                        <MoreHorizontal size={16}/>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="flex items-center gap-1 text-xs text-blue-400">
                        <Calendar size={12}/>
                        {task.dueDate}
                      </span>

                      <button 
                        onClick={() => setTaskPendingDeletion(task)}
                        className="text-blue-400 hover:text-blue-300"
                        title="Complete / Action"
                      >
                        <Sparkles size={16}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Modal */}
      {showModal && (
        <TaskModal
          mode={selectedTask ? "edit" : "add"}
          task={selectedTask}
          leads={leads}
          onClose={() => {
            setShowModal(false);
            setSelectedTask(null);
          }}
          onSave={async (form) => {
            try {
              if (selectedTask) {
                const taskId = selectedTask._id || selectedTask.id;

                const res = await apiFetch(
                  `/api/tasks/${taskId}`,
                  {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                  }
                );

                if (!res.ok) throw new Error("Update failed");

                const updatedTask = await res.json();

                setTasks((prev) =>
                  prev.map((t) =>
                    (t._id || t.id) === taskId ? updatedTask : t
                  )
                );
                toast.success("Task updated!");
              } else {
                const res = await apiFetch("/api/tasks", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(form),
                });

                if (!res.ok) throw new Error("Create failed");

                const newTask = await res.json();

                setTasks((prev) => [...prev, newTask]);
                toast.success("Task created successfully!");
              }

              setShowModal(false);
              setSelectedTask(null);
            } catch (err) {
              console.error(err);
              toast.error(err.message);
            }
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(taskPendingDeletion)}
        title="Delete task?"
        message={`This will permanently delete ${taskPendingDeletion?.title || "this task"}.`}
        onCancel={() => setTaskPendingDeletion(null)}
        onConfirm={() => {
          const task = taskPendingDeletion;
          setTaskPendingDeletion(null);
          if (task) handleDelete(task);
        }}
      />
    </div>
  );
}

export default Tasks;
