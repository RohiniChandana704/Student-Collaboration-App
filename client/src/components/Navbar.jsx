import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // poll every 15s

    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown when clicking outside it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await api.put(`/notifications/${notification._id}/read`);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, read: true } : n
          )
        );
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }

    if (notification.post) {
      navigate(`/knowledge/${notification.post._id || notification.post}`);
    } else if (notification.group) {
      navigate(`/groups`);
    }

    setShowDropdown(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleLogout = () => {
    logout();
    setNotifications([]);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        StudentHub
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/knowledge">Knowledge</Link>
        <Link to="/questions">Questions</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/groups">Groups</Link>

        {user && (
          <div className="notification-wrapper" ref={dropdownRef}>
            <button className="notification-bell" onClick={handleBellClick}>
              🔔
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {showDropdown && (
              <div className="notification-dropdown">
                <div className="notification-dropdown-header">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead}>Mark all read</button>
                  )}
                </div>

                <div className="notification-list">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={
                          n.read
                            ? "notification-item"
                            : "notification-item unread"
                        }
                        onClick={() => handleNotificationClick(n)}
                      >
                        {n.message}
                      </div>
                    ))
                  ) : (
                    <p className="no-notifications">No notifications yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {user ? (
          <button className="nav-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;