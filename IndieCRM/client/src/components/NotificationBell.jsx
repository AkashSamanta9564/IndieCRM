import { Bell } from "lucide-react";
import { useState } from "react";
import { useNotifications } from "../context/NotificationContext";

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications } = useNotifications();

  return (
    <div className="relative">
    

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-semibold">Notifications</h3>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-400 text-sm p-4">
                No notifications yet.
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-4 border-b border-gray-800 hover:bg-gray-800 transition"
                >
                  <p className="text-white text-sm">{n.message}</p>
                  <p className="text-gray-500 text-xs mt-1">{n.time}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;