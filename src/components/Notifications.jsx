import { useState, useEffect } from "react";
import axios from "axios";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("http://localhost:5000/notifications");
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `http://localhost:5000/notifications/${notificationId}/read`,
      );
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n,
        ),
      );
      // Notify App component to refresh unread count
      window.postMessage({ type: "notification-read" }, "*");
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "budget_alert":
        return "💰";
      case "reminder":
        return "⏰";
      case "info":
        return "ℹ️";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "budget_alert":
        return "border-red-600/30 bg-red-600/10";
      case "reminder":
        return "border-yellow-600/30 bg-yellow-600/10";
      case "info":
        return "border-blue-600/30 bg-blue-600/10";
      default:
        return "border-gray-600/30 bg-gray-600/10";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-theme-primary">Notifications</h1>
        <p className="text-theme-secondary mt-1">
          Stay updated with your financial activities
        </p>
      </div>

      {/* Notifications List */}
      <div className="bg-[#161b22] rounded-xl border border-[#30363d] overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🔔</span>
            </div>
            <p className="text-[#8b949e] text-lg">No notifications</p>
            <p className="text-[#8b949e] text-sm mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-[#30363d]">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-[#21262d] transition-colors cursor-pointer ${
                  !notification.isRead ? "bg-[#21262d]/50" : ""
                }`}
                onClick={() =>
                  !notification.isRead && markAsRead(notification.id)
                }
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-lg border ${getNotificationColor(notification.type)}`}
                  >
                    <span className="text-lg">
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3
                        className={`font-medium ${
                          notification.isRead
                            ? "text-[#8b949e]"
                            : "text-[#f0f6fc]"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-[#8b949e]">
                          {new Date(
                            notification.createdAt,
                          ).toLocaleDateString()}
                        </span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p
                      className={`mt-1 text-sm ${
                        notification.isRead
                          ? "text-[#8b949e]"
                          : "text-[#8b949e]"
                      }`}
                    >
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
        <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">
          Notification Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-[#f0f6fc] font-medium">Budget Alerts</h4>
              <p className="text-[#8b949e] text-sm">
                Get notified when you exceed budget limits
              </p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-[#f0f6fc] font-medium">Monthly Reports</h4>
              <p className="text-[#8b949e] text-sm">
                Receive monthly spending summaries
              </p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
