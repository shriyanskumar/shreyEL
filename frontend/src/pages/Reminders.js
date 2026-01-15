import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../styles/reminders.css";

const Reminders = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const res = await api.get("/api/reminders");
        setReminders(res.data.reminders || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load reminders");
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntil = (dateString) => {
    if (!dateString) return null;
    const reminderDate = new Date(dateString);
    const today = new Date();
    const diffTime = reminderDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyClass = (daysUntil) => {
    if (daysUntil < 0) return "overdue";
    if (daysUntil <= 7) return "urgent";
    if (daysUntil <= 30) return "soon";
    return "normal";
  };

  if (loading) {
    return (
      <div className="reminders-page">
        <div className="loading-spinner">Loading reminders...</div>
      </div>
    );
  }

  return (
    <div className="reminders-page">
      <div className="reminders-header">
        <h1>Reminders</h1>
        <p>Stay on top of your important document deadlines</p>
      </div>

      <div className="reminders-actions">
        <button
          onClick={() => navigate("/documents")}
          className="btn btn-primary"
        >
          ▦ View All Documents
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {reminders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◻</div>
          <h2>No reminders yet</h2>
          <p>
            You don't have any reminders set up. Upload documents with expiry
            dates to get automatic reminders.
          </p>
          <button
            onClick={() => navigate("/upload")}
            className="btn btn-primary"
          >
            ↑ Upload Document
          </button>
        </div>
      ) : (
        <div className="reminders-grid">
          {reminders.map((reminder) => {
            const daysUntil = getDaysUntil(reminder.reminderDate);
            const urgencyClass = getUrgencyClass(daysUntil);

            return (
              <div
                key={reminder._id}
                className={`reminder-card ${urgencyClass}`}
                onClick={() =>
                  reminder.document?._id &&
                  navigate(`/documents/${reminder.document._id}`)
                }
              >
                <div className="reminder-status-indicator">
                  {reminder.read ? (
                    <span className="status-badge read">✓ Read</span>
                  ) : (
                    <span className="status-badge unread">● Unread</span>
                  )}
                </div>

                <div className="reminder-content">
                  <h3 className="reminder-doc-title">
                    ◻ {reminder.document?.title || "Unknown Document"}
                  </h3>

                  <div className="reminder-date-section">
                    <span className="reminder-date-label">Reminder Date:</span>
                    <span className="reminder-date-value">
                      {formatDate(reminder.reminderDate)}
                    </span>
                  </div>

                  <div className="reminder-countdown">
                    {daysUntil < 0 ? (
                      <span className="countdown-text overdue">
                        ⚠ {Math.abs(daysUntil)} days overdue
                      </span>
                    ) : daysUntil === 0 ? (
                      <span className="countdown-text today">⊕ Due today!</span>
                    ) : (
                      <span className={`countdown-text ${urgencyClass}`}>
                        ⏱ {daysUntil} {daysUntil === 1 ? "day" : "days"}{" "}
                        remaining
                      </span>
                    )}
                  </div>

                  {reminder.document?.category && (
                    <div className="reminder-category">
                      <span className="category-tag">
                        {reminder.document.category}
                      </span>
                    </div>
                  )}
                </div>

                <div className="reminder-action">
                  <button className="view-doc-btn">View Document →</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reminders;
